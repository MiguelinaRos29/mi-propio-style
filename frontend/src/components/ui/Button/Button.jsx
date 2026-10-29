import styles from './Button.module.scss';

// variante: 'primario' | 'secundario' | 'peligro'
// tamano: 'normal' | 'chico'
const Button = ({
  variante = 'primario',
  tamano = 'normal',
  completo = false,
  type = 'button',
  className = '',
  children,
  ...resto
}) => {
  const clases = [
    styles.boton,
    styles[variante],
    tamano === 'chico' ? styles.chico : '',
    completo ? styles.completo : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button type={type} className={clases} {...resto}>
      {children}
    </button>
  );
};

export default Button;