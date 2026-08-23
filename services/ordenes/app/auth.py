import os

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
AUTH_LOGIN_URL = os.getenv("AUTH_LOGIN_URL", "http://127.0.0.1:8002/login")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=AUTH_LOGIN_URL)


class UsuarioActual:
    def __init__(self, id: int, rol: str):
        self.id = id
        self.rol = rol


def obtener_usuario_actual(token: str = Depends(oauth2_scheme)) -> UsuarioActual:
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar el token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario_id = payload.get("sub")
        rol = payload.get("rol")
        if usuario_id is None or rol is None:
            raise credenciales_invalidas
    except JWTError:
        raise credenciales_invalidas
    return UsuarioActual(id=int(usuario_id), rol=rol)


def requerir_rol(*roles_permitidos):
    def dependencia(usuario: UsuarioActual = Depends(obtener_usuario_actual)) -> UsuarioActual:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para esta acción")
        return usuario
    return dependencia
