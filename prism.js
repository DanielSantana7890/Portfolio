// Procedural metallic floral sculpture. Canvas-only: works offline and via file://.
(() => {
  const stage = document.querySelector('.prism-stage');
  const canvas = stage?.querySelector('.prism-light');
  const ctx = canvas?.getContext('2d');
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let w=1,h=1,dpr=1,frame=0,visible=true,last=0,elapsed=0;
  const target={x:.5,y:.5}, pointer={x:.5,y:.5};
  function schedule(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
  function resize(){
    w=stage.clientWidth;h=stage.clientHeight;dpr=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);schedule();
  }
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;last=0;
    if(visible)schedule();else{cancelAnimationFrame(frame);frame=0;}
  }).observe(stage);
  stage.addEventListener('pointermove',event=>{
    if(event.isPrimary===false)return;
    const box=stage.getBoundingClientRect();
    target.x=(event.clientX-box.left)/box.width;target.y=(event.clientY-box.top)/box.height;schedule();
  });
  stage.addEventListener('pointerleave',()=>{target.x=.5;target.y=.5;schedule();});
  document.addEventListener('visibilitychange',()=>{
    last=0;if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();
  });
  reduced.addEventListener('change',()=>{last=0;schedule();});
  function draw(now){
    frame=0;
    const dt=last?Math.min((now-last)/1000,.05):0;last=now;
    if(!reduced.matches)elapsed+=dt;
    const ease=reduced.matches?1:1-Math.exp(-7*dt);
    pointer.x+=(target.x-pointer.x)*ease;pointer.y+=(target.y-pointer.y)*ease;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
    // 200px diffused pointer light, confined to this illustration.
    const halo=ctx.createRadialGradient(pointer.x*w,pointer.y*h,0,pointer.x*w,pointer.y*h,Math.min(200,w*.6));
    halo.addColorStop(0,'rgba(172,105,255,.2)');halo.addColorStop(1,'rgba(130,60,220,0)');
    ctx.fillStyle=halo;ctx.fillRect(0,0,w,h);
    const float=reduced.matches?0:Math.sin(elapsed*Math.PI*2/5)*6;
    const cx=w*.5,cy=h*.48+float,scale=Math.min(w,h)*.28;
    const yaw=.32+(pointer.x-.5)*.4+(reduced.matches?0:Math.sin(elapsed*.16)*.12);
    const pitch=-.3+(pointer.y-.5)*.3;
    // Parametric ruffled torus: depth-sorted facets create a sculpted floral form.
    const nu=100,nv=32,points=[];
    function project(u,v){
      const major=1+.14*Math.cos(5*u), tube=.37+.1*Math.sin(5*u+.5);
      let x=(major+tube*Math.cos(v))*Math.cos(u);
      let y=(major+tube*Math.cos(v))*Math.sin(u);
      let z=tube*Math.sin(v)+.24*Math.sin(5*u);
      const xx=x*Math.cos(yaw)+z*Math.sin(yaw), zz=-x*Math.sin(yaw)+z*Math.cos(yaw);
      const yy=y*Math.cos(pitch)-zz*Math.sin(pitch), depth=y*Math.sin(pitch)+zz*Math.cos(pitch);
      const perspective=3.8/(3.8-depth);
      return {x:cx+xx*scale*perspective,y:cy+yy*scale*perspective,z:depth};
    }
    for(let i=0;i<=nu;i++){
      const row=[];for(let j=0;j<=nv;j++)row.push(project(i/nu*Math.PI*2,j/nv*Math.PI*2));points.push(row);
    }
    const facets=[];
    for(let i=0;i<nu;i++)for(let j=0;j<nv;j++){
      const p=[points[i][j],points[i+1][j],points[i+1][j+1],points[i][j+1]];
      const a=p[0],b=p[1],c=p[3];
      const ax=(b.x-a.x)/scale,ay=(b.y-a.y)/scale,az=b.z-a.z;
      const bx=(c.x-a.x)/scale,by=(c.y-a.y)/scale,bz=c.z-a.z;
      let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
      const length=Math.hypot(nx,ny,nz)||1;nx/=length;ny/=length;nz/=length;
      const lx=(pointer.x-.5)*1.3-.5,ly=(pointer.y-.5)*1.3-.7,lz=1.2;
      const light=Math.max(0,(nx*lx+ny*ly+nz*lz)/Math.hypot(lx,ly,lz));
      const rim=Math.pow(1-Math.abs(nz),3);
      const shine=Math.pow(light,18);
      const luminance=Math.min(88,13+light*40+shine*35+rim*13);
      facets.push({p,z:p.reduce((sum,q)=>sum+q.z,0)/4,color:`hsl(${263+ny*17} ${28+rim*30}% ${luminance}%)`});
    }
    // Ambient bloom and soft grounding shadow.
    const bloom=ctx.createRadialGradient(cx,cy,scale*.35,cx,cy,scale*1.8);
    bloom.addColorStop(0,'rgba(170,80,255,.17)');bloom.addColorStop(1,'rgba(140,60,230,0)');
    ctx.fillStyle=bloom;ctx.fillRect(0,0,w,h);
    ctx.save();ctx.translate(cx,h*.87);ctx.scale(1,.13);
    const shadow=ctx.createRadialGradient(0,0,0,0,0,scale*1.1);shadow.addColorStop(0,'rgba(130,68,210,.24)');shadow.addColorStop(1,'rgba(130,68,210,0)');
    ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,scale*1.1,0,Math.PI*2);ctx.fill();ctx.restore();
    facets.sort((a,b)=>a.z-b.z).forEach(({p,color})=>{
      ctx.beginPath();p.forEach((q,i)=>i?ctx.lineTo(q.x,q.y):ctx.moveTo(q.x,q.y));ctx.closePath();
      ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=.6;ctx.fill();ctx.stroke();
    });
    if(!reduced.matches)schedule();
  }
  resize();
})();
