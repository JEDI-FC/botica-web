import React, { useEffect, useState } from 'react';
import { getReporteGeneral } from '../services/api.js';

const fechaReporte = () => new Date().toLocaleString('es-PE');

const descargarArchivo = (contenido, nombre, tipo) => {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
};

const construirTablaHtml = (titulo, columnas, filas) => `
  <h2>${titulo}</h2>
  <table>
    <thead>
      <tr>${columnas.map((columna) => `<th>${columna}</th>`).join('')}</tr>
    </thead>
    <tbody>
      ${filas.map((fila) => `
        <tr>${fila.map((valor) => `<td>${valor ?? ''}</td>`).join('')}</tr>
      `).join('')}
    </tbody>
  </table>
`;

function Reportes() {
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getReporteGeneral()
      .then(setReporte)
      .catch((err) => setError(err.message));
  }, []);

  const resumen = reporte?.resumen || {};
  const ventasRecientes = reporte?.ventas_recientes || [];
  const productosMasVendidos = reporte?.productos_mas_vendidos || [];

  const construirReporteHtml = () => {
    const resumenFilas = [
      ['Ventas', resumen.ventas || 0],
      ['Monto vendido', `S/ ${Number(resumen.monto_ventas || 0).toFixed(2)}`],
      ['Productos', resumen.productos || 0],
      ['Clientes', resumen.clientes || 0],
      ['Productos bajo stock', resumen.bajo_stock || 0]
    ];

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Reporte Botica Nova Salud</title>
          <style>
            body { font-family: Arial, sans-serif; color: #17211d; margin: 28px; }
            h1 { margin: 0 0 6px; }
            p { color: #667872; margin: 0 0 20px; }
            h2 { margin-top: 24px; font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #dfe8e4; padding: 8px; text-align: left; }
            th { background: #e1f3ed; }
          </style>
        </head>
        <body>
          <h1>Reporte general - Botica Nova Salud</h1>
          <p>Generado: ${fechaReporte()}</p>
          ${construirTablaHtml('Resumen', ['Indicador', 'Valor'], resumenFilas)}
          ${construirTablaHtml(
            'Productos mas vendidos',
            ['Producto', 'Cantidad vendida', 'Total vendido'],
            productosMasVendidos.map((item) => [
              item.nombre,
              item.cantidad_vendida,
              `S/ ${Number(item.total_vendido || 0).toFixed(2)}`
            ])
          )}
          ${construirTablaHtml(
            'Ventas recientes',
            ['ID', 'Fecha', 'Cliente', 'Usuario', 'Metodo', 'Total'],
            ventasRecientes.map((item) => [
              item.id_venta,
              item.fecha_venta,
              item.cliente || 'Cliente general',
              item.usuario || '-',
              item.metodo_pago,
              `S/ ${Number(item.total || 0).toFixed(2)}`
            ])
          )}
        </body>
      </html>
    `;
  };

  const exportarExcel = () => {
    if (!reporte) return;

    descargarArchivo(
      construirReporteHtml(),
      `reporte-botica-nova-salud-${Date.now()}.xls`,
      'application/vnd.ms-excel;charset=utf-8'
    );
  };

  const exportarPdf = () => {
    if (!reporte) return;

    const ventana = window.open('', '_blank');
    ventana.document.write(construirReporteHtml());
    ventana.document.close();
    ventana.focus();
    ventana.print();
  };

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Analisis</p>
          <h2>Reportes del negocio</h2>
        </div>
        <div className="export-actions">
          <button type="button" onClick={exportarPdf} disabled={!reporte}>
            Generar PDF
          </button>
          <button type="button" onClick={exportarExcel} disabled={!reporte}>
            Exportar Excel
          </button>
        </div>
      </section>

      {error && <p className="notice error">{error}</p>}

      <section className="summary">
        <article>
          <small aria-hidden="true">V</small>
          <span>Ventas</span>
          <strong>{resumen.ventas || 0}</strong>
        </article>
        <article>
          <small aria-hidden="true">S</small>
          <span>Monto vendido</span>
          <strong>S/ {Number(resumen.monto_ventas || 0).toFixed(2)}</strong>
        </article>
        <article>
          <small aria-hidden="true">P</small>
          <span>Productos</span>
          <strong>{resumen.productos || 0}</strong>
        </article>
        <article>
          <small aria-hidden="true">!</small>
          <span>Bajo stock</span>
          <strong>{resumen.bajo_stock || 0}</strong>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-header">
            <h3>Productos mas vendidos</h3>
          </div>
          <ul className="compact-list">
            {productosMasVendidos.map((item) => (
              <li key={item.id_producto}>
                <span>{item.nombre}</span>
                <strong>{item.cantidad_vendida} und.</strong>
              </li>
            ))}
            {!productosMasVendidos.length && <li>Sin ventas registradas</li>}
          </ul>
        </article>

        <article className="panel">
          <div className="panel-header">
            <h3>Ventas recientes</h3>
          </div>
          <ul className="compact-list">
            {ventasRecientes.map((item) => (
              <li key={item.id_venta}>
                <span>{item.cliente || 'Cliente general'}</span>
                <strong>S/ {Number(item.total || 0).toFixed(2)}</strong>
              </li>
            ))}
            {!ventasRecientes.length && <li>Sin ventas recientes</li>}
          </ul>
        </article>
      </section>
    </main>
  );
}

export default Reportes;
