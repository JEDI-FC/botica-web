const db = require('../config/db');
const { notificarBajoStock } = require('../utils/notificaciones');

const listarVentas = async (req, res, next) => {
  try {
    const [ventas] = await db.query(`
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.total,
        v.metodo_pago,
        v.estado,
        c.nombre AS cliente,
        u.nombre AS usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
      ORDER BY v.fecha_venta DESC
    `);

    res.json(ventas);
  } catch (error) {
    next(error);
  }
};

const listarMovimientos = async (req, res, next) => {
  try {
    const [movimientos] = await db.query(`
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.total,
        v.metodo_pago,
        v.estado,
        c.nombre AS cliente,
        u.id_usuario,
        u.nombre AS usuario,
        u.usuario AS usuario_login,
        u.rol AS usuario_rol,
        GROUP_CONCAT(
          CONCAT(p.nombre, ' x', dv.cantidad)
          ORDER BY p.nombre
          SEPARATOR ', '
        ) AS productos
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
      LEFT JOIN detalle_ventas dv ON v.id_venta = dv.id_venta
      LEFT JOIN productos p ON dv.id_producto = p.id_producto
      GROUP BY
        v.id_venta,
        v.fecha_venta,
        v.total,
        v.metodo_pago,
        v.estado,
        c.nombre,
        u.id_usuario,
        u.nombre,
        u.usuario,
        u.rol
      ORDER BY v.fecha_venta DESC
    `);

    res.json(movimientos);
  } catch (error) {
    next(error);
  }
};

const obtenerVenta = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [ventas] = await db.query(`
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.id_cliente,
        v.id_usuario,
        v.total,
        v.metodo_pago,
        v.estado,
        c.nombre AS cliente,
        u.nombre AS usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.id_venta = ?
    `, [id]);

    if (ventas.length === 0) {
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    const [detalles] = await db.query(`
      SELECT
        dv.id_detalle,
        dv.id_producto,
        p.nombre AS producto,
        dv.cantidad,
        dv.precio_unitario,
        dv.subtotal
      FROM detalle_ventas dv
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      WHERE dv.id_venta = ?
    `, [id]);

    res.json({
      ...ventas[0],
      detalles
    });
  } catch (error) {
    next(error);
  }
};

const crearVenta = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const { id_cliente = null, id_usuario, metodo_pago = 'efectivo', detalles = [] } = req.body;

    if (!id_usuario) {
      return res.status(400).json({ mensaje: 'El usuario es obligatorio' });
    }

    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({ mensaje: 'La venta debe incluir al menos un producto' });
    }

    await connection.beginTransaction();

    let total = 0;
    const detallesVenta = [];

    for (const detalle of detalles) {
      const cantidad = Number(detalle.cantidad);

      if (!detalle.id_producto || !Number.isInteger(cantidad) || cantidad <= 0) {
        await connection.rollback();
        return res.status(400).json({ mensaje: 'Detalle de venta invalido' });
      }

      const [productos] = await connection.query(`
        SELECT id_producto, nombre, precio_venta, stock, stock_minimo
        FROM productos
        WHERE id_producto = ? AND estado = 'activo'
        FOR UPDATE
      `, [detalle.id_producto]);

      if (productos.length === 0) {
        await connection.rollback();
        return res.status(404).json({ mensaje: `Producto ${detalle.id_producto} no encontrado` });
      }

      const producto = productos[0];

      if (producto.stock < cantidad) {
        await connection.rollback();
        return res.status(400).json({
          mensaje: `Stock insuficiente para ${producto.nombre}`,
          stock_disponible: producto.stock
        });
      }

      const precioUnitario = Number(producto.precio_venta);
      const subtotal = precioUnitario * cantidad;
      total += subtotal;

      detallesVenta.push({
        id_producto: producto.id_producto,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal
      });
    }

    const [venta] = await connection.query(`
      INSERT INTO ventas (id_cliente, id_usuario, total, metodo_pago)
      VALUES (?, ?, ?, ?)
    `, [id_cliente, id_usuario, total, metodo_pago]);

    for (const detalle of detallesVenta) {
      await connection.query(`
        INSERT INTO detalle_ventas (id_venta, id_producto, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `, [
        venta.insertId,
        detalle.id_producto,
        detalle.cantidad,
        detalle.precio_unitario,
        detalle.subtotal
      ]);

      await connection.query(`
        UPDATE productos
        SET stock = stock - ?
        WHERE id_producto = ?
      `, [detalle.cantidad, detalle.id_producto]);

      const [productosActualizados] = await connection.query(`
        SELECT id_producto, nombre, stock, stock_minimo
        FROM productos
        WHERE id_producto = ?
      `, [detalle.id_producto]);

      await notificarBajoStock(connection, productosActualizados[0]);
    }

    await connection.commit();

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      id_venta: venta.insertId,
      total
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

const anularVenta = async (req, res, next) => {
  const connection = await db.getConnection();

  try {
    const { id } = req.params;

    await connection.beginTransaction();

    const [ventas] = await connection.query(`
      SELECT id_venta, estado
      FROM ventas
      WHERE id_venta = ?
      FOR UPDATE
    `, [id]);

    if (ventas.length === 0) {
      await connection.rollback();
      return res.status(404).json({ mensaje: 'Venta no encontrada' });
    }

    if (ventas[0].estado === 'anulada') {
      await connection.rollback();
      return res.status(400).json({ mensaje: 'La venta ya esta anulada' });
    }

    const [detalles] = await connection.query(`
      SELECT id_producto, cantidad
      FROM detalle_ventas
      WHERE id_venta = ?
    `, [id]);

    for (const detalle of detalles) {
      await connection.query(`
        UPDATE productos
        SET stock = stock + ?
        WHERE id_producto = ?
      `, [detalle.cantidad, detalle.id_producto]);
    }

    await connection.query(`
      UPDATE ventas
      SET estado = 'anulada'
      WHERE id_venta = ?
    `, [id]);

    await connection.commit();

    res.json({ mensaje: 'Venta anulada correctamente' });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
};

module.exports = {
  listarVentas,
  listarMovimientos,
  obtenerVenta,
  crearVenta,
  anularVenta
};
