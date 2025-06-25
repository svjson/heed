import { guid } from '../heed.js';

export class WebSocketClient {
  constructor(opts) {
    this.clientId = guid();
    this.reconnectAttempt = null;
    this.listeners = {};
    Object.assign(this, opts);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection = new WebSocket(`ws://${document.location.host}/`);
      this.connection.onerror = (err) => {
        console.error('[ws] WebSocket error', err);
        reject(err);
      };
      this.connection.onopen = () => {
        this.connection.onmessage = (msg) => {
          this.receiveMessage(JSON.parse(msg.data));
        };
        this.sendMessage({
          command: 'register',
          clientId: this.clientId,
          actor: this.actor
        });
        console.log('[ws] Connected');
        resolve();
      };
      this.connection.onclose = (event) => {
        console.warn('[ws] WebSocket connection closed', event);
        this.reconnect(true);
      };
    });
  }

  reconnect(retry) {
    if (this.connection.readyState === WebSocket.OPEN || this.reconnectAttempt) {
      return;
    }
    console.log('[ws] Reconnecting...');
    this.connect()
      .catch(() => {
        if (retry) {
          this.reconnectAttempt = setTimeout(() => {
            this.reconnectAttempt = null;
            this.reconnect(retry);
          }, 500);
        }
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
    } else if (message.event) {
      this.fire(message.event, message);
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
