/// <reference path="../typings/main.d.ts" />

import Express = require('express');
import Path = require('path');

import Common = require("../common/sysinfo");
import SatoriRestClient = require("../common/backendservice");
import render_ = require("../common/layoutRender");

var router = Express.Router();
var root = Path.resolve(__dirname, '..');

router.get('/', function (req, res, next) {

    render_.sendView(
        req,
        res,
        next,
        "tracing.html",
        null,
        {
            title: "Streaming Pipeline Data Tracing",
            headerScripts: [],
            footerScripts: [
                "/javascripts/angular-1.5.8/angular.js",
                "/javascripts/angular-1.5.8/angular-cookies.min.js",
                "/javascripts/ui-bootstrap-tpls-2.0.0.min.js",
                "/javascripts/vis/vis.min.js"
            ],
            otherCss: [
                "/stylesheets/tracing.css"
            ]
        },
        null);
});

module.exports = router;

