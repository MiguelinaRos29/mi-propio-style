import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listarWishlist, eliminarDeWishlist, obtenerProducto } from '../../services/catalogoService';
import Pagina from '../../components/ui/Pagina/Pagina';
import Estado from '../../components/ui/Estado/Estado';
import Button from '../../components/ui/Button/Button';
import ProductoCard, { ProductoGrid } from '../../components/ui/ProductoCard/ProductoCard';
import styles from './Wishlist.module.scss';

const Wishlist = () => {
  const { usuario, token, cargando: autenticando } = useAuth();
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

  if (autenticando) {
    return (
      <Pagina titulo="Mi Wishlist">
        <Estado>Cargando...</Estado>
      </Pagina>
    );
  }

  if (!usuario) {
    return (
      <Pagina titulo="Mi Wishlist">
        <Estado tipo="vacio">
          Inicia sesión para ver tu wishlist. <Link to="/login">Ir a login</Link>
        </Estado>
      </Pagina>
    );
  }

  return (
    <Pagina titulo="Mi Wishlist">
      {cargando ? (
        <Estado>Cargando wishlist...</Estado>
      ) : error ? (
        <Estado tipo="error">Error: {error}</Estado>
      ) : items.length === 0 ? (
        <Estado tipo="vacio">Todavía no tienes productos en tu wishlist.</Estado>
      ) : (
        <ProductoGrid>
          {items.map((item) => (
            <ProductoCard
              key={item.id}
              id={item.producto_id}
              nombre={item.producto?.nombre || `Producto #${item.producto_id}`}
              precio={item.producto?.precio}
            >
              <Button
                variante="peligro"
                tamano="chico"
                className={styles.quitar}
                onClick={() => manejarEliminar(item.id)}
              >
                Quitar
              </Button>
            </ProductoCard>
          ))}
        </ProductoGrid>
      )}
    </Pagina>
  );
};

export default Wishlist;