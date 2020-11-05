import { splitAction } from "./common";
const UNSUB = () => { };
/**
 * Unlike a typical event manager, when an event is emitted, listeners are invoked using a cascading set of listeners.
 *
 * For instance, if we attach listeners for `action/subaction` and `action/*` and then emit `action/subaction`, the
 * following occurs:
 *
 * 1. find and invoke all listeners for `action/subaction`
 * 2. for each ancestor action, invoke all listeners for `${ancestor.action}/*`
 *    - `action/*`
 *    - `*`
 */
export class EventManager {
    constructor() {
        this.listenerCount = 0;
        this.listeners = {};
        this.unsubscribe = UNSUB;
    }
    on(type, listener) {
        if (!this.listeners[type]) {
            this.listeners[type] = {};
        }
        const idx = ++this.listenerCount;
        this.listeners[type][idx] = listener;
        return () => {
            delete this.listeners[type][idx];
        };
    }
    emit(payload, store) {
        const type = payload.type;
        const actionPaths = splitAction(type);
        actionPaths.pop();
        let effectiveAction = type;
        while (effectiveAction !== undefined) {
            if (this.listeners[effectiveAction]) {
                Object.values(this.listeners[effectiveAction]).forEach((listener) => {
                    try {
                        listener(type, payload, store);
                    }
                    catch (e) {
                        // @todo trigger custom error handler if defined: this.errorHandler(e, payload);
                    }
                });
            }
            if (effectiveAction === '*') {
                effectiveAction = undefined;
            }
            else if (actionPaths.length > 0) {
                effectiveAction = actionPaths.join('/') + '/*';
                actionPaths.pop();
            }
            else {
                effectiveAction = '*';
            }
        }
    }
}
/**
 * Returns middleware that emits action as an evnt after dispatching is complete.
 * @param eventManager
 */
export const eventMiddleware = (eventManager) => {
    return (store) => (next) => (action) => {
        next(action);
        eventManager.emit(action, store);
    };
};
