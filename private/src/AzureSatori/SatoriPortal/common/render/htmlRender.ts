/// <reference path="../../typings/main.d.ts" />
/// <reference path="../fsutil.ts" />
import fs_ = require("fs");
import path_ = require("path");
import ejs_ = require("ejs");

import fsutil_ = require("../fsutil");

var _viewFolder: string;
var _preload: boolean;


/**
 * @path: relative path (relative to viewFoler)
 */
function extractViewName(path: string): string {
    var ext = path_.extname(path);
    return path.substr(0, path.length - ext.length);
}

export function configure(folder: string, preLoad: boolean) {

    _viewFolder = folder;

    // if (preLoad) {
    //     fsutil_.walkSync(folder).forEach(function (f) {
    //         var name = f.name;
    //         var stat = f.stat;
    //         if (stat.isFile()) {
    //             var ext = path_.extname(name);
    //             if (ext === ".ejs" || (ext.toUpperCase() === ".EJS")) {
    //                 var content = fs_.readFileSync(folder + "/" + name, "utf8");

    //                 ejs_.compile(content, { filename: name, cache: true })
    //             }
    //         }
    //     });
    // }
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