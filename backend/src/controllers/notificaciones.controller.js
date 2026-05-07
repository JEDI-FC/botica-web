const db = require('../config/db');
const { notificarBajoStock } = require('../utils/notificaciones');

const sincronizarAlertasStock = async () => {
  const [productos] = await db.query(`
    SELECT id_producto, nombre, stock, stock_minimo
    FROM productos
    WHERE estado = 'activo'
      AND stock <= stock_minimo
  `);

  for (const producto of productos) {
    await notificarBajoStock(db, producto);
  }
};

const listarNotificaciones = async (req, res, next) => {
  try {
    await sincronizarAlertasStock();

    const { id_usuario } = req.query;
    const params = [];
    let filtro = '';

    if (id_usuario) {
      filtro = 'WHERE n.id_usuario = ?';
      params.push(id_usuario);
    }

    const [notificaciones] = await db.query(`
      SELECT
        n.id_notificacion,
        n.id_usuario,
        n.titulo,
        n.mensaje,
        n.tipo,
        n.referencia_tipo,
        n.referencia_id,
        n.leida,
        n.fecha_creacion,
        u.nombre AS usuario_nombre,
        u.usuario AS usuario
      FROM notificaciones n
      INNER JOIN usuarios u ON n.id_usuario = u.id_usuario
      ${filtro}
      ORDER BY n.fecha_creacion DESC
    `, params);

    res.json(notificaciones);
  } catch (error) {
    next(error);
  }
};

const crearNotificacion = async (req, res, next) => {
  try {
    const { id_usuario, titulo, mensaje, tipo = 'sistema' } = req.body;

    if (!id_usuario || !titulo || !mensaje) {
      return res.status(400).json({
        mensaje: 'Usuario, titulo y mensaje son obligatorios'
      });
    }

    const [resultado] = await db.query(`
      INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo, referencia_tipo, referencia_id)
      VALUES (?, ?, ?, ?, NULL, NULL)
    `, [id_usuario, titulo, mensaje, tipo]);

    res.status(201).json({
      mensaje: 'Notificacion registrada correctamente',
      id_notificacion: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

const actualizarEstadoNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leida } = req.body;

    const [resultado] = await db.query(`
      UPDATE notificaciones
      SET leida = ?
      WHERE id_notificacion = ?
    `, [Boolean(leida), id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Notificacion no encontrada' });
    }

    res.json({ mensaje: 'Estado de notificacion actualizado' });
  } catch (error) {
    next(error);
  }
};

const eliminarNotificacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(`
      DELETE FROM notificaciones
      WHERE id_notificacion = ?
    `, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Notificacion no encontrada' });
    }

    res.json({ mensaje: 'Notificacion eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarNotificaciones,
  crearNotificacion,
  actualizarEstadoNotificacion,
  eliminarNotificacion
};
