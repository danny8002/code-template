/// <reference path="../../typings/main.d.ts" />
/// <reference path="./requestutil.ts" />
/// <reference path="./configuration.ts" />

import Http_ = require("http");
import Util_ = require("util");
import Url_ = require("url");
import QueryString_ = require("querystring");
import Zlib_ = require("zlib");
import Events_ = require("events");
import Path_ = require('path');

import ReqUtil = require("./requestutil");
import Config = require("./configuration");

export class JobServiceClient {
    private url: string;
    private appId: string;

    private cacheGroups: string[];

    constructor(url: string, appId: string) {
        if (url == null || url.length <= 0 || url.trim().length <= 0) {
            throw new TypeError("[url] for JobServiceClient is null, empty, or whitespace!");
        }

        this.url = url.trim();
        this.appId = appId;
    }

    public autoUpdateSecurityGroups(
        updateInterval: number,
        update: (err: Error, nowGroup: string[], oldGroup: string[]) => void): void {
        if (updateInterval > 0) {
            var self = this;
            var fn = update || function () { };
            setInterval(() => {
                var old = self.cacheGroups.slice(0);
                self.getSecurityGroups((e, d) => {
                    update(e, d, old);
                })
            }, updateInterval * 1000);
        }
    }

    public getSecurityGroups(callback: (err: Error, data: string[]) => void): void {
        if (typeof callback !== 'function') {
            throw new TypeError("[callback] is required!");
        }

        var self = this;

        if (self.cacheGroups != null && self.cacheGroups.length > 0) {
            var copy = self.cacheGroups.slice(0);
            setTimeout(callback, 0, null, copy);
            return;
        }

        return this.getSecurityGroupsInternal((e, d) => {
            if (e) return callback(e, undefined);
            self.cacheGroups = d.slice(0);
            return callback(null, d);
        });
    }

    private getSecurityGroupsInternal(callback: (err: Error, data: string[]) => void): void {

        var options = ReqUtil.buildRequestOptions(
            Util_.format("%s/SecurityService/Users", this.url),
            { "appid": this.appId },
            Config.additionalHeaders);

        return ReqUtil.sendRequestWithResponseModel<string[]>(options, null, callback);
    }


}

