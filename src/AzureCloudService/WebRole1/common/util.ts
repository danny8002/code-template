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

export function newGuid(): string {
    function gen(count: number): string {
        var out = "";
        for (var i = 0; i < count; i++) {
            out += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return out;
    }

    var id = [gen(2), gen(1), gen(1), gen(1), gen(3)].join("-");
    console.log(id);
    return id;
}

export function stringify(
    value: any,
    space?: string | number): string {

    let cache: any[] = [];
    let str = JSON.stringify(value, function (k, v) {
        if (typeof v === 'object' && v !== null) {
            if (cache.indexOf(v) !== -1) {
                // Circular reference found, discard key
                return "[Circular]";
            }
            // Store value in our collection
            cache.push(v);
        }
        return v;
    }, space);
    cache = null; // Enable garbage collection

    return str;
}

