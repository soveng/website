import { nip19, SimplePool, verifyEvent, type Event } from 'nostr-tools';

const tagIs = (event: Event, name: string, value: string) => event.tags.some((tag) => tag[0] === name && tag[1] === value);

const tagValue = (event: Event, name: string) => event.tags.find((tag) => tag[0] === name)?.[1];

const uniqueEvents = (events: Event[]) => [...new Map(events.map((event) => [event.id, event])).values()];

const eventUrl = (id: string) => `https://njump.me/${nip19.noteEncode(id)}`;

const authorName = (pubkey: string) => {
  const npub = nip19.npubEncode(pubkey);
  return `${npub.slice(0, 11)}…${npub.slice(-5)}`;
};

const dateLabel = (timestamp: number) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(timestamp * 1000);

function renderReactions(section: HTMLElement, events: Event[]) {
  const count = section.querySelector<HTMLElement>('[data-reaction-count]');
  const status = section.querySelector<HTMLElement>('[data-reaction-status]');
  const list = section.querySelector<HTMLElement>('[data-reaction-list]');
  if (!count || !status || !list) {
    return;
  }

  count.textContent = events.length ? `(${events.length})` : '';
  if (!events.length) {
    status.textContent = 'No reactions found on these relays yet.';
    return;
  }

  const totals = new Map<string, number>();
  for (const event of events) {
    const raw = event.content.trim();
    const reaction = raw === '' || raw === '+' ? '👍' : raw === '-' ? '👎' : Array.from(raw).slice(0, 16).join('');
    totals.set(reaction, (totals.get(reaction) ?? 0) + 1);
  }

  for (const [reaction, total] of [...totals].sort((a, b) => b[1] - a[1])) {
    const chip = document.createElement('span');
    chip.className = 'blog-reaction-chip';
    chip.textContent = `${reaction} ${total}`;
    list.append(chip);
  }
  status.hidden = true;
  list.hidden = false;
}

function renderComments(section: HTMLElement, events: Event[]) {
  const count = section.querySelector<HTMLElement>('[data-comment-count]');
  const status = section.querySelector<HTMLElement>('[data-comment-status]');
  const list = section.querySelector<HTMLOListElement>('[data-comment-list]');
  if (!count || !status || !list) {
    return;
  }

  count.textContent = events.length ? `(${events.length})` : '';
  if (!events.length) {
    status.textContent = 'No comments found on these relays yet.';
    return;
  }

  const byId = new Map(events.map((event) => [event.id, event]));
  const replies = new Map<string, Event[]>();
  const roots: Event[] = [];

  for (const event of events) {
    const parent = tagIs(event, 'k', '1111') ? tagValue(event, 'e') : undefined;
    if (parent && parent !== event.id && byId.has(parent)) {
      const siblings = replies.get(parent) ?? [];
      siblings.push(event);
      replies.set(parent, siblings);
    } else {
      roots.push(event);
    }
  }

  roots.sort((a, b) => b.created_at - a.created_at);
  for (const siblings of replies.values()) {
    siblings.sort((a, b) => a.created_at - b.created_at);
  }

  const visited = new Set<string>();
  const authorLinks = new Map<string, HTMLAnchorElement[]>();

  function appendComment(event: Event, target: HTMLOListElement) {
    if (visited.has(event.id)) {
      return;
    }
    visited.add(event.id);

    const item = document.createElement('li');
    item.className = 'blog-comment';
    const meta = document.createElement('div');
    meta.className = 'blog-comment-meta';
    const author = document.createElement('a');
    author.href = `https://njump.me/${nip19.npubEncode(event.pubkey)}`;
    author.target = '_blank';
    author.rel = 'noopener noreferrer';
    author.textContent = authorName(event.pubkey);
    const links = authorLinks.get(event.pubkey) ?? [];
    links.push(author);
    authorLinks.set(event.pubkey, links);
    const date = document.createElement('time');
    date.dateTime = new Date(event.created_at * 1000).toISOString();
    date.textContent = dateLabel(event.created_at);
    const source = document.createElement('a');
    source.href = eventUrl(event.id);
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = 'Nostr ↗';
    meta.append(author, date, source);

    const content = document.createElement('p');
    content.className = 'blog-comment-content';
    content.textContent = event.content.length > 1200 ? `${event.content.slice(0, 1200).trimEnd()}…` : event.content;
    item.append(meta, content);
    target.append(item);

    const children = replies.get(event.id);
    if (children?.length) {
      const childList = document.createElement('ol');
      childList.className = 'blog-comment-replies';
      item.append(childList);
      for (const child of children) {
        appendComment(child, childList);
      }
    }
  }

  for (const event of roots) {
    appendComment(event, list);
  }
  for (const event of events) {
    appendComment(event, list);
  }
  status.hidden = true;
  list.hidden = false;
  return authorLinks;
}

