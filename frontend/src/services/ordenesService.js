const BASE_URL = import.meta.env.VITE_ORDENES_API_URL;

const extraerMensajeError = (error) => {
  if (Array.isArray(error.detail)) {
    return error.detail.map((e) => e.msg).join(', ');
  }
  return error.detail || 'Ocurrió un error inesperado';
};

export const crearOrden = async (items, token) => {
  const respuesta = await fetch(`${BASE_URL}/ordenes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const listarOrdenes = async (token) => {
  const respuesta = await fetch(`${BASE_URL}/ordenes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const obtenerOrden = async (ordenId, token) => {
  const respuesta = await fetch(`${BASE_URL}/ordenes/${ordenId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};

export const pagarOrden = async (ordenId, token) => {
  const respuesta = await fetch(`${BASE_URL}/ordenes/${ordenId}/pagar`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(extraerMensajeError(error));
  }

  return respuesta.json();
};