// Product types based on NIP-99 specification
export interface NostrProduct {
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

export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}