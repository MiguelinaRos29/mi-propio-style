from pydantic import BaseModel
from typing import List
from datetime import datetime
from enum import Enum


class EstadoOrden(str, Enum):
    pendiente = "pendiente"
    pagado = "pagado"
    enviado = "enviado"
    cancelado = "cancelado"


class OrdenItemCrear(BaseModel):
    producto_id: int
    talla_id: int
    cantidad: int


class OrdenItemRespuesta(BaseModel):
    id: int
    producto_id: int
    talla_id: int
    cantidad: int
    precio_unitario: float

    class Config:
        from_attributes = True


class OrdenCrear(BaseModel):
    items: List[OrdenItemCrear]


class OrdenRespuesta(BaseModel):
    id: int
    comprador_id: int
    estado: EstadoOrden
    total: float
    fecha_creacion: datetime
    items: List[OrdenItemRespuesta] = []

    class Config:
        from_attributes = True


class OrdenActualizarEstado(BaseModel):
    estado: EstadoOrden