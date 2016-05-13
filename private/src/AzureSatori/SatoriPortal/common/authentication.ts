/// <reference path="../typings/main.d.ts" />
/// <reference path="../models/main.d.ts" />

import Passport_ = require("passport");
import AzureAD_ = require('passport-azure-ad');

// Passport session setup.

const AUTH_CONFIG_PATH: string = "../auth.json";


namespace AuthOperation {

    var userCacheStore = <{ [key: string]: AzureAD_.AzureADProfile }>{};

    export function readAuthConfig(path: string): PassportAzureAD.OIDCStrategyOptions {
        var config = <PassportAzureAD.OIDCStrategyOptions>require(AUTH_CONFIG_PATH);
        return config;
    }

    export function key(profile: AzureAD_.AzureADProfile): string {
        return profile.email;
    }

    export function findUserProfile(id: string, fn: (err: Error, profile: AzureAD_.AzureADProfile) => void): any {

        var u = userCacheStore[id];

        return fn(null, u);
    }

    export function storeUserProfile(id: string, profile: AzureAD_.AzureADProfile, fn: (err: Error) => void): void {
        userCacheStore[id] = profile;
        fn(null);
    }

    export function buildOIDCStrategy(config: PassportAzureAD.OIDCStrategyOptions): AzureAD_.OIDCStrategy {

        // TODO: add logic to verify config and return error message

        // TODO: copy config
        var cfg = config;
        cfg.passReqToCallback = true;

        return new AzureAD_.OIDCStrategy(cfg, function verifyWithRequest(req, iss, sub, profile, jwtClaims, accessToken, refreshToken, param, verified) {

            if (!profile.email) {
                return verified(new Error("No email found"), null);
            }

            console.log("Strategy Verification: ", {
                iss: iss,
                sub: sub,
                profile: profile,
                accessToken: accessToken,
                refreshToken: refreshToken
            });

            var loginUser = profile;

            var id = AuthOperation.key(loginUser);

            // TODO：optimization, if not found, save 
            // asynchronous verification, for effect...
            process.nextTick(function () {
                findUserProfile(id, function (err, u) {
                    if (err != null) return verified(err, null);
                    // not found from login user list

                    // found it in cache, return origin user profile
                    if (u != null) return verified(null, u);

                    return storeUserProfile(id, loginUser, e => { return verified(e, null); });
                });
            });
        });
    }

    function checkStrategyOptions(config: PassportAzureAD.OIDCStrategyOptions): string {
        // TODO: add logic to verify config and return error message
        return null;
    }
}

//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
Passport_.serializeUser(function (user: AzureAD_.AzureADProfile, done: (err: Error, id: string) => void) {
    console.log('serializeUser: ' + JSON.stringify(user));
    done(null, AuthOperation.key(user));
});

Passport_.deserializeUser(function (id: string, done: (err: Error, user: AzureAD_.AzureADProfile) => void) {
    console.log('deserializeUser', { id: id });
    AuthOperation.findUserProfile(id, done);
});


// Use the OIDCStrategy within Passport. (Section 2) 
// 
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier), and invoke a callback
//   with a user object.
var config = AuthOperation.readAuthConfig(AUTH_CONFIG_PATH);
var strategy = AuthOperation.buildOIDCStrategy(config);

export var UsedStrategy = strategy;
export var UsedPassport = Passport_.use(strategy);