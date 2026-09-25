import { createHash } from 'node:crypto';

import { Marked } from 'marked';
import { nip19, verifyEvent, type Event } from 'nostr-tools';
import { AbstractSimplePool } from 'nostr-tools/abstract-pool';
import sanitizeHtml from 'sanitize-html';

import savedEvents from '@/data/nostrArticles.json';
import { BlogWebSocket } from '@/lib/blogWebSocket';

export const BLOG_PUBKEY = '83d999a148625c3d2bb819af3064c0f6a12d7da88f68b2c69221f3a746171d19';
export const BLOG_RELAYS = ['wss://nos.lol', 'wss://relay.damus.io'];
export const BLOG_PROFILE_RELAYS = [...BLOG_RELAYS, 'wss://relay.vertexlab.io'];

// Old site image URLs embedded in signed posts now return 404. Preserve the
// signed event and use existing site artwork where an equivalent survives.
const legacyImages: Record<string, string | null> = {
  'https://sovereignengineering.io/assets/images/banner.jpg': '/images/banner.png',
  'https://sovereignengineering.io/assets/images/bell-labs.jpg': '/images/blog/bell-labs.jpeg',
  'https://sovereignengineering.io/assets/images/pirate-market.jpg': null,
  'https://sovereignengineering.io/assets/images/sec01-landing.jpg': null,
  'https://sovereignengineering.io/assets/images/school-of-athens.jpg': '/images/blog/school-of-athens.jpeg',
  'https://sovereignengineering.io/assets/images/sec-loop.jpg': '/images/blog/show-talk-build-loop.jpeg',
};

export type BlogArticle = {
  id: string;
  slug: string;
  identifier: string;
  title: string;
  summary: string;
  image: string | null;
  publishedAt: number;
  updatedAt: number;
  tags: string[];
  content: string;
  html: string;
  naddr: string;
  nostrUrl: string;
};

function tag(event: Event, name: string): string | undefined {
  return event.tags.find((entry) => entry[0] === name)?.[1];
}

function safeImage(value: string | undefined): string | null {
  if (!value) {
    return null;
  }
  if (Object.hasOwn(legacyImages, value)) {
    return legacyImages[value];
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

function validArticle(value: unknown): value is Event {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const event = value as Event;
  return (
    event.kind === 30023 &&
    event.pubkey === BLOG_PUBKEY &&
    typeof event.content === 'string' &&
    typeof tag(event, 'd') === 'string' &&
    Boolean(tag(event, 'd')) &&
    verifyEvent(event)
  );
}

function articleSlug(identifier: string): string {
  if (/^[a-z0-9][a-z0-9_-]*$/.test(identifier)) {
    return identifier;
  }
  return `article-${createHash('sha256').update(identifier).digest('hex').slice(0, 16)}`;
}

const nostrReference = {
  name: 'nostrReference',
  level: 'inline' as const,
  start(source: string) {
    return source.indexOf('nostr:');
  },
  tokenizer(source: string) {
    const match = /^nostr:(naddr1|nevent1|nprofile1|npub1|note1)[023456789acdefghjklmnpqrstuvwxyz]+/i.exec(source);
    if (!match) {
      return;
    }
    return { type: 'nostrReference', raw: match[0], entity: match[0].slice(6) };
  },
  renderer(token: { entity: string }) {
    try {
      const decoded = nip19.decode(token.entity);
      const pubkey = decoded.type === 'nprofile' ? decoded.data.pubkey : decoded.type === 'npub' ? decoded.data : undefined;
      if (pubkey) {
        return `<a href="https://njump.me/${token.entity}">${nip19.npubEncode(pubkey).slice(0, 12)}…</a>`;
      }
    } catch {
      // Keep malformed references as shortened text.
    }
    return `<a href="https://njump.me/${token.entity}">${token.entity.slice(0, 12)}…</a>`;
  },
};

const blogMarked = new Marked({ gfm: true, breaks: false });
blogMarked.use({ extensions: [nostrReference] });

export function renderBlogMarkdown(content: string): string {
  let markdown = content;
  for (const [oldUrl, replacement] of Object.entries(legacyImages)) {
    if (replacement) {
      markdown = markdown.replaceAll(oldUrl, replacement);
    }
  }
  const html = blogMarked.parse(markdown, { async: false }) as string;
  return sanitizeHtml(html, {
    // eslint-disable-next-line import/no-named-as-default-member
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      a: ['href', 'title', 'rel', 'target'],
      img: ['src', 'alt', 'title', 'loading', 'decoding'],
      code: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_name, attributes) => {
        const href = attributes.href?.replace(/^nostr:/i, 'https://njump.me/');
        return { tagName: 'a', attribs: { ...attributes, href, target: '_blank', rel: 'noopener noreferrer' } };
      },
      img: (_name, attributes) => ({
        tagName: 'img',
        attribs: { ...attributes, loading: 'lazy', decoding: 'async' },
      }),
    },
  });
}

function toArticle(event: Event): BlogArticle {
  const identifier = tag(event, 'd')!;
  const naddr = nip19.naddrEncode({ identifier, pubkey: BLOG_PUBKEY, kind: 30023, relays: BLOG_RELAYS });
  const published = Number(tag(event, 'published_at'));
  return {
    id: event.id,
    slug: articleSlug(identifier),
    identifier,
    title: tag(event, 'title') || identifier,
    summary: tag(event, 'summary') || '',
    image: safeImage(tag(event, 'image')),
    publishedAt: Number.isSafeInteger(published) && published > 0 && published <= event.created_at ? published : event.created_at,
    updatedAt: event.created_at,
    tags: event.tags.filter((entry) => entry[0] === 't' && entry[1]).map((entry) => entry[1]),
    content: event.content,
    html: renderBlogMarkdown(event.content),
    naddr,
    nostrUrl: `https://njump.me/${naddr}`,
  };
}

async function fetchLiveEvents(): Promise<Event[]> {
  if (process.env.BLOG_OFFLINE === '1') {
    return [];
  }
  // Node's built-in WebSocket can recurse through nostr-tools' error handler
  // when a relay connection fails, crashing static builds before fallback.
  const pool = new AbstractSimplePool({
    verifyEvent,
    websocketImplementation: BlogWebSocket as unknown as typeof globalThis.WebSocket,
    maxWaitForConnection: 3000,
  });
  try {
    return await pool.querySync(BLOG_RELAYS, { kinds: [30023], authors: [BLOG_PUBKEY], limit: 1000 }, { maxWait: 5000 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Blog relay refresh failed; using signed article snapshot.', error);
    return [];
  } finally {
    pool.destroy();
  }
}

let articlesPromise: Promise<BlogArticle[]> | undefined;

export function getBlogArticles(): Promise<BlogArticle[]> {
  articlesPromise ??= (async () => {
    const events = [...savedEvents, ...(await fetchLiveEvents())];
    const latest = new Map<string, Event>();
    for (const value of events) {
      if (!validArticle(value)) {
        continue;
      }
      const identifier = tag(value, 'd')!;
      const old = latest.get(identifier);
      if (!old || value.created_at > old.created_at || (value.created_at === old.created_at && value.id > old.id)) {
        latest.set(identifier, value);
      }
    }
    return [...latest.values()].map(toArticle).sort((a, b) => b.publishedAt - a.publishedAt || b.updatedAt - a.updatedAt);
  })();
  return articlesPromise;
}
