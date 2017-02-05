/// <reference path="../typings/passport-azure-ad.d.ts" />

var protocol = "http://";
var isHttpForUrl = protocol.startsWith("http:");
var hostPlaceHolder = "localhost:4000";

interface OIDCStrategyOptions extends PassportAzureAD.OIDCStrategyOptions {
    _processedRedirectUrl?: boolean
}

export var AuthConfig: OIDCStrategyOptions = {
    identityMetadata: "https://login.microsoftonline.com/microsoft.onmicrosoft.com/.well-known/openid-configuration",
    clientID: "92ca347b-afd3-490c-bace-4eec5846c732",
    clientSecret: "O0oK1OM9WSRHfKYJluokB0ZBJ9HV2VFpStY4toOfofU=",
    responseType: "id_token code",
    responseMode: "query",
    redirectUrl: protocol + hostPlaceHolder + "/auth/openid/return",
    allowHttpForRedirectUrl: isHttpForUrl,
    passReqToCallback: true
}

export function AdjustHostOnce(host: string) {
    if (AuthConfig._processedRedirectUrl !== true) {

        var url = AuthConfig.redirectUrl.replace(hostPlaceHolder, host);

        AuthConfig.redirectUrl = url;
        AuthConfig._processedRedirectUrl = true;
    }
}