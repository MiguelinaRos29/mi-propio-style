import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerProducto, listarTallas, agregarAWishlist } from '../../services/catalogoService';
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
      </div>
    </div>
  );
};

export default ProductoDetalle;