import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.database import Base, engine


@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as c:
        yield c


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_listar_ordenes_sin_token_da_401(client):
    assert client.get("/ordenes").status_code == 401


def test_crear_orden_sin_token_da_401(client):
    r = client.post("/ordenes", json={"items": []})
    assert r.status_code == 401


def test_verificar_compra_sin_service_key_es_rechazado(client):
    r = client.get("/internal/verificar-compra", params={"usuario_id": 1, "producto_id": 1})
    assert r.status_code in (401, 403, 422)
