import express from 'express';
const router = express.Router();
import db from '../database/db.js'

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

export default router;
