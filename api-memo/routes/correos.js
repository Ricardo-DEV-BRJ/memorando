const express = require('express');
const correosController = require('../controllers/correosC.js');

const router = express.Router();
const controller = new correosController();

router.post('/enviar', async (req, res) => {
  try {
    const data = await controller.enviar(req.body);
    res.status(data.status).json({ message: data.message, data: data.data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;