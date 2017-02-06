/// <reference path="../typings/main.d.ts" />

import Express = require('express');
import Path = require('path');

import Common = require("../common/sysinfo");
import SatoriRestClient = require("../common/backendservice");

var router = Express.Router();
var root = Path.resolve(__dirname, '..');

/* GET home page. */
// router.get('/', function (req, res, next) {
//     //res.render('index', { title: 'Express' });
//     //res.setHeader('Content-Type', 'text/html');
//     res.sendFile('views/index.html', { root: root }, <Express.Errback>function (err) {
//         if (err) return next(err);
//     });
// });

router.get("/groups", function (req, res, next) {

    var jbc = SatoriRestClient.jobServiceClient;
    jbc.getSecurityGroups(
        (e, d) => {
            if (e != null) {
                res.statusMessage = "Cannot get system info: " + JSON.stringify(e);
                res.send(500);
            } else {
                res.send(d.join("\r"));
            }
        }
    );
});

module.exports = router;
