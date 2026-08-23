from pydantic import BaseModel, EmailStr
from datetime import datetime
from enum import Enum


class RolUsuario(str, Enum):
    comprador = "comprador"
    vendedor = "vendedor"
    admin = "admin"


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr


class UsuarioCrear(UsuarioBase):
    password: str
    rol: RolUsuario = RolUsuario.comprador


class UsuarioRespuesta(UsuarioBase):
    id: int
    rol: RolUsuario
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
