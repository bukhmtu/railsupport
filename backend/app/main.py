from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .core.config import settings
from .core.database import engine, Base
from . import models  # noqa: F401 — modellarni import qilish jadval yaratish uchun
from .routers import auth, tickets, users, stats, ws

# ─── App ─────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="RailSupport API",
    description="Temir yo'l IT yordam tizimi backend",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── DB jadvallarini yaratish ────────────────────────────────────────────────

Base.metadata.create_all(bind=engine)

# ─── Uploads papkasini statik fayl sifatida serve qilish ─────────────────────

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# ─── Routerlar ───────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(tickets.router)
app.include_router(users.router)
app.include_router(stats.router)
app.include_router(ws.router)


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "RailSupport API v1.0"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
