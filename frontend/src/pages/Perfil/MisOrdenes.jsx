import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { listarOrdenes } from '../../services/ordenesService';
import styles from './MisOrdenes.module.scss';

const ESTADO_LABEL = {
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
};

const MisOrdenes = () => {
  const { token } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        const datos = await listarOrdenes(token);
        setOrdenes(datos);
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    };

    cargarOrdenes();
  }, [token]);

  return (
    <div className={styles.misOrdenes}>
      <Link to="/perfil" className={styles.volver}>
        ← Volver a Mi Cuenta
      </Link>

      <h1>Mis Órdenes</h1>

      {cargando ? (
        <p className={styles.estado}>Cargando órdenes...</p>
      ) : error ? (
        <p className={styles.estado}>Error: {error}</p>
      ) : ordenes.length === 0 ? (
        <p className={styles.estado}>Todavía no tienes órdenes.</p>
      ) : (
        <div className={styles.lista}>
          {ordenes.map((orden) => (
            <div key={orden.id} className={styles.orden}>
              <div className={styles.ordenCabecera}>
                <span>Orden #{orden.id}</span>
                <span className={`${styles.badge} ${styles[orden.estado] || ''}`}>
                  {ESTADO_LABEL[orden.estado] || orden.estado}
                </span>
              </div>
              <p className={styles.total}>Total: ${orden.total}</p>
              <p className={styles.fecha}>
                {new Date(orden.fecha_creacion).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisOrdenes;