import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listarOrdenes } from '../../services/ordenesService';
import Pagina from '../../components/ui/Pagina/Pagina';
import Estado from '../../components/ui/Estado/Estado';
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
    <Pagina
      titulo="Mis Órdenes"
      ancho="estrecha"
      atras={{ to: '/perfil', texto: '← Volver a Mi Cuenta' }}
    >
      {cargando ? (
        <Estado>Cargando órdenes...</Estado>
      ) : error ? (
        <Estado tipo="error">Error: {error}</Estado>
      ) : ordenes.length === 0 ? (
        <Estado tipo="vacio">Todavía no tienes órdenes.</Estado>
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
    </Pagina>
  );
};

export default MisOrdenes;