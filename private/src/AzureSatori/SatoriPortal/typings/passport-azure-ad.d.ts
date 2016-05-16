
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
         * if B2C, use this
         * https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
         */
        identityMetadata: string,

        /**
         * It is required if forceB2C==true or found a policy inside of the login request.
         * for safety, you should always specify this (so mark this field required).
         * for example: contoso.onmicrosoft.com
         */
        tenantName: string,

        /**
         * when Azure AD authenticate successfully, it redirect to this, eg:
         * http://localhost:3000/auth/openid/return
         * or relative path: /auth/openid/return
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
         * passport-azure-ad use 'https://www.npmjs.com/package/bunyan' as logger and output log in console
         * Bunyan's log levels: trace, debug, info, warn, error, and fatal.
         */
        loggingLevel?: string,

        validateIssuer?: boolean,

        /**
         * if true, the first parameter of verified function is http request
         */
        passReqToCallback?: boolean,

        /**
         * force to use Azure AD B2C
         */
        forceB2C?: boolean,

        /**
         * list of scope values indicating the required scope of the access token for accessing the requested resource
         * scope: ['email', 'profile'] // additional scopes you may wish to pass
         */
        scope?: string[] | string
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

    export interface BearerStrategyOptions {

        /**
         * TODO: need find this constant value here
         */
        identityMetadata: string,

        /**
         * It is required if policyName is provied.
         * for safety, you should always specify this (so mark this field required).
         * for example: contoso.onmicrosoft.com
         */
        tenantName: string,

        /**
         * passport-azure-ad use 'https://www.npmjs.com/package/bunyan' as logger and output log in console
         * Bunyan's log levels: trace, debug, info, warn, error, and fatal.
         */
        loggingLevel?: string,

        policyName?: string,
        validateIssuer?: boolean,

        /**
         * TODO: add useful comment here
         */
        certificate?: string,

        /**
         * issuer(s) will be validated. by default, the program will retrive this from metadata.
         * if you want to check JWT issuer (iss), provide a value here
         */
        issuer?: string[] | string,

        /**
         * if you want to check JWT audience (aud), provide a value here
         */
        audience?: string[] | string,

        /**
         * authentication realm, defaults to "Users"
         */
        reaml?: string,

        /**
         * list of scope values indicating the required scope of the access token for accessing the requested resource
         * or a single scope
         */
        scope?: string[] | string,

        /**
         * if true, the first parameter of verified function is http request
         */
        passReqToCallback?: boolean,
    }

    export interface SamlStrategyOptions {
        /**
         * https://login.windows.net/GraphDir1.OnMicrosoft.com/federationmetadata/2007-06/federationmetadata.xml
         */
        identityMetadata: string,

        /**
         * Absolute path, eg. http://localhost:3000/login/callback/. Relative Path is not supported currently
         */
        loginCallback: string,

        /**
         * this is the URI you entered for APP ID URI when configuring SSO for you app on Azure AAD
         */
        issuer: string,

        /**
         * optional, but required to support SAML logout. eg. http://localhost:3000
         */
        appUrl?: string,

        /**
         * optional, but required to support SAML logout. eg. http://localhost:3000/logout/callback/
         */
        logoutCallback?: string,

        /**
         * optional, but required to support SAML logout. see example: https://github.com/AzureAD/passport-azure-ad/tree/master/examples/login-saml
         */
        privateCert?: string,
        publicCert?: string,

        /**
         * optional parameters for Service Provider Federation metadata file
         */
        contactFirstName?: string,
        contactLastName?: string,
        contactEmail?: string,
        organizationName?: string,
        organizationDisplayName?: string,
        organizationUrl?: string,

        /**
         * if true, the first parameter of verified function is http request
         */
        passReqToCallback?: boolean,
    }

    export interface WsfedStrategyOptions {

        /**
         * the URL of the federation metadata document for your app or the cert of the X.509 certificate found
         * in the X509Certificate tag of the RoleDescriptor with xsi:type="fed:SecurityTokenServiceType" in the federation metadata.
         * If you enter both fields, the metadata takes precedence
         * identityMetadata or identityProviderUrl
         * https://login.windows.net/GraphDir1.OnMicrosoft.com/federationmetadata/2007-06/federationmetadata.xml
         */
        identityMetadata: string,

        /**
         * https://login.windows.net/GraphDir1.OnMicrosoft.com/wsfed
         *  Enter the endpoint to which your app sends sign-on and sign-out requests when using WS-Federation protocol.
         * To find this value in the Windows Azure Management Portal, click Active Directory, click Integrated Apps,
         * and in the black menu bar at the bottom of the page, click View endpoints.
         * Then, copy the value of the WS-Federation Sign-On Endpoint.
         * Note: This field is ignored if you specify an identityMetadata url
         */
        identityProviderUrl: string,

        /**
         * Enter the App ID URI of your application. To find this value in the Windows Azure Management Portal,
         * click Active Directory, click Integrated Apps, click your app, and click Configure.
         * The App ID URI is at the bottom of the page in the Single Sign-On section.
         */
        realm: string,

        /**
         * This is the URL that Active Directory will redirect to with the token after the login process.
         * Ensure this is an HTTPS endpoint and is included in the Reply URL list in Active Directory -> Application -> Configuration -> Reply URL
         */
        wreply: string,

        /**
         * Enter the logout url of your application. The user will be redirected to this endpoint after
         * the auth token has been revoked by the WSFed endpoint.
         */
        logoutUrl: string,

        /**
         * TODO: add comment here
         */
        homerealm?: string,

        /**
          * if true, the first parameter of verified function is http request
          */
        passReqToCallback?: boolean,
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
     * you should build your user struct in verify callback, eg.
     *     new OIDCStrategy(options, function(arg1, arg2, arg3, ..., verified){
     *              ...
     *              var user = xxxx
     *              var error = yyy
     *              verfied(error, user );
     *     }),
     * user struct will be used by passport.serializeUser/deserializeUser
     */
    export interface VerifiedCallBack {
        (err: Error, user: any, info?: any): void
    }

    export interface OIDCProfile extends passport.Profile {
        email: string,
        name: { familyName: string, givenName: string, middleName: string }
    }

    export interface SamlProfile extends passport.Profile {
        issuer?: string,
        nameID?: string,
        nameIDFormat?: string,
        mail?: string,
        familyName?: string,
        email?: string,
        [key: string]: any,
    }

    export interface WsfedProfile extends SamlProfile {

    }

    export interface OIDCStrategy extends passport.Strategy {
        /**
         * Overwrite passport.Strategy's method
         */
        authenticate(req: express.Request, options?: PassportAzureAD.OIDCStrategyPartialOptions): void;
    }


    export class OIDCStrategy {

        /**
         * @param options OIDCStrategyOptions object
         * @param verify Custom verify function. if options.passReqToCallback, pass request as the first argument.
         */
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: OIDCProfile, jwtClaims: PassportAzureAD.JsonWebTokenClaims, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: OIDCProfile, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: OIDCProfile, accessToken: string, refreshToken: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, profile: OIDCProfile, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, iss: string, sub: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (req: express.Request, profile: OIDCProfile, verified: VerifiedCallBack) => void);

        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: OIDCProfile, jwtClaims: PassportAzureAD.JsonWebTokenClaims, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: OIDCProfile, accessToken: string, refreshToken: string, param: { [key: string]: string }, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: OIDCProfile, accessToken: string, refreshToken: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, profile: OIDCProfile, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (iss: string, sub: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.OIDCStrategyOptions,
            verify: (profile: OIDCProfile, verified: VerifiedCallBack) => void);
    }

    export class BearerStrategy implements passport.Strategy {
        constructor(options: PassportAzureAD.BearerStrategyOptions, verify: (req: express.Request, token: string, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.BearerStrategyOptions, verify: (token: string, verified: VerifiedCallBack) => void)

        /**
         * name is 'oauth-bearer'
         */
        name: string;

        /**
         * inherit from passport.Strategy
         */
        authenticate(req: express.Request, options?: Object): void;
    }

    export class SamlStrategy implements passport.Strategy {
        constructor(options: PassportAzureAD.BearerStrategyOptions, verify: (req: express.Request, profile: SamlProfile, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.BearerStrategyOptions, verify: (profile: SamlProfile, verified: VerifiedCallBack) => void)

        /**
         * name is 'saml'
         */
        name: string;

        /**
         * overwrite passport.Strategy's method
         */
        authenticate(req: express.Request): void;
    }

    export class WsfedStrategy implements passport.Strategy {
        constructor(options: PassportAzureAD.BearerStrategyOptions, verify: (req: express.Request, profile: WsfedProfile, verified: VerifiedCallBack) => void);
        constructor(options: PassportAzureAD.BearerStrategyOptions, verify: (profile: WsfedProfile, verified: VerifiedCallBack) => void)

        /**
         * name is 'wsfed-saml2'
         */
        name: string;

        /**
         * overwrite passport.Strategy's method
         */
        authenticate(req: express.Request): void;
    }
}