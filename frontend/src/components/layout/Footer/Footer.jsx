// src/components/layout/Footer/Footer.jsx
import styles from './Footer.module.scss';

const Footer = () => {
  const anioActual = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContenido}>
        <p>© {anioActual} Mi Propio Style. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;