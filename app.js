var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
var cookieSession = require('cookie-session');
var flash = require('connect-flash');

// if login success, store user in session
passport.serializeUser(function(user, done){
  done(null, user);
});

// read user in every page accesses
passport.deserializeUser(function(user, done){
  done(null, user);
});

/*router*/
var index = require('./routes/index');
var auth = require('./routes/auth/urls');
var drive = require('./routes/drive/urls');
/*router*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.pretty = true;

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));


app.use(cookieSession({
  keys: ['testbox'],
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', index);
app.use('/auth', auth);
app.use('/drive', drive);

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

module.exports = app;
