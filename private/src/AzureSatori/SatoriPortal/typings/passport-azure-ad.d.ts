
// Type definitions for passport-azure-ad 1.4.4
// Project: https://github.com/AzureAD/passport-azure-ad
// Definitions by: Zhiyuan Wang <https://github.com/danny8002/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare namespace PassportAzureAD {
    export interface OIDCStrategyPartialOptions {
        resourceURL?: string,

        /**
         * "code", "id_token", "code id_token", "token id_token", "token"
         */
        responseType?: string,

        /**
         * "query", "fragment", "form_post"
         */
        responseMode?: string
    }


    export interface OIDCStrategyOptions extends OIDCStrategyPartialOptions {
        /**
         * For using Microsoft you should never need to change this.
         * https://login.microsoftonline.com/common/.well-known/openid-configuration
         */
        identityMetadata: string,

        /**
         * It is required if forceB2C==true or found a policy inside of the login request.
         * for safety, you should always specify this (so mark this field required).
         * for example: contoso.onmicrosoft.com
         */
        tenantName: string,

        /**
         * when Azure AD authenticate successfully, it redirect to this
         */
        callbackURL: string,


        clientID: string,

        /**
         * (for safety, mark this required) only required if you are doing code or id_token code"
         */
        clientSecret: string,

        /**
         * for AzureAD should be set to true
         */
        skipUserProfile: boolean,

        /**
         * passport-azure-ad use 'https://www.npmjs.com/package/bunyan' as logger
         * Bunyan's log levels: trace, debug, info, warn, error, and fatal.
         */
        loggingLevel?: string,

        validateIssuer?: boolean,

        passReqToCallback?: boolean,

        /**
         * force to use Azure AD B2C
         */
        forceB2C?: boolean,

        /**
         * scope: ['email', 'profile'] // additional scopes you may wish to pass"
         */
        scope?: string[]
    }

    /**
     * JSON Web Token(JWT) see http://openid.net/specs/openid-connect-basic-1_0.html#id_token
     */
    export interface JsonWebTokenClaims {
        iss: string,
        sub: string,
        aud: string,
        exp: number,
        iat: number,
        auth_time?: number,
        nonce?: string,
        at_hash?: string,
        acr?: string,
        amr?: string[],
        azp?: string
    }

}

declare module 'passport-azure-ad' {
    import passport = require('passport');
    import express = require('express');

    /**
     * Notify authentication result. 
     * 1. you should define struct [user] to represent your user
     * 2. you can pass [info] to authenticatio program
     * the built-in VerifiedCallBack is:
     * function verified(err, user, info) {
     *        if (err) { return self.error(err); }
     *        if (!user) { return self.fail(info); }
     *        self.success(user, info);
     * }
     */
    export interface VerifiedCallBack {
        (err: Error, user: any, info?: any): void
    }

    export interface OIDCStrategy extends passport.Strategy {
        authenticate(req: express.Request, options?: PassportAzureAD.OIDCStrategyPartialOptions): void;
    }
    
    export interface AzureADProfile extends passport.Profile {
        email: string,
        name: { familyName: string, givenName: string, middleName: string }
    }

    export class OIDCStrategy {

        /**
         * @param options OIDCStrategyOptions object
         * @param verify Custom verify function. if options.passReqToCallback, pass request as the first argument.
         */
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: AzureADProfile, jwtClaims: PassportAzureAD.JsonWebTokenClaims, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: AzureADProfile, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: AzureADProfile, accessToken: string, refreshToken: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: AzureADProfile, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, profile: AzureADProfile, verified: VerifiedCallBack) => void);

        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: AzureADProfile, jwtClaims: PassportAzureAD.JsonWebTokenClaims, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: AzureADProfile, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: AzureADProfile, accessToken: string, refreshToken: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: AzureADProfile, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (profile: AzureADProfile, verified: VerifiedCallBack) => void);
    }

}