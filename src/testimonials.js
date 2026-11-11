const track = document.querySelector('.testimonial-track');
if (track) {
  const slides = [...track.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const perView = () => matchMedia('(min-width: 1001px)').matches ? 3 : 1;
  const last = () => Math.max(0, slides.length - perView());
  const stride = () => slides[1].offsetLeft - slides[0].offsetLeft;
  const current = () => Math.min(last(), Math.round(track.scrollLeft / stride()));
  const go = index => {
    const next = index > last() ? 0 : index < 0 ? last() : index;
    track.scrollTo({ left: next * stride(), behavior: reduced.matches ? 'instant' : 'smooth' });
  };
  const progress = document.querySelector('.testimonial-progress');
  const fill = progress.querySelector('.timer-fill');
  let userPaused = false;
  const updateControl = () => {
    progress.hidden = reduced.matches || last() === 0;
    progress.setAttribute('aria-label', userPaused ? 'Resume testimonials' : 'Pause testimonials');
    progress.querySelector('.timer-symbol').textContent = userPaused ? '▶' : 'Ⅱ';
  };
  updateControl();
  track.classList.add('has-page-indicator');
  let countdown;
  let settling;
  let scrolling = false;
  let visible = false;
  let hovered = false;
  let touching = false;
  let hintPlayed = false;
  let hintAnimations = [];
  const stopHint = () => {
    hintPlayed = true;
    hintAnimations.forEach(animation => animation.cancel());
    hintAnimations = [];
  };
  const schedule = () => {

    const paused = userPaused || last() === 0 || hintAnimations.length > 0 || !visible || hovered || touching || scrolling || document.hidden || reduced.matches || track.contains(document.activeElement);
    if (paused) { countdown?.pause(); return; }
    if (!countdown) {
      const words = Math.max(...slides.slice(current(), current() + perView()).map(slide => slide.querySelector('blockquote').textContent.trim().split(/\s+/).length));
      // The fill itself is the clock, so the next slide and indicator cannot drift.
      countdown = fill.animate([{ strokeDashoffset: '100' }, { strokeDashoffset: '0' }], {
        duration: Math.max(5000, words * 160 + 1000), fill: 'forwards', easing: 'linear'
      });
      countdown.onfinish = () => go(current() + 1);
    }
    countdown.play();
  };
  progress.addEventListener('click', () => {
    userPaused = !userPaused;
    stopHint();
    updateControl();
    schedule();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    schedule();
  }, { threshold: 0 }).observe(track);
  // Nudge the cards, not the scroll position, so the active slide stays put.
  const hintObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || entry.intersectionRatio < .35 || hintPlayed || perView() !== 1 || reduced.matches) return;
    hintPlayed = true;
    hintObserver.disconnect();
    hintAnimations = slides.map(slide => slide.animate([
      { transform: 'translateX(0)', offset: 0 },
      { transform: 'translateX(-40px)', offset: .4 },
      { transform: 'translateX(7px)', offset: .75 },
      { transform: 'translateX(0)', offset: 1 },
    ], { duration: 1100, easing: 'ease-in-out' }));
    schedule();
    hintAnimations[0].onfinish = () => { hintAnimations = []; schedule(); };
  }, { threshold: .35 });
  hintObserver.observe(slides[0].querySelector('blockquote'));
  track.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovered = true; schedule(); }
  });
  track.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  track.addEventListener('pointerdown', () => { touching = true; stopHint(); schedule(); });
  window.addEventListener('pointerup', () => { touching = false; schedule(); });
  window.addEventListener('pointercancel', () => { touching = false; schedule(); });
  track.addEventListener('focusin', () => { stopHint(); schedule(); });
  track.addEventListener('wheel', () => { stopHint(); schedule(); }, { passive: true });
  track.addEventListener('focusout', () => setTimeout(schedule, 0));
  track.addEventListener('scroll', () => {
    scrolling = true;
    countdown?.cancel();
    countdown = null;
    clearTimeout(settling);
    settling = setTimeout(() => { scrolling = false; schedule(); }, 180);
  }, { passive: true });
  new ResizeObserver(() => {
    updateControl();
    if (hintAnimations.length) stopHint();
    countdown?.cancel();
    countdown = null;
    schedule();
  }).observe(track);
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', () => { if (reduced.matches) stopHint(); updateControl(); schedule(); });
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    const targets = { ArrowLeft: current() - 1, ArrowRight: current() + 1, Home: 0, End: last() };
    if (!(event.key in targets)) return;
    event.preventDefault();
    go(targets[event.key]);
  });
}
