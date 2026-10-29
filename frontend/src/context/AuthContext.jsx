import { createContext, useContext, useState, useEffect } from 'react';
import { iniciarSesion, registrarUsuario, obtenerUsuarioActual } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Solo al abrir la app: restaurar la sesión guardada en localStorage
  useEffect(() => {
    const restaurarSesion = async () => {
      const tokenGuardado = localStorage.getItem('token');
      if (!tokenGuardado) {
        setCargando(false);
        return;
      }
      try {
        const datosUsuario = await obtenerUsuarioActual(tokenGuardado);
        setUsuario(datosUsuario);
      } catch {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
      } finally {
        setCargando(false);
      }
    };

    restaurarSesion();
  }, []);

  const login = async (email, password) => {
    const data = await iniciarSesion(email, password);
    // Cargamos el usuario ANTES de terminar el login, para que cuando
    // Login.jsx navegue a /perfil, ProtectedRoute ya tenga token y usuario.
    const datosUsuario = await obtenerUsuarioActual(data.access_token);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUsuario(datosUsuario);
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