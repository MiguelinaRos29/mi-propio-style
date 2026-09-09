import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { usuario, token, cargando } = useAuth();

  if (cargando) return null; // o un spinner más adelante

  if (!token || !usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;