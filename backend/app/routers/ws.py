from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from ..core.websocket import manager
from ..core.security import decode_token
from ..core.database import SessionLocal
from ..models.user import User

router = APIRouter(tags=["WebSocket"])


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
):
    """
    Real-time ulanish.
    Ishlatish: ws://localhost:8000/ws?token=<JWT>

    Eventlar (serverdan clientga):
      ticket:new      — yangi ticket yaratildi
      ticket:updated  — ticket status/assign o'zgardi
      ticket:assigned — bu texnikka ticket biriktirildi
    """
    # Token tekshirish
    try:
        payload = decode_token(token)
        user_id = int(payload.get("sub", 0))
    except Exception:
        await websocket.close(code=4001)
        return

    # DB dan user olish
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            await websocket.close(code=4001)
            return
    finally:
        db.close()

    await manager.connect(websocket, user_id)
    try:
        # Ulangan deb ping yuboramiz
        import json
        await websocket.send_text(json.dumps({
            "event": "connected",
            "data": {"user_id": user_id, "online": manager.online_count()}
        }))

        # Clientdan xabar kelishini kutamiz (ping-pong uchun)
        while True:
            msg = await websocket.receive_text()
            if msg == "ping":
                await websocket.send_text('{"event":"pong"}')

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
