# Swag Page Implementation Plan

## Overview
Build a static swag page that fetches product data from Nostr at build time, creating a fully static page with no runtime dependencies.

## Architecture

### 1. Dependencies
- Add `@nostr-dev-kit/ndk` as a dev dependency (only needed at build time)
- No runtime Nostr dependencies needed since we're building static

### 2. Data Fetching Strategy

#### Build-time Script (`src/lib/nostr/fetchProducts.ts`)
```typescript
import NDK from '@nostr-dev-kit/ndk';
import { nip19 } from 'nostr-tools';

const RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://purplepag.es",
  "wss://relay.primal.net",
  "wss://relay.nostr.band"
];

const MERCHANT_NPUB = "npub1s0veng2gvfwr62acrxhnqexq76sj6ldg3a5t935jy8e6w3shr5vsnwrmq5";

export async function fetchProducts() {
  const ndk = new NDK({ explicitRelayUrls: RELAYS });
  await ndk.connect();
  
  const pubkey = nip19.decode(MERCHANT_NPUB).data;
  
  const filter = {
    kinds: [30402],
    authors: [pubkey]
  };
  
  const events = await ndk.fetchEvents(filter);
  
  // Transform events to product data
  return Array.from(events).map(transformEventToProduct);
}
```

### 3. Content Collection Approach

#### Option A: Dynamic Import in Astro Page (Recommended)
- Create `/src/pages/swag.astro`
- Fetch products directly in the page frontmatter
- No need for intermediate storage

```astro
---
import { fetchProducts } from '@/lib/nostr/fetchProducts';
import SwagLayout from '@/layouts/SwagLayout.astro';
import ProductCard from '@/components/ProductCard.astro';

// This runs at build time only
const products = await fetchProducts();
---

<SwagLayout>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {products.map(product => (
      <ProductCard product={product} />
    ))}
  </div>
</SwagLayout>
```

#### Option B: Generate JSON at Build Time
- Add a prebuild script that fetches products and saves to JSON
- Import JSON in Astro page
- Useful if you want to inspect/version control the data

### 4. Product Data Structure

Based on NIP-99, transform Nostr events to:

```typescript
interface Product {
  id: string;              // d-tag identifier
  naddr: string;           // Full naddr for deep linking
  name: string;            // From title tag
  description: string;     // Event content
  price: {
    amount: number;
    currency: string;
  };
  images: string[];        // From image tags
  categories: string[];    // From t tags
  shipping?: {
    id: string;
    cost: number;
  }[];
  stock?: number;
  specs?: Array<[string, string]>;
}
```

### 5. Implementation Steps

1. **Install Dependencies**
   ```bash
   yarn add -D @nostr-dev-kit/ndk nostr-tools
   ```

2. **Create Fetch Utility**
   - `/src/lib/nostr/fetchProducts.ts` - Main fetching logic
   - `/src/lib/nostr/productTransform.ts` - Event to Product transformation

3. **Create Components**
   - `/src/components/ProductCard.astro` - Individual product display
   - `/src/components/ProductGrid.astro` - Grid layout wrapper
   - `/src/components/ProductImage.astro` - Image with fallback handling

4. **Create Swag Page**
   - `/src/pages/swag.astro` - Main swag page
   - Use existing base layout
   - Add proper SEO metadata

5. **Update Navigation**
   - Change swag link in menu.json to internal `/swag` route

### 6. Error Handling & Fallbacks

- Timeout for relay connections (10s max)
- Fallback to partial data if some relays fail
- Cache results during build for consistency
- Provide fallback UI if no products found

### 7. Image Optimization

- Download and optimize product images at build time
- Use Astro's Image component for optimization
- Fallback to placeholder if image fails

### 8. Build Configuration

Add to `astro.config.mjs` if needed:
```js
export default defineConfig({
  build: {
    // Ensure fresh data on each build
    cache: false
  }
});
```

### 9. Testing Strategy

1. Create mock Nostr responses for development
2. Add build-time validation for product data
3. Test with different relay availability scenarios

### 10. Future Enhancements

- Add product filtering/search (client-side)
- Implement shopping cart with localStorage
- Add product detail pages using dynamic routes
- Consider incremental builds for product updates

## Benefits of This Approach

1. **Zero Runtime Cost**: All data fetched at build time
2. **SEO Friendly**: Full static HTML with product data
3. **Fast Loading**: No client-side data fetching
4. **Resilient**: Site works even if Nostr relays are down
5. **Type Safe**: Full TypeScript support throughout

## Potential Challenges

1. **Build Time**: Fetching from multiple relays may slow builds
2. **Data Freshness**: Products only update on rebuild
3. **Image Reliability**: External images may change/disappear

## Next Steps

1. Implement basic fetching logic
2. Create minimal product display
3. Test with real merchant data
4. Iterate on design and features