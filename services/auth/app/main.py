from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .auth import router as auth_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mi Propio Style - Auth Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://mi-propio-style.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
)

app.include_router(auth_router)