export function mountBlogActivity(section: HTMLElement) {
  const address = section.dataset.articleAddress;
  const { articleId } = section.dataset;
  const relays = section.dataset.relays?.split(' ').filter(Boolean) ?? [];
  if (!address || !articleId || !relays.length) {
    return () => {};
  }

  const pool = new SimplePool();
  let active = true;

  void (async () => {
    try {
      const results = await Promise.allSettled([
        pool.querySync(relays, { kinds: [1111], '#A': [address], limit: 100 }, { maxWait: 6000 }),
        pool.querySync(relays, { kinds: [7], '#a': [address], limit: 150 }, { maxWait: 6000 }),
        pool.querySync(relays, { kinds: [7], '#e': [articleId], limit: 150 }, { maxWait: 6000 }),
      ]);
      if (!active) {
        return;
      }

      const commentsResult = results[0];
      const reactionResults = results.slice(1);

      const fulfilled = reactionResults.filter((result): result is PromiseFulfilledResult<Event[]> => result.status === 'fulfilled');
      if (fulfilled.length) {
        const reactions = uniqueEvents(fulfilled.flatMap((result) => result.value)).filter(
          (event) =>
            event.kind === 7 && verifyEvent(event) && event.tags.some((tag) => tag[0] === 'e') && (tagIs(event, 'a', address) || tagIs(event, 'e', articleId))
        );
        renderReactions(section, reactions);
      } else {
        const status = section.querySelector<HTMLElement>('[data-reaction-status]');
        if (status) {
          status.textContent = 'Reactions are unavailable right now.';
        }
      }

      if (commentsResult.status === 'fulfilled') {
        const comments = uniqueEvents(commentsResult.value).filter(
          (event) => event.kind === 1111 && verifyEvent(event) && tagIs(event, 'A', address) && tagIs(event, 'K', '30023')
        );
        const authors = renderComments(section, comments);
        if (authors?.size) {
          try {
            const profiles = await pool.querySync(
              relays,
              { kinds: [0], authors: [...authors.keys()], limit: Math.min(authors.size * 4, 100) },
              { maxWait: 3500 }
            );
            if (!active) {
              return;
            }
            const latest = new Map<string, Event>();
            for (const profile of profiles) {
              if (!verifyEvent(profile) || profile.kind !== 0) {
                continue;
              }
              if ((latest.get(profile.pubkey)?.created_at ?? 0) < profile.created_at) {
                latest.set(profile.pubkey, profile);
              }
            }
            for (const [pubkey, profile] of latest) {
              try {
                const data = JSON.parse(profile.content) as { display_name?: unknown; name?: unknown };
                const name = [data.display_name, data.name].find((value) => typeof value === 'string' && value.trim() && !/^[\p{P}\s]+$/u.test(value));
                if (typeof name === 'string') {
                  for (const link of authors.get(pubkey) ?? []) {
                    link.textContent = name.trim().slice(0, 80);
                  }
                }
              } catch {
                /* Ignore malformed profile metadata. */
              }
            }
          } catch {
            /* Comments remain readable without profile metadata. */
          }
        }
      } else {
        const status = section.querySelector<HTMLElement>('[data-comment-status]');
        if (status) {
          status.textContent = 'Comments are unavailable right now.';
        }
      }
    } catch {
      if (!active) {
        return;
      }
      section.querySelectorAll<HTMLElement>('[data-comment-status], [data-reaction-status]').forEach((status) => {
        if (!status.hidden) {
          status.textContent = 'Nostr activity is unavailable right now.';
        }
      });
    } finally {
      pool.destroy();
    }
  })();

  return () => {
    active = false;
    pool.destroy();
  };
}
