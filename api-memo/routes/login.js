import express from 'express';
import loginController from '../controllers/loginC.js';

const router = express.Router();
const controller = new loginController();

router.get('/', async (req, res) => {
  try {
    const data = await controller.all();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await controller.getOne(req.params.id);
    res.status(data.status).json(data);
  } catch (error) {
    res.status(error.status || 500).json({message:error.message});
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await controller.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await controller.update(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await controller.delete(req.params.id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;