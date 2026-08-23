from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import os
import requests
from dotenv import load_dotenv
from . import models, schemas
from .auth import UsuarioActual, obtener_usuario_actual, requerir_rol
from .database import engine, SessionLocal, Base

load_dotenv()
CATALOGO_URL = os.getenv("CATALOGO_URL", "http://127.0.0.1:8000")

Base.metadata.create_all(bind=engine)

app = FastAPI()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/ordenes", response_model=List[schemas.OrdenRespuesta])
def listar_ordenes(
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(requerir_rol("admin")),
):
    return db.query(models.Orden).all()


@app.get("/ordenes/{orden_id}", response_model=schemas.OrdenRespuesta)
def obtener_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    orden = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    if usuario.rol != "admin" and orden.comprador_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta orden")
    return orden


@app.post("/ordenes", response_model=schemas.OrdenRespuesta, status_code=status.HTTP_201_CREATED)
def crear_orden(
    orden: schemas.OrdenCrear,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    if not orden.items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La orden necesita al menos un producto")

    items_validados = []
    total = 0

    for item in orden.items:
        # 1. Confirmar que el producto existe en Catálogo y tomar su precio ACTUAL
        #    (nunca confiamos en un precio que mande el cliente)
        resp_producto = requests.get(f"{CATALOGO_URL}/productos/{item.producto_id}")
        if resp_producto.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Producto {item.producto_id} no encontrado en catálogo",
            )
        producto = resp_producto.json()

        # 2. Confirmar que la talla existe y que hay stock suficiente
        resp_talla = requests.get(f"{CATALOGO_URL}/tallas/{item.talla_id}")
        if resp_talla.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Talla {item.talla_id} no encontrada en catálogo",
            )
        talla = resp_talla.json()

        if talla["stock_talla"] < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para la talla {talla['talla']} del producto {item.producto_id}",
            )

        precio_unitario = float(producto["precio"])
        total += precio_unitario * item.cantidad

        items_validados.append(models.OrdenItem(
            producto_id=item.producto_id,
            talla_id=item.talla_id,
            cantidad=item.cantidad,
            precio_unitario=precio_unitario,
        ))

    nueva_orden = models.Orden(
        comprador_id=usuario.id,
        estado="pendiente",
        total=total,
    )
    nueva_orden.items = items_validados

    db.add(nueva_orden)
    db.commit()
    db.refresh(nueva_orden)
    return nueva_orden


@app.put("/ordenes/{orden_id}/estado", response_model=schemas.OrdenRespuesta)
def actualizar_estado_orden(
    orden_id: int,
    datos: schemas.OrdenActualizarEstado,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(requerir_rol("vendedor", "admin")),
):
    orden = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    orden.estado = datos.estado.value
    db.commit()
    db.refresh(orden)
    return orden


@app.delete("/ordenes/{orden_id}")
def eliminar_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    orden = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    if usuario.rol != "admin" and orden.comprador_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta orden")
    db.delete(orden)
    db.commit()
    return {"mensaje": f"Orden {orden_id} eliminada"}