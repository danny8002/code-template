/// <reference path="../typings/main.d.ts" />
/// <reference path="../common/sysinfo.ts" />
/// <reference path="../common/backendservice.ts" />
/// <reference path="../common/layoutRender.ts" />


import Express = require('express');
import Path = require('path');

import Common = require("../common/sysinfo");
import SatoriRestClient = require("../common/backendservice");
import layoutRender_ = require("../common/layoutRender");

var router_ = Express.Router();

router_.get("/sysinfo", function (req, res, next) {
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

router_.get("/groups", function (req, res, next) {

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
module.exports = router_;
