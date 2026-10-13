const express = require('express');
const memoController = require('../controllers/memoC.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const controller = new memoController();

router.get('/', verifyToken, async (req, res) => {
  try {
    const data = await controller.all(req.id_dep);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.getOne(req.params.id);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/documento/:folio', async (req, res) => {
  try {
    const data = await controller.documentoQr(req.params.folio);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    req.body.creado_por = req.nombre + ' ' + req.apellido;
    req.body.id_dep = req.id_dep
    const data = await controller.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.update(req.params.id, req.body);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/recibir/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.recibir(req.params.id, req.id_dep, req.user_id);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/anular/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.anular(req.params.id);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/marcar_salida/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.marcar_salida(req.params.id, req.user_id);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/marcar_entrada/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.marcar_entrada(req.params.id, req.user_id);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/marcar_sitio/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.marcar_sitio(req.params.id);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/marcar_completado/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.marcar_completado(req.params.id, req.user_id);
    res.status(data.status).json({ message: data.message, memos: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;