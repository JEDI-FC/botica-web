const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  listarVentas,
  listarMovimientos,
  obtenerVenta,
  crearVenta,
  anularVenta
} = require('../controllers/ventas.controller');

router.get('/', listarVentas);
router.get('/movimientos', listarMovimientos);
router.get('/:id', obtenerVenta);
router.post('/', verificarToken, crearVenta);
router.patch('/:id/anular', verificarToken, anularVenta);

module.exports = router;
