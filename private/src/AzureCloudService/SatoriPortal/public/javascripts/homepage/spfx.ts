/// <reference path="sp.ts" />

namespace SPFX {
}

namespace SPFXIndex {
    function getToggleContainer(el: Element): Element {
        return el.parentElement;
    }

    /**
     * Toggle Bootstrap Dropdown
     * <li class="dropdown">
     *    <a class="dropdown-toggle" onclick="toggle(event)"></a>
     *    <ul></ul>
     * </li>
     * @param e: Event
     */
    export function toggle(e: Event): void {
        e = e || window.event;
        var t = <Element>e.target || e.srcElement;

        SP.opClass(getToggleContainer(t), 'open', 'toggle');
    }

    export function closeDropDown(el: HTMLElement, e: Event): void {
        var els = el.getElementsByClassName('dropdown-toggle');
        var src = <Element>e.target || e.srcElement;

        for (var i = 0; i < els.length; ++i) {
            var item = els[i];
            if (item !== src) {
                SP.opClass(getToggleContainer(item), 'open', 'remove');
            }
        }
    }

    export function reportBug(e: Event): void {
        e.preventDefault();

        var curHref = window.location.href;
        var to = "satoriportaldev@microsoft.com";
        var cc = "zhiw@microsoft.com";
        var subject = "Azure Satori Portal Bug";
        var body = "Please describe what you were doing when you found the bug. ";
        body += "\n" + "Please include a screenshot if possible. ";
        body += "\n" + "We will try to get back to you. ";
        body += "\n";
        body += "\n" + "---";
        body += "\n" + "Details... ";
        body += "\n" + "---";
        body += "\n";
        body += "\n" + "Cookie: " + document.cookie;
        body += "\n" + "UserAgent:" + navigator.userAgent;
        body += "\n\n" + "Url:" + curHref;

        var href = "mailto:" + to + "?cc=" + cc + "&subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

        window.location.href = href;
        window.location.href = curHref;
    }

    function getSessionID(): string {
        var strCookies = document.cookie;
        var cookiearray = strCookies.split(';')
        for (var i = 0; i < cookiearray.length; i++) {
            var name = cookiearray[i].split('=')[0];
            var value = cookiearray[i].split('=')[1];
            if (name == 'connect.sid')
                return value;
        }
        return '';
    }
}
