const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor
} = require('../controllers/proveedores.controller');

router.get('/', listarProveedores);
router.get('/:id', obtenerProveedor);
router.post('/', verificarToken, crearProveedor);
router.put('/:id', verificarToken, actualizarProveedor);
router.delete('/:id', verificarToken, eliminarProveedor);

module.exports = router;
