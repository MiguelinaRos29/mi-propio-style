// src/components/layout/Navbar/Navbar.jsx
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => setMenuAbierto((prev) => !prev);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarContenido}>
        <Link to="/" className={styles.logo} onClick={cerrarMenu}>
          Mi Propio Style
        </Link>

        <button
          className={styles.menuToggle}
          onClick={toggleMenu}
          aria-label="Abrir menú"
          aria-expanded={menuAbierto}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`${styles.navLinks} ${menuAbierto ? styles.abierto : ''}`}>
          <NavLink to="/catalogo" onClick={cerrarMenu} className={({ isActive }) => isActive ? styles.activo : ''}>
            Catálogo
          </NavLink>
          <NavLink to="/wishlist" onClick={cerrarMenu} className={({ isActive }) => isActive ? styles.activo : ''}>
            Wishlist
          </NavLink>
          <NavLink to="/perfil" onClick={cerrarMenu} className={({ isActive }) => isActive ? styles.activo : ''}>
            Mi Cuenta
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;