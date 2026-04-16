const RSS_URL = 'https://sovereignengineering.io/dialogues.xml';

export interface Episode {
  title: string;
  slug: string;
  audioUrl: string;
  audioType: string;
  durationSeconds: number;
  durationFormatted: string;
  pubDate: string;
  pubDateISO: string;
  link: string;
  imageUrl: string;
  guestName: string;
  guestImg: string;
  guestHref: string;
  guestRole: string;
  subtitle: string;
  descriptionHtml: string;
  transcriptUrl: string;
  showNotesUrl: string;
  blockHeight: string;
}

function toSlug(title: string): string {
  return title
    .replace(/^#/, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0 ? `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}` : `${mins}:${String(secs).padStart(2, '0')}`;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function cleanDescriptionHtml(html: string): string {
  let s = html;
  // Strip <span style="font-weight: 400;"> wrappers (editor noise)
  s = s.replace(/<span\s+style="font-weight:\s*400;?">/g, '');
  s = s.replace(/<\/span>/g, '');
  // Strip &nbsp;
  s = s.replace(/&nbsp;/g, ' ');
  // Ensure space before opening <a> if preceded by text
  s = s.replace(/([^\s>])(<a\s)/g, '$1 $2');
  // Ensure space after closing </a> only before a word (avoid "Link :", "Tailscale 's", "SEC-07 .")
  s = s.replace(/(<\/a>)([a-zA-Z0-9])/g, '$1 $2');
  // Collapse multiple spaces
  s = s.replace(/ {2,}/g, ' ');
  return s.trim();
}

function parseItems(xml: string): Episode[] {
  const items: Episode[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;

  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];

    const get = (tag: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
      return m ? m[1].trim() : '';
    };

    const getAttr = (tag: string, attr: string) => {
      const m = block.match(new RegExp(`<${tag}[^>]*?${attr}="([^"]*)"`, 's'));
      return m ? m[1] : '';
    };

    const title = get('title');
    const durationSec = parseInt(get('itunes:duration') || '0', 10);

    const pubDateRaw = get('pubDate');
    const pubDate = pubDateRaw
      ? new Date(pubDateRaw).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : '';
    const pubDateISO = pubDateRaw ? new Date(pubDateRaw).toISOString() : '';

    // First podcast:person in the item
    const personMatch = block.match(/<podcast:person([^>]*)>([^<]*)<\/podcast:person>/);
    const personAttrs = personMatch ? personMatch[1] : '';
    const guestName = personMatch ? personMatch[2].trim() : '';
    const guestRole = (personAttrs.match(/role="([^"]*)"/) || [])[1] || '';
    const guestImg = (personAttrs.match(/img="([^"]*)"/) || [])[1] || '';
    const guestHref = (personAttrs.match(/href="([^"]*)"/) || [])[1] || '';

    // Description: full HTML and plain-text subtitle (first <p>)
    const descRaw = get('description');
    const firstPMatch = descRaw.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    const subtitle = firstPMatch ? decodeHtmlEntities(firstPMatch[1].replace(/<[^>]+>/g, '').trim()) : '';

    // Block height from "Recorded at <a href="https://mempool.space/block/NNNNNN">NNN,NNN</a>"
    const blockHeightMatch = descRaw.match(/mempool\.space\/block\/(\d+)[^>]*>([^<]+)</);
    const blockHeight = blockHeightMatch ? blockHeightMatch[2].trim() : '';

    items.push({
      title,
      slug: toSlug(title),
      audioUrl: getAttr('enclosure', 'url'),
      audioType: getAttr('enclosure', 'type'),
      durationSeconds: durationSec,
      durationFormatted: formatDuration(durationSec),
      pubDate,
      pubDateISO,
      link: get('link').replace('njump.me', 'njump.to'),
      imageUrl: getAttr('itunes:image', 'href'),
      guestName,
      guestImg,
      guestHref,
      guestRole,
      subtitle,
      descriptionHtml: cleanDescriptionHtml(descRaw).replace(/njump\.me/g, 'njump.to'),
      transcriptUrl: getAttr('podcast:transcript', 'url'),
      showNotesUrl: getAttr('podcast:contentLink', 'href'),
      blockHeight,
    });
  }

  return items;
}

let _cache: Episode[] | null = null;

export async function getEpisodes(): Promise<Episode[]> {
  if (_cache) {
    return _cache;
  }
  const res = await fetch(RSS_URL);
  const xml = await res.text();
  const episodes = parseItems(xml);
  episodes.sort((a, b) => new Date(b.pubDateISO).getTime() - new Date(a.pubDateISO).getTime());
  _cache = episodes;
  return episodes;
}
