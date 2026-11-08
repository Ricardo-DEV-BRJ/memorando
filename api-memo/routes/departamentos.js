const express = require('express');
const departamentosController = require('../controllers/departamentosC.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');
const { soloSuperAdmin } = require('../middlewares/roles.middleware.js');

const router = express.Router();
const controller = new departamentosController();

// Toda la gestión de departamentos es exclusiva del superadministrador
router.use(verifyToken, soloSuperAdmin);

function responderError(res, error) {
  const mensaje = error.message || 'Error al procesar la solicitud';
  res.status(error.status || 500).json({ message: mensaje, error: mensaje });
}

router.get('/', async (req, res) => {
  try {
    const data = await controller.all();
    res.status(data.status).json(data);
  } catch (error) {
    responderError(res, error);
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await controller.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    responderError(res, error);
  }
});

router.post('/lista-departamentos', async (req, res) => {
  try {
    const data = await controller.agregarDepartamentos(req.body);
    res.status(201).json(data);
  } catch (error) {
    responderError(res, error);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await controller.update(req.params.id, req.body);
    res.status(data.status).json({ message: data.message, depa: data.data });
  } catch (error) {
    responderError(res, error);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await controller.delete(req.params.id);
    res.status(data.status).json({ message: data.message, depa: data.data });
  } catch (error) {
    responderError(res, error);
  }
});

module.exports = router;
