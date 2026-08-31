import os
import random


def procesar_pago_simulado(monto: float) -> bool:
    """
    Simula la llamada a un gateway de pago externo (ej. Stripe).
    En una implementación real, esta función haría la llamada HTTP real
    al procesador de pagos. Aislarla aquí permite reemplazarla sin tocar
    la lógica de negocio del endpoint /pagar.
    """
    probabilidad_exito = float(os.getenv("PAGO_PROBABILIDAD_EXITO", "0.9"))
    return random.random() < probabilidad_exito