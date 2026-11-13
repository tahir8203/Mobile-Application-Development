/* Course Outline + Assessments pages for the MAD course site.
   Adds two routes (#outline, #assessments) to the existing CourseApp without changing its storage. */
(function(){
'use strict';
const C=window.MAD_COURSE,P=window.MADPresent;if(!C||!P)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=P.esc,md=P.md,plain=P.plain;
const pad=n=>String(n).padStart(2,'0');
const KEY='madAssessV1';
const S={d:{quiz:{},done:{}},load(){try{Object.assign(this.d,JSON.parse(localStorage.getItem(KEY))||{})}catch(e){}},save(){try{localStorage.setItem(KEY,JSON.stringify(this.d))}catch(e){}}};S.load();
const lecTitle=n=>(typeof LECTURES!=='undefined'&&LECTURES[n-1])?LECTURES[n-1].title:'Lecture '+n;
const VIEWS=['outline','assessments'];

/* ---------- resolve outline topics to slide numbers ---------- */
const decks={};
async function allDecks(){await Promise.all(Array.from({length:16},(_,i)=>P.loadDeck(i+1).then(d=>{decks[i+1]=P.compose(i+1,d)}).catch(()=>{})))}
function slideOf(l,t){const s=decks[l];if(!s)return 0;const T=x=>x.title||x.q||'';let k=s.findIndex((x,i)=>i>0&&T(x)===t);if(k<0)k=s.findIndex((x,i)=>i>0&&T(x).indexOf(t)>-1);if(k<0)console.warn('Outline topic not found: L'+l+' '+t);return k<0?0:k}

/* ---------- markup ---------- */
function sections(){
 const host=document.getElementById('certificate-view');if(!host||document.getElementById('outline-view'))return;
 const o=document.createElement('section');o.className='view tool-view course-page';o.id='outline-view';o.hidden=true;
 const a=document.createElement('section');a.className='view tool-view course-page';a.id='assessments-view';a.hidden=true;
 host.after(o);o.after(a);
 // nav entries
 const nav=$('.desktop-nav');if(nav&&!$('[data-view="outline"]',nav)){const ref=$('[data-view="glossary"]',nav);[['outline','Outline'],['assessments','Assessments']].forEach(([v,t])=>{const b=document.createElement('button');b.className='nav-link';b.dataset.view=v;b.textContent=t;nav.insertBefore(b,ref)})}
 const tm=$('.top-tools-menu');if(tm&&!$('[data-view="outline"]',tm)){tm.insertAdjacentHTML('afterbegin','<button data-view="outline">Course outline</button><button data-view="assessments">Assessments</button>')}
 const side=$('#course-sidebar .sidebar-progress');if(side&&!$('.side-links',side.parentNode)){const d=document.createElement('div');d.className='side-links';d.innerHTML='<button data-view="outline">📅 Course outline &amp; weekly plan</button><button data-view="assessments">📝 Assignments, quizzes &amp; exams</button>';side.after(d)}
 const hero=$('.hero-copy');if(hero&&!$('.outline-cta',hero)){const d=document.createElement('div');d.className='outline-cta';d.innerHTML='<button class="secondary-button" data-view="outline">📅 17-week course outline</button><button class="secondary-button" data-view="assessments">📝 Assessments</button>';hero.appendChild(d)}
}
function quizBlock(id,qs,title){
 const saved=S.d.quiz[id]||{};
 return '<div class="cq" data-quiz="'+id+'">'+(title?'<h3>'+esc(title)+'</h3>':'')+qs.map((q,i)=>'<fieldset class="cq-q" data-i="'+i+'"><legend><b>'+(i+1)+'.</b> '+md(q[0])+'</legend><div class="cq-opts">'+q[1].map((o,j)=>'<button type="button" class="cq-o'+(saved[i]!==undefined?(j===q[2]?' right':j===saved[i]?' wrong':''):'')+'" data-j="'+j+'"><b>'+'ABCD'[j]+'</b><span>'+md(o)+'</span></button>').join('')+'</div><p class="cq-fb" aria-live="polite">'+(saved[i]!==undefined?(saved[i]===q[2]?'✓ Correct. ':'✗ Answer: '+'ABCD'[q[2]]+'. ')+md(q[3]):'')+'</p></fieldset>').join('')+'<div class="cq-foot"><span class="cq-score"></span><button type="button" class="secondary-button" data-reset="'+id+'">Reset answers</button></div></div>';
}
function scoreOf(id,qs){const s=S.d.quiz[id]||{};let r=0,t=0;qs.forEach((q,i)=>{if(s[i]!==undefined){t++;if(s[i]===q[2])r++}});return{r,t,n:qs.length}}
function lecChips(list){return(list||[]).map(n=>'<a class="lec-chip" href="#lecture-'+n+'">L'+pad(n)+'</a>').join('')}
function cloLinks(l){return l.map(x=>x==='project'?'<a class="lec-chip" href="#assessments" data-jump="project">Project</a>':'<a class="lec-chip" href="#lecture-'+x+'">L'+pad(x)+'</a>').join('')}

function renderOutline(){
 const v=document.getElementById('outline-view'),i=C.info;
 const SPECIAL={'revision-mid':['🔁','Revision','Revise Weeks 1–7. Use the revision list and the mock mid-term on the Assessments page.','mid'],mid:['🖊️','MID TERM','Covers Weeks 1–8 (Lectures 1–10).','mid'],project:['🚀','Project evaluation + revision','Groups present their apps. Revise Weeks 10–15.','project'],final:['🎓','FINAL TERM','Covers the whole course (Lectures 1–16).','final']};
 v.innerHTML='<div class="tool-hero"><div><span class="eyebrow">Official course outline · '+esc(i.code)+'</span><h1>'+esc(i.title)+'</h1><p>Every topic in the outline’s Calendar of Activities, in its week, linked to the slide that teaches it.</p></div></div>'+
 '<div class="co-facts">'+[['Program',i.program],['Credit hours',i.credits],['Duration',i.duration],['Prerequisite',i.prereq],['Instructor',i.instructor]].map(f=>'<div><small>'+f[0]+'</small><strong>'+esc(f[1])+'</strong></div>').join('')+'</div>'+
 '<div class="co-grid"><section class="co-card"><h2>Course requirement</h2><p>'+esc(C.requirement)+'</p><h2>Course objectives</h2><p>'+esc(C.objectives)+'</p></section>'+
 '<section class="co-card"><h2>Learning outcomes</h2><ul class="co-clo">'+C.outcomes.map(o=>'<li><b>'+o[0]+'</b><span>'+esc(o[1])+'</span><span class="chips">'+cloLinks(o[2])+'</span></li>').join('')+'</ul></section>'+
 '<section class="co-card"><h2>Teaching–learning methods</h2><ul>'+C.methods.map(m=>'<li>'+esc(m)+'</li>').join('')+'</ul><h2>Reference books</h2><ul>'+C.books.map(m=>'<li>'+esc(m)+'</li>').join('')+'</ul></section></div>'+
 '<h2 class="co-h">Calendar of activities</h2><p class="co-sub">Two 90-minute sessions per week. Click any topic to open its slide in Presentation Mode.</p>'+
 '<ol class="co-weeks">'+C.weeks.map(w=>{const sp=SPECIAL[w.special];
  return '<li class="co-week'+(sp?' special':'')+'" id="week-'+w.w+'"><div class="co-wk"><small>Week</small><b>'+w.w+'</b></div><div class="co-body">'+
  (sp?'<h3>'+sp[0]+' '+esc(sp[1])+'</h3><p>'+esc(sp[2])+'</p><a class="present-btn" href="#assessments" data-jump="'+sp[3]+'">Open on the Assessments page →</a>':
   '<div class="co-lecs">'+w.lec.map(n=>'<a href="#lecture-'+n+'" class="co-lec">Lecture '+pad(n)+' · '+esc(lecTitle(n))+'</a>').join('')+'</div><ul class="co-topics">'+w.topics.map(t=>'<li><a href="#present/'+t[1]+'/'+(slideOf(t[1],t[2])+1)+'">'+esc(t[0])+'</a></li>').join('')+'</ul>'+(w.note?'<p class="co-note">'+esc(w.note)+'</p>':''))+
  '</div><div class="co-act">'+(w.act?'<a href="#assessments" data-jump="'+(w.act[0]==='A'?'a':'q')+w.act.split('-')[1]+'" class="co-badge '+(w.act[0]==='A'?'as':'qz')+'">'+esc(w.act)+'</a>':'')+'</div></li>'}).join('')+'</ol>';
}

function examBlock(key,E,title){
 return '<article class="as-card" id="as-'+key+'"><header><span class="co-badge ex">Week '+E.week+'</span><h2>'+title+'</h2><p>Covers '+lecChips(E.covers)+'</p></header>'+
 '<h3>Section A · Multiple choice</h3>'+quizBlock(key,E.mcq)+
 '<h3>Section B · Short questions</h3><ol class="as-short">'+E.short.map(s=>'<li><p>'+md(s[0])+'</p><details><summary>Show model answer</summary><p>'+md(s[1])+'</p></details></li>').join('')+'</ol>'+
 '<h3>Section C · Coding</h3><ol class="as-short">'+E.code.map(s=>'<li><p>'+md(s[0])+'</p><details><summary>Show model solution</summary><pre class="as-code">'+esc(s[1])+'</pre></details></li>').join('')+'</ol>'+
 '<h3>Revision checklist</h3><div class="as-rev">'+E.covers.map(n=>{const s=(decks[n]||[]).find(x=>x.kind==='summary');return'<section><h4><a href="#present/'+n+'/'+((decks[n]||[]).length||1)+'">L'+pad(n)+' · '+esc(lecTitle(n))+'</a></h4><ul>'+(s?s.points.map(p=>'<li>'+md(p)+'</li>').join(''):'')+'</ul></section>'}).join('')+'</div></article>';
}
function renderAssess(){
 const v=document.getElementById('assessments-view');
 const rows=[].concat(C.assignments.map(a=>({w:a.week,id:a.id,t:'Assignment-'+a.n,s:a.title,c:'as'})),C.quizzes.map(q=>({w:q.week,id:q.id,t:'Quiz-'+q.n,s:q.title,c:'qz'})),[{w:8,id:'mid',t:'Revision',s:'Weeks 1–7',c:'ex'},{w:9,id:'mid',t:'Mid term',s:'Mock exam with model answers',c:'ex'},{w:16,id:'project',t:'Project evaluation',s:'Group app demo + revision',c:'ex'},{w:17,id:'final',t:'Final term',s:'Mock exam with model answers',c:'ex'}]).sort((a,b)=>a.w-b.w);
 v.innerHTML='<div class="tool-hero"><div><span class="eyebrow">Calendar of activities</span><h1>Assignments, quizzes &amp; exams</h1><p>Placed in the weeks set by the course outline. Quizzes are scored on this device; mock exams include model answers. Official marks and weightage are announced by the instructor.</p></div></div>'+
 '<div class="as-time">'+rows.map(r=>'<a href="#assessments" data-jump="'+r.id+'" class="as-tl '+r.c+'"><small>Week '+r.w+'</small><b>'+esc(r.t)+'</b><span>'+esc(r.s)+'</span></a>').join('')+'</div>'+
 '<h2 class="co-h">Assignments</h2>'+C.assignments.map(a=>'<article class="as-card" id="as-'+a.id+'"><header><span class="co-badge as">Assignment-'+a.n+' · Week '+a.week+'</span><h2>'+esc(a.title)+'</h2><p>'+esc(a.goal)+' Covers '+lecChips(a.covers)+'</p></header><h3>Tasks</h3><ol class="as-tasks">'+a.tasks.map(t=>'<li>'+md(t)+'</li>').join('')+'</ol><div class="as-two"><section><h3>Submit</h3><ul>'+a.submit.map(t=>'<li>'+md(t)+'</li>').join('')+'</ul></section><section><h3>Self-check before submitting</h3><ul class="as-check">'+a.check.map((t,i)=>{const k=a.id+i;return'<li><label><input type="checkbox" data-done="'+k+'"'+(S.d.done[k]?' checked':'')+'> '+md(t)+'</label></li>'}).join('')+'</ul></section></div></article>').join('')+
 '<h2 class="co-h">Quizzes</h2>'+C.quizzes.map(q=>'<article class="as-card" id="as-'+q.id+'"><header><span class="co-badge qz">Quiz-'+q.n+' · Week '+q.week+'</span><h2>'+esc(q.title)+'</h2><p>Covers '+lecChips(q.covers)+'</p></header>'+quizBlock(q.id,q.qs)+'</article>').join('')+
 '<h2 class="co-h">Exams &amp; project</h2>'+examBlock('mid',C.mid,'Mid-term mock exam (Week 9)')+
 (()=>{const p=C.project;return'<article class="as-card" id="as-project"><header><span class="co-badge ex">Week '+p.week+'</span><h2>'+esc(p.title)+'</h2><p>'+esc(p.goal)+'</p></header><div class="as-two"><section><h3>Your app must have</h3><ul class="as-check">'+p.must.map((t,i)=>'<li><label><input type="checkbox" data-done="proj'+i+'"'+(S.d.done['proj'+i]?' checked':'')+'> '+md(t)+'</label></li>').join('')+'</ul></section><section><h3>Deliverables</h3><ul>'+p.deliver.map(t=>'<li>'+md(t)+'</li>').join('')+'</ul><h3>Publishing steps (Google Play)</h3><ol>'+p.publish.map(t=>'<li>'+md(t)+'</li>').join('')+'</ol></section></div><h3>Evaluation rubric</h3><div class="as-rubric" role="table"><div role="row" class="hd"><span role="columnheader">Criterion</span><span role="columnheader">Excellent</span><span role="columnheader">Good</span><span role="columnheader">Needs work</span></div>'+p.rubric.map(r=>'<div role="row">'+r.map((c,i)=>'<span role="'+(i?'cell':'rowheader')+'">'+esc(c)+'</span>').join('')+'</div>').join('')+'</div></article>'})()+
 examBlock('final',C.final,'Final-term mock exam (Week 17)');
 updateScores();
}
function updateScores(){$$('.cq').forEach(b=>{const id=b.dataset.quiz,qs=id==='mid'?C.mid.mcq:id==='final'?C.final.mcq:(C.quizzes.find(q=>q.id===id)||{}).qs;if(!qs)return;const s=scoreOf(id,qs);$('.cq-score',b).textContent=s.t?'Score: '+s.r+' / '+s.n+(s.t<s.n?' ('+(s.n-s.t)+' unanswered)':''):'Answer every question, then check your score here.'})}

document.addEventListener('click',e=>{
 const o=e.target.closest('.cq .cq-o');if(o){const f=o.closest('.cq-q'),b=o.closest('.cq'),id=b.dataset.quiz,i=+f.dataset.i,j=+o.dataset.j;const qs=id==='mid'?C.mid.mcq:id==='final'?C.final.mcq:C.quizzes.find(q=>q.id===id).qs,q=qs[i];
  (S.d.quiz[id]=S.d.quiz[id]||{})[i]=j;S.save();$$('.cq-o',f).forEach((x,k)=>{x.classList.toggle('right',k===q[2]);x.classList.toggle('wrong',k===j&&j!==q[2])});$('.cq-fb',f).innerHTML=(j===q[2]?'✓ Correct. ':'✗ Answer: '+'ABCD'[q[2]]+'. ')+md(q[3]);updateScores();return}
 const r=e.target.closest('[data-reset]');if(r){delete S.d.quiz[r.dataset.reset];S.save();renderAssess();document.getElementById('as-'+r.dataset.reset)?.scrollIntoView({block:'start'});return}
 const j=e.target.closest('[data-jump]');if(j){e.preventDefault();const id='as-'+j.dataset.jump;if(location.hash!=='#assessments')location.hash='assessments';setTimeout(()=>document.getElementById(id)?.scrollIntoView({block:'start'}),150)}
});
document.addEventListener('change',e=>{const c=e.target.closest('[data-done]');if(c){S.d.done[c.dataset.done]=c.checked;S.save()}});

/* ---------- routing ---------- */
let ready=null;
function prepare(){if(!ready)ready=allDecks().then(()=>{renderOutline();renderAssess()});return ready}
function hook(){
 if(typeof CourseApp==='undefined')return;
 sections();
 const show=CourseApp.showView,route=CourseApp.route;
 CourseApp.showView=function(view){show.call(this,view);VIEWS.forEach(v=>{const el=document.getElementById(v+'-view');if(el)el.hidden=view!==v});if(VIEWS.includes(view)){$$('.nav-link').forEach(b=>b.classList.toggle('active',b.dataset.view===view));prepare()}};
 CourseApp.route=function(initial){const h=(location.hash||'').slice(1);if(VIEWS.includes(h)){if(P.hide)P.hide();this.showView(h);return}return route.call(this,initial)};
 const h=(location.hash||'').slice(1);if(VIEWS.includes(h))CourseApp.route(true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook);else hook();
window.MADCourse={prepare,renderOutline,renderAssess};
})();
