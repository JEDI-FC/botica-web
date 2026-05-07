import React, { useEffect, useMemo, useState } from 'react';
import { getMovimientosVentas } from '../services/api.js';

const formatearFecha = (fecha) => new Date(fecha).toLocaleString('es-PE');

function Movimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [usuario, setUsuario] = useState('');
  const [estado, setEstado] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getMovimientosVentas()
      .then(setMovimientos)
      .catch((err) => setError(err.message));
  }, []);

  const usuarios = useMemo(() => {
    const mapa = new Map();

    movimientos.forEach((movimiento) => {
      if (movimiento.id_usuario) {
        mapa.set(String(movimiento.id_usuario), movimiento.usuario || movimiento.usuario_login);
      }
    });

    return Array.from(mapa, ([id, nombre]) => ({ id, nombre }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [movimientos]);

  const movimientosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return movimientos.filter((movimiento) => {
      const coincideUsuario = !usuario || String(movimiento.id_usuario) === usuario;
      const coincideEstado = !estado || movimiento.estado === estado;
      const coincideTexto = !texto
        || movimiento.cliente?.toLowerCase().includes(texto)
        || movimiento.usuario?.toLowerCase().includes(texto)
        || movimiento.usuario_login?.toLowerCase().includes(texto)
        || movimiento.productos?.toLowerCase().includes(texto)
        || String(movimiento.id_venta).includes(texto);

      return coincideUsuario && coincideEstado && coincideTexto;
    });
  }, [busqueda, estado, movimientos, usuario]);

  const resumen = useMemo(() => {
    const completadas = movimientosFiltrados.filter((movimiento) => movimiento.estado === 'completada');

    return {
      cantidad: movimientosFiltrados.length,
      completadas: completadas.length,
      anuladas: movimientosFiltrados.filter((movimiento) => movimiento.estado === 'anulada').length,
      total: completadas.reduce((suma, movimiento) => suma + Number(movimiento.total || 0), 0)
    };
  }, [movimientosFiltrados]);

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Control de operaciones</p>
          <h2>Movimientos de ventas</h2>
        </div>
      </section>

      {error && <p className="notice error">{error}</p>}

      <section className="summary">
        <article>
          <small aria-hidden="true">M</small>
          <span>Movimientos</span>
          <strong>{resumen.cantidad}</strong>
        </article>
        <article>
          <small aria-hidden="true">V</small>
          <span>Ventas completadas</span>
          <strong>{resumen.completadas}</strong>
        </article>
        <article>
          <small aria-hidden="true">A</small>
          <span>Ventas anuladas</span>
          <strong>{resumen.anuladas}</strong>
        </article>
        <article>
          <small aria-hidden="true">S</small>
          <span>Monto completado</span>
          <strong>S/ {resumen.total.toFixed(2)}</strong>
        </article>
      </section>

      <section className="panel movement-filters">
        <input
          className="search"
          placeholder="Buscar por venta, usuario, cliente o producto"
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
        />
        <select value={usuario} onChange={(event) => setUsuario(event.target.value)}>
          <option value="">Todos los usuarios</option>
          {usuarios.map((item) => (
            <option key={item.id} value={item.id}>{item.nombre}</option>
          ))}
        </select>
        <select value={estado} onChange={(event) => setEstado(event.target.value)}>
          <option value="">Todos los estados</option>
          <option value="completada">Completada</option>
          <option value="anulada">Anulada</option>
        </select>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <h3>Historial de movimientos</h3>
          <span>{movimientosFiltrados.length} registros</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Venta</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {movimientosFiltrados.map((movimiento) => (
                <tr key={movimiento.id_venta}>
                  <td><strong>#{movimiento.id_venta}</strong></td>
                  <td>{formatearFecha(movimiento.fecha_venta)}</td>
                  <td>
                    <strong>{movimiento.usuario || 'Sin usuario'}</strong>
                    <span>{movimiento.usuario_login || movimiento.usuario_rol || '-'}</span>
                  </td>
                  <td>{movimiento.cliente || 'Cliente general'}</td>
                  <td>{movimiento.productos || '-'}</td>
                  <td>{movimiento.metodo_pago}</td>
                  <td>S/ {Number(movimiento.total || 0).toFixed(2)}</td>
                  <td>{movimiento.estado}</td>
                </tr>
              ))}
              {movimientosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="8">No hay movimientos para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Movimientos;
