# Sovereign Engineering

Website for Sovereign Engineering.

`src/entry.js` waits for the page stylesheet before starting animations. This
keeps canvas sizes and pinned scroll distances correct when CSS loads slowly.

The homepage's iceberg sequence is drawn in canvas by
`src/iceberg-animation.js`. Scrolling pins the scene, opens the fault, and
descends from week 01 into weeks 02–03. Reduced-motion visitors see both
chapters in a static, sequential layout.

`src/ship-animation.js` assembles and launches the SVG sailboat;
`src/blocks-animation.js` assembles a small house from eighteen regular 2×4
bricks, with an open doorway, blue foundation, and stepped red roof.
Both scenes follow scrolling and use an unpinned static layout for reduced motion.

`src/demo-animation.js` lights a projector, reveals an app, and clicks its button
to complete a task in the red Demo Day section. The short pinned sequence follows
scrolling; reduced motion and no JavaScript show the completed SVG scene.

`src/plant-animation.js` is the shared renderer for the seven showcase plants.
The homepage drives growth with scrolling; `src/project-plant.js` plays it once
over time on the individual project pages, pausing while offscreen. FIPS packets
continue through the roots after growth finishes. Reduced motion shows the
finished illustration, and visitors without JavaScript see the project logo.
Project pages opt into a brighter dark-background palette; the homepage keeps
its original colors. Plant species and seeds are set in `content/project-stories.json`.

`src/fips-animation.js` grows a branching root network directly from the base
of TollGate’s mangrove, showing FIPS emerging from TollGate. The two canvases
share a root anchor, and TollGate stays upright to preserve that connection.
A low patch of grass marks the ground between TollGate’s trunk and the roots.
The deeper root section grows with scrolling; three slow packet pulses repeat
while the network is visible, traveling outward and back toward TollGate.
Reduced-motion visitors see a static view, and offscreen animation is paused.
Portrait screens generate additional short, staggered root branches in pixel
coordinates rather than stretching the desktop network vertically.

## Podcast and FAQ content

The podcast archive, individual episodes, FAQ, and policies are static pages
generated when Vite starts or builds. Edit the sources, then restart the dev
server to regenerate the pages:

- `public/dialogues.xml`: the No Solutions RSS feed and source for all episodes.
  Preserve existing GUIDs, enclosures, and titles (titles determine the existing
  episode URLs). Add new episodes here, then rebuild.
- `content/faq.md`: FAQ answers, in YAML frontmatter with Markdown answers.
- `content/policy.md`: selection and participation policies.
- `content/mountain.md`: the seven-day mountain cohort narrative for 2027,
  available at `/mountain/` and linked only from the footer.
- `scripts/generate-pages.js`: shared page layout and content rendering.
- `src/podcast-animation.js`: the homepage bell-curve scroll sequence.
  Its characters use the [Bell Curve template](https://imgflip.com/memegenerator/533936279/Bell-Curve)
  stored unchanged at `public/images/bell-curve-meme.png`. SVG crops and filters
  isolate the characters and match the site's colours; the curve is drawn in SVG.
  Reduced-motion visitors get the complete static illustration.

The root `podcast/`, `faq/`, `policy/`, `projects/`, and `mountain/` directories are generated and ignored
by Git. They are replaced during generation; do not edit or store source in them.
The build does not fetch content from the live site. Audio, episode artwork,
and transcripts remain hosted at their original URLs. Players load audio only
when requested.

Content and podcast artwork were migrated from
[`soveng/website-legacy`](https://github.com/soveng/website-legacy/tree/a7bdb068bed022c9dcb7b466a16b6227629c8994).
The feed is preserved verbatim, including Podcasting 2.0 metadata. FAQ cohort
links now point to `/#apply`; the policy's philosophy link points to the program
section while new philosophy copy is pending. Nostr verification metadata is
preserved at `/.well-known/nostr.json`.

The final homepage invitation is rendered by `scripts/render-apply.js`. Set
`content/applications.json` to `"status": "open"` and supply the HTTPS
`applicationUrl` to show the primary application button. The closed state shows a
short availability message and a subtle FAQ link. Keep the FAQ’s cohort details
in sync when opening applications.

Before public release:

- Run `npm run check:migration` and `npm run check:live-links` against the v3
  deployment. The latter accepts an origin argument for checking the main domain.
- Finish the remaining general browser review, then move the main domain and
  verify HTTPS, redirects, feeds, social previews, and Nostr verification there.
- Applications remain closed.
- [x] Live Buttondown newsletter signup test passed — confirmed by Gigi on
  2026-10-10.

The 2026-10-07 URL audit captured the live site's 77 sitemap pages, content
fragments, internal links, podcast references, and URLs found in historical
pages and cohort documentation. `content/legacy-links.json` records 988 known
paths and fragments. Internal navigation-control and analytics IDs, along with
old generated JS/CSS bundles, are excluded; public images and content anchors
are preserved. This inventory cannot discover links in private messages or
external pages that are not in those sources.

`content/legacy-fragments.json` maps renamed sections and old page-level Apply
links. The original Bitcoin, Nostr, and Madeira pages retain their `.html` URLs
and section IDs as archives. SEC-08 includes all 76 projects from the old site.
Image dimensions and post-layout anchor positioning prevent fonts, lazy images,
and the homepage intro from displacing deep links. User interaction stops
subsequent automatic positioning.

The podcast audit preserves all 38 GUIDs, audio enclosure URLs, and episode
links against `content/legacy-podcast-items.json`. The RSS snapshot includes the
latest episode 37 show notes and transcript reference from the live source.

## Projects and testimonials

The project archive preserves 230 entries across SEC-00 through SEC-08,
including the original cohort URLs, project anchors, descriptions, and resource
links. Search and cohort filters enhance the static directory; without JavaScript
all entries remain visible. The seven homepage highlights link to dedicated
project stories. Testimonials appear immediately before Apply on the homepage in a swipeable
carousel with all original quotes and author portraits: three visible on desktop
and one on smaller screens. Swipe, horizontal scrolling, and keyboard
controls move through the slides. Automatic advance allows at least five seconds
per quote, with extra reading time for longer quotes. A circular timer at the top-right of the carousel counts down to the next
slide, pauses with playback, and resets after a swipe. It pauses offscreen, in hidden
tabs, during hover, focus, or touch, and for reduced-motion visitors. Native horizontal
scrolling remains available without JavaScript.

- `content/projects.json`: original archive entries.
- `content/cohorts.json`: cohort introductions.
- `content/project-stories.json`: featured project explanations and related work.
- `content/testimonials.json`: original community quotes and attribution links.
- `scripts/generate-projects.js`: archive, story, and testimonial rendering.
- `src/project-archive.js`: search, filtering, and progressive results.
- `src/testimonials.js`: carousel keyboard navigation and automatic advance.

Archive content and local project logos were migrated from `soveng/website-legacy` at
`8bfb0bc`. Restart Vite after editing content to regenerate the pages.

The shared footer’s sea divider and ship follow scrolling via
`src/footer-animation.js`. The ship sails into the center as the waves appear;
reduced-motion and no-JavaScript visitors see the completed scene.

The mountain page uses one continuous SVG landscape in `scripts/render-mountain.js`.
`src/mountain.js` follows scrolling through the valley, ascent, device-free camp, summit,
descent and 24-hour build, demos, and departure. Each day has its own chapter,
with the sun setting and rising between days as you scroll. The scene stays pinned while the
chapters pass; mobile places the illustration below the copy. Reduced motion and
no JavaScript show the landscape and chapters in a normal document flow. Exact
dates, location, and applications remain unannounced.

## Run locally

If you only want to run the website:

```sh
git clone https://github.com/soveng/website.git
cd website
npm ci
npm run dev
```

## Contribute

Use a fork so you can make changes without editing the original repository.

- **Fork:** your copy of this repository on GitHub.
- **Origin:** your fork after you clone it.
- **Upstream:** the original [`soveng/website`](https://github.com/soveng/website) repository.
- **Branch:** a separate place for one change.
- **Pull request:** a request to add your change to the upstream repository.

### 1. Fork the repository

Sign in to GitHub, open [`soveng/website`](https://github.com/soveng/website), click
**Fork**, then click **Create fork**.

### 2. Clone your fork

Replace `YOUR-USERNAME` with your GitHub username:

```sh
git clone https://github.com/YOUR-USERNAME/website.git
cd website
npm ci
```

### 3. Add the upstream repository

This only needs to be done once:

```sh
git remote add upstream https://github.com/soveng/website.git
git remote -v
```

`origin` should point to your fork. `upstream` should point to `soveng/website`.

### 4. Pull the latest changes

Do this before starting new work:

```sh
git switch master
git pull upstream master
git push origin master
```

This downloads upstream changes and updates your fork.

### 5. Create a branch

Use a short name describing the problem:

```sh
git switch -c short-problem-name
```

Keep the branch focused on one problem. Make changes here, not on `master`.

### 6. Test and commit

Run the site and check your change. Press `Ctrl+C` to stop it:

```sh
npm run dev
```

Then build, review, and commit your files:

```sh
npm run build
git status
git add .
git commit -m "problem: describe unwanted behavior"
```

Check `git status` before `git add .` so you know which files will be saved.

### 7. Push your branch

```sh
git push -u origin short-problem-name
```

### 8. Open a pull request

1. Open your fork on GitHub.
2. Click **Compare & pull request**.
3. Confirm the base repository is `soveng/website` and the base branch is `master`.
4. Explain the problem, your change, and how you tested it.
5. Click **Create pull request**.

For your next contribution, pull upstream again and create a new branch.

## Social previews

Every page gets its own 1200×630 PNG card and Open Graph / Twitter card
metadata at build time. `scripts/social-preview.js` renders the designs using
local fonts and artwork; no browser, external image service, or network access
is needed during the build. The mountain card reuses the mountain illustration
and opener from `content/mountain.md`. The homepage uses the supplied figure
and city image in `src/assets/social-landing.png`. Project and dialogue cards use their
page titles. Generated images live in `public/social/` (ignored by Git) and
use content hashes so a changed design gets a new image URL.

Canonical URLs use `SITE_URL`, defaulting to `https://soveng.com`.
Production social images use the same host. Preview builds use `VERCEL_URL` so
unreleased images remain accessible. `SOCIAL_IMAGE_ORIGIN` can override the
image host with a public HTTPS origin that serves the generated files.

Redirects from `sovereignengineering.io`, `www.sovereignengineering.io`, and
`www.soveng.com` are configured in `vercel.json`, preserving paths and query
strings. These take effect once each domain is connected to this Vercel project.
The NIP-05 endpoint is exempt and serves its JSON directly.

Run `npm run check:social` to build and validate every page’s metadata, image
URL, PNG dimensions, and content hash. EB Garamond and DM Mono are bundled in
`scripts/social-fonts/` with their SIL Open Font License files, from the
[Google Fonts repository](https://github.com/google/fonts).

## Deploy to Vercel

1. Import [`soveng/website`](https://github.com/soveng/website) at
   [vercel.com/new](https://vercel.com/new).
2. Click **Deploy**.

`vercel.json` configures Vite, `npm run build`, and the `dist` output.

Or deploy from a local clone:

```sh
npx vercel
npx vercel --prod
```

The two Wikifreedia fruits use the unmodified
[Wikipedia puzzle-globe SVG](https://commons.wikimedia.org/wiki/File:Wikipedia-logo-v2.svg),
by Wikimedia (version 1 by Nohat, concept by Paullusmagnus), under
[CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/).
The original SVG is stored in `public/images/wikipedia-globe.svg` and rendered
at different sizes in the plant canvas.

### Cohort email notifications

The summer and mountain signup forms send email addresses to Buttondown through
`api/subscribe.js`, a Vercel Function. The account is https://buttondown.com/soveng.
Set `BUTTONDOWN_API_KEY` in the Vercel project's **Settings → Environment Variables**
for Production, then redeploy. Enable it for Preview only if preview signups should
also enter the real list. Never use a `VITE_` prefix: the key stays server-side.
Use a Buttondown key with subscriber access. New addresses require email confirmation.
The initial signup's `cohort_interest` metadata records `upcoming` for the shared
homepage form, or `mountain` on the mountain page. The previous `summer` value
remains supported. Dates in `content/upcoming-cohorts.json` supply the homepage
cohort lineup and the mountain page's exact dates.
Existing subscribers are preserved; submitting again does not overwrite their metadata
or automatically reactivate an unsubscribed address.

For local API testing, put the key in ignored `.env.local` and run `vercel dev`.
Vite's dev/preview server serves the pages but does not run Vercel Functions.
`node --test tests/subscribe.test.cjs` checks the endpoint using a mocked Buttondown
API, without adding subscribers or sending email. No key is needed for that test.

### Books and timeline

`content/books.json` retains the old site's twelve books and reading links;
cover images keep their original `/images/books/` paths. `content/timeline.json`
contains dated milestones, with cohort links pointing to their project pages.
SEC-08 is marked concluded and the spring 2027 mountain cohort is upcoming.
Edit these files to maintain the content. `scripts/render-library.js` generates
`/books/` and `/timeline/`; both are linked from the footer and have social images.

### Swag

`content/swag.json` contains the seven cohort designs, original image paths,
designer credits, and webshop URL. Its introduction and product copy, including
inline links, match the live site as of October 6, 2026. `scripts/render-swag.js` builds `/swag/`.
The galleries use `src/swag.js` for image selection with a short transition;
without JavaScript, each thumbnail links directly to its image.

Podcast shortcuts `/0` through `/38` redirect permanently to the dedicated
episode pages. Both trailing-slash spellings work. When adding an episode, add
its numbered shortcut to `content/legacy-redirects.json` and `vercel.json`;
`check:migration` checks that every episode has the correct shortcut.
