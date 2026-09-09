import { createContext, useContext, useState, useEffect } from 'react';
import { iniciarSesion, registrarUsuario, obtenerUsuarioActual } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarUsuario = async () => {
      if (!token) {
        setCargando(false);
        return;
      }
      try {
        const datosUsuario = await obtenerUsuarioActual(token);
        setUsuario(datosUsuario);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    cargarUsuario();
  }, [token]);

  const login = async (email, password) => {
    const data = await iniciarSesion(email, password);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
  };

  const registro = async (datos) => {
    await registrarUsuario(datos);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, registro, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);