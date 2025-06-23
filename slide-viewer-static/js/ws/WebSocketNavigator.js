
import { Heed } from '../heed.js';

export class WebSocketNavigator {
  constructor(opts) {
    this.clientId = Heed.guid();
    Object.assign(this, opts);
    this.listeners = {};
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection = new WebSocket(`ws://${document.location.host}/navigation`);
      this.connection.onerror = (err) => {
        console.error('WebSocket error', err);
        reject(err);
      };
      this.connection.onopen = () => {
        this.connection.onmessage = (msg) => {
          this.receiveMessage(JSON.parse(msg.data));
        };
        this.sendMessage({ command: 'register', actor: this.actor });
        resolve();
      };
      this.connection.onclose = (event) => {
        console.warn('WebSocket connection closed', event);
      };
    });
  }

  navigate(payload) {
    payload.command = 'navigate';
    payload.clientId = this.clientId;
    this.sendMessage(payload);
  }

  receiveMessage(message) {
    if (message.clientId === this.clientId) return;
    if (message.command === 'navigate') {
      this.fire('navigation', message.slide);
    }
  }

  fire(eventName, payload) {
    if (!this.listeners[eventName]) return;
    this.listeners[eventName].forEach((handler) => {
      handler(payload);
    });
  }

  on(eventName, handler) {
    if (!this.listeners[eventName]) this.listeners[eventName] = [];
    this.listeners[eventName].push(handler);
  }

  sendMessage(message) {
    this.connection.send(JSON.stringify(message));
  }
};
