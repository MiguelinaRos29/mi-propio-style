const BASE_URL = import.meta.env.VITE_AUTH_API_URL;

const extraerMensajeError = (error) => {
  if (Array.isArray(error.detail)) {
    return error.detail.map((e) => e.msg).join(', ');
  }
  return error.detail || 'Ocurrió un error inesperado';
};

export const registrarUsuario = async (datos) => {
  const respuesta = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const iniciarSesion = async (email, password) => {
  const cuerpo = new URLSearchParams();
  cuerpo.append('grant_type', 'password');
  cuerpo.append('username', email);
  cuerpo.append('password', password);

  const respuesta = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: cuerpo,
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json(); // espera { access_token, token_type }
};

export const obtenerUsuarioActual = async (token) => {
  const respuesta = await fetch(`${BASE_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    throw new Error('Sesión inválida o expirada');
  }

  return respuesta.json();
};