/// <reference path="../typings/main.d.ts" />
/// <reference path="../typings/passport-azure-ad.d.ts" />



// import Passport_ = require("passport");
// import AzureAD_ = require('passport-azure-ad');

// Passport session setup.

const AUTH_CONFIG_PATH: string = "./auth.json";

function readAuthConfig(path: string): PassportAzureAD.OIDCStrategyOptions {
    var config = <PassportAzureAD.OIDCStrategyOptions>require(path);
    return config;
}

export var AuthConfig: PassportAzureAD.OIDCStrategyOptions = readAuthConfig(AUTH_CONFIG_PATH);


