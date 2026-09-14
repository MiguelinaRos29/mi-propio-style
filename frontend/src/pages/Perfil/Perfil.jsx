import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Perfil.module.scss';

const Perfil = () => {
  const { usuario, logout } = useAuth();

  return (
    <div className={styles.perfil}>
      <h1>Mi Cuenta</h1>
      <p>Hola, {usuario?.nombre || usuario?.email}</p>

      <Link to="/mis-ordenes" className={styles.enlaceOrdenes}>
        Ver mis órdenes →
      </Link>

      <button onClick={logout} className={styles.botonSalir}>
        Cerrar sesión
      </button>
    </div>
  );
};

export default Perfil;