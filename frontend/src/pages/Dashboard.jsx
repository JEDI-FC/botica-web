import React, { useEffect, useMemo, useState } from 'react';
import {
  getCategorias,
  getProductos,
  getProductosBajoStock,
  getProveedores
} from '../services/api.js';

function Dashboard({ onVistaChange }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [productosData, categoriasData, proveedoresData, alertasData] = await Promise.all([
          getProductos(),
          getCategorias(),
          getProveedores(),
          getProductosBajoStock()
        ]);

        setProductos(productosData);
        setCategorias(categoriasData);
        setProveedores(proveedoresData);
        setAlertas(alertasData.productos || []);
      } catch (err) {
        setError(err.message);
      }
    };

    cargarDatos();
  }, []);

  const valorInventario = useMemo(() => (
    productos.reduce((total, producto) => (
      total + Number(producto.precio_venta || 0) * Number(producto.stock || 0)
    ), 0)
  ), [productos]);

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Inventario general</p>
          <h2>Panel de control</h2>
        </div>
        <button type="button" onClick={() => onVistaChange('inventario')}>
          Gestionar inventario
        </button>
      </section>

      {error && <p className="notice error">{error}</p>}

      {alertas.length > 0 && (
        <section className="stock-alert-banner">
          <div>
            <strong>Reposicion urgente</strong>
            <span>
              {alertas.length} producto{alertas.length === 1 ? '' : 's'} requiere{alertas.length === 1 ? '' : 'n'} atencion.
            </span>
          </div>
          <ul>
            {alertas.slice(0, 3).map((producto) => (
              <li key={producto.id_producto}>
                {producto.nombre}: {producto.stock}/{producto.stock_minimo}
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => onVistaChange('inventario')}>
            Revisar stock
          </button>
        </section>
      )}

      <section className="summary">
        <article>
          <small aria-hidden="true">P</small>
          <span>Productos activos</span>
          <strong>{productos.length}</strong>
        </article>
        <article>
          <small aria-hidden="true">!</small>
          <span>Bajo stock</span>
          <strong>{alertas.length}</strong>
        </article>
        <article>
          <small aria-hidden="true">C</small>
          <span>Categorias</span>
          <strong>{categorias.length}</strong>
        </article>
        <article>
          <small aria-hidden="true">R</small>
          <span>Proveedores</span>
          <strong>{proveedores.length}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <h3>Valor estimado</h3>
            <span>S/ {valorInventario.toFixed(2)}</span>
          </div>
          <div className="stock-meter">
            <div style={{ width: `${Math.min(productos.length * 8, 100)}%` }} />
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h3>Reposicion</h3>
            <span>{alertas.length} alertas</span>
          </div>
          <ul className="compact-list">
            {alertas.slice(0, 5).map((producto) => (
              <li key={producto.id_producto}>
                <span>{producto.nombre}</span>
                <strong>{producto.stock}/{producto.stock_minimo}</strong>
              </li>
            ))}
            {alertas.length === 0 && <li>Sin productos por reponer</li>}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default Dashboard;
