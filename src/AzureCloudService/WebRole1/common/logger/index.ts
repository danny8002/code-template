/// <reference path="../../typings/main.d.ts" />

import fs_ = require("fs-extra");
import log4js_ = require("log4js");
import path_ = require("path");


export interface Logger {
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    fatal(message: string, ...args: any[]): void;
}

export function configure(path: string): void {
    var cfg = <log4js_.IConfig>JSON.parse(fs_.readFileSync(path, "utf8"));
    mkdir4Log(cfg);
    log4js_.configure(cfg);
}

export function getSatoriRestClientLogger(): Logger {
    return log4js_.getLogger();
}

export function getRunServiceLogger(): Logger {
    return log4js_.getLogger("RunService");
}

function mkdir4Log(cfg: log4js_.IConfig): void {
    var cwd = process.cwd();

    (cfg.appenders || [])
        .filter(function (c) {
            return c.type === "file";
        })
        .map(function (s: log4js_.FileAppenderConfig) {
            return s.filename
        }).filter(function (f) {
            return f != null;
        }).forEach(function (f) {
            var dir = path_.dirname(f);
            fs_.ensureDirSync(dir);
        });
}


var CURRENT_PROJECT_DIR: string = path_.resolve(__dirname, "..", "..");

/**
 * @param fileName __filename
 * @return relative path
 */
export function relative2Proj(fileName: string): string {
    return path_.relative(CURRENT_PROJECT_DIR, fileName);
}