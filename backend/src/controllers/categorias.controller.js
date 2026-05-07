const db = require('../config/db');

const listarCategorias = async (req, res, next) => {
  try {
    const [categorias] = await db.query(`
      SELECT id_categoria, nombre, descripcion, estado
      FROM categorias
      WHERE estado = 'activo'
    `);

    res.json(categorias);
  } catch (error) {
    next(error);
  }
};

const obtenerCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [categorias] = await db.query(`
      SELECT id_categoria, nombre, descripcion, estado
      FROM categorias
      WHERE id_categoria = ?
    `, [id]);

    if (categorias.length === 0) {
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    res.json(categorias[0]);
  } catch (error) {
    next(error);
  }
};

const crearCategoria = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;

    const [resultado] = await db.query(`
      INSERT INTO categorias (nombre, descripcion)
      VALUES (?, ?)
    `, [nombre, descripcion]);

    res.status(201).json({
      mensaje: 'Categoria registrada correctamente',
      id_categoria: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

const actualizarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const [resultado] = await db.query(`
      UPDATE categorias
      SET nombre = ?, descripcion = ?
      WHERE id_categoria = ?
    `, [nombre, descripcion, id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    res.json({ mensaje: 'Categoria actualizada correctamente' });
  } catch (error) {
    next(error);
  }
};

const eliminarCategoria = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [resultado] = await db.query(`
      UPDATE categorias
      SET estado = 'inactivo'
      WHERE id_categoria = ?
    `, [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({ mensaje: 'Categoria no encontrada' });
    }

    res.json({ mensaje: 'Categoria eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};
