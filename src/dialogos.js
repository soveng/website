import { portraitPaths, portraitPoint } from './dialogos-portrait.js';

const section = document.querySelector('.dialogos');
if (section) {
  const canvas = section.querySelector('canvas');
  const ctx = canvas.getContext('2d');
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
    path.points.forEach((coordinate,i)=>{
      const key=coordinate.join(',');
      let id=lookup.get(key);
      const at=.40+(path.at-.40)*.85+i/(path.points.length-1)*.05;
      if(id===undefined){
        id=points.length;lookup.set(key,id);
        const angle=random()*Math.PI*2, radius=Math.sqrt(random());
        points.push({...portraitPoint(coordinate),cx:255+Math.cos(angle)*radius*190,cy:245+Math.sin(angle)*radius*180,at,r:1.15+random()*.9});
      }
      if(previous!==undefined)edges.push({a:previous,b:id,at});
      previous=id;
    });
  }
  // These same six stars persist all the way from the ellipses to the face.
  const anchors=[[287,440],[480,111],[821,418],[299,454],[620,672],[533,933]].map(p=>lookup.get(p.join(',')));
  const constellation=[[103,173],[211,102],[373,153],[179,282],[365,301],[269,400]];
  anchors.forEach((id,i)=>{points[id].anchor=i;[points[id].cx,points[id].cy]=constellation[i];});
  const earlyEdges=[[0,1],[1,2],[0,3],[3,4],[4,2],[3,5]];

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
    const depart=ease((p-.10)/.20), morph=ease((p-.40)/.37);
    const box=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
    const width=Math.round(box.width*dpr),height=Math.round(box.height*dpr);
    if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
    ctx.setTransform(width/510,0,0,height/510,0,0);ctx.clearRect(0,0,510,510);
    bubble(140,1,(1-ease((p-.10)/.13))*.8);
    bubble(370,-1,(1-ease((p-.10)/.13))*.8);
    const positions=points.map(point=>{
      const a=point.anchor;
      const x=mix(point.cx,point.x,morph),y=mix(point.cy,point.y,morph);
      return {x:a===undefined?x:mix((a<3?140:370)+(a%3-1)*22,x,depart),y:a===undefined?y:mix(220,y,depart)};
    });
    earlyEdges.forEach(([a,b],i)=>line(positions[anchors[a]],positions[anchors[b]],ease((p-.24-i*.012)/.09),(1-ease((p-.51)/.22))*.55));
    edges.forEach(edge=>line(positions[edge.a],positions[edge.b],ease((p-edge.at)/.07),.76,1.05));
    points.forEach((point,i)=>{
      const anchor=point.anchor!==undefined;
      const alpha=anchor?1:ease((p-point.at+.025)/.065);
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
    section.style.setProperty('--portrait-name',ease((p-.73)/.12));
  }
  function requestDraw(){if(!frame)frame=requestAnimationFrame(draw);}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)requestDraw();}).observe(section);
  addEventListener('scroll',()=>{if(visible&&!reduced.matches)requestDraw();},{passive:true});
  addEventListener('resize',requestDraw);reduced.addEventListener('change',requestDraw);
  section.classList.add('dialogos-ready');requestDraw();
}
