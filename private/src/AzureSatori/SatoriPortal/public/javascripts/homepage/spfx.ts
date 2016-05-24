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
}
