import logging
from apscheduler.schedulers.background import BackgroundScheduler
from . import models
from .database import SessionLocal
from .emails import enviar_notificacion_bajada_precio

logger = logging.getLogger("scheduler")


def revisar_bajadas_de_precio():
    db = SessionLocal()
    try:
        pendientes = (
            db.query(models.Wishlist)
            .join(models.Producto, models.Wishlist.producto_id == models.Producto.id)
            .filter(
                models.Wishlist.notificado == False,
                models.Producto.precio_anterior.isnot(None),
                models.Producto.precio < models.Producto.precio_anterior,
            )
            .all()
        )

        for item in pendientes:
            producto = item.producto
            enviar_notificacion_bajada_precio(
                nombre_producto=producto.nombre,
                precio_anterior=float(producto.precio_anterior),
                precio_nuevo=float(producto.precio),
            )
            item.notificado = True

        if pendientes:
            db.commit()
            logger.info(f"Notificaciones de bajada de precio enviadas: {len(pendientes)}")
    finally:
        db.close()


scheduler = BackgroundScheduler()


def iniciar_scheduler():
    scheduler.add_job(revisar_bajadas_de_precio, "interval", minutes=15, id="revisar_bajadas_de_precio")
    scheduler.start()


def detener_scheduler():
    scheduler.shutdown()