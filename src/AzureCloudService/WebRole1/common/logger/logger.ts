
/// <reference path="../../typings/main.d.ts" />

import path_ = require("path");
/**WARNNING: if change the path for this file, please also change CURRENT_PROJECT_DIR */


var CURRENT_PROJECT_DIR: string = path_.resolve(__dirname, "..", "..");

/**
 * @param fileName __filename
 * @return relative path
 */
export function relative2Proj(fileName: string): string {
    return path_.relative(CURRENT_PROJECT_DIR, fileName);
}

export function configure() {

}