import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import dotenv from "dotenv";
import cors from 'cors';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import equiposRouter from './routes/equipos.js';
import loginRouter from './routes/login.js'; 
import responsables from './routes/responsables.js'; 
import ubicaciones from './routes/ubicacion.js';
import memo from './routes/memo.js';
dotenv.config();



const app = express();
const corsEndpoint = process.env.CORS_PORT
console.log(corsEndpoint)

const __dirname = import.meta.dirname;
// view engine setup
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
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/equipos', equiposRouter);
app.use('/login', loginRouter);
app.use('/auth', loginRouter);
app.use('/responsables', responsables);
app.use('/ubicaciones', ubicaciones);
app.use('/memorandos', memo);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
