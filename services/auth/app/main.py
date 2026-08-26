from fastapi import FastAPI

from . import models
from .database import engine
from .auth import router as auth_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Mi Propio Style - Auth Service")

app.include_router(auth_router)