import { nip19, SimplePool, verifyEvent, type Event } from 'nostr-tools';

import { nostrProfileName } from '@/lib/nostrProfileName';

export function mountBlogProfiles(content: HTMLElement, relays: string[]) {
  const links = content.querySelectorAll<HTMLAnchorElement>('a[href^="https://njump.me/nprofile1"], a[href^="https://njump.me/npub1"]');
  const byPubkey = new Map<string, HTMLAnchorElement[]>();
  for (const link of links) {
    const label = link.textContent?.trim() ?? '';
    if (!label.startsWith('npub1') && !label.startsWith('nprofile1')) {
      continue;
    }
    let pubkey: string;
    try {
      const decoded = nip19.decode(link.pathname.slice(1));
      if (decoded.type !== 'nprofile' && decoded.type !== 'npub') {
        continue;
      }
      pubkey = decoded.type === 'nprofile' ? decoded.data.pubkey : decoded.data;
    } catch {
      continue;
    }
    const siblings = byPubkey.get(pubkey) ?? [];
    siblings.push(link);
    byPubkey.set(pubkey, siblings);
  }
  if (!byPubkey.size || !relays.length) {
    return () => {};
  }

  const pool = new SimplePool();
  let active = true;
  void (async () => {
    try {
      const events = await pool.querySync(relays, { kinds: [0], authors: [...byPubkey.keys()], limit: Math.min(byPubkey.size * 4, 200) }, { maxWait: 5000 });
      if (!active) {
        return;
      }

      const latest = new Map<string, Event>();
      for (const event of events) {
        if (event.kind !== 0 || !byPubkey.has(event.pubkey) || !verifyEvent(event)) {
          continue;
        }
        if ((latest.get(event.pubkey)?.created_at ?? 0) < event.created_at) {
          latest.set(event.pubkey, event);
        }
      }
      for (const [pubkey, event] of latest) {
        const name = nostrProfileName(event.content);
        if (name) {
          for (const link of byPubkey.get(pubkey) ?? []) {
            link.textContent = name;
          }
        }
      }
    } catch {
      // Links remain usable with their short npub labels when relays fail.
    } finally {
      pool.destroy();
    }
  })();

  return () => {
    active = false;
    pool.destroy();
  };
}
