
import utils_ = require("./utils");

var CLIENT_EXT_HEADERS = {
    "x-javascript-client": "1.0.0",
    "accept": "application/json",
    "content-type": "application/json; charset=utf8",
    "accept-encoding": "gzip,deflate",
    "accept-charset": "utf8",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0",
};

export var UPN_EPTEAM = "REDMOND\\epteam";
export var HEADER_UPN = "userPrincipalName";
export var HEADER_USERGROUPS = "userGroups";

export function buildClientHeader(upn?: string, userGroups?: string[]): { [key: string]: string } {
    var copy = utils_.merge({}, CLIENT_EXT_HEADERS);

    if (upn != null) copy[HEADER_UPN] = upn;
    if (userGroups != null && userGroups.length > 0) copy[HEADER_USERGROUPS] = userGroups.join(",");

    return copy;
}
