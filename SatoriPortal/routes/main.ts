/// <reference path="../typings/main.d.ts" />

import Express = require('express');

import IndexRoute = require('./index');
import UsersRoute = require('./users');


export function registerAll(app: Express.Express): void {
    app.use('/', <Express.Router>IndexRoute);
    app.use('/users', <Express.Router>UsersRoute);
}