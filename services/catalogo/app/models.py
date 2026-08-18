from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime
from sqlalchemy.sql import func
from .database import Base

class Producto(Base):
    __tablename__ = "productos"
     
    id = Column(Integer, primary_key=True, index=True)
    vendedor_id = Column(Integer, nullable=False)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text)
    precio = Column(Numeric(10, 2), nullable=False)
    precio_anterior = Column(Numeric(10, 2))
    categoria = Column(String(100))
    imagen_url = Column(Text)
    stock = Column(Integer, default=0)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    