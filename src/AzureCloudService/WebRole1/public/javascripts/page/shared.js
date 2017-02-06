/**
 * Created by zhiw on 4/19/2015.
 */

/**
 * Name Convention
 * SP.[lowercase]XXX is function. eg. SP.request=function(){}
 * SP.[upperCase]YYY is object. eg. SP.DOM = {} 
 */
var SP;
(function (exports) {
    function _createXHR() {
        var xhr;
        if (window.ActiveXObject) {
            xhr = new window.ActiveXObject("Microsoft.XMLHTTP");
        } else {
            xhr = new window.XMLHttpRequest();
        }
        return xhr;
    }

    function request(obj) {
        var type = obj["type"] || "GET";
        var url = obj["url"] || "";
        var data = obj["data"];
        var contentType = obj["contentType"] || "application/json; charset=utf-8";
        var error = obj["error"] || function (x, s, e) { console.log(e); };
        var success = obj["success"] || function (d) { console.log(d); };

        var xhr = _createXHR();
        xhr.open(type, url);
        xhr.setRequestHeader("Content-Type", contentType);
        xhr.setRequestHeader("Accept", "application/json;charset=utf-8");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200 && xhr.statusText == 'OK') {
                    if (success) {
                        success(JSON.parse(xhr.responseText), xhr);
                    }
                }
                else {
                    error(xhr, xhr.statusText, xhr.status);
                }
            }
        };

        xhr.send((typeof data === "object") ? JSON.stringify(data) : data);
        return xhr;
    }
    exports._createXHR = _createXHR;
    exports.request = request;

})(SP || (SP = {}));

(function (exports) {
    function create(name, attr, child1, child2, child3, childN) {
        var e = document.createElement(name);
        for (var i in (attr || {})) {
            e.setAttribute(i, (attr || {})[i]);
        }
        (Array.prototype.slice.call(arguments, 2) || []).forEach(function (c) {
            if (typeof c == 'string') {
                e.nodeValue = c;
                e.textContent = c;
            }
            else { e.appendChild(c) }
        });

        return e;
    }
    exports.create = create;

    exports.utc2LocalInDomSpan = function (className) {
        var nodes = document.getElementsByClassName(className);
        for (var i = 0; i < nodes.length; ++i) {
            var node = nodes[i];
            if (node != null) node.innerText = SP.String.utc2Local(node.innerText);
        }
    }

})(SP.DOM || (SP.DOM = {}));

(function (exports) {
    function _trimImpl(isStart, str, tokens) {
        if (typeof str === 'string') {
            tokens = tokens.length <= 0 ? [' ', '\t', '\f'] : tokens;
            var i = 0;
            for (i = 0; i < str.length; ++i) {
                if (!tokens.some(function (t) {
                    return str.charAt(isStart ? i : (str.length - i - 1)) === t;
                })) break;
            }
            return isStart ? str.substr(i) : str.substr(0, (str.length - i));
        }
        return str;
    }

    exports.trimStart = function (str, token1, token2, tokenN) {
        if (str == null) return str;
        var tokens = Array.prototype.slice.call(arguments, 1) || [];
        return _trimImpl(true, str, tokens);
    }

    exports.trimEnd = function (str, token1, token2, tokenN) {
        if (str == null) return str;
        var tokens = Array.prototype.slice.call(arguments, 1) || [];
        return _trimImpl(false, str, tokens);
    }

    exports.trim = function (str, token1, token2, tokenN) {
        var tokens = Array.prototype.slice.call(arguments, 1) || [];
        return _trimImpl(false, _trimImpl(true, str, tokens), tokens);
    }

    exports.isNullOrWhitespace = function (str) {
        return str == null || (typeof str === 'string' && exports.trim(str).length <= 0);
    }

    exports.extractUriName = function (u) {
        if (u == null || u.length <= 0) return u;
        var i = u.lastIndexOf('/');
        if (i < 0) return u;
        return u.substr(i + 1);
    }

    exports.wrapUrl = function (u) {
        var isCosmosUrl = u != null && typeof (u) === 'string' && u.indexOf("https://cosmos") === 0;
        return isCosmosUrl ? u + "?property=info" : u;
    }

    exports.utc2Local = function (strOrDateOrNumber, fmt) {
        var local = strOrDateOrNumber;
        if (typeof strOrDateOrNumber === 'string') local = new Date(Date.parse(strOrDateOrNumber));
        if (typeof strOrDateOrNumber === 'number') local = new Date(strOrDateOrNumber);
        if (local == null) return local;
        var pad = function (v) { return v <= 9 ? '0' + v : '' + v; };

        fmt = fmt || "YYYY-MM-DD hh:mm:ss";
        var str2 = fmt
            .replace("YYYY", local.getFullYear())
            .replace("MM", pad(local.getMonth() + 1))
            .replace("DD", pad(local.getDate()))
            .replace("hh", pad(local.getHours()))
            .replace("mm", pad(local.getMinutes()))
            .replace("ss", pad(local.getSeconds()));

        return str2;
    }

    exports.calcTimeSpan = function (milliseconds) {
        var MILLISECONDS_DAY = 86400000;
        var MILLISECONDS_HOUR = 3600000;
        var MILLISECONDS_MINUTE = 60000;
        var MILLISECONDS_SECONDS = 1000;

        var days = Math.floor(Math.abs(milliseconds) / MILLISECONDS_DAY);
        var hours = Math.floor((Math.abs(milliseconds) % MILLISECONDS_DAY) / MILLISECONDS_HOUR);
        var mins = Math.floor((Math.abs(milliseconds) % MILLISECONDS_HOUR) / MILLISECONDS_MINUTE);
        var secs = Math.floor((Math.abs(milliseconds) % MILLISECONDS_MINUTE) / MILLISECONDS_SECONDS);
        return [days, hours, mins, secs];
    }

    exports.calcTimespanStr = function (start, end) {
        var span = exports.calcTimespanTokens(start, end);
        span.reverse();

        var str = span[0] + "s";
        if (span.length >= 2) str = span[1] + "m " + str;
        if (span.length >= 3) str = span[2] + "h " + str;
        if (span.length >= 4) str = span[3] + "d " + str;
        return str;
    }

    exports.calcTimespanTokens = function (start, end) {
        var a = new Date(Date.parse(start));
        var b = end != null ? Date.parse(end) : Date.now();
        var span = exports.calcTimeSpan(b - a);
        var j = -1;
        for (var i = 0; i < span.length; ++i) {
            if (span[i] > 0) {
                j = i;
                break;
            }
        }
        span = j < 0 ? span : span.splice(j);
        return span;
    }

    exports.formatNumber = function (n) {
        if (n == null) return '0';
        var str = String(n);
        var result = '';
        for (var i = 0; i < str.length; ++i) {
            var ch = str.charAt(str.length - i - 1);
            if (i != 0 && i % 3 == 0) {
                result = ', ' + result;
            }
            result = ch + result;
        }
        return result;
    }

    exports.sharedStart = function (array) {
        if (!Array.isArray(array) || array.length <= 0) return "";
        var A = array.concat().sort(),
            a1 = A[0], a2 = A[A.length - 1], L = a1.length, i = 0;
        while (i < L && a1.charAt(i) === a2.charAt(i)) i++;
        return a1.substring(0, i);
    }

    exports.getInitData = function (objOrStrOrId) {
        if (typeof objOrStrOrId === 'string') {
            var isJson = objOrStrOrId[0] == '{' && objOrStrOrId[objOrStrOrId.length - 1] == '}';
            if (isJson) return JSON.parse(objOrStrOrId);
            var node = document.getElementById(objOrStrOrId);
            if (node != null) return JSON.parse(node.textContent);
        }
        if (typeof objOrStrOrId === 'object') return objOrStrOrId;
        throw new Error('unknow type: ' + (typeof objOrStrOrId));
    }

})(SP.String || (SP.String = {}));

(function (exports) {
    exports.getTenantsURL = "/SatoriPortal/Tenant/GetTenants";
})(SP.Constants || (SP.Constants = {}));

(function (exports) {
    exports.assign = Object.assign || (function assign(target) {
        'use strict';
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert first argument to object');
        }
        var to = Object(target);
        for (var i = 1; i < arguments.length; i++) {
            var nextSource = arguments[i];
            if (nextSource === undefined || nextSource === null) {
                continue;
            }
            nextSource = Object(nextSource);

            var keysArray = Object.keys(nextSource);
            for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                var nextKey = keysArray[nextIndex];
                to[nextKey] = nextSource[nextKey];
            }
        }
        return to;
    });

    exports.values = function (dict) {
        var vs = [];
        if (typeof dict === 'object') {
            for (var k in dict) {
                vs.push(dict[k]);
            }
        }
        return vs;
    }

})(SP.Polyfill || (SP.Polyfill = {}));
