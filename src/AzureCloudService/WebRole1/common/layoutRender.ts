/// <reference path="../typings/main.d.ts" />
/// <reference path="../typings/index.d.ts" />

import fs_ = require("fs");
import path_ = require("path");
import ejs_ = require("ejs");
import express_ = require("express");

import util_ = require("./util");
import azureAd_ = require("passport-azure-ad");

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
export interface LayoutUserDefinedData {
    title?: string,
    headerScripts?: string[],
    footerScripts?: string[],
    otherCss?: string[]
}
export interface LayoutData extends LayoutUserDefinedData {
    displayName: string,
    email: string,
    block_content: string,
    model: string
}

export interface PageModel {
    layout?: LayoutData;
    [key: string]: any;
}

export function sendView(
    req: express_.Request,
    res: express_.Response,
    next: express_.NextFunction,
    view: string,
    options: ViewRenderOptions,
    userDefinedData: LayoutUserDefinedData,
    pageData: PageModel): void {

    let user = <azureAd_.OIDCProfile>req.user;

    let layoutData = <LayoutData>(userDefinedData || {});
    layoutData.displayName = user.displayName;
    layoutData.email = user.upn;
    layoutData.block_content = null;
    layoutData.model = pageData == null ? "" : JSON.stringify(pageData);

    pageData = pageData || <PageModel>{};
    pageData.layout = layoutData;

    Render.render(view, options, layoutData, pageData, function (e, h) {
        if (e != null) return next(e);
        res.send(h);
    });
}

function loadTemplate(fullPath: string, callback: (err: Error, html?: string) => void): void {
    fs_.exists(fullPath, function (exist) {
        if (!exist) {
            callback(new TypeError("Cannot find file: [" + fullPath + "]!"));
        } else {
            fs_.readFile(fullPath, "utf8", callback);
        }
    })
}

type ViewCache = { [key: string]: string };

interface ViewContentLoader {
    (viewFolder: string, view: string, data: { [key: string]: any }, callback: (err: Error, html?: string) => void): void;
}

export function configure(folder: string, preLoad?: boolean) {
    preLoad = (preLoad === true || preLoad === false) ? preLoad : util_.isProduction();
    Render = new ViewRender(folder, preLoad);
}

export interface ViewRenderOptions {
    layout: string;
}

export class ViewRender {
    private _staticFileCache: ViewCache;
    constructor(private _folder: string, private _preLoad: boolean) {
        this._staticFileCache = {};
        if (_preLoad) ViewRender.preloadEJSTemplates(_folder);
    }

    public render(
        view: string,
        options: ViewRenderOptions,
        layoutData: { [key: string]: any },
        viewData: { [key: string]: any },
        callback: (err: Error, html?: string) => void): void {

        let self = this;
        if (!util_.isProduction()) {
            ejs_.clearCache();
            self._staticFileCache = {};
        }

        layoutData = layoutData || {};
        viewData = viewData || {};

        let layout = (options || <ViewRenderOptions>{}).layout || LAYOUT_NAME;
        let fullPath = self._folder + "/" + view;
        let ext = path_.extname(view).toLowerCase();
        let isStaticFile = false;

        let loader: ViewContentLoader;
        switch (ext) {
            case ".html":
                loader = function htmlLoader(f, v, d, c): void {
                    return loadTemplate(f + "/" + v, c);
                }
                isStaticFile = true;
                break;
            case ".ejs":
                loader = ViewRender.renderEJSInternal;
                break;
            default:
                loader = null;
                break;
        }

        if (loader === null) {
            return callback(new Error(`Not supported view kind ${ext}`));
        }

        let content = self._staticFileCache[fullPath];
        if (isStaticFile && content !== undefined) {
            layoutData[SECTION_CONTENT] = content;
            ViewRender.renderEJSInternal(self._folder, layout, layoutData, callback);
            return;
        }

        loader(self._folder, view, viewData, function (e, h) {
            if (e) return callback(e);
            if (isStaticFile) self._staticFileCache[fullPath] = h;
            layoutData[SECTION_CONTENT] = h;
            ViewRender.renderEJSInternal(self._folder, layout, layoutData, callback);
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
        callback: (err: Error, html?: string) => void): void {

        if (ejs_.cache.get(path) != null) {
            let e: Error = null;
            let d: string = null;
            try {
                d = ejs_.render(null, data || {}, { cache: true, filename: path });
            } catch (_) {
                e = <Error>_;
            }

            setTimeout(callback, 0, e, d);

        } else {

            let fullPath = viewFolder + "/" + path;

            loadTemplate(fullPath, function (e, h) {
                if (e != null) return callback(e);

                let _e: Error = null;
                let _d: string = null;
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