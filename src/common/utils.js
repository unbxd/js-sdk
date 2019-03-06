/* eslint wrap-iife: ["error", "inside"] */
/* eslint arrow-parens: ["error", "as-needed"] */
const MAX_LISTENERS = 1;
const uiBuilder = document => {
    debugger;
    const listeners = [];
    const getAllListeners = listeners =>
        listeners.map(listener => listener.eventName);
    let matches;

    (function(doc) {
        matches =
            doc.matchesSelector ||
            doc.webkitMatchesSelector ||
            doc.mozMatchesSelector ||
            doc.oMatchesSelector ||
            doc.msMatchesSelector;
    })(document.documentElement);

    const findParent = (el, elementString) => {
        const matchFound = matches.call(el, elementString);
        return matchFound ? el : findParent(el.parentNode, elementString);
    };

    const addEventListener = (eventName, handler) => {
        if (
            listeners.filter(listener => listener.eventName === eventName).length <=
            MAX_LISTENERS
        ) {
            const eventHandler = e => {
                const els = listeners.filter(
                    listener =>
                    matches.call(e.target, [
                        listener.elementString,
                        `${listener.elementString} *`
                    ]) && listener.eventName === eventName
                );
                if (els.length > 0) {
                    els.forEach(el => {
                        const target = findParent(e.target, el.elementString);
                        el.handler.call(target, e);
                    });
                }
            };

            if (document.addEventListener) {
                document.addEventListener(eventName, eventHandler);
            } else {
                document.attachEvent('on' + eventName, eventHandler);
            }
        }
    };

    return {
        find(elementString) {
            return document.querySelector(elementString);
        },
        findAll(elementString) {
            return Array.prototype.slice.call(
                document.querySelectorAll(elementString)
            );
        },
        append(elementString, content) {
            const els = this.findAll(elementString);
            if (els.length > 0) {
                els.forEach(el => {
                    if (typeof content === 'string') {
                        el.insertAdjacentHTML('afterend', content);
                    } else {
                        el.appendChild(content);
                    }
                });
            }
        },
        manageEvent(elementString, eventName, handler) {
            listeners.push({
                eventName,
                elementString,
                handler
            });
            addEventListener(eventName, handler);
        }
    };
};

export default uiBuilder;
