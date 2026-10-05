const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.status(200).json({message: 'Bienvenido a la API de Memorándums' });
});

module.exports = router;