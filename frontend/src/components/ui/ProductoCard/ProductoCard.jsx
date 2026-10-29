import { Link } from 'react-router-dom';
import styles from './ProductoCard.module.scss';

export const ProductoGrid = ({ children }) => (
  <div className={styles.grid}>{children}</div>
);

// children: acciones opcionales debajo de la tarjeta (por ejemplo, un botón "Quitar")
const ProductoCard = ({ id, nombre, precio, descripcion, children }) => (
  <article className={styles.card}>
    <Link to={`/catalogo/${id}`} className={styles.enlace}>
      <h3>{nombre}</h3>
      {precio != null && <p className={styles.precio}>${precio}</p>}
      {descripcion && <p className={styles.descripcion}>{descripcion}</p>}
    </Link>
    {children}
  </article>
);

export default ProductoCard;