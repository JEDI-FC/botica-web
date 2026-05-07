import React from 'react';

function Navbar({ vista, onVistaChange, onLogout }) {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="nav-logo" aria-hidden="true">NS</div>
        <div>
          <h1>Botica Nova Salud</h1>
          <span>Sistema de gestion</span>
        </div>
      </div>
      <nav className="nav-actions" aria-label="Principal">
        <button
          className={vista === 'dashboard' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('dashboard')}
        >
          <span aria-hidden="true">D</span>
          Dashboard
        </button>
        <button
          className={vista === 'inventario' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('inventario')}
        >
          <span aria-hidden="true">I</span>
          Inventario
        </button>
        <button
          className={vista === 'ventas' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('ventas')}
        >
          <span aria-hidden="true">V</span>
          Ventas
        </button>
        <button
          className={vista === 'movimientos' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('movimientos')}
        >
          <span aria-hidden="true">O</span>
          Movimientos
        </button>
        <button
          className={vista === 'notificaciones' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('notificaciones')}
        >
          <span aria-hidden="true">N</span>
          Notificaciones
        </button>
        <button
          className={vista === 'clientes' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('clientes')}
        >
          <span aria-hidden="true">C</span>
          Clientes
        </button>
        <button
          className={vista === 'reportes' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('reportes')}
        >
          <span aria-hidden="true">R</span>
          Reportes
        </button>
        <button
          className={vista === 'perfil' ? 'active' : ''}
          type="button"
          onClick={() => onVistaChange('perfil')}
        >
          <span aria-hidden="true">M</span>
          Mi perfil
        </button>
        <button type="button" onClick={onLogout}>
          <span aria-hidden="true">S</span>
          Salir
        </button>
      </nav>
    </header>
  );
}

export default Navbar;
