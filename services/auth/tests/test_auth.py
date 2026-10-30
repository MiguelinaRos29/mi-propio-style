from jose import jwt

from app import security

EMAIL = "ana@example.com"
PASSWORD = "una-clave-segura-123"


def registrar(client, email=EMAIL, password=PASSWORD, **extra):
    return client.post("/register", json={"email": email, "password": password, **extra})


def login(client, email=EMAIL, password=PASSWORD):
    return client.post("/login", data={"username": email, "password": password})


def test_health(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_registro_crea_usuario_sin_exponer_la_password(client):
    r = registrar(client)
    assert r.status_code == 200
    cuerpo = r.json()
    assert cuerpo["email"] == EMAIL
    assert cuerpo["role"] == "user"
    assert "password" not in cuerpo and "hashed_password" not in cuerpo


def test_registro_no_permite_autoasignarse_rol_admin(client):
    r = registrar(client, role="admin")
    assert r.status_code == 200
    assert r.json()["role"] == "user"


def test_registro_rechaza_email_duplicado(client):
    registrar(client)
    r = registrar(client)
    assert r.status_code == 400


def test_registro_rechaza_email_invalido(client):
    assert registrar(client, email="no-es-un-email").status_code == 422


def test_login_correcto_devuelve_jwt_con_sub_y_rol(client):
    registrar(client)
    r = login(client)
    assert r.status_code == 200
    token = r.json()["access_token"]
    payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
    assert payload["rol"] == "user"
    assert payload["sub"].isdigit()


def test_login_con_password_incorrecta_da_401(client):
    registrar(client)
    assert login(client, password="otra-clave").status_code == 401


def test_login_con_usuario_inexistente_da_401(client):
    assert login(client, email="nadie@example.com").status_code == 401


def test_me_con_token_valido(client):
    registrar(client)
    token = login(client).json()["access_token"]
    r = client.get("/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == EMAIL


def test_me_sin_token_da_401(client):
    assert client.get("/me").status_code == 401


def test_me_con_token_manipulado_da_401(client):
    registrar(client)
    token = login(client).json()["access_token"]
    r = client.get("/me", headers={"Authorization": f"Bearer {token}x"})
    assert r.status_code == 401


def test_password_se_guarda_hasheada():
    h = security.hashear_password("secreto")
    assert h != "secreto"
    assert security.verificar_password("secreto", h)
    assert not security.verificar_password("otro", h)
