/// <reference path="../typings/main.d.ts" />
/// <reference path="./util.ts" />
import express_ = require("express");
import util_ = require("./util");
import azureAd_ = require("passport-azure-ad");

export interface PageData {
    title: string,
    headerScripts?: string[],
    footerScripts?: string[],
    otherCss?: string[],
    [key: string]: any;
}

export interface MergeFunction {
    (src: PageData): { [key: string]: any }
}

export function extractLayoutData(
    req: express_.Request,
    res: express_.Response): MergeFunction {

    var user = <azureAd_.OIDCProfile>req.user;

    // data used by layout.ejs extracted from request
    var data: { [key: string]: any } = {
        displayName: user.displayName,
        email: user.email
    };

    return function (src: PageData): { [key: string]: any } {
        var d = <PageData>util_.merge(data, src);
        d.headerScripts = d.headerScripts || [];
        d.footerScripts = d.footerScripts || [];
        d.otherCss = d.otherCss || [];
        return d;
    }
}