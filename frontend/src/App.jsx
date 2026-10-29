import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Home from './pages/Home/Home';
import Catalogo from './pages/Catalogo/Catalogo';
import ProductoDetalle from './pages/Catalogo/ProductoDetalle';
import Wishlist from './pages/Wishlist/Wishlist';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Perfil from './pages/Perfil/Perfil';
import MisOrdenes from './pages/Perfil/MisOrdenes';

const SERVICIOS = [
  import.meta.env.VITE_AUTH_API_URL,
  import.meta.env.VITE_CATALOGO_API_URL,
  import.meta.env.VITE_ORDENES_API_URL,
];

function App() {
  // Los servicios en hosting gratuito se duermen tras un rato sin tráfico.
  // Al abrir la app los despertamos a los tres a la vez, en segundo plano,
  // para que el usuario no espere cada servicio por separado al navegar.
  useEffect(() => {
    SERVICIOS.forEach((url) => {
      if (url) fetch(`${url}/health`, { mode: 'no-cors' }).catch(() => {});
    });
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalogo />} />
            <Route path="/catalogo/:id" element={<ProductoDetalle />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Perfil />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mis-ordenes"
              element={
                <ProtectedRoute>
                  <MisOrdenes />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;