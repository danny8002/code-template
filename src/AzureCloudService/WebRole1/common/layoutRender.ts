/// <reference path="../typings/main.d.ts" />
/// <reference path="./util.ts" />
import fs_ = require("fs");
import path_ = require("path");
import ejs_ = require("ejs");
import express_ = require("express");

import util_ = require("./util");

/**
 * if System path is case-sensitive, we should refine this module
 */

/**
 * Layout use EJS, define block in here and handle it in renderLayout()
 */
var SECTION_CONTENT: string = "block_content";

var LAYOUT_NAME: string = "layout.ejs";
var TEMPLATE_EXTNAME: string = ".ejs";

var _viewFolder: string;
var _preload: boolean;

var _Cache: { [key: string]: string } = {};

/**
 * 'path' is relative to view folder
 */

export function configure(folder: string, preLoad: boolean) {

    _viewFolder = folder;

    if (preLoad) {
        util_.walkSync(folder).forEach(function (f) {
            var name = f.name;
            var stat = f.stat;
            if (stat.isFile()) {
                var ext = path_.extname(name);
                if (ext === ".ejs" || (ext.toUpperCase() === ".EJS")) {
                    var content = fs_.readFileSync(folder + "/" + name, "utf8");

                    ejs_.compile(content, { filename: name, cache: true })
                }
            }
        });
    }
}


/**
 * @view string view name relative to view folder
 * @data key-value layout data
 * @
 */
export function renderHtml(
    view: string,
    data: { [key: string]: any },
    callback: (err: Error, html: string) => void): void {

    if (!util_.isProduction()) {
        ejs_.clearCache();
        _Cache = {};
    }

    view = extractViewName(view);
    data = data || {};

    var fileName = view + ".html";
    var fullPath = getfullPath(fileName);

    var layout = LAYOUT_NAME;

    var content = _Cache[fileName];
    if (content === undefined) {
        loadTemplate(fullPath, function (e, h) {
            if (e) return callback(e, undefined);
            _Cache[fileName] = h;
            data[SECTION_CONTENT] = h;
            renderEJSInternal(layout, data, callback);
        })
    }
    else {
        data[SECTION_CONTENT] = content;
        renderEJSInternal(layout, data, callback);
    }
}

export function renderEJS(
    view: string,
    data: { [key: string]: any },
    callback: (err: Error, html: string) => void): void {

    if (!util_.isProduction()) {
        ejs_.clearCache();
        _Cache = {};
    }

    view = extractViewName(view);
    data = data || {};

    var fileName = view + ".ejs";
    var layout = LAYOUT_NAME;

    var content = _Cache[fileName];
    if (content === undefined) {
        renderEJSInternal(fileName, data, function (e, h) {
            if (e) return callback(e, undefined);
            _Cache[fileName] = h;
            data[SECTION_CONTENT] = h;
            renderEJSInternal(layout, data, callback);
        });
    }
    else {
        data[SECTION_CONTENT] = content;
        renderEJSInternal(layout, data, callback);
    }
}

/**
 * @path: relative path (relative to viewFoler), remove extname
 */
function extractViewName(path: string): string {
    var ext = path_.extname(path);
    return path.substr(0, path.length - ext.length);
}

function getfullPath(path: string): string {
    return _viewFolder + "/" + path;
}

function renderEJSInternal(
    path: string,
    data: { [key: string]: any },
    callback: (err: Error, html: string) => void): void {


    if (ejs_.cache.get(path) != null) {
        var e: Error = null;
        var d: string = null;
        try {
            d = ejs_.render(null, data || {}, { cache: true, filename: path });
        } catch (_) {
            e = <Error>_;
        }

        setTimeout(callback, 0, e, d);

    } else {

        var fullPath = getfullPath(path);

        loadTemplate(fullPath, function (e, h) {
            if (e != null) return callback(e, null);

            var _e: Error = null;
            var _d: string = null;
            try {
                _d = ejs_.render(h, data || {}, { cache: true, filename: path });
            } catch (_) {
                _e = <Error>_;
            }

            setTimeout(callback, 0, _e, _d);
        });
    }
}

function loadTemplate(fullPath: string, callback: (err: Error, html: string) => void): void {
    fs_.exists(fullPath, function (exist) {
        if (!exist) {
            callback(new TypeError("Cannot find file: [" + fullPath + "]!"), undefined);
        } else {
            fs_.readFile(fullPath, "utf8", callback);
        }
    })
}
