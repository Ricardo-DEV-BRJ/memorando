const express = require('express');
const responsablesController = require('../controllers/responsablesC.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const controller = new responsablesController();

router.get('/', verifyToken, async (req, res) => {
  try {
    const data = await controller.all(req.id_dep, req.user_id);
    res.status(data.status).json({ message: data.message, users: data.data, depa: data.dep });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Las rutas de perfil deben ir antes de /:id para que no sean capturadas por esas rutas
router.get('/perfil', verifyToken, async (req, res) => {
  try {
    const data = await controller.perfil(req.user_id);
    res.status(data.status).json({ message: data.message, data: data.data });
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al obtener el perfil' });
  }
});

router.put('/perfil', verifyToken, async (req, res) => {
  try {
    const data = await controller.actualizarPerfil(req.user_id, req.body);
    res.status(data.status).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al actualizar el perfil' });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.getOne(req.params.id, req.user_id);
    res.status(data.status).json({ message: data.message, users: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const data = await controller.create(req.body, req.user_id, req.id_dep);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/lista-personal', verifyToken, async (req, res) => {
  try {
    const data = await controller.createMultiple(req.body, req.user_id, req.id_dep);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.update(req.params.id, req.body, req.user_id);
    res.status(data.status).json({ message: data.message, users: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.delete(req.params.id, req.user_id);
    res.status(data.status).json({ message: data.message, users: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id/activar', verifyToken, async (req, res) => {
  try {
    const data = await controller.activar(req.params.id, req.user_id);
    res.status(data.status).json({ message: data.message, users: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;