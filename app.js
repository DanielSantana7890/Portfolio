(()=>{
'use strict';
const d=window.PORTFOLIO_DATA||{};
const $=s=>document.querySelector(s);const $$=s=>[...document.querySelectorAll(s)];
const txt=(sel,value)=>{const n=$(sel);if(n)n.textContent=value==null?'':String(value)};
const safeUrl=s=>{if(typeof s!=='string'||!s.trim())return '';if(/^assets\/[A-Za-z0-9_.\-/]+$/.test(s)&&!s.includes('..'))return s;try{const u=new URL(s);if(u.protocol==='https:')return u.href}catch{}return ''};
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
const name=String(d.name||'SEU NOME');
$$('[data-bind="name"]').forEach(el=>el.textContent=name);
$$('.year').forEach(el=>el.textContent=new Date().getFullYear());
txt('[data-bind="heroName"]',d.heroName||name);
// Dot placed inside h1 is kept after changing text.
const heroName=$('.hero-name');if(heroName){heroName.textContent=d.heroName||name;heroName.append(make('span','','.'))}
const role=$('#heroRole');if(role){role.textContent=d.roleLine1||'Designer & Desenvolvedor';role.append(document.createElement('br'),make('em','',d.roleLine2||'Criativo.'))}
txt('#heroIntro',d.intro);txt('#aboutLead',d.aboutLead);txt('#aboutText',d.about);txt('#aboutExtra',d.aboutExtra);
document.title=`${name} — Portfólio`;document.querySelector('meta[property="og:title"]')?.setAttribute('content',`${name} — Portfólio`);

// The START screen's markup and stylesheet are copied byte-for-byte from v1.
const intro=$('#intro'),startBtn=$('#startBtn'),skipBtn=$('#skipIntroBtn');
document.body.classList.add('intro-open');
function closeIntro(destination){if(intro.classList.contains('dismissed'))return;intro.classList.add('dismissed');intro.setAttribute('aria-hidden','true');document.body.classList.remove('intro-open');startBtn.setAttribute('tabindex','-1');skipBtn.setAttribute('tabindex','-1');if(destination)$(destination)?.scrollIntoView({behavior:'smooth'});else window.scrollTo({top:0,behavior:'instant'});$('#main')?.focus({preventScroll:true})}
startBtn.addEventListener('click',()=>closeIntro());skipBtn.addEventListener('click',()=>closeIntro('#portfolio'));
intro.addEventListener('keydown',ev=>{if(intro.classList.contains('dismissed'))return;if(ev.key==='Escape'){ev.preventDefault();closeIntro()}if(ev.key==='Tab'){if(ev.shiftKey&&document.activeElement===startBtn){ev.preventDefault();skipBtn.focus()}else if(!ev.shiftKey&&document.activeElement===skipBtn){ev.preventDefault();startBtn.focus()}}});
startBtn.focus({preventScroll:true});

const nav=$('#mobileNav'),toggle=$('#menuToggle');const closeMenu=()=>{nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu')};
toggle.addEventListener('click',()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden));toggle.setAttribute('aria-label',nav.hidden?'Abrir menu':'Fechar menu')});$$('#mobileNav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeMenu()});

const defaultArtwork=[
  `<div class="cover-art art-one"><div class="mock-window"><div class="mock-bar"><span>studio<span style="color:#7a997c">.</span></span><span class="dots"><i></i><i></i><i></i></span></div><div class="mock-body"><div class="mock-copy"><h4>Design<br>com calma.</h4><p></p><p></p><b></b></div><div class="mock-art"><span></span></div></div></div></div>`,
  `<div class="cover-art art-two"><div class="typographic-art">FORMA<br>VIVA.</div><small>ESTUDO DE LAYOUT / 02</small></div>`,
  `<div class="cover-art art-three"><div class="phone-shell"><div class="phone-screen"><div class="phone-line"></div><div class="phone-shape"></div><div class="phone-circles"><span></span><span></span><span></span></div><div class="phone-block"></div></div></div><div class="phone-shell phone-two"><div class="phone-screen"><div class="phone-line"></div><div class="phone-shape"></div><div class="phone-circles"><span></span><span></span><span></span></div><div class="phone-block"></div></div></div></div>`,
  `<div class="cover-art art-four"><div class="brand-art"><span>PA.</span></div></div>`
];
const grid=$('#projectGrid');(Array.isArray(d.projects)?d.projects:[]).forEach((p,i)=>{
  const item=make('article','work-item'),cover=make('div','work-cover'),url=safeUrl(p.image);
  if(url){const im=make('img');im.src=url;im.alt=p.alt||`Capa do projeto ${p.title||i+1}`;im.loading='lazy';im.addEventListener('error',()=>{im.remove();cover.insertAdjacentHTML('afterbegin',defaultArtwork[i%4]);cover.prepend(make('span','preview-flag','PRÉVIA DE LAYOUT'))});cover.append(im)}
  else{cover.innerHTML=defaultArtwork[i%4];cover.append(make('span','preview-flag','PRÉVIA DE LAYOUT'))}
  const details=make('div','work-details'),info=make('div');info.append(make('h3','',p.title||`Projeto ${i+1}`),make('p','',p.category||''));const tags=make('div','work-tags');(Array.isArray(p.tags)?p.tags:[]).forEach(t=>tags.append(make('span','',t)));info.append(tags);details.append(info);
  const href=safeUrl(p.url);if(href){const a=make('a','','↗');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',`Abrir ${p.title}`);details.append(a)}
  item.append(cover,details);grid.append(item);
});
(Array.isArray(d.stack)?d.stack:[]).forEach(x=>$('#stackList').append(make('span','',x)));
(Array.isArray(d.services)?d.services:[]).forEach((s,i)=>{const details=make('details','service-item');const summary=make('summary','');summary.append(make('span','service-number',String(i+1).padStart(2,'0')),make('span','service-title',s.title),make('span','service-teaser',s.teaser||''),make('span','service-plus','+'));details.append(summary);const sub=make('div','service-detail');(s.detail||[]).forEach(v=>sub.append(make('span','',v)));details.append(sub);$('#servicesList').append(details)});
const email=typeof d.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)?d.email:'';
const contact=$('#contactAction');if(email){contact.textContent=email;contact.append(make('span','','↗'));contact.href=`mailto:${email}`;}else{contact.classList.add('disabled');contact.removeAttribute('href');contact.textContent='Adicione seu e-mail em content.js';}
[['github','GitHub'],['linkedin','LinkedIn'],['behance','Behance']].forEach(([key,label])=>{const u=safeUrl(d[key]);if(!u)return;const a=make('a','',label+' ↗');a.href=u;a.target='_blank';a.rel='noopener noreferrer';$('#socialLinks').append(a)});
})();
