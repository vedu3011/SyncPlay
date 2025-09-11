# backend/jam/consumers.py
import json, time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from django.db import models

class JamConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=403)
            return

        self.friendship_id = self.scope["url_route"]["kwargs"].get("room_id") or self.scope["url_route"]["kwargs"].get("fid")
        self.group_name = f"jam_{self.friendship_id}"
        # verify membership
        allowed = await self.user_can_access(self.friendship_id, user.id)
        if not allowed:
            await self.close(code=403); return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        # send current state
        state = await self.get_jam_state(self.friendship_id)
        if state:
            await self.send(text_data=json.dumps({"type":"jam_state", **state}))
        # notify others
        await self.channel_layer.group_send(self.group_name, {
            "type":"user_joined",
            "user": user.username,
            "user_id": user.id,
            "timestamp": int(time.time() * 1000)
        })

    async def disconnect(self, code):
        try:
            await self.channel_layer.group_send(self.group_name, {
                "type":"user_left",
                "user": self.scope["user"].username,
                "user_id": self.scope["user"].id,
                "timestamp": int(time.time() * 1000)
            })
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        except Exception:
            pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except Exception:
            return
        t = data.get("type")
        data['server_timestamp'] = int(time.time() * 1000)
        data['sender'] = self.scope["user"].username
        data['sender_id'] = self.scope["user"].id

        if t in ("play", "pause", "seek", "skip"):
            await self.handle_control(t, data)
        elif t == "add_to_queue":
            await self.handle_add_to_queue(data)
        elif t == "remove_from_queue":
            await self.handle_remove_from_queue(data)
        elif t == "ping":
            await self.send(json.dumps({"type":"pong", "timestamp": data.get("timestamp")}))
        # other message types allowed

    async def handle_control(self, action, data):
        # update jam state
        await self.update_state(self.friendship_id, {
            "current_track_id": data.get("track_id"),
            "current_track_title": data.get("track_title"),
            "current_track_artist": data.get("track_artist"),
            "current_position": data.get("position", 0),
            "is_playing": action == "play",
            "last_sync_timestamp": data['server_timestamp']
        })
        # broadcast
        await self.channel_layer.group_send(self.group_name, {
            "type":"jam_control",
            "action": action,
            "track_id": data.get("track_id"),
            "track_title": data.get("track_title"),
            "track_artist": data.get("track_artist"),
            "position": data.get("position", 0),
            "sender": data['sender'],
            "server_timestamp": data['server_timestamp']
        })

    async def handle_add_to_queue(self, data):
        await self.add_queue_item(self.friendship_id, data)
        await self.channel_layer.group_send(self.group_name, {
            "type":"queue_updated",
            "action":"track_added",
            "track": data,
            "added_by": data['sender'],
            "server_timestamp": data['server_timestamp']
        })

    async def handle_remove_from_queue(self, data):
        await self.remove_queue_item(self.friendship_id, data.get("video_id"))
        await self.channel_layer.group_send(self.group_name, {
            "type":"queue_updated",
            "action":"track_removed",
            "video_id": data.get("video_id"),
            "server_timestamp": data['server_timestamp']
        })

    # channel layer event handlers
    async def jam_control(self, event):
        await self.send(text_data=json.dumps(event))

    async def queue_updated(self, event):
        await self.send(text_data=json.dumps(event))

    async def user_joined(self, event):
        await self.send(text_data=json.dumps({"type":"user_joined", **event}))

    async def user_left(self, event):
        await self.send(text_data=json.dumps({"type":"user_left", **event}))

    # DB helpers (sync wrappers)
    @database_sync_to_async
    def user_can_access(self, friendship_id, user_id):
        from social.models import Friendship
        f = Friendship.objects.filter(id=friendship_id).first()
        return bool(f and (f.user_a_id == user_id or f.user_b_id == user_id))

    @database_sync_to_async
    def get_jam_state(self, friendship_id):
        from .models import JamSession
        s = JamSession.objects.filter(friendship_id=friendship_id, is_active=True).first()
        if not s:
            return None
        return {
            "current_track_id": s.current_track_id,
            "current_track_title": s.current_track_title,
            "current_track_artist": s.current_track_artist,
            "current_position": s.current_position,
            "is_playing": s.is_playing,
            "last_sync_timestamp": s.last_sync_timestamp,
            "queue": [
                {
                    "video_id": q.video_id,
                    "title": q.title,
                    "artist_name": q.artist_name,
                    "thumbnail_url": q.thumbnail_url,
                    "duration_sec": q.duration_sec,
                    "position": q.position,
                    "added_by": getattr(q.added_by, 'username', None)
                } for q in s.queue.all()
            ]
        }

    @database_sync_to_async
    def update_state(self, friendship_id, payload):
        from .models import JamSession
        s, created = JamSession.objects.get_or_create(friendship_id=friendship_id, defaults={"host_id": self.scope["user"].id, "is_active": True})
        # update fields if present
        if "current_track_id" in payload:
            s.current_track_id = payload["current_track_id"]
        if "current_track_title" in payload:
            s.current_track_title = payload["current_track_title"]
        if "current_track_artist" in payload:
            s.current_track_artist = payload["current_track_artist"]
        if "current_position" in payload:
            s.current_position = payload["current_position"]
        if "is_playing" in payload:
            s.is_playing = payload["is_playing"]
        if "last_sync_timestamp" in payload:
            s.last_sync_timestamp = payload["last_sync_timestamp"]
        s.last_activity = timezone.now()
        s.save()

    @database_sync_to_async
    def add_queue_item(self, friendship_id, data):
        from .models import JamSession, JamQueueItem
        s, created = JamSession.objects.get_or_create(friendship_id=friendship_id, defaults={"host_id": self.scope["user"].id, "is_active": True})
        last_pos = s.queue.aggregate(models.Max('position'))['position__max'] or 0
        JamQueueItem.objects.get_or_create(
            jam_session=s,
            video_id=data.get("video_id"),
            defaults={
                "title": data.get("title",""),
                "artist_name": data.get("artist_name",""),
                "thumbnail_url": data.get("thumbnail_url",""),
                "duration_sec": data.get("duration_sec",0),
                "position": last_pos + 1,
                "added_by_id": self.scope["user"].id
            }
        )

    @database_sync_to_async
    def remove_queue_item(self, friendship_id, video_id):
        from .models import JamSession, JamQueueItem
        s = JamSession.objects.filter(friendship_id=friendship_id, is_active=True).first()
        if not s: return
        JamQueueItem.objects.filter(jam_session=s, video_id=video_id).delete()
