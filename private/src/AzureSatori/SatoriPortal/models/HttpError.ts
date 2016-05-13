
/// <reference path="../typings/main.d.ts" />
    
namespace SatoriPortal {
    
    export interface StatusError extends Error {
        status?: number;
    }
}
