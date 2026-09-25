import { WebSocket } from 'ws';

export class BlogWebSocket extends WebSocket {
  constructor(url: string) {
    super(url);
    // nostr-tools clears onerror during timeout cleanup. ws can then emit a
    // deferred error for closing a pending handshake, so retain a Node listener.
    // The pool still handles connection failures through its own onerror hook.
    this.on('error', () => {});
  }
}
