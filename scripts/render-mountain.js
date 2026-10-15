import { upcomingCohorts, cohortDates } from './upcoming-cohorts.js';
import { renderSignup } from './render-signup.js';
import { readFileSync } from 'node:fs';
import { parse } from 'yaml';

export function renderMountain() {
  const data = parse(readFileSync('content/mountain.md', 'utf8').split('---')[1]);
  const cohort = upcomingCohorts.find(cohort => cohort.id === 'mountain-2027');
  data.chapters[0].day = `Mountain cohort / ${cohortDates(cohort, true)}`;
  const e = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ascent = "M224 806 C286 785 307 738 359 704 S415 646 455 614 S526 588 522 540 S568 492 589 461 S611 416 635 413";
  const summit = `${ascent} C620 375 659 339 646 302 S649 231 659 202 S664 158 671 141`;
  const route = `${summit} C694 182 696 244 714 281 S694 359 705 414 S706 477 725 508 S753 559 797 603 S811 692 848 738 S883 778 931 806`;
  return `<div class="mountain-page">
    <div class="mountain-journey">
      <div class="mountain-stage">
        <svg class="mountain-scene" viewBox="0 0 1200 900" role="img" aria-labelledby="mountain-scene-title">
          <title id="mountain-scene-title">One journey from the valley to a mountain camp and back, together.</title>
          <defs>
            <path id="mountain-ascent" d="${ascent}"/>
            <path id="mountain-summit-route" d="${summit}"/>
            <linearGradient id="mountain-sky" x2="0" y2="1"><stop stop-color="#182c32"/><stop offset="1" stop-color="#b18464"/></linearGradient>
            <linearGradient id="mountain-face" x2=".7" y2="1"><stop stop-color="#71827c"/><stop offset="1" stop-color="#213b3b"/></linearGradient>
            <linearGradient id="mountain-shadow" x2=".4" y2="1"><stop stop-color="#405958"/><stop offset="1" stop-color="#142b2d"/></linearGradient>
            <radialGradient id="mountain-haze"><stop stop-color="#f1b77a" stop-opacity=".26"/><stop offset="1" stop-color="#f1b77a" stop-opacity="0"/></radialGradient>
            <radialGradient id="camp-glow"><stop stop-color="#ffb46c" stop-opacity=".7"/><stop offset="1" stop-color="#ffb46c" stop-opacity="0"/></radialGradient>
          </defs>
          <rect width="1200" height="900" fill="url(#mountain-sky)"/>
          <rect class="mountain-night" width="1200" height="900" fill="#071721" opacity="0"/>
          <g class="mountain-stars" fill="#f3e7cc" opacity="0">${Array.from({length:34},(_,i)=>`<circle cx="${70+(i*173)%1060}" cy="${35+(i*79)%310}" r="${i%3===0?1.5:.8}"/>`).join('')}</g>
          <circle class="mountain-sun" cx="900" cy="300" r="180" fill="url(#mountain-haze)"/>
          <circle class="mountain-sun-core" cx="900" cy="300" r="32" fill="#e3bd8d" opacity=".65"/>
          <g class="mountain-world">
            <path d="M-100 560 L70 385 L140 420 L285 268 L380 390 L480 312 L610 460 L820 220 L910 340 L990 293 L1260 570 V900 H-100Z" fill="#75817b" opacity=".3"/>
            <path d="M-80 670 L165 485 L230 515 L370 359 L435 400 L590 340 L690 470 L830 385 L1100 508 L1290 690 V900 H-80Z" fill="#536964" opacity=".6"/>
            <path d="M-80 900 L80 775 L198 672 L300 555 L410 486 L512 325 L594 256 L671 132 L722 194 L773 340 L875 490 L1024 601 L1115 744 L1270 900Z" fill="url(#mountain-face)"/>
            <path d="M671 132 L639 311 L685 376 L625 495 L690 593 L671 717 L769 900 H1270 L1115 744 L1024 601 L875 490 L773 340 L722 194Z" fill="url(#mountain-shadow)"/>
            <path d="M512 325 L594 256 L671 132 L722 194 L748 270 L706 240 L680 256 L650 220 L611 290 L580 289 L546 330Z" fill="#d6d8c3"/>
            <path d="M671 132 L650 220 L680 256 L706 240 L748 270 L722 194Z" fill="#99aaa1"/>
            <g fill="none" stroke="#cbd0b4" stroke-width="1" opacity=".19">
              <path d="M112 735 Q308 706 410 527 T594 286 M190 769 Q374 682 462 550 T580 371 M261 808 Q430 706 500 582 T614 436 M330 858 Q523 744 548 643 T646 543 M724 320 Q792 462 919 593 T1083 811 M698 421 Q763 559 862 648 T1002 844 M701 554 Q736 659 823 735 T901 886"/>
              <path d="M294 596 Q442 563 539 431 M349 653 Q474 610 561 519 M423 725 Q528 663 596 599"/>
            </g>
            <path d="M0 814 Q175 700 314 786 T572 817 Q769 729 924 776 T1200 742 V900 H0Z" fill="#142d2b"/>
            <path d="M0 880 Q211 762 400 855 T778 865 Q965 801 1200 849 V900 H0Z" fill="#0d2223"/>
            <g class="mountain-trees" fill="#1c3730" stroke="#657766" stroke-width="1">${[80,120,152,190,905,949,980,1060,1100].map((x,i)=>`<path d="M${x} ${775+(i%3)*12} v-43 m-17 29 l17-36 17 36 m-30-11 l13-31 13 31"/>`).join('')}</g>
            <path id="mountain-route" d="${route}" fill="none" stroke="#ead7ac" stroke-width="2" stroke-dasharray="3 8" opacity=".3"/>
            <path class="mountain-trail" d="${route}" fill="none" stroke="#ed6a4d" stroke-width="3" pathLength="100" stroke-dasharray="100" stroke-linecap="round"/>
            <g class="mountain-base" stroke="#c6c4a7" stroke-width="1.5" fill="#253b34">
              <path d="M171 805 V778 L193 760 L215 778 V805Z M164 780 L193 756 L222 780 M182 805 V788 H195 V805"/>
              <path d="M895 808 V777 L920 761 L945 777 V808Z M888 778 L920 756 L952 778 M907 808 V788 H921 V808"/>
              <path class="mountain-window" d="M930 782 H936 V790 H930Z" fill="#eec181"/>
            </g>
            <g class="mountain-camp" stroke="#d3c6a5" stroke-width="1.4">
              <ellipse cx="630" cy="420" rx="48" ry="22" fill="url(#camp-glow)" stroke="none"/>
              <path d="M587 424 L603 394 L623 424Z" fill="#b2714e"/><path d="M603 394 L607 424 H596Z" fill="#344237"/>
              <path d="M638 417 L653 390 L672 417Z" fill="#b89b6a"/><path d="M653 390 L657 417 H647Z" fill="#344237"/>
              <path d="M626 420 l7-6 m-7 0 l7 6" stroke="#ac8157"/><path d="M627 415 Q624 411 630 405 Q635 412 632 416Z" fill="#ffb46c" stroke="none"/>
            </g>
            <g class="mountain-ideas" opacity="0" fill="#e6ddc2" stroke="#b5bba4" stroke-width="1">
              <g transform="translate(531 355) rotate(-12)"><path d="M0 0 H30 V37 H0Z"/><path d="M7 10 H22 M7 16 H17 M7 22 L13 28 L24 19" fill="none" stroke="#5a6a59"/></g>
              <g transform="translate(699 331) rotate(10)"><path d="M0 0 H28 V35 H0Z"/><path d="M7 9 L20 25 M7 25 L20 9" stroke="#6d785d"/></g>
              <path d="M568 373 Q627 338 691 351" fill="none" stroke-dasharray="2 5" opacity=".6"/>
            </g>
            <g class="mountain-build" opacity="0" transform="translate(959 765)" stroke="#d5ceb0" fill="#132e2d" stroke-width="1.5">
              <path d="M5 0 H49 V28 H5Z M5 28 L0 35 H54 L49 28 M0 35 H54"/>
              <path d="M19 9 L14 14 L19 19 M35 9 L40 14 L35 19 M30 7 L25 21" fill="none" stroke="#ed6a4d"/>
            </g>
            <g class="mountain-demo" opacity="0" transform="translate(959 750)" stroke="#d5ceb0" fill="none" stroke-width="1.5">
              <path d="M0 0 H54 V36 H0Z M27 36 V48 M17 48 H37" fill="#132e2d"/>
              <path d="M9 9 H24 M9 16 H39 M9 23 H30" stroke="#d5ceb0"/>
              <circle cx="44" cy="26" r="4" fill="#ed6a4d" stroke="none"/>
            </g>
            <g class="mountain-crew" fill="#f5dfaf" stroke="#132e2d" stroke-width="1.5"><circle cx="224" cy="801" r="5"/><circle cx="216" cy="794" r="4"/><circle cx="208" cy="801" r="4"/></g>
            <g fill="#bfc5b1" font-family="monospace" font-size="11" letter-spacing="3"><text x="142" y="845">THE VALLEY</text><text x="580" y="451">BASE CAMP</text></g>
          </g>
          <g class="mountain-mist" fill="none" stroke="#d5d5be" stroke-width="1" opacity=".12"><path d="M390 314 Q470 297 558 315 T785 308 M766 562 Q863 545 1060 559 M130 636 Q268 620 380 632"/></g>
        </svg>
        <div class="mountain-vignette"></div>
        <p class="mountain-caption" aria-hidden="true">Valley → Mountain → Valley</p>
      </div>
      <div class="mountain-chapters">${data.chapters.map((chapter,i)=>`<section class="mountain-chapter" id="mountain-step-${i}" data-step="${i}" aria-labelledby="mountain-heading-${i}"><div class="mountain-copy"><p class="mountain-day">${e(chapter.day)}</p>${i===0?`<h1 id="mountain-heading-${i}">${e(chapter.title).replace(/(\S+)$/, "<em>$1</em>").split(". ").map((line, index, lines) => `<span class="mountain-title-line">${line}${index < lines.length - 1 ? "." : ""}</span>`).join("")}</h1>`:`<h2 id="mountain-heading-${i}">${e(chapter.title)}</h2>`}<p class="mountain-description">${e(chapter.body)}</p>${chapter.links ? `<p class="mountain-chapter-detail">${chapter.links.map(([label, href]) => `<a href="${e(href)}">${e(label)}</a>`).join(' <span aria-hidden="true">·</span> ')}</p>` : ""}${chapter.detail ? `<p class="mountain-chapter-detail">${e(chapter.detail)}</p>` : ""}${i===0?'<a class="mountain-scroll" href="#mountain-step-1">Follow the trail <span aria-hidden="true">↓</span></a>':''}</div></section>`).join('')}</div>
    </div>
    <section class="mountain-outro"><h2>Join us in<br>the mountains.</h2><p class="mountain-cohort-dates">${e(cohortDates(cohort, true))}</p>${renderSignup("mountain")}<a class="application-faq" href="/faq/">Read the FAQ <span aria-hidden="true">↗</span></a></section>
    <script type="module" src="/src/cohort-signup.js"></script><script type="module" src="/src/mountain.js"></script>
  </div>`;
}
