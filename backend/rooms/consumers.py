# backend/rooms/consumers.py
from channels.generic.websocket import AsyncJsonWebsocketConsumer

class RoomConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send_json({"message": "Connected to room WS"})

    async def disconnect(self, close_code):
        pass

    async def receive_json(self, content):
        await self.send_json({"echo": content})
