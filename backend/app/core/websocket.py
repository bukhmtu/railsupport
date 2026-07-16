from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    """
    WebSocket orqali real-time xabarlar yuborish.
    Har bir foydalanuvchi ulanganida ro'yxatga olinadi.
    """

    def __init__(self):
        # { user_id: [WebSocket, ...] }  — bir user bir nechta tab ochishi mumkin
        self.active: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active.setdefault(user_id, []).append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active:
            self.active[user_id] = [
                ws for ws in self.active[user_id] if ws != websocket
            ]
            if not self.active[user_id]:
                del self.active[user_id]

    async def send_to_user(self, user_id: int, event: str, data: dict):
        """Bitta foydalanuvchiga xabar yuborish"""
        payload = json.dumps({"event": event, "data": data}, ensure_ascii=False)
        for ws in self.active.get(user_id, []):
            try:
                await ws.send_text(payload)
            except Exception:
                pass

    async def broadcast_to_roles(self, roles: list, event: str, data: dict, all_users_fn):
        """
        Berilgan rollardagi barcha online foydalanuvchilarga yuborish.
        all_users_fn: { user_id: role } dict qaytaruvchi funksiya
        """
        payload = json.dumps({"event": event, "data": data}, ensure_ascii=False)
        users = all_users_fn()
        for user_id, role in users.items():
            if role in roles and user_id in self.active:
                for ws in self.active[user_id]:
                    try:
                        await ws.send_text(payload)
                    except Exception:
                        pass

    async def broadcast_all(self, event: str, data: dict):
        """Barcha online foydalanuvchilarga yuborish"""
        payload = json.dumps({"event": event, "data": data}, ensure_ascii=False)
        for sockets in self.active.values():
            for ws in sockets:
                try:
                    await ws.send_text(payload)
                except Exception:
                    pass

    def online_count(self) -> int:
        return len(self.active)


manager = ConnectionManager()
