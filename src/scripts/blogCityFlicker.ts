const random = (min: number, max: number) => min + Math.random() * (max - min);

let dispose = () => {};

export function stopBlogCityFlicker(): void {
  dispose();
  dispose = () => {};
}

export function startBlogCityFlicker(): void {
  stopBlogCityFlicker();

  const candidate = document.querySelector<HTMLElement>('.blog-hero-visual');
  if (!candidate) {
    return;
  }
  const visual = candidate;
  const image = visual.querySelector('img');
  if (!image) {
    return;
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let timer: number | undefined;

  const canRun = () => visible && !document.hidden && !reducedMotion.matches;

  function clear(): void {
    if (timer !== undefined) {
      window.clearTimeout(timer);
    }
    timer = undefined;
    visual.style.removeProperty('--city-flicker');
  }

  function queue(first = false): void {
    timer = window.setTimeout(flicker, first ? random(1500, 3500) : random(5000, 11000));
  }

  function flicker(): void {
    timer = undefined;
    if (!canRun()) {
      return;
    }

    const pulses = Math.floor(random(2, 7));
    const deepAt = Math.floor(random(0, pulses));
    let pulse = 0;

    function step(): void {
      if (!canRun()) {
        clear();
        return;
      }
      if (pulse === pulses) {
        visual.style.removeProperty('--city-flicker');
        queue();
        return;
      }

      const brightness = pulse === deepAt ? random(0.08, 0.25) : random(0.35, 0.76);
      visual.style.setProperty('--city-flicker', String(1 - brightness));
      timer = window.setTimeout(
        () => {
          if (!canRun()) {
            clear();
            return;
          }
          visual.style.setProperty('--city-flicker', String(1 - random(0.97, 1)));
          pulse += 1;
          timer = window.setTimeout(step, Math.random() < 0.2 ? random(220, 450) : random(40, 175));
        },
        random(35, 105)
      );
    }

    step();
  }

  function sync(): void {
    clear();
    if (canRun()) {
      queue(true);
    }
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      const nextVisible = Boolean(entry?.isIntersecting);
      if (visible === nextVisible) {
        return;
      }
      visible = nextVisible;
      sync();
    },
    { threshold: 0.1 }
  );

  observer.observe(image);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', sync);

  dispose = () => {
    clear();
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
    reducedMotion.removeEventListener('change', sync);
  };
}
