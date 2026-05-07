import React, { useEffect, useMemo, useState } from 'react';
import {
  actualizarEstadoNotificacion,
  crearNotificacion,
  eliminarNotificacion,
  getNotificaciones,
  getUsuarios
} from '../services/api.js';

const notificacionInicial = {
  id_usuario: '',
  titulo: '',
  mensaje: '',
  tipo: 'sistema'
};

function Notificaciones() {
  const [usuarios, setUsuarios] = useState([]);
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [notificacion, setNotificacion] = useState(notificacionInicial);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarDatos = async (idUsuario = filtroUsuario) => {
    const [usuariosData, notificacionesData] = await Promise.all([
      getUsuarios(),
      getNotificaciones(idUsuario)
    ]);

    setUsuarios(usuariosData);
    setNotificaciones(notificacionesData);
  };

  useEffect(() => {
    cargarDatos().catch((err) => setError(err.message));
  }, []);

  const resumen = useMemo(() => {
    const noLeidas = notificaciones.filter((item) => !item.leida).length;
    return {
      total: notificaciones.length,
      noLeidas,
      leidas: notificaciones.length - noLeidas
    };
  }, [notificaciones]);

  const ejecutar = async (accion) => {
    setMensaje('');
    setError('');

    try {
      await accion();
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFiltroUsuario = async (event) => {
    const idUsuario = event.target.value;
    setFiltroUsuario(idUsuario);
    setError('');

    try {
      const data = await getNotificaciones(idUsuario);
      setNotificaciones(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    ejecutar(async () => {
      await crearNotificacion(notificacion);
      setNotificacion(notificacionInicial);
      setMensaje('Notificacion registrada');
    });
  };

  const cambiarEstado = (id, leida) => {
    ejecutar(async () => {
      await actualizarEstadoNotificacion(id, leida);
      setMensaje('Estado actualizado');
    });
  };

  const borrar = (id) => {
    ejecutar(async () => {
      await eliminarNotificacion(id);
      setMensaje('Notificacion eliminada');
    });
  };

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Usuarios</p>
          <h2>Administracion de notificaciones</h2>
        </div>
      </section>

      {mensaje && <p className="notice success">{mensaje}</p>}
      {error && <p className="notice error">{error}</p>}

      <section className="summary">
        <article>
          <small aria-hidden="true">T</small>
          <span>Total</span>
          <strong>{resumen.total}</strong>
        </article>
        <article>
          <small aria-hidden="true">N</small>
          <span>No leidas</span>
          <strong>{resumen.noLeidas}</strong>
        </article>
        <article>
          <small aria-hidden="true">L</small>
          <span>Leidas</span>
          <strong>{resumen.leidas}</strong>
        </article>
      </section>

      <section className="notifications-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-title">
            <h3>Nueva notificacion</h3>
          </div>
          <label>
            Usuario
            <select
              value={notificacion.id_usuario}
              onChange={(event) => setNotificacion({ ...notificacion, id_usuario: event.target.value })}
              required
            >
              <option value="">Seleccionar usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre} ({usuario.usuario})
                </option>
              ))}
            </select>
          </label>
          <label>
            Tipo
            <select
              value={notificacion.tipo}
              onChange={(event) => setNotificacion({ ...notificacion, tipo: event.target.value })}
            >
              <option value="sistema">Sistema</option>
              <option value="stock">Stock</option>
              <option value="venta">Venta</option>
              <option value="cliente">Cliente</option>
            </select>
          </label>
          <label className="wide">
            Titulo
            <input
              value={notificacion.titulo}
              onChange={(event) => setNotificacion({ ...notificacion, titulo: event.target.value })}
              required
            />
          </label>
          <label className="wide">
            Mensaje
            <textarea
              rows="4"
              value={notificacion.mensaje}
              onChange={(event) => setNotificacion({ ...notificacion, mensaje: event.target.value })}
              required
            />
          </label>
          <button className="wide" type="submit">Enviar notificacion</button>
        </form>

        <section className="panel table-panel">
          <div className="panel-header">
            <h3>Notificaciones</h3>
            <select className="search" value={filtroUsuario} onChange={handleFiltroUsuario}>
              <option value="">Todos los usuarios</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id_usuario} value={usuario.id_usuario}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Notificacion</th>
                  <th>Usuario</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {notificaciones.map((item) => (
                  <tr key={item.id_notificacion} className={!item.leida ? 'row-warning' : ''}>
                    <td>
                      <strong>{item.titulo}</strong>
                      <span>{item.mensaje}</span>
                    </td>
                    <td>{item.usuario_nombre}</td>
                    <td>
                      <span className={`type-pill type-${item.tipo}`}>{item.tipo}</span>
                    </td>
                    <td>{item.leida ? 'Leida' : 'No leida'}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" onClick={() => cambiarEstado(item.id_notificacion, !item.leida)}>
                          {item.leida ? 'No leida' : 'Leida'}
                        </button>
                        <button type="button" onClick={() => borrar(item.id_notificacion)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {notificaciones.length === 0 && (
                  <tr>
                    <td colSpan="5">No hay notificaciones para mostrar</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </main>
  );
}

export default Notificaciones;
