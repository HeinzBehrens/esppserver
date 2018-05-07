const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const financeRouter = require('./routes/finance')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// ************** CORS --> https://www.npmjs.com/package/cors
// **************************************************************************************
//
// middleware for dynamically or statically enabling CORS in express/connect applications
// import * as cors from 'cors'
const cors = require('cors')

// Cross Origin - also Zugriffe aus einer anderen Domaine erlauben
app.use( cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
// app.use('/shareUSDinfo', financeRouter)
app.use('/finance', financeRouter)
// catch 404 and forward to error handler
app.use((req: any, res: any, next: any) => {
  next(createError(404));
});

// error handler
app.use(  (err: any, req: any, res: any, next: any) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

import { updateDatabase } from './public/updateDatabases'
console.log ("Wird dies geschrieben?")
updateDatabase()

module.exports = app;
