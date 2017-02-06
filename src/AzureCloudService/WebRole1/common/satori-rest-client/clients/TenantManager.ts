/// <reference path="../../../typings/main.d.ts" />
/// <reference path="../models/tenant.ts" />


import Http_ = require("http");
import Util_ = require("util");
import Url_ = require("url");
import QueryString_ = require("querystring");
import Zlib_ = require("zlib");
import Events_ = require("events");
import Path_ = require('path');

import reqUtil_ = require("../requestutil");
import cfg_ = require("../configuration");
import utils_ = require("../utils");

export class TenantManager {

    private url: string;
    private appId: string;

    constructor(url: string, appId: string) {
        this.url = url;
        this.appId = appId;
    }

    public getTenants(
        options: { upn?: string },
        callback: (err: Error, tenants: SatoriRestClientModels.TenantDTO[]) => void): void {

        var reqOpt = reqUtil_.buildRequestOptions(
            Util_.format("%s/odata/Tenants?$expand=Roles($expand=Users)", this.url),
            { "appid": this.appId },
            cfg_.buildClientHeader(options.upn || cfg_.UPN_EPTEAM)
        );

        reqOpt.method = "GET";

        return reqUtil_.sendRequestWithResponseModel<SatoriRestClientModels.TenantDTO[]>(options, null, callback);
    }
    
    
    
}