from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from rooms import rooms
import json
import os

app = FastAPI(title="FileShare")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── REST ──────────────────────────────────────────────────────────────────────

@app.post("/api/room/create")
async def create_room():
    room = rooms.create()
    return {"code": room.code}


@app.get("/api/room/{code}/status")
async def room_status(code: str):
    room = rooms.get(code)
    if not room:
        return JSONResponse({"exists": False}, status_code=404)
    return {
        "exists": True,
        "has_sender": room.sender is not None,
        "has_receiver": room.receiver is not None,
    }


# ── WebSocket signaling ───────────────────────────────────────────────────────

@app.websocket("/ws/{code}/{role}")
async def signaling(ws: WebSocket, code: str, role: str):
    """
    role = 'sender' | 'receiver'
    Message types (JSON):
      client → server: offer | answer | ice | ready | cancel
      server → client: peer_joined | peer_left | offer | answer | ice | error
    """
    await ws.accept()

    room = rooms.get(code)
    if not room:
        await ws.send_json({"type": "error", "message": "Room not found or expired"})
        await ws.close()
        return

    if role == "sender":
        if room.sender is not None:
            await ws.send_json({"type": "error", "message": "Sender slot already taken"})
            await ws.close()
            return
        room.sender = ws
    elif role == "receiver":
        if room.receiver is not None:
            await ws.send_json({"type": "error", "message": "Receiver slot already taken"})
            await ws.close()
            return
        room.receiver = ws
        # Notify sender that receiver joined
        if room.sender:
            await room.sender.send_json({"type": "peer_joined"})
    else:
        await ws.send_json({"type": "error", "message": "Invalid role"})
        await ws.close()
        return

    other = lambda: room.receiver if role == "sender" else room.sender

    try:
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)
            peer = other()

            # Forward signaling messages to the other peer
            if msg["type"] in ("offer", "answer", "ice"):
                if peer:
                    await peer.send_json(msg)
            elif msg["type"] == "ready":
                if peer:
                    await peer.send_json({"type": "ready"})
            elif msg["type"] == "cancel":
                if peer:
                    await peer.send_json({"type": "cancelled"})
                rooms.delete(code)
                break

    except WebSocketDisconnect:
        peer = other()
        if peer:
            try:
                await peer.send_json({"type": "peer_left"})
            except Exception:
                pass
    finally:
        if role == "sender":
            room.sender = None
        else:
            room.receiver = None
        # Clean up room if both gone
        if room.sender is None and room.receiver is None:
            rooms.delete(code)


# ── Serve React build ─────────────────────────────────────────────────────────

STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index = os.path.join(STATIC_DIR, "index.html")
        return FileResponse(index)
else:
    @app.get("/")
    async def dev_root():
        return {"status": "backend running", "frontend": "run `npm run dev` in /frontend"}


if __name__ == "__main__":
    import uvicorn, os
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
