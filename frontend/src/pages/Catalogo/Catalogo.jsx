import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listarProductos } from '../../services/catalogoService';
import styles from './Catalogo.module.scss';

const TALLAS_DISPONIBLES = ['S', 'M', 'L', 'XL'];

const Catalogo = () => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [tallaFiltro, setTallaFiltro] = useState('');

  useEffect(() => {
    const cargarProductos = async () => {
      setCargando(true);
      setError('');
      try {
        const filtros = tallaFiltro ? { talla: tallaFiltro } : {};
        const datos = await listarProductos(filtros);
        setProductos(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, [tallaFiltro]);

  return (
    <div className={styles.catalogo}>
      <h1>Catálogo</h1>

      <div className={styles.filtros}>
        <span>Filtrar por talla:</span>
        <button
          className={`${styles.filtroBoton} ${tallaFiltro === '' ? styles.activo : ''}`}
          onClick={() => setTallaFiltro('')}
        >
          Todas
        </button>
        {TALLAS_DISPONIBLES.map((talla) => (
          <button
            key={talla}
            className={`${styles.filtroBoton} ${tallaFiltro === talla ? styles.activo : ''}`}
            onClick={() => setTallaFiltro(talla)}
          >
            {talla}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className={styles.estado}>Cargando productos...</p>
      ) : error ? (
        <p className={styles.estado}>Error: {error}</p>
      ) : productos.length === 0 ? (
        <p className={styles.estado}>No hay productos con esa talla.</p>
      ) : (
        <div className={styles.grid}>
          {productos.map((producto) => (
            <Link key={producto.id} to={`/catalogo/${producto.id}`} className={styles.card}>
              <h3>{producto.nombre}</h3>
              <p className={styles.precio}>${producto.precio}</p>
              {producto.descripcion && (
                <p className={styles.descripcion}>{producto.descripcion}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogo;