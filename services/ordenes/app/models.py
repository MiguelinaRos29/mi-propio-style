from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Orden(Base):
    __tablename__ = "ordenes"

    id = Column(Integer, primary_key=True, index=True)
    comprador_id = Column(Integer, nullable=False)  # ref. lógica — usuarios vive en el servicio de auth
    estado = Column(String(20), nullable=False, default="pendiente")
    total = Column(Numeric(10, 2), nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    items = relationship("OrdenItem", back_populates="orden", cascade="all, delete-orphan")


class OrdenItem(Base):
    __tablename__ = "orden_items"

    id = Column(Integer, primary_key=True, index=True)
    orden_id = Column(Integer, ForeignKey("ordenes.id"), nullable=False)  # FK real, mismo servicio
    producto_id = Column(Integer, nullable=False)  # ref. lógica — productos vive en el servicio de catálogo
    talla_id = Column(Integer, nullable=False)      # ref. lógica — tallas vive en el servicio de catálogo
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)

    orden = relationship("Orden", back_populates="items")