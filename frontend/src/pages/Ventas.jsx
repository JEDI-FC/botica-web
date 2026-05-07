import React, { useEffect, useMemo, useState } from 'react';
import {
  anularVenta,
  crearVenta,
  getClientes,
  getPerfil,
  getProductos,
  getVentas
} from '../services/api.js';

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarDatos = async () => {
    const [productosData, clientesData, ventasData, perfilData] = await Promise.all([
      getProductos(),
      getClientes(),
      getVentas(),
      getPerfil()
    ]);

    setProductos(productosData);
    setClientes(clientesData);
    setVentas(ventasData);
    setPerfil(perfilData);
  };

  useEffect(() => {
    cargarDatos().catch((err) => setError(err.message));
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos
      .filter((producto) => producto.stock > 0)
      .filter((producto) => {
        if (!texto) return true;
        return producto.nombre?.toLowerCase().includes(texto)
          || producto.codigo_barra?.toLowerCase().includes(texto);
      })
      .slice(0, 8);
  }, [busqueda, productos]);

  const total = useMemo(() => carrito.reduce((suma, item) => (
    suma + Number(item.precio_venta || 0) * Number(item.cantidad || 0)
  ), 0), [carrito]);

  const agregarProducto = (producto) => {
    setCarrito((items) => {
      const existente = items.find((item) => item.id_producto === producto.id_producto);

      if (existente) {
        return items.map((item) => (
          item.id_producto === producto.id_producto
            ? { ...item, cantidad: Math.min(item.cantidad + 1, producto.stock) }
            : item
        ));
      }

      return [...items, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (idProducto, cantidad) => {
    setCarrito((items) => items.map((item) => (
      item.id_producto === idProducto
        ? { ...item, cantidad: Math.max(1, Math.min(Number(cantidad || 1), item.stock)) }
        : item
    )));
  };

  const quitarProducto = (idProducto) => {
    setCarrito((items) => items.filter((item) => item.id_producto !== idProducto));
  };

  const registrarVenta = async (event) => {
    event.preventDefault();
    setMensaje('');
    setError('');

    if (carrito.length === 0) {
      setError('Agrega al menos un producto a la venta');
      return;
    }

    try {
      await crearVenta({
        id_cliente: idCliente || null,
        id_usuario: perfil.id_usuario,
        metodo_pago: metodoPago,
        detalles: carrito.map((item) => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad
        }))
      });

      setMensaje('Venta registrada correctamente');
      setCarrito([]);
      setIdCliente('');
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelarVenta = async (idVenta) => {
    setMensaje('');
    setError('');

    try {
      await anularVenta(idVenta);
      setMensaje('Venta anulada correctamente');
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Punto de venta</p>
          <h2>Registro de ventas</h2>
        </div>
      </section>

      {mensaje && <p className="notice success">{mensaje}</p>}
      {error && <p className="notice error">{error}</p>}

      <section className="sales-layout">
        <section className="panel">
          <div className="panel-header">
            <h3>Productos disponibles</h3>
            <input
              className="search"
              placeholder="Buscar producto"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
          </div>
          <div className="product-picker">
            {productosFiltrados.map((producto) => (
              <button
                key={producto.id_producto}
                type="button"
                className="product-option"
                onClick={() => agregarProducto(producto)}
              >
                <strong>{producto.nombre}</strong>
                <span>Stock {producto.stock} - S/ {Number(producto.precio_venta || 0).toFixed(2)}</span>
              </button>
            ))}
            {productosFiltrados.length === 0 && <p className="muted">No hay productos disponibles</p>}
          </div>
        </section>

        <form className="panel sale-card" onSubmit={registrarVenta}>
          <div className="panel-header">
            <h3>Detalle de venta</h3>
            <span>S/ {total.toFixed(2)}</span>
          </div>
          <label>
            Cliente
            <select value={idCliente} onChange={(event) => setIdCliente(event.target.value)}>
              <option value="">Cliente general</option>
              {clientes.map((cliente) => (
                <option key={cliente.id_cliente} value={cliente.id_cliente}>{cliente.nombre}</option>
              ))}
            </select>
          </label>
          <label>
            Metodo de pago
            <select value={metodoPago} onChange={(event) => setMetodoPago(event.target.value)}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </label>
          <div className="cart-list">
            {carrito.map((item) => (
              <div className="cart-item" key={item.id_producto}>
                <div>
                  <strong>{item.nombre}</strong>
                  <span>S/ {Number(item.precio_venta || 0).toFixed(2)}</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max={item.stock}
                  value={item.cantidad}
                  onChange={(event) => cambiarCantidad(item.id_producto, event.target.value)}
                />
                <button type="button" className="ghost" onClick={() => quitarProducto(item.id_producto)}>Quitar</button>
              </div>
            ))}
            {carrito.length === 0 && <p className="muted">Agrega productos para iniciar la venta</p>}
          </div>
          <button type="submit">Registrar venta</button>
        </form>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <h3>Ventas registradas</h3>
          <span>{ventas.length} ventas</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Venta</th>
                <th>Cliente</th>
                <th>Usuario</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((venta) => (
                <tr key={venta.id_venta}>
                  <td>
                    <strong>#{venta.id_venta}</strong>
                    <span>{new Date(venta.fecha_venta).toLocaleString('es-PE')}</span>
                  </td>
                  <td>{venta.cliente || 'Cliente general'}</td>
                  <td>{venta.usuario || '-'}</td>
                  <td>{venta.metodo_pago}</td>
                  <td>S/ {Number(venta.total || 0).toFixed(2)}</td>
                  <td>{venta.estado}</td>
                  <td>
                    {venta.estado === 'completada' ? (
                      <button type="button" className="ghost" onClick={() => cancelarVenta(venta.id_venta)}>
                        Anular
                      </button>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan="7">No hay ventas registradas</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Ventas;
