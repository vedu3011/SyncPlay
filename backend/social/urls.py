# backend/social/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path("users/search/", views.SearchUsersView.as_view()),
    path("requests/", views.ListRequestsView.as_view()),
    path("requests/send/", views.SendFriendRequestView.as_view()),
    path("requests/<int:pk>/respond/", views.RespondRequestView.as_view()),
    path("friends/", views.ListFriendsView.as_view()),
    path("friends/<int:pk>/favorite/", views.ToggleFavoriteView.as_view()),
    path("friends/<int:pk>/secret/", views.GetFriendshipSecretView.as_view()),
    path("debug/token/", views.DebugTokenView.as_view()),
]
