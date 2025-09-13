# # # # chat/middleware.py
# # # import jwt
# # # from django.conf import settings
# # # from channels.db import database_sync_to_async
# # # from channels.middleware import BaseMiddleware

# # # # from channels.middleware.base import BaseMiddleware
# # # from django.contrib.auth import get_user_model
# # # from rest_framework_simplejwt.tokens import UntypedToken
# # # from jwt import InvalidTokenError

# # # User = get_user_model()

# # # @database_sync_to_async
# # # def get_user(validated_token):
# # #     try:
# # #         user_id = validated_token["user_id"]
# # #         return User.objects.get(id=user_id)
# # #     except User.DoesNotExist:
# # #         return None

# # # class JWTAuthMiddleware(BaseMiddleware):
# # #     async def __call__(self, scope, receive, send):
# # #         headers = dict(scope["headers"])
# # #         if b"authorization" in headers:
# # #             try:
# # #                 token_name, token = headers[b"authorization"].decode().split()
# # #                 if token_name.lower() == "bearer":
# # #                     validated_token = UntypedToken(token)
# # #                     scope["user"] = await get_user(validated_token.payload)
# # #             except (InvalidTokenError, jwt.ExpiredSignatureError):
# # #                 scope["user"] = None
# # #         return await super().__call__(scope, receive, send)


# # # chat/middleware.py
# # import jwt
# # from django.conf import settings
# # from channels.db import database_sync_to_async
# # from channels.middleware import BaseMiddleware
# # # from channels.middleware.base import BaseMiddleware
# # from django.contrib.auth import get_user_model

# # User = get_user_model()

# # @database_sync_to_async
# # def get_user(validated_token):
# #     try:
# #         user_id = validated_token["user_id"]
# #         return User.objects.get(id=user_id)
# #     except User.DoesNotExist:
# #         return None

# # class JWTAuthMiddleware(BaseMiddleware):
# #     async def __call__(self, scope, receive, send):
# #         headers = dict(scope["headers"])
# #         if b"authorization" in headers:
# #             try:
# #                 from rest_framework_simplejwt.tokens import UntypedToken  # 🔑 moved here (lazy import)

# #                 token_name, token = headers[b"authorization"].decode().split()
# #                 if token_name.lower() == "bearer":
# #                     validated_token = UntypedToken(token)
# #                     scope["user"] = await get_user(validated_token.payload)
# #             except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
# #                 scope["user"] = None
# #         return await super().__call__(scope, receive, send)


# # chat/middleware.py
# import jwt
# from django.conf import settings
# from channels.db import database_sync_to_async
# from channels.middleware import BaseMiddleware

# @database_sync_to_async
# def get_user(validated_token):
#     from django.contrib.auth import get_user_model   # ✅ moved inside function
#     User = get_user_model()
#     try:
#         user_id = validated_token["user_id"]
#         return User.objects.get(id=user_id)
#     except User.DoesNotExist:
#         return None

# class JWTAuthMiddleware(BaseMiddleware):
#     async def __call__(self, scope, receive, send):
#         headers = dict(scope["headers"])
#         if b"authorization" in headers:
#             try:
#                 from rest_framework_simplejwt.tokens import UntypedToken  # ✅ lazy import

#                 token_name, token = headers[b"authorization"].decode().split()
#                 if token_name.lower() == "bearer":
#                     validated_token = UntypedToken(token)
#                     scope["user"] = await get_user(validated_token.payload)
#             except (jwt.InvalidTokenError, jwt.ExpiredSignatureError):
#                 scope["user"] = None
#         return await super().__call__(scope, receive, send)

# chat/middleware.py
from urllib.parse import parse_qs


from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.db import close_old_connections



@database_sync_to_async
def get_user_from_token(token):
    from rest_framework_simplejwt.tokens import UntypedToken
    from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
    from django.contrib.auth import get_user_model
    import jwt
    from django.conf import settings
    User = get_user_model()

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        user_id = payload['user_id']
        user = User.objects.get(id=user_id)
        print(f"✅ JWT validated for user: {user.username} (ID: {user_id})")
        return user
    except (InvalidToken, TokenError, User.DoesNotExist, jwt.InvalidTokenError, Exception) as e:
        print(f"❌ JWT validation failed: {type(e).__name__}: {e}")
        return None
        # Validate token
    #     UntypedToken(token)
    #     from rest_framework_simplejwt.authentication import JWTAuthentication
    #     validated_token = JWTAuthentication().get_validated_token(token)
    #     user = JWTAuthentication().get_user(validated_token)
    #     return user
    # except (InvalidToken, TokenError, Exception):
    #     return None

class JWTAuthMiddleware(BaseMiddleware):
    """
    Custom middleware for JWT auth in Django Channels
    """
    async def __call__(self, scope, receive, send):
        # Parse token from query string
        query_string = scope.get("query_string", b"").decode()
        token = None
        if query_string:
            qs = parse_qs(query_string)
            token_list = qs.get("token")
            if token_list:
                token = token_list[0]

        scope["user"] = None
        if token:
            close_old_connections()
            user = await get_user_from_token(token)
            if user:
                scope["user"] = user

        return await super().__call__(scope, receive, send)

get_user = get_user_from_token



# # chat/middleware.py - Fixed version
# from urllib.parse import parse_qs
# from channels.middleware import BaseMiddleware
# from channels.db import database_sync_to_async
# from django.db import close_old_connections

# @database_sync_to_async
# def get_user_from_token(token):
#     from rest_framework_simplejwt.tokens import AccessToken  # Changed from UntypedToken
#     from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
#     from django.contrib.auth import get_user_model
#     User = get_user_model()

#     try:
#         # Use AccessToken directly to validate and get user_id
#         access_token = AccessToken(token)
#         user_id = access_token['user_id']
#         user = User.objects.get(id=user_id)
#         print(f"✅ JWT validated for user: {user.username} (ID: {user_id})")
#         return user
#     except (InvalidToken, TokenError, User.DoesNotExist, Exception) as e:
#         print(f"❌ JWT validation failed: {type(e).__name__}: {e}")
#         return None

# class JWTAuthMiddleware(BaseMiddleware):
#     async def call(self, scope, receive, send):
#         query_string = scope.get("query_string", b"").decode()
#         token = None
#         if query_string:
#             qs = parse_qs(query_string)
#             token_list = qs.get("token")
#             if token_list:
#                 token = token_list[0]
#                 print(f"🔍 Extracted token from query: {token[:20]}...")

#         scope["user"] = None
#         if token:
#             close_old_connections()
#             user = await get_user_from_token(token)
#             if user:
#                 scope["user"] = user
#             else:
#                 print("❌ Token validation failed")

#         return await super().call(scope, receive, send)

# get_user = get_user_from_token    