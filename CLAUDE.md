# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Sovereign Engineering's website** built with Astro 5.7.8, React 19.1.0, and TailwindCSS 4.1.4. It's a content-focused static site showcasing a 6-week Bitcoin/Nostr engineering program, featuring a multi-author blog system, dark mode, and search functionality.

## Essential Commands

```bash
# Development workflow
yarn dev                 # Start dev server (auto-generates search JSON)
yarn build              # Production build (auto-generates search JSON)
yarn preview            # Preview production build
yarn check              # Astro type checking

# Utilities
yarn format             # Format with Prettier
yarn generate-json      # Generate search index files manually
```

## Architecture Overview

**Astro Islands Architecture**: React components are selectively hydrated using `client:load` directives. The site uses file-based routing with Astro components in `src/pages/`.

**Content Collections**: Strongly-typed content management using Zod schemas defined in `src/content.config.ts`. Collections include:
- `homepage` - Landing page sections (banner, features, CTA)
- `blog` - Articles with author, category, and tag support
- `authors` - Multi-author system with social links
- `pages` - Static pages (about, contact, privacy)
- `sections` - Reusable components (testimonials, CTAs)

**Search System**: Pre-generated JSON indexes (via `scripts/generate-json.mjs`) power client-side search functionality.

## Key File Locations

- **Main config**: `src/config/config.json` (site settings)
- **Theme config**: `src/config/theme.json` (colors, fonts)
- **Base layout**: `src/layouts/Base.astro`
- **Content schemas**: `src/content.config.ts`
- **Search generation**: `scripts/generate-json.mjs`

## Import Aliases

```typescript
"@/components/*": "./src/layouts/components/*"
"@/shortcodes/*": "./src/layouts/shortcodes/*"
"@/helpers/*": "./src/layouts/helpers/*"
```

## Content Management

Content is managed through Markdown files in `src/content/`. Each collection has a schema that validates frontmatter. The blog system supports multiple authors, categories, tags, and featured images.

## Development Rules

Use conventional commits with short, clear messages. Commit changes incrementally during development.

## Deployment

Configured for Netlify (`netlify.toml`), Vercel (`vercel.json`), and Docker. Build outputs to `dist/` directory.