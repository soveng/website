export function renderSitemapLinks() {
  return `<div><h2>Program</h2><a href="/concept/">Concept</a><a href="/philosophy/">Philosophy</a><a href="/loop/">The weekly loop</a><a href="/#voices">Testimonials</a><a href="/#upcoming-title">FIPS Cohort / 3wks</a><a href="/mountain/">Mountain Cohort / 1wk</a><a href="/#apply">Summer Cohort / 6wks</a></div>
      <div><h2>Explore</h2><a href="/projects/">Project archive</a><a href="/podcast/">Dialogues</a><a href="/blog/">Blog</a><a href="/books/">Books</a><a href="/media/">Media</a><a href="/timeline/">Timeline</a><a href="/swag/">Swag</a><a href="/faq/">FAQ</a><a href="/policy/">Policies</a></div>
      <div><h2>Connect</h2><a href="/alumni/">Alumni</a><a href="/contest/">Design contest</a><a href="https://njump.me/sovereignengineering.io">Nostr ↗</a><a href="mailto:info@sovereignengineering.io">Get in touch ↗</a><a href="/dialogues.xml">Dialogues RSS ↗</a><a href="/blog/rss.xml">Blog RSS ↗</a><a href="https://github.com/soveng">GitHub ↗</a></div>`;
}

export function renderFooter(theme = "sea") {
  return `<footer class="site-footer" id="footer">
    ${theme === "mountain" ? `<div class="footer-ridge" aria-hidden="true">
      <svg viewBox="0 0 160 80" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M0 76 H12 L49 32 L68 51 L100 8 L143 76 H160"/>
        <path d="M38 45 L49 32 L61 45 L52 42 L47 47Z M84 29 L100 8 L117 35 L105 29 L99 34 L94 25Z"/>
        <path d="M100 8 L99 34 L109 52 L104 63 L113 76 M49 32 L53 60 L45 76" opacity=".45"/>
      </svg>
    </div>` : `<div class="footer-sea" aria-hidden="true">
      <svg class="footer-ship" viewBox="0 0 100 110" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <g class="footer-ship-rock">
          <path d="M16 88 L84 88 L75 102 Q47 109 27 101 Z" fill="#080808"/>
          <path d="M25 94 H77 M35 100 H66 M15 88 L7 82 M82 88 L94 79"/>
          <path class="footer-mast" d="M35 88 V14"/>
          <path class="footer-mast" d="M66 88 V25"/>
          <path d="M18 88 L35 20 L55 88 M47 88 L66 30 L88 84" stroke-width="1"/>
          <path d="M21 30 Q35 33 49 29 Q45 46 49 64 Q35 68 20 64 Q26 47 21 30 Z" fill="#080808"/>
          <path d="M54 40 Q66 43 80 39 Q76 56 80 73 Q66 77 53 73 Q58 56 54 40 Z" fill="#080808"/>
          <path d="M18 29 H51 M17 65 H51 M51 39 H82 M50 74 H82"/>
          <path d="M34 33 Q38 48 33 66 M65 43 Q69 58 64 75" stroke-width=".7" opacity=".5"/>
        </g>
      </svg>
      <svg class="footer-water" width="100%" height="16" xmlns="http://www.w3.org/2000/svg">
        <defs><pattern id="footer-waves" width="120" height="16" patternUnits="userSpaceOnUse"><path d="M0 8 Q15 2 30 8 T60 8 T90 8 T120 8" fill="none" stroke="currentColor" stroke-width="1"/></pattern></defs>
        <rect width="100%" height="16" fill="url(#footer-waves)"/>
      </svg>
    </div>`}
    <a class="footer-identity" href="/">Sovereign Engineering<span>Based in Madeira, operating worldwide.</span></a>
    <nav class="footer-sitemap" aria-label="Footer navigation">
      ${renderSitemapLinks()}
    </nav>
  </footer>`;
}
