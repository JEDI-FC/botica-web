const bcrypt = require('bcryptjs');
const db = require('../config/db');
const jwt = require('jsonwebtoken');

const listarUsuarios = async (req, res, next) => {
  try {
    const [usuarios] = await db.query(`
      SELECT id_usuario, nombre, usuario, correo, rol, estado, fecha_creacion
      FROM usuarios
      WHERE estado = 'activo'
      ORDER BY nombre ASC
    `);

    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

const loginUsuario = async (req, res, next) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ mensaje: 'Usuario y password son obligatorios' });
    }

    const [usuarios] = await db.query(`
      SELECT id_usuario, nombre, usuario, correo, password, rol, estado
      FROM usuarios
      WHERE usuario = ? OR correo = ?
      LIMIT 1
    `, [usuario, usuario]);

    if (usuarios.length === 0 || usuarios[0].estado !== 'activo') {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    const usuarioEncontrado = usuarios[0];
    const passwordValido = await bcrypt.compare(password, usuarioEncontrado.password);

    if (!passwordValido) {
      return res.status(401).json({ mensaje: 'Credenciales invalidas' });
    }

    const token = jwt.sign({
      id_usuario: usuarioEncontrado.id_usuario,
      usuario: usuarioEncontrado.usuario,
      rol: usuarioEncontrado.rol
    }, process.env.JWT_SECRET, {
      expiresIn: '8h'
    });

    res.json({
      mensaje: 'Login correcto',
      token,
      usuario: {
        id_usuario: usuarioEncontrado.id_usuario,
        nombre: usuarioEncontrado.nombre,
        usuario: usuarioEncontrado.usuario,
        correo: usuarioEncontrado.correo,
        rol: usuarioEncontrado.rol
      }
    });
  } catch (error) {
    next(error);
  }
};

const crearUsuario = async (req, res, next) => {
  try {
    const { nombre, usuario, correo, password, rol = 'vendedor' } = req.body;

    if (!nombre || !usuario || !password) {
      return res.status(400).json({ mensaje: 'Nombre, usuario y password son obligatorios' });
    }

    const [usuariosRegistrados] = await db.query(`
      SELECT COUNT(*) AS total
      FROM usuarios
    `);

    if (usuariosRegistrados[0].total > 0 && !req.usuario) {
      return res.status(401).json({ mensaje: 'Token requerido para registrar nuevos usuarios' });
    }

    if (usuariosRegistrados[0].total > 0 && req.usuario.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'Solo el administrador puede registrar usuarios' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [resultado] = await db.query(`
      INSERT INTO usuarios (nombre, usuario, correo, password, rol)
      VALUES (?, ?, ?, ?, ?)
    `, [nombre, usuario, correo, passwordHash, rol]);

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente',
      id_usuario: resultado.insertId
    });
  } catch (error) {
    next(error);
  }
};

const obtenerPerfil = async (req, res, next) => {
  try {
    const [usuarios] = await db.query(`
      SELECT id_usuario, nombre, usuario, correo, rol, estado, fecha_creacion
      FROM usuarios
      WHERE id_usuario = ?
    `, [req.usuario.id_usuario]);

    if (usuarios.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(usuarios[0]);
  } catch (error) {
    next(error);
  }
};

const actualizarPerfil = async (req, res, next) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: 'El nombre es obligatorio' });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);

      await db.query(`
        UPDATE usuarios
        SET nombre = ?, correo = ?, password = ?
        WHERE id_usuario = ?
      `, [nombre, correo, passwordHash, req.usuario.id_usuario]);
    } else {
      await db.query(`
        UPDATE usuarios
        SET nombre = ?, correo = ?
        WHERE id_usuario = ?
      `, [nombre, correo, req.usuario.id_usuario]);
    }

    res.json({ mensaje: 'Perfil actualizado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listarUsuarios,
  loginUsuario,
  crearUsuario,
  obtenerPerfil,
  actualizarPerfil
};
