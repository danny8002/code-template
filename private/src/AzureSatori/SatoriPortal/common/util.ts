/// <reference path="../typings/main.d.ts" />
import fs_ = require("fs");

export interface FileAndStat {
    name: string;
    stat: fs_.Stats;
}

export function walkSync(folder: string): FileAndStat[] {
    var items: FileAndStat[] = [];
    fs_.readdirSync(folder).forEach(function (f) {
        var fullPath = folder + "/" + f;
        var stat = fs_.statSync(fullPath);

        items.push({ name: f, stat: stat });

        if (stat.isDirectory()) {
            walkSync(fullPath).forEach(function (_) {
                _.name = f + "/" + _.name;
                items.push(_);
            })
        }
    });
    return items;
}

export function isProduction(): boolean {
    return process.env.NODE_ENV === "production";
}

export function toError(e: any): Error {
    if (e instanceof Error) {
        return <Error>e;
    }

    // error like
    if (e != null && typeof e.message === 'string') {
        return <Error>e;
    }

    return new Error(String(e));
}

export function merge(dest: { [key: string]: any }, src: { [key: string]: any }): { [key: string]: any } {
    var d = dest || {};
    var s = src || {};
    for (var k in s) {
        d[k] = s[k];
    }
    return d;
}
