const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const dotenv = require('dotenv');
const cors = require('cors');
const indexRouter = require('./routes/index.js');
const usersRouter = require('./routes/users.js');
const equiposRouter = require('./routes/equipos.js');
const loginRouter = require('./routes/login.js');
const responsables = require('./routes/responsables.js');
const ubicaciones = require('./routes/ubicacion.js');
const memo = require('./routes/memo.js');
const correosRouter = require('./routes/correos.js');

dotenv.config();

const app = express();
const corsEndpoint = process.env.CORS_PORT;
console.log(corsEndpoint);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({
  origin: [corsEndpoint],
  methods: 'GET,POST,PUT,DELETE',
  credentials: true
}));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/equipos', equiposRouter);
app.use('/login', loginRouter);
app.use('/auth', loginRouter);
app.use('/responsables', responsables);
app.use('/ubicaciones', ubicaciones);
app.use('/memorandos', memo);
app.use('/correos', correosRouter);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
