# backend/jam/urls.py
from django.urls import path
from .import views_playlists
from .views_playlists import (
     ListFriendshipPlaylists, AddTrackToPlaylist, PlaylistDetail,
    RemoveTrackFromPlaylist, SavePlaylistAsPersonal
)

urlpatterns = [
    path("playlists/create_shared/<int:friendship_id>/", views_playlists.create_shared_playlist, name="create_shared_playlist"),

    # path("playlists/by_friendship/<int:fid>/", ListFriendshipPlaylists.as_view()),
    path("playlists/by_friendship/<int:friendship_id>/", ListFriendshipPlaylists.as_view(), name="list_friendship_playlists"),
    path("playlists/<int:pid>/add_track/", AddTrackToPlaylist.as_view()),
    path("playlists/<int:pid>/tracks/<str:video_id>/", RemoveTrackFromPlaylist.as_view()),
    path("playlists/<int:pid>/save_as_personal/", SavePlaylistAsPersonal.as_view()),
    path("playlists/<int:pid>/", PlaylistDetail.as_view(), name="playlist_detail"),
]




# backend/jam/urls.py  (append these room routes)
from django.urls import path
from .views_rooms import (
    create_room, MyRooms, PublicRoomsSearch, join_by_code, RoomDetail,
    AddSuggestion, ApproveSuggestion, QueueOps, SaveRoomQueueAsPersonal,PromoteToEditor, KickMember,TransferHost

)

urlpatterns += [
    path("rooms/create/", create_room, name="create_room"),
    path("rooms/mine/", MyRooms.as_view(), name="my_rooms"),
    path("rooms/public/", PublicRoomsSearch.as_view(), name="public_rooms"),
    path("rooms/join/", join_by_code, name="join_by_code"),

    path("rooms/<int:room_id>/", RoomDetail.as_view(), name="room_detail"),
    path("rooms/<int:room_id>/suggestions/", AddSuggestion.as_view(), name="add_suggestion"),
    path("rooms/<int:room_id>/suggestions/<int:sid>/approve/", ApproveSuggestion.as_view(), name="approve_suggestion"),
    path("rooms/<int:room_id>/queue/", QueueOps.as_view(), name="queue_ops"),
    path("rooms/<int:room_id>/save_as_personal/", SaveRoomQueueAsPersonal.as_view(), name="save_room_as_personal"),
    path("rooms/<int:room_id>/members/<int:user_id>/promote/", PromoteToEditor.as_view(), name="promote_to_editor"),
    path("rooms/<int:room_id>/members/<int:user_id>/kick/", KickMember.as_view(), name="kick_member"),
    path("rooms/<int:room_id>/members/<int:user_id>/transfer_host/", TransferHost.as_view(), name="transfer_host"),
]
