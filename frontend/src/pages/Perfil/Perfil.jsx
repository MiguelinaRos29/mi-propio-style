import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Pagina from '../../components/ui/Pagina/Pagina';
import Button from '../../components/ui/Button/Button';
import styles from './Perfil.module.scss';

const Perfil = () => {
  const { usuario, logout } = useAuth();

  return (
    <Pagina titulo="Mi Cuenta" ancho="estrecha">
      <div className={styles.tarjeta}>
        <p className={styles.saludo}>
          Hola, <strong>{usuario?.nombre || usuario?.email}</strong>
        </p>

        <Link to="/mis-ordenes" className={styles.enlaceOrdenes}>
          Ver mis órdenes →
        </Link>

        <Button variante="secundario" onClick={logout}>
          Cerrar sesión
        </Button>
      </div>
    </Pagina>
  );
};

export default Perfil;