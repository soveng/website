import NDK from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

import { transformEventToProduct } from './productTransform';
import type { NostrProduct } from './types';

const RELAYS = ['wss://relay.damus.io', 'wss://nos.lol', 'wss://purplepag.es', 'wss://relay.primal.net', 'wss://relay.nostr.band'];

const MERCHANT_NPUB = 'npub1s0veng2gvfwr62acrxhnqexq76sj6ldg3a5t935jy8e6w3shr5vsnwrmq5';

export async function fetchProducts(): Promise<NostrProduct[]> {
  console.log('Fetching products from Nostr...');

  const ndk = new NDK({
    explicitRelayUrls: RELAYS,
    autoConnectUserRelays: false,
    autoFetchUserMutelist: false,
  });

  try {
    // Set a timeout for connection
    const connectPromise = ndk.connect();
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 10000));

    await Promise.race([connectPromise, timeoutPromise]);
    console.log('Connected to Nostr relays');

    // Decode npub to get pubkey
    const decoded = nip19.decode(MERCHANT_NPUB);
    if (decoded.type !== 'npub') {
      throw new Error('Invalid npub');
    }
    const pubkey = decoded.data;

    // Create filter for product events
    const filter = {
      kinds: [30402],
      authors: [pubkey],
    };

    console.log('Fetching events with filter:', filter);

    // Fetch events with timeout
    const fetchPromise = ndk.fetchEvents(filter);
    const fetchTimeoutPromise = new Promise<Set<any>>((_, reject) => setTimeout(() => reject(new Error('Fetch timeout')), 15000));

    const events = await Promise.race([fetchPromise, fetchTimeoutPromise]);
    console.log(`Found ${events.size} product events`);

    // Transform events to products
    const products = Array.from(events)
      .map(transformEventToProduct)
      .filter((product) => product.name && product.price.amount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`Transformed ${products.length} valid products`);

    // Disconnect from relays
    await ndk.destroy();

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Return empty array on error so build doesn't fail
    return [];
  }
}
