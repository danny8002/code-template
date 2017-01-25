/// <reference path="../../typings/main.d.ts" />
/// <reference path="./utils.ts" />

import Http_ = require("http");
import Util_ = require("util");
import Url_ = require("url");
import QueryString_ = require("querystring");
import Zlib_ = require("zlib");
import Events_ = require("events");
import Path_ = require('path');
var ContentType_ = require("content-type");

import ClientUtil = require("./utils");

export interface ExtHeaders {
    userPrincipalName?: string;
    userGroups?: string[];
    [key: string]: string | string[] | number;
}

export function buildRequestOptions(urlStr: string, addQueries?: { [key: string]: string | number }, addHeaders?: ExtHeaders): Http_.RequestOptions {
    if (urlStr == null) {
        throw new Error("argument [urlStr] is required!");
    }

    // path should not contain #hash
    var url = Url_.parse(urlStr, true, false);

    addQueries = addQueries || {};

    for (var k in addQueries) {
        url.query = url.query || {};
        url.query[k] = addQueries[k];

        if (url.search == null || url.search.length <= 0) {
            url.search = Util_.format("?%s=%s", k, String(addQueries[k]));
        } else {
            url.search = url.search + Util_.format("&%s=%s", k, String(addQueries[k]));
        }
    }

    url.path = url.pathname + url.search;

    var options = <Http_.RequestOptions>{};
    options.method = "GET";
    options.protocol = url.protocol;
    options.host = url.host;
    options.hostname = url.hostname;
    options.port = undefined;
    if (url.port != null && url.port.length > 0) {
        options.port = parseInt(url.port);
    }

    options.path = url.path;
    options.auth = url.auth;

    options.headers = {};

    addHeaders = addHeaders || {};
    for (var k in addHeaders) {
        var v = addHeaders[k];
        if (Array.isArray(v)) {
            options.headers[k] = v.join(",");
        }
        else {
            options.headers[k] = addHeaders[k];
        }
    }

    return options;
}

export function sendRequest(options: Http_.RequestOptions, body: { [key: string]: any }, callback: (err: Error, data: string) => void): void {
    var watch = new ClientUtil.StopWatch();

    var payload: string = body != null ? JSON.stringify(body) : undefined;

    if (options == null) {
        return callback(new Error("argument [options] is null!"), undefined);
    }

    if (options.method == null) {
        return callback(new Error("http [method] in [options] must be provided!"), undefined);
    }

    var req = Http_.request(options, res => {
        var elapsed = watch.stop();

        var t = <string>res.headers["content-type"];
        if (t == null) {
            return callback(null, null);
        }

        interface ContentTypeParseResult {
            type: string,
            parameters: { [key: string]: string }
        }

        var encoding: string;
        try {
            var type = <ContentTypeParseResult>ContentType_.parse(t);

            encoding = (type.parameters || {})["charset"] || "utf8";

        } catch (e) {
            return callback(new Error((<Error>e).message + ", content-type = " + t), undefined);
        }

        var stream: NodeJS.ReadableStream;
        try {
            stream = MiddleWare.decompress(req, res);
        } catch (e) {
            return callback(e, undefined);
        }

        return MiddleWare.readAsString(stream, encoding, callback);
    });

    req.on("error", (err: any) => {
        return callback(ClientUtil.toError(err), undefined);
    });

    if (payload != null) req.write(payload);

    req.end();
}

export function sendRequestWithResponseModel<T>(
    options: Http_.RequestOptions,
    body: { [key: string]: any },
    callback: (err: Error, data: T) => void): void {

    return sendRequest(options, body, (err, data) => {
        if (err) return callback(err, undefined);

        setTimeout(ParseModel.parseDataModel(data, callback), 0);
    });
}


namespace MiddleWare {

    export function decompress(req: Http_.ClientRequest, res: Http_.IncomingMessage): NodeJS.ReadableStream {
        var emitter: NodeJS.ReadableStream = res;

        var encoding = (<string>res.headers["content-encoding"] || "").toLowerCase();

        switch (encoding) {
            case "gzip":
                {
                    var gunzip = Zlib_.createGunzip();
                    res.pipe(gunzip);
                    emitter = gunzip;
                }
                break;
            case "deflate":
                {
                    var inflate = Zlib_.createInflate();
                    res.pipe(inflate);
                    emitter = inflate;
                }
                break;
            case "":
            case "identity":
                emitter = res;
                break;
            default:
                var msg = "Unsupported compress method [" + encoding + "] in Response header!";
                throw new Error(msg);
        }

        return emitter;
    }

    export function readAsString(
        res: NodeJS.ReadableStream,
        encoding: string,
        callback: ClientUtil.NodeStyleCallBack<string>) {

        res.setEncoding(encoding);

        var buffer: string[] = [];
        res.on("data", (chunk: string) => {
            buffer.push(<string>chunk);
        });

        res.on("end", function () {
            var data = buffer.join("");
            return callback(null, data);
        });
    }
}

namespace ParseModel {

    var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
    var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

    function dateParser(key: any, value: any): any {
        if (value != null && typeof value === "string") {
            var a = reISO.exec(value);
            if (a != null) {
                return new Date(value);
            }

            a = reMsAjax.exec(value);
            if (a != null) {
                var b = a[1].split(/[-+,.]/);
                return new Date(b[0] ? +b[0] : 0 - +b[1]);
            }
        }
        return value;
    };

    function lowerKey(key: any, value: any): any {
        if (value != null && typeof value === "object") {
            for (var k in value) {
                if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
                    value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
                    delete value[k];
                }
            }
        }

        return value;
    }


    export function parseDataModel<T>(data: string, cb: (err: Error, data: T) => void): void {

        var m: T;

        try {
            var watch = new ClientUtil.StopWatch();

            m = <T>JSON.parse(data, (k: any, value: any) => {

                value = dateParser(k, value);

                value = lowerKey(k, value);

                return value;
            });

            var elapse = watch.stop();
            setTimeout(cb(null, m), 0);

        } catch (err) {
            setTimeout(function () { cb(ClientUtil.toError(err), undefined); }, 0);
        }
    }

}