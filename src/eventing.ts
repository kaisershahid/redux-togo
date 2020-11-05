import {Action, Middleware, MiddlewareAPI, Store} from "redux";
import {splitAction, TypedMap} from "./common";

export type EventListener = (type: string, payload: any, store: MiddlewareAPI) => any;

const UNSUB = () => {};

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
    listenerCount = 0;
    listeners: TypedMap<TypedMap<EventListener>> = {};
    unsubscribe = UNSUB;

    on(type: string, listener: EventListener) {
        if (!this.listeners[type]) {
            this.listeners[type] = {};
        }

        const idx = ++this.listenerCount;
        this.listeners[type][idx] = listener;
        return () => {
            delete this.listeners[type][idx];
        }
    }

    emit(payload: Action, store: MiddlewareAPI) {
        const type = payload.type;
        const actionPaths = splitAction(type);
        actionPaths.pop();

        let effectiveAction: any = type;
        while (effectiveAction !== undefined) {
            if (this.listeners[effectiveAction]) {
                Object.values(this.listeners[effectiveAction]).forEach((listener) => {
                    try {
                        listener(type, payload, store);
                    } catch (e) {
                        // @todo trigger custom error handler if defined: this.errorHandler(e, payload);
                    }
                })
            }

            if (effectiveAction === '*') {
                effectiveAction = undefined;
            } else if (actionPaths.length > 0) {
                effectiveAction = actionPaths.join('/') + '/*';
                actionPaths.pop();
            }  else {
                effectiveAction = '*';
            }
        }
    }
}

/**
 * Returns middleware that emits action as an evnt after dispatching is complete.
 * @param eventManager
 */
export const eventMiddleware = (eventManager: EventManager): Middleware => {
    return (store: MiddlewareAPI) => (next: (action: any) => any) => (action: Action) => {
        next(action);
        eventManager.emit(action, store);
    }
}

