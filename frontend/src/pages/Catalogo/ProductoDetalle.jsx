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
import Pagina from '../../components/ui/Pagina/Pagina';
import Estado from '../../components/ui/Estado/Estado';
import Button from '../../components/ui/Button/Button';
import Input from '../../components/ui/Input/Input';
import styles from './ProductoDetalle.module.scss';

const ATRAS_CATALOGO = { to: '/catalogo', texto: '← Volver al catálogo' };

const ProductoDetalle = () => {
  const { id } = useParams();
  const { usuario, token, cargando: autenticando } = useAuth();
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [tallas, setTallas] = useState([]);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensajeWishlist, setMensajeWishlist] = useState(null); // { tipo, texto }
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
    setMensajeWishlist(null);
    try {
      await agregarAWishlist(Number(id), token);
      setMensajeWishlist({ tipo: 'exito', texto: 'Agregado a tu wishlist ✓' });
    } catch (err) {
      setMensajeWishlist({ tipo: 'error', texto: err.message });
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
    if (!window.confirm('¿Seguro que quieres eliminar tu reseña?')) return;

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

  if (cargando) {
    return (
      <Pagina ancho="estrecha" atras={ATRAS_CATALOGO}>
        <Estado>Cargando producto...</Estado>
      </Pagina>
    );
  }

  if (error) {
    return (
      <Pagina ancho="estrecha" atras={ATRAS_CATALOGO}>
        <Estado tipo="error">Error: {error}</Estado>
      </Pagina>
    );
  }

  if (!producto) return null;

  const tallaActual = tallas.find((t) => t.id === tallaSeleccionada);
  const stockDisponible = tallaActual ? tallaActual.stock_talla : 0;

  return (
    <Pagina titulo={producto.nombre} ancho="estrecha" atras={ATRAS_CATALOGO}>
      <p className={styles.precio}>${producto.precio}</p>
      {producto.descripcion && <p className={styles.descripcion}>{producto.descripcion}</p>}

      <section className={styles.tallas}>
        <h3>Tallas disponibles</h3>
        {tallas.length === 0 ? (
          <Estado tipo="vacio" compacto>
            No hay tallas registradas para este producto.
          </Estado>
        ) : (
          <div className={styles.tallasGrid}>
            {tallas.map((talla) => (
              <Button
                key={talla.id}
                tamano="chico"
                variante={tallaSeleccionada === talla.id ? 'primario' : 'secundario'}
                disabled={talla.stock_talla === 0}
                onClick={() => {
                  setTallaSeleccionada(talla.id);
                  setCantidad(1);
                  setMensajeCompra('');
                }}
              >
                {talla.talla}
                {talla.stock_talla === 0 && <span className={styles.sinStock}> (agotado)</span>}
              </Button>
            ))}
          </div>
        )}
      </section>

      {autenticando ? null : usuario ? (
        <>
          {tallaSeleccionada && (
            <div className={styles.compraAccion}>
              <div className={styles.cantidad}>
                <Input
                  label="Cantidad"
                  type="number"
                  min={1}
                  max={stockDisponible}
                  value={cantidad}
                  onChange={(e) =>
                    setCantidad(Math.max(1, Math.min(stockDisponible, Number(e.target.value))))
                  }
                />
              </div>

              <Button onClick={manejarComprar} disabled={comprando}>
                {comprando ? 'Procesando...' : 'Comprar ahora'}
              </Button>

              {mensajeCompra && (
                <div className={styles.filaCompleta}>
                  <Estado tipo="error" compacto>
                    {mensajeCompra}
                  </Estado>
                </div>
              )}
            </div>
          )}

          <div className={styles.wishlistAccion}>
            <Button variante="secundario" onClick={manejarAgregarWishlist}>
              ♡ Agregar a wishlist
            </Button>
            {mensajeWishlist && (
              <Estado tipo={mensajeWishlist.tipo} compacto>
                {mensajeWishlist.texto}
              </Estado>
            )}
          </div>
        </>
      ) : (
        <Estado tipo="vacio" compacto>
          <Link to="/login">Inicia sesión</Link> para comprar o agregar a tu wishlist.
        </Estado>
      )}

      {/* --- Sección de Reseñas --- */}
      <section className={styles.resenas}>
        <h3>Reseñas</h3>

        {cargandoResenas ? (
          <Estado compacto>Cargando reseñas...</Estado>
        ) : resenas.length === 0 ? (
          <Estado tipo="vacio" compacto>
            Todavía no hay reseñas para este producto.
          </Estado>
        ) : (
          <div className={styles.resenasLista}>
            {resenas.map((resena) => (
              <div key={resena.id} className={styles.resenaCard}>
                <div className={styles.resenaCabecera}>
                  <span
                    className={styles.resenaCalificacion}
                    role="img"
                    aria-label={`${resena.calificacion} de 5 estrellas`}
                  >
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
                    <Button
                      variante="secundario"
                      tamano="chico"
                      onClick={() => manejarEditarResena(resena)}
                    >
                      Editar
                    </Button>
                    <Button
                      variante="peligro"
                      tamano="chico"
                      onClick={() => manejarEliminarResena(resena.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {autenticando ? null : usuario ? (
          !yaReseñoElUsuario || resenaEditandoId ? (
            <form className={styles.resenaForm} onSubmit={manejarEnviarResena}>
              <h4>{resenaEditandoId ? 'Editar tu reseña' : 'Deja tu reseña'}</h4>

              <Input
                como="select"
                label="Calificación"
                value={calificacionForm}
                onChange={(e) => setCalificacionForm(e.target.value)}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? 'estrella' : 'estrellas'}
                  </option>
                ))}
              </Input>

              <Input
                como="textarea"
                label="Comentario (opcional)"
                value={comentarioForm}
                onChange={(e) => setComentarioForm(e.target.value)}
                rows={3}
              />

              <div className={styles.resenaFormBotones}>
                <Button type="submit" disabled={enviandoResena}>
                  {enviandoResena
                    ? 'Enviando...'
                    : resenaEditandoId
                    ? 'Guardar cambios'
                    : 'Publicar reseña'}
                </Button>
                {resenaEditandoId && (
                  <Button variante="secundario" onClick={limpiarFormularioResena}>
                    Cancelar
                  </Button>
                )}
              </div>

              {errorResenas && (
                <Estado tipo="error" compacto>
                  {errorResenas}
                </Estado>
              )}
            </form>
          ) : (
            <Estado tipo="vacio" compacto>
              Ya dejaste una reseña para este producto.
            </Estado>
          )
        ) : (
          <Estado tipo="vacio" compacto>
            <Link to="/login">Inicia sesión</Link> para dejar una reseña (solo si compraste el
            producto).
          </Estado>
        )}
      </section>
    </Pagina>
  );
};

export default ProductoDetalle;