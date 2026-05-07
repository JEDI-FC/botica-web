import React, { useEffect, useMemo, useState } from 'react';
import {
  crearUsuario,
  getUsuarios
} from '../services/api.js';

const usuarioInicial = {
  nombre: '',
  usuario: '',
  correo: '',
  password: '',
  rol: 'vendedor'
};

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState(usuarioInicial);
  const [paso, setPaso] = useState(0);
  const [pasoMaximo, setPasoMaximo] = useState(0);
  const [busqueda, setBusqueda] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [wizardError, setWizardError] = useState('');

  const cargarUsuarios = async () => {
    const data = await getUsuarios();
    setUsuarios(data);
  };

  useEffect(() => {
    cargarUsuarios().catch((err) => setError(err.message));
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return usuarios;
    }

    return usuarios.filter((item) => (
      item.nombre?.toLowerCase().includes(texto)
      || item.usuario?.toLowerCase().includes(texto)
      || item.correo?.toLowerCase().includes(texto)
      || item.rol?.toLowerCase().includes(texto)
    ));
  }, [busqueda, usuarios]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje('');
    setError('');

    try {
      await crearUsuario(usuario);
      setUsuario(usuarioInicial);
      setPaso(0);
      setPasoMaximo(0);
      setWizardError('');
      setMensaje('Usuario creado correctamente');
      await cargarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  const validarPaso = (pasoActual = paso) => {
    if (pasoActual === 0 && !usuario.nombre.trim()) {
      return 'Ingresa el nombre del usuario para continuar.';
    }

    if (pasoActual === 1) {
      if (!usuario.usuario.trim()) {
        return 'Ingresa el nombre de usuario de acceso.';
      }

      if (!usuario.password || usuario.password.length < 6) {
        return 'La password debe tener al menos 6 caracteres.';
      }
    }

    if (pasoActual === 2 && !usuario.rol) {
      return 'Selecciona un rol para el usuario.';
    }

    return '';
  };

  const irAPaso = (nuevoPaso) => {
    if (nuevoPaso <= pasoMaximo) {
      setWizardError('');
      setPaso(nuevoPaso);
      return;
    }

    setWizardError('Completa el paso actual antes de avanzar.');
  };

  const avanzar = () => {
    const errorPaso = validarPaso();

    if (errorPaso) {
      setWizardError(errorPaso);
      return;
    }

    const siguientePaso = paso + 1;
    setWizardError('');
    setPaso(siguientePaso);
    setPasoMaximo(Math.max(pasoMaximo, siguientePaso));
  };

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Administracion</p>
          <h2>Usuarios del sistema</h2>
        </div>
      </section>

      {mensaje && <p className="notice success">{mensaje}</p>}
      {error && <p className="notice error">{error}</p>}

      <section className="inventory-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-title">
            <h3>Nuevo usuario</h3>
          </div>

          <div className="wizard wide">
            {['Datos', 'Acceso', 'Permisos', 'Confirmar'].map((item, index) => (
              <button
                key={item}
                type="button"
                className={[
                  paso === index ? 'active' : '',
                  pasoMaximo > index ? 'complete' : '',
                  pasoMaximo < index ? 'locked' : ''
                ].filter(Boolean).join(' ')}
                onClick={() => irAPaso(index)}
              >
                <strong>{index + 1}</strong>
                <span>{item}</span>
              </button>
            ))}
          </div>
          {wizardError && <p className="wizard-message wide">{wizardError}</p>}

          {paso === 0 && (
            <div className="wizard-content wide form-grid">
              <label>
                Nombre
                <input value={usuario.nombre} onChange={(event) => setUsuario({ ...usuario, nombre: event.target.value })} required />
              </label>
              <label>
                Correo
                <input type="email" value={usuario.correo} onChange={(event) => setUsuario({ ...usuario, correo: event.target.value })} />
              </label>
            </div>
          )}

          {paso === 1 && (
            <div className="wizard-content wide form-grid">
              <label>
                Usuario
                <input value={usuario.usuario} onChange={(event) => setUsuario({ ...usuario, usuario: event.target.value })} required />
              </label>
              <label>
                Password
                <input type="password" value={usuario.password} onChange={(event) => setUsuario({ ...usuario, password: event.target.value })} required />
              </label>
            </div>
          )}

          {paso === 2 && (
            <div className="wizard-content wide form-grid">
              <label>
                Rol
                <select value={usuario.rol} onChange={(event) => setUsuario({ ...usuario, rol: event.target.value })}>
                  <option value="vendedor">Vendedor</option>
                  <option value="admin">Administrador</option>
                </select>
              </label>
              <div className="permission-note">
                <strong>Permisos</strong>
                <span>Administrador: puede crear usuarios y administrar todos los modulos.</span>
                <span>Vendedor: puede crear productos, clientes, ventas y gestionar operaciones del sistema.</span>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="wizard-review wide">
              <strong>{usuario.nombre || 'Usuario sin nombre'}</strong>
              <span>Usuario: {usuario.usuario || '-'}</span>
              <span>Correo: {usuario.correo || '-'}</span>
              <span>Rol: {usuario.rol}</span>
            </div>
          )}

          <div className="wizard-actions wide">
            <button type="button" className="ghost" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>
              Anterior
            </button>
            {paso < 3 ? (
              <button type="button" onClick={avanzar}>
                Siguiente
              </button>
            ) : (
              <button type="submit">Crear usuario</button>
            )}
          </div>
        </form>

        <section className="panel">
          <div className="panel-header">
            <h3>Roles</h3>
          </div>
          <ul className="compact-list">
            <li>
              <span>Administradores</span>
              <strong>{usuarios.filter((item) => item.rol === 'admin').length}</strong>
            </li>
            <li>
              <span>Vendedores</span>
              <strong>{usuarios.filter((item) => item.rol === 'vendedor').length}</strong>
            </li>
          </ul>
        </section>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <h3>Usuarios registrados</h3>
          <input
            className="search"
            placeholder="Buscar usuario"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((item) => (
                <tr key={item.id_usuario}>
                  <td>
                    <strong>{item.nombre}</strong>
                    <span>{item.usuario}</span>
                  </td>
                  <td>{item.correo || '-'}</td>
                  <td>{item.rol}</td>
                  <td>{item.estado}</td>
                </tr>
              ))}
              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="4">No hay usuarios para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Usuarios;
