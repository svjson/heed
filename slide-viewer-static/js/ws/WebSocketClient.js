import { EventEmitter } from '../EventEmitter.js';
import { guid } from '../heed.js';

export class WebSocketClient extends EventEmitter {
  constructor(opts) {
    super();
    this.clientId = guid();
    this.reconnectAttempt = null;
    Object.assign(this, opts);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.connection = new WebSocket(`ws://${document.location.host}/`);
      this.connection.onerror = (err) => {
        console.error(`[ws] WebSocket error ${err.currentTarget?.url}`);
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
    if (message?.source?.clientId === this.clientId) return;
    if (message?.event) {
      this.emit(message.event, message);
    }
  }

  sendMessage(message) {
    this.connection.send(JSON.stringify(message));
  }
};
