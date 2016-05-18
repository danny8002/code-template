/// <reference path="../typings/main.d.ts" />
/// <reference path="./satori-rest-client/index.ts" />
import FS_ = require("fs");
import SatoriRestClientModule = require("./satori-rest-client");

var SERVICE_CONFIG_PATH = "./service.json";
var cfg = <SatoriRestClientModule.SatoriRestClientOptions>JSON.parse(FS_.readFileSync(SERVICE_CONFIG_PATH, "utf8"));

var client = SatoriRestClientModule.configure(cfg);

export var jobServiceClient = client.jobServiceClient;