'use strict';
// Configure only authorized real project URLs below. Empty URLs never create outbound links.
const EXPERIENCE={
 sheet:'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_084005_ab0d1fcf-a93f-4e32-a277-1523e1768fbe.png&w=2400&q=88',
 crop:{SW:2336,SH:1744,CW:.2425,CG:.01,RH:.3244,RG:.0134},
 projects:(window.PROJETOS||[]).map((p,id)=>({id,title:p.title||'Projeto',category:p.category||'',description:p.description||'',image:p.image||'',url:p.url||''}))
};
(()=>{
 const $=s=>document.querySelector(s),stage=$('#stage'),shelf=$('#shelf'),dialog=$('#projectDialog'),projects=EXPERIENCE.projects;
 const total=projects.length;
 if(!total){$('#openActive').hidden=true;return;}
 const tapeCount=total*Math.max(3,Math.ceil(36/total));
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),tapes=[],ruler=[];
 const colors=['#c8a0a0','#ddd3b6','#b5b6a7','#c6bca8','#a6b5ad','#b1a396','#9daab1','#a2a69b','#c6b99a','#a5b7c0','#c2b290','#9cbbb9'];
 let s=0,T=0,H=300,ws=50,d=158,gap=10,U=390,active=-1,drag=null,frameId=0,previousTime=0;
 let selected=null,voice=false,lastFocus=null,originRect=null,transition=null,closing=false;
 let glowBlockedAt=null;
 function crop(el,id){const project=projects[id];if(project.image){el.style.backgroundImage=`url(${JSON.stringify(project.image)})`;el.style.backgroundSize='cover';el.style.backgroundPosition='center';return;}const c=EXPERIENCE.crop;el.style.backgroundImage=`url("${EXPERIENCE.sheet}")`;el.style.backgroundSize=`${100/c.CW}% ${100/c.RH}%`;el.style.backgroundPosition=`${id%4*(c.CW+c.CG)/(1-c.CW)*100}% ${Math.floor(id/4)*(c.RH+c.RG)/(1-c.RH)*100}%`;}
 function mod(n,m){return(n%m+m)%m;}
 function relative(n){return mod(n+tapeCount/2,tapeCount)-tapeCount/2;}
 function smooth(n){return n*n*(3-2*n);}
 // Numerical integration of the shelf's scale field; midpoint quadrature is stable at either edge.
 function integral(u){const n=40,step=Math.abs(u)/n;let sum=0;for(let i=0;i<n;i++)sum+=1/(1+Math.pow(((i+.5)*step)/U,1.6));return Math.sign(u)*sum*step;}
 function metrics(){H=Math.min(innerHeight*.47,innerWidth*.33);if(innerWidth<=760)H=Math.min(innerWidth*.68,innerHeight*.4);ws=H*.169;d=H*.527;gap=H*.035;U=H*1.3;schedule();}
 projects.forEach(p=>{
   const b=document.createElement('button');b.type='button';b.textContent=String(p.id+1).padStart(2,'0');b.setAttribute('aria-label','Selecionar '+p.title);b.addEventListener('click',()=>go(p.id));ruler.push(b);$('#ruler').append(b);
   const row=document.createElement('button');row.type='button';const name=document.createElement('span'),number=document.createElement('small');name.textContent=p.title;number.textContent=String(p.id+1).padStart(2,'0')+' ↗';row.append(name,number);row.addEventListener('click',()=>open(p));$('#projectIndex').append(row);
 });
 for(let i=0;i<tapeCount;i++){
   const p=projects[i%total],el=document.createElement('div');el.className='tape';el.setAttribute('aria-hidden','true');
   el.innerHTML='<div class="tape-face spine"><span class="tape-number"></span><span class="tape-title"></span><span class="tape-brand">DS / VHS</span></div><div class="tape-face cover"><span class="cover-label"></span></div>';
   el.querySelector('.spine').style.backgroundColor=colors[p.id%colors.length];el.querySelector('.tape-number').textContent=String(p.id+1).padStart(2,'0');el.querySelector('.tape-title').textContent=p.title;
   const label=el.querySelector('.cover-label');label.textContent=p.title;const sub=document.createElement('small');sub.textContent=p.image?p.category:'ESTUDO DEMONSTRATIVO';label.append(sub);crop(el.querySelector('.cover'),p.id);el.dataset.slot=i;shelf.append(el);tapes.push(el);
 }
 function updateCaption(){const index=mod(Math.round(s),total);if(index===active)return;active=index;const p=projects[index];$('#captionTitle').textContent=p.title;$('#captionCategory').textContent='ESTUDO DEMONSTRATIVO / '+p.category.toUpperCase();$('#openActive').setAttribute('aria-label','Abrir estudo '+p.title);ruler.forEach((b,i)=>b.setAttribute('aria-current',String(i===index)));$('#selectionStatus').textContent=p.title+', '+(index+1)+' de '+total+'.';}
 function render(){
   tapes.forEach((el,i)=>{
     const r=relative(i-s),B=Math.abs(r)<1?(r+Math.sin(Math.PI*r)/Math.PI)/2:Math.sign(r)*.5;
     const u=r*(ws+gap)+(d-ws+1.4*gap)*B,sc=1/(1+Math.pow(Math.abs(u)/U,1.6)),k=1/sc,o=smooth(Math.max(0,1-Math.abs(r)));
     const z=1400*(1-k)+o*H*.1,x=integral(u)*k,y=H*.5*(1-sc)*.42*k;
     const rotation=Math.sign(u)*Math.min(1,Math.abs(u)/U)*26*(1-o)-90*o;
     el.style.transform=`translate3d(${x-ws/2}px,${y}px,${z}px) rotateY(${rotation}deg)`;
     el.style.visibility=Math.abs(r)>13?'hidden':'visible';
     el.classList.toggle('selected-glow',!drag&&Math.abs(T-s)<.08&&Math.abs(r)<.08&&glowBlockedAt!==Math.round(s));
   });updateCaption();
 }
 function frame(time){frameId=0;const dt=previousTime?Math.min((time-previousTime)/1000,.05):1/60;previousTime=time;s=reduced.matches?T:s+(T-s)*(1-Math.exp(-(drag?18:5.2)*dt));if(Math.abs(T-s)<.0002)s=T;render();if(Math.abs(T-s)>.0002)schedule();else previousTime=0;}
 function schedule(){if(!frameId)frameId=requestAnimationFrame(frame);}
 function normalize(){if(Math.abs(T)>3600){const shift=Math.trunc(T/36)*36;T-=shift;s-=shift;}}
 function go(id){if(selected)return;T+=mod(id-mod(Math.round(T),total)+6,12)-6;T=Math.round(T);normalize();schedule();}
 function step(n){if(selected)return;T=Math.round(T)+n;normalize();schedule();}
 $('#previous').addEventListener('click',()=>step(-1));$('#next').addEventListener('click',()=>step(1));$('#openActive').addEventListener('click',()=>open(projects[active],activeTape()));
 function activeTape(){let nearest=tapes[0],distance=Infinity;tapes.forEach((el,i)=>{const dist=Math.abs(relative(i-s));if(dist<distance){nearest=el;distance=dist;}});return nearest.querySelector('.cover');}
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();step(e.key==='ArrowRight'?1:-1);}if(e.key==='Enter'){e.preventDefault();open(projects[active],activeTape());}if(e.key==='Home'){e.preventDefault();go(0);}if(e.key==='End'){e.preventDefault();go(total-1);}});
 stage.addEventListener('pointerdown',e=>{if(selected||e.button!==0)return;glowBlockedAt=Math.round(s);tapes.forEach(el=>el.classList.remove('selected-glow'));drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,moved:false,slot:e.target.closest('.tape')?.dataset.slot};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
 stage.addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>7)drag.moved=true;T-=(e.clientX-drag.x)/(ws+gap);drag.x=e.clientX;normalize();schedule();});
 function endDrag(e,cancel=false){if(!drag)return;const state=drag;drag=null;stage.classList.remove('dragging');if(stage.hasPointerCapture(e.pointerId))stage.releasePointerCapture(e.pointerId);if(!cancel&&!state.moved&&state.slot!==undefined){const i=Number(state.slot),r=relative(i-s);if(Math.abs(r)<.35)open(projects[i%total],tapes[i].querySelector('.cover'));else T=s+r;}T=Math.round(T);schedule();}
 stage.addEventListener('pointerup',e=>endDrag(e));stage.addEventListener('pointercancel',e=>endDrag(e,true));
 let wheelTimer;stage.addEventListener('wheel',e=>{if(selected||e.ctrlKey)return;e.preventDefault();const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;T+=Math.max(-100,Math.min(100,delta))*.009;normalize();schedule();clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{T=Math.round(T);schedule();},140);},{passive:false});
 $('#indexToggle').addEventListener('click',()=>{const expanded=$('#projectIndex').hidden;$('#projectIndex').hidden=!expanded;$('#indexToggle').setAttribute('aria-expanded',String(expanded));});
 function stopVoice(){if('speechSynthesis' in window)speechSynthesis.cancel();}
 function speak(){stopVoice();if(!selected)return;if(!('speechSynthesis' in window)){ $('#voiceStatus').textContent='Voz indisponível neste navegador. Leia a explicação acima.';return; }const utterance=new SpeechSynthesisUtterance(selected.title+'. '+selected.description);utterance.lang='pt-BR';utterance.rate=.97;utterance.voice=speechSynthesis.getVoices().find(v=>v.lang==='pt-BR')||null;$('#voiceStatus').textContent='Lendo a explicação…';utterance.onend=()=>$('#voiceStatus').textContent='Leitura concluída.';utterance.onerror=()=>$('#voiceStatus').textContent='Leitura interrompida ou indisponível. Consulte o texto acima.';speechSynthesis.speak(utterance);}
 $('#readDescription').addEventListener('click',speak);$('#voiceToggle').addEventListener('click',()=>{voice=!voice;$('#voiceToggle').setAttribute('aria-pressed',String(voice));$('#voiceToggle').textContent='Voz automática: '+(voice?'sim':'não');if(voice)speak();else stopVoice();});
 if(!('speechSynthesis' in window)){$('#voiceToggle').disabled=true;$('#readDescription').disabled=true;}
 function clip(rect){const top=Math.max(0,Math.min(innerHeight,rect.top)),left=Math.max(0,Math.min(innerWidth,rect.left)),bottom=Math.max(0,innerHeight-Math.min(innerHeight,Math.max(0,rect.bottom))),right=Math.max(0,innerWidth-Math.min(innerWidth,Math.max(0,rect.right)));return `inset(${top}px ${right}px ${bottom}px ${left}px)`;}
 function open(p,source){if(selected)return;selected=p;closing=false;lastFocus=document.activeElement;originRect=(source||activeTape()).getBoundingClientRect();$('#detailTitle').textContent=p.title;$('#detailDescription').textContent=p.description;$('#detailMeta').textContent=String(p.id+1).padStart(2,'0')+' / '+p.category.toUpperCase()+' / CONCEITO';crop($('#detailImage'),p.id);$('#detailImage').setAttribute('aria-label','Imagem do estudo demonstrativo '+p.title);$('#voiceStatus').textContent='Síntese de voz do navegador em português. Sem API ou microfone.';
   let url=null;try{const parsed=new URL(p.url);if(['https:','http:'].includes(parsed.protocol))url=parsed.href;}catch(_){}$('#visitProject').hidden=!url;$('#urlNotice').hidden=!!url;if(url)$('#visitProject').href=url;else $('#visitProject').removeAttribute('href');
   dialog.showModal();document.body.style.overflow='hidden';dialog.scrollTop=0;$('#closeProject').focus();
   if(!reduced.matches&&dialog.animate){transition=dialog.animate([{clipPath:clip(originRect)},{clipPath:'inset(0px 0px 0px 0px)'}],{duration:1050,easing:'cubic-bezier(.76,0,.24,1)',fill:'both'});transition.onfinish=()=>{transition=null;if(voice&&selected&&!closing)speak();};$('#detailTitle').animate([{transform:'translateY(110%)'},{transform:'translateY(0)'}],{duration:850,delay:400,easing:'cubic-bezier(.2,.8,.2,1)',fill:'both'});}else if(voice)speak();
 }
 function close(){if(!dialog.open||closing)return;closing=true;stopVoice();if(transition)transition.cancel();if(!reduced.matches&&dialog.animate){transition=dialog.animate([{clipPath:'inset(0px 0px 0px 0px)'},{clipPath:clip(originRect)}],{duration:750,easing:'cubic-bezier(.76,0,.24,1)',fill:'both'});transition.onfinish=()=>{dialog.close();};}else dialog.close();}
 $('#closeProject').addEventListener('click',close);dialog.addEventListener('cancel',e=>{e.preventDefault();close();});dialog.addEventListener('close',()=>{if(transition){transition.cancel();transition=null;}dialog.getAnimations().forEach(a=>a.cancel());stopVoice();selected=null;closing=false;document.body.style.overflow='';if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});});window.addEventListener('pagehide',stopVoice);
 window.addEventListener('resize',metrics);reduced.addEventListener('change',()=>{if(reduced.matches&&transition){transition.finish();}schedule();});$('#year').textContent=new Date().getFullYear();metrics();
 if(!window.CSS||!CSS.supports('transform-style','preserve-3d')){document.body.classList.add('no-3d');$('#projectIndex').hidden=false;$('#indexToggle').setAttribute('aria-expanded','true');}
 // Images are optional decoration: text labels, navigation and details remain functional offline.
 const image=new Image();image.onerror=()=>{$('#selectionStatus').textContent='Imagens indisponíveis. Os estudos continuam acessíveis pelos títulos.';};image.src=EXPERIENCE.sheet;
})();
