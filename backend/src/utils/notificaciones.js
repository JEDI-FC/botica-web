const notificarBajoStock = async (connection, producto) => {
  if (!producto || Number(producto.stock) > Number(producto.stock_minimo)) {
    return;
  }

  const [usuarios] = await connection.query(`
    SELECT id_usuario
    FROM usuarios
    WHERE estado = 'activo'
  `);

  for (const usuario of usuarios) {
    const [existentes] = await connection.query(`
      SELECT id_notificacion
      FROM notificaciones
      WHERE id_usuario = ?
        AND tipo = 'stock'
        AND referencia_tipo = 'producto'
        AND referencia_id = ?
        AND leida = 0
      LIMIT 1
    `, [usuario.id_usuario, producto.id_producto]);

    if (existentes.length > 0) {
      continue;
    }

    await connection.query(`
      INSERT INTO notificaciones
      (id_usuario, titulo, mensaje, tipo, referencia_tipo, referencia_id)
      VALUES (?, ?, ?, 'stock', 'producto', ?)
    `, [
      usuario.id_usuario,
      'Reposicion requerida',
      `El producto ${producto.nombre} tiene stock ${producto.stock} y minimo ${producto.stock_minimo}.`,
      producto.id_producto
    ]);
  }
};

module.exports = {
  notificarBajoStock
};
