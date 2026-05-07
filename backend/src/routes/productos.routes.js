const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  listarProductos,
  obtenerProducto,
  listarProductosBajoStock,
  crearProducto,
  actualizarProducto,
  eliminarProducto
} = require('../controllers/productos.controller');

router.get('/', listarProductos);
router.get('/alertas/bajo-stock', listarProductosBajoStock);
router.get('/:id', obtenerProducto);
router.post('/', verificarToken, crearProducto);
router.put('/:id', verificarToken, actualizarProducto);
router.delete('/:id', verificarToken, eliminarProducto);

module.exports = router;
