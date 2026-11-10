import { portraitPaths, portraitPoint } from '../src/dialogos-portrait.js';
export function renderDialogos() {
  const drawing = portraitPaths.map(path=>`<polyline points="${path.points.map(p=>{const v=portraitPoint(p);return `${v.x},${v.y}`;}).join(' ')}"/>`).join('');
  return `<section class="dialogos" id="dia-logos" aria-labelledby="dialogos-title">
    <div class="dialogos-stage">
      <div class="dialogos-copy"><h2 id="dialogos-title">Dia-Logos</h2><p class="dialogos-subtitle">A shared flow state.</p><p>Much of Sovereign Engineering draws on John Vervaeke’s work on dialogue. A good conversation will take you to places that neither individual could ever reach alone. This is distributed cognition. We make room for that shared flow state and build from what emerges.</p></div>
      <figure class="dialogos-portrait"><div class="dialogos-art"><svg class="dialogos-fallback" viewBox="0 0 510 510" role="img" aria-label="Line portrait of John Vervaeke"><g fill="none" stroke="currentColor" stroke-width="1.2">${drawing}</g></svg><canvas role="img" aria-label="Six dots in two speech bubbles become stars, then connecting lines gradually draw a portrait of John Vervaeke"></canvas></div><figcaption><a href="https://johnvervaeke.com/">John Vervaeke ↗</a></figcaption></figure>
    </div>
  </section><script type="module" src="/src/dialogos.js"></script>`;
}
