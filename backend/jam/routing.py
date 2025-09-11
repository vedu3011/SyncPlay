# # backend/jam/routing.py
# from django.urls import re_path
# from .consumers import JamConsumer

# websocket_urlpatterns = [
#     re_path(r"ws/jam/(?P<room_id>\d+)/$", JamConsumer.as_asgi()),
# ]


# # backend/jam/routing.py
# from django.urls import re_path
# from .consumers_room import RoomConsumer

# websocket_urlpatterns = [
#     re_path(r"ws/rooms/(?P<room_id>\d+)/$", RoomConsumer.as_asgi()),
# ]


from django.urls import re_path
from .consumers import JamConsumer
from .consumers_room import RoomConsumer

websocket_urlpatterns = [
    re_path(r"ws/jam/(?P<room_id>\d+)/$", JamConsumer.as_asgi()),
    re_path(r"ws/rooms/(?P<room_id>\d+)/$", RoomConsumer.as_asgi()),
]
