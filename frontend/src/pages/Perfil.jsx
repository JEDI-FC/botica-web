import React, { useEffect, useState } from 'react';
import { actualizarPerfil, getPerfil } from '../services/api.js';

function Perfil() {
  const [perfil, setPerfil] = useState({
    nombre: '',
    usuario: '',
    correo: '',
    rol: '',
    password: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getPerfil()
      .then((data) => setPerfil({ ...data, password: '' }))
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensaje('');
    setError('');

    try {
      await actualizarPerfil({
        nombre: perfil.nombre,
        correo: perfil.correo,
        password: perfil.password
      });
      setPerfil({ ...perfil, password: '' });
      setMensaje('Perfil actualizado');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Cuenta</p>
          <h2>Mi perfil</h2>
        </div>
      </section>

      {mensaje && <p className="notice success">{mensaje}</p>}
      {error && <p className="notice error">{error}</p>}

      <section className="profile-layout">
        <form className="panel form-grid" onSubmit={handleSubmit}>
          <div className="panel-title">
            <h3>Datos personales</h3>
          </div>
          <label>
            Nombre
            <input value={perfil.nombre || ''} onChange={(event) => setPerfil({ ...perfil, nombre: event.target.value })} required />
          </label>
          <label>
            Usuario
            <input value={perfil.usuario || ''} disabled />
          </label>
          <label>
            Correo
            <input type="email" value={perfil.correo || ''} onChange={(event) => setPerfil({ ...perfil, correo: event.target.value })} />
          </label>
          <label>
            Rol
            <input value={perfil.rol || ''} disabled />
          </label>
          <label className="wide">
            Nueva password
            <input
              type="password"
              value={perfil.password}
              onChange={(event) => setPerfil({ ...perfil, password: event.target.value })}
              placeholder="Dejar en blanco para mantener la actual"
            />
          </label>
          <button className="wide" type="submit">Actualizar perfil</button>
        </form>

        <aside className="panel profile-card">
          <div className="brand-mark" aria-hidden="true">
            {(perfil.nombre || 'U').slice(0, 2).toUpperCase()}
          </div>
          <h3>{perfil.nombre || 'Usuario'}</h3>
          <span>{perfil.usuario}</span>
          <p>{perfil.rol}</p>
        </aside>
      </section>
    </main>
  );
}

export default Perfil;
