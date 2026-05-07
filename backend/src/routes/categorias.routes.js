const express = require('express');
const router = express.Router();
const { verificarToken } = require('../middlewares/auth.middleware');

const {
  listarCategorias,
  obtenerCategoria,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} = require('../controllers/categorias.controller');

router.get('/', listarCategorias);
router.get('/:id', obtenerCategoria);
router.post('/', verificarToken, crearCategoria);
router.put('/:id', verificarToken, actualizarCategoria);
router.delete('/:id', verificarToken, eliminarCategoria);

module.exports = router;
