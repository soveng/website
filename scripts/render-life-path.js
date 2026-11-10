export function renderLifePath() {
  const source='/assets/images/www-life-path.png';
  const labelCovers='<g fill="#000"><rect x="160" y="315" width="180" height="55"/><rect x="158" y="628" width="172" height="50"/><rect x="989" y="599" width="115" height="39"/></g>';
  const labels=`<g fill="#e64abc" font-family="var(--mono)" font-weight="700" text-anchor="middle"><text x="247" y="362" font-size="36">Internet</text><text x="247" y="668" font-size="32">Internet</text><text x="1050" y="631" font-size="26">Internet</text></g>`;
  const artwork=`<image href="${source}" width="1920" height="1080"/>${labelCovers}${labels}`;
  return `<section id="life-path" class="life-path" aria-label="From past decisions to future possibilities">
    <figure class="life-path-stage">
      <div class="life-path-art">
        <svg class="life-path-original" viewBox="0 0 1920 1080" role="img" aria-label="The Internet’s branching path: one route through the past reaches today, where many possible futures unfold.">${artwork}</svg>
        <svg class="life-path-animation" viewBox="0 0 1920 1080" aria-hidden="true">
          <defs>
            <filter id="life-magenta" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  .5 -1 .5 0 0"/><feComponentTransfer><feFuncA type="linear" slope="2"/></feComponentTransfer></filter>
            <filter id="life-white" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 1 0 0 0"/><feComponentTransfer><feFuncA type="linear" slope="4" intercept="-3"/></feComponentTransfer></filter>
            <clipPath id="life-past"><rect data-life-past x="300" y="140" width="0" height="790"/></clipPath>
            <clipPath id="life-future"><rect data-life-future x="976" y="70" width="0" height="870"/></clipPath>
            <clipPath id="life-present"><rect x="961" y="145" width="16" height="790"/><rect x="880" y="70" width="190" height="65"/></clipPath>
            <clipPath id="life-today-label"><rect x="985" y="595" width="145" height="110"/><circle cx="968" cy="493" r="16"/></clipPath>
            <mask id="life-route" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
              <path data-life-route pathLength="1" d="M247 538 L300 540 L350 540 L385 544 L410 557 L432 576 L450 590 L480 609 L510 618 L559 623 L580 617 L601 614 L625 619 L653 625 L675 619 L695 602 L715 591 L750 591 L780 589 L808 594 L834 586 L850 555 L875 531 L880 504 L896 479 L910 456 L931 466 L945 464 L965 493" fill="none" stroke="white" stroke-width="24" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/>
            </mask>
          </defs>
          <g clip-path="url(#life-past)" filter="url(#life-white)" opacity=".30">${artwork}</g>
          <g mask="url(#life-route)" filter="url(#life-magenta)">${artwork}</g>
          <g clip-path="url(#life-present)" data-life-present opacity="0">${artwork}</g>
          <g clip-path="url(#life-future)" filter="url(#life-magenta)">${artwork}</g>
          <g class="life-start" fill="#e64abc">
            <text x="247" y="362" text-anchor="middle" font-family="var(--mono)" font-size="36" font-weight="700">Internet</text>
            <text x="247" y="413" text-anchor="middle" font-family="var(--mono)" font-size="36">born</text>
            <path d="M239 431 Q234 466 247 510 M232 494 L247 510 L257 490" fill="none" stroke="#eee8dd" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            <g class="life-start-pulse-wrap"><circle class="life-start-pulse" cx="247" cy="538" r="22" fill="none" stroke="currentColor" stroke-width="2"/></g>
            <ellipse cx="247" cy="538" rx="12" ry="14"/>
          </g>
          <g clip-path="url(#life-today-label)" data-life-today-label opacity=".65">${artwork}</g>
          <circle cx="968" cy="493" r="20" data-life-pulse fill="none" stroke="#e64abc" stroke-width="2" opacity="0"/>
          <g data-life-complete opacity="0">${artwork}</g>
        </svg>
      </div>
      <figcaption>At any moment, the question is what to build next.<span class="life-path-credit">Adapted from <a href="https://twitter.com/waitbutwhy/status/1367871165319049221" target="_blank" rel="noopener noreferrer">Tim Urban · Wait But Why</a></span></figcaption>
    </figure>
  </section><script type="module" src="/src/life-path.js"></script>`;
}
