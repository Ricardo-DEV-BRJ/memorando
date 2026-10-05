const express = require('express');
const responsablesController = require('../controllers/responsablesC.js');
const { verifyToken } = require('../middlewares/auth.middleware.js');

const router = express.Router();
const controller = new responsablesController();

router.get('/', verifyToken, async (req, res) => {
    try {
        const data = await controller.all();
        res.status(data.status).json({ message: data.message, users: data.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const data = await controller.getOne(req.params.id);
        res.status(data.status).json({ message: data.message, users: data.data });
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
        res.status(data.status).json({ message: data.message, users: data.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const data = await controller.delete(req.params.id);
        res.status(data.status).json({ message: data.message, users: data.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id/activar', verifyToken, async (req, res) => {
    try {
        const data = await controller.activar(req.params.id);
        res.status(data.status).json({ message: data.message, users: data.data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;