import { portraitPaths, portraitPoint } from './dialogos-portrait.js';

const section = document.querySelector('.dialogos');
if (section) {
  const canvas = section.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const sketch = section.querySelector('.dialogos-sketch');
  const outline = section.querySelector('.dialogos-lines');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const short = matchMedia('(max-width:700px) and (max-height:650px)');
  const clamp = x => Math.max(0,Math.min(1,x));
  const ease = x => {x=clamp(x);return x*x*(3-2*x);};
  const mix = (a,b,t) => a+(b-a)*t;
  const points=[], edges=[], lookup=new Map();
  let seed=42, frame=0, visible=false;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(const path of portraitPaths){
    let previous;
    path.points.forEach(coordinate=>{
      const key=coordinate.join(',');
      let id=lookup.get(key);

      if(id===undefined){
        id=points.length;lookup.set(key,id);
        points.push({...portraitPoint(coordinate),appear:.43+random()*.36,r:1.05+random()*.7});
      }
      if(previous!==undefined)edges.push({a:previous,b:id});
      previous=id;
    });
  }
  // These same six stars persist all the way from the ellipses to the face.
  const anchors=[[286,474],[600,101],[818,481],[288,715],[630,702],[513,955]].map(p=>lookup.get(p.join(',')));
  anchors.forEach((id,i)=>{points[id].anchor=i;});
  // Scatter the drawing order across the face instead of tracing it top to bottom.
  // A handful of isolated strokes precedes the much later, fuller reveal.
  for(let i=edges.length-1;i>0;i--){
    const j=Math.floor(random()*(i+1));
    [edges[i],edges[j]]=[edges[j],edges[i]];
  }
  edges.forEach((edge,i)=>{
    edge.start=i<12?.38+i/12*.27:.68+(i-12)/(edges.length-12)*.25;
    edge.duration=i<12?.025:.018;
    // Both stars must have emerged before their connecting line begins.
    for(const id of [edge.a,edge.b])points[id].appear=Math.min(points[id].appear,edge.start-.10);
  });
  const background=Array.from({length:42},()=>({x:35+random()*440,y:40+random()*420,r:.5+random()*.6,appear:.24+random()*.40}));

  function line(a,b,amount,alpha,width=1){
    if(amount<=0||alpha<=0)return;
    ctx.strokeStyle=`rgba(225,213,191,${alpha})`;ctx.lineWidth=width;
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(mix(a.x,b.x,amount),mix(a.y,b.y,amount));ctx.stroke();
  }
  function bubble(x,mirror,alpha){
    ctx.save();ctx.translate(x,220);ctx.scale(mirror,1);
    ctx.strokeStyle=`rgba(225,213,191,${alpha})`;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(25,51);ctx.bezierCurveTo(110,38,108,-58,0,-58);
    ctx.bezierCurveTo(-108,-58,-110,46,-27,52);
    ctx.lineTo(4,77);ctx.lineTo(0,55);ctx.bezierCurveTo(10,55,18,54,25,51);ctx.stroke();ctx.restore();
  }
  function draw(){
    frame=0;
    const rect=section.getBoundingClientRect();
    const p=reduced.matches||short.matches?1:clamp(-rect.top/(section.offsetHeight-innerHeight));
    const depart=ease((p-.08)/.22);
    const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    const width=Math.round(box.width*dpr),height=Math.round(box.height*dpr);
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    ctx.setTransform(width/510,0,0,height/510,0,0);ctx.clearRect(0,0,510,510);
    bubble(140,1,(1-ease((p-.10)/.13))*.8);
    bubble(370,-1,(1-ease((p-.10)/.13))*.8);
    const positions=points.map(point=>{
      const a=point.anchor;
      const {x,y}=point;
      return {x:a===undefined?x:mix((a<3?140:370)+(a%3-1)*22,x,depart),y:a===undefined?y:mix(220,y,depart)};
    });
    // Once the six seeds arrive, every star stays fixed. Only the drawing tip moves.
    edges.forEach(edge=>line(positions[edge.a],positions[edge.b],clamp((p-edge.start)/edge.duration),.76,1.05));
    background.forEach(star=>{
      ctx.fillStyle=`rgba(225,213,191,${ease((p-star.appear)/.10)*.28})`;
      ctx.beginPath();ctx.arc(star.x,star.y,star.r,0,Math.PI*2);ctx.fill();
    });
    points.forEach((point,i)=>{
      const anchor=point.anchor!==undefined;
      const alpha=anchor?1:ease((p-point.appear)/.09);
      if(!alpha)return;
      const pos=positions[i],r=anchor?mix(4,2.3,depart):point.r;
      const glow=ctx.createRadialGradient(pos.x,pos.y,0,pos.x,pos.y,r*4);
      glow.addColorStop(0,`rgba(232,221,200,${alpha*.22})`);glow.addColorStop(1,'rgba(232,221,200,0)');
      ctx.fillStyle=glow;ctx.beginPath();ctx.arc(pos.x,pos.y,r*4,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=`rgba(242,234,216,${alpha})`;ctx.beginPath();ctx.arc(pos.x,pos.y,r,0,Math.PI*2);ctx.fill();
      if(anchor&&depart>.4){
        line({x:pos.x-r*3,y:pos.y},{x:pos.x+r*3,y:pos.y},1,alpha*depart*.4,.65);
        line({x:pos.x,y:pos.y-r*3},{x:pos.x,y:pos.y+r*3},1,alpha*depart*.4,.65);
      }
    });
    const sketchReady=sketch.complete&&sketch.naturalWidth>0;
    const outlineReady=outline.complete&&outline.naturalWidth>0;
    const outlineIn=outlineReady?ease((p-.61)/.12):0;
    const sketchIn=sketchReady?ease((p-.83)/.12):0;
    section.style.setProperty('--line-opacity',outlineIn*(1-sketchIn));
    section.style.setProperty('--sketch-opacity',sketchIn);
    section.style.setProperty('--constellation-opacity',1-Math.max(outlineIn,sketchIn));
    section.style.setProperty('--portrait-name',ease((p-.71)/.10));
  }
  function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();}).observe(section);
  addEventListener('scroll',()=>{if(visible&&!reduced.matches)requestDraw();},{passive:true});
  addEventListener('resize',requestDraw);reduced.addEventListener('change',requestDraw);
  sketch.addEventListener('load',requestDraw,{once:true});
  outline.addEventListener('load',requestDraw,{once:true});
  section.classList.add('dialogos-ready');requestDraw();
}
