# Modern web review — 11 November 2026

Reviewed against [GoogleChrome/modern-web-guidance](https://github.com/GoogleChrome/modern-web-guidance). The legacy scanner reported no findings across its 33 supported guides/35 rules; this is only a subset of the guidance, not a clean bill of health. Browser audits and interaction tests found the issues below.

## Changes

- Removed the CSS font `@import`. Font styles are discovered in HTML alongside site CSS, with preconnects to the font origins and the existing `display=swap` behavior.
- Generate four WebP sizes of each episode cover from the already-cached originals. Podcast cards and episode heroes use `srcset` and layout-specific `sizes`. Original images, RSS artwork URLs, and social previews are preserved. Generated files are rebuilt by `prebuild`/`predev`, not checked into Git.
- Prioritized episode hero artwork and supplied explicit logo dimensions to reserve space before images load.
- Improved text contrast on the red Demo Day and next-project panels and in testimonial author descriptions.
- Removed an invalid role override on testimonial figures and gave the scrollable track a group role. Distinguished the top and bottom cohort navigation landmarks.
- Made the existing testimonial timer a keyboard-operable pause/resume button. Explicit pause persists across hover, scrolling, and visibility changes. Reduced-motion mode disables automatic advancement and hides the timer control.
- Replaced the blanket near-zero animation-duration override with targeted reduced-motion rules; existing scene-specific static fallbacks remain in place.
- Kept native dialog focus handling; moved scroll locking to the actual `:modal` state and reserved scrollbar space. Without JavaScript, the hamburger links to the footer site map.
- Added a persistent email input label. Newsletter requests were mocked during verification; no real subscriptions were submitted.
- Updated compatible locked dependencies to resolve the advisories reported by npm audit. Added Sharp as a build-only image processing dependency. No forced major-version upgrade.

## Verification

- Production build passed.
- Migration checks: 100 pages, 988 legacy paths/fragments, internal anchors, chapter files, RSS, and sitemap.
- Social checks: all 100 pages retain valid metadata and unique 1200×630 PNG previews.
- `node scripts/check-podcast-artwork.mjs`: all four responsive sizes for 41 episodes exist in the build with correct dimensions and aspect ratios.
- axe WCAG A/AA and best-practice checks: no reported violations on 16 representative pages at a 390px viewport with reduced motion. Includes home, concept, philosophy, mountain, podcast list and episode, projects list and detail, SEC-08, books, FAQ, swag, blog article, timeline, alumni, and weekly loop. These are automated checks, not a full accessibility certification.
- Chromium and WebKit at 390px and 1440px: dialog opening/closing, keyboard focus return, modal scroll locking, testimonial pause/resume, reduced motion, and mocked signup feedback. Both engines also checked the menu fallback with JavaScript disabled.
- npm audit: zero reported vulnerabilities after compatible updates.

### Local Lighthouse comparison

Mobile podcast page, same local static server and Lighthouse settings:

| Metric | Before | After |
| --- | --- | --- |
| Performance score | 95 | 98 |
| First / largest contentful paint | 2.3 s / 2.3 s | 1.8 s / 1.8 s |
| Total transferred data | 9,921 KiB | 1,044 KiB |
| Layout shift | 0 | 0 |
| Accessibility / best practices / SEO | 100 / 100 / 100 | 100 / 100 / 100 |

These are single-run lab measurements. They do not establish real-user Core Web Vitals or production cache behavior. External font and media timing can vary. VoiceOver/TalkBack and physical-device testing remain useful; WebKit automation is not an iPhone test.

## Guidance applied

- `performance`: “DON'T use `@import` in CSS.” Eliminated serial font discovery and reduced image transfer size.
- `optimize-image-priority`: “Never use `loading="lazy"` on the LCP image.” Episode heroes are eager and prioritized; archive cards remain lazy-loaded.
- `accessibility`: “Prefer HTML elements and attributes to ARIA.” Retained figure semantics and native modal behavior, added a visible input label, and checked contrast and keyboard interaction.
- `motion`: “Provide a pause mechanism.” The existing circular timer now provides that control, independently of reduced-motion preferences.

The existing native scroll-snap carousel and GSAP/canvas scenes were retained. This pass does not replace working animations with newer APIs just to satisfy a static rule. Earlier user preferences against testimonial arrows/counts remain respected.
