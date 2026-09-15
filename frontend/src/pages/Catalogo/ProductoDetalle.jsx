import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  obtenerProducto,
  listarTallas,
  agregarAWishlist,
  listarResenas,
  crearResena,
  actualizarResena,
  eliminarResena,
} from '../../services/catalogoService';
import { crearOrden, pagarOrden } from '../../services/ordenesService';
import styles from './ProductoDetalle.module.scss';

const ProductoDetalle = () => {
  const { id } = useParams();
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [tallas, setTallas] = useState([]);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensajeWishlist, setMensajeWishlist] = useState('');
  const [comprando, setComprando] = useState(false);
  const [mensajeCompra, setMensajeCompra] = useState('');

  // --- Reseñas ---
  const [resenas, setResenas] = useState([]);
  const [cargandoResenas, setCargandoResenas] = useState(true);
  const [errorResenas, setErrorResenas] = useState('');
  const [calificacionForm, setCalificacionForm] = useState(5);
  const [comentarioForm, setComentarioForm] = useState('');
  const [enviandoResena, setEnviandoResena] = useState(false);
  const [resenaEditandoId, setResenaEditandoId] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      setError('');
      try {
        const [datosProducto, datosTallas] = await Promise.all([
          obtenerProducto(id),
          listarTallas(id),
        ]);
        setProducto(datosProducto);
        setTallas(datosTallas);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id]);

  const cargarResenas = async () => {
    setCargandoResenas(true);
    setErrorResenas('');
    try {
      const datos = await listarResenas(id);
      setResenas(datos);
    } catch (err) {
      setErrorResenas(err.message);
    } finally {
      setCargandoResenas(false);
    }
  };

  useEffect(() => {
    cargarResenas();
  }, [id]);

  const manejarAgregarWishlist = async () => {
    setMensajeWishlist('');
    try {
      await agregarAWishlist(Number(id), token);
      setMensajeWishlist('Agregado a tu wishlist ✓');
    } catch (err) {
      setMensajeWishlist(err.message);
    }
  };

  const manejarComprar = async () => {
    setMensajeCompra('');
    setComprando(true);
    try {
      const orden = await crearOrden(
        [{ producto_id: Number(id), talla_id: tallaSeleccionada, cantidad }],
        token
      );
      await pagarOrden(orden.id, token);
      navigate('/mis-ordenes');
    } catch (err) {
      setMensajeCompra(err.message);
    } finally {
      setComprando(false);
    }
  };

  const limpiarFormularioResena = () => {
    setCalificacionForm(5);
    setComentarioForm('');
    setResenaEditandoId(null);
  };

  const manejarEnviarResena = async (e) => {
    e.preventDefault();
    setErrorResenas('');
    setEnviandoResena(true);
    try {
      const datos = {
        calificacion: Number(calificacionForm),
        comentario: comentarioForm.trim() || null,
        foto_url: null,
      };

      if (resenaEditandoId) {
        await actualizarResena(resenaEditandoId, datos, token);
      } else {
        await crearResena({ ...datos, producto_id: Number(id) }, token);
      }

      limpiarFormularioResena();
      await cargarResenas();
    } catch (err) {
      setErrorResenas(err.message);
    } finally {
      setEnviandoResena(false);
    }
  };

  const manejarEditarResena = (resena) => {
    setResenaEditandoId(resena.id);
    setCalificacionForm(resena.calificacion);
    setComentarioForm(resena.comentario || '');
  };

  const manejarEliminarResena = async (resenaId) => {
    setErrorResenas('');
    try {
      await eliminarResena(resenaId, token);
      await cargarResenas();
      if (resenaEditandoId === resenaId) limpiarFormularioResena();
    } catch (err) {
      setErrorResenas(err.message);
    }
  };

  const yaReseñoElUsuario = usuario
    ? resenas.some((r) => r.usuario_id === usuario.id)
    : false;

  if (cargando) return <p className={styles.estado}>Cargando producto...</p>;
  if (error) return <p className={styles.estado}>Error: {error}</p>;
  if (!producto) return null;

  const tallaActual = tallas.find((t) => t.id === tallaSeleccionada);
  const stockDisponible = tallaActual ? tallaActual.stock_talla : 0;

  return (
    <div className={styles.detalle}>
      <Link to="/catalogo" className={styles.volver}>
        ← Volver al catálogo
      </Link>

      <div className={styles.contenido}>
        <h1>{producto.nombre}</h1>
        <p className={styles.precio}>${producto.precio}</p>
        {producto.descripcion && <p className={styles.descripcion}>{producto.descripcion}</p>}

        <div className={styles.tallas}>
          <h3>Tallas disponibles</h3>
          {tallas.length === 0 ? (
            <p className={styles.estado}>No hay tallas registradas para este producto.</p>
          ) : (
            <div className={styles.tallasGrid}>
              {tallas.map((talla) => (
                <button
                  key={talla.id}
                  className={`${styles.tallaBoton} ${
                    tallaSeleccionada === talla.id ? styles.seleccionada : ''
                  }`}
                  disabled={talla.stock_talla === 0}
                  onClick={() => {
                    setTallaSeleccionada(talla.id);
                    setCantidad(1);
                    setMensajeCompra('');
                  }}
                >
                  {talla.talla}
                  {talla.stock_talla === 0 && <span className={styles.sinStock}> (agotado)</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {usuario ? (
          <>
            {tallaSeleccionada && (
              <div className={styles.compraAccion}>
                <label className={styles.cantidadLabel}>
                  Cantidad
                  <input
                    type="number"
                    min={1}
                    max={stockDisponible}
                    value={cantidad}
                    onChange={(e) =>
                      setCantidad(Math.max(1, Math.min(stockDisponible, Number(e.target.value))))
                    }
                    className={styles.cantidadInput}
                  />
                </label>

                <button
                  className={styles.comprarBoton}
                  onClick={manejarComprar}
                  disabled={comprando}
                >
                  {comprando ? 'Procesando...' : 'Comprar ahora'}
                </button>

                {mensajeCompra && <p className={styles.mensajeCompra}>{mensajeCompra}</p>}
              </div>
            )}

            <div className={styles.wishlistAccion}>
              <button className={styles.wishlistBoton} onClick={manejarAgregarWishlist}>
                ♡ Agregar a wishlist
              </button>
              {mensajeWishlist && <p className={styles.mensajeWishlist}>{mensajeWishlist}</p>}
            </div>
          </>
        ) : (
          <p className={styles.estado}>
            <Link to="/login">Inicia sesión</Link> para comprar o agregar a tu wishlist.
          </p>
        )}

        {/* --- Sección de Reseñas --- */}
        <div className={styles.resenas}>
          <h3>Reseñas</h3>

          {cargandoResenas ? (
            <p className={styles.estado}>Cargando reseñas...</p>
          ) : resenas.length === 0 ? (
            <p className={styles.estado}>Todavía no hay reseñas para este producto.</p>
          ) : (
            <div className={styles.resenasLista}>
              {resenas.map((resena) => (
                <div key={resena.id} className={styles.resenaCard}>
                  <div className={styles.resenaCabecera}>
                    <span className={styles.resenaCalificacion}>
                      {'★'.repeat(resena.calificacion)}
                      {'☆'.repeat(5 - resena.calificacion)}
                    </span>
                    <span className={styles.resenaFecha}>
                      {new Date(resena.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {resena.comentario && (
                    <p className={styles.resenaComentario}>{resena.comentario}</p>
                  )}

                  {usuario && usuario.id === resena.usuario_id && (
                    <div className={styles.resenaAcciones}>
                      <button
                        className={styles.resenaEditarBoton}
                        onClick={() => manejarEditarResena(resena)}
                      >
                        Editar
                      </button>
                      <button
                        className={styles.resenaEliminarBoton}
                        onClick={() => manejarEliminarResena(resena.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {usuario ? (
            !yaReseñoElUsuario || resenaEditandoId ? (
              <form className={styles.resenaForm} onSubmit={manejarEnviarResena}>
                <h4>{resenaEditandoId ? 'Editar tu reseña' : 'Deja tu reseña'}</h4>

                <label className={styles.resenaLabel}>
                  Calificación
                  <select
                    value={calificacionForm}
                    onChange={(e) => setCalificacionForm(e.target.value)}
                    className={styles.resenaSelect}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'estrella' : 'estrellas'}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.resenaLabel}>
                  Comentario (opcional)
                  <textarea
                    value={comentarioForm}
                    onChange={(e) => setComentarioForm(e.target.value)}
                    className={styles.resenaTextarea}
                    rows={3}
                  />
                </label>

                <div className={styles.resenaFormBotones}>
                  <button
                    type="submit"
                    className={styles.resenaEnviarBoton}
                    disabled={enviandoResena}
                  >
                    {enviandoResena
                      ? 'Enviando...'
                      : resenaEditandoId
                      ? 'Guardar cambios'
                      : 'Publicar reseña'}
                  </button>
                  {resenaEditandoId && (
                    <button
                      type="button"
                      className={styles.resenaCancelarBoton}
                      onClick={limpiarFormularioResena}
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                {errorResenas && <p className={styles.mensajeCompra}>{errorResenas}</p>}
              </form>
            ) : (
              <p className={styles.estado}>Ya dejaste una reseña para este producto.</p>
            )
          ) : (
            <p className={styles.estado}>
              <Link to="/login">Inicia sesión</Link> para dejar una reseña (solo si compraste el producto).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;