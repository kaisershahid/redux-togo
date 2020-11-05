import { Action, Middleware, MiddlewareAPI } from "redux";
import { TypedMap } from "./common";
export declare type EventListener = (type: string, payload: any, store: MiddlewareAPI) => any;
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
export declare class EventManager {
    listenerCount: number;
    listeners: TypedMap<TypedMap<EventListener>>;
    unsubscribe: () => void;
    on(type: string, listener: EventListener): () => void;
    emit(payload: Action, store: MiddlewareAPI): void;
}
/**
 * Returns middleware that emits action as an evnt after dispatching is complete.
 * @param eventManager
 */
export declare const eventMiddleware: (eventManager: EventManager) => Middleware;
