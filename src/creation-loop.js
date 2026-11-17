const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const short = matchMedia('(max-height: 550px)');
const loops = [...document.querySelectorAll('[data-creation-loop]')].map(section => ({
  section, stage: section.querySelector('figure'),
  routes: [...section.querySelectorAll('[data-creation-route]')],
  labels: [...section.querySelectorAll('[data-creation-label]')],
}));
const clamp = x => Math.max(0, Math.min(1, x));
let frame = 0;
function draw() {
  frame = 0;
  for (const {section, stage, routes, labels} of loops) {
    const animated = !reduced.matches && !short.matches;
    section.classList.toggle('creation-loop-ready', animated);
    const progress = animated ? clamp((96-section.getBoundingClientRect().top) / Math.max(1,section.offsetHeight-stage.offsetHeight)) : 1;
    routes.forEach((route,i) => {
      const t = clamp(progress * 3 - i);
      route.setAttribute('stroke-dashoffset', 1 - t*t*(3-2*t));
    });
    labels.forEach((label,i) => label.setAttribute('opacity', .65 + .35 * clamp(progress*3-i+1)));
  }
}
function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
if (loops.length) {
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',schedule);
  short.addEventListener('change',schedule);
  schedule();
}
