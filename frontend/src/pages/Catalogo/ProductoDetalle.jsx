import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerProducto, listarTallas, agregarAWishlist } from '../../services/catalogoService';
import styles from './ProductoDetalle.module.scss';

const ProductoDetalle = () => {
  const { id } = useParams();
  const { usuario, token } = useAuth();
  const [producto, setProducto] = useState(null);
  const [tallas, setTallas] = useState([]);
  const [tallaSeleccionada, setTallaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensajeWishlist, setMensajeWishlist] = useState('');

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

  if (cargando) return <p className={styles.estado}>Cargando producto...</p>;
  if (error) return <p className={styles.estado}>Error: {error}</p>;
  if (!producto) return null;

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
                  onClick={() => setTallaSeleccionada(talla.id)}
                >
                  {talla.talla}
                  {talla.stock_talla === 0 && <span className={styles.sinStock}> (agotado)</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {usuario ? (
          <div className={styles.wishlistAccion}>
            <button className={styles.wishlistBoton} onClick={manejarAgregarWishlist}>
              ♡ Agregar a wishlist
            </button>
            {mensajeWishlist && <p className={styles.mensajeWishlist}>{mensajeWishlist}</p>}
          </div>
        ) : (
          <p className={styles.estado}>
            <Link to="/login">Inicia sesión</Link> para agregar a tu wishlist.
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductoDetalle;