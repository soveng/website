# Sovereign Engineering

[Sovereign Engineering](https://sovereignengineering.io) organizes cohorts for open-source developers, focusing on how to best leverage freedom tech and emerging AI technologies to create systems that maximize human agency and eliminate tyranny.

[The program](https://sovereignengineering.io/concept) is grounded in the philosophy that technology should empower individuals, not control them. We believe in building systems that maximize human agency, foster collaboration, and resist centralized forms of control. To learn more about our guiding principles and vision, visit the [Philosophy page](https://sovereignengineering.io/philosophy).

## SEC-05: YOLO Mode

**SEC-05: YOLO Mode**, has concluded and focused on nostr as a substrate for agent-to-agent and agent-to-human communication and payments, as well as multi-agent orchestration in an open and collaborative environment.

You can read the SEC-05 YOLO Report [here](https://primal.net/soveng/sec-05-yolo-mode-report).

---

This is a content-driven website built with Astro, Tailwind CSS, and TypeScript.
It serves as the public home for the Sovereign Engineering project, featuring
podcasts, philosophy, FAQs, and more.

## Live Site

Visit: [https://sovereignengineering.io](https://sovereignengineering.io)

## Podcast Feed

The podcast XML feed is available at: [https://sovereignengineering.io/dialogues.xml](https://sovereignengineering.io/dialogues.xml)

It is also natively hosted on nostr via [castr.me](https://castr.me/npub1n00yy9y3704drtpph5wszen64w287nquftkcwcjv7gnnkpk2q54s73000n).

## Blog

`/blog` renders signed NIP-23 articles from the Sovereign Engineering Nostr account. At build time, `src/lib/blog.ts` queries public relays for kind 30023 events, verifies signatures, and uses the latest event for each article address. `src/data/nostrArticles.json` is a signed snapshot used when relays are unavailable. New or edited articles appear after the next site build and deployment. Dead legacy image URLs in older signed posts are mapped to surviving local artwork where available; the signed snapshot itself remains unchanged.

`/blog/rss.xml` provides full-text RSS for the same verified articles. The blog and article pages link to it for feed discovery. The feed refreshes with the site build.

To check the site without relay access, run `BLOG_OFFLINE=1 bun run build`.

## Public Resources

- **.well-known**: Exposes public metadata for services and verification ([RFC 8615](https://datatracker.ietf.org/doc/html/rfc8615)).
- **dialogues.xml**: Podcast feed for syndication.

## Features

- Astro + Tailwind CSS + TypeScript
- Markdown/MDX content for easy editing
- Responsive design
- Project and podcast showcases
- Public `.well-known` directory
- Custom podcast XML feed
- NIP-23 blog with offline article snapshot

## Getting Started

### Prerequisites

- Node.js v20+
- Bun (recommended) or npm/yarn

### Install Dependencies

```bash
bun install
# or
npm install
```

### Development

```bash
bun dev
# or
npm run dev
```

### Build for Production

```bash
bun build
# or
npm run build
```

### Preview Production Build

```bash
bun preview
# or
npm run preview
```

## Docker

Build and run with Docker:

```bash
docker build -t sovereignengineering .
docker run -p 3000:80 sovereignengineering
```

## Project Structure

- `src/` — Source files (content, layouts, components, styles)
- `public/` — Static files served at the site root
- `.well-known/` — Public metadata (inside `public/`)
- `dialogues.xml` — Podcast feed (inside `public/`)

## License

MIT License. See [LICENSE](./LICENSE) for details.

---

For questions, suggestions, or contributions, please open an issue or pull request.

## Alumni refresh

`bun run build` refreshes the alumni follow list and Nostr profile metadata, then downloads and crops avatars to 128 × 128 WebP images before generating the site. Profile discovery uses purplepag.es and relay.vertexlab.io alongside public relays. Signed NIP-65 relay lists are used to query each author’s advertised write relays (up to four per author, with bounded concurrency). Relay requests are time-limited and signatures are verified. Saved profiles fill gaps when relays are unavailable; matching cached avatars survive image-host failures. The page serves local images and does not query relays in visitors' browsers. Avatar binaries and their generated manifest are ignored by Git; a clean build downloads them again.

Profiles with no public bio keep the “No public bio.” placeholder. Profiles without a usable picture show initials. Changes made during a deployment are used for that build; the committed snapshot remains the fallback for future clean builds. To update that snapshot manually, run `bun scripts/extract-alumni-kind0.mjs` and `bun run cache-alumni-avatars`, then commit the profile JSON snapshot only. Do not commit the generated avatar files or manifest.
