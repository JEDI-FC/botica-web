const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  listarNotificaciones,
  crearNotificacion,
  actualizarEstadoNotificacion,
  eliminarNotificacion
} = require('../controllers/notificaciones.controller');

router.get('/', verificarToken, listarNotificaciones);
router.post('/', verificarToken, crearNotificacion);
router.patch('/:id/estado', verificarToken, actualizarEstadoNotificacion);
router.delete('/:id', verificarToken, eliminarNotificacion);

module.exports = router;
