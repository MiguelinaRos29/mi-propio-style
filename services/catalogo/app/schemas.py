from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    precio_anterior: Optional[float] = None
    categoria: Optional[str] = None
    imagen_url: Optional[str] = None
    stock: int = 0


class ProductoCrear(ProductoBase):
    pass


class ProductoRespuesta(ProductoBase):
    id: int
    vendedor_id: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class TallaBase(BaseModel):
    talla: str
    stock_talla: int = 0


class TallaCrear(TallaBase):
    producto_id: int


class TallaRespuesta(TallaBase):
    id: int
    producto_id: int

    class Config:
        from_attributes = True


class WishlistBase(BaseModel):
    pass


class WishlistCrear(WishlistBase):
    producto_id: int


class WishlistRespuesta(WishlistBase):
    id: int
    usuario_id: int
    producto_id: int
    fecha_agregado: datetime
    notificado: bool = False

    class Config:
        from_attributes = True


class ResenaBase(BaseModel):
    calificacion: int = Field(ge=1, le=5)
    comentario: Optional[str] = None


class ResenaCrear(ResenaBase):
    producto_id: int


class ResenaRespuesta(ResenaBase):
    id: int
    producto_id: int
    usuario_id: int
    fecha: datetime

    class Config:
        from_attributes = True
