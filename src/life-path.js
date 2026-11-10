const section=document.querySelector('.life-path');
if(section){
  const svg=section.querySelector('svg');
  const past=section.querySelector('[data-life-past]');
  const route=section.querySelector('[data-life-route]');
  const present=section.querySelector('[data-life-present]');
  const todayLabel=section.querySelector('[data-life-today-label]');
  const future=section.querySelector('[data-life-future]');
  const pulse=section.querySelector('[data-life-pulse]');
  const complete=section.querySelector('[data-life-complete]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const short=matchMedia('(max-height:550px)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const mix=(a,b,t)=>a+(b-a)*t;
  let frame=0;
  function draw(){
    frame=0;
    const rect=section.getBoundingClientRect();
    if(rect.bottom<0||rect.top>innerHeight)return;
    const p=reduced.matches||short.matches?1:clamp(-rect.top/Math.max(1,section.offsetHeight-innerHeight));
    section.style.setProperty('--life-start-pulse',String(1-ease((p-.06)/.12)));
    const history=ease(p/.23),chosen=ease((p-.12)/.30),possibilities=ease((p-.52)/.30),finish=ease((p-.83)/.13);
    todayLabel.setAttribute('opacity',String(.65+.35*ease(p/.08)));
    past.setAttribute('width',String(history*670));
    route.setAttribute('stroke-dashoffset',String(1-chosen));
    present.setAttribute('opacity',String(ease((p-.34)/.09)));
    future.setAttribute('width',String(possibilities*780));
    const moment=clamp((p-.39)/.19);
    pulse.setAttribute('r',String(16+moment*38));
    pulse.setAttribute('opacity',String(Math.sin(moment*Math.PI)*.75));
    complete.setAttribute('opacity',String(finish));
    // Follow the decision on narrow screens, then pull back to the untouched image.
    if(mobile.matches&&!reduced.matches&&!short.matches){
      const travel=ease((p-.52)/.28);
      const view=[mix(mix(130,860,travel),0,finish),mix(60,0,finish),mix(1000,1920,finish),mix(850,1080,finish)];
      svg.setAttribute('viewBox',view.join(' '));
    }else svg.setAttribute('viewBox','0 0 1920 1080');
    section.style.setProperty('--life-question',String(ease((p-.52)/.15)));
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  new IntersectionObserver(([entry])=>{
    section.style.setProperty('--life-start-play',entry.isIntersecting?'running':'paused');
    schedule();
  }).observe(section);
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);addEventListener('pageshow',schedule);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  reduced.addEventListener('change',schedule);
  section.classList.add('life-path-ready');schedule();
}
