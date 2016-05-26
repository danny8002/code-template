/// <reference path="../typings/main.d.ts" />
/// <reference path="./backendservice.ts" />

import express_ = require('express');
import Path = require('path');

import SatoriRestClient = require("./backendservice");

/* GET home page. */
// router.get('/', function (req, res, next) {
//     //res.render('index', { title: 'Express' });
//     //res.setHeader('Content-Type', 'text/html');
//     res.sendFile('views/index.html', { root: root }, <Express.Errback>function (err) {
//         if (err) return next(err);
//     });
// });

export function findTenant(
    req: express_.Request,
    res: express_.Response,
    next: express_.NextFunction,
    tenant: string): void {

}
