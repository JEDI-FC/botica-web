import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Inventario from './pages/Inventario.jsx';
import Notificaciones from './pages/Notificaciones.jsx';
import Clientes from './pages/Clientes.jsx';
import Ventas from './pages/Ventas.jsx';
import Movimientos from './pages/Movimientos.jsx';
import Reportes from './pages/Reportes.jsx';
import Perfil from './pages/Perfil.jsx';
import Usuarios from './pages/Usuarios.jsx';
import {
  guardarToken,
  getPerfil,
  limpiarToken,
  login,
  tieneToken
} from './services/api.js';

function App() {
  const [vista, setVista] = useState('dashboard');
  const [autenticado, setAutenticado] = useState(tieneToken());
  const [usuarioActual, setUsuarioActual] = useState(() => {
    const usuarioGuardado = localStorage.getItem('botica_usuario');
    return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
  });
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!autenticado) {
      return;
    }

    getPerfil()
      .then((perfil) => {
        localStorage.setItem('botica_usuario', JSON.stringify(perfil));
        setUsuarioActual(perfil);
      })
      .catch(() => {
        limpiarToken();
        localStorage.removeItem('botica_usuario');
        setUsuarioActual(null);
        setAutenticado(false);
      });
  }, [autenticado]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const data = await login(credenciales);
      guardarToken(data.token);
      localStorage.setItem('botica_usuario', JSON.stringify(data.usuario));
      setUsuarioActual(data.usuario);
      setAutenticado(true);
      setCredenciales({ usuario: '', password: '' });
    } catch (err) {
      setError(err.message);
    }
  };

  const cerrarSesion = () => {
    limpiarToken();
    localStorage.removeItem('botica_usuario');
    setUsuarioActual(null);
    setAutenticado(false);
    setVista('dashboard');
  };

  if (!autenticado) {
    return (
      <main className="login-page">
        <form className="login-card" onSubmit={handleLogin}>
          <div className="brand-mark" aria-hidden="true">NS</div>
          <div>
            <p>Botica Nova Salud</p>
            <h1>Ingreso al sistema</h1>
            <span>Gestion segura de inventario y ventas</span>
          </div>
          {error && <span className="notice error">{error}</span>}
          <label>
            Usuario
            <input
              value={credenciales.usuario}
              onChange={(event) => setCredenciales({ ...credenciales, usuario: event.target.value })}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={credenciales.password}
              onChange={(event) => setCredenciales({ ...credenciales, password: event.target.value })}
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit">Ingresar al panel</button>
        </form>
      </main>
    );
  }

  return (
    <>
      <Navbar
        vista={vista}
        onVistaChange={setVista}
        onLogout={cerrarSesion}
        usuario={usuarioActual}
      />
      {vista === 'dashboard' && <Dashboard onVistaChange={setVista} />}
      {vista === 'inventario' && <Inventario />}
      {vista === 'ventas' && <Ventas />}
      {vista === 'movimientos' && <Movimientos />}
      {vista === 'clientes' && <Clientes />}
      {vista === 'reportes' && <Reportes />}
      {vista === 'usuarios' && usuarioActual?.rol === 'admin' && <Usuarios />}
      {vista === 'notificaciones' && <Notificaciones />}
      {vista === 'perfil' && <Perfil />}
    </>
  );
}

export default App;
