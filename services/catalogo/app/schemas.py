from pydantic import BaseModel
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
    vendedor_id: int


class ProductoRespuesta(ProductoBase):
    id: int
    vendedor_id: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True