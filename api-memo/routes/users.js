const express = require('express');
const router = express.Router();
const db = require('../database/db.js');

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
