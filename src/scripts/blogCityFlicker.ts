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
    visual.style.removeProperty('--city-dim');
  }

  function queue(first = false): void {
    timer = window.setTimeout(flicker, first ? random(1500, 3500) : random(5000, 11000));
  }

  function flicker(): void {
    timer = undefined;
    if (!canRun()) {
      return;
    }

    const changes = Math.floor(random(4, 9));
    const deepAt = Math.floor(random(0, changes));
    let index = 0;

    function step(): void {
      if (!canRun()) {
        clear();
        return;
      }
      if (index === changes) {
        visual.style.removeProperty('--city-dim');
        queue();
        return;
      }

      const brightness = index === deepAt ? random(0.38, 0.6) : random(0.65, 0.96);
      visual.style.setProperty('--city-dim', String(1 - brightness));
      index += 1;
      timer = window.setTimeout(step, random(45, 170));
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
