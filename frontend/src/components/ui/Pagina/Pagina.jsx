import { Link } from 'react-router-dom';
import styles from './Pagina.module.scss';

// ancho: 'normal' (1200px) | 'estrecha' (700px)
// atras: { to: '/ruta', texto: '← Volver' } (opcional)
const Pagina = ({ titulo, ancho = 'normal', atras, children }) => (
  <div className={`${styles.pagina} ${ancho === 'estrecha' ? styles.estrecha : ''}`}>
    {atras && (
      <Link to={atras.to} className={styles.atras}>
        {atras.texto}
      </Link>
    )}
    {titulo && <h1 className={styles.titulo}>{titulo}</h1>}
    {children}
  </div>
);

export default Pagina;