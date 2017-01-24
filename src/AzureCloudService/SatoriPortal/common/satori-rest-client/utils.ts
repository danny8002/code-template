
export interface NodeStyleCallBack<T> {
    (err: Error, data: T): void;
}

export class StopWatch {
    private _start: number;
    private _end: number;
    constructor() {
        this.start();
    }

    public start(): void {
        this._start = Date.now();
        this._end = -1;
    }

    public stop(): number {
        this._end = Date.now();
        return this._end - this._start;
    }
}

export function toError(e: any): Error {
    if (e instanceof Error) {
        return <Error>e;
    }

    // error like
    if (e != null && typeof e.message === 'string') {
        return <Error>e;
    }

    return new Error(String(e));
}

export function merge(dest: { [key: string]: any }, src: { [key: string]: any }): { [key: string]: any } {
    var d = dest || {};
    var s = src || {};
    for (var k in s) {
        d[k] = s[k];
    }
    return d;
}