import {expect} from 'chai';
import {EventManager, eventMiddleware} from "./eventing";
import {applyMiddleware, createStore} from "redux";

describe('Eventing', () => {
    const subject = new EventManager();
    const middleware = eventMiddleware(subject);
    const store = createStore((action) => {return action ?? {}}, applyMiddleware(middleware));

    it('emits event for a dispatched action', () => {
        const events: any[] = [];
        const unsub = subject.on('hello', (type, payload, store) => {
            events.push({type, payload});
        })

        store.dispatch({type: "hello", arr:[1]});
        unsub();
        expect(events[0]?.type).to.equal('hello');
        expect(events[0]?.payload?.arr).to.deep.equal([1]);
    })

    it('emits cascading events for a dispatched action', () => {
        const events: any[] = [];
        const unsubs: Function[] = [];
        unsubs.push(subject.on('hello/goodbye', (type, payload, store) => {
            events.push({type, payload});
        }))
        unsubs.push(subject.on('*', (type, payload, store) => {
            events.push({type: type + ':3', payload});
        }));
        unsubs.push(subject.on('hello/*', (type, payload, store) => {
            events.push({type: type + ':2', payload});
        }))

        store.dispatch({type: "hello/goodbye", arr:[1]});
        unsubs.forEach(f => f());
        expect(events.map((p) => p.type)).to.deep.equal(['hello/goodbye', 'hello/goodbye:2', 'hello/goodbye:3']);
    })
})
