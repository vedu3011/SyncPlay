# # backend/jam/consumers_room.py
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from django.contrib.auth import get_user_model

# from .permissions_room import require_editor_or_host, require_member



# @database_sync_to_async
# def get_user_from_token(token):
#     from rest_framework_simplejwt.tokens import AccessToken
#     User = get_user_model()
#     try:
#         at = AccessToken(token)
#         return User.objects.get(id=at['user_id'])
#     except Exception:
#         return None

# @database_sync_to_async
# def can_control(room_id, user):
#     from .models import Room
#     try:
#         room = Room.objects.get(id=room_id)
#         return require_editor_or_host(room, user) is not None
#     except Room.DoesNotExist:
#         return False

# @database_sync_to_async
# def is_member(room_id, user):
#     from .models import Room
#     try:
#         room = Room.objects.get(id=room_id)
#         return require_member(room, user) is not None
#     except Room.DoesNotExist:
#         return False

# class RoomConsumer(AsyncWebsocketConsumer):
#     async def connect(self):
#         from rest_framework_simplejwt.tokens import AccessToken
#         self.room_id = int(self.scope['url_route']['kwargs']['room_id'])
#         token = self.scope['query_string'].decode().replace("token=", "")
#         self.user = await get_user_from_token(token)
#         if not self.user or not await is_member(self.room_id, self.user):
#             await self.close()
#             return
#         self.group_name = f"room_{self.room_id}"
#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     async def receive(self, text_data=None, bytes_data=None):
#         data = json.loads(text_data)
#         action = data.get("type")

#         # host/editor controls: play/pause/seek/skip
#         if action in ("play", "pause", "seek", "skip"):
#             if not await can_control(self.room_id, self.user):
#                 return
#             await self.channel_layer.group_send(
#                 self.group_name,
#                 {"type": "broadcast", "payload": {**data, "user_id": self.user.id, "server_timestamp": self._now_ms()}}
#             )
#         elif action in ("add_to_queue", "queue_updated"):
#             # optional: could restrict to editor/host
#             await self.channel_layer.group_send(
#                 self.group_name,
#                 {"type": "broadcast", "payload": {**data, "user_id": self.user.id}}
#             )
#         else:
#             # general messages if needed
#             pass

#     async def broadcast(self, event):
#         await self.send(text_data=json.dumps(event["payload"]))

#     def _now_ms(self):
#         import time
#         return int(time.time() * 1000)



# backend/jam/consumers_room.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

from .permissions_room import require_editor_or_host, require_member

@database_sync_to_async
def get_user_from_token(token):
    from rest_framework_simplejwt.tokens import AccessToken
    User = get_user_model()
    try:
        at = AccessToken(token)
        return User.objects.get(id=at['user_id'])
    except Exception:
        return None

@database_sync_to_async
def can_control(room_id, user):
    from .models import Room
    try:
        room = Room.objects.get(id=room_id)
        return require_editor_or_host(room, user) is not None
    except Room.DoesNotExist:
        return False

@database_sync_to_async
def is_member(room_id, user):
    from .models import Room
    try:
        room = Room.objects.get(id=room_id)
        return require_member(room, user) is not None
    except Room.DoesNotExist:
        return False

@database_sync_to_async
def get_user_info(user_id):
    """Get user info for chat messages"""
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        return {
            'id': user.id,
            'username': user.username
        }
    except User.DoesNotExist:
        return None

class RoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from rest_framework_simplejwt.tokens import AccessToken
        self.room_id = int(self.scope['url_route']['kwargs']['room_id'])
        token = self.scope['query_string'].decode().replace("token=", "")
        self.user = await get_user_from_token(token)
        if not self.user or not await is_member(self.room_id, self.user):
            await self.close()
            return
        self.group_name = f"room_{self.room_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        action = data.get("type")

        # host/editor controls: play/pause/seek/skip
        if action in ("play", "pause", "seek", "skip"):
            if not await can_control(self.room_id, self.user):
                return
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "broadcast", "payload": {**data, "user_id": self.user.id, "server_timestamp": self._now_ms()}}
            )
        
        # Chat messages - any member can send
        elif action == "room_chat":
            message_content = data.get("message", "").strip()
            if not message_content:
                return
            
            # Create chat message payload
            chat_payload = {
                "type": "room_chat",
                "id": self._generate_message_id(),
                "message": message_content,
                "sender_id": self.user.id,
                "sender_username": self.user.username,
                "room_id": self.room_id,
                "created_at": self._now_iso()
            }
            
            # Broadcast to all room members
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "chat_message", "payload": chat_payload}
            )
        
        elif action in ("add_to_queue", "queue_updated"):
            # optional: could restrict to editor/host
            await self.channel_layer.group_send(
                self.group_name,
                {"type": "broadcast", "payload": {**data, "user_id": self.user.id}}
            )
        else:
            # general messages if needed
            pass

    async def broadcast(self, event):
        """Handle jam control messages"""
        await self.send(text_data=json.dumps(event["payload"]))
    
    async def chat_message(self, event):
        """Handle chat messages"""
        await self.send(text_data=json.dumps(event["payload"]))

    def _now_ms(self):
        import time
        return int(time.time() * 1000)
    
    def _now_iso(self):
        from datetime import datetime
        return datetime.now().isoformat()
    
    def _generate_message_id(self):
        import time
        import random
        return f"{int(time.time() * 1000)}{random.randint(100, 999)}"