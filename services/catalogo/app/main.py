from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from . import models, schemas
from .auth import UsuarioActual, obtener_usuario_actual, requerir_rol
from .database import engine, SessionLocal, Base

Base.metadata.create_all(bind=engine)
 
app = FastAPI()
 
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
 
 
# ---------- Productos ----------
 
@app.get("/productos", response_model=List[schemas.ProductoRespuesta])
def listar_productos(db: Session = Depends(get_db)):
    return db.query(models.Producto).all()
 
 
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

@app.get("/tallas/{talla_id}", response_model=schemas.TallaRespuesta)
def obtener_talla(talla_id: int, db: Session = Depends(get_db)):
    talla = db.query(models.Talla).filter(models.Talla.id == talla_id).first()
    if not talla:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talla no encontrada")
    return talla
 
 
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
 
 
# ---------- Tallas ----------
 
@app.get("/productos/{producto_id}/tallas", response_model=List[schemas.TallaRespuesta])
def listar_tallas(producto_id: int, db: Session = Depends(get_db)):
    return db.query(models.Talla).filter(models.Talla.producto_id == producto_id).all()
 
 
@app.post("/tallas", response_model=schemas.TallaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_talla(
    talla: schemas.TallaCrear,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(requerir_rol("vendedor", "admin")),
):
    producto = db.query(models.Producto).filter(models.Producto.id == talla.producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    _verificar_propietario_producto(producto, usuario)
    nueva_talla = models.Talla(**talla.dict())
    db.add(nueva_talla)
    db.commit()
    db.refresh(nueva_talla)
    return nueva_talla


@app.put("/tallas/{talla_id}", response_model=schemas.TallaRespuesta)
def actualizar_talla(
    talla_id: int,
    datos: schemas.TallaBase,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    talla = db.query(models.Talla).filter(models.Talla.id == talla_id).first()
    if not talla:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talla no encontrada")
    producto = db.query(models.Producto).filter(models.Producto.id == talla.producto_id).first()
    _verificar_propietario_producto(producto, usuario)
    for campo, valor in datos.dict().items():
        setattr(talla, campo, valor)
    db.commit()
    db.refresh(talla)
    return talla


@app.delete("/tallas/{talla_id}")
def eliminar_talla(
    talla_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    talla = db.query(models.Talla).filter(models.Talla.id == talla_id).first()
    if not talla:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talla no encontrada")
    producto = db.query(models.Producto).filter(models.Producto.id == talla.producto_id).first()
    _verificar_propietario_producto(producto, usuario)
    db.delete(talla)
    db.commit()
    return {"mensaje": f"Talla {talla_id} eliminada"}
 
 
# ---------- Wishlist ----------
 
def _verificar_propietario_wishlist(item: models.Wishlist, usuario: UsuarioActual):
    if usuario.rol != "admin" and item.usuario_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre este elemento")


@app.get("/wishlist/{usuario_id}", response_model=List[schemas.WishlistRespuesta])
def listar_wishlist(
    usuario_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    if usuario.rol != "admin" and usuario_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta wishlist")
    return db.query(models.Wishlist).filter(models.Wishlist.usuario_id == usuario_id).all()


@app.post("/wishlist", response_model=schemas.WishlistRespuesta, status_code=status.HTTP_201_CREATED)
def crear_wishlist(
    item: schemas.WishlistCrear,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    producto = db.query(models.Producto).filter(models.Producto.id == item.producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    nuevo_item = models.Wishlist(**item.dict(), usuario_id=usuario.id)
    db.add(nuevo_item)
    db.commit()
    db.refresh(nuevo_item)
    return nuevo_item


@app.put("/wishlist/{wishlist_id}", response_model=schemas.WishlistRespuesta)
def actualizar_wishlist(
    wishlist_id: int,
    datos: schemas.WishlistBase,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    item = db.query(models.Wishlist).filter(models.Wishlist.id == wishlist_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento de wishlist no encontrado")
    _verificar_propietario_wishlist(item, usuario)
    for campo, valor in datos.dict().items():
        setattr(item, campo, valor)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/wishlist/{wishlist_id}")
def eliminar_wishlist(
    wishlist_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    item = db.query(models.Wishlist).filter(models.Wishlist.id == wishlist_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Elemento de wishlist no encontrado")
    _verificar_propietario_wishlist(item, usuario)
    db.delete(item)
    db.commit()
    return {"mensaje": f"Elemento {wishlist_id} eliminado de la wishlist"}
 
 
# ---------- Reseñas ----------
 
@app.get("/productos/{producto_id}/resenas", response_model=List[schemas.ResenaRespuesta])
def listar_resenas(producto_id: int, db: Session = Depends(get_db)):
    return db.query(models.Resena).filter(models.Resena.producto_id == producto_id).all()
 
 
def _verificar_propietario_resena(resena: models.Resena, usuario: UsuarioActual):
    if usuario.rol != "admin" and resena.usuario_id != usuario.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso sobre esta reseña")


@app.post("/resenas", response_model=schemas.ResenaRespuesta, status_code=status.HTTP_201_CREATED)
def crear_resena(
    resena: schemas.ResenaCrear,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    producto = db.query(models.Producto).filter(models.Producto.id == resena.producto_id).first()
    if not producto:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
    nueva_resena = models.Resena(**resena.dict(), usuario_id=usuario.id)
    db.add(nueva_resena)
    db.commit()
    db.refresh(nueva_resena)
    return nueva_resena


@app.put("/resenas/{resena_id}", response_model=schemas.ResenaRespuesta)
def actualizar_resena(
    resena_id: int,
    datos: schemas.ResenaBase,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    resena = db.query(models.Resena).filter(models.Resena.id == resena_id).first()
    if not resena:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada")
    _verificar_propietario_resena(resena, usuario)
    for campo, valor in datos.dict().items():
        setattr(resena, campo, valor)
    db.commit()
    db.refresh(resena)
    return resena


@app.delete("/resenas/{resena_id}")
def eliminar_resena(
    resena_id: int,
    db: Session = Depends(get_db),
    usuario: UsuarioActual = Depends(obtener_usuario_actual),
):
    resena = db.query(models.Resena).filter(models.Resena.id == resena_id).first()
    if not resena:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reseña no encontrada")
    _verificar_propietario_resena(resena, usuario)
    db.delete(resena)
    db.commit()
    return {"mensaje": f"Reseña {resena_id} eliminada"}