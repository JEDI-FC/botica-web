const db = require('../config/db');

const listarProveedores = async (req, res, next) => {
  try {
    const [proveedores] = await db.query(`
      SELECT id_proveedor, nombre, ruc, telefono, correo, direccion, estado
      FROM proveedores
      WHERE estado = 'activo'
    `);

    res.json(proveedores);
  } catch (error) {
    next(error);
  }
};

const obtenerProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [proveedores] = await db.query(`
      SELECT id_proveedor, nombre, ruc, telefono, correo, direccion, estado
      FROM proveedores
      WHERE id_proveedor = ?
    `, [id]);

    if (proveedores.length === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.json(proveedores[0]);
  } catch (error) {
    next(error);
  }
};

const crearProveedor = async (req, res, next) => {
  try {
    const { nombre, ruc, telefono, correo, direccion } = req.body;

    const [resultado] = await db.query(`
      INSERT INTO proveedores (nombre, ruc, telefono, correo, direccion)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, ruc, telefono, correo, direccion]);

    res.status(201).json({
      mensaje: 'Proveedor registrado correctamente',
      id_proveedor: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

const actualizarProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, ruc, telefono, correo, direccion } = req.body;

    const [resultado] = await db.query(`
      UPDATE proveedores
      SET nombre = ?, ruc = ?, telefono = ?, correo = ?, direccion = ?
      WHERE id_proveedor = ?
    `, [nombre, ruc, telefono, correo, direccion, id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.json({ mensaje: 'Proveedor actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

const eliminarProveedor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(`
      UPDATE proveedores
      SET estado = 'inactivo'
      WHERE id_proveedor = ?
    `, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Proveedor no encontrado' });
    }

    res.json({ mensaje: 'Proveedor eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
};
