/// <reference path="../typings/main.d.ts" />

import Express = require('express');
import Path = require('path');

import Common = require("../common/sysinfo");
import SatoriRestClient = require("../common/backendservice");
import render_ = require("../common/layoutRender");

var router_ = Express.Router();

router_.get("/sysinfo", function (req, res, next) {
    Common.sysinfo(
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

router_.get("/groups", function (req, res, next) {

    var jbc = SatoriRestClient.jobServiceClient;
    jbc.getSecurityGroups(
        (e, d) => {
            if (e != null) {
                res.statusMessage = "Cannot get system info: " + JSON.stringify(e);
                res.sendStatus(500);
            } else {
                render_.sendView(req, res, next,
                    "admin/groups.ejs",
                    null,
                    {
                        title: "Satori Portal Home",
                        headerScripts: [],
                        footerScripts: ["/javascripts/homepage/sp.js", "/javascripts/homepage/spfx.js"],
                        otherCss: []
                    },
                    {
                        groups: d || []
                    });
            }
        }
    );
});
module.exports = router_;
