/// <reference path="../typings/main.d.ts" />
/// <reference path="../typings/index.d.ts" />
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

/**
 * 'path' is relative to view folder
 */

export function configure(folder: string, preLoad?: boolean) {
    preLoad = (preLoad === true || preLoad === false) ? preLoad : util_.isProduction();
    Render = new ViewRender(folder, preLoad);
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

type ViewCache = { [key: string]: string };

interface ViewContentLoader {
    (viewFolder: string, view: string, data: { [key: string]: any }, callback: (err: Error, html: string) => void): void;
}

export interface ViewRenderOptions {
    layout: string;
}

export class ViewRender {
    private _cache: ViewCache;
    constructor(private _folder: string, private _preLoad: boolean) {
        this._cache = {};
        if (_preLoad) ViewRender.preloadEJSTemplates(_folder);
    }

    public render(
        view: string,
        options: ViewRenderOptions,
        data: { [key: string]: any },
        callback: (err: Error, html: string) => void): void {

        let self = this;
        if (!util_.isProduction()) {
            ejs_.clearCache();
            self._cache = {};
        }

        data = data || {};

        let layout = (options || <ViewRenderOptions>{}).layout || LAYOUT_NAME;

        let fullPath = self._folder + "/" + view;
        let content = self._cache[fullPath];
        if (content !== undefined) {
            data[SECTION_CONTENT] = content;
            ViewRender.renderEJSInternal(self._folder, layout, data, callback);
            return;
        }


        let ext = path_.extname(view).toLowerCase();

        let loader: ViewContentLoader;
        switch (ext) {
            case ".html":
                loader = function htmlLoader(f, v, d, c): void {
                    return loadTemplate(f + "/" + v, c);
                }
                break;
            case ".ejs":
                loader = ViewRender.renderEJSInternal;
                break;
        }

        loader(self._folder, view, data, function (e, h) {
            if (e) return callback(e, undefined);
            self._cache[fullPath] = h;
            data[SECTION_CONTENT] = h;
            ViewRender.renderEJSInternal(self._folder, layout, data, callback);
        });
    }

    public static preloadEJSTemplates(folder: string): void {
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

    public static renderEJSInternal(
        viewFolder: string,
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

            var fullPath = viewFolder + "/" + path;

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
}

export var Render: ViewRender = null;