
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

    export interface OIDCStrategyOptions {
        /**
         *    - `identityMetadata`   (1) Required
         *                          (2) must be a https url string
         *                          (3) Description:
         *                          the metadata endpoint provided by the Microsoft Identity Portal that provides 
         *                          the keys and other important info at runtime. Examples:
         *                          <1> v1 tenant-specific endpoint
         *                          - https://login.microsoftonline.com/your_tenant_name.onmicrosoft.com/.well-known/openid-configuration
         *                          - https://login.microsoftonline.com/your_tenant_guid/.well-known/openid-configuration
         *                          <2> v1 common endpoint
         *                          - https://login.microsoftonline.com/common/.well-known/openid-configuration
         *                          <3> v2 tenant-specific endpoint
         *                          - https://login.microsoftonline.com/your_tenant_name.onmicrosoft.com/v2.0/.well-known/openid-configuration
         *                          - https://login.microsoftonline.com/your_tenant_guid/v2.0/.well-known/openid-configuration
         *                          <4> v2 common endpoint
         *                          - https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration
         *
         */
        identityMetadata: string;

        /**
         *   - `clientID`           (1) Required
         *                          (2) must be a string
         *                          (3) Description:
         *                          The Client ID of your app in AAD
         *
         */
        clientID: string;

        /**
         *   - `responseType`       (1) Required
         *                          (2) must be 'code', 'code id_token', 'id_token code' or 'id_token'
         *                          (3) Description:
         *                          For login only flows use 'id_token'. For accessing resources use `code id_token`, 'id_token code' or `code`
         */
        responseType: string;
        /**
         *   - `responseMode`       (1) Required
         *                          (2) must be 'query' or 'form_post'
         *                          (3) Description:
         *                          How you get the authorization code and tokens back
         */
        responseMode: string;

        /**
         *   - `redirectUrl`        (1) Required
         *                          (2) must be a https url string, unless you set `allowHttpForRedirectUrl` to true
         *                          (3) Description:
         *                          The reply URL registered in AAD for your app
         */
        redirectUrl: string;

        /**
         *   - `allowHttpForRedirectUrl`
         *                          (1) Required to set to true if you want to use http url for redirectUrl
         *                          (2) Description:
         *                          The default value is false. It's OK to use http like 'http://localhost:3000' in the
         *                          dev environment, but in production environment https should always be used. 
         */
        allowHttpForRedirectUrl?: boolean;

        /**
         *
         *
         *   - `clientSecret`       (1) This option only applies when `responseType` is 'code', 'id_token code' or 'code id_token'.
         *                              To redeem an authorization code, we can use either client secret flow or client assertion flow.
         *                              (1.1) For B2C, clientSecret is required since client assertion is not supported
         *                              (1.2) For non-B2C, both flows are supported. Developer must provide either clientSecret, or 
         *                                    thumbprint and privatePEMKey. We use clientSecret if it is provided, otherwise we use 
         *                                    thumbprint and privatePEMKey for the client assertion flow.
         *                          (2) must be a string
         *                          (3) Description:
         *                          The app key of your app from AAD. 
         *                          NOTE: For B2C, the app key sometimes contains '\', please replace '\' with '\\' in the app key, otherwise
         *                          '\' will be treated as the beginning of a escaping character
         */
        clientSecret?: string;

        /**
         *   - `thumbprint`         (1) Required if you want to use client assertion to redeem an authorization code (non-B2C only)
         *                          (2) must be a base64url encoded string
         *                          (3) Description:
         *                          The thumbprint (hash value) of the public key
         */
        thumbprint?: string;

        /**
         *   - `privatePEMKey`      (1) Required if you want to use client assertion to redeem an authorization code (non-B2C only)
         *                          (2) must be a pem key
         *                          (3) Description:
         *                          The private key used to sign the client assertion JWT
         */
        privatePEMKey?: string;

        /**
         *   - `isB2C`              (1) Required for B2C
         *                          (2) must be true for B2C, default is false
         *                          (3) Description:
         *                          set to true if you are using B2C, default is false   
         */
        isB2C?: boolean;

        /**
         *   - `validateIssuer`     (1) Required to set to false if you don't want to validate issuer, default is true
         *                          (2) Description:
         *                          For common endpoint, you should either set `validateIssuer` to false, or provide the `issuer`, since
         *                          we cannot grab the `issuer` value from metadata.
         *                          For non-common endpoint, we use the `issuer` from metadata, and `validateIssuer` should be always true
         */
        validateIssuer?: boolean;

        /**
         *   - `issuer`             (1) Required if you are using common endpoint and set `validateIssuer` to true, or if you want to specify the allowed issuers
         *                          (2) must be a string or an array of strings
         *                          (3) Description:
         *                          For common endpoint, we use the `issuer` provided.
         *                          For non-common endpoint, if the `issuer` is not provided, we use the issuer provided by metadata
         */
        issuer?: string | string[];

        /**
         *   - `passReqToCallback`  (1) Required to set true if you want to use the `function(req, token, done)` signature for the verify function, default is false
         *                          (2) Description:
         *                          Set `passReqToCallback` to true use the `function(req, token, done)` signature for the verify function
         *                          Set `passReqToCallback` to false use the `function(token, done)` signature for the verify function 
         */
        passReqToCallback: boolean;

        /**
         *   - `scope`              (1) Optional
         *                          (2) must be a string or an array of strings
         *                          (3) Description:
         *                          list of scope values indicating the required scope of the access token for accessing the requested
         *                          resource. Ex: ['email', 'profile']. 
         *                          We send 'openid' by default. For B2C, we also send 'offline_access' (to get refresh_token) and
         *                          clientID (to get access_token) by default.
         */
        scope?: string | string[];

        /**
         *   - `loggingLevel`       (1) Optional
         *                          (2) must be 'info', 'warn', 'error'
         *                          (3) Description:  
         *                          logging level  
         */
        loggingLevel?: string;

        /**
         *   - `nonceLifetime`      (1) Optional
         *                          (2) must be a positive integer
         *                          (3) Description:
         *                          the lifetime of nonce in session, default value is NONCE_LIFE_TIME
         */
        nonceLifetime?: number;

        /**
         *   - `clockSkew`          (1) Optional
         *                          (2) must be a positive integer
         *                          (3) Description:
         *                          the clock skew (in seconds) allowed in token validation, default value is CLOCK_SKEW
         */
        clockSkew?: number;
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