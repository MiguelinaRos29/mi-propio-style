import styles from './Estado.module.scss';

// tipo: 'cargando' | 'vacio' | 'error'
const Estado = ({ tipo = 'cargando', children }) => (
  <p
    className={`${styles.estado} ${tipo === 'error' ? styles.error : ''}`}
    role={tipo === 'error' ? 'alert' : 'status'}
  >
    {children}
  </p>
);

export default Estado;