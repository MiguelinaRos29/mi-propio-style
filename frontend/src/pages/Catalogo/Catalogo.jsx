import { useEffect, useState } from 'react';
import { listarProductos } from '../../services/catalogoService';
import Pagina from '../../components/ui/Pagina/Pagina';
import Estado from '../../components/ui/Estado/Estado';
import Button from '../../components/ui/Button/Button';
import ProductoCard, { ProductoGrid } from '../../components/ui/ProductoCard/ProductoCard';
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
    <Pagina titulo="Catálogo">
      <div className={styles.filtros}>
        <span>Filtrar por talla:</span>
        <Button
          tamano="chico"
          variante={tallaFiltro === '' ? 'primario' : 'secundario'}
          onClick={() => setTallaFiltro('')}
        >
          Todas
        </Button>
        {TALLAS_DISPONIBLES.map((talla) => (
          <Button
            key={talla}
            tamano="chico"
            variante={tallaFiltro === talla ? 'primario' : 'secundario'}
            onClick={() => setTallaFiltro(talla)}
          >
            {talla}
          </Button>
        ))}
      </div>

      {cargando ? (
        <Estado>Cargando productos...</Estado>
      ) : error ? (
        <Estado tipo="error">Error: {error}</Estado>
      ) : productos.length === 0 ? (
        <Estado tipo="vacio">No hay productos con esa talla.</Estado>
      ) : (
        <ProductoGrid>
          {productos.map((producto) => (
            <ProductoCard
              key={producto.id}
              id={producto.id}
              nombre={producto.nombre}
              precio={producto.precio}
              descripcion={producto.descripcion}
            />
          ))}
        </ProductoGrid>
      )}
    </Pagina>
  );
};

export default Catalogo;