from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .database import engine, SessionLocal, Base

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/productos", response_model=List[schemas.ProductoRespuesta])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(models.Producto).all()

