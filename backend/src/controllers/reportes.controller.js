const db = require('../config/db');

const obtenerReporteGeneral = async (req, res, next) => {
  try {
    const [[productos]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM productos
      WHERE estado = 'activo'
    `);

    const [[clientes]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM clientes
    `);

    const [[ventas]] = await db.query(`
      SELECT COUNT(*) AS total, COALESCE(SUM(total), 0) AS monto
      FROM ventas
      WHERE estado = 'completada'
    `);

    const [[bajoStock]] = await db.query(`
      SELECT COUNT(*) AS total
      FROM productos
      WHERE estado = 'activo'
        AND stock <= stock_minimo
    `);

    const [ventasRecientes] = await db.query(`
      SELECT
        v.id_venta,
        v.fecha_venta,
        v.total,
        v.metodo_pago,
        c.nombre AS cliente,
        u.nombre AS usuario
      FROM ventas v
      LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
      LEFT JOIN usuarios u ON v.id_usuario = u.id_usuario
      WHERE v.estado = 'completada'
      ORDER BY v.fecha_venta DESC
      LIMIT 8
    `);

    const [productosMasVendidos] = await db.query(`
      SELECT
        p.id_producto,
        p.nombre,
        SUM(dv.cantidad) AS cantidad_vendida,
        SUM(dv.subtotal) AS total_vendido
      FROM detalle_ventas dv
      INNER JOIN ventas v ON dv.id_venta = v.id_venta
      INNER JOIN productos p ON dv.id_producto = p.id_producto
      WHERE v.estado = 'completada'
      GROUP BY p.id_producto, p.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 8
    `);

    res.json({
      resumen: {
        productos: productos.total,
        clientes: clientes.total,
        ventas: ventas.total,
        monto_ventas: Number(ventas.monto),
        bajo_stock: bajoStock.total
      },
      ventas_recientes: ventasRecientes,
      productos_mas_vendidos: productosMasVendidos
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerReporteGeneral
};
