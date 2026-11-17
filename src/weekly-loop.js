const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const short = matchMedia('(max-height: 550px)');
const loops = [...document.querySelectorAll('[data-weekly-loop]')].map(section => ({
  section,
  segments: [...section.querySelectorAll('[data-loop-segment]')],
  days: [...section.querySelectorAll('[data-loop-day]')],
  arrows: [...section.querySelectorAll('[data-loop-arrow]')],
  cursor: section.querySelector('[data-loop-cursor]'),
}));
const clamp = value => Math.max(0, Math.min(1, value));
let frame;
function draw() {
  frame = 0;
  for (const { section, segments, days, arrows, cursor } of loops) {
    const animated = !reduced.matches && !short.matches;
    section.classList.toggle('weekly-loop-ready', animated);
    const rect = section.getBoundingClientRect();
    const travel = section.offsetHeight - section.querySelector('figure').offsetHeight;
    const progress = animated ? clamp((96 - rect.top) / Math.max(1, travel)) : 1;
    segments.forEach((path, i) => path.setAttribute('stroke-dashoffset', 1 - clamp(progress * 6 - i)));
    arrows.forEach((arrow, i) => arrow.setAttribute('opacity', clamp((progress * 6 - i - .78) / .08)));
    // Keep every label legible from the start; only the route and nodes reveal.
    days.forEach((day, i) => day.querySelectorAll('circle').forEach(dot => {
      dot.style.opacity = progress >= i / 6 ? '1' : '.2';
    }));
    const angle = progress * Math.PI * 2;
    cursor.setAttribute('cx', 330 + 170 * Math.sin(angle));
    cursor.setAttribute('cy', 330 - 170 * Math.cos(angle));
    cursor.setAttribute('opacity', animated && progress < 1 ? '1' : '0');
    cursor.setAttribute('fill', progress >= 4 / 6 && progress < 5 / 6 ? '#ed3238' : '#eee8dd');
  }
}
function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
if (loops.length) {
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  addEventListener('pageshow', schedule);
  reduced.addEventListener('change', schedule);
  short.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();
}
