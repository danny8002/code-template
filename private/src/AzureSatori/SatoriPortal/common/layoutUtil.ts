/// <reference path="../typings/main.d.ts" />
/// <reference path="./util.ts" />
import express_ = require("express");
import util_ = require("./util");
import azureAd_ = require("passport-azure-ad");

export interface MergeFunction {
    (src: { [key: string]: any }): { [key: string]: any }
}

export function extractLayoutData(
    req: express_.Request,
    res: express_.Response): MergeFunction {

    var user = <azureAd_.OIDCProfile>req.user;

    // data used by layout.ejs 
    var data: { [key: string]: any } = {
        displayName: user.displayName,
        email: user.email
    };

    return function (src: { [key: string]: any }): { [key: string]: any } {
        return util_.merge(data, src);
    }
}