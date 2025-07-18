import type { NDKEvent } from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

import type { NostrProduct } from './types';

export function transformEventToProduct(event: NDKEvent): NostrProduct {
  // Get d-tag identifier
  const dTag = event.tags.find((t) => t[0] === 'd')?.[1] || '';

  // Generate naddr
  const naddr = nip19.naddrEncode({
    identifier: dTag,
    pubkey: event.pubkey,
    kind: 30402,
  });

  // Extract product name
  const name = event.tags.find((t) => t[0] === 'title')?.[1] || event.tags.find((t) => t[0] === 'name')?.[1] || 'Unnamed Product';

  // Extract price
  const priceTag = event.tags.find((t) => t[0] === 'price');
  const price = {
    amount: priceTag ? parseFloat(priceTag[1]) : 0,
    currency: priceTag?.[2] || 'USD',
  };

  // Extract images
  const images = event.tags
    .filter((t) => t[0] === 'image')
    .map((t) => t[1])
    .filter(Boolean);

  // Extract categories (t tags)
  const categories = event.tags
    .filter((t) => t[0] === 't')
    .map((t) => t[1])
    .filter(Boolean);

  // Extract shipping options
  const shipping = event.tags
    .filter((t) => t[0] === 'shipping')
    .map((t) => ({
      id: t[1],
      cost: parseFloat(t[2] || '0'),
    }));

  // Extract quantity/stock
  const quantityTag = event.tags.find((t) => t[0] === 'quantity');
  const stock = quantityTag ? parseInt(quantityTag[1]) : undefined;

  // Extract specs
  const specs = event.tags
    .filter((t) => t[0] === 'spec')
    .map((t) => [t[1], t[2]] as [string, string])
    .filter((t) => t[0] && t[1]);

  return {
    id: dTag,
    naddr,
    name,
    description: event.content,
    price,
    images,
    categories,
    shipping: shipping.length > 0 ? shipping : undefined,
    stock,
    specs: specs.length > 0 ? specs : undefined,
  };
}
