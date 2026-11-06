// Section-scoped Fibonacci photo sphere adapted from the supplied reference.
(() => {
  const section=document.querySelector('#contact');
  const stage=section?.querySelector('.contact-ribbon');
  if(!stage)return;
  const base='https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';
  const ids=[
    'hf_20260922_194349_26ffdbfd-ac5e-49e9-a07d-c06d3f7cb4cb',
    'hf_20260922_194350_5546ea3d-6336-42c7-a59f-06165c5802be',
    'hf_20260922_194349_b4533691-cb49-41d4-b56c-51f0fdcbe250',
    'hf_20260922_194349_e588abd3-1bfa-4918-894f-05632cc51ccc',
    'hf_20260922_194350_28d92c80-de66-41cb-911e-b3b44aebe1f5',
    'hf_20260922_194349_04e89718-4214-4aff-bac5-490462bbfe2f',
    'hf_20260922_194417_2c031e22-2fad-4c81-a544-83cd6bba1c33',
    'hf_20260922_194349_a39c3226-7848-4b15-b840-98ad8aec467b',
    'hf_20260922_194417_555e4d90-f35f-4a1a-8c75-def1e8b71988',
    'hf_20260922_194417_e525a243-03c8-454b-83b4-60f541baf70a',
    'hf_20260922_194349_ec830e6f-b8e6-4569-8540-ee7f33902c53',
    'hf_20260922_194417_35a9af5f-bd07-45a7-bb73-08b47d19d530',
    'hf_20260922_194416_30e307a9-1265-45c3-a1a0-5c6fa5bb9f8d',
    'hf_20260922_194417_ff5cb9f8-8eed-4bfb-bb08-11256da92eae',
    'hf_20260922_194418_1d9bff4a-4971-4944-9e49-d72e755ceeb0',
    'hf_20260922_194349_75e53821-0807-4ebc-992d-34bae0ec2ce6',
    'hf_20260922_194417_5a227847-3796-4438-805d-7e66e9538205',
    'hf_20260922_194350_b49aa67e-0401-4029-af4f-f6ac3ee83398',
    'hf_20260922_194349_89b82779-3a46-4c55-b7c5-f4a0fd955874',
    'hf_20260922_194416_47e18c62-253a-42e1-97a9-9e5f6a6b8d59',
    'hf_20260922_194417_a455843c-d8db-461c-8ef6-74a325d2472c'
  ];
  const world=document.createElement('div');world.className='contact-photo-world';stage.append(world);
  const angle=Math.PI*(3-Math.sqrt(5));
  const cards=ids.map((id,i)=>{
    const y=1-i/(ids.length-1)*2,rad=Math.sqrt(Math.max(0,1-y*y));
    const x=Math.cos(i*angle)*rad,z=Math.sin(i*angle)*rad;
    const card=document.createElement('div');card.className='contact-photo-card'+(i===19?' tall':'');
    const image=document.createElement('img');image.alt='';image.decoding='async';
    image.dataset.src=base+id+'_min.webp';
    image.addEventListener('error',()=>{card.style.visibility='hidden';});
    card.append(image);world.append(card);
    return {card,image,x,y,z,lat:Math.asin(y)*180/Math.PI,lon:Math.atan2(x,z)*180/Math.PI};
  });
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=false,frame=0,yaw=0,pitch=-4,targetYaw=0,targetPitch=-4,radius=250,drag=null;
  function schedule(){if(active&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
  function layout(){
    const w=stage.clientWidth,h=stage.clientHeight;
    radius=Math.max(108,Math.min(440,h*.43,w*.46));
    stage.style.setProperty('--photo-width',`${Math.max(72,radius*.47)}px`);
    cards.forEach(({card,x,y,z,lat,lon})=>{
      card.style.transform=`translate3d(${x*radius}px,${-y*radius}px,${z*radius}px) rotateY(${lon}deg) rotateX(${lat}deg)`;
    });schedule();
  }
  let lastFrame=0;
  let hovering=false;
  const mouseDirection={x:0,y:0};
  function draw(now){
    frame=0;
    const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):0;
    lastFrame=now;
    if(hovering&&!drag){
      const speed=value=>Math.abs(value)<.08?0:Math.sign(value)*Math.pow((Math.abs(value)-.08)/.92,1.4);
      const vx=hovering?speed(mouseDirection.x):0;
      const vy=hovering?speed(mouseDirection.y):0;
      targetYaw+=dt*vx*32;
      targetPitch=Math.max(-32,Math.min(32,targetPitch-dt*vy*24));
      if(vx===0)targetYaw=yaw;
      if(vy===0)targetPitch=pitch;
    }
    const ease=reduced.matches?1:1-Math.exp(-6*dt);
    yaw+=(targetYaw-yaw)*ease;pitch+=(targetPitch-pitch)*ease;
    const rect=section.getBoundingClientRect();
    const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height)));
    world.style.transform=`translateZ(${progress*Math.min(64,radius*.12)}px) rotateY(${yaw}deg) rotateX(${pitch}deg)`;
    const a=yaw*Math.PI/180,b=pitch*Math.PI/180;
    cards.forEach(({card,x,y,z})=>{
      const depth=(z*Math.cos(a)-x*Math.sin(a))*Math.cos(b)-y*Math.sin(b);
      card.style.setProperty('--photo-dim',String(1-(.18+.82*Math.pow((depth+1)/2,.85))));
    });
    if(hovering||drag||Math.abs(targetYaw-yaw)>.01||Math.abs(targetPitch-pitch)>.01)schedule();
  }
  // Drag on the background; links above it retain their normal behavior.
  section.addEventListener('pointerdown',event=>{
    if(event.pointerType!=='touch'||event.target.closest('a,button')||event.button!==0)return;
    drag={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:targetYaw,pitch:targetPitch};
    if(event.pointerType==='mouse')section.setPointerCapture(event.pointerId);
  });
  window.addEventListener('pointermove',event=>{
    if(event.pointerType==='mouse'||event.pointerType==='pen'){
      const rect=section.getBoundingClientRect();
      const top=Math.max(0,rect.top),bottom=Math.min(innerHeight,rect.bottom);
      hovering=event.clientX>=rect.left&&event.clientX<=rect.right&&event.clientY>=top&&event.clientY<=bottom;
      if(!hovering){targetYaw=yaw;targetPitch=pitch;return;}
      active=true;
      mouseDirection.x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
      mouseDirection.y=Math.max(-1,Math.min(1,(event.clientY-top)/Math.max(1,bottom-top)*2-1));
      schedule();
      return;
    }
    if(!drag||event.pointerId!==drag.id)return;
    const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(event.pointerType==='touch'&&Math.abs(dy)>Math.abs(dx)*1.15){drag=null;return;}
    targetYaw=drag.yaw+dx*.13;targetPitch=Math.max(-32,Math.min(32,drag.pitch-dy*.13));schedule();
  });
  section.addEventListener('pointerleave',()=>{hovering=false;schedule();});
  const release=()=>{drag=null;};
  section.addEventListener('pointerup',release);section.addEventListener('pointercancel',release);
  new ResizeObserver(layout).observe(stage);
  new IntersectionObserver(([entry])=>{
    active=entry.isIntersecting;
    if(active){cards.forEach(({image})=>{if(!image.src)image.src=image.dataset.src;});schedule();}
    else{cancelAnimationFrame(frame);frame=0;}
  }).observe(section);
  addEventListener('scroll',schedule,{passive:true});
  reduced.addEventListener('change',schedule);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;}else schedule();
  });
  layout();
})();
