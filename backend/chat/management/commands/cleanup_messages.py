# backend/chat/management/commands/cleanup_messages.py
from django.core.management.base import BaseCommand
from django.utils import timezone
from chat.models import Message

class Command(BaseCommand):
    help = "Delete expired messages"

    def handle(self, *args, **kwargs):
        n = Message.objects.filter(expires_at__lt=timezone.now()).delete()
        self.stdout.write(f"Deleted {n[0]} expired messages")
