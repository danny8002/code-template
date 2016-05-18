
/// <reference path="./jobservice.ts" />
import JBC = require("./jobservice");

export interface AutoUpdateSecurityGroupOptions {
    updateSecurityUserIntervalSeconds: number,
    update?: (err: Error, nowGroup: string[], oldGroup: string[]) => void;
}

export interface SatoriRestClientOptions {
    appId: string,
    jobServiceUrl: string,
    dataServiceUrl?: string,
    pushServiceUrl?: string,
    update?: AutoUpdateSecurityGroupOptions
}

export interface SatoriRestClient {
    jobServiceClient: JBC.JobServiceClient;
}

export function configure(options: SatoriRestClientOptions): SatoriRestClient {

    var jb = new JBC.JobServiceClient(options.jobServiceUrl, options.appId);
    if (options.update != null &&
        options.update.updateSecurityUserIntervalSeconds > 0 &&
        typeof options.update.update === 'function') {
        jb.autoUpdateSecurityGroups(options.update.updateSecurityUserIntervalSeconds, options.update.update);
    }

    return { jobServiceClient: jb };
}