const db = require('../config/db');

const listarClientes = async (req, res, next) => {
  try {
    const [clientes] = await db.query(`
      SELECT id_cliente, nombre, dni, telefono, correo, direccion, fecha_creacion
      FROM clientes
      ORDER BY nombre ASC
    `);

    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

const obtenerCliente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [clientes] = await db.query(`
      SELECT id_cliente, nombre, dni, telefono, correo, direccion, fecha_creacion
      FROM clientes
      WHERE id_cliente = ?
    `, [id]);

    if (clientes.length === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json(clientes[0]);
  } catch (error) {
    next(error);
  }
};

const buscarClientes = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const filtro = `%${q}%`;

    const [clientes] = await db.query(`
      SELECT id_cliente, nombre, dni, telefono, correo, direccion, fecha_creacion
      FROM clientes
      WHERE nombre LIKE ?
        OR dni LIKE ?
        OR telefono LIKE ?
        OR correo LIKE ?
      ORDER BY nombre ASC
    `, [filtro, filtro, filtro, filtro]);

    res.json(clientes);
  } catch (error) {
    next(error);
  }
};

const crearCliente = async (req, res, next) => {
  try {
    const { nombre, dni, telefono, correo, direccion } = req.body;

    const [resultado] = await db.query(`
      INSERT INTO clientes (nombre, dni, telefono, correo, direccion)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, dni, telefono, correo, direccion]);

    res.status(201).json({
      mensaje: 'Cliente registrado correctamente',
      id_cliente: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

const actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, dni, telefono, correo, direccion } = req.body;

    const [resultado] = await db.query(`
      UPDATE clientes
      SET nombre = ?, dni = ?, telefono = ?, correo = ?, direccion = ?
      WHERE id_cliente = ?
    `, [nombre, dni, telefono, correo, direccion, id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

const eliminarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [ventas] = await db.query(`
      SELECT id_venta
      FROM ventas
      WHERE id_cliente = ?
      LIMIT 1
    `, [id]);

    if (ventas.length > 0) {
      return res.status(400).json({
        mensaje: 'No se puede eliminar el cliente porque tiene ventas registradas'
      });
    }

    const [resultado] = await db.query(`
      DELETE FROM clientes
      WHERE id_cliente = ?
    `, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    }

    res.json({ mensaje: 'Cliente eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarClientes,
  obtenerCliente,
  buscarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
};
