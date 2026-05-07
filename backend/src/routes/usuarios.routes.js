const express = require('express');
const router = express.Router();
const {
  verificarToken,
  verificarTokenOpcional
} = require('../middlewares/auth.middleware');

const {
  listarUsuarios,
  loginUsuario,
  crearUsuario,
  obtenerPerfil,
  actualizarPerfil
} = require('../controllers/usuarios.controller');

router.post('/login', loginUsuario);
router.get('/perfil', verificarToken, obtenerPerfil);
router.put('/perfil', verificarToken, actualizarPerfil);
router.get('/', verificarToken, listarUsuarios);
router.post('/', verificarTokenOpcional, crearUsuario);

module.exports = router;
