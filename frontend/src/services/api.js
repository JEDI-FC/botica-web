const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('botica_token');

const request = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.mensaje || 'Error al conectar con el servidor');
  }

  return data;
};

export const getProductos = () => request('/productos');
export const getProducto = (id) => request(`/productos/${id}`);
export const getProductosBajoStock = () => request('/productos/alertas/bajo-stock');
export const crearProducto = (producto) => request('/productos', {
  method: 'POST',
  body: JSON.stringify(producto)
});
export const actualizarProducto = (id, producto) => request(`/productos/${id}`, {
  method: 'PUT',
  body: JSON.stringify(producto)
});
export const eliminarProducto = (id) => request(`/productos/${id}`, {
  method: 'DELETE'
});

export const getCategorias = () => request('/categorias');
export const getCategoria = (id) => request(`/categorias/${id}`);
export const crearCategoria = (categoria) => request('/categorias', {
  method: 'POST',
  body: JSON.stringify(categoria)
});
export const actualizarCategoria = (id, categoria) => request(`/categorias/${id}`, {
  method: 'PUT',
  body: JSON.stringify(categoria)
});
export const eliminarCategoria = (id) => request(`/categorias/${id}`, {
  method: 'DELETE'
});

export const getProveedores = () => request('/proveedores');
export const getProveedor = (id) => request(`/proveedores/${id}`);
export const crearProveedor = (proveedor) => request('/proveedores', {
  method: 'POST',
  body: JSON.stringify(proveedor)
});
export const actualizarProveedor = (id, proveedor) => request(`/proveedores/${id}`, {
  method: 'PUT',
  body: JSON.stringify(proveedor)
});
export const eliminarProveedor = (id) => request(`/proveedores/${id}`, {
  method: 'DELETE'
});

export const getClientes = () => request('/clientes');
export const getCliente = (id) => request(`/clientes/${id}`);
export const buscarClientes = (texto) => request(`/clientes/buscar?q=${encodeURIComponent(texto)}`);
export const crearCliente = (cliente) => request('/clientes', {
  method: 'POST',
  body: JSON.stringify(cliente)
});
export const actualizarCliente = (id, cliente) => request(`/clientes/${id}`, {
  method: 'PUT',
  body: JSON.stringify(cliente)
});
export const eliminarCliente = (id) => request(`/clientes/${id}`, {
  method: 'DELETE'
});

export const getVentas = () => request('/ventas');
export const getMovimientosVentas = () => request('/ventas/movimientos');
export const getVenta = (id) => request(`/ventas/${id}`);
export const crearVenta = (venta) => request('/ventas', {
  method: 'POST',
  body: JSON.stringify(venta)
});
export const anularVenta = (id) => request(`/ventas/${id}/anular`, {
  method: 'PATCH'
});

export const getUsuarios = () => request('/usuarios');
export const crearUsuario = (usuario) => request('/usuarios', {
  method: 'POST',
  body: JSON.stringify(usuario)
});
export const getPerfil = () => request('/usuarios/perfil');
export const actualizarPerfil = (perfil) => request('/usuarios/perfil', {
  method: 'PUT',
  body: JSON.stringify(perfil)
});

export const getNotificaciones = (idUsuario = '') => {
  const query = idUsuario ? `?id_usuario=${encodeURIComponent(idUsuario)}` : '';
  return request(`/notificaciones${query}`);
};
export const crearNotificacion = (notificacion) => request('/notificaciones', {
  method: 'POST',
  body: JSON.stringify(notificacion)
});
export const actualizarEstadoNotificacion = (id, leida) => request(`/notificaciones/${id}/estado`, {
  method: 'PATCH',
  body: JSON.stringify({ leida })
});
export const eliminarNotificacion = (id) => request(`/notificaciones/${id}`, {
  method: 'DELETE'
});

export const guardarToken = (token) => {
  localStorage.setItem('botica_token', token);
};

export const limpiarToken = () => {
  localStorage.removeItem('botica_token');
};

export const tieneToken = () => Boolean(getToken());

export const login = (credenciales) => request('/usuarios/login', {
  method: 'POST',
  body: JSON.stringify(credenciales)
});

export const getReporteGeneral = () => request('/reportes/general');

export default {
  getProductos,
  getProducto,
  getProductosBajoStock,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  getCategorias,
  getCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  getProveedores,
  getProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  getClientes,
  getCliente,
  buscarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
  getVentas,
  getMovimientosVentas,
  getVenta,
  crearVenta,
  anularVenta,
  getUsuarios,
  crearUsuario,
  getPerfil,
  actualizarPerfil,
  getNotificaciones,
  crearNotificacion,
  actualizarEstadoNotificacion,
  eliminarNotificacion,
  guardarToken,
  limpiarToken,
  tieneToken,
  login,
  getReporteGeneral
};
