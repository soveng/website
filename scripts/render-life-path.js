export function renderLifePath() {
  const source='/assets/images/www-life-path.png';
  const artwork='<image href="'+source+'" width="1920" height="1080"/>';
  return `<section id="life-path" class="life-path" aria-label="From past decisions to future possibilities">
    <figure class="life-path-stage">
      <div class="life-path-art">
        <img class="life-path-original" src="${source}" width="1920" height="1080" alt="A branching life path: one magenta route through the past reaches today, where many possible future paths unfold.">
        <svg class="life-path-animation" viewBox="0 0 1920 1080" aria-hidden="true">
          <defs>
            <filter id="life-magenta" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  .5 -1 .5 0 0"/><feComponentTransfer><feFuncA type="linear" slope="2"/></feComponentTransfer></filter>
            <filter id="life-white" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 1 0 0 0"/><feComponentTransfer><feFuncA type="linear" slope="4" intercept="-3"/></feComponentTransfer></filter>
            <clipPath id="life-past"><rect data-life-past x="300" y="140" width="0" height="790"/></clipPath>
            <clipPath id="life-future"><rect data-life-future x="976" y="70" width="0" height="870"/></clipPath>
            <clipPath id="life-present"><rect x="961" y="145" width="16" height="790"/><rect x="880" y="70" width="190" height="65"/></clipPath>
            <mask id="life-route" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080">
              <path data-life-route pathLength="1" d="M247 538 L300 540 L350 540 L385 544 L410 557 L432 576 L450 590 L480 609 L510 618 L559 623 L580 617 L601 614 L625 619 L653 625 L675 619 L695 602 L715 591 L750 591 L780 589 L808 594 L834 586 L850 555 L875 531 L880 504 L896 479 L910 456 L931 466 L945 464 L965 493" fill="none" stroke="white" stroke-width="24" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1"/>
            </mask>
          </defs>
          <g clip-path="url(#life-past)" filter="url(#life-white)" opacity=".30">${artwork}</g>
          <g mask="url(#life-route)" filter="url(#life-magenta)">${artwork}</g>
          <g clip-path="url(#life-present)" data-life-present opacity="0">${artwork}</g>
          <g clip-path="url(#life-future)" filter="url(#life-magenta)">${artwork}</g>
          <circle cx="968" cy="493" r="20" data-life-pulse fill="none" stroke="#e64abc" stroke-width="2" opacity="0"/>
          <g data-life-complete opacity="0">${artwork}</g>
        </svg>
      </div>
      <figcaption>What will you build next?</figcaption>
    </figure>
  </section><script type="module" src="/src/life-path.js"></script>`;
}
