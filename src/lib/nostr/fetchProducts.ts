import { SimplePool, nip19, type Event } from 'nostr-tools';

import { transformEventToProduct } from './productTransform';
import type { NostrProduct } from './types';

const RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://purplepag.es', 'wss://relay.primal.net', 'wss://relay.nostr.band'];

const MERCHANT_NPUB = 'npub1s0veng2gvfwr62acrxhnqexq76sj6ldg3a5t935jy8e6w3shr5vsnwrmq5';

export async function fetchProducts(): Promise<NostrProduct[]> {
  const pool = new SimplePool();

  try {
    // Decode npub to get pubkey
    const decoded = nip19.decode(MERCHANT_NPUB);
    if (decoded.type !== 'npub') {
      throw new Error('Invalid npub');
    }
    const pubkey = decoded.data as string;

    // Create filter for product events
    const filter = {
      kinds: [30402],
      authors: [pubkey],
    };

    // Fetch events with timeout
    const events = await Promise.race([
      pool.querySync(RELAYS, filter),
      new Promise<Event[]>((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 15000)),
    ]);

    // Transform to NDK-like format for our transformer
    const products = events
      .map((event) => ({
        ...event,
        tags: event.tags || [],
      }))
      .map((event) => transformEventToProduct(event as any))
      .filter((product) => product.name && product.price.amount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Close connections
    pool.close(RELAYS);

    return products;
  } catch {
    pool.close(RELAYS);
    return [];
  }
}
