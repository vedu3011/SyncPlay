# # backend/chat/consumers.py
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# # from rest_framework_simplejwt.tokens import UntypedToken
# from jwt import InvalidTokenError
# from .middleware import get_user
# import json

# from urllib.parse import parse_qs

# # from django.contrib.auth.models import AnonymousUser
# # from social.models import Friendship
# # from .models import Message



# class ChatConsumer(AsyncWebsocketConsumer):
   
#     async def connect(self):
#         # user is already set by JWTAuthMiddleware
#         user = self.scope.get("user")

#         if not user or not user.is_authenticated:
#             await self.close(code=403)
#             return

#         self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
#         self.group_name = f"chat_{self.room_id}"

#         # Join group
#         await self.channel_layer.group_add(self.group_name, self.channel_name)
#         await self.accept()

#     async def disconnect(self, close_code):
#         await self.channel_layer.group_discard(self.group_name, self.channel_name)

#     async def receive(self, text_data):
#         payload = json.loads(text_data)
#         if payload.get("type") == "message":
#             ciphertext = payload.get("ciphertext")
#             user = self.scope["user"]

#             # Example save (replace with your DB model method)
#             msg = await self.save_message(user.id, self.room_id, ciphertext)

#             await self.channel_layer.group_send(
#                 self.group_name,
#                 {
#                     "type": "chat.message",
#                     "message": ciphertext,
#                     "user": str(user),
#                     "id": msg.id,
#                     "ciphertext": msg.ciphertext,
#                     "sender_id": msg.sender_id,
#                     "created_at": msg.created_at.isoformat(),
#                 },
#             )

#     async def chat_message(self, event):
#         await self.send(text_data=json.dumps(event))


    

#     @database_sync_to_async
#     def user_in_friendship(self, uid, fid):
#         from social.models import Friendship 
#         f = Friendship.objects.filter(id=fid).first()
#         return bool(f and (f.user_a_id == uid or f.user_b_id == uid))

#     @database_sync_to_async
#     def save_message(self, uid, fid, ciphertext):
#         from social.models import Friendship 
#         from .models import Message
#         # f = Friendship.objects.get(id=fid)
#         # msg = Message.objects.create(friendship=f, sender_id=uid, ciphertext=ciphertext)
#         # f.last_message_at = msg.created_at; f.save(update_fields=["last_message_at"])
#         # return msg
#         return Message.objects.create(
#             sender_id=uid, room_id=fid, ciphertext=ciphertext
#         )
#     # @database_sync_to_async
#     # def user_in_friendship(self, uid, fid):
#     #     from social.models import Friendship  # import here to delay
#     #     f = Friendship.objects.filter(id=fid).first()
#     #     return bool(f and (f.user_a_id == uid or f.user_b_id == uid))

#     # @database_sync_to_async
#     # def save_message(self, uid, fid, ciphertext):
#     #     from social.models import Friendship  # import here to delay
#     #     from .models import Message  # import here to delay
#     #     f = Friendship.objects.get(id=fid)
#     #     msg = Message.objects.create(friendship=f, sender_id=uid, ciphertext=ciphertext)
#     #     f.last_message_at = msg.created_at; f.save(update_fields=["last_message_at"])
#     #     return msg


# # backend/chat/consumers.py
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from jwt import InvalidTokenError
# from .middleware import get_user
# from urllib.parse import parse_qs


# class ChatConsumer(AsyncWebsocketConsumer):
   
#     async def connect(self):
#         # Initialize group_name to None first to prevent AttributeError
#         self.group_name = None
        
#         try:
#             # user is already set by JWTAuthMiddleware
#             user = self.scope.get("user")

#             if not user or not user.is_authenticated:
#                 print("❌ WebSocket connection rejected: User not authenticated")
#                 await self.close(code=403)
#                 return

#             self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
#             self.group_name = f"chat_{self.room_id}"

#             # Join group
#             await self.channel_layer.group_add(self.group_name, self.channel_name)
#             await self.accept()
#             print(f"✅ WebSocket connected: User {user} joined room {self.room_id}")
            
#         except Exception as e:
#             print(f"❌ WebSocket connection error: {e}")
#             await self.close(code=500)

#     async def disconnect(self, close_code):
#         try:
#             # Only try to leave group if group_name was set
#             if hasattr(self, 'group_name') and self.group_name:
#                 await self.channel_layer.group_discard(self.group_name, self.channel_name)
#                 print(f"✅ WebSocket disconnected: Left room {self.group_name}")
#             else:
#                 print("✅ WebSocket disconnected: No group to leave")
#         except Exception as e:
#             print(f"❌ Error during WebSocket disconnect: {e}")

