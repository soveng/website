import { readFileSync } from 'node:fs';
const mark = `data:image/svg+xml;base64,${readFileSync('src/assets/brandmark.svg').toString('base64')}`;
const point = (radius, degrees) => {
  const angle = degrees * Math.PI / 180;
  return `${330 + radius * Math.sin(angle)} ${330 - radius * Math.cos(angle)}`;
};
// Broad, curved arrows retain the simple Show → Talk → Build diagram.
// Masks let each arrow draw around the circle without moving the labels.
export function creationLoopArt() {
  const arrow = `M${point(240,-44)} A240 240 0 0 1 ${point(240,28)} L${point(262,28)} L${point(220,47)} L${point(178,28)} L${point(200,28)} A200 200 0 0 0 ${point(200,-44)} Z`;
  const route = `M${point(220,-46)} A220 220 0 0 1 ${point(220,51)}`;
  return `<defs>${[0,1,2].map(i => `<mask id="creation-arrow-${i}" maskUnits="userSpaceOnUse" x="0" y="0" width="660" height="660"><path data-creation-route="${i}" d="${route}" fill="none" stroke="white" stroke-width="130" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0"/></mask>`).join('')}</defs>
    ${['#91a47e','#c6a06d','#d65b50'].map((color,i) => `<g transform="rotate(${i*120} 330 330)" fill="${color}"><path d="${arrow}" opacity=".12"/><path d="${arrow}" mask="url(#creation-arrow-${i})"/></g>`).join('')}
    <g font-family="EB Garamond, serif" font-size="60" text-anchor="middle">
      <text data-creation-label="0" x="165" y="242" fill="#eee8dd">Show</text>
      <text data-creation-label="1" x="495" y="242" fill="#eee8dd">Talk</text>
      <text data-creation-label="2" x="330" y="605" fill="#eee8dd">Build</text>
    </g><image x="296" y="302" width="68" height="79" href="${mark}" opacity=".8"/>`;
}
export function renderCreationLoop() {
  return `<div class="creation-loop" data-creation-loop><figure class="creation-loop-stage"><svg viewBox="0 0 660 660" role="img" aria-label="Show, talk, build, and repeat. Three broad arrows connect the stages in a clockwise loop.">${creationLoopArt()}</svg><figcaption><a href="/loop/">See how the week works ↗</a></figcaption></figure></div><script type="module" src="/src/creation-loop.js"></script>`;
}
