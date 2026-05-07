import React, { useEffect, useMemo, useState } from 'react';
import {
  actualizarCliente,
  crearCliente,
  eliminarCliente,
  getClientes
} from '../services/api.js';

const clienteInicial = {
  nombre: '',
  dni: '',
  telefono: '',
  correo: '',
  direccion: ''
};

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cliente, setCliente] = useState(clienteInicial);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const cargarClientes = async () => {
    const data = await getClientes();
    setClientes(data);
  };

  useEffect(() => {
    cargarClientes().catch((err) => setError(err.message));
  }, []);

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return clientes;

    return clientes.filter((item) => (
      item.nombre?.toLowerCase().includes(texto)
      || item.dni?.toLowerCase().includes(texto)
      || item.telefono?.toLowerCase().includes(texto)
      || item.correo?.toLowerCase().includes(texto)
    ));
  }, [busqueda, clientes]);

  const ejecutar = async (accion) => {
    setMensaje('');
    setError('');

    try {
      await accion();
      await cargarClientes();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    ejecutar(async () => {
      if (clienteEditando) {
        await actualizarCliente(clienteEditando, cliente);
        setMensaje('Cliente actualizado');
      } else {
        await crearCliente(cliente);
        setMensaje('Cliente registrado');
      }

      setCliente(clienteInicial);
      setClienteEditando(null);
    });
  };

  const editar = (item) => {
    setClienteEditando(item.id_cliente);
    setCliente({
      nombre: item.nombre || '',
      dni: item.dni || '',
      telefono: item.telefono || '',
      correo: item.correo || '',
      direccion: item.direccion || ''
    });
  };

  const borrar = (id) => {
    ejecutar(async () => {
      await eliminarCliente(id);
      setMensaje('Cliente eliminado');
    });
  };

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Atencion al cliente</p>
          <h2>Administrador de clientes</h2>
        </div>
      </section>

      {mensaje && <p className="notice success">{mensaje}</p>}
      {error && <p className="notice error">{error}</p>}

      <section className="inventory-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-title">
            <h3>{clienteEditando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
            {clienteEditando && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setCliente(clienteInicial);
                  setClienteEditando(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
          <label>
            Nombre
            <input value={cliente.nombre} onChange={(event) => setCliente({ ...cliente, nombre: event.target.value })} required />
          </label>
          <label>
            DNI
            <input value={cliente.dni} onChange={(event) => setCliente({ ...cliente, dni: event.target.value })} />
          </label>
          <label>
            Telefono
            <input value={cliente.telefono} onChange={(event) => setCliente({ ...cliente, telefono: event.target.value })} />
          </label>
          <label>
            Correo
            <input type="email" value={cliente.correo} onChange={(event) => setCliente({ ...cliente, correo: event.target.value })} />
          </label>
          <label className="wide">
            Direccion
            <input value={cliente.direccion} onChange={(event) => setCliente({ ...cliente, direccion: event.target.value })} />
          </label>
          <button className="wide" type="submit">
            {clienteEditando ? 'Guardar cambios' : 'Registrar cliente'}
          </button>
        </form>

        <section className="panel">
          <div className="panel-header">
            <h3>Resumen</h3>
            <span>{clientes.length} clientes</span>
          </div>
          <ul className="compact-list">
            {clientes.slice(0, 6).map((item) => (
              <li key={item.id_cliente}>
                <span>{item.nombre}</span>
                <strong>{item.telefono || '-'}</strong>
              </li>
            ))}
          </ul>
        </section>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <h3>Clientes registrados</h3>
          <input className="search" placeholder="Buscar cliente" value={busqueda} onChange={(event) => setBusqueda(event.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>DNI</th>
                <th>Telefono</th>
                <th>Correo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientesFiltrados.map((item) => (
                <tr key={item.id_cliente}>
                  <td>
                    <strong>{item.nombre}</strong>
                    <span>{item.direccion || 'Sin direccion'}</span>
                  </td>
                  <td>{item.dni || '-'}</td>
                  <td>{item.telefono || '-'}</td>
                  <td>{item.correo || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => editar(item)}>Editar</button>
                      <button type="button" onClick={() => borrar(item.id_cliente)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {clientesFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5">No hay clientes para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Clientes;
