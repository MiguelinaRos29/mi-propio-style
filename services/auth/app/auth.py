from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import models, schemas, security
from .database import get_db

router = APIRouter()


@router.post("/register", response_model=schemas.UserResponse)
def registrar_usuario(datos: schemas.UserCreate, db: Session = Depends(get_db)):
    usuario_existente = db.query(models.User).filter(models.User.email == datos.email).first()
    if usuario_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ese email ya está registrado")

    nuevo_usuario = models.User(
        email=datos.email,
        hashed_password=security.hashear_password(datos.password),
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = db.query(models.User).filter(models.User.email == form_data.username).first()

    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Email o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not usuario:
        raise credenciales_invalidas
    if not security.verificar_password(form_data.password, usuario.hashed_password):
        raise credenciales_invalidas

    access_token = security.crear_access_token(usuario_id=usuario.id, rol=usuario.role)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserResponse)
def leer_usuario_actual(usuario_actual: models.User = Depends(security.obtener_usuario_actual)):
    return usuario_actual