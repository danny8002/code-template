/// <reference path="../typings/main.d.ts" />
/// <reference path="../common/authentication.ts" />

/// <reference path="./index.ts" />
/// <reference path="./admin.ts" />
/// <reference path="./users.ts" />

import Express = require('express');

import Authentication = require("../common/authentication");
import IndexRoute = require('./index');
import UsersRoute = require('./users');
import adminRoute_ = require('./admin');

export function registerAll(app: Express.Express): void {

    // TODO: here find the reason why should put /login before /
    app.use('/', registerAuthRoute(null));

    app.use('/', ensureAuthenticated, <Express.Router>IndexRoute);
    app.use('/users', ensureAuthenticated, <Express.Router>UsersRoute);
    app.use('/admin', ensureAuthenticated, <Express.Router>adminRoute_);
}

function ensureAuthenticated(req: Express.Request, res: Express.Response, next: Express.NextFunction): any {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        console.log('redirect to /login because no auth: ' + req.url);
        return res.redirect('/login');
    }
}

function registerAuthRoute(app2: Express.Express): Express.Router {

    var strategyName = Authentication.UsedStrategy.name;
    var usedPassport = Authentication.UsedPassport;
    console.log('Use strategy to authenticate: ' + strategyName);

    var authFn: Express.RequestHandler = usedPassport.authenticate(strategyName, { failureRedirect: '/login' });

    function authSuccessCallBack(req: Express.Request, res: Express.Response, next: Express.NextFunction): any {
        console.log('We received a return from AzureAD!');
        //console.log('redirect to /: ' + JSON.stringify(req));
        res.redirect('/');
    }

    var app = Express.Router();

    // TODO: After login success, go to the the original URL
    app.get('/login', (req, res, next) => {
        return authFn(req, res, next);
    }, authSuccessCallBack);

    // POST /auth/openid
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in OpenID authentication will involve redirecting
    //   the user to their OpenID provider.  After authenticating, the OpenID
    //   provider will redirect the user back to this application at
    //   /auth/openid/return
    app.get('/auth/openid', authFn, authSuccessCallBack);

    // GET /auth/openid/return
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/openid/return', authFn, authSuccessCallBack);

    // POST /auth/openid/return
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.post('/auth/openid/return', authFn, authSuccessCallBack);

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    return app;
}