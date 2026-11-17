const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const short = matchMedia('(max-height: 550px)');
const loops = [...document.querySelectorAll('[data-weekly-loop]')].map(section => ({
  section,
  segments: [...section.querySelectorAll('[data-loop-segment]')],
  arrows: [...section.querySelectorAll('[data-loop-arrow]')],
}));
const clamp = value => Math.max(0, Math.min(1, value));
let frame;
function draw() {
  frame = 0;
  for (const { section, segments, arrows } of loops) {
    const animated = !reduced.matches && !short.matches;
    section.classList.toggle('weekly-loop-ready', animated);
    const rect = section.getBoundingClientRect();
    const travel = section.offsetHeight - section.querySelector('figure').offsetHeight;
    const progress = animated ? clamp((96 - rect.top) / Math.max(1, travel)) : 1;
    segments.forEach((path, i) => path.setAttribute('stroke-dashoffset', 1 - clamp(progress * 6 - i)));
    arrows.forEach((arrow, i) => arrow.setAttribute('opacity', clamp((progress * 6 - i - .88) / .10)));

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
