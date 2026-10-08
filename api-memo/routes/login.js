const express = require('express');
const loginController = require('../controllers/loginC.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const controller = new loginController();

router.get('/', verifyToken, async (req, res) => {
  try {
    const data = await controller.all(req.user_id);
    res.status(data.status).json({ message: data.message, users: data.data, depa: data.depa });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    req.body.user_id = req.user_id;
    const data = await controller.getOne(req.params.id);
    res.status(data.status).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = await controller.authenticate(req.body);
    res.status(data.status).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message || 'Error al autenticar' });
  }
});

router.post('/acceso', verifyToken, async (req, res) => {
  try {
    req.body.user_id = req.user_id;
    const data = await controller.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.put('/permisos/:id', verifyToken, async (req, res) => {
  try {
    req.body.user_id = req.user_id;
    const data = await controller.asignarPermisos(req.params.id, req.body);
    if (req.params.id == req.user_id) {
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
      });
      res.status(data.status).json({ message: 'Permisos asignados con éxito, recargue la página'});
    } else {
      res.status(data.status).json(data);
    }
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    req.body.user_id = req.user_id;
    const data = await controller.update(req.params.id, req.body);
    res.status(data.status).json({ message: data.message, data: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    req.body.user_id = req.user_id;
    const data = await controller.delete(req.params.id, req.body.user_id);
    res.status(data.status).json({ message: data.message, data: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });

  return res.status(200).json({
    message: 'Sesión cerrada exitosamente'
  });
});

module.exports = router;