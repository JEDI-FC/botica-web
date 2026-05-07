const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  obtenerReporteGeneral
} = require('../controllers/reportes.controller');

router.get('/general', verificarToken, obtenerReporteGeneral);

module.exports = router;
