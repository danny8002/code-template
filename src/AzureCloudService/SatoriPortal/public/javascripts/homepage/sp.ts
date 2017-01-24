
namespace SP {

    export function opClass(el: Element, className: string, op: string): Element {
        if (el.classList) {
            switch (op) {
                case 'add':
                    el.classList.add(className); break;
                case 'remove':
                    el.classList.remove(className); break;
                case 'toggle':
                    el.classList.toggle(className); break;
                default:
                    console.error('not supported class operation:' + op);
            }
        } else {
            var classes = el.className.split(' ');
            var i = classes.indexOf(className);

            switch (op) {
                case 'add':
                    if (i < 0) classes.push(className); break;
                case 'remove':
                    if (i >= 0) classes.splice(i, 1); break;
                case 'toggle':
                    if (i >= 0)
                        classes.splice(i, 1);
                    else
                        classes.push(className);
                    break;
                default:
                    console.error('not supported class operation:' + op);
            }
            el.className = classes.join(' ');
        }
        return el;
    }

    export function hasClass(el: Element, className: string): boolean {
        if (el.classList)
            return el.classList.contains(className);
        else
            return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
    }
    
}