/// <reference path="../typings/main.d.ts" />
/// <reference path="../common/sysinfo.ts" />
/// <reference path="../common/backendservice.ts" />
/// <reference path="../common/layoutRender.ts" />
/// <reference path="../common/layoutUtil.ts" />

import Express = require('express');
import Path = require('path');

import Common = require("../common/sysinfo");
import SatoriRestClient = require("../common/backendservice");
import { Render as render_ } from "../common/layoutRender";
import layoutUtil_ = require("../common/layoutUtil");

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


/* GET home page. */

router.get('/', function (req, res, next) {

    render_.render(
        "index2.html",
        null,
        layoutUtil_.extractLayoutData(req, res)({
            title: "Satori Portal Home",
            headerScripts: [],
            footerScripts: ["/javascripts/homepage/sp.js", "/javascripts/homepage/spfx.js"],
            otherCss: []
        }),
        function (e, h) {
            if (e != null) return next(e);
            res.send(h);
        });
});

router.get("/sysinfo", function (req, res, next) {
    Common.sysinfo(
        (e, d) => {
            if (e != null) {
                res.statusMessage = "Cannot get system info: " + JSON.stringify(e);
                res.send(500);

            } else {
                var json = JSON.stringify(d, null, 4);
                res.setHeader("Content-Type", "application/json");
                res.send(json);
            }
        }
    );
});

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
