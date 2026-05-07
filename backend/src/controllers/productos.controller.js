const db = require('../config/db');
const { notificarBajoStock } = require('../utils/notificaciones');

const listarProductos = async (req, res, next) => {
  try {
    const [productos] = await db.query(`
      SELECT 
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.codigo_barra,
        p.precio_compra,
        p.precio_venta,
        p.stock,
        p.stock_minimo,
        p.fecha_vencimiento,
        p.id_categoria,
        p.id_proveedor,
        p.estado,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.estado = 'activo'
    `);

    res.json(productos);
  } catch (error) {
    next(error);
  }
};

const obtenerProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [productos] = await db.query(`
      SELECT
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.codigo_barra,
        p.precio_compra,
        p.precio_venta,
        p.stock,
        p.stock_minimo,
        p.fecha_vencimiento,
        p.id_categoria,
        p.id_proveedor,
        p.estado,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.id_producto = ?
    `, [id]);

    if (productos.length === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json(productos[0]);
  } catch (error) {
    next(error);
  }
};

const listarProductosBajoStock = async (req, res, next) => {
  try {
    const [productos] = await db.query(`
      SELECT
        p.id_producto,
        p.nombre,
        p.codigo_barra,
        p.stock,
        p.stock_minimo,
        p.fecha_vencimiento,
        c.nombre AS categoria,
        pr.nombre AS proveedor
      FROM productos p
      LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
      LEFT JOIN proveedores pr ON p.id_proveedor = pr.id_proveedor
      WHERE p.estado = 'activo'
        AND p.stock <= p.stock_minimo
      ORDER BY p.stock ASC, p.nombre ASC
    `);

    res.json({
      total: productos.length,
      productos
    });
  } catch (error) {
    next(error);
  }
};

const crearProducto = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const {
      nombre,
      descripcion,
      codigo_barra,
      precio_compra,
      precio_venta,
      stock,
      stock_minimo,
      fecha_vencimiento,
      id_categoria,
      id_proveedor
    } = req.body;

    await connection.beginTransaction();

    const [resultado] = await connection.query(`
      INSERT INTO productos 
      (nombre, descripcion, codigo_barra, precio_compra, precio_venta, stock, stock_minimo, fecha_vencimiento, id_categoria, id_proveedor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre,
      descripcion,
      codigo_barra,
      precio_compra,
      precio_venta,
      stock,
      stock_minimo,
      fecha_vencimiento,
      id_categoria,
      id_proveedor
    ]);

    await notificarBajoStock(connection, {
      id_producto: resultado.insertId,
      nombre,
      stock,
      stock_minimo
    });

    await connection.commit();

    res.status(201).json({
      mensaje: 'Producto registrado correctamente',
      id_producto: resultado.insertId
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const actualizarProducto = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      codigo_barra,
      precio_compra,
      precio_venta,
      stock,
      stock_minimo,
      fecha_vencimiento,
      id_categoria,
      id_proveedor
    } = req.body;

    await connection.beginTransaction();

    const [resultado] = await connection.query(`
      UPDATE productos
      SET
        nombre = ?,
        descripcion = ?,
        codigo_barra = ?,
        precio_compra = ?,
        precio_venta = ?,
        stock = ?,
        stock_minimo = ?,
        fecha_vencimiento = ?,
        id_categoria = ?,
        id_proveedor = ?
      WHERE id_producto = ?
    `, [
      nombre,
      descripcion,
      codigo_barra,
      precio_compra,
      precio_venta,
      stock,
      stock_minimo,
      fecha_vencimiento,
      id_categoria,
      id_proveedor,
      id
    ]);

    if (resultado.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    await notificarBajoStock(connection, {
      id_producto: id,
      nombre,
      stock,
      stock_minimo
    });

    await connection.commit();

    res.json({ mensaje: 'Producto actualizado correctamente' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(`
      UPDATE productos
      SET estado = 'inactivo'
      WHERE id_producto = ?
    `, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Producto no encontrado' });
    }

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarProductos,
  obtenerProducto,
  listarProductosBajoStock,
  crearProducto,
  actualizarProducto,
  eliminarProducto
};
