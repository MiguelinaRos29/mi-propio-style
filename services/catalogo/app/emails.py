import os
import resend

resend.api_key = os.getenv("RESEND_API_KEY")

EMAIL_DESDE = os.getenv("EMAIL_NOTIFICACIONES_DESDE")
EMAIL_PRUEBA = os.getenv("EMAIL_NOTIFICACIONES_PRUEBA")


def enviar_notificacion_bajada_precio(nombre_producto: str, precio_anterior: float, precio_nuevo: float):
    resend.Emails.send({
        "from": EMAIL_DESDE,
        "to": EMAIL_PRUEBA,
        "subject": f"¡Bajó de precio! {nombre_producto}",
        "html": (
            f"<p>El producto <strong>{nombre_producto}</strong> que tienes en tu wishlist "
            f"bajó de precio: de <strong>${precio_anterior}</strong> a "
            f"<strong>${precio_nuevo}</strong>.</p>"
        ),
    })