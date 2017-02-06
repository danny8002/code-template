/// <reference path="../typings/main.d.ts" />

import Express = require('express');
import Path = require('path');

import Common = require("../common/sysinfo");
import SatoriRestClient = require("../common/backendservice");
import render_ = require("../common/layoutRender");

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

    render_.sendView(
        req,
        res,
        next,
        "index2.html",
        null,
        {
            title: "Satori Portal Home",
            headerScripts: [],
            footerScripts: ["/javascripts/homepage/sp.js", "/javascripts/homepage/spfx.js"],
            otherCss: []
        },
        null);
});

module.exports = router;
