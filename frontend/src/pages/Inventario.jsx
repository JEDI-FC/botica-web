import React, { useEffect, useMemo, useState } from 'react';
import {
  actualizarProducto,
  crearCategoria,
  crearProducto,
  crearProveedor,
  eliminarProducto,
  getCategorias,
  getProductos,
  getProductosBajoStock,
  getProveedores
} from '../services/api.js';

const productoInicial = {
  nombre: '',
  descripcion: '',
  codigo_barra: '',
  precio_compra: '',
  precio_venta: '',
  stock: '',
  stock_minimo: '5',
  fecha_vencimiento: '',
  id_categoria: '',
  id_proveedor: ''
};

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [producto, setProducto] = useState(productoInicial);
  const [productoEditando, setProductoEditando] = useState(null);
  const [categoria, setCategoria] = useState({ nombre: '', descripcion: '' });
  const [proveedor, setProveedor] = useState({
    nombre: '',
    ruc: '',
    telefono: '',
    correo: '',
    direccion: ''
  });
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const cargarDatos = async () => {
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
  };

  useEffect(() => {
    cargarDatos().catch((err) => setError(err.message));
  }, []);

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return productos;
    }

    return productos.filter((item) => (
      item.nombre?.toLowerCase().includes(texto)
      || item.codigo_barra?.toLowerCase().includes(texto)
      || item.categoria?.toLowerCase().includes(texto)
      || item.proveedor?.toLowerCase().includes(texto)
    ));
  }, [busqueda, productos]);

  const mostrarResultado = async (accion) => {
    setError('');
    setMensaje('');

    try {
      await accion();
      await cargarDatos();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProductoSubmit = (event) => {
    event.preventDefault();

    mostrarResultado(async () => {
      const payload = {
        ...producto,
        precio_compra: Number(producto.precio_compra || 0),
        precio_venta: Number(producto.precio_venta || 0),
        stock: Number(producto.stock || 0),
        stock_minimo: Number(producto.stock_minimo || 0),
        id_categoria: producto.id_categoria || null,
        id_proveedor: producto.id_proveedor || null,
        fecha_vencimiento: producto.fecha_vencimiento || null
      };

      if (productoEditando) {
        await actualizarProducto(productoEditando, payload);
        setMensaje('Producto actualizado');
      } else {
        await crearProducto(payload);
        setMensaje('Producto registrado');
      }

      setProducto(productoInicial);
      setProductoEditando(null);
    });
  };

  const handleCategoriaSubmit = (event) => {
    event.preventDefault();

    mostrarResultado(async () => {
      await crearCategoria(categoria);
      setCategoria({ nombre: '', descripcion: '' });
      setMensaje('Categoria registrada');
    });
  };

  const handleProveedorSubmit = (event) => {
    event.preventDefault();

    mostrarResultado(async () => {
      await crearProveedor(proveedor);
      setProveedor({ nombre: '', ruc: '', telefono: '', correo: '', direccion: '' });
      setMensaje('Proveedor registrado');
    });
  };

  const editarProducto = (item) => {
    setProductoEditando(item.id_producto);
    setProducto({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      codigo_barra: item.codigo_barra || '',
      precio_compra: item.precio_compra || '',
      precio_venta: item.precio_venta || '',
      stock: item.stock || '',
      stock_minimo: item.stock_minimo || '5',
      fecha_vencimiento: item.fecha_vencimiento?.slice(0, 10) || '',
      id_categoria: item.id_categoria || '',
      id_proveedor: item.id_proveedor || ''
    });
  };

  const desactivarProducto = (id) => {
    mostrarResultado(async () => {
      await eliminarProducto(id);
      setMensaje('Producto desactivado');
    });
  };

  return (
    <main className="page">
      <section className="page-heading">
        <div>
          <p>Inventario</p>
          <h2>Productos, categorias y proveedores</h2>
        </div>
      </section>

      {mensaje && <p className="notice success">{mensaje}</p>}
      {error && <p className="notice error">{error}</p>}

      <section className="summary">
        <article>
          <small aria-hidden="true">P</small>
          <span>Productos</span>
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

      <section className="inventory-layout">
        <form className="panel form-grid" onSubmit={handleProductoSubmit}>
          <div className="panel-title">
            <h3>{productoEditando ? 'Editar producto' : 'Nuevo producto'}</h3>
            {productoEditando && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setProducto(productoInicial);
                  setProductoEditando(null);
                }}
              >
                Cancelar
              </button>
            )}
          </div>
          <label>
            Nombre
            <input value={producto.nombre} onChange={(event) => setProducto({ ...producto, nombre: event.target.value })} required />
          </label>
          <label>
            Codigo
            <input value={producto.codigo_barra} onChange={(event) => setProducto({ ...producto, codigo_barra: event.target.value })} />
          </label>
          <label>
            Precio compra
            <input type="number" min="0" step="0.01" value={producto.precio_compra} onChange={(event) => setProducto({ ...producto, precio_compra: event.target.value })} />
          </label>
          <label>
            Precio venta
            <input type="number" min="0" step="0.01" value={producto.precio_venta} onChange={(event) => setProducto({ ...producto, precio_venta: event.target.value })} required />
          </label>
          <label>
            Stock
            <input type="number" min="0" value={producto.stock} onChange={(event) => setProducto({ ...producto, stock: event.target.value })} required />
          </label>
          <label>
            Stock minimo
            <input type="number" min="0" value={producto.stock_minimo} onChange={(event) => setProducto({ ...producto, stock_minimo: event.target.value })} required />
          </label>
          <label>
            Vencimiento
            <input type="date" value={producto.fecha_vencimiento} onChange={(event) => setProducto({ ...producto, fecha_vencimiento: event.target.value })} />
          </label>
          <label>
            Categoria
            <select value={producto.id_categoria} onChange={(event) => setProducto({ ...producto, id_categoria: event.target.value })}>
              <option value="">Sin categoria</option>
              {categorias.map((item) => <option key={item.id_categoria} value={item.id_categoria}>{item.nombre}</option>)}
            </select>
          </label>
          <label>
            Proveedor
            <select value={producto.id_proveedor} onChange={(event) => setProducto({ ...producto, id_proveedor: event.target.value })}>
              <option value="">Sin proveedor</option>
              {proveedores.map((item) => <option key={item.id_proveedor} value={item.id_proveedor}>{item.nombre}</option>)}
            </select>
          </label>
          <label className="wide">
            Descripcion
            <textarea value={producto.descripcion} onChange={(event) => setProducto({ ...producto, descripcion: event.target.value })} rows="3" />
          </label>
          <button className="wide" type="submit">
            {productoEditando ? 'Guardar cambios' : 'Registrar producto'}
          </button>
        </form>

        <div className="side-panels">
          <form className="panel mini-form" onSubmit={handleCategoriaSubmit}>
            <h3>Nueva categoria</h3>
            <input placeholder="Nombre" value={categoria.nombre} onChange={(event) => setCategoria({ ...categoria, nombre: event.target.value })} required />
            <input placeholder="Descripcion" value={categoria.descripcion} onChange={(event) => setCategoria({ ...categoria, descripcion: event.target.value })} />
            <button type="submit">Guardar</button>
          </form>

          <form className="panel mini-form" onSubmit={handleProveedorSubmit}>
            <h3>Nuevo proveedor</h3>
            <input placeholder="Nombre" value={proveedor.nombre} onChange={(event) => setProveedor({ ...proveedor, nombre: event.target.value })} required />
            <input placeholder="RUC" value={proveedor.ruc} onChange={(event) => setProveedor({ ...proveedor, ruc: event.target.value })} />
            <input placeholder="Telefono" value={proveedor.telefono} onChange={(event) => setProveedor({ ...proveedor, telefono: event.target.value })} />
            <input placeholder="Correo" value={proveedor.correo} onChange={(event) => setProveedor({ ...proveedor, correo: event.target.value })} />
            <input placeholder="Direccion" value={proveedor.direccion} onChange={(event) => setProveedor({ ...proveedor, direccion: event.target.value })} />
            <button type="submit">Guardar</button>
          </form>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="panel-header">
          <h3>Productos registrados</h3>
          <input
            className="search"
            placeholder="Buscar producto"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoria</th>
                <th>Proveedor</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((item) => (
                <tr key={item.id_producto} className={item.stock <= item.stock_minimo ? 'row-warning' : ''}>
                  <td>
                    <strong>{item.nombre}</strong>
                    <span>{item.codigo_barra || 'Sin codigo'}</span>
                  </td>
                  <td>{item.categoria || '-'}</td>
                  <td>{item.proveedor || '-'}</td>
                  <td>S/ {Number(item.precio_venta || 0).toFixed(2)}</td>
                  <td>{item.stock} / {item.stock_minimo}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => editarProducto(item)}>Editar</button>
                      <button type="button" onClick={() => desactivarProducto(item.id_producto)}>Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="6">No hay productos para mostrar</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default Inventario;
