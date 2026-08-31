from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import os
import requests
from dotenv import load_dotenv
from . import models, schemas
from .auth import UsuarioActual, obtener_usuario_actual, requerir_rol
from .database import engine, SessionLocal, Base, get_db
from .pagos import procesar_pago_simulado

load_dotenv()
CATALOGO_URL = os.getenv("CATALOGO_URL", "http://127.0.0.1:8000")
SERVICE_KEY = os.getenv("SERVICE_KEY")

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


def _verificar_propietario_orden(orden: models.Orden, usuario: UsuarioActual):
    if usuario.rol != "admin" and orden.comprador_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta orden")


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
    _verificar_propietario_orden(orden, usuario)
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
        try:
            resp_producto = requests.get(f"{CATALOGO_URL}/productos/{item.producto_id}", timeout=5)
        except requests.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo conectar con el servicio de catálogo")
        if resp_producto.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Producto {item.producto_id} no encontrado en catálogo")
        producto = resp_producto.json()

        try:
            resp_talla = requests.get(f"{CATALOGO_URL}/tallas/{item.talla_id}", timeout=5)
        except requests.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo conectar con el servicio de catálogo")
        if resp_talla.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Talla {item.talla_id} no encontrada en catálogo")
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


@app.post("/ordenes/{orden_id}/pagar", response_model=schemas.OrdenRespuesta)
def pagar_orden(
    orden_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    orden = db.query(models.Orden).filter(models.Orden.id == orden_id).first()
    if not orden:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orden no encontrada")
    _verificar_propietario_orden(orden, usuario)

    if orden.estado != "pendiente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La orden ya está en estado '{orden.estado}', no se puede pagar",
        )

    # Revalidar stock en tiempo real antes de cobrar (pudo cambiar desde que se creó la orden)
    for item in orden.items:
        try:
            resp_talla = requests.get(f"{CATALOGO_URL}/tallas/{item.talla_id}", timeout=5)
        except requests.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="No se pudo conectar con el servicio de catálogo")
        if resp_talla.status_code != 200:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Talla {item.talla_id} ya no existe en catálogo")
        talla = resp_talla.json()
        if talla["stock_talla"] < item.cantidad:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Stock insuficiente para la talla {talla['talla']}, intenta de nuevo más tarde",
            )

    # Simular el cobro
    if not procesar_pago_simulado(float(orden.total)):
        raise HTTPException(status_code=status.HTTP_402_PAYMENT_REQUIRED, detail="El pago fue rechazado, intenta de nuevo")

    # Descontar stock real en catálogo (solo si el pago fue exitoso)
    for item in orden.items:
        try:
            resp = requests.patch(
                f"{CATALOGO_URL}/tallas/{item.talla_id}/descontar-stock",
                json={"cantidad": item.cantidad},
                headers={"X-Service-Key": SERVICE_KEY},
                timeout=5,
            )
        except requests.RequestException:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Pago aprobado pero no se pudo descontar el stock. Contacta soporte.")
        if resp.status_code != 200:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"No se pudo descontar el stock de la talla {item.talla_id}")

    orden.estado = "pagado"
    db.commit()
    db.refresh(orden)
    return orden


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
    if datos.estado == schemas.EstadoOrden.pagado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El estado 'pagado' solo se puede establecer a través de POST /ordenes/{id}/pagar",
        )
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
    _verificar_propietario_orden(orden, usuario)
    db.delete(orden)
    db.commit()
    return {"mensaje": f"Orden {orden_id} eliminada"}