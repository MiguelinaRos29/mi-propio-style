from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas
from .auth import UsuarioActual, obtener_usuario_actual, requerir_rol
from .database import engine, SessionLocal, Base, get_db

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Productos ----------

@app.get("/productos", response_model=List[schemas.ProductoRespuesta])
def listar_productos(
    categoria: Optional[str] = None,
    talla: Optional[str] = None,
    precio_min: Optional[float] = None,
    precio_max: Optional[float] = None,
    buscar: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(models.Producto)

    if categoria:
        query = query.filter(models.Producto.categoria == categoria)
    if precio_min is not None:
        query = query.filter(models.Producto.precio >= precio_min)
    if precio_max is not None:
        query = query.filter(models.Producto.precio <= precio_max)
    if buscar:
        query = query.filter(models.Producto.nombre.ilike(f"%{buscar}%"))
    if talla:
        query = query.join(models.Talla).filter(models.Talla.talla == talla)

    return query.offset(skip).limit(limit).all()


@app.get("/productos/{producto_id}", response_model=schemas.ProductoRespuesta)
def obtener_producto(producto_id: int, db: Session = Depends(get_db)):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    return producto


@app.post("/productos", response_model=schemas.ProductoRespuesta, status_code=status.HTTP_201_CREATED)
def crear_producto(
    producto: schemas.ProductoCrear,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(requerir_rol("vendedor", "admin")),
):
    nuevo_producto = models.Producto(**producto.dict(), vendedor_id=usuario.id)
    db.add(nuevo_producto)
    db.commit()
    db.refresh(nuevo_producto)
    return nuevo_producto


def _verificar_propietario_producto(producto: models.Producto, usuario: UsuarioActual):
    if usuario.rol != "admin" and producto.vendedor_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre este producto")


@app.put("/productos/{producto_id}", response_model=schemas.ProductoRespuesta)
def actualizar_producto(
    producto_id: int,
    datos: schemas.ProductoBase,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    _verificar_propietario_producto(producto, usuario)
    for campo, valor in datos.dict().items():
        setattr(producto, campo, valor)
    db.commit()
    db.refresh(producto)
    return producto


@app.delete("/productos/{producto_id}")
def eliminar_producto(
    producto_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    producto = db.query(models.Producto).filter(models.Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    _verificar_propietario_producto(producto, usuario)
    db.delete(producto)
    db.commit()
    return {"mensaje": f"Producto {producto_id} eliminado"}