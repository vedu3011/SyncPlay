"""
ASGI config for core project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

# backend/core/asgi.py
# import os
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from django.core.asgi import get_asgi_application
# import chat.routing

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# django_asgi_app = get_asgi_application()

# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket": AuthMiddlewareStack(URLRouter(chat.routing.websocket_urlpatterns)),
# })


# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.security.websocket import AllowedHostsOriginValidator
# from django.core.asgi import get_asgi_application
# import chat.routing
# import os
# from users.middleware import JwtAuthMiddleware

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# django_asgi_app = get_asgi_application()

# application = ProtocolTypeRouter({
#     "http": django_asgi_app,
#     "websocket": AllowedHostsOriginValidator(
#         JwtAuthMiddleware(
#             URLRouter(chat.routing.websocket_urlpatterns)
#         )
#     ),
# })


# backend/asgi.py
# import os
# from django.core.asgi import get_asgi_application
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from chat.middleware import JWTAuthMiddleware
# import chat.routing

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# application = ProtocolTypeRouter({
#     "http": get_asgi_application(),
#     "websocket": JWTAuthMiddleware(
#         AuthMiddlewareStack(
#             URLRouter(chat.routing.websocket_urlpatterns)
#         )
#     ),
# })


# core/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from chat.middleware import JWTAuthMiddleware
import chat.routing
import jam.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": JWTAuthMiddleware(
        URLRouter(
            chat.routing.websocket_urlpatterns + jam.routing.websocket_urlpatterns
           
        )
    ),
})
