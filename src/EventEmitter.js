export default class EventEmitter {
    constructor() {
        this._events = {};
    }

    emit(event, ...data) {
        if (!this._events[event]) return;
        this._events[event].forEach(callback => callback(...data))
    }

    on(event, callback) {
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }

    off(event) {
        if (!this._events[event]) return;
        delete this._events[event];
    }
}