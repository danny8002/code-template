/// <reference path="typings/main.d.ts" />
/// <reference path="routes/main.ts" />
/// <reference path="models/HttpError.ts" />

import Express = require('express');
import Path = require('path');
//import favicon = require('serve-favicon');
//import logger = require('morgan');
import CookieParser = require('cookie-parser');
import BodyParser = require('body-parser');

import RouteCollection = require('./routes/main');

var app = Express();

// view engine setup
app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(CookieParser());
app.use(Express.static(Path.join(__dirname, 'public')));

RouteCollection.registerAll(app);

// catch 404 and forward to error handler
app.use(<Express.RequestHandler>function (req, res, next) {
    var err = <SatoriPortal.StatusError>new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(<Express.ErrorRequestHandler>function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(<Express.ErrorRequestHandler>function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
