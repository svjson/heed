/**
 * Base class for event-aware class components.
 *
 * This class provides a simple event emitter mechanism
 * to allow components to listen for and emit events.
 *
 * Components can extend this class to add event handling
 * capabilities without needing to implement their own
 * event management logic.
 *
 * @class EventEmitter
 */
export class EventEmitter {

  /**
   * Stores per-instance event listeners for different event names.
   * @type {Object<string, Function[]>}
   * @private
   */
  _listeners = {};

  /**
   * Retrieves the listeners for a given event name.
   * Returns [] for unknown events.
   *
   * @param {string} eventName - The name of the event to retrieve listeners for.
   * @return {Function[]} - An array of listeners for the event.
   */
  _getListeners(eventName) {
    return (this._listeners[eventName] ??= []);
  }

  /**
   * Registers a handler for a specific event.
   *
   * @param {string} eventName - The name of the event to listen for.
   * @param {Function} handler - The function to call when the event is emitted.
   */
  on(eventName, handler) {
    const eventListeners = this._getListeners(eventName);
    eventListeners.push(handler);
  }

  /**
   * Emits an event with the provided payload to all registered
   * listeners for that event.
   *
   * @param {string} eventName - The name of the event to emit.
   * @param {any} payload - The data to pass to the event listeners.
   */
  emit(eventName, payload) {
    const eventListeners = this._getListeners(eventName);
    eventListeners.forEach(listener => {
      listener(payload);
    });
  }

}
