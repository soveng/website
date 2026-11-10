// Portrait reference supplied by Sovereign Engineering.
// The photograph is sampled into native canvas points, not rendered as a flat image.
const section = document.querySelector('.dialogos');
if (section) {
  const canvas = section.querySelector('canvas');
  const context = canvas.getContext('2d');
  const photo = section.querySelector('img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const mix = (a, b, t) => a + (b - a) * t;
  let points = [], frame = 0, visible = false;
  function prepare() {
    const sample = document.createElement('canvas');
    sample.width = 300; sample.height = 360;
    const ctx = sample.getContext('2d', { willReadFrequently: true });
    // Isolate the head and shoulders from the brick background.
    ctx.beginPath();
    ctx.moveTo(0,360); ctx.lineTo(0,202); ctx.lineTo(65,227);
    ctx.lineTo(82,209); ctx.bezierCurveTo(83,161,85,94,105,72);
    ctx.bezierCurveTo(115,65,141,60,153,60);
    ctx.bezierCurveTo(185,58,228,78,242,104);
    ctx.bezierCurveTo(256,141,248,188,242,210);
    ctx.bezierCurveTo(245,237,229,262,217,275);
    ctx.lineTo(300,329); ctx.lineTo(300,360); ctx.closePath(); ctx.clip();
    ctx.drawImage(photo,0,30,300,300);
    const pixels = ctx.getImageData(0,0,300,360).data;
    let seed = 42;
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    for (let y=0;y<360;y+=2) for(let x=0;x<300;x+=2) {
      const k=(y*300+x)*4;
      if(!pixels[k+3]) continue;
      const light=(pixels[k]*.2126+pixels[k+1]*.7152+pixels[k+2]*.0722)/255;
      if(random() > .55+light*.45) continue;
      const side=points.length%2, angle=random()*Math.PI*2;
      // Elliptical bubbles, with a short tail toward the other speaker.
      const tail=Math.max(0,1-Math.abs(angle-1.3)/.22);
      const bx=(side?360:150)+Math.cos(angle)*85*(side?-1:1);
      const by=220+Math.sin(angle)*64+tail*28;
      const radius=Math.sqrt(random()), theta=random()*Math.PI*2;
      points.push({x:75+x*1.2,y:25+y*1.2,bx,by,cx:255+Math.cos(theta)*radius*210,cy:245+Math.sin(theta)*radius*200,light:Math.pow(light,.65),r:.65+Math.pow(light,.65)*.9});
    }
    section.classList.add('dialogos-ready');
    requestDraw();
  }
  function draw() {
    frame=0;
    const rect=section.getBoundingClientRect();
    const progress=(reduced.matches||matchMedia('(max-width:700px) and (max-height:650px)').matches)?1:clamp(-rect.top/(section.offsetHeight-innerHeight));
    const spread=ease((progress-.08)/.32), resolve=ease((progress-.42)/.4);
    const box=canvas.getBoundingClientRect(), dpr=Math.min(devicePixelRatio||1,2);
    const width=Math.round(box.width*dpr), height=Math.round(box.height*dpr);
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    context.setTransform(width/510,0,0,height/510,0,0);context.clearRect(0,0,510,510);
    const positions=points.map(p=>({x:mix(mix(p.bx,p.cx,spread),p.x,resolve),y:mix(mix(p.by,p.cy,spread),p.y,resolve)}));
    context.strokeStyle=`rgba(194,149,116,${Math.sin(spread*Math.PI/2)*(1-resolve)*.32})`;
    context.lineWidth=.65;
    // Sparse connections keep the constellation readable and the mobile work bounded.
    for(let i=0;i<positions.length-31;i+=31){
      const a=positions[i],b=positions[i+31];
      if(Math.hypot(a.x-b.x,a.y-b.y)>100)continue;
      context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke();
    }
    points.forEach((p,i)=>{
      const constellation=spread*(1-resolve);
      const star=i%31===0;
      const a=mix(mix(.3,star?.85:.035,spread),.06+p.light*.94,resolve);
      context.fillStyle=`rgba(235,229,213,${a})`;
      context.beginPath();context.arc(positions[i].x,positions[i].y,mix(1.1,p.r,resolve)+constellation*(star?1.2:0),0,Math.PI*2);context.fill();
    });
    section.style.setProperty('--portrait-name',reduced.matches?1:ease((progress-.66)/.15));
  }
  function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();});
  observer.observe(section);
  addEventListener('scroll',()=>{if(visible&&!reduced.matches)requestDraw();},{passive:true});
  addEventListener('resize',requestDraw);
  reduced.addEventListener('change',requestDraw);
  if(photo.complete&&photo.naturalWidth)prepare();else photo.addEventListener('load',prepare,{once:true});
}
