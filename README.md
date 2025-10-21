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

## Getting Started

### Prerequisites

- Node.js v20+
- Yarn or npm

### Install Dependencies

```bash
yarn install
# or
npm install
```

### Development

```bash
yarn dev
# or
npm run dev
```

### Build for Production

```bash
yarn build
# or
npm run build
```

### Preview Production Build

```bash
yarn preview
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
