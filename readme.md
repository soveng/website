# Sovereign Engineering

Sovereign Engineering organizes cohorts for open-source developers, focusing on how to best leverage freedom tech and emerging AI technologies to create systems that maximize human agency and eliminate tyranny. The upcoming cohort "SEC-05: YOLO Mode" will focus on nostr as a substrate for agent-to-agent and agent-to-human communication and payments, as well as multi-agent orchestration in an open and collaborative environment.

Sovereign Engineering is a modern, content-driven website built with Astro, Tailwind CSS, and TypeScript. It serves as the public home for the Sovereign Engineering community, featuring podcasts, philosophy, FAQs, and more.

## 🌐 Live Site

Visit: [https://sovereignengineering.io](https://sovereignengineering.io)

## 🎙️ Podcast Feed

The podcast XML feed is available at: [https://sovereignengineering.io/dialogues.xml](https://sovereignengineering.io/dialogues.xml)

## 📂 Public Resources

- **.well-known**: Exposes public metadata for services and verification ([RFC 8615](https://datatracker.ietf.org/doc/html/rfc8615)).
- **dialogues.xml**: Podcast feed for syndication.

## ✨ Features

- Astro + Tailwind CSS + TypeScript
- Markdown/MDX content for easy editing
- Responsive design
- Project and podcast showcases
- Public `.well-known` directory
- Custom podcast XML feed

## 🚀 Getting Started

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

## 🐳 Docker

Build and run with Docker:

```bash
docker build -t sovereignengineering .
docker run -p 3000:80 sovereignengineering
```

## 🛠️ Project Structure

- `src/` — Source files (content, layouts, components, styles)
- `public/` — Static files served at the site root
- `.well-known/` — Public metadata (inside `public/`)
- `dialogues.xml` — Podcast feed (inside `public/`)

## 📝 License

MIT License. See [LICENSE](./LICENSE) for details.

---

For questions, suggestions, or contributions, please open an issue or pull request.
