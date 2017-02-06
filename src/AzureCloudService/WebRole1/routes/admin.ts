/// <reference path="../typings/main.d.ts" />

import Express = require('express');
import Path = require('path');

import sysInfo_ = require("../common/sysinfo");
import render_ = require("../common/layoutRender");
import util_ = require("../common/util");

var router_ = Express.Router();

router_.get("/sysinfo", function (req, res, next) {
    sysInfo_.sysinfo(
        (e, d) => {
            if (e != null) {
                res.statusMessage = "Cannot get system info: " + JSON.stringify(e);
                res.sendStatus(500);
            } else {
                var json = JSON.stringify(d, null, 4);
                res.setHeader("Content-Type", "application/json");
                res.send(json);
            }
        }
    );
});

router_.get("/request", function (req, res, next) {
    var json = util_.stringify(req, 4);
    res.setHeader("Content-Type", "application/json");
    res.send(json);
});
module.exports = router_;
