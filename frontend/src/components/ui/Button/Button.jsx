import styles from './Button.module.scss';

// variante: 'primario' | 'secundario' | 'peligro'
const Button = ({
  variante = 'primario',
  completo = false,
  type = 'button',
  className = '',
  children,
  ...resto
}) => {
  const clases = [
    styles.boton,
    styles[variante],
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