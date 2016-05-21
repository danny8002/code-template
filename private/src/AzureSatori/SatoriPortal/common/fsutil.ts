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