# # import jwt
# # from django.conf import settings
# # from django.contrib.auth import get_user_model
# # from channels.middleware import BaseMiddleware
# # from channels.db import database_sync_to_async
# # from urllib.parse import parse_qs

# # User = get_user_model()

# # @database_sync_to_async
# # def get_user(user_id):
# #     try:
# #         return User.objects.get(id=user_id)
# #     except User.DoesNotExist:
# #         return None

# # class JwtAuthMiddleware(BaseMiddleware):
# #     async def __call__(self, scope, receive, send):
# #         query_string = scope.get("query_string", b"").decode()
# #         query_params = parse_qs(query_string)
# #         token = query_params.get("token")
# #         scope["user"] = None
# #         if token:
# #             token = token[0]
# #             try:
# #                 payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
# #                 user = await get_user(payload.get("user_id"))
# #                 scope["user"] = user if user else None
# #             except jwt.InvalidTokenError:
# #                 scope["user"] = None
# #         return await super().__call__(scope, receive, send)


# # import jwt
# # from django.conf import settings
# # from channels.middleware import BaseMiddleware
# # from channels.db import database_sync_to_async
# # from urllib.parse import parse_qs

# # @database_sync_to_async
# # def get_user(user_id):
# #     from django.contrib.auth import get_user_model  # deferred import here
# #     User = get_user_model()
# #     try:
# #         return User.objects.get(id=user_id)
# #     except User.DoesNotExist:
# #         return None

# # class JwtAuthMiddleware(BaseMiddleware):
# #     async def __call__(self, scope, receive, send):
# #         query_string = scope.get("query_string", b"").decode()
# #         query_params = parse_qs(query_string)
# #         token = query_params.get("token")
# #         scope["user"] = None
# #         if token:
# #             token = token[0]
# #             try:
# #                 payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
# #                 user = await get_user(payload.get("user_id"))
# #                 scope["user"] = user if user else None
# #             except jwt.InvalidTokenError:
# #                 scope["user"] = None
# #         return await super().__call__(scope, receive, send)



# import jwt
# from django.conf import settings
# from channels.middleware import BaseMiddleware
# from channels.db import database_sync_to_async
# from urllib.parse import parse_qs

# @database_sync_to_async
# def get_user(user_id):
#     from django.contrib.auth import get_user_model
#     User = get_user_model()
#     try:
#         return User.objects.get(id=user_id)
#     except User.DoesNotExist:
#         return None

# class JwtAuthMiddleware(BaseMiddleware):
#     async def __call__(self, scope, receive, send):
#         query_string = scope.get('query_string', b'').decode()
#         query_params = parse_qs(query_string)
#         token = query_params.get('token')
#         scope['user'] = None
#         if token:
#             token = token[0]
#             try:
#                 payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
#                 user = await get_user(payload.get("user_id"))
#                 scope['user'] = user if user else None
#                 print(f"JWT token received: {token}")
#                 print(f"Decoded payload: {payload}")
#                 print(f"Authenticated user: {user}")

#             except jwt.InvalidTokenError:
#                 scope['user'] = None
#         return await super().__call__(scope, receive, send)
