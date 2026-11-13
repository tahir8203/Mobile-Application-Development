/* MAD Course portal 2.0: dashboard home, app-style shell (bottom tabs, back, titles), practice hub,
   resources, Android-in-2026 page and profile. Sits on top of CourseApp without changing its storage.
   Portal state lives in localStorage "madPortalV1". */
(function(){
'use strict';
const D=window.MAD_PORTAL,P=window.MADPresent,C=window.MAD_COURSE;
if(!D||!P||!C||typeof CourseApp==='undefined')return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=P.esc,md=P.md,plain=P.plain,pad=n=>String(n).padStart(2,'0');
const inApp=/MADCourseApp/.test(navigator.userAgent);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NV=()=>window.MADNative||null;
function haptic(ms){try{const n=NV();if(n&&n.haptic)n.haptic(ms||12);else if(navigator.vibrate&&navigator.userActivation&&navigator.userActivation.hasBeenActive)navigator.vibrate(ms||12)}catch(e){}}
const toast=m=>CourseApp.toast(m);
const lecTitle=n=>(typeof LECTURES!=='undefined'&&LECTURES[n-1])?LECTURES[n-1].title:'Lecture '+n;

/* ---------- icons ---------- */
const svg=(d,f)=>'<svg viewBox="0 0 24 24" aria-hidden="true"'+(f?' class="fill"':'')+'>'+d+'</svg>';
const IC={home:svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>'),
 learn:svg('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/><path d="M9 8h7M9 12h5"/>'),
 quiz:svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
 labs:svg('<path d="M9 3h6M10 3v6.5L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9.5V3"/><path d="M7.5 15h9"/>'),
 me:svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/>'),
 back:svg('<path d="M15 5l-7 7 7 7"/>'),chev:svg('<path d="M9 5l7 7-7 7"/>')};
const TABS=[['home','Home','home'],['learn','Learn','learn'],['quiz','Practice','quiz'],['labs','Labs','labs'],['me','Me','me']];

/* ---------- storage ---------- */
const KEY='madPortalV1';
const S={d:{name:'',roll:'',start:'',days:{},labs:{},best:{},xp:0,wrong:{},qotd:{},viva:{},hub:{r:0,t:0}},
 load(){try{const r=JSON.parse(localStorage.getItem(KEY)||'null');if(r&&typeof r==='object')for(const k in this.d)if(r[k]!==undefined&&typeof r[k]===typeof this.d[k])this.d[k]=r[k]}catch(e){}},
 save(){try{localStorage.setItem(KEY,JSON.stringify(this.d))}catch(e){}}};
S.load();
const dayKey=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=()=>dayKey(new Date());
S.d.days[today()]=1;S.save();
const dayNo=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);

/* ---------- decks and numbers ---------- */
const decks={};let decksReady=null;
function loadDecks(){return decksReady||(decksReady=Promise.all(Array.from({length:16},(_,i)=>P.loadDeck(i+1).then(d=>{decks[i+1]=P.compose(i+1,d)}).catch(()=>{}))))}
const FALLBACK=[23,29,23,26,22,20,25,19,27,24,23,20,25,20,23,24];
function assessStore(){try{return JSON.parse(localStorage.getItem('madAssessV1'))||{}}catch(e){return{}}}
const assessQs=id=>id==='mid'?C.mid.mcq:id==='final'?C.final.mcq:(C.quizzes.find(q=>q.id===id)||{}).qs;
function streak(){let n=0;const d=new Date();if(!S.d.days[dayKey(d)])d.setDate(d.getDate()-1);while(S.d.days[dayKey(d)]){n++;d.setDate(d.getDate()-1)}return n}
function week(){if(!S.d.start)return null;const s=new Date(S.d.start+'T00:00:00');if(isNaN(s))return null;const w=Math.floor((Date.now()-s.getTime())/6048e5)+1;return w<1?0:w}
function stats(){
 const cs=CourseApp.state.storage,ps=P.store.d,done=Object.keys(cs.completed).length;
 let seen=0,total=0,right=0,tried=0,tasks=0;const per=[];
 for(let l=1;l<=16;l++){const t=ps.total[l]||FALLBACK[l-1],s=Math.min(Object.keys(ps.seen[l]||{}).length,t);seen+=s;total+=t;per.push({l,s,t,done:!!cs.completed[l]});
  const q=ps.quiz[l]||{};for(const k in q){tried++;if(q[k])right++}
  const tk=ps.tasks[l]||{};for(const k in tk)if(tk[k])tasks++}
 Object.values(cs.quizScores||{}).forEach(x=>{if(x){tried++;if(x.correct)right++}});
 const as=assessStore().quiz||{};
 for(const id in as){const qs=assessQs(id);if(!qs)continue;for(const i in as[id]){if(!qs[i])continue;tried++;if(as[id][i]===qs[i][2])right++}}
 tried+=S.d.hub.t;right+=S.d.hub.r;
 const labs=Object.keys(S.d.labs).length,xp=done*100+seen*3+right*10+tasks*25+labs*20+S.d.xp;
 const lvl=Math.min(D.levels.length,Math.floor(xp/450)+1),into=xp-(lvl-1)*450;
 return{done,seen,total,right,tried,tasks,labs,xp,lvl,lvlPct:lvl>=D.levels.length?100:Math.round(into/450*100),toNext:Math.max(0,450-into),
  pct:Math.round((done/16*.5+(total?seen/total:0)*.5)*100),per,acc:tried?Math.round(right/tried*100):null,streak:streak()};
}
function badges(st){const w=S.d.wrong;return[
 ['🚀','First steps','Open your first slide',st.seen>0],
 ['📘','Lecture one done','Complete any lecture',st.done>=1],
 ['🧱','Halfway','Complete 8 lectures',st.done>=8],
 ['🏁','Course complete','Complete all 16 lectures',st.done>=16],
 ['👀','Slide explorer','View 150 slides',st.seen>=150],
 ['🎯','Sharp shooter','80% accuracy over 30 answers',st.tried>=30&&st.acc>=80],
 ['🧪','Lab scientist','Try 5 labs',st.labs>=5],
 ['🛠️','Hands on','Finish 5 practical tasks',st.tasks>=5],
 ['🔥','3-day streak','Study 3 days in a row',st.streak>=3],
 ['⚡','7-day streak','Study 7 days in a row',st.streak>=7],
 ['🧹','Clean slate','Answer 10 hub questions with no mistakes left',S.d.hub.t>=10&&!Object.keys(w).length],
 ['⭐','Level 5','Reach level 5',st.lvl>=5]]}

/* ---------- small effects ---------- */
function confetti(){if(reduce)return;const c=document.createElement('canvas');c.className='confetti';document.body.appendChild(c);const x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
 const cols=['#2563eb','#06b6d4','#22d3ee','#f59e0b','#10b981','#a78bfa'];
 const ps=Array.from({length:110},()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*.5,vx:(Math.random()-.5)*3,vy:2.5+Math.random()*4,s:5+Math.random()*7,r:Math.random()*6,c:cols[Math.random()*cols.length|0]}));
 let t=0;const kill=setTimeout(()=>c.remove(),5000);
 (function f(){x.clearRect(0,0,c.width,c.height);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=.12;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6);x.restore()});if(++t<190)requestAnimationFrame(f);else{clearTimeout(kill);c.remove()}})()}
function countUp(root){$$('[data-count]',root).forEach(e=>{const to=+e.dataset.count,suf=e.dataset.suf||'';const fin=()=>{e.textContent=to+suf};if(reduce||!to){fin();return}
 const t0=performance.now();(function f(t){const k=Math.min(1,(t-t0)/800);e.textContent=Math.round(to*(1-Math.pow(1-k,3)))+suf;if(k<1)requestAnimationFrame(f)})(t0);setTimeout(fin,1000)})}
function ring(pct,label,sub){const r=52,c=2*Math.PI*r;return'<div class="ring" role="img" aria-label="'+esc(label)+' '+pct+'%"><svg viewBox="0 0 120 120"><defs><linearGradient id="rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b82f6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><circle class="rg-bg" cx="60" cy="60" r="'+r+'"/><circle class="rg-fg" cx="60" cy="60" r="'+r+'" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+c.toFixed(1)+'" data-off="'+(c*(1-pct/100)).toFixed(1)+'"/></svg><div class="ring-in"><b data-count="'+pct+'" data-suf="%">'+pct+'%</b><small>'+esc(sub||'')+'</small></div></div>'}
function runRings(root){const go=()=>$$('.rg-fg',root).forEach(e=>{e.style.strokeDashoffset=e.dataset.off});if(reduce)go();else{requestAnimationFrame(()=>requestAnimationFrame(go));setTimeout(go,400)}}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function copy(text){const done=()=>toast('Copied');if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(text).then(done,()=>{});else{const t=document.createElement('textarea');t.value=text;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}t.remove()}}

/* ---------- shell ---------- */
const VIEWS=['learn','quiz','labs','modern','sheets','me'];
const TITLES={home:'MAD Course',learn:'Lectures',quiz:'Practice',labs:'Labs',modern:'Android in 2026',sheets:'Resources',me:'Profile',outline:'Course outline',assessments:'Assessments',glossary:'Glossary',flashcards:'Flashcards',bookmarks:'Bookmarks',practice:'Lecture check',results:'Quiz results',certificate:'Certificate'};
const TAB={home:'home',learn:'learn',course:'learn',quiz:'quiz',practice:'quiz',flashcards:'quiz',results:'quiz',assessments:'quiz',labs:'labs'};
let sub=[],depth=0,installEvt=null;
const R={};

function shell(){
 document.body.classList.add('portal');if(inApp)document.body.classList.add('in-app');
 let prev=$('#assessments-view')||$('#certificate-view');
 VIEWS.forEach(v=>{const s=document.createElement('section');s.className='view tool-view portal-page';s.id=v+'-view';s.hidden=true;prev.after(s);prev=s});
 // Learn tab: the lecture library moves out of the home page into its own screen
 const grid=$('#lecture-grid-section'),learn=$('#learn-view');
 learn.innerHTML='<div class="pp-head"><span class="eyebrow">Lecture library</span><h1>Sixteen lectures</h1><p>Read a lecture, present it as slides, or let Watch mode play it.</p></div><div class="learn-tools"><input type="search" id="learn-search" class="tool-search" placeholder="Search lectures…" aria-label="Search lectures"><div class="seg" id="learn-filter" role="group" aria-label="Filter lectures"><button type="button" class="on" data-f="all">All</button><button type="button" data-f="todo">To do</button><button type="button" data-f="doing">In progress</button><button type="button" data-f="done">Done</button></div></div><p class="pp-empty" id="learn-empty" hidden>No lecture matches.</p>';
 if(grid){const h=$('.section-heading',grid);if(h)h.hidden=true;grid.classList.add('learn-grid');learn.appendChild(grid)}
 $('#learn-search').addEventListener('input',filterLearn);
 $('#learn-filter').addEventListener('click',e=>{const b=e.target.closest('[data-f]');if(!b)return;$$('#learn-filter button').forEach(x=>x.classList.toggle('on',x===b));filterLearn()});
 // Home: dashboard replaces the marketing hero
 const home=$('#home-view'),dash=document.createElement('div');dash.id='dash';dash.className='dash';home.prepend(dash);
 const hero=$('.hero',home);if(hero)hero.hidden=true;const sg=$('.stat-grid',home);if(sg)sg.parentNode.hidden=true;
 // Top bar
 const brand=$('.topbar .brand');
 if(brand)brand.insertAdjacentHTML('afterend','<button type="button" class="icon-button app-back" id="app-back" aria-label="Back">'+IC.back+'</button><strong class="app-title" id="app-title"></strong>');
 const nav=$('.desktop-nav');
 if(nav)nav.innerHTML=[['home','Home'],['learn','Lectures'],['quiz','Practice'],['labs','Labs'],['outline','Outline'],['assessments','Assessments'],['sheets','Resources']].map(([v,t])=>'<button class="nav-link" data-view="'+v+'">'+t+'</button>').join('');
 const tm=$('.top-tools-menu');
 if(tm){tm.innerHTML=[['glossary','Glossary'],['flashcards','Flashcards'],['practice','Lecture check'],['results','Quiz results'],['bookmarks','Bookmarks'],['certificate','Certificate'],['modern','Android in 2026'],['me','Profile & settings']].map(([v,t])=>'<button data-view="'+v+'">'+t+'</button>').join('');const sm=$('.top-tools summary');if(sm)sm.textContent='More'}
 const help=$('#help-trigger');if(help)help.insertAdjacentHTML('afterend','<button type="button" class="icon-button me-btn" data-view="me" aria-label="Profile">'+IC.me+'</button>');
 const mb=$('.mobile-bottom');
 if(mb){mb.innerHTML=TABS.map(([v,t,ic])=>'<button type="button" data-view="'+v+'" data-tab="'+v+'">'+IC[ic]+'<span>'+t+'</span></button>').join('');mb.addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;haptic(8);if(b.classList.contains('on'))window.scrollTo({top:0,behavior:reduce?'auto':'smooth'})})}
 $('#app-back').addEventListener('click',()=>{haptic(8);if(depth>0){depth-=2;history.back()}else location.hash='home'});
 window.addEventListener('hashchange',()=>{depth++});

 const show=CourseApp.showView,route=CourseApp.route,showLecture=CourseApp.showLecture,toggle=CourseApp.toggleComplete;
 CourseApp.showView=function(view){show.call(this,view);VIEWS.forEach(v=>{const el=$('#'+v+'-view');if(el)el.hidden=view!==v});after(view)};
 CourseApp.route=function(initial){
  const h=decodeURIComponent((location.hash||'').slice(1)),parts=h.split('/'),b=parts[0]==='lectures'?'learn':parts[0];
  stopQuiz();
  if(VIEWS.includes(b)){if(P.hide)P.hide();sub=parts.slice(1);this.showView(b);return}
  sub=[];return route.call(this,initial)};
 CourseApp.showLecture=function(n,initial){const r=showLecture.call(this,n,initial);const t=$('#app-title');if(t&&this.state.view==='course')t.textContent='Lecture '+pad(n);return r};
 CourseApp.toggleComplete=function(n){const was=!!this.state.storage.completed[n];toggle.call(this,n);if(!was&&this.state.storage.completed[n]){haptic(30);confetti()}};
 // Android status bar follows the site theme
 const syncTheme=()=>{const n=NV();if(n&&n.setTheme)n.setTheme(document.documentElement.dataset.theme==='dark')};
 new MutationObserver(syncTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});syncTheme();
 window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;$$('[data-install]').forEach(b=>b.hidden=false)});
 if('serviceWorker' in navigator&&location.protocol==='https:'&&!inApp&&!/localhost|127\.0\.0\.1/.test(location.hostname))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
 CourseApp.route(true);
 loadDecks().then(()=>{if(CourseApp.state.view==='home')renderHome()});
}
function after(view){
 document.body.dataset.pv=view;
 const tab=TAB[view]||'me';$$('.mobile-bottom [data-tab]').forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
 $$('.desktop-nav .nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===view||(view==='course'&&b.dataset.view==='learn')));
 const t=$('#app-title');if(t)t.textContent=view==='course'?'Lecture '+pad(CourseApp.state.currentLecture):TITLES[view]||'MAD Course';
 const el=view==='home'?$('#home-view'):view==='course'?null:$('#'+view+'-view');
 if(el&&!reduce){el.classList.remove('pv-in');void el.offsetWidth;el.classList.add('pv-in')}
 if(view==='home')renderHome();else if(R[view])R[view]();
}

/* ---------- Home dashboard ---------- */
function greet(){const h=new Date().getHours();return h<5?'Good night':h<12?'Good morning':h<17?'Good afternoon':h<21?'Good evening':'Good night'}
function contTarget(){const cs=CourseApp.state.storage,last=P.store.d.last;
 if(last&&last.l&&!cs.completed[last.l]){const t=P.store.d.total[last.l]||FALLBACK[last.l-1];return{l:last.l,s:last.s,t,resume:true}}
 for(let l=1;l<=16;l++)if(!cs.completed[l])return{l,s:P.store.d.slide[l]||0,t:P.store.d.total[l]||FALLBACK[l-1],resume:!!P.store.d.slide[l]};
 return null}
function upcoming(w){const rows=[].concat(C.assignments.map(a=>({w:a.week,id:a.id,t:'Assignment '+a.n,s:a.title,c:'as'})),C.quizzes.map(q=>({w:q.week,id:q.id,t:'Quiz '+q.n,s:q.title,c:'qz'})),[{w:9,id:'mid',t:'Mid-term',s:'Mock exam with model answers',c:'ex'},{w:16,id:'project',t:'Project evaluation',s:'Group app demo',c:'ex'},{w:17,id:'final',t:'Final term',s:'Mock exam with model answers',c:'ex'}]).sort((a,b)=>a.w-b.w);
 const from=w&&w>0?w:1;const next=rows.filter(r=>r.w>=from);return(next.length?next:rows.slice(-2)).slice(0,3)}
function qotdPool(){const out=[];if(typeof QUIZZES!=='undefined')QUIZZES.forEach((q,i)=>out.push({l:i+1,q:q.q,o:q.o,a:q.a,e:q.e}));C.quizzes.forEach(z=>z.qs.forEach(q=>out.push({l:0,q:q[0],o:q[1],a:q[2],e:q[3]})));return out}
function phoneMock(){return'<div class="mock" aria-hidden="true"><div class="mock-phone"><i class="mock-notch"></i><div class="mock-bar"><span>My First App</span></div><div class="mock-body"><div class="mock-tv"><span>Hello, Android!</span></div><div class="mock-et"></div><div class="mock-btn">SAVE</div><div class="mock-list"><i></i><i></i><i></i></div><div class="mock-toast">Saved ✓</div></div></div><div class="mock-code"><span>&lt;TextView</span><span>&nbsp;&nbsp;android:text=<b>"Hello"</b></span><span>&lt;Button</span><span>btn.setOnClickListener { }</span></div></div>'}
function renderHome(){
 const box=$('#dash');if(!box)return;const st=stats(),w=week(),ct=contTarget(),name=S.d.name.trim().split(/\s+/)[0];
 const date=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'});
 let wk='';
 if(w===null)wk='<p class="d-sub">Add your semester start date in <a href="#me">Profile</a> to see this week’s topics here.</p>';
 else if(w===0)wk='<p class="d-sub">Your semester has not started yet. Look around and get ready.</p>';
 else if(w>17)wk='<p class="d-sub">The 17-week semester is over. Well done. Everything stays here for revision.</p>';
 else wk='<p class="d-sub"><b>Week '+w+' of 17</b> · '+Math.round(w/17*100)+'% of the semester</p>';
 // this week card
 let weekCard='';const W=w&&w>=1&&w<=17?C.weeks.find(x=>x.w===w):null;
 if(W){const SP={'revision-mid':['🔁','Revision week','Revise Weeks 1–7 and try the mid-term mock exam.','mid'],mid:['🖊️','Mid-term week','Covers Lectures 1–10. Use the mock exam and the revision list.','mid'],project:['🚀','Project evaluation','Present your app. Check it against the rubric first.','project'],final:['🎓','Final-term week','Covers all 16 lectures. Use the final mock exam.','final']}[W.special];
  weekCard='<section class="d-card d-week"><header><span class="eyebrow">This week · Week '+w+'</span>'+(W.act?'<a class="co-badge '+(W.act[0]==='A'?'as':'qz')+'" href="#assessments" data-jump="'+(W.act[0]==='A'?'a':'q')+W.act.split('-')[1]+'">'+esc(W.act)+' due</a>':'')+'</header>'+
   (SP?'<h2>'+SP[0]+' '+SP[1]+'</h2><p>'+SP[2]+'</p><a class="present-btn" href="#assessments" data-jump="'+SP[3]+'">Open →</a>':
   '<h2>'+W.lec.map(n=>'<a href="#lecture-'+n+'">L'+pad(n)+' '+esc(lecTitle(n))+'</a>').join('<br>')+'</h2><ul class="d-topics">'+W.topics.slice(0,6).map(t=>'<li>'+esc(t[0])+'</li>').join('')+(W.topics.length>6?'<li class="more">+'+(W.topics.length-6)+' more</li>':'')+'</ul><a class="text-link" href="#outline">See the full week in the outline →</a>')+'</section>';
 }else{const todo=st.per.filter(p=>!p.done).slice(0,3);
  weekCard='<section class="d-card d-week"><header><span class="eyebrow">Up next</span></header>'+(todo.length?'<ul class="d-next">'+todo.map(p=>'<li><a href="#lecture-'+p.l+'"><b>'+pad(p.l)+'</b><span>'+esc(lecTitle(p.l))+'<small>'+p.s+' / '+p.t+' slides seen</small></span>'+IC.chev+'</a></li>').join('')+'</ul>':'<h2>All 16 lectures complete 🎉</h2><p>Collect your certificate and keep practising.</p><a class="present-btn" href="#certificate">Certificate →</a>')+'</section>';}
 // question of the day
 const qp=qotdPool(),qd=qp.length?qp[dayNo()%qp.length]:null,qa=S.d.qotd.d===today()?S.d.qotd.j:undefined;
 const qCard=qd?'<section class="d-card d-qotd"><header><span class="eyebrow">Question of the day</span>'+(qd.l?'<span class="lec-chip">L'+pad(qd.l)+'</span>':'')+'</header><h2>'+md(qd.q)+'</h2><div class="d-opts">'+qd.o.map((o,j)=>'<button type="button" class="cq-o'+(qa!==undefined?(j===qd.a?' right':j===qa?' wrong':''):'')+'" data-qotd="'+j+'"'+(qa!==undefined?' disabled':'')+'><b>'+'ABCD'[j]+'</b><span>'+md(o)+'</span></button>').join('')+'</div><p class="d-fb" aria-live="polite">'+(qa!==undefined?(qa===qd.a?'✓ Correct. ':'✗ Answer: '+'ABCD'[qd.a]+'. ')+md(qd.e||''):'')+'</p></section>':'';
 const up=upcoming(w),tip=D.tips[dayNo()%D.tips.length],bd=badges(st),got=bd.filter(b=>b[3]).length;
 const tiles=[['learn','📚','Lectures',st.done+' of 16 done'],['quiz','🎯','Practice',st.acc===null?'Start a quiz':st.acc+'% accuracy'],['labs','🧪','Labs','Simulators'],['outline','📅','Outline','17 weeks'],['assessments','📝','Assessments','Quizzes & exams'],['sheets','🗂️','Resources','Cheat sheets'],['flashcards','🃏','Flashcards','Key terms'],['modern','✨','Android 2026','What changed']];
 box.innerHTML=
 '<section class="d-hero"><i class="blob b1"></i><i class="blob b2"></i><div class="d-hello"><small>'+esc(date)+'</small><h1>'+greet()+(name?', '+esc(name):'')+' <span class="wave" aria-hidden="true">👋</span></h1>'+wk+
  '<div class="d-cta">'+(ct?'<button type="button" class="primary-button" data-continue>'+(ct.resume?'Continue Lecture '+pad(ct.l):'Start Lecture '+pad(ct.l))+' →</button>':'<a class="primary-button" href="#certificate">Get your certificate →</a>')+'<button type="button" class="secondary-button" data-view="quiz">Quick quiz</button></div></div>'+
  '<div class="d-ringbox">'+ring(st.pct,'Course progress','complete')+'<p><b>'+st.done+'</b> / 16 lectures<br><b>'+st.seen+'</b> / '+st.total+' slides</p></div>'+phoneMock()+'</section>'+
 '<section class="d-stats"><div class="d-stat"><span class="ico">🔥</span><b data-count="'+st.streak+'">'+st.streak+'</b><small>day streak</small></div><div class="d-stat lvl"><span class="ico">⭐</span><b>Level '+st.lvl+'</b><small>'+esc(D.levels[st.lvl-1])+' · <span data-count="'+st.xp+'" data-suf=" XP">'+st.xp+' XP</span></small><i class="bar"><u style="width:'+st.lvlPct+'%"></u></i></div><div class="d-stat"><span class="ico">🎯</span><b>'+(st.acc===null?'—':'<span data-count="'+st.acc+'" data-suf="%">'+st.acc+'%</span>')+'</b><small>quiz accuracy</small></div><div class="d-stat"><span class="ico">🏅</span><b data-count="'+got+'">'+got+'</b><small>of '+bd.length+' badges</small></div></section>'+
 '<div class="d-grid">'+
  (ct?'<section class="d-card d-cont"><header><span class="eyebrow">'+(ct.resume?'Continue where you stopped':'Next lecture')+'</span></header><h2>Lecture '+pad(ct.l)+' · '+esc(lecTitle(ct.l))+'</h2><div class="slide-meter"><i><b style="width:'+Math.round(Math.min(ct.s+1,ct.t)/ct.t*100)+'%"></b></i><span>slide '+Math.min(ct.s+1,ct.t)+' of '+ct.t+'</span></div><div class="d-actions"><a class="present-btn" href="#present/'+ct.l+'/'+(ct.s+1)+'">▶ '+(ct.resume?'Resume slides':'Start slides')+'</a><a class="secondary-button" href="#lecture-'+ct.l+'">Read lecture</a></div></section>':'')+
  weekCard+qCard+
  '<section class="d-card d-up"><header><span class="eyebrow">Coming assessments</span><a class="text-link" href="#assessments">All →</a></header><ul>'+up.map(r=>'<li><a href="#assessments" data-jump="'+r.id+'" class="'+r.c+'"><b>W'+r.w+'</b><span>'+esc(r.t)+'<small>'+esc(r.s)+'</small></span>'+(w&&w>0&&r.w>=w?'<em>'+(r.w===w?'this week':'in '+(r.w-w)+' wk')+'</em>':'')+'</a></li>').join('')+'</ul></section>'+
  '<section class="d-card d-tiles"><header><span class="eyebrow">Go to</span></header><div class="tiles">'+tiles.map(t=>'<button type="button" data-view="'+t[0]+'"><span class="ico">'+t[1]+'</span><b>'+t[2]+'</b><small>'+esc(t[3])+'</small></button>').join('')+'</div></section>'+
  '<section class="d-card d-tip"><header><span class="eyebrow">Tip of the day · '+esc(tip[0])+'</span></header><p>'+md(tip[1])+'</p></section>'+
  '<section class="d-card d-badges"><header><span class="eyebrow">Badges</span><a class="text-link" href="#me">Profile →</a></header><div class="badges">'+bd.map(b=>'<span class="badge'+(b[3]?' on':'')+'" title="'+esc(b[2])+'"><i>'+b[0]+'</i>'+esc(b[1])+'</span>').join('')+'</div></section>'+
  (inApp?'':'<section class="d-card d-app"><header><span class="eyebrow">Take it with you</span></header><h2>📱 MAD Course for Android</h2><p>The whole course offline, with fullscreen slides and a real back button.</p><div class="d-actions"><a class="present-btn" href="'+esc(D.apk)+'" rel="noopener">Download APK</a><button type="button" class="secondary-button" data-install hidden>Install web app</button></div></section>')+
 '</div>';
 if(installEvt)$$('[data-install]',box).forEach(b=>b.hidden=false);
 countUp(box);runRings(box);
}
document.addEventListener('click',e=>{
 if(e.target.closest('[data-continue]')){const ct=contTarget();if(ct)location.hash='present/'+ct.l+'/'+(ct.s+1);return}
 const q=e.target.closest('[data-qotd]');if(q){const qp=qotdPool(),qd=qp[dayNo()%qp.length],j=+q.dataset.qotd;S.d.qotd={d:today(),j};S.d.hub.t++;if(j===qd.a)S.d.hub.r++;S.save();haptic(j===qd.a?12:40);renderHome();return}
 const ins=e.target.closest('[data-install]');if(ins&&installEvt){installEvt.prompt();installEvt=null;return}
 const cp=e.target.closest('[data-copy-text]');if(cp){copy(cp.dataset.copyText);return}
});

/* ---------- Learn ---------- */
function filterLearn(){const q=($('#learn-search').value||'').toLowerCase().trim(),f=($('#learn-filter .on')||{dataset:{f:'all'}}).dataset.f,st=stats();let n=0;
 $$('#learn-view [data-lecture-card]').forEach(c=>{const p=st.per[+c.dataset.lectureCard-1],state=p.done?'done':p.s>0?'doing':'todo';const ok=(f==='all'||f===state)&&(!q||c.textContent.toLowerCase().includes(q));c.hidden=!ok;if(ok)n++;c.classList.add('visible')});
 $('#learn-empty').hidden=n>0}
R.learn=filterLearn;

/* ---------- Practice hub ---------- */
let POOL=null,Q=null;
const qid=s=>{let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return'q'+(h>>>0).toString(36)};
async function pool(){if(POOL)return POOL;await loadDecks();const out=[];
 if(typeof QUIZZES!=='undefined')QUIZZES.forEach((q,i)=>out.push({l:i+1,q:q.q,o:q.o,a:q.a,e:q.e}));
 C.quizzes.forEach(z=>z.qs.forEach(q=>out.push({l:0,cov:z.covers,q:q[0],o:q[1],a:q[2],e:q[3]})));
 ['mid','final'].forEach(k=>C[k].mcq.forEach(q=>out.push({l:0,cov:C[k].covers,q:q[0],o:q[1],a:q[2],e:q[3]})));
 for(let l=1;l<=16;l++)(decks[l]||[]).forEach(s=>{if(s.kind==='quiz')out.push({l,q:s.q,o:s.o,a:s.a,e:s.e||''})});
 const seen={};POOL=out.filter(q=>{q.id=qid(plain(q.q));if(seen[q.id])return false;seen[q.id]=1;return true});return POOL}
const MODES={quick:{t:'Quick 10',ic:'⚡',d:'Ten random questions from the whole course.',n:10},
 mid:{t:'Mid-term drill',ic:'🖊️',d:'15 questions from Lectures 1–10.',n:15},
 final:{t:'Final drill',ic:'🎓',d:'20 questions from all 16 lectures with a 20-minute timer.',n:20,timer:1200},
 wrong:{t:'My mistakes',ic:'🔁',d:'Only the questions you got wrong. They leave the list when you get them right.'},
 lec:{t:'Lecture drill',ic:'📘',d:'Every question for one lecture.'}};
function stopQuiz(){if(Q&&Q.tm){clearInterval(Q.tm);Q.tm=null}}
function hub(){
 const v=$('#quiz-view'),st=stats(),wrong=Object.keys(S.d.wrong).length,best=S.d.best;
 const card=(k,extra)=>{const m=MODES[k];return'<a class="hub-card" href="#quiz/'+k+'"><span class="ico">'+m.ic+'</span><b>'+m.t+'</b><p>'+m.d+'</p><small>'+(extra||(best[k]!==undefined?'Best: '+best[k]+'%':'Not tried yet'))+'</small></a>'};
 v.innerHTML='<div class="pp-head"><span class="eyebrow">Practice</span><h1>Test yourself</h1><p>Every answer is explained. Scores stay on this device.</p></div>'+
 '<section class="d-stats"><div class="d-stat"><span class="ico">🎯</span><b>'+(st.acc===null?'—':st.acc+'%')+'</b><small>accuracy</small></div><div class="d-stat"><span class="ico">✅</span><b>'+st.right+'</b><small>correct answers</small></div><div class="d-stat"><span class="ico">🔁</span><b>'+wrong+'</b><small>to review</small></div><div class="d-stat"><span class="ico">⭐</span><b>'+st.xp+'</b><small>XP</small></div></section>'+
 '<div class="hub-grid">'+card('quick')+card('mid')+card('final')+card('wrong',wrong?wrong+' question'+(wrong>1?'s':'')+' waiting':'Nothing to review 🎉')+
  '<a class="hub-card" href="#quiz/viva"><span class="ico">🎤</span><b>Viva questions</b><p>'+D.viva.length+' oral-exam questions with model answers.</p><small>'+Object.values(S.d.viva).filter(x=>x===1).length+' marked “knew it”</small></a>'+
  '<a class="hub-card" href="#flashcards"><span class="ico">🃏</span><b>Flashcards</b><p>Flip through the key terms of the course.</p><small>Glossary terms</small></a>'+
  '<a class="hub-card" href="#assessments"><span class="ico">📝</span><b>Outline quizzes & mock exams</b><p>Quiz 1–4, mid-term and final, in their outline weeks.</p><small>With model answers</small></a>'+
  '<a class="hub-card" href="#practice"><span class="ico">☑️</span><b>Lecture check</b><p>One key question for every lecture.</p><small>16 questions</small></a></div>'+
 '<h2 class="pp-h">Drill one lecture</h2><div class="lec-pick">'+Array.from({length:16},(_,i)=>'<a href="#quiz/lec/'+(i+1)+'" title="'+esc(lecTitle(i+1))+'"><b>'+pad(i+1)+'</b><span>'+esc(lecTitle(i+1))+'</span></a>').join('')+'</div>';
}
async function startQuiz(mode,arg){
 const v=$('#quiz-view');v.innerHTML='<p class="pp-load">Preparing questions…</p>';const all=await pool();
 if(CourseApp.state.view!=='quiz'||sub[0]!==mode)return;
 let qs;const m=MODES[mode]||MODES.quick;
 if(mode==='wrong')qs=all.filter(q=>S.d.wrong[q.id]);
 else if(mode==='lec')qs=all.filter(q=>q.l===+arg);
 else if(mode==='mid'){const set=new Set(C.mid.covers);qs=all.filter(q=>q.l?set.has(q.l):q.cov.every(x=>set.has(x)))}
 else qs=all.slice();
 shuffle(qs);if(m.n)qs=qs.slice(0,m.n);
 if(!qs.length){v.innerHTML='<div class="pp-head"><h1>'+m.t+'</h1></div><p class="pp-empty">'+(mode==='wrong'?'No mistakes to review. Take a quiz first.':'No questions found.')+'</p><a class="present-btn" href="#quiz">← Practice</a>';return}
 Q={mode,arg,m,qs,i:0,right:0,ans:[],left:m.timer||0,tm:null};
 if(m.timer)Q.tm=setInterval(()=>{Q.left--;const t=$('#qz-timer');if(t)t.textContent=pad(Math.floor(Q.left/60))+':'+pad(Q.left%60);if(Q.left<=0)finishQuiz()},1000);
 drawQ();
}
function drawQ(){
 const v=$('#quiz-view'),q=Q.qs[Q.i],title=Q.mode==='lec'?'Lecture '+pad(+Q.arg)+' drill':Q.m.t;
 v.innerHTML='<div class="qz"><div class="qz-top"><a class="icon-button" href="#quiz" aria-label="Quit quiz">✕</a><div class="qz-bar"><span style="width:'+(Q.i/Q.qs.length*100)+'%"></span></div><span class="qz-n">'+(Q.i+1)+' / '+Q.qs.length+'</span>'+(Q.m.timer?'<span class="qz-timer" id="qz-timer">'+pad(Math.floor(Q.left/60))+':'+pad(Q.left%60)+'</span>':'')+'</div>'+
 '<article class="qz-card"><span class="eyebrow">'+esc(title)+(q.l?' · Lecture '+pad(q.l):'')+'</span><h2>'+md(q.q)+'</h2><div class="qz-opts">'+q.o.map((o,j)=>'<button type="button" class="cq-o" data-ans="'+j+'"><b>'+'ABCD'[j]+'</b><span>'+md(o)+'</span></button>').join('')+'</div><p class="qz-fb" aria-live="polite"></p><button type="button" class="primary-button qz-next" hidden>'+(Q.i===Q.qs.length-1?'See result':'Next question')+' →</button></article></div>';
 window.scrollTo(0,0);
}
function answer(j){const q=Q.qs[Q.i];if(Q.ans[Q.i]!==undefined)return;Q.ans[Q.i]=j;const ok=j===q.a;if(ok){Q.right++;delete S.d.wrong[q.id]}else S.d.wrong[q.id]=1;S.d.hub.t++;if(ok)S.d.hub.r++;S.save();haptic(ok?12:45);
 $$('#quiz-view [data-ans]').forEach((b,k)=>{b.disabled=true;b.classList.toggle('right',k===q.a);b.classList.toggle('wrong',k===j&&!ok)});
 const fb=$('#quiz-view .qz-fb');fb.className='qz-fb '+(ok?'ok':'no');fb.innerHTML=(ok?'✓ Correct. ':'✗ The answer is '+'ABCD'[q.a]+'. ')+md(q.e||'');
 const nx=$('#quiz-view .qz-next');nx.hidden=false;nx.focus({preventScroll:true})}
function finishQuiz(){
 stopQuiz();const n=Q.qs.length,pct=Math.round(Q.right/n*100),key=Q.mode==='lec'?'lec'+Q.arg:Q.mode,prev=S.d.best[key];
 if(prev===undefined||pct>prev)S.d.best[key]=pct;const bonus=pct>=80?30:pct>=50?10:0;S.d.xp+=bonus;S.save();
 const v=$('#quiz-view'),msg=pct>=80?'Excellent work!':pct>=50?'Good. Review the ones you missed.':'Keep going. Read the explanations and try again.';
 v.innerHTML='<div class="qz-done"><div class="qz-score">'+ring(pct,'Score','score')+'</div><h1>'+Q.right+' / '+n+'</h1><p>'+msg+'</p><p class="qz-xp">+'+(Q.right*10+bonus)+' XP'+(prev!==undefined&&pct>prev?' · new best':'')+'</p><div class="d-actions"><a class="present-btn" href="#quiz">Practice home</a><button type="button" class="secondary-button" data-again>Try again</button></div>'+
 '<h2 class="pp-h">Review</h2><ol class="qz-review">'+Q.qs.map((q,i)=>{const a=Q.ans[i],ok=a===q.a;return'<li class="'+(ok?'ok':'no')+'"><p>'+md(q.q)+'</p><small>'+(a===undefined?'Not answered. ':'Your answer: '+md(q.o[a])+'. ')+(ok?'':'Correct: <b>'+md(q.o[q.a])+'</b>. ')+md(q.e||'')+'</small></li>'}).join('')+'</ol></div>';
 countUp(v);runRings(v);window.scrollTo(0,0);if(pct>=80){confetti();haptic(40)}
}
function viva(arg){
 const v=$('#quiz-view'),l=+arg||0,items=D.viva.map((x,i)=>({i,l:x[0],q:x[1],a:x[2]})).filter(x=>!l||x.l===l),knew=items.filter(x=>S.d.viva[x.i]===1).length;
 v.innerHTML='<div class="pp-head"><span class="eyebrow">Oral exam practice</span><h1>Viva questions</h1><p>Say the answer aloud first, then check it. '+knew+' of '+items.length+' marked “knew it”.</p></div>'+
 '<div class="chip-scroll"><a class="'+(l?'':'on')+'" href="#quiz/viva">All</a>'+Array.from({length:16},(_,i)=>'<a class="'+(l===i+1?'on':'')+'" href="#quiz/viva/'+(i+1)+'">L'+pad(i+1)+'</a>').join('')+'</div>'+
 '<div class="viva">'+items.map(x=>'<details class="viva-q'+(S.d.viva[x.i]===1?' knew':S.d.viva[x.i]===2?' again':'')+'" data-v="'+x.i+'"><summary><span class="lec-chip">L'+pad(x.l)+'</span><b>'+md(x.q)+'</b></summary><p>'+md(x.a)+'</p><div class="viva-rate"><button type="button" data-vr="1">✓ I knew it</button><button type="button" data-vr="2">↻ Revise again</button></div></details>').join('')+'</div>';
}
R.quiz=()=>{const m=sub[0];if(!m)hub();else if(m==='viva')viva(sub[1]);else if(MODES[m])startQuiz(m,sub[1]);else hub()};
document.addEventListener('click',e=>{
 const a=e.target.closest('#quiz-view [data-ans]');if(a&&Q){answer(+a.dataset.ans);return}
 if(e.target.closest('#quiz-view .qz-next')&&Q){if(Q.i>=Q.qs.length-1)finishQuiz();else{Q.i++;drawQ()}return}
 if(e.target.closest('#quiz-view [data-again]')&&Q){startQuiz(Q.mode,Q.arg);return}
 const vr=e.target.closest('[data-vr]');if(vr){const d=vr.closest('.viva-q'),k=+vr.dataset.vr;S.d.viva[d.dataset.v]=k;S.save();d.classList.toggle('knew',k===1);d.classList.toggle('again',k===2);d.open=false;haptic(10)}
});

/* ---------- Resources ---------- */
const RTABS=[['cheat','Cheat sheets'],['errors','Error fixes'],['projects','Project ideas'],['links','Links']];
R.sheets=()=>{
 const v=$('#sheets-view'),tab=RTABS.some(t=>t[0]===sub[0])?sub[0]:'cheat';let body='';
 if(tab==='cheat'){const sh=D.sheets.find(s=>s.id===sub[1])||D.sheets[0];
  body='<div class="chip-scroll">'+D.sheets.map(s=>'<a class="'+(s===sh?'on':'')+'" href="#sheets/cheat/'+s.id+'">'+s.ic+' '+esc(s.t)+'</a>').join('')+'</div><p class="pp-note">'+esc(sh.s)+'. Tap a line to copy it.</p>'+
  sh.g.map(g=>'<section class="sheet" data-find><h2>'+esc(g.h)+'</h2><div class="sheet-rows">'+g.r.map(r=>'<button type="button" class="sheet-row" data-copy-text="'+esc(r[0])+'" data-find-row><code>'+esc(r[0])+'</code><span>'+md(r[1])+'</span></button>').join('')+'</div></section>').join('')}
 else if(tab==='errors')body='<p class="pp-note">'+D.errors.length+' errors students meet most often, with the cause and the fix.</p><div class="errs">'+D.errors.map(x=>'<details class="err" data-find-row><summary><code>'+esc(x[0])+'</code><a class="lec-chip" href="#lecture-'+x[3]+'">L'+pad(x[3])+'</a></summary><p><b>Why:</b> '+md(x[1])+'</p><p><b>Fix:</b> '+md(x[2])+'</p></details>').join('')+'</div>';
 else if(tab==='projects')body='<p class="pp-note">Ideas for the Week 16 project. Each lists the course topics it uses. Agree your choice with the instructor.</p><div class="proj-grid">'+D.projects.map(p=>'<article class="proj" data-find-row><span class="ico">'+p.ic+'</span><span class="lvl '+p.lv.toLowerCase()+'">'+esc(p.lv)+'</span><h2>'+esc(p.t)+'</h2><p>'+esc(p.d)+'</p><ul>'+p.f.map(f=>'<li>'+esc(f)+'</li>').join('')+'</ul><div class="chips">'+p.l.map(n=>'<a class="lec-chip" href="#lecture-'+n+'">L'+pad(n)+'</a>').join('')+'</div></article>').join('')+'</div><a class="present-btn" href="#assessments" data-jump="project">Project guide and rubric →</a>';
 else body='<p class="pp-note">Official documentation and tools. They open in your browser.</p><div class="links">'+D.links.map(l=>'<a href="'+esc(l[1])+'" target="_blank" rel="noopener" data-find-row><b>'+esc(l[0])+'</b><span>'+esc(l[2])+'</span><small>'+esc(l[1].replace(/^https?:\/\//,''))+'</small></a>').join('')+'</div>';
 v.innerHTML='<div class="pp-head"><span class="eyebrow">Resources</span><h1>Quick reference</h1><p>Cheat sheets, error fixes and project ideas for lab work and revision.</p></div><div class="learn-tools"><div class="seg">'+RTABS.map(t=>'<a class="'+(t[0]===tab?'on':'')+'" href="#sheets/'+t[0]+'">'+t[1]+'</a>').join('')+'</div><input type="search" class="tool-search" id="res-search" placeholder="Filter this page…" aria-label="Filter this page"></div>'+body+'<p class="pp-empty" id="res-empty" hidden>Nothing matches.</p>'+
 '<a class="wide-link" href="#modern"><span class="ico">✨</span><span><b>Android in 2026</b><small>What changed since the outline was written, with old and new code side by side.</small></span>'+IC.chev+'</a>';
 $('#res-search').addEventListener('input',e=>{const q=e.target.value.toLowerCase().trim();let n=0;$$('[data-find-row]',v).forEach(r=>{const ok=!q||r.textContent.toLowerCase().includes(q);r.hidden=!ok;if(ok)n++});$$('[data-find]',v).forEach(s=>{s.hidden=!$$('[data-find-row]',s).some(r=>!r.hidden)});$('#res-empty').hidden=n>0});
};

/* ---------- Android in 2026 ---------- */
R.modern=()=>{
 const v=$('#modern-view'),M=D.modern;
 if(v.dataset.built)return;v.dataset.built='1';
 v.innerHTML='<div class="pp-head"><span class="eyebrow">Stay current</span><h1>Android in 2026</h1><p>'+esc(M.intro)+'</p></div>'+
 '<h2 class="pp-h">The modern toolkit</h2><div class="stack-grid">'+M.stack.map(s=>'<div class="stack-card"><span class="ico">'+s[0]+'</span><b>'+esc(s[1])+'</b><p>'+esc(s[2])+'</p><small>'+esc(s[3])+'</small></div>').join('')+'</div>'+
 '<h2 class="pp-h">Course API → what teams use now</h2><p class="pp-note">The left column is what the outline teaches. Learn it first: the modern tool is built on the same idea.</p><div class="tn-table" role="table"><div class="tn-row hd" role="row"><span role="columnheader">In this course</span><span role="columnheader">Today</span><span role="columnheader">Why it changed</span></div>'+M.table.map(r=>'<div class="tn-row" role="row"><span role="cell"><code>'+esc(r[0])+'</code><small>'+esc(r[1])+'</small></span><span role="cell"><b>'+esc(r[2])+'</b></span><span role="cell">'+esc(r[3])+'</span></div>').join('')+'</div>'+
 '<h2 class="pp-h">Old and new, side by side</h2><div class="cmp-list pzv">'+M.compares.map((c,i)=>'<section class="cmp" data-cmp="'+i+'"><h3>'+esc(c.t)+'</h3><div class="cmp-two"><div><span class="pz-tag legacy">'+esc(c.l.label)+'</span></div><div><span class="pz-tag modern">'+esc(c.r.label)+'</span></div></div><p>'+md(c.n)+'</p></section>').join('')+'</div>'+
 '<p class="pp-note">Android code is shown for study. Run it in Android Studio; it does not run in the browser.</p>'+
 '<h2 class="pp-h">Publishing on Google Play today</h2><ul class="tick-list">'+M.play.map(p=>'<li>'+md(p)+'</li>').join('')+'</ul><p class="pp-note">Play policies change. Check the current rules in Play Console help before you publish.</p>'+
 '<h2 class="pp-h">Your learning path</h2><ol class="path">'+M.path.map(p=>'<li><b>'+esc(p[0])+'</b><span>'+esc(p[1])+'</span></li>').join('')+'</ol>'+
 '<a class="wide-link" href="#sheets/links"><span class="ico">🔗</span><span><b>Official documentation</b><small>Android Developers, Kotlin, Firebase and more.</small></span>'+IC.chev+'</a>';
 $$('.cmp',v).forEach(sec=>{const c=M.compares[+sec.dataset.cmp],cols=$$('.cmp-two>div',sec);cols[0].appendChild(P.codeBlock(c.l.code,c.l.lang));cols[1].appendChild(P.codeBlock(c.r.code,c.r.lang))});
};

/* ---------- Labs (assets/labs.js) ---------- */
R.labs=()=>{if(window.MADLabs)window.MADLabs.render($('#labs-view'),sub,{mark:id=>{if(!S.d.labs[id]){S.d.labs[id]=1;S.save()}},done:S.d.labs,haptic,toast,copy,loadDecks,decks,IC});else $('#labs-view').innerHTML='<p class="pp-empty">Labs could not be loaded.</p>'};

/* ---------- Profile ---------- */
const DATA_KEYS=['madCompleteCourseV1','madPresentationV1','madAssessV1',KEY];
R.me=()=>{
 const v=$('#me-view'),st=stats(),bd=badges(st),w=week(),nm=S.d.name.trim(),ini=(nm?nm.split(/\s+/).map(x=>x[0]).slice(0,2).join(''):'MA').toUpperCase(),dark=document.documentElement.dataset.theme==='dark';
 const row=(href,ic,t,s,attr)=>'<a class="me-row" href="'+href+'"'+(attr||'')+'><span class="ico">'+ic+'</span><span><b>'+t+'</b>'+(s?'<small>'+s+'</small>':'')+'</span>'+IC.chev+'</a>';
 v.innerHTML='<section class="me-card"><div class="me-avatar">'+esc(ini)+'</div><div class="me-id"><h1>'+esc(nm||'Student')+'</h1><p>'+(S.d.roll?esc(S.d.roll)+' · ':'')+'Level '+st.lvl+' · '+esc(D.levels[st.lvl-1])+'</p><i class="bar"><u style="width:'+st.lvlPct+'%"></u></i><small>'+st.xp+' XP'+(st.lvl<D.levels.length?' · '+st.toNext+' XP to level '+(st.lvl+1):' · top level')+'</small></div>'+ring(st.pct,'Course progress','course')+'</section>'+
 '<section class="d-stats"><div class="d-stat"><span class="ico">📘</span><b>'+st.done+'/16</b><small>lectures done</small></div><div class="d-stat"><span class="ico">🖼️</span><b>'+st.seen+'</b><small>of '+st.total+' slides</small></div><div class="d-stat"><span class="ico">🎯</span><b>'+(st.acc===null?'—':st.acc+'%')+'</b><small>'+st.tried+' answers</small></div><div class="d-stat"><span class="ico">🔥</span><b>'+st.streak+'</b><small>day streak</small></div><div class="d-stat"><span class="ico">🧪</span><b>'+st.labs+'</b><small>labs tried</small></div><div class="d-stat"><span class="ico">🛠️</span><b>'+st.tasks+'</b><small>tasks done</small></div></section>'+
 '<section class="d-card"><header><span class="eyebrow">Your details</span></header><div class="me-form"><label>Name<input type="text" id="me-name" maxlength="40" autocomplete="name" value="'+esc(S.d.name)+'" placeholder="Your name"></label><label>Roll number<input type="text" id="me-roll" maxlength="30" value="'+esc(S.d.roll)+'" placeholder="Optional"></label><label>Semester start date<input type="date" id="me-start" value="'+esc(S.d.start)+'"></label></div><p class="pp-note">'+(w===null?'Set the first day of Week 1 and the home page shows this week’s topics and what is due.':w===0?'The semester has not started yet.':w>17?'The semester has finished.':'You are in <b>Week '+w+'</b> of 17.')+' Details stay on this device only.</p></section>'+
 '<section class="d-card d-badges"><header><span class="eyebrow">Badges · '+bd.filter(b=>b[3]).length+' of '+bd.length+'</span></header><div class="badges big">'+bd.map(b=>'<span class="badge'+(b[3]?' on':'')+'"><i>'+b[0]+'</i><span><b>'+esc(b[1])+'</b><small>'+esc(b[2])+'</small></span></span>').join('')+'</div></section>'+
 '<section class="d-card me-list"><header><span class="eyebrow">Course</span></header>'+row('#outline','📅','Course outline','17-week plan, CLOs and books')+row('#assessments','📝','Assessments','Assignments, quizzes, mock exams, project')+row('#sheets','🗂️','Resources','Cheat sheets, error fixes, project ideas')+row('#modern','✨','Android in 2026','What changed since the outline')+row('#glossary','📖','Glossary','Every key term')+row('#bookmarks','🔖','Bookmarks','Lectures and topics you saved')+row('#results','📊','Quiz results','Lecture check attempts')+row('#certificate','🏆','Certificate','Unlocks after all 16 lectures')+'</section>'+
 '<section class="d-card me-list"><header><span class="eyebrow">Settings</span></header><button type="button" class="me-row" data-me="theme"><span class="ico">'+(dark?'🌙':'☀️')+'</span><span><b>Appearance</b><small>'+(dark?'Dark':'Light')+' theme. Tap to switch.</small></span><i class="switch'+(dark?' on':'')+'"></i></button>'+
  '<button type="button" class="me-row" data-me="backup"><span class="ico">💾</span><span><b>Back up progress</b><small>Save a file you can restore on another phone or PC.</small></span>'+IC.chev+'</button>'+
  '<button type="button" class="me-row" data-me="restore"><span class="ico">📥</span><span><b>Restore from backup</b><small>Replaces the progress on this device.</small></span>'+IC.chev+'</button><input type="file" id="me-file" accept="application/json,.json,text/plain" hidden>'+
  '<button type="button" class="me-row" data-me="share"><span class="ico">📤</span><span><b>Share the course</b><small>Send the link to a classmate.</small></span>'+IC.chev+'</button>'+
  (inApp?'':'<a class="me-row" href="'+esc(D.apk)+'" rel="noopener"><span class="ico">📱</span><span><b>Get the Android app</b><small>Offline course, fullscreen slides.</small></span>'+IC.chev+'</a><button type="button" class="me-row" data-install hidden><span class="ico">⬇️</span><span><b>Install as a web app</b><small>Adds an icon and works offline.</small></span>'+IC.chev+'</button>')+
  '<button type="button" class="me-row danger" data-me="reset"><span class="ico">🗑️</span><span><b>Reset all progress</b><small>Clears lectures, slides, quizzes, badges and details.</small></span>'+IC.chev+'</button></section>'+
 '<section class="d-card me-about"><header><span class="eyebrow">About</span></header><p><b>Mobile Application Development</b> · CSCP-4063 · BSCS<br>Instructor: Muhammad Tahir Mehmood</p><p class="pp-note">Portal version '+esc(D.version)+(inApp?' · Android app':' · Web')+'. Android code is shown for study and runs in Android Studio, not in this portal.</p><button type="button" class="secondary-button" id="me-contact">Contact instructor</button></section>';
 if(installEvt)$$('[data-install]',v).forEach(b=>b.hidden=false);
 countUp(v);runRings(v);
 const bind=(id,k)=>$('#'+id).addEventListener('change',e=>{S.d[k]=e.target.value.trim();S.save();toast('Saved');R.me()});
 bind('me-name','name');bind('me-roll','roll');bind('me-start','start');
 $('#me-contact').addEventListener('click',()=>CourseApp.openDialog('contact-dialog'));
 $('#me-file').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);if(!o||o.app!=='MAD Course'||!o.data)throw 0;if(!confirm('Replace the progress on this device with the backup from '+String(o.date||'').slice(0,10)+'?'))return;DATA_KEYS.forEach(k=>{if(typeof o.data[k]==='string')localStorage.setItem(k,o.data[k])});location.reload()}catch(err){toast('That file is not a MAD Course backup.')}};rd.readAsText(f)});
};
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-me]');if(!b)return;const a=b.dataset.me;haptic(8);
 if(a==='theme'){CourseApp.theme.toggle();R.me()}
 else if(a==='backup'){const o={app:'MAD Course',v:D.version,date:new Date().toISOString(),data:{}};DATA_KEYS.forEach(k=>{o.data[k]=localStorage.getItem(k)});const el=document.createElement('a');el.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));el.download='mad-course-progress.json';document.body.appendChild(el);el.click();setTimeout(()=>{URL.revokeObjectURL(el.href);el.remove()},1500);if(!inApp)toast('Backup file downloaded')}
 else if(a==='restore')$('#me-file').click();
 else if(a==='share'){const url='https://mobile-application-development-five.vercel.app',text='Mobile Application Development course: lectures, slides, quizzes and labs. '+url;const n=NV();if(n&&n.share)n.share(text);else if(navigator.share)navigator.share({title:'MAD Course',text:'Mobile Application Development course',url}).catch(()=>{});else copy(url)}
 else if(a==='reset'){if(confirm('Reset ALL progress on this device? Lectures, slides, quiz answers, badges and your details will be cleared.')){DATA_KEYS.forEach(k=>localStorage.removeItem(k));location.hash='home';location.reload()}}
});

window.MADPortal={stats,store:S,haptic,confetti,inApp,render:()=>after(CourseApp.state.view)};
shell();
})();
