import { readFileSync } from 'node:fs';
const mark = `data:image/svg+xml;base64,${readFileSync('src/assets/brandmark.svg').toString('base64')}`;

// Shared vector artwork: the page animates these paths; social cards use the
// complete drawing. Keep labels readable without JavaScript or motion.
export function weeklyLoopArt() {
  const days = [
    ['Monday', 'Movement', 330, 99, 'middle'],
    ['Tuesday', 'Talks', 514, 232, 'start'],
    ['Wednesday', 'Workshops', 514, 429, 'start'],
    ['Thursday', 'Time Off', 330, 560, 'middle'],
    ['Friday', 'Demo Day', 146, 429, 'end'],
    ['Weekend', 'Recover', 146, 232, 'end'],
  ];
  const point = angle => [330 + 170 * Math.sin(angle), 330 - 170 * Math.cos(angle)];
  return `<g fill="none" stroke="#373a35" stroke-width="1.5"><circle cx="330" cy="330" r="170" stroke-width="4"/><circle cx="330" cy="330" r="145" stroke-dasharray="1 9"/></g>
    ${days.map(([day, activity, x, y, anchor], i) => {
      const [sx, sy] = point(i * Math.PI / 3);
      const [ex, ey] = point((i + 1) * Math.PI / 3);
      const color = i === 4 ? '#ed3238' : '#eee8dd';
      const arrowAngle = (i + .82) * 60;
      const [ax, ay] = point(arrowAngle * Math.PI / 180);
      return `<path data-loop-segment="${i}" d="M${sx} ${sy} A170 170 0 0 1 ${ex} ${ey}" pathLength="1" stroke-dasharray="1" stroke-dashoffset="0" fill="none" stroke="${color}" stroke-width="5"/>
        <path data-loop-arrow="${i}" d="M-9 -8 L7 0 L-9 8 Z" transform="translate(${ax} ${ay}) rotate(${arrowAngle})" fill="${color}"/>
        <g data-loop-day="${i}"><circle cx="${sx}" cy="${sy}" r="6" fill="${color}"/><circle cx="${sx}" cy="${sy}" r="13" fill="none" stroke="${color}" stroke-opacity=".25"/>
        <text x="${x}" y="${y}" text-anchor="${anchor}" fill="#a7a29a" font-family="DM Mono, monospace" font-size="19">${day.toUpperCase()}</text>
        <text x="${x}" y="${y + 33}" text-anchor="${anchor}" fill="${color}" font-family="EB Garamond, serif" font-size="28">${activity}</text></g>`;
    }).join('')}
    <image x="275" y="266" width="110" height="128" href="${mark}" opacity=".9"/>
    <circle data-loop-cursor="" cx="330" cy="160" r="5" fill="#eee8dd" opacity="0"/>`;
}

export function renderWeeklyLoop() {
  return `<div class="weekly-loop" data-weekly-loop><figure class="weekly-loop-stage">
    <svg viewBox="0 0 660 660" role="img" aria-label="The weekly loop, clockwise: Monday Movement, Tuesday Talks, Wednesday Workshops, Thursday Time Off, Friday Demo Day, then a weekend to recover before Monday. The Sovereign Engineering ship logo sits in the center.">${weeklyLoopArt()}</svg>
    <figcaption><a href="/loop/">The weekly loop ↗</a></figcaption>
  </figure></div><script type="module" src="/src/weekly-loop.js"></script>`;
}
