import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listarWishlist, eliminarDeWishlist, obtenerProducto } from '../../services/catalogoService';
import styles from './Wishlist.module.scss';

const Wishlist = () => {
  const { usuario, token } = useAuth();
  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!usuario) return;

    const cargarWishlist = async () => {
      try {
        const datosWishlist = await listarWishlist(usuario.id, token);

        const itemsConProducto = await Promise.all(
          datosWishlist.map(async (item) => {
            try {
              const producto = await obtenerProducto(item.producto_id);
              return { ...item, producto };
            } catch {
              return { ...item, producto: null };
            }
          })
        );

        setItems(itemsConProducto);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarWishlist();
  }, [usuario, token]);

  const manejarEliminar = async (wishlistId) => {
    try {
      await eliminarDeWishlist(wishlistId, token);
      setItems((prev) => prev.filter((item) => item.id !== wishlistId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!usuario) {
    return (
      <div className={styles.wishlist}>
        <p className={styles.estado}>
          Inicia sesión para ver tu wishlist. <Link to="/login">Ir a login</Link>
        </p>
      </div>
    );
  }

  if (cargando) return <p className={styles.estado}>Cargando wishlist...</p>;
  if (error) return <p className={styles.estado}>Error: {error}</p>;

  return (
    <div className={styles.wishlist}>
      <h1>Mi Wishlist</h1>

      {items.length === 0 ? (
        <p className={styles.estado}>Todavía no tienes productos en tu wishlist.</p>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <Link to={`/catalogo/${item.producto_id}`} className={styles.enlace}>
                <h3>{item.producto?.nombre || `Producto #${item.producto_id}`}</h3>
                {item.producto?.precio && <p className={styles.precio}>${item.producto.precio}</p>}
              </Link>
              <button className={styles.eliminarBoton} onClick={() => manejarEliminar(item.id)}>
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;