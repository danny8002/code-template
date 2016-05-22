/// <reference path="typings/main.d.ts" />
/// <reference path="routes/main.ts" />
/// <reference path="models/main.d.ts" />
/// <reference path="common/util/index.ts" />

import Express = require('express');
import Path = require('path');
import ExpressSession = require("express-session");
import Passport = require("passport");

//import favicon = require('serve-favicon');
//import logger = require('morgan');
import CookieParser = require('cookie-parser');
import BodyParser = require('body-parser');

import RouteCollection = require('./routes/main');

import util_ = require("./common/util");

var app = Express();

// view engine setup
app.set('views', Path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(BodyParser.json());
app.use(BodyParser.urlencoded({ extended: false }));
app.use(CookieParser());
app.use(Express.static(Path.join(__dirname, 'public')));

app.use(ExpressSession({ secret: 'keyboard cat2', resave: true, saveUninitialized: true }));
app.use(Passport.initialize());
app.use(Passport.session());

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
app.use(<Express.ErrorRequestHandler>function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: util_.isProduction() ? {} : err
    });
});


module.exports = app;
