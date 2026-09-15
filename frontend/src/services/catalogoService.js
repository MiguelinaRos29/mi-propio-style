const BASE_URL = import.meta.env.VITE_CATALOGO_API_URL;

const extraerMensajeError = (error) => {
  if (Array.isArray(error.detail)) {
    return error.detail.map((e) => e.msg).join(', ');
  }
  return error.detail || 'Ocurrió un error inesperado';
};

export const listarProductos = async (filtros = {}) => {
  const params = new URLSearchParams(filtros);
  const respuesta = await fetch(`${BASE_URL}/productos?${params}`);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const obtenerProducto = async (productoId) => {
  const respuesta = await fetch(`${BASE_URL}/productos/${productoId}`);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const listarTallas = async (productoId) => {
  const respuesta = await fetch(`${BASE_URL}/productos/${productoId}/tallas`);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const agregarAWishlist = async (productoId, token) => {
  const respuesta = await fetch(`${BASE_URL}/wishlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ producto_id: productoId }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const listarWishlist = async (usuarioId, token) => {
  const respuesta = await fetch(`${BASE_URL}/wishlist/${usuarioId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const eliminarDeWishlist = async (wishlistId, token) => {
  const respuesta = await fetch(`${BASE_URL}/wishlist/${wishlistId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }
};

export const listarResenas = async (productoId) => {
  const respuesta = await fetch(`${BASE_URL}/productos/${productoId}/resenas`);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const crearResena = async (datos, token) => {
  const respuesta = await fetch(`${BASE_URL}/resenas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const actualizarResena = async (resenaId, datos, token) => {
  const respuesta = await fetch(`${BASE_URL}/resenas/${resenaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const eliminarResena = async (resenaId, token) => {
  const respuesta = await fetch(`${BASE_URL}/resenas/${resenaId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }
};