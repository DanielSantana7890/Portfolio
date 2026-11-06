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
const heroName=$('.hero-name');if(heroName)heroName.textContent=d.heroName||name;
const role=$('#heroRole');if(role){role.replaceChildren(make('span','hero-role-highlight',d.roleLine1||'Software Developer & Full Stack Developer'));if(d.roleLine2)role.append(document.createElement('br'),make('em','',d.roleLine2))}
txt('#heroIntro',d.intro);txt('#aboutLead',d.aboutLead);txt('#aboutText',d.about);txt('#aboutExtra',d.aboutExtra);
const aboutExtra=$('#aboutExtra');
if(aboutExtra&&Array.isArray(d.aboutParagraphs)){
  let previous=aboutExtra;
  d.aboutParagraphs.forEach(text=>{
    const paragraph=make('p','',text);
    previous.after(paragraph);
    previous=paragraph;
  });
}
document.title='Daniel Santana';document.querySelector('meta[property="og:title"]')?.setAttribute('content',`${name} — Portfólio`);

// The START screen's markup and stylesheet are copied byte-for-byte from v1.
const intro=$('#intro'),startBtn=$('#startBtn'),skipBtn=$('#skipIntroBtn');
const introControls=[...intro.querySelectorAll('button, a[href]')];
document.body.classList.add('intro-open');
function closeIntro(destination){if(intro.classList.contains('dismissed'))return;intro.classList.add('dismissed');intro.setAttribute('aria-hidden','true');document.body.classList.remove('intro-open');introControls.forEach(control=>control.setAttribute('tabindex','-1'));if(destination)$(destination)?.scrollIntoView({behavior:'smooth'});else window.scrollTo({top:0,behavior:'instant'});$('#main')?.focus({preventScroll:true})}
startBtn.addEventListener('click',()=>{window.location.href='experiencia.html';});
skipBtn.addEventListener('click',()=>closeIntro());
intro.addEventListener('keydown',ev=>{if(intro.classList.contains('dismissed'))return;if(ev.key==='Escape'){ev.preventDefault();closeIntro()}if(ev.key==='Tab'){const first=introControls[0],last=introControls[introControls.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last.focus()}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first.focus()}}});
startBtn.focus({preventScroll:true});

const nav=$('#mobileNav'),toggle=$('#menuToggle');const closeMenu=()=>{nav.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menu')};
toggle.addEventListener('click',()=>{nav.hidden=!nav.hidden;toggle.setAttribute('aria-expanded',String(!nav.hidden));toggle.setAttribute('aria-label',nav.hidden?'Abrir menu':'Fechar menu')});$$('#mobileNav a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeMenu()});

// Align the About heading just below the sticky header, as in the reference.
$$('a[href="#about"]').forEach(link=>link.addEventListener('click',event=>{
  const heading=$('#about h2');
  if(!heading)return;
  event.preventDefault();
  closeMenu();
  const headerHeight=$('.site-header')?.getBoundingClientRect().height||0;
  const top=heading.getBoundingClientRect().top+window.scrollY-headerHeight-8;
  window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  history.replaceState(null,'','#about');
}));

// Place the first competency just below the header, matching the Services reference.
$$('a[href="#services"]').forEach(link=>link.addEventListener('click',event=>{
  const first=$('#services .competency-copy h3');
  if(!first)return;
  event.preventDefault();
  closeMenu();
  const headerHeight=$('.site-header')?.getBoundingClientRect().height||0;
  const top=first.getBoundingClientRect().top+window.scrollY-headerHeight-6;
  window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  history.replaceState(null,'','#services');
}));

// Align the contact introduction below the header, matching the reference.
$$('a[href="#contact"]').forEach(link=>link.addEventListener('click',event=>{
  if(link.id==='contactAction')return;
  const introduction=$('#contact .contact-preface');
  if(!introduction)return;
  event.preventDefault();
  closeMenu();
  const headerHeight=$('.site-header')?.getBoundingClientRect().height||0;
  const top=introduction.getBoundingClientRect().top+window.scrollY-headerHeight-12;
  window.scrollTo({top:Math.max(0,top),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  history.replaceState(null,'','#contact');
}));

const defaultArtwork=[
  `<div class="cover-art art-one"><div class="mock-window"><div class="mock-bar"><span>studio<span style="color:#7a997c">.</span></span><span class="dots"><i></i><i></i><i></i></span></div><div class="mock-body"><div class="mock-copy"><h4>Design<br>com calma.</h4><p></p><p></p><b></b></div><div class="mock-art"><span></span></div></div></div></div>`,
  `<div class="cover-art art-two"><div class="typographic-art">FORMA<br>VIVA.</div><small>ESTUDO DE LAYOUT / 02</small></div>`,
  `<div class="cover-art art-three"><div class="phone-shell"><div class="phone-screen"><div class="phone-line"></div><div class="phone-shape"></div><div class="phone-circles"><span></span><span></span><span></span></div><div class="phone-block"></div></div></div><div class="phone-shell phone-two"><div class="phone-screen"><div class="phone-line"></div><div class="phone-shape"></div><div class="phone-circles"><span></span><span></span><span></span></div><div class="phone-block"></div></div></div></div>`,
  `<div class="cover-art art-four"><div class="brand-art"><span>PA.</span></div></div>`
];
const grid=$('#projectGrid');(grid&&Array.isArray(d.projects)?d.projects:[]).forEach((p,i)=>{
  const item=make('article','work-item'),cover=make('div','work-cover'),url=safeUrl(p.image);
  if(url){const im=make('img');im.src=url;im.alt=p.alt||`Capa do projeto ${p.title||i+1}`;im.loading='lazy';im.addEventListener('error',()=>{im.remove();cover.insertAdjacentHTML('afterbegin',defaultArtwork[i%4]);cover.prepend(make('span','preview-flag','PRÉVIA DE LAYOUT'))});cover.append(im)}
  else{cover.innerHTML=defaultArtwork[i%4];cover.append(make('span','preview-flag','PRÉVIA DE LAYOUT'))}
  const details=make('div','work-details'),info=make('div');info.append(make('h3','',p.title||`Projeto ${i+1}`),make('p','',p.category||''));const tags=make('div','work-tags');(Array.isArray(p.tags)?p.tags:[]).forEach(t=>tags.append(make('span','',t)));info.append(tags);details.append(info);
  const href=safeUrl(p.url);if(href){const a=make('a','','↗');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.setAttribute('aria-label',`Abrir ${p.title}`);details.append(a)}
  item.append(cover,details);grid.append(item);
});
(Array.isArray(d.stack)?d.stack:[]).forEach(x=>$('#stackList').append(make('span','',x)));
const competencies=$('#servicesList');
(Array.isArray(d.services)?d.services:[]).forEach((s,i)=>{
  if(!competencies)return;
  const card=make('article','competency-card');
  const headingId=`competency-${i+1}`;
  card.setAttribute('aria-labelledby',headingId);
  const number=make('span','competency-number',String(i+1).padStart(2,'0'));
  number.setAttribute('aria-hidden','true');
  const text=make('div','competency-copy');
  const title=make('h3','',s.title);title.id=headingId;
  text.append(title,make('p','',s.description||''));
  card.append(number,text);competencies.append(card);
});
const email=typeof d.email==='string'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)?d.email:'';
txt('#contactAction',email||'Adicione seu e-mail em content.js');
[['github','GitHub'],['linkedin','LinkedIn'],['behance','Behance']].forEach(([key,label])=>{const u=safeUrl(d[key]);if(!u)return;const a=make('a','',label+' ↗');a.href=u;a.target='_blank';a.rel='noopener noreferrer';$('#socialLinks').append(a)});
})();
