# users/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, LoginView
from .views import PreferencesView

urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/",LoginView.as_view() ,name='custom_login'),
    path("auth/refresh/", TokenRefreshView.as_view(),name='token_refresh'),
    path("me/preferences/", PreferencesView.as_view(), name="user-preferences"),
]
