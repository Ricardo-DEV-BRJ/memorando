import express from 'express';
import ubicacionController from '../controllers/ubicacionC.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = express.Router();
const controller = new ubicacionController();

router.get('/', verifyToken, async (req, res) => {
  try {
    const data = await controller.all();
    res.status(data.status).json({ message: data.message, ubi: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.getOne(req.params.id);
    res.status(data.status).json({ message: data.message, ubi: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const data = await controller.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.update(req.params.id, req.body);
    res.status(data.status).json({ message: data.message, ubi: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const data = await controller.delete(req.params.id);
    res.status(data.status).json({ message: data.message, ubi: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;