import { useState } from 'react';
import styles from './Input.module.scss';

const OjoAbierto = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const OjoCerrado = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

// como: 'input' (por defecto) | 'textarea' | 'select'
// Si type="password", añade automáticamente el "ojito" para ver/ocultar el texto.
const Input = ({ label, type = 'text', como = 'input', children, ...resto }) => {
  const [visible, setVisible] = useState(false);
  const esPassword = como === 'input' && type === 'password';
  const tipoReal = esPassword && visible ? 'text' : type;
  const Elemento = como;
  const propsTipo = como === 'input' ? { type: tipoReal } : {};

  return (
    <label className={styles.campo}>
      {label}
      <span className={styles.contenedor}>
        <Elemento
          className={`${styles.input} ${esPassword ? styles.conOjo : ''}`}
          {...propsTipo}
          {...resto}
        >
          {children}
        </Elemento>
        {esPassword && (
          <button
            type="button"
            className={styles.ojo}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
          >
            {visible ? <OjoCerrado /> : <OjoAbierto />}
          </button>
        )}
      </span>
    </label>
  );
};

export default Input;