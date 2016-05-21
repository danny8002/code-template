/// <reference path="../../typings/main.d.ts" />
/// <reference path="../fsutil.ts" />
import fs_ = require("fs");
import path_ = require("path");
import ejs_ = require("ejs");

import fsutil_ = require("../fsutil");

/**
 * Layout use EJS, define block in here and handle it in renderLayout()
 */
var SECTION_CONTENT: string = "block_content";

var LAYOUT_NAME: string = "layout";
var TEMPLATE_EXTNAME: string = ".ejs";

/**
 * cache for layout
 */
var _cacheLayout: ejs_.TemplateFunction;

var _viewFolder: string;
var _preload: boolean;

var _viewCache: { [key: string]: string } = {};

export function configure(folder: string, preLoad: boolean) {

    _viewFolder = folder;

    if (preLoad) {
        fsutil_.walkSync(folder).forEach(function (f) {
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
    * Render `view` with the given `options` and optional callback `fn`.
    * When a callback function is given a response will _not_ be made
    * automatically, otherwise a response of _200_ and _text/html_ is given.
    *
    * Options:
    *
    *  - `cache`     boolean hinting to the engine it should cache
    *  - `filename`  filename of the view being rendered
    */
export function render(
    view: string,
    data: { [key: string]: any },
    options: { layout?: string, cache?: boolean, filename?: string },
    callback: (err: Error, html: string) => void): void {
    view = extractViewName(view);

}

export function renderHtmlView(
    view: string,
    data: { [key: string]: any },
    options: { layout?: string, cache?: boolean, filename?: string },
    callback: (err: Error, html: string) => void): void {

    view = extractViewName(view);



}

/**
 * @path: relative path (relative to viewFoler), remove extname
 */
function extractViewName(path: string): string {
    var ext = path_.extname(path);
    return path.substr(0, path.length - ext.length);
}

function renderLayout(
    layoutPath: string,
    layoutData: { [key: string]: any },
    viewHtml: string,
    callback: (err: Error, html: string) => void): void {

    var layoutFullPath = _viewFolder + "/" + layoutPath;

    // data, opts

    var layoutDataCopy: { [key: string]: any } = {};
    for (var k in layoutData) {
        layoutDataCopy[k] = layoutData[k];
    }

    layoutDataCopy[SECTION_CONTENT] = viewHtml;

    try {
        var result = <string>ejs_.render(layoutDataCopy, { cache: true, filename: layoutFullPath })
        callback(null, result);
    } catch (e) {
        callback(<Error>e, undefined);
    }
}

function loadTemplate(path: string, callback: (err: Error, html: string) => void): void {
    fs_.exists(path, function (exist) {
        if (!exist) {
            callback(new TypeError("Cannot find file: [" + path + "]!"), undefined);
        } else {
            fs_.readFile(path, "utf8", callback);
        }
    })
}