#     async def receive(self, text_data):
#         payload = json.loads(text_data)
#         if payload.get("type") == "message":
#             ciphertext = payload.get("ciphertext")
#             user = self.scope["user"]

#             # Example save (replace with your DB model method)
#             msg = await self.save_message(user.id, self.room_id, ciphertext)

#             await self.channel_layer.group_send(
#                 self.group_name,
#                 {
#                     "type": "chat.message",
#                     "message": ciphertext,
#                     "user": str(user),
#                     "id": msg.id,
#                     "ciphertext": msg.ciphertext,
#                     "sender_id": msg.sender_id,
#                     "created_at": msg.created_at.isoformat(),
#                 },
#             )

#     async def chat_message(self, event):
#         await self.send(text_data=json.dumps(event))

#     @database_sync_to_async
#     def user_in_friendship(self, uid, fid):
#         from social.models import Friendship 
#         f = Friendship.objects.filter(id=fid).first()
#         return bool(f and (f.user_a_id == uid or f.user_b_id == uid))

#     @database_sync_to_async
#     def save_message(self, uid, fid, ciphertext):
#         from social.models import Friendship 
#         from .models import Message
#         return Message.objects.create(
#             sender_id=uid, room_id=fid, ciphertext=ciphertext
#         )

# backend/chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from jwt import InvalidTokenError
from .middleware import get_user
from urllib.parse import parse_qs


class ChatConsumer(AsyncWebsocketConsumer):
   
    async def connect(self):
        # Initialize group_name to None first to prevent AttributeError
        self.group_name = None
        
        try:
            # user is already set by JWTAuthMiddleware
            user = self.scope.get("user")

            if not user or not user.is_authenticated:
                print("❌ WebSocket connection rejected: User not authenticated")
                await self.close(code=403)
                return

            # Get the friendship ID from URL - your routing uses 'fid'
            self.room_id = self.scope["url_route"]["kwargs"]["fid"]
            self.group_name = f"chat_{self.room_id}"

            has_access = await self.user_in_friendship(user.id, self.room_id)
            if not has_access:
              print(f"❌ User {user.id} has no access to friendship {self.room_id}")
              await self.close(code=403)
              return
 
            # Join group
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
            print(f"✅ WebSocket connected: User {user} joined room {self.room_id}")
            
        except Exception as e:
            print(f"❌ WebSocket connection error: {e}")
            await self.close(code=500)

    async def disconnect(self, close_code):
        try:
            # Only try to leave group if group_name was set
            if hasattr(self, 'group_name') and self.group_name:
                await self.channel_layer.group_discard(self.group_name, self.channel_name)
                print(f"✅ WebSocket disconnected: Left room {self.group_name}")
            else:
                print("✅ WebSocket disconnected: No group to leave")
        except Exception as e:
            print(f"❌ Error during WebSocket disconnect: {e}")

    async def receive(self, text_data):
        payload = json.loads(text_data)
        if payload.get("type") == "ping":
        # Respond to heartbeat
         await self.send(text_data=json.dumps({"type": "pong", "timestamp": payload.get("timestamp")}))
         return
        if payload.get("type") == "message":
            ciphertext = payload.get("ciphertext")
            user = self.scope["user"]
        

        
            # Example save (replace with your DB model method)
            msg = await self.save_message(user.id, self.room_id, ciphertext)

            await self.channel_layer.group_send(
                self.group_name,
                {
                    "type": "chat.message",
                    "message": ciphertext,
                    "user": str(user),
                    "id": msg.id,
                    "ciphertext": msg.ciphertext,
                    "sender_id": msg.sender_id,
                    "created_at": msg.created_at.isoformat(),
                },
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def user_in_friendship(self, uid, fid):
        from social.models import Friendship 
        f = Friendship.objects.filter(id=fid).first()
        return bool(f and (f.user_a_id == uid or f.user_b_id == uid))

    @database_sync_to_async
    def save_message(self, uid, fid, ciphertext):
        from social.models import Friendship 
        from .models import Message
        from django.utils import timezone
        friendship = Friendship.objects.get(id=fid)
        friendship.last_message_at = timezone.now()
        friendship.save()
        return Message.objects.create(
            sender_id=uid, friendship_id=fid, ciphertext=ciphertext
        )
    

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get("user")
        if not user or not user.is_authenticated:
            await self.close(code=403)
            return

        self.user = user
        self.group_name = f"notifications_{user.id}"

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        print(f"✅ {user.username} connected to Notification WS")

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        """We can handle pings/acks if needed"""
        data = json.loads(text_data)
        if data.get("type") == "ping":
            await self.send(json.dumps({"type": "pong"}))

    # Handler for events pushed via channel_layer
    async def notify(self, event):
        await self.send(text_data=json.dumps(event))    