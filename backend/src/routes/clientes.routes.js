const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  listarClientes,
  obtenerCliente,
  buscarClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente
} = require('../controllers/clientes.controller');

router.get('/', listarClientes);
router.get('/buscar', buscarClientes);
router.get('/:id', obtenerCliente);
router.post('/', verificarToken, crearCliente);
router.put('/:id', verificarToken, actualizarCliente);
router.delete('/:id', verificarToken, eliminarCliente);

module.exports = router;
