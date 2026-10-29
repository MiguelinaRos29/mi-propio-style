import styles from './Estado.module.scss';

// tipo: 'cargando' | 'vacio' | 'error' | 'exito'
// compacto: versión alineada a la izquierda para mensajes dentro de una página
const Estado = ({ tipo = 'cargando', compacto = false, children }) => {
  const clases = [
    styles.estado,
    compacto ? styles.compacto : '',
    tipo === 'error' ? styles.error : '',
    tipo === 'exito' ? styles.exito : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <p className={clases} role={tipo === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
};

export default Estado;