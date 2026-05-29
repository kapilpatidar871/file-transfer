import random
import string
import time
from typing import Dict, Optional
from fastapi import WebSocket

ROOM_TTL = 600  # 10 minutes


class Room:
    def __init__(self, code: str):
        self.code = code
        self.sender: Optional[WebSocket] = None
        self.receiver: Optional[WebSocket] = None
        self.created_at = time.time()

    def is_expired(self) -> bool:
        return time.time() - self.created_at > ROOM_TTL

    def is_full(self) -> bool:
        return self.sender is not None and self.receiver is not None


class RoomManager:
    def __init__(self):
        self._rooms: Dict[str, Room] = {}

    def _generate_code(self) -> str:
        while True:
            code = "".join(random.choices(string.digits, k=6))
            if code not in self._rooms:
                return code

    def create(self) -> Room:
        self._cleanup()
        code = self._generate_code()
        room = Room(code)
        self._rooms[code] = room
        return room

    def get(self, code: str) -> Optional[Room]:
        room = self._rooms.get(code)
        if room and room.is_expired():
            self.delete(code)
            return None
        return room

    def delete(self, code: str):
        self._rooms.pop(code, None)

    def _cleanup(self):
        expired = [c for c, r in self._rooms.items() if r.is_expired()]
        for c in expired:
            del self._rooms[c]


rooms = RoomManager()
