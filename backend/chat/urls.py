# backend/chat/urls.py
from django.urls import path
from .views import HistoryView

urlpatterns = [
    path("history/<int:fid>/", HistoryView.as_view()),
    
]
