import pytest

from app.pagos import procesar_pago_simulado


def test_pago_siempre_exitoso_con_probabilidad_1(monkeypatch):
    monkeypatch.setenv("PAGO_PROBABILIDAD_EXITO", "1")
    assert all(procesar_pago_simulado(10.0) for _ in range(50))


def test_pago_siempre_rechazado_con_probabilidad_0(monkeypatch):
    monkeypatch.setenv("PAGO_PROBABILIDAD_EXITO", "0")
    assert not any(procesar_pago_simulado(10.0) for _ in range(50))


def test_probabilidad_por_defecto_es_alta(monkeypatch):
    monkeypatch.delenv("PAGO_PROBABILIDAD_EXITO", raising=False)
    exitos = sum(procesar_pago_simulado(10.0) for _ in range(500))
    assert exitos > 350  # ~90% esperado; margen amplio para evitar tests inestables
