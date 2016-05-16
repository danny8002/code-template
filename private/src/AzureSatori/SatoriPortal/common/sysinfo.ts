/// <reference path="../typings/main.d.ts" />

import Path = require("path");
import OS = require("os");
import ChildProcess = require("child_process");

interface SysInfoCallBack {
    (err: Error, data: { [key: string]: any }): void
}

export function sysinfo(fn: SysInfoCallBack): void {

    var dict = <{ [key: string]: any }>{};

    dict["__dirname"] = __dirname;
    dict["os.tmpdir()"] = OS.tmpdir();

    dict["process.arch"] = process.arch;
    dict["process.argv"] = process.argv;
    dict["process.env"] = process.env;
    dict["process.versions"] = process.versions;

    dict["os.type()"] = OS.type();
    dict["os.platform()"] = OS.platform();

    dict["os.totalmem()"] = OS.totalmem();
    dict["os.cpus()"] = OS.cpus();

    var appcmd = process.env["windir"] + "\\system32\\inetsrv\\appcmd.exe";

    ChildProcess.exec(appcmd + " list site", { encoding: "utf8" }, (e, stdout, stderr) => {
        if (e != null) {
            dict["appcmd_list_site_error"] = e;
        }

        dict["appcmd_list_site_stdout"] = stdout;
        dict["appcmd_list_site_stderr"] = stderr;

        fn(null, dict);
    });
}