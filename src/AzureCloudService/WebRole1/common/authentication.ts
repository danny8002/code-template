/// <reference path="../typings/main.d.ts" />
/// <reference path="../models/main.d.ts" />

import Passport_ = require("passport");
import AzureAD_ = require('passport-azure-ad');

import settings_ = require('../settings');
// Passport session setup.


function _key(profile: AzureAD_.OIDCProfile): string {
    return profile.upn;
}

class UserAuthCache {
    

    private userCacheStore: { [key: string]: AzureAD_.OIDCProfile };

    constructor() {
        this.userCacheStore = <{ [key: string]: AzureAD_.OIDCProfile }>{};
    }

    public findUserProfile(id: string, fn: (err: Error, profile: AzureAD_.OIDCProfile) => void): any {

        var u = this.userCacheStore[id];

        return fn(null, u);
    }

    public storeUserProfile(profile: AzureAD_.OIDCProfile, fn: (err: Error) => void): void {
        var id = _key(profile);
        this.userCacheStore[id] = profile;
        fn(null);
    }
}

function buildOIDCStrategy(cache: UserAuthCache, config: PassportAzureAD.OIDCStrategyOptions): AzureAD_.OIDCStrategy {

    var cfg = config;
    cfg.passReqToCallback = true;

    return new AzureAD_.OIDCStrategy(cfg, function verifyWithRequest(req, iss, sub, profile, jwtClaims, accessToken, refreshToken, param, verified) {

        if (!profile.upn) {
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

        var id = _key(loginUser);

        // TODO：optimization, if not found, save 
        // asynchronous verification, for effect...
        process.nextTick(function () {
            cache.findUserProfile(id, function (err, u) {
                if (err != null) return verified(err, null);
                // not found from login user list

                // found it in cache, return origin user profile
                if (u != null) return verified(null, u);

                return cache.storeUserProfile(loginUser, e => { return verified(e, null); });
            });
        });
    });
}


var userAuthCache: UserAuthCache = new UserAuthCache();
var config: PassportAzureAD.OIDCStrategyOptions = settings_.AuthConfig;
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
Passport_.serializeUser(function (user: AzureAD_.OIDCProfile, done: (err: Error, id: string) => void) {
    console.log('serializeUser: ' + JSON.stringify(user));
    done(null, _key(user));
});

Passport_.deserializeUser(function (id: string, done: (err: Error, user: AzureAD_.OIDCProfile) => void) {
    console.log('deserializeUser', { id: id });
    userAuthCache.findUserProfile(id, done);
});


// Use the OIDCStrategy within Passport. (Section 2) 
// 
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier), and invoke a callback
//   with a user object.

export var UsedStrategy: AzureAD_.OIDCStrategy = buildOIDCStrategy(userAuthCache, config);
export var UsedPassport = Passport_.use(UsedStrategy);