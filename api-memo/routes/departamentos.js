const express = require('express');
const departamentosController = require('../controllers/departamentosC.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const controller = new departamentosController();

router.post('/', verifyToken, async (req, res) => {
  try {
    const data = await controller.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/lista-departamentos', verifyToken, async (req, res) => {
  try {
    const data = await controller.agregarDepartamentos(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.update(req.params.id, req.body);
    res.status(data.status).json({ message: data.message, equ: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.delete(req.params.id);
    res.status(data.status).json({ message: data.message, equ: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;