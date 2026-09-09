import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.scss';

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await registro({ nombre, email, password });
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className={styles.authContenedor}>
      <form className={styles.authForm} onSubmit={manejarSubmit}>
        <h1>Crear cuenta</h1>

        {error && <p className={styles.error}>{error}</p>}

        <label>
          Nombre
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        <button type="submit" disabled={enviando}>
          {enviando ? 'Creando cuenta...' : 'Registrarme'}
        </button>

        <p className={styles.enlace}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;