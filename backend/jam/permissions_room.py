# backend/jam/permissions_room.py
from rest_framework.response import Response
from rest_framework import status

def require_member(room, user):
    mem = room.memberships.filter(user=user).first()
    return mem

def require_editor_or_host(room, user):
    mem = require_member(room, user)
    if not mem:
        return None
    if mem.role in ("host", "editor"):
        return mem
    return None

def require_host(room, user):
    mem = require_member(room, user)
    if mem and mem.role == "host":
        return mem
    return None
