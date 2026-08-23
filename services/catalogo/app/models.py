from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey, Boolean
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
    fecha_creacion = Column(DateTime(timezone=True),
server_default=func.now())                            
    
class Talla(Base):
    __tablename__ = "tallas"
        
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer,
ForeignKey("productos.id"), nullable=False)
    talla = Column(String(10), nullable=False)
    stock_talla = Column(Integer, default=0)  
    
class Wishlist(Base):
    __tablename__ = "wishlist"                         
    
    id = Column(Integer, primary_key=True, index=True)                      
    usuario_id = Column(Integer, nullable=False) 
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    fecha_agregado = Column(DateTime(timezone=True), server_default=func.now())
    notificado = Column(Boolean, default=False)                    
    
class Resena(Base):    
    __tablename__ = "resenas"
    id = Column(Integer, primary_key=True, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False)
    usuario_id = Column(Integer, nullable=False)
    calificacion = Column(Integer, nullable=False)
    comentario = Column(Text)
    fecha = Column(DateTime(timezone=True), server_default=func.now())