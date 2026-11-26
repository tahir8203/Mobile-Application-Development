/* Mobile Application Development — Presentation Mode engine.
   One screen = one concept. Slide decks live in assets/slides/lNN.js and call MAD.deck(n, {...}). */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* [[term]] or [[term|shown text]] becomes a tooltip button; definitions come from deck.terms or the course glossary */
const TIPRX=/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g;
const tipBtn=(t,l)=>'<button type="button" class="tip" data-term="'+t+'" aria-expanded="false">'+l+'</button>';
const md=t=>esc(t).replace(/&lt;(\/?)em&gt;/g,'<$1em>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>').replace(TIPRX,(m,a,b)=>tipBtn(a,b||a));
const plain=t=>String(t==null?'':t).replace(/<\/?em>/g,'').replace(TIPRX,(m,a,b)=>b||a);
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const pad=n=>String(n).padStart(2,'0');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- storage (separate from the original course key) ---------- */
const Store={key:'madPresentationV1',d:{last:null,slide:{},seen:{},quiz:{},tasks:{},total:{},pt:'dark',rev:{}},
 load(){try{const r=JSON.parse(localStorage.getItem(this.key)||'null');if(r&&typeof r==='object')for(const k in this.d){if(r[k]!==undefined&&typeof r[k]===typeof this.d[k])this.d[k]=r[k]}}catch(e){}},
 save(){try{localStorage.setItem(this.key,JSON.stringify(this.d))}catch(e){}},
 obj(k,l){return this.d[k][l]||(this.d[k][l]={})}};
Store.load();

/* ---------- deck loading ---------- */
const Decks={},waiting={};
const TERMS={};
window.MAD={deck(n,d){Decks[n]=d;if(d.terms)Object.keys(d.terms).forEach(k=>{TERMS[k.toLowerCase()]=[k,d.terms[k]]});(waiting[n]||[]).forEach(w=>w[0](d));delete waiting[n]}};
function termDef(t){const k=String(t).toLowerCase();if(TERMS[k])return TERMS[k][1];
 try{if(typeof GLOSSARY!=='undefined'){const g=GLOSSARY.find(x=>x[0].toLowerCase()===k);if(g)return g[1]}}catch(e){}return''}
/* tooltip: opens on hover (mouse), on focus (keyboard) and on tap (touch); closes on tap outside or Esc */
const Tip={pop:null,cur:null,pinned:false,
 make(){if(this.pop)return this.pop;const p=el('div','tip-pop');p.id='mad-tip';p.setAttribute('role','tooltip');p.hidden=true;document.body.appendChild(p);return this.pop=p},
 show(b,pin){const p=this.make();if(this.cur&&this.cur!==b)this.cur.setAttribute('aria-expanded','false');this.cur=b;this.pinned=!!pin;
  const t=b.dataset.term,d=termDef(t);p.innerHTML='<b>'+esc(t)+'</b><span>'+md(String(d||'See the glossary at the end of the lecture.').replace(TIPRX,(m,a,c)=>c||a))+'</span>';
  p.hidden=false;b.setAttribute('aria-expanded','true');b.setAttribute('aria-describedby','mad-tip');
  const r=b.getBoundingClientRect(),W=Math.min(320,innerWidth-16);p.style.width=W+'px';const h=p.offsetHeight;
  p.style.left=clamp(r.left+r.width/2-W/2,8,innerWidth-W-8)+'px';p.style.top=(r.bottom+8+h>innerHeight&&r.top-8-h>0?r.top-8-h:r.bottom+8)+'px'},
 hide(){if(!this.pop||this.pop.hidden)return false;this.pop.hidden=true;if(this.cur){this.cur.setAttribute('aria-expanded','false');this.cur.removeAttribute('aria-describedby')}this.cur=null;this.pinned=false;return true}};
document.addEventListener('mouseover',e=>{const b=e.target.closest&&e.target.closest('.tip');if(b&&b!==Tip.cur)Tip.show(b,false)});
document.addEventListener('mouseout',e=>{const b=e.target.closest&&e.target.closest('.tip');if(b&&b===Tip.cur&&!Tip.pinned&&!(e.relatedTarget&&b.contains(e.relatedTarget)))Tip.hide()});
document.addEventListener('focusin',e=>{const b=e.target.closest&&e.target.closest('.tip');if(b)Tip.show(b,false)});
document.addEventListener('focusout',e=>{const b=e.target.closest&&e.target.closest('.tip');if(b&&!Tip.pinned)Tip.hide()});
document.addEventListener('click',e=>{const b=e.target.closest('.tip');if(b){e.preventDefault();e.stopPropagation();if(Tip.cur===b&&Tip.pinned)Tip.hide();else Tip.show(b,true);return}if(!e.target.closest('.tip-pop'))Tip.hide()},true);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&Tip.hide()){e.preventDefault();e.stopImmediatePropagation()}},true);
addEventListener('resize',()=>Tip.hide());
function loadDeck(n){
 if(Decks[n])return Promise.resolve(Decks[n]);
 return new Promise((res,rej)=>{const first=!waiting[n];(waiting[n]=waiting[n]||[]).push([res,rej]);
  if(first){const s=document.createElement('script');s.src='assets/slides/l'+pad(n)+'.js?v=16';
   s.onerror=()=>{(waiting[n]||[]).forEach(w=>w[1](new Error('Could not load slides for lecture '+n)));delete waiting[n];s.remove()};document.head.appendChild(s)}});
}
const BLOOM=[['head','🧠','Head','Cognitive · know & understand'],['heart','❤️','Heart','Affective · value & care'],['hand','🛠️','Hand','Psychomotor · build & do']];
function bloomHtml(b){return'<div class="pz-bloom">'+BLOOM.map(([k,ic,t,sub])=>'<section class="bl-'+k+'"><h3><span aria-hidden="true">'+ic+'</span> '+t+'<small>'+sub+'</small></h3><ul>'+(b[k]||[]).map(x=>'<li>'+md(x)+'</li>').join('')+'</ul></section>').join('')+'</div>'}
function compose(n,d){
 const s=[{kind:'title',title:d.title,text:d.subtitle,notes:d.intro||'Introduce the lecture. Ask students what they already know about this topic.'},
  {kind:'objectives',title:'By the end of this lecture you can…',points:d.objectives,notes:'Read the objectives aloud. Return to this slide at the end and ask students to tick off each one.'}];
 if(d.bloom)s.push({kind:'bloom',title:'Learning outcomes: Head, Heart, Hand',bloom:d.bloom,notes:'Bloom’s Taxonomy in three domains. Head = what students will know (cognitive). Heart = attitudes and values (affective). Hand = what they will be able to do with their hands in Android Studio (psychomotor).'});
 const body=d.slides.slice(),tn=window.MAD_PORTAL&&window.MAD_PORTAL.thenNow&&window.MAD_PORTAL.thenNow[n];
 if(d.rev){const R=Store.d.rev;if(R[n]!==d.rev){if(R[n]!==undefined||Store.d.seen[n]){['seen','quiz','tasks'].forEach(k=>delete Store.d[k][n]);delete Store.d.slide[n]}R[n]=d.rev;Store.save()}}
 if(tn&&d.update!==false){const at=body.findIndex(x=>x.kind==='summary');body.splice(at<0?body.length:at,0,{kind:'update',title:'In 2026: what changed',points:tn,notes:'The course outline teaches the classic APIs. This slide shows what professional teams use today for the same job. Students should be able to read both styles.'})}
 const all=s.concat(body);Store.d.total[n]=all.length;return all;
}

/* ---------- syntax highlighting ---------- */
const KW={kotlin:'val var fun class object interface if else when for while do in is as return import package private public protected internal override open abstract data enum sealed true false null this super companion lateinit suspend by try catch finally throw const until downTo step it init get set inner',
 sql:'select insert into values update set delete from where create table primary key autoincrement integer text real not null and or order by drop if exists like limit asc desc unique',
 php:'echo if else foreach as function return new isset require include while null true false',
 json:'true false null',bash:''};
KW.gradle=KW.kotlin+' plugins dependencies implementation android defaultConfig id namespace';KW.java=KW.kotlin;
const RX={};
function mkRx(lang){
 const com=lang==='sql'?'--.*':lang==='php'?'\\/\\/.*|#.*|\\/\\*.*?\\*\\/':'\\/\\/.*|\\/\\*.*?\\*\\/';
 return {ci:lang==='sql',kw:new Set((KW[lang]==null?KW.kotlin:KW[lang]).split(' ')),
  re:new RegExp('('+com+')|("(?:[^"\\\\]|\\\\.)*"?|\'(?:[^\'\\\\]|\\\\.)*\'?)|(\\b\\d+(?:\\.\\d+)?[LfF]?\\b)|(@\\w+|\\$\\w+)|([A-Za-z_]\\w*)(?=\\s*\\()|([A-Za-z_]\\w*)','g')};
}
function hlXml(line){
 const re=/(<!--.*?-->)|(<\/?[\w.:]+)|([\w:]+)(?==)|("[^"]*")|(\/?>)/g;let out='',i=0,m;
 while((m=re.exec(line))){out+=esc(line.slice(i,m.index));i=re.lastIndex;const c=m[1]?'c':m[2]||m[5]?'k':m[3]?'a':'s';out+='<span class="tk-'+c+'">'+esc(m[0])+'</span>'}
 return out+esc(line.slice(i));
}
function hlLine(line,lang){
 if(lang==='xml')return hlXml(line);
 if(lang==='text'||lang==='output')return esc(line);
 const L=RX[lang]||(RX[lang]=mkRx(lang));let out='',i=0,m;L.re.lastIndex=0;
 while((m=L.re.exec(line))){
  if(!m[0].length){L.re.lastIndex++;continue}
  out+=esc(line.slice(i,m.index));i=L.re.lastIndex;let c='';
  if(m[1])c='c';else if(m[2])c='s';else if(m[3])c='n';else if(m[4])c='at';
  else{const w=m[5]||m[6];c=L.kw.has(L.ci?w.toLowerCase():w)?'k':m[5]?'f':(!L.ci&&/^[A-Z]/.test(w))?'t':''}
  out+=c?'<span class="tk-'+c+'">'+esc(m[0])+'</span>':esc(m[0]);
 }
 return out+esc(line.slice(i));
}
const EXT={kotlin:'kt',xml:'xml',sql:'sql',php:'php',json:'json',gradle:'gradle.kts',text:'txt'};
function codeBlock(code,lang,file){
 lang=lang||'kotlin';const lines=String(code).replace(/\s+$/,'').split('\n');
 const box=el('div','pz-code','<div class="pz-code-head"><b>'+esc(file||lang)+'</b><button type="button" data-copy>Copy</button><button type="button" data-dl>Download</button></div><pre tabindex="0"><code>'+lines.map((l,i)=>'<span class="ln" data-n="'+(i+1)+'">'+(hlLine(l,lang)||' ')+'</span>').join('')+'</code></pre>');
 $('[data-copy]',box).addEventListener('click',e=>{const b=e.currentTarget;const done=()=>{b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy',1400)};
  if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(code).then(done,()=>fallbackCopy(code,done));else fallbackCopy(code,done)});
 $('[data-dl]',box).addEventListener('click',()=>{const name=(file&&/\.\w+$/.test(file))?file.split('/').pop():'Example.'+(EXT[lang]||'txt');const a=el('a');a.href=URL.createObjectURL(new Blob([code],{type:'text/plain'}));a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)});
 return box;
}
function fallbackCopy(text,done){const t=el('textarea');t.value=text;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');done()}catch(e){}t.remove()}
function parseRange(r){if(typeof r==='number')return[r,r];const p=String(r).split('-').map(Number);return[p[0],p[1]||p[0]]}

/* ---------- animation framework: every widget is a step model ---------- */
const Viz={};
const NOTE={sim:'Visual simulation — a simplified model of what Android does on a real device.',logic:'Logic visualised in the browser. Run the real Kotlin code in Kotlin Playground or Android Studio.'};
function mountViz(host,o){
 const make=Viz[o.type];if(!make)return null;
 const box=el('div','vz');host.appendChild(box);
 const canvas=el('div','vz-canvas');box.appendChild(canvas);
 const ctl={i:0,timer:null,box,canvas,opts:o};
 const w=make(canvas,o,ctl);ctl.w=w;
 const cap=el('div','vz-cap');cap.setAttribute('aria-live','polite');
 const bar=el('div','vz-bar','<button type="button" class="play">▶ Play</button><button type="button" data-a="back">‹ Back</button><button type="button" data-a="step">Step ›</button><button type="button" data-a="reset">↺ Reset</button><label class="vz-speed"><span>Speed</span><select aria-label="Animation speed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label><span class="cnt"></span>');
 ctl.factor=1;$('.vz-speed select',bar).addEventListener('change',e=>{ctl.factor=+e.target.value||1;if(ctl.timer){ctl.pause();ctl.play()}});
 box.appendChild(cap);box.appendChild(bar);
 const note=o.note||NOTE['note' in w?w.note:'sim'];if(note)box.appendChild(el('div','vz-sim',esc(note)));
 const playBtn=$('.play',bar),cnt=$('.cnt',bar);
 ctl.go=i=>{const n=w.n();ctl.i=clamp(i,0,n-1);w.draw(ctl.i);const c=w.cap?w.cap(ctl.i):(o.caps||[])[ctl.i];cap.innerHTML=md(c||'');cnt.textContent=(ctl.i+1)+' / '+n};
 ctl.pause=()=>{clearInterval(ctl.timer);ctl.timer=null;playBtn.textContent='▶ Play'};
 ctl.play=()=>{if(ctl.timer){ctl.pause();return}if(ctl.i>=w.n()-1)ctl.go(0);playBtn.textContent='⏸ Pause';ctl.timer=setInterval(()=>{if(ctl.i>=w.n()-1){ctl.pause();return}ctl.go(ctl.i+1)},(o.speed||1700)/(ctl.factor||1))};
 ctl.step=()=>{ctl.pause();ctl.go(ctl.i+1)};ctl.back=()=>{ctl.pause();ctl.go(ctl.i-1)};ctl.reset=()=>{ctl.pause();if(w.reset)w.reset();ctl.go(0)};
 ctl.destroy=()=>{ctl.pause();if(w.destroy)w.destroy()};
 playBtn.addEventListener('click',ctl.play);
 bar.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a)ctl[a.dataset.a]()});
 ctl.go(o.start||0);return ctl;
}

/* generic: flow of steps with animated arrows */
Viz.flow=(c,o)=>{
 const wrap=el('div','vf'+(o.dir==='col'?' col':''));const N=[],A=[];
 o.nodes.forEach((nd,i)=>{if(i){const a=el('div','vf-arrow','<em>'+esc((o.labels||[])[i-1]||'')+'</em><i></i>');wrap.appendChild(a);A.push(a)}
  const n=el('div','vf-node','<span class="ic" aria-hidden="true">'+esc(nd[0]||'')+'</span><div><b>'+md(nd[1])+'</b>'+(nd[2]?'<small>'+md(nd[2])+'</small>':'')+'</div>');wrap.appendChild(n);N.push(n)});
 c.appendChild(wrap);
 return{n:()=>N.length,note:o.note?'':'sim',
  draw(i){N.forEach((n,k)=>{n.classList.toggle('on',k<=i);n.classList.toggle('cur',k===i)});A.forEach((a,k)=>{a.classList.toggle('on',k<i);a.classList.remove('go');if(k===i-1){void a.offsetWidth;a.classList.add('go')}})},
  cap:i=>(o.caps||[])[i]||('**'+o.nodes[i][1]+'** — '+(o.nodes[i][2]||''))};
};
/* layered architecture */
Viz.stack=(c,o)=>{
 const w=el('div','vs');const L=o.layers.map(l=>{const d=el('div','vs-layer','<b>'+md(l[0])+'</b><div class="vs-chips">'+(l[2]||[]).map(x=>'<i>'+esc(x)+'</i>').join('')+'</div>');w.appendChild(d);return d});c.appendChild(w);
 const order=o.order||L.map((_,i)=>i);
 return{n:()=>L.length,note:'',draw(i){L.forEach(d=>d.classList.remove('on','cur'));order.slice(0,i+1).forEach((k,j)=>{L[k].classList.add('on');if(j===i)L[k].classList.add('cur')})},
  cap:i=>'**'+o.layers[order[i]][0]+'** — '+o.layers[order[i]][1]};
};
/* cards revealed one by one */
Viz.cards=(c,o)=>{
 const g=el('div','vc');g.style.setProperty('--cols',o.cols||2);
 const C=o.items.map(it=>{const d=el('div','vc-card',(it.tag?'<span class="tg">'+esc(it.tag)+'</span>':'')+'<span class="ic" aria-hidden="true">'+esc(it.icon||'')+'</span><b>'+md(it.title)+'</b><p>'+md(it.text||'')+'</p>'+(it.code?'<code>'+esc(it.code)+'</code>':''));g.appendChild(d);return d});
 c.appendChild(g);
 return{n:()=>C.length,note:'',draw(i){C.forEach((d,k)=>{d.classList.toggle('on',k<=i);d.classList.toggle('cur',k===i)})},cap:i=>o.items[i].cap||('**'+o.items[i].title+'** — '+(o.items[i].text||''))};
};
/* a variable as a labelled box */
Viz.variable=(c,o)=>{
 const T=o.dtype||'Int',kw=o.keyword||'var',fmt=v=>typeof v==='string'?'"'+v+'"':String(v);
 c.innerHTML='<div class="vv"><div class="vz-code1 vv-code"></div><div class="vv-box"><span class="vv-label">'+esc(o.name)+'</span><span class="vv-val"></span><span class="vv-type">'+esc(T)+'</span></div><div class="vz-console vv-out"></div></div>';
 const code=$('.vv-code',c),val=$('.vv-val',c),out=$('.vv-out',c),box=$('.vv-box',c);
 const steps=[{t:'decl'}];o.values.forEach((v,k)=>steps.push({t:k?'set':'init',v}));if(o.tryChange!==undefined)steps.push({t:'err',v:o.tryChange});steps.push({t:'print'});
 let prev=null;
 return{n:()=>steps.length,note:'logic',
  draw(i){let cur=null,lines=[];
   for(let k=0;k<=i;k++){const s=steps[k];if(s.t==='init'){cur=s.v;lines.push(kw+' '+o.name+': '+T+' = '+fmt(s.v))}else if(s.t==='set'){cur=s.v;lines.push(o.name+' = '+fmt(s.v))}else if(s.t==='err')lines.push(o.name+' = '+fmt(s.v)+'   // ✗ not allowed');else if(s.t==='print')lines.push('println('+o.name+')')}
   const s=steps[i];if(s.t==='decl')lines=[kw+' '+o.name+': '+T];
   code.innerHTML=lines.map(l=>hlLine(l,'kotlin')).join('\n');
   $$('.vv-old',box).forEach(x=>x.remove());
   if(prev!==null&&cur!==null&&cur!==prev)box.appendChild(el('span','vv-old',esc(fmt(prev))));
   val.textContent=cur===null?'':fmt(cur);val.classList.remove('on-pop');void val.offsetWidth;if(s.t==='init'||s.t==='set')val.classList.add('on-pop');
   out.innerHTML=s.t==='err'?'<span class="vv-err">error: \'val\' cannot be reassigned</span>':s.t==='print'?esc(String(cur)):'';prev=cur},
  cap(i){const s=steps[i];return s.t==='decl'?'A variable is a **labelled box**. `'+o.name+'` is the label; `'+T+'` decides what can go inside.':s.t==='init'?'The value **'+fmt(s.v)+'** is stored in the box.':s.t==='set'?'The old value is thrown away. The box now holds **'+fmt(s.v)+'**.':s.t==='err'?'`val` boxes are **sealed**: changing them is a compile-time error.':'`println('+o.name+')` reads the box and prints the **current** value.'}};
};
/* if / else-if / else and when */
Viz.decision=(c,o,ctl)=>{
 let v=o.value;
 c.innerHTML='<div class="vd"><div class="vz-row" style="width:100%"><span class="vd-val"></span>'+(o.min!=null?'<label style="flex:1">Change '+esc(o.name)+' <input type="range" min="'+o.min+'" max="'+o.max+'" value="'+v+'"></label>':'')+'</div>'+o.branches.map(b=>'<div class="vd-br"><span class="dia" aria-hidden="true"></span><code>'+esc(b[0])+'</code><span class="res"></span></div>').join('')+'<div class="vz-console" style="width:100%"></div></div>';
 const B=$$('.vd-br',c),out=$('.vz-console',c),vb=$('.vd-val',c),rng=$('input',c);
 const fmtv=x=>typeof x==='string'?'"'+x+'"':x;
 const match=()=>{const k=o.branches.findIndex(b=>!b[1]||b[1](v));return k<0?o.branches.length-1:k};
 if(rng)rng.addEventListener('input',()=>{v=+rng.value;ctl.pause();ctl.go(0)});
 return{n:()=>match()+3,note:'logic',
  draw(i){const m=match();vb.textContent=o.name+' = '+fmtv(v);
   B.forEach((b,k)=>{b.className='vd-br';const r=$('.res',b);r.textContent='';if(i>=1&&k<=i-1&&k<=m){if(k<m){b.classList.add('no');r.textContent='false'}else{b.classList.add('yes');r.textContent=o.branches[k][1]?'true → '+o.branches[k][2]:'→ '+o.branches[k][2]}}});
   out.textContent=i>=m+2?o.branches[m][2]:''},
  cap(i){const m=match();if(i===0)return'Input: **'+o.name+' = '+fmtv(v)+'**. Kotlin checks conditions **from top to bottom**.';if(i<=m+1){const k=i-1,b=o.branches[k];if(k<m)return'`'+b[0]+'` is **false** → skip this block, check the next one.';return b[1]?'`'+b[0]+'` is **true** → this block runs. The rest are skipped.':'No condition was true → the **else** block runs.'}return'Output: **'+o.branches[m][2]+'**. Drag the slider to try another value.'}};
};
/* for loop */
Viz.loop=(c,o,ctl)=>{
 let to=o.to;const from=o.from==null?1:o.from;
 c.innerHTML='<div class="vz-row"><div class="vz-code1 vl-code" style="flex:1"></div>'+(o.editable!==false?'<label>Repeat until <input type="number" min="'+from+'" max="'+(o.max||10)+'" value="'+to+'"></label>':'')+'</div><div class="vl-counter">i = <b>–</b></div><div class="vl-track"></div><div class="vz-console"></div>';
 const code=$('.vl-code',c),track=$('.vl-track',c),out=$('.vz-console',c),cnt=$('.vl-counter b',c),inp=$('input',c);
 const build=()=>{track.innerHTML='';for(let k=from;k<=to;k++)track.appendChild(el('div','vl-cell','<small>iter '+(k-from+1)+'</small>'+k));code.innerHTML=(o.code?o.code(to):'for (i in '+from+'..'+to+') {\n    println("'+'Hello '+'$i")\n}').split('\n').map(l=>hlLine(l,'kotlin')).join('\n')};
 if(inp)inp.addEventListener('change',()=>{to=clamp(+inp.value||from,from,o.max||10);inp.value=to;build();ctl.pause();ctl.go(0)});
 build();const body=o.body||(k=>'Hello '+k);
 return{n:()=>to-from+3,note:'logic',
  draw(i){const cells=$$('.vl-cell',track),it=i-1;cells.forEach((x,k)=>{x.className='vl-cell'+(k<it?' done':'')+(k===it?' cur':'')});
   cnt.textContent=i===0?'–':it<cells.length?from+it:from+cells.length;const lines=[];for(let k=0;k<Math.min(it+1,cells.length);k++)lines.push(body(from+k));out.textContent=lines.join('\n')},
  cap(i){const count=to-from+1;if(i===0)return'The loop will run **'+count+' times**: i goes from '+from+' to '+to+'.';if(i<=count)return'Iteration '+i+': i = **'+(from+i-1)+'** → the body runs and prints `'+body(from+i-1)+'`.';return'i would become '+(to+1)+' which is outside '+from+'..'+to+' → **the loop stops**.'}};
};
/* array / list operations */
Viz.array=(c,o)=>{
 c.innerHTML='<div class="vz-code1 va-code"></div><div class="vl-track va-track" style="margin:.6em 0"></div><div class="vz-console"></div>';
 const code=$('.va-code',c),track=$('.va-track',c),out=$('.vz-console',c);const ops=[{t:'show'}].concat(o.ops);const fmt=v=>typeof v==='string'?'"'+v+'"':v;
 return{n:()=>ops.length,note:'logic',
  draw(i){const items=o.items.slice();let hl=-1,res='',line='val '+o.name+' = '+(o.kind||'arrayOf')+'('+o.items.map(fmt).join(', ')+')';let all=false;
   for(let k=1;k<=i;k++){const p=ops[k];if(p.t==='get'){if(k===i){hl=p.i;res=String(items[p.i]);line='println('+o.name+'['+p.i+'])'}}else if(p.t==='set'){items[p.i]=p.v;if(k===i){hl=p.i;line=o.name+'['+p.i+'] = '+fmt(p.v);res=''}}else if(p.t==='add'){items.push(p.v);if(k===i){hl=items.length-1;line=o.name+'.add('+fmt(p.v)+')'}}else if(p.t==='size'){if(k===i){line='println('+o.name+'.size)';res=String(items.length);all=true}}else if(p.t==='each'){if(k===i){line='for (item in '+o.name+') println(item)';res=items.join('\n');all=true}}}
   track.innerHTML=items.map((v,k)=>'<div class="vl-cell'+(k===hl||all?' cur':'')+'"><small>index '+k+'</small>'+esc(v)+'</div>').join('');code.innerHTML=hlLine(line,'kotlin');out.textContent=res},
  cap(i){if(i===0)return'An array stores many values in **numbered slots**. Counting starts at **index 0**.';const p=ops[i];return p.cap||({get:'Read the value at index '+p.i+'.',set:'Replace the value at index '+p.i+'.',add:'Add a new item at the end (only a mutable list can grow).',size:'`size` tells how many items there are.',each:'A for loop visits **every** item in order.'})[p.t]}};
};
/* function as a machine */
Viz.func=(c,o,ctl)=>{
 let args=o.args.slice();
 c.innerHTML='<div class="vz-code1 vfn-code"></div><div class="vfn" style="margin:.7em 0"><div class="vfn-box vf-call"><small>Caller</small><b></b></div><span class="vfn-arr">➜</span><div class="vfn-box mach"><small>fun '+esc(o.name)+'</small><b></b></div><span class="vfn-arr">➜</span><div class="vfn-box vf-ret"><small>Returned</small><b>?</b></div></div>'+(o.editable!==false?'<div class="vz-row">'+o.params.map((p,k)=>'<label>'+esc(p)+' <input type="number" data-k="'+k+'" value="'+args[k]+'"></label>').join('')+'</div>':'')+'<div class="vz-console"></div>';
 const call=$('.vf-call b',c),mach=$('.mach b',c),ret=$('.vf-ret b',c),out=$('.vz-console',c),code=$('.vfn-code',c),boxes=$$('.vfn-box',c),arrs=$$('.vfn-arr',c);
 $$('input[data-k]',c).forEach(inp=>inp.addEventListener('input',()=>{args[+inp.dataset.k]=+inp.value||0;ctl.pause();ctl.go(0)}));
 code.innerHTML=o.def.split('\n').map(l=>hlLine(l,'kotlin')).join('\n');
 return{n:()=>5,note:'logic',
  draw(i){const r=o.calc(...args);call.textContent='val result = '+o.name+'('+args.join(', ')+')';mach.textContent=i>=1?o.params.map((p,k)=>p+' = '+args[k]).join(', ')+(i>=2?'\n'+o.expr(...args):''):'waiting…';ret.textContent=i>=3?String(r):'?';out.textContent=i>=4?String(o.print?o.print(r):r):'';
   boxes.forEach((b,k)=>b.classList.toggle('cur',(i===0&&k===0)||((i===1||i===2)&&k===1)||(i>=3&&k===2)));arrs[0].classList.toggle('on',i>=1);arrs[1].classList.toggle('on',i>=3)},
  cap(i){const r=o.calc(...args);return['The **caller** asks the function to work, giving it inputs ('+args.join(', ')+').','The inputs are copied into the **parameters**: '+o.params.map((p,k)=>p+' = '+args[k]).join(', ')+'.','The function **body** runs: '+o.expr(...args)+'.','`return` sends **'+r+'** back. The caller stores it in `result`.','The caller prints the result. Change the inputs and replay.'][i]}};
};
/* class → objects */
Viz.classobj=(c,o)=>{
 c.innerHTML='<div class="vo"><div class="vo-class"><h4>class '+esc(o.cls)+'</h4>'+o.props.map(p=>'<div>'+esc(p)+'</div>').join('')+(o.method?'<div>fun '+esc(o.method[0])+'</div>':'')+'</div><div class="vo-objs"></div></div><div class="vz-console" style="margin-top:.6em"></div>';
 const objs=$('.vo-objs',c),out=$('.vz-console',c);
 return{n:()=>o.objs.length+(o.method?2:1),note:'logic',
  draw(i){objs.innerHTML='';o.objs.slice(0,i).forEach((ob,k)=>{const d=el('div','vo-obj'+(k===i-1?' on-pop':''),'<h4>'+esc(ob.var)+' : '+esc(o.cls)+'</h4>'+Object.entries(ob.vals).map(([a,b])=>'<div>'+esc(a)+' = <b>'+esc(typeof b==='string'?'"'+b+'"':b)+'</b></div>').join(''));objs.appendChild(d)});
   out.textContent=o.method&&i>o.objs.length?o.objs.map(ob=>o.method[1](ob.vals)).join('\n'):''},
  cap(i){if(i===0)return'A **class** is a blueprint. It describes properties and functions, but holds **no real data** yet.';if(i<=o.objs.length){const ob=o.objs[i-1];return'`val '+ob.var+' = '+o.cls+'('+Object.values(ob.vals).map(v=>typeof v==='string'?'"'+v+'"':v).join(', ')+')` creates an **object** — a real copy with its own data.'}return'Each object runs `'+o.method[0]+'` with **its own** data.'}};
};
/* inheritance + polymorphism */
Viz.inherit=(c,o)=>{
 c.innerHTML='<div class="vo"><div class="vo-class"><h4>open class '+esc(o.parent.name)+'</h4>'+o.parent.members.map(m=>'<div>'+esc(m)+'</div>').join('')+'</div><div class="vo-objs"></div></div><div class="vz-console" style="margin-top:.6em"></div>';
 const box=$('.vo-objs',c),out=$('.vz-console',c);
 return{n:()=>o.children.length+2,note:'logic',
  draw(i){box.innerHTML='';o.children.slice(0,i).forEach((ch,k)=>{box.appendChild(el('div','vo-obj'+(k===i-1?' on-pop':''),'<h4>class '+esc(ch.name)+' : '+esc(o.parent.name)+'()</h4>'+o.parent.members.map(m=>'<div class="inh">↳ '+esc(m)+' (inherited)</div>').join('')+(ch.own||[]).map(m=>'<div class="own">+ '+esc(m)+'</div>').join('')+(ch.ovr?'<div class="ovr">override '+esc(ch.ovr)+'</div>':'')))});
   out.textContent=i>o.children.length?o.children.map(ch=>ch.say).join('\n'):''},
  cap(i){if(i===0)return'`'+o.parent.name+'` is the **parent** class. `open` allows other classes to inherit from it.';if(i<=o.children.length){const ch=o.children[i-1];return'`'+ch.name+'` **inherits** everything from '+o.parent.name+(ch.own?', adds its own members':'')+(ch.ovr?' and **overrides** one function':'')+'.'}return'**Polymorphism**: the same call `'+o.call+'` gives a different result for each object.'}};
};
/* state machine (Activity lifecycle, Service, MediaPlayer) */
let mid=0;
Viz.machine=(c,o,ctl)=>{
 const id='vmA'+(++mid),S={};o.states.forEach(s=>S[s.id]=s);
 c.innerHTML='<div class="vm"><svg viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="'+id+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--mu);stroke:none"/></marker></defs></svg></div>'+(o.events?'<div class="vz-row vm-events">'+o.events.map((e,k)=>'<button type="button" class="vz-btn" data-ev="'+k+'">'+esc(e[0])+'</button>').join('')+'</div>':'')+'<div class="vm-info"></div><div class="vm-log" aria-live="polite"></div>';
 const box=$('.vm',c),svg=$('svg',c),info=$('.vm-info',c),log=$('.vm-log',c);const E={};
 (o.edges||[]).forEach(([a,b])=>{const A=S[a],B=S[b];let x1=A.x*1.6,y1=A.y,x2=B.x*1.6,y2=B.y;const dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;const sh=o.gap||11;
  const back=(o.edges||[]).some(e=>e[0]===b&&e[1]===a),off=back?2.2:0;x1+=ux*sh-uy*off;y1+=uy*sh*.62+ux*off;x2-=ux*sh+uy*off;y2-=uy*sh*.62-ux*off;
  const ln=document.createElementNS('http://www.w3.org/2000/svg','line');ln.setAttribute('x1',x1);ln.setAttribute('y1',y1);ln.setAttribute('x2',x2);ln.setAttribute('y2',y2);ln.setAttribute('marker-end','url(#'+id+')');svg.appendChild(ln);E[a+'>'+b]=ln});
 const N={};o.states.forEach(s=>{const b=el('button','vm-st','<b>'+esc(s.label)+'</b>'+(s.sub?'<small>'+esc(s.sub)+'</small>':''));b.type='button';b.style.left=s.x+'%';b.style.top=s.y+'%';b.addEventListener('click',()=>{ctl.pause();stopWalk();show(s.id,null,true)});box.appendChild(b);N[s.id]=b});
 let cur=null,walk=null,past=new Set();
 function show(sid,from,logIt){cur=sid;const s=S[sid];Object.entries(N).forEach(([k,b])=>{b.classList.toggle('cur',k===sid);b.classList.toggle('past',past.has(k)&&k!==sid)});past.add(sid);
  Object.values(E).forEach(l=>l.classList.remove('hot'));if(from&&E[from+'>'+sid])E[from+'>'+sid].classList.add('hot');
  info.innerHTML=[['What happens in '+(s.cb||s.label),s.what],['Real-life analogy',s.analogy],['Next',s.next]].filter(x=>x[1]).map(x=>'<div><i>'+x[0]+'</i>'+md(x[1])+'</div>').join('');
  if(logIt&&s.cb)addLog(s.cb)}
 function addLog(t){const line=el('div',null,esc((o.tag||'D/Lifecycle')+': '+t));log.appendChild(line);log.scrollTop=log.scrollHeight}
 function stopWalk(){clearTimeout(walk);walk=null}
 $$('[data-ev]',c).forEach(b=>b.addEventListener('click',()=>{ctl.pause();stopWalk();const ev=o.events[+b.dataset.ev];addLog('— '+ev[0]+' —');let k=0,prev=cur;const go=()=>{if(k>=ev[1].length)return;const sid=ev[1][k++];show(sid,prev,true);prev=sid;walk=setTimeout(go,650)};go()}));
 const tour=o.tour||o.states.map(s=>s.id);
 return{n:()=>tour.length,
  draw(i){stopWalk();if(i===0){past=new Set();log.innerHTML=''}show(tour[i],i?tour[i-1]:null,true)},
  cap:i=>(o.caps||[])[i]||'',
  reset(){past=new Set();log.innerHTML=''},destroy:stopWalk};
};
/* phone helper */
const phone=(title,body)=>'<div class="phone"><div class="phone-bar"><span>9:41</span><span>▮▮ ◔</span></div><div class="phone-app">'+esc(title)+'</div><div class="phone-body">'+body+'</div></div>';
/* intents */
Viz.intent=(c,o,ctl)=>{
 const imp=o.mode==='implicit';
 c.innerHTML='<div class="vp"><div class="pA">'+phone(o.from||'MainActivity',imp?'<div class="w-text">Course website</div><div class="w-text vz-mono" style="font-size:.7em">'+esc(o.data)+'</div><button type="button" class="w-btn">Open in browser</button>':'<div class="w-text">Student name</div><input class="w-edit" value="'+esc(o.value||'Ali')+'" aria-label="Student name"><button type="button" class="w-btn">Open profile</button>')+'</div><div class="env-slot" style="min-width:8em;display:grid;place-items:center"></div><div class="pB" style="transition:opacity .4s"></div></div>';
 const A=$('.pA',c),slot=$('.env-slot',c),B=$('.pB',c),inp=$('.w-edit',c);
 $('.w-btn',A).addEventListener('click',()=>{ctl.pause();ctl.go(0);ctl.play()});
 if(inp)inp.addEventListener('input',()=>{if(ctl.i)ctl.go(ctl.i)});
 const name=()=>(inp&&inp.value.trim())||'Student';
 const n=imp?5:5;
 return{n:()=>n,
  draw(i){const hlA=$('.w-edit',A)||$('.w-btn',A);[...A.querySelectorAll('.hl')].forEach(x=>x.classList.remove('hl'));if(i===0)hlA.classList.add('hl');
   if(imp){slot.innerHTML=i>=1?'<div class="envelope'+(i===1?' on-pop':'')+'"><b>Intent</b>action = '+esc(o.action)+'<br>data = '+esc(o.data.replace(/^https?:\/\//,''))+'</div>':'';
    B.style.opacity=i>=2?1:.25;B.innerHTML=i<2?phone('Android system','<div class="w-text" style="color:#64748b">Waiting…</div>'):i===2?phone('Android system','<div class="w-text">Which app can open this?</div><div class="chooser">'+o.apps.map(a=>'<div>'+esc(a)+'</div>').join('')+'</div>'):i===3?phone('Open with','<div class="chooser">'+o.apps.map((a,k)=>'<div style="'+(k===0?'outline:3px solid #22d3ee':'')+'">'+esc(a)+'</div>').join('')+'</div>'):phone(o.apps[0],'<div class="w-img">🌐</div><div class="w-text vz-mono" style="font-size:.7em">'+esc(o.data)+'</div><div class="w-text">Page loaded ✓</div>')}
   else{const nm=name();slot.innerHTML=i>=1?'<div class="envelope'+(i===3?' fly':'')+'"><b>Intent</b>→ '+esc(o.to)+(i>=2?'<br>"'+esc(o.key)+'" = "'+esc(nm)+'"':'')+'</div>':'';
    B.style.opacity=i>=3?1:.25;B.innerHTML=phone(o.to,i>=4?'<div class="w-text on-pop" style="font-size:1.2em;font-weight:800">Welcome, '+esc(nm)+'!</div><div class="w-text vz-mono" style="font-size:.65em;color:#475569">getStringExtra("'+esc(o.key)+'")</div>':i>=3?'<div class="w-text">Opening…</div>':'<div class="w-text" style="color:#94a3b8">Not open yet</div>')}},
  cap(i){if(imp)return['The user taps a button. We want **any app** that can show a web page.','We create an **implicit Intent**: we name the **action** (`'+o.action+'`) and the **data**, but no class.','Android checks every installed app’s **intent-filter** to find matches.','If several apps match, the user picks one (the **chooser**).','The chosen app opens with our data. Our app never needed to know its name.'][i];
   const nm=name();return['The user types **'+nm+'** and taps the button.','`Intent(this, '+o.to+'::class.java)` — an **explicit Intent** names the exact screen to open.','`putExtra("'+o.key+'", "'+nm+'")` attaches data to the Intent like a note in an envelope.','`startActivity(intent)` — Android delivers the envelope and opens **'+o.to+'**.','The new screen reads `intent.getStringExtra("'+o.key+'")` and shows **Welcome, '+nm+'!**'][i]}};
};
/* runtime permission */
Viz.perm=(c,o,ctl)=>{
 let choice='allow';
 c.innerHTML='<div class="vp" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div class="ph"></div><div class="vz-code1 pm-code" style="font-size:.78em"></div></div><div class="vz-row" style="margin-top:.5em"><span>Student chooses:</span><button type="button" class="vz-btn" data-c="allow">Allow</button><button type="button" class="vz-btn" data-c="deny">Deny</button></div>';
 const ph=$('.ph',c),code=$('.pm-code',c);
 const setC=v=>{choice=v;$$('[data-c]',c).forEach(b=>b.setAttribute('aria-pressed',b.dataset.c===v));};setC('allow');
 $$('[data-c]',c).forEach(b=>b.addEventListener('click',()=>{setC(b.dataset.c);ctl.pause();ctl.go(3)}));
 const lines=['if (checkSelfPermission(Manifest.permission.'+o.perm+')','        == PERMISSION_GRANTED) {','    '+o.use+'()','} else {','    launcher.launch(Manifest.permission.'+o.perm+')','}'];
 return{n:()=>4,
  draw(i){let body='<button type="button" class="w-btn'+(i===0?' hl':'')+'">'+esc(o.action)+'</button>';
   if(i===1)body+='<div class="w-text" style="font-size:.75em;color:#b91c1c">checkSelfPermission → DENIED</div>';
   if(i===2)body+='<div class="phone-dim"></div><div class="phone-dialog"><p>Allow <b>'+esc(o.app)+'</b> to '+esc(o.ask)+'?</p><div class="acts"><button type="button" data-p="deny">Don’t allow</button><button type="button" data-p="allow">Allow</button></div></div>';
   if(i===3)body+=choice==='allow'?'<div class="w-img on-pop">'+esc(o.icon||'📷')+'</div><div class="w-text">Permission granted ✓</div>':'<div class="w-text on-pop" style="color:#b91c1c">'+esc(o.denied)+'</div><div class="w-text" style="font-size:.75em">App keeps working without it.</div>';
   ph.innerHTML=phone(o.app,body);$$('[data-p]',ph).forEach(b=>b.addEventListener('click',()=>{setC(b.dataset.p);ctl.pause();ctl.go(3)}));
   const on=i===1?[0,1]:i===2?[3,4,5]:i===3?(choice==='allow'?[2]:[3,4,5]):[];code.innerHTML=lines.map((l,k)=>'<span style="display:block;opacity:'+(on.includes(k)||i===0?1:.4)+'">'+hlLine(l,'kotlin')+'</span>').join('')},
  cap(i){return['The user taps **'+o.action+'**. The app needs the **'+o.perm+'** permission.','First **check**: has the user already allowed it? Not yet → DENIED.','**Request**: Android (not your app) shows the system dialog. Tap Allow or Don’t allow inside the phone.',choice==='allow'?'**Granted** → the feature runs.':'**Denied** → explain politely and keep the app usable. Never crash.'][i]}};
};
/* threads: blocking vs coroutine */
Viz.threads=(c,o)=>{
 const T=6;
 c.innerHTML='<div class="vt"><div class="vt-sc"><h4>❌ '+esc(o.badTitle||'Blocking: download on the main thread')+'</h4><div class="vt-lane"><span>Main (UI)</span><div class="vt-track" data-l="a1"></div></div><div class="vt-ui" data-u="a"></div></div><div class="vt-sc"><h4>✅ '+esc(o.goodTitle||'Coroutine: download on Dispatchers.IO')+'</h4><div class="vt-lane"><span>Main (UI)</span><div class="vt-track" data-l="b1"></div></div><div class="vt-lane"><span>IO thread</span><div class="vt-track" data-l="b2"></div></div><div class="vt-ui" data-u="b"></div></div></div>';
 const plan={a1:[[0,1,'ui','UI'],[1,5,'frozen','download() — UI frozen'],[5,6,'ui','show']],b1:[[0,6,'ui','UI keeps drawing & responding'],[5,5.6,'post','update']],b2:[[1,5,'io','download()']]};
 return{n:()=>T+1,
  draw(t){Object.entries(plan).forEach(([k,blks])=>{const tr=$('[data-l="'+k+'"]',c);tr.innerHTML='<div class="vt-now" style="left:'+(t/T*100)+'%"></div>'+blks.filter(b=>t>b[0]).map(b=>'<div class="vt-blk '+b[2]+'" style="left:'+(b[0]/T*100)+'%;width:'+((Math.min(b[1],t)-b[0])/T*100)+'%">'+esc(b[3])+'</div>').join('')});
   const fz=t>1&&t<5;$('[data-u="a"]',c).innerHTML='Screen: '+(fz?'<b class="no">frozen — taps ignored'+(t>=4?' · “App isn’t responding” risk':'')+'</b>':t>=5?'<b class="ok">updated</b>':'<b class="ok">responsive</b>');
   $('[data-u="b"]',c).innerHTML='Screen: <b class="ok">responsive'+(t>=5?' · result shown ✓':' · spinner animating')+'</b>'},
  cap:t=>(o.caps||['Both apps start. The **main thread** draws the screen ~60 times a second.','The user taps **Download**. Left: work starts **on the main thread**. Right: `launch(Dispatchers.IO)` moves it to a background thread.','Left: the main thread is **busy**, it cannot draw or react. Right: the UI is still smooth.','Left: still frozen. Users think the app has crashed.','Left: after ~5 s Android may show **“App isn’t responding” (ANR)**. Right: download continues quietly.','The download ends. Right: `withContext(Dispatchers.Main)` posts the result back to the UI thread.','Rule: **never block the main thread**. Long work → background; UI updates → main.'])[t]};
};
/* storage targets */
Viz.storage=(c,o,ctl)=>{
 const loc=o.targets.filter(t=>t.where==='local'),rem=o.targets.filter(t=>t.where!=='local');
 const grp=(n,l)=>l.length?'<div class="vst-g"><small>'+n+'</small><div class="vst-ts">'+l.map(t=>'<button type="button" class="vst-t" data-t="'+esc(t.id)+'">'+esc(t.icon)+' '+esc(t.label)+'</button>').join('')+'</div></div>':'';
 c.innerHTML='<div class="vst"><div class="vst-app"><div class="ic">📱</div>Your app</div><div class="vst-groups">'+grp('On the device (local)',loc)+grp('Over the internet (remote)',rem)+'</div></div><div class="vz-code1 vst-code" style="margin-top:.6em"></div>';
 const code=$('.vst-code',c);
 $$('[data-t]',c).forEach(b=>b.addEventListener('click',()=>{ctl.pause();ctl.go(o.targets.findIndex(t=>t.id===b.dataset.t))}));
 return{n:()=>o.targets.length,note:'',
  draw(i){const t=o.targets[i];$$('[data-t]',c).forEach(b=>{b.classList.toggle('cur',b.dataset.t===t.id);const pk=$('.vst-pk',b);if(pk)pk.remove()});const b=$('[data-t="'+t.id+'"]',c);b.appendChild(el('span','vst-pk',t.where==='local'?'💾':'☁️'));code.innerHTML=t.code.split('\n').map(l=>hlLine(l,t.lang||'kotlin')).join('\n')},
  cap:i=>'**'+o.targets[i].label+'** — '+o.targets[i].desc};
};
/* broadcast delivery */
Viz.broadcast=(c,o)=>{
 c.innerHTML='<div class="vb"><div class="vb-src">'+esc(o.event)+'</div><div class="vb-apps">'+o.apps.map(a=>'<div class="vb-app"><span>'+esc(a.icon||'📱')+'</span><div><b>'+esc(a.name)+'</b><br><small>'+(a.reg?'registered for '+esc(o.short||'this event'):'not listening')+'</small></div><span class="st"></span></div>').join('')+'</div></div><div class="vz-code1" style="margin-top:.6em;font-size:.8em">'+hlLine('action = "'+o.action+'"','kotlin')+'</div>';
 const src=$('.vb-src',c),A=$$('.vb-app',c);
 return{n:()=>4,
  draw(i){src.classList.toggle('emit',i===1||i===2);A.forEach((d,k)=>{const a=o.apps[k],st=$('.st',d);d.className='vb-app';st.textContent='';if(i>=2){if(a.reg){d.classList.add('hit');st.textContent=i>=3?'✓ '+a.react:'onReceive()'}else d.classList.add('miss')}})},
  cap:i=>['Something happens in the system: **'+o.event+'**.','Android sends a **broadcast** — an Intent with action `'+o.action+'` — to everyone at once.','Only apps with a **registered BroadcastReceiver** for this action get `onReceive()`.','Each receiver reacts in its own way, quickly. Apps not listening are not disturbed.'][i]};
};
/* SQL table CRUD */
Viz.table=(c,o)=>{
 c.innerHTML='<div class="vtb"><div class="sql"></div><table style="margin-top:.6em"><thead><tr>'+o.cols.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody></tbody></table></div>';
 const sql=$('.sql',c),tb=$('tbody',c);
 return{n:()=>o.ops.length+1,note:'logic',
  draw(i){let rows=o.rows.map(r=>r.slice()),mark={};
   for(let k=0;k<i;k++){const p=o.ops[k],last=k===i-1;
    if(p.do==='insert'){rows.push(p.row.slice());if(last)mark[rows.length-1]='ins'}
    else if(p.do==='select'){if(last)rows.forEach((r,j)=>{if(!p.where||p.where(r))mark[j]='sel'})}
    else if(p.do==='update'){rows.forEach((r,j)=>{if(p.where(r)){Object.entries(p.set).forEach(([ci,v])=>r[ci]=v);if(last)mark[j]='upd'}})}
    else if(p.do==='delete'){if(last)rows.forEach((r,j)=>{if(p.where(r))mark[j]='del'});else rows=rows.filter(r=>!p.where(r))}}
   sql.innerHTML=hlLine(i?o.ops[i-1].sql:(o.create||'SELECT * FROM '+o.name+';'),'sql');
   tb.innerHTML=rows.map((r,j)=>'<tr class="'+(mark[j]||'')+'">'+r.map(v=>'<td>'+esc(v)+'</td>').join('')+'</tr>').join('')},
  cap:i=>i?o.ops[i-1].cap:(o.cap0||'The table **'+o.name+'**: each **row** is one record, each **column** one field.')};
};
/* tree reveal (JSON / folders) */
Viz.tree=(c,o)=>{
 let max=0;const render=(n,d)=>{max=Math.max(max,d);return'<li data-d="'+d+'"><span>'+esc(n.icon||'')+(n.icon?' ':'')+esc(n.k)+(n.v!=null?' <i>:</i> <em>'+esc(n.v)+'</em>':'')+'</span>'+(n.c?'<ul>'+n.c.map(x=>render(x,d+1)).join('')+'</ul>':'')+'</li>'};
 c.innerHTML='<div class="vtr"><ul>'+render(o.root,0)+'</ul></div>';const L=$$('li',c);
 return{n:()=>max+1,note:'',draw(i){L.forEach(li=>{const d=+li.dataset.d;li.classList.toggle('hid',d>i);li.classList.toggle('new',d===i)})},cap:i=>(o.caps||[])[i]||''};
};
/* code ↔ phone mapping (XML layouts, Compose) */
Viz.xmlphone=(c,o)=>{
 let count=0;
 c.innerHTML='<div class="vx"><div class="vz-code1">'+o.code.map((l,k)=>'<span class="xl" data-k="'+(k+1)+'">'+(hlLine(l,o.lang||'xml')||' ')+'</span>').join('')+'</div><div>'+phone(o.app||'My App',o.views.map(v=>v.type==='button'?'<button type="button" class="w-btn" data-v="'+v.id+'">'+esc(v.text)+'</button>':v.type==='edit'?'<input class="w-edit" data-v="'+v.id+'" value="'+esc(v.text)+'"'+(v.hint?' placeholder="'+esc(v.hint)+'"':'')+(v.num?' inputmode="numeric"':'')+' aria-label="'+esc(v.hint||v.id)+'">':v.type==='image'?'<div class="w-img" data-v="'+v.id+'">'+esc(v.text||'🖼')+'</div>':'<div class="w-text" data-v="'+v.id+'">'+esc(v.text)+'</div>').join(''))+'</div></div>';
 if(o.click){const b=$('[data-v="'+o.click.btn+'"]',c);b.addEventListener('click',()=>{count++;const t=$('[data-v="'+o.click.target+'"]',c);const src=o.click.from?($('[data-v="'+o.click.from+'"]',c).value||''):'';if(o.click.fn){const vals={};$$('.w-edit',c).forEach(x=>{vals[x.dataset.v]=x.value});t.textContent=o.click.fn(vals)}else t.textContent=o.click.text.replace('{n}',count).replace('{v}',src);t.classList.remove('on-pop');void t.offsetWidth;t.classList.add('on-pop')})}
 return{n:()=>o.steps.length,note:'',
  draw(i){const s=o.steps[i],[a,b]=parseRange(s.lines);$$('.xl',c).forEach(x=>{const k=+x.dataset.k;x.classList.toggle('on',k>=a&&k<=b)});$$('[data-v]',c).forEach(v=>v.classList.toggle('hl',(s.view||'').split(',').includes(v.dataset.v)))},
  cap:i=>o.steps[i].cap};
};
/* RecyclerView recycling */
Viz.recycler=(c,o)=>{
 const V=o.visible||5,N=o.items.length,cols=['#2563eb','#0891b2','#7c3aed','#059669','#d97706','#db2777'];
 c.innerHTML='<div class="vr"><div class="vr-stats"></div><div class="vr-win"></div></div>';const win=$('.vr-win',c),st=$('.vr-stats',c);
 return{n:()=>Math.min(N-V+1,o.steps||8),note:'sim',
  draw(i){let h='';for(let p=i;p<i+V;p++){const vh=p%(V+1);h+='<div class="vr-row'+(i>0&&p===i+V-1?' rec':'')+'"><i style="background:'+cols[vh%cols.length]+'">'+(vh+1)+'</i>'+esc(o.items[p])+'<small>pos '+p+'</small></div>'}win.innerHTML=h;
   st.innerHTML='<div><b>'+N+'</b>items in the list (data)</div><div><b>'+(V+1)+'</b>ViewHolders created (only once)</div><div><b>'+(V+i)+'</b>onBindViewHolder() calls</div>'},
  cap:i=>i===0?'Only the rows that fit on screen are created: **'+(V+1)+' ViewHolders** (one spare) for **'+N+' items**.':'Scrolled down: the row that left the top is **recycled** (same coloured number) and re-bound to item **'+(i+V-1)+'** — no new view was created.'};
};
/* GPS location */
Viz.gps=(c,o,ctl)=>{
 let prov='gps';const P=o.path||[[18,72],[30,64],[42,56],[55,50],[66,40],[78,30]];
 c.innerHTML='<div class="vg"><div class="vg-map"><div class="vg-road" style="left:10%;right:10%;top:52%;height:6px;transform:rotate(-28deg)"></div><span class="vg-sat" style="left:12%">🛰</span><span class="vg-sat" style="left:48%">🛰</span><span class="vg-sat" style="left:82%">🛰</span><div class="vg-acc"></div><div class="vg-dot"></div></div><div class="vg-panel"><div><i>Provider</i><span class="g-p"></span></div><div><i>Latitude</i><span class="g-la"></span></div><div><i>Longitude</i><span class="g-lo"></span></div><div><i>Accuracy</i><span class="g-ac"></span></div><div class="vz-row"><button type="button" class="vz-btn" data-p="gps">GPS</button><button type="button" class="vz-btn" data-p="net">Network</button></div></div></div>';
 $$('[data-p]',c).forEach(b=>b.addEventListener('click',()=>{prov=b.dataset.p;ctl.go(ctl.i)}));
 return{n:()=>P.length,
  draw(i){const [x,y]=P[i],acc=prov==='gps'?5:45;$('.vg-dot',c).style.left=x+'%';$('.vg-dot',c).style.top=y+'%';const a=$('.vg-acc',c);a.style.left=x+'%';a.style.top=y+'%';a.style.width=a.style.height=(prov==='gps'?6:30)+'%';
   $('.g-p',c).textContent=prov==='gps'?'GPS (satellites)':'Network (Wi-Fi / cell towers)';$('.g-la',c).textContent=(31.5204+(72-y)*0.0004).toFixed(5);$('.g-lo',c).textContent=(74.3587+(x-18)*0.0005).toFixed(5);$('.g-ac',c).textContent='± '+acc+' m';
   $$('[data-p]',c).forEach(b=>b.setAttribute('aria-pressed',b.dataset.p===prov))},
  cap:i=>i===0?'The device asks for location. **GPS** uses satellites (accurate, outdoors, more battery); **Network** uses Wi-Fi/cell towers (faster, less accurate).':'Location update '+i+': `onLocationChanged()` receives a new **latitude/longitude**. Toggle the provider to compare accuracy.'};
};
/* loading states */
Viz.progress=(c,o)=>{
 c.innerHTML='<div class="vpg"><div class="vpg-state"></div><div class="vpg-spin" hidden></div><div class="vpg-bar"><span style="width:0"></span></div><div class="vz-console" style="width:100%"></div></div>';
 const S=[['Idle','',0,false],['Loading… (indeterminate)','ProgressBar spins: we do not know how long it takes.',0,true],['Loading 40%','Determinate bar: we know the progress.',40,false],['Loading 85%','',85,false],[o.fail?'Error ✗':'Success ✓',o.fail?'Network error — show a Retry button.':'Loaded 20 students.',100,false]];
 return{n:()=>S.length,
  draw(i){const s=S[i];$('.vpg-state',c).textContent=s[0];$('.vpg-spin',c).hidden=!s[3];$('.vpg-bar span',c).style.width=s[2]+'%';$('.vz-console',c).textContent=s[1]},
  cap:i=>['**Idle**: nothing is happening yet. The button is enabled.','**Loading** (indeterminate): show a spinner and disable the button so it is not tapped twice.','**Progress** (determinate): update `progress = 40` from the background work.','Still loading — the UI stays responsive because the work is off the main thread.',o.fail?'**Error** state: hide the spinner, show a friendly message and Retry.':'**Success** state: hide the progress bar and show the data.'][i]};
};
/* notification */
Viz.notify=(c,o)=>{
 c.innerHTML='<div class="vp" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr)"><div class="ph"></div><div class="vz-code1 nt-code" style="font-size:.75em"></div></div>';
 const ph=$('.ph',c),code=$('.nt-code',c);
 const L=['// 1. Channel (Android 8+)','val ch = NotificationChannel("news", "News", IMPORTANCE_DEFAULT)','manager.createNotificationChannel(ch)','// 2. Build','val n = NotificationCompat.Builder(this, "news")','    .setSmallIcon(R.drawable.ic_bell)','    .setContentTitle("'+o.title+'")','    .setContentText("'+o.text+'")','    .setContentIntent(pendingIntent).build()','// 3. Show (needs POST_NOTIFICATIONS on Android 13+)','manager.notify(1, n)'];
 const R=[[0,2],[3,8],[9,10],[0,-1]];
 return{n:()=>4,
  draw(i){ph.innerHTML=phone('Home screen','<div class="phone-notif'+(i>=2&&i<3?' show':'')+'"><b>🔔 '+esc(o.title)+'</b><small>'+esc(o.text)+'</small></div>'+(i===3?'<div class="w-text on-pop" style="font-weight:800">'+esc(o.opens||'DetailsActivity')+' opened</div><div class="w-text" style="font-size:.8em">via PendingIntent</div>':'<div class="w-img">🏠</div>'));
   if(i===2)requestAnimationFrame(()=>requestAnimationFrame(()=>{const n=$('.phone-notif',ph);n&&n.classList.add('show')}));
   const [a,b]=R[i];code.innerHTML=L.map((l,k)=>'<span style="display:block;opacity:'+(k>=a&&k<=b?1:.35)+'">'+hlLine(l,'kotlin')+'</span>').join('')},
  cap:i=>['Create a **channel** once. Users can control each channel (sound, importance) in Settings.','**Build** the notification: icon, title, text and what happens on tap.','`notify()` shows it in the status bar. On Android 13+ the app must hold **POST_NOTIFICATIONS**.','The user taps it → the **PendingIntent** opens a screen in your app.'][i]};
};

/* ---------- v2.1 widgets (Kotlin + XML upgrade) ---------- */
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Android version timeline: tap a dot or step through; a card explains what changed for app developers */
Viz.timeline=(c,o,ctl)=>{
 const E=o.events,w=el('div','vtl');
 const track=el('div','vtl-track');track.setAttribute('role','list');track.setAttribute('aria-label',o.label||'Timeline');
 const B=E.map((e,k)=>{const li=el('div','vtl-item');li.setAttribute('role','listitem');const b=el('button','vtl-node','<i aria-hidden="true"></i><b>'+esc(e.y)+'</b><span>'+esc(e.short||plain(e.name))+'</span>');b.type='button';b.setAttribute('aria-label',e.y+': '+plain(e.name));
  b.addEventListener('click',()=>{ctl.pause();ctl.go(k)});li.appendChild(b);track.appendChild(li);return b});
 const card=el('div','vtl-card');w.appendChild(track);w.appendChild(card);c.appendChild(w);
 return{n:()=>E.length,note:'',
  draw(i){B.forEach((b,k)=>{b.classList.toggle('on',k<=i);b.classList.toggle('cur',k===i);if(k===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
   const e=E[i];card.innerHTML='<div class="vtl-head"><b>'+md(e.name)+'</b>'+(e.api?'<span class="vtl-api">API '+esc(e.api)+'</span>':'')+'<span class="vtl-year">'+esc(e.y)+'</span></div>'+(e.code?'<p class="vtl-cn">'+md(e.code)+'</p>':'')+'<p>'+md(e.what)+'</p>'+(e.dev?'<p class="vtl-dev"><b>For app developers:</b> '+md(e.dev)+'</p>':'');
   const b=B[i],x=b.parentNode.offsetLeft-track.clientWidth/2+b.offsetWidth/2;if(track.scrollTo)track.scrollTo({left:Math.max(0,x),behavior:reduceMotion()?'auto':'smooth'});else track.scrollLeft=x},
  cap:i=>'**'+(i+1)+' / '+E.length+'** · '+E[i].y+' · '+plain(E[i].name)};
};
/* code tracer: highlighted line + variables box + console. Steps are hand-authored states of a program
   whose output was checked with the real Kotlin compiler. Each step: {l:line, v:{var:value|null}, o:'printed line', n:'narration'} */
Viz.tracer=(c,o,ctl)=>{
 const w=el('div','vtc');c.appendChild(w);let S=[],L=[],code,vars,out,inp;
 function build(){
  const val=inp?+inp.value:undefined,src=o.codeFor?o.codeFor(val):o.code,steps=o.gen?o.gen(val):o.steps;
  let cur={};S=steps.map(s=>{const prev=cur;cur=Object.assign({},cur);Object.keys(s.v||{}).forEach(k=>{if(s.v[k]===null)delete cur[k];else cur[k]=s.v[k]});
   const ch=Object.keys(cur).filter(k=>prev[k]!==cur[k]);return Object.assign({},s,{vars:cur,changed:ch})});
  code.innerHTML=src.split('\n').map((l,k)=>'<span class="ln" data-n="'+(k+1)+'">'+(hlLine(l,'kotlin')||' ')+'</span>').join('');L=$$('.ln',code);
 }
 if(o.input){const r=el('label','vtc-in','<span>'+esc(o.input.label)+' =</span><input type="range" min="'+o.input.min+'" max="'+o.input.max+'" value="'+o.input.value+'"><b class="vz-mono"></b>');w.appendChild(r);inp=$('input',r);const show=$('b',r);
  inp.setAttribute('aria-label','Set '+o.input.label);show.textContent=inp.value;inp.addEventListener('input',()=>{show.textContent=inp.value;ctl.pause();build();ctl.go(0)})}
 const grid=el('div','vtc-grid');w.appendChild(grid);
 code=el('pre','vtc-code');code.tabIndex=0;code.setAttribute('aria-label','Program code');grid.appendChild(code);
 const side=el('div','vtc-side','<div><h4>Variables</h4><table class="vtc-vars"><tbody></tbody></table></div><div><h4>Console</h4><div class="vz-console" aria-label="Console output"></div></div>');grid.appendChild(side);
 vars=$('tbody',side);out=$('.vz-console',side);build();
 return{n:()=>S.length,note:'logic',
  draw(i){const s=S[i];L.forEach((x,k)=>x.classList.toggle('on',k+1===s.l));const ln=L[s.l-1];if(ln)code.scrollTop=Math.max(0,ln.offsetTop-code.clientHeight/2);
   const keys=Object.keys(s.vars);vars.innerHTML=keys.length?keys.map(k=>'<tr'+(s.changed.includes(k)?' class="ch"':'')+'><th>'+esc(k)+'</th><td>'+esc(s.vars[k])+'</td></tr>').join(''):'<tr><td class="mu">(none yet)</td></tr>';
   out.textContent=S.slice(0,i+1).filter(x=>x.o!=null).map(x=>x.o).join('\n')},
  cap:i=>'Line '+S[i].l+': '+(S[i].n||'')};
};
/* null safety: toggle the value between a name and null and watch each operator */
Viz.nullsafe=(c,o,ctl)=>{
 let v=o.value||'Ali';const w=el('div','vns');
 const tg=el('div','vns-toggle','<span class="vz-mono">var name: String? =</span><button type="button" data-v="1" aria-pressed="true">"'+esc(v)+'"</button><button type="button" data-v="0" aria-pressed="false">null</button>');
 const R=[{c:'name.length',r:()=>['bad','✗ Does not compile'],e:'The compiler refuses: name might be null.'},
  {c:'name?.length',r:x=>x?['ok',String(x.length)]:['warn','null'],e:'Safe call: if name is null, the whole thing is null instead of crashing.'},
  {c:'name ?: "Guest"',r:x=>x?['ok',x]:['ok','Guest'],e:'Elvis operator: use the value on the left, or the default on the right when it is null.'},
  {c:'name?.let { println("Hello, $it") }',r:x=>x?['ok','prints Hello, '+x]:['warn','(block skipped)'],e:'let runs the block only when name is not null. Inside, it is the name.'},
  {c:'name!!.length',r:x=>x?['ok',String(x.length)]:['bad','💥 NullPointerException: app crashes'],e:'!! means “trust me, it is not null”. If you are wrong, the app crashes.'}];
 const tb=el('div','vns-rows');const rows=R.map(r=>{const d=el('div','vns-row','<code>'+esc(r.c)+'</code><b></b>');tb.appendChild(d);return d});
 w.appendChild(tg);w.appendChild(tb);c.appendChild(w);
 $$('button',tg).forEach(b=>b.addEventListener('click',()=>{v=b.dataset.v==='1'?(o.value||'Ali'):null;$$('button',tg).forEach(x=>x.setAttribute('aria-pressed',x===b));ctl.go(ctl.i)}));
 return{n:()=>R.length,note:'logic',
  draw(i){rows.forEach((d,k)=>{const [cls,t]=R[k].r(v);const b=$('b',d);d.classList.toggle('on',k<=i);d.classList.toggle('cur',k===i);b.className=k<=i?cls:'';b.textContent=k<=i?t:'?'})},
  cap:i=>'`'+R[i].c+'` with name = '+(v?'"'+v+'"':'null')+' → '+R[i].e};
};
/* range explorer on a 0..20 number line */
Viz.range=(c,o,ctl)=>{
 const w=el('div','vrg');let vals=[];
 const f=el('div','vrg-form','<label>start<input type="number" min="0" max="20" value="'+(o.a!=null?o.a:1)+'"></label><label>kind<select><option value="..">..</option><option value="until">until</option><option value="downTo">downTo</option></select></label><label>end<input type="number" min="0" max="20" value="'+(o.b!=null?o.b:10)+'"></label><label>step<select>'+[1,2,3,4,5].map(n=>'<option>'+n+'</option>').join('')+'</select></label>');
 const [ia,ib]=$$('input',f),[sk,ss]=$$('select',f);sk.value=o.kind||'..';ss.value=String(o.step||1);
 const code=el('div','vrg-code vz-mono');const line=el('div','vrg-line');line.innerHTML=Array.from({length:21},(_,k)=>'<span data-k="'+k+'"><i></i><small>'+k+'</small></span>').join('');
 const outp=el('div','vz-console');outp.setAttribute('aria-label','Printed numbers');
 w.appendChild(f);w.appendChild(code);w.appendChild(line);w.appendChild(outp);c.appendChild(w);const D=$$('span',line);
 function calc(){const a=clamp(Math.round(+ia.value||0),0,20),b=clamp(Math.round(+ib.value||0),0,20),s=+ss.value,k=sk.value;ia.value=a;ib.value=b;vals=[];
  if(k==='downTo')for(let x=a;x>=b;x-=s)vals.push(x);else if(k==='until')for(let x=a;x<b;x+=s)vals.push(x);else for(let x=a;x<=b;x+=s)vals.push(x);
  code.textContent='for (i in '+a+(k==='..'?'..':' '+k+' ')+b+(s>1?' step '+s:'')+') print("$i ")'}
 [ia,ib,sk,ss].forEach(x=>x.addEventListener('change',()=>{ctl.pause();calc();ctl.go(0)}));calc();
 return{n:()=>vals.length+1,note:'logic',
  draw(i){D.forEach(d=>{const k=+d.dataset.k,j=vals.indexOf(k);d.classList.toggle('in',j>=0);d.classList.toggle('done',j>=0&&j<i-1);d.classList.toggle('cur',j>=0&&j===i-1)});outp.textContent=vals.slice(0,i).join(' ')},
  cap:i=>!vals.length?'This range is **empty**, so the loop body never runs.':i===0?'The highlighted dots are the values this loop will visit ('+vals.length+' in total). Press Step.':'i = **'+vals[i-1]+'**'+(i===vals.length?' — that was the last value, so the loop ends.':'')};
};
/* filter -> map -> sum conveyor belt */
Viz.conveyor=(c,o)=>{
 const X=o.items,keep=o.keep,map=o.map;const S=[{t:'src'}];X.forEach((x,k)=>S.push({t:'f',k}));const K=X.filter(keep),M=K.map(map);
 K.forEach((x,k)=>S.push({t:'m',k}));S.push({t:'sum'});
 const w=el('div','vcv');const lane=(lbl)=>{const d=el('div','vcv-lane','<span class="vcv-l">'+lbl+'</span><div class="vcv-chips"></div>');w.appendChild(d);return $('.vcv-chips',d)};
 const l0=lane(esc(o.name||'numbers')),l1=lane('<code>'+esc(o.f)+'</code>'),l2=lane('<code>'+esc(o.m)+'</code>'),l3=lane('<code>sum()</code>');c.appendChild(w);
 const chip=(v,cls)=>'<i class="'+(cls||'')+'">'+esc(v)+'</i>';
 return{n:()=>S.length,note:'logic',
  draw(i){const s=S[i];const seen=S.slice(0,i+1);const fk=seen.filter(x=>x.t==='f').length,mk=seen.filter(x=>x.t==='m').length;
   l0.innerHTML=X.map((x,k)=>chip(x,k<fk?'gone':(s.t==='src'||k===fk)?'cur':'')).join('');
   l1.innerHTML=X.slice(0,fk).map((x,k)=>chip(x,(keep(x)?'ok':'drop')+(s.t==='f'&&k===s.k?' cur':''))).join('');
   l2.innerHTML=M.slice(0,mk).map((x,k)=>chip(K[k]+' → '+x,s.t==='m'&&k===s.k?'ok cur':'ok')).join('');
   l3.innerHTML=s.t==='sum'?chip(M.join(' + ')+' = '+M.reduce((a,b)=>a+b,0),'ok cur'):''},
  cap:i=>{const s=S[i];if(s.t==='src')return'Start: '+(o.name||'numbers')+' = ['+X.join(', ')+']. Each item rides the belt one at a time.';
   if(s.t==='f'){const x=X[s.k];return'filter: `it` is **'+x+'** → '+(keep(x)?'**true**, keep it':'**false**, drop it')}
   if(s.t==='m')return'map: `it` is **'+K[s.k]+'** → becomes **'+M[s.k]+'**';return'sum() adds what is left: **'+M.reduce((a,b)=>a+b,0)+'**'}};
};

/* simplified Android Studio window: each step highlights one area (Project panel, editor, Layout Editor, Run, Device Manager, Logcat) */
Viz.studio=(c,o)=>{
 const code=o.code||'class MainActivity : AppCompatActivity() {\n    override fun onCreate(savedInstanceState: Bundle?) {\n        super.onCreate(savedInstanceState)\n        setContentView(R.layout.activity_main)\n    }\n}';
 c.innerHTML='<div class="vas" role="img" aria-label="Simplified drawing of the Android Studio window">'+
  '<div class="vas-bar" data-p="toolbar"><span class="vas-dots" aria-hidden="true"><i></i><i></i><i></i></span><b>'+esc(o.project||'MyFirstApp')+'</b><span class="vas-dev" data-p2="device">📱 Medium Phone API 36 ▾</span><span class="vas-run" data-p2="run">▶ Run</span></div>'+
  '<div class="vas-main"><div class="vas-proj" data-p="project"><b>Project</b><ul><li>📁 app</li><li class="i1">📁 manifests</li><li class="i2">📄 AndroidManifest.xml</li><li class="i1">📁 kotlin+java</li><li class="i2">📄 MainActivity.kt</li><li class="i1">📁 res</li><li class="i2">📁 layout</li><li class="i3">📄 activity_main.xml</li><li>🐘 Gradle Scripts</li></ul></div>'+
  '<div class="vas-ed" data-p="editor"><div class="vas-tabs"><i class="on">MainActivity.kt</i><i>activity_main.xml</i></div><pre>'+code.split('\n').map(l=>hlLine(l,'kotlin')).join('\n')+'</pre></div>'+
  '<div class="vas-prev" data-p="design"><b>Layout Editor</b><div class="vas-phone"><span>Hello, students!</span><i>Save</i></div></div></div>'+
  '<div class="vas-log" data-p="logcat"><b>Logcat</b><span>D/MainActivity: onCreate called</span></div></div>';
 const S=o.steps;const all=$$('[data-p],[data-p2]',c);
 return{n:()=>S.length,note:o.note===undefined?'A simplified drawing. Real Android Studio has more buttons, but these areas are in the same places.':o.note,
  draw(i){const k=S[i].p;all.forEach(e=>{const on=e.dataset.p===k||e.dataset.p2===k;e.classList.toggle('hl',on)});c.firstChild.classList.toggle('focus',!!k)},
  cap:i=>S[i].cap};
};

/* XML attribute lab: change orientation, gravity, textSize, button width and layout_weight; the XML and the phone update together */
Viz.attrlab=(c,o,ctl)=>{
 const st=Object.assign({ori:'vertical',grav:'center',size:22,bw:'wrap_content',weight:'none'},o.start||{});
 const w=el('div','val');
 const f=el('div','val-form',
  '<label>orientation<select data-k="ori"><option>vertical</option><option>horizontal</option></select></label>'+
  '<label>gravity<select data-k="grav"><option>start</option><option>center</option><option>end</option></select></label>'+
  '<label>textSize<select data-k="size"><option>14</option><option>18</option><option>22</option><option>28</option></select></label>'+
  '<label>button width<select data-k="bw"><option>wrap_content</option><option>match_parent</option></select></label>'+
  '<label>layout_weight<select data-k="weight"><option value="none">none</option><option value="11">1 : 1</option><option value="12">1 : 2</option></select></label>');
 const grid=el('div','val-grid');const code=el('pre','val-code');code.tabIndex=0;code.setAttribute('aria-label','XML that matches the phone');
 const ph=el('div','val-ph');grid.appendChild(code);grid.appendChild(ph);w.appendChild(f);w.appendChild(grid);c.appendChild(w);
 const S=$$('select',f);let prev=null;
 function xml(){const wt=st.weight!=='none',hz=st.ori==='horizontal',bw=wt?'0dp':st.bw;const dim=hz?'layout_width':'layout_height';
  const btn=(id,txt,wv)=>['    <Button','        android:id="@+id/'+id+'"','        android:layout_width="'+(wt&&hz?'0dp':st.bw)+'"','        android:layout_height="'+(wt&&!hz?'0dp':'wrap_content')+'"',(wt?'        android:layout_weight="'+wv+'"':null),'        android:text="'+txt+'" />'].filter(x=>x!==null);
  return ['<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"','    android:layout_width="match_parent"','    android:layout_height="match_parent"','    android:orientation="'+st.ori+'"','    android:gravity="'+st.grav+'"','    android:padding="16dp">','','    <TextView','        android:id="@+id/txtHello"','        android:layout_width="wrap_content"','        android:layout_height="wrap_content"','        android:text="Hello"','        android:textSize="'+st.size+'sp" />','']
   .concat(btn('btnOne','One',1),btn('btnTwo','Two',st.weight==='12'?2:1)).concat(['</LinearLayout>'])}
 function render(){S.forEach(s=>{s.value=String(st[s.dataset.k])});const L=xml();
  code.innerHTML=L.map((l,k)=>'<span class="ln'+(prev&&prev[k]!==l?' on':'')+'">'+(hlLine(l,'xml')||' ')+'</span>').join('');prev=L;
  const hz=st.ori==='horizontal',wt=st.weight!=='none',al={start:'flex-start',center:'center',end:'flex-end'}[st.grav];
  const bstyle=k=>wt?'flex:'+(k===2&&st.weight==='12'?2:1)+' 1 0;overflow:hidden;'+(hz?'min-width:0;padding-left:0;padding-right:0':'min-height:0;padding-top:0;padding-bottom:0'):(st.bw==='match_parent'?(hz?'flex:1 1 auto':'align-self:stretch'):'');
  ph.innerHTML=phone('My App','<div class="val-root" style="flex-direction:'+(hz?'row':'column')+';justify-content:'+al+';align-items:'+al+'"><div class="w-text" style="font-size:'+(st.size/16)+'em">Hello</div><button type="button" class="w-btn" style="'+bstyle(1)+'">One</button><button type="button" class="w-btn" style="'+bstyle(2)+'">Two</button></div>')}
 S.forEach(s=>s.addEventListener('change',()=>{const k=s.dataset.k;st[k]=k==='size'?+s.value:s.value;ctl.pause();render()}));
 const steps=o.steps||[];render();
 return{n:()=>steps.length,note:'',
  draw(i){Object.assign(st,steps[i].set||{});render()},
  cap:i=>steps[i].cap};
};
/* AutoCompleteTextView: suggestions appear after `threshold` letters, matching the start of an item (or of a word in it), ignoring case */
Viz.autocomplete=(c,o,ctl)=>{
 const items=o.items;let th=o.threshold||2;
 const w=el('div','vac');
 const f=el('div','vac-form','<label>threshold<select><option value="1">1</option><option value="2">2 (default)</option><option value="3">3</option></select></label>');
 const body='<div class="vac-box"><input class="w-edit" type="text" placeholder="'+esc(o.hint||'Enter country')+'" aria-label="'+esc(o.hint||'Enter country')+'" autocomplete="off"><ul class="vac-list" role="listbox"></ul></div><div class="w-text vac-out"></div>';
 const ph=el('div');ph.innerHTML=phone(o.app||'Countries',body);w.appendChild(f);w.appendChild(ph);c.appendChild(w);
 const inp=$('input',ph),list=$('.vac-list',ph),out=$('.vac-out',ph),sel=$('select',f);sel.value=String(th);
 const match=t=>{const q=t.toLowerCase();return items.filter(x=>x.toLowerCase().startsWith(q)||x.toLowerCase().split(/\s+/).some(wd=>wd.startsWith(q)))};
 function show(){const t=inp.value;const L=t.length>=th?match(t):[];list.innerHTML=L.map(x=>'<li role="option"><button type="button">'+esc(x)+'</button></li>').join('');
  $$('button',list).forEach(b=>b.addEventListener('click',()=>{inp.value=b.textContent;list.innerHTML='';out.textContent='Selected: '+b.textContent}));
  return L}
 inp.addEventListener('input',()=>{ctl.pause();out.textContent='';show()});
 sel.addEventListener('change',()=>{th=+sel.value;show()});
 const steps=o.steps||[];
 return{n:()=>steps.length,note:'',
  draw(i){const s=steps[i];if(s.threshold){th=s.threshold;sel.value=String(th)}inp.value=s.type||'';out.textContent='';const L=show();this._n=L.length},
  cap(i){const s=steps[i],t=s.type||'',L=t.length>=th?match(t):[];return s.cap+(t?' — typed **"'+t+'"** ('+t.length+' letter'+(t.length===1?'':'s')+', threshold '+th+'): '+(L.length?L.length+' suggestion'+(L.length>1?'s':''):'**no suggestions**'):'')}};
};

/* Activity back stack: each step pushes (startActivity) or pops (Back / finish) a screen */
Viz.backstack=(c,o)=>{
 const S=[[]];o.ops.forEach(op=>{const cur=S[S.length-1].slice();if(op[0]==='push')cur.push(op[1]);else cur.pop();S.push(cur)});
 const w=el('div','vbs');const st=el('div','vbs-stack');st.setAttribute('aria-label','Back stack, top first');const scr=el('div','vbs-screen');w.appendChild(st);w.appendChild(scr);c.appendChild(w);
 return{n:()=>S.length,note:'',
  draw(i){const cur=S[i],prev=S[i-1]||[];const pushed=i>0&&o.ops[i-1][0]==='push';
   st.innerHTML=cur.length?cur.slice().reverse().map((a,k)=>'<div class="vbs-card'+(k===0?' top':'')+(k===0&&pushed?' in':'')+'"><b>'+esc(a)+'</b>'+(k===0?'<small>visible</small>':'<small>waiting below</small>')+'</div>').join(''):'<div class="vbs-empty">Stack empty → home screen</div>';
   scr.innerHTML=phone(cur.length?cur[cur.length-1]:'Home screen',cur.length?'<div class="w-text">'+esc((o.texts||{})[cur[cur.length-1]]||'')+'</div>':'<div class="w-text" style="color:#64748b">📱 Your app is closed</div>')},
  cap(i){if(!i)return o.intro||'The app is not running yet.';const op=o.ops[i-1];return op[0]==='push'?'`startActivity(…)` **pushes** '+op[1]+' on top. The user now sees it.':'**Back** (or `finish()`) **pops** the top screen; the one below becomes visible again.'}};
};

/* Permission life-cycle (Android 11+ rules): deny once → explain (rationale) and ask again; deny twice → the dialog no longer appears → send the user to Settings */
Viz.permlife=(c,o,ctl)=>{
 const P=o.perm||'CAMERA';let st;
 const reset=()=>{st={granted:false,denies:0,dialog:false,rationale:false,settings:false,log:[]}};reset();
 const w=el('div','vpl');const ph=el('div','vpl-ph');const side=el('div','vpl-side');w.appendChild(ph);w.appendChild(side);c.appendChild(w);
 const rationale=()=>st.denies===1&&!st.granted;               /* shouldShowRequestPermissionRationale */
 const blocked=()=>st.denies>=2&&!st.granted;                 /* the system no longer shows the dialog */
 function tap(){st.dialog=false;st.rationale=false;st.settings=false;
  if(st.granted){st.log.push('✅ Already granted → '+o.feature);return}
  if(blocked()){st.log.push('🚫 launch() → no dialog, answer = denied at once');st.settings=true;return}
  if(rationale()){st.rationale=true;st.log.push('💡 rationale: explain why, then ask again');return}
  st.dialog=true;st.log.push('💬 system dialog shown')}
 function answer(a){if(!st.dialog)return;st.dialog=false;if(a){st.granted=true;st.log.push('✅ Allow → '+o.feature)}else{st.denies++;st.log.push('❌ Don’t allow ('+st.denies+')')}}
 function cont(){if(!st.rationale)return;st.rationale=false;st.dialog=true;st.log.push('💬 system dialog shown again')}
 function settings(){st.settings=false;st.granted=true;st.log.push('⚙️ user allowed it in Settings → '+o.feature)}
 const acts={tap,allow:()=>answer(true),deny:()=>answer(false),cont,settings,reset};
 function render(){let body='<button type="button" class="w-btn" data-x="tap">'+esc(o.action)+'</button>';
  if(st.granted)body+='<div class="w-img">'+esc(o.icon||'📷')+'</div>';
  if(st.dialog)body+='<div class="phone-dim"></div><div class="phone-dialog"><p>Allow <b>'+esc(o.app)+'</b> to '+esc(o.ask)+'?</p><div class="acts"><button type="button" data-x="deny">Don’t allow</button><button type="button" data-x="allow">Allow</button></div></div>';
  if(st.rationale)body+='<div class="phone-dim"></div><div class="phone-dialog"><p><b>Why we need this</b><br>'+esc(o.why)+'</p><div class="acts"><button type="button" data-x="cont">Continue</button></div></div>';
  if(st.settings)body+='<div class="phone-dim"></div><div class="phone-dialog"><p>'+esc(o.blockedMsg)+'</p><div class="acts"><button type="button" data-x="settings">Open Settings</button></div></div>';
  ph.innerHTML=phone(o.app,body);
  side.innerHTML='<table class="vtc-vars"><tbody><tr><th>granted</th><td>'+st.granted+'</td></tr><tr><th>times denied</th><td>'+st.denies+'</td></tr><tr><th>shouldShow…Rationale</th><td>'+rationale()+'</td></tr><tr><th>dialog still shown?</th><td>'+(!blocked())+'</td></tr></tbody></table><div class="vz-console">'+esc(st.log.slice(-6).join('\n'))+'</div><button type="button" class="vz-btn" data-x="reset">↺ New install</button>';
  $$('[data-x]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();acts[b.dataset.x]();render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'',
  draw(i){reset();for(let k=1;k<=i;k++)acts[S[k].a]();render()},
  cap:i=>S[i].cap};
};

/* scaleType lab: one wide picture in a fixed 200dp box. CSS object-fit matches Android: centerCrop=cover, fitCenter=contain, centerInside=scale-down, fitXY=fill */
const PIC='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120" viewBox="0 0 240 120"><rect width="240" height="120" fill="#0ea5e9"/><circle cx="40" cy="30" r="16" fill="#fde047"/><path d="M0 120 L70 50 L120 100 L170 40 L240 120 Z" fill="#065f46"/><rect x="0" y="0" width="240" height="120" fill="none" stroke="#f43f5e" stroke-width="6"/><text x="120" y="70" font-family="sans-serif" font-size="22" font-weight="bold" fill="#fff" text-anchor="middle">logo.png</text></svg>');
Viz.scaletype=(c,o,ctl)=>{
 const T=[['centerCrop','cover','Fills the whole box; the extra edges are cut off.'],['fitCenter','contain','The whole picture is visible and centred; empty strips may appear.'],['centerInside','scale-down','Like fitCenter, but never makes a small picture bigger.'],['fitXY','fill','Stretches to fill the box exactly; the picture can look squashed.']];
 const w=el('div','vsc');const sel=el('div','vsc-form','<label>android:scaleType<select>'+T.map(t=>'<option>'+t[0]+'</option>').join('')+'</select></label><span class="vz-mono">200dp × 200dp ImageView · picture 2:1 (wide)</span>');
 const box=el('div','vsc-box','<img alt="A wide picture with a red border, shown inside a square ImageView">');w.appendChild(sel);w.appendChild(box);c.appendChild(w);
 const s=$('select',sel),img=$('img',box);img.src=o.src||PIC;let cur=0;
 s.addEventListener('change',()=>{ctl.pause();cur=T.findIndex(t=>t[0]===s.value);img.style.objectFit=T[cur][1];ctl.go(cur)});
 return{n:()=>T.length,note:'',draw(i){cur=i;s.value=T[i][0];img.style.objectFit=T[i][1]},cap:i=>'**'+T[i][0]+'** — '+T[i][2]+' Watch the red border.'};
};
/* animation lab: choose a tween type and duration; shows the res/anim XML and plays it on the logo */
Viz.animlab=(c,o,ctl)=>{
 const st={type:'alpha',dur:2000};
 const w=el('div','vanl');
 const f=el('div','vanl-form','<label>type<select data-k="type"><option value="alpha">alpha (fade)</option><option value="translate">translate (move)</option><option value="scale">scale (grow)</option><option value="rotate">rotate (spin)</option></select></label><label>duration<select data-k="dur"><option value="500">500 ms</option><option value="1000">1000 ms</option><option value="2000">2000 ms</option></select></label><button type="button" class="vz-btn" data-x="run">▶ startAnimation()</button>');
 const grid=el('div','vanl-grid');const code=el('pre','val-code');code.tabIndex=0;const stage=el('div','vanl-stage','<div class="vanl-track"><div class="vanl-logo" role="img" aria-label="App logo">🤖</div></div><div class="vanl-t vz-mono">t = 0 ms</div>');
 grid.appendChild(code);grid.appendChild(stage);w.appendChild(f);w.appendChild(grid);c.appendChild(w);
 const logo=$('.vanl-logo',stage),tl=$('.vanl-t',stage);let anim=null,raf=0;
 const X={alpha:d=>['<alpha xmlns:android="http://schemas.android.com/apk/res/android"','    android:duration="'+d+'"','    android:fromAlpha="0.0"','    android:toAlpha="1.0" />'],
  translate:d=>['<translate xmlns:android="http://schemas.android.com/apk/res/android"','    android:duration="'+d+'"','    android:fromXDelta="0%"','    android:toXDelta="100%" />'],
  scale:d=>['<scale xmlns:android="http://schemas.android.com/apk/res/android"','    android:duration="'+d+'"','    android:fromXScale="0.5"','    android:toXScale="1.5"','    android:fromYScale="0.5"','    android:toYScale="1.5"','    android:pivotX="50%"','    android:pivotY="50%" />'],
  rotate:d=>['<rotate xmlns:android="http://schemas.android.com/apk/res/android"','    android:duration="'+d+'"','    android:fromDegrees="0"','    android:toDegrees="360"','    android:pivotX="50%"','    android:pivotY="50%" />']};
 const K={alpha:[{opacity:0},{opacity:1}],translate:[{transform:'translateX(0)'},{transform:'translateX(100%)'}],scale:[{transform:'scale(.5)'},{transform:'scale(1.5)'}],rotate:[{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}]};
 function show(){$$('select',f).forEach(s=>{s.value=String(st[s.dataset.k])});code.innerHTML=X[st.type](st.dur).map(l=>'<span class="ln">'+(hlLine(l,'xml')||' ')+'</span>').join('');}
 function run(){if(anim)anim.cancel();cancelAnimationFrame(raf);const reduce=reduceMotion();
  if(reduce||!logo.animate){logo.style.opacity='';logo.style.transform=K[st.type][1].transform||'';tl.textContent='Reduced motion: showing the end state (t = '+st.dur+' ms)';return}
  anim=logo.animate(K[st.type],{duration:st.dur,easing:'linear'});const t0=performance.now();
  const tick=()=>{const t=Math.min(st.dur,Math.round(performance.now()-t0));tl.textContent='t = '+t+' ms';if(t<st.dur)raf=requestAnimationFrame(tick);else tl.textContent='t = '+st.dur+' ms — finished; the view jumps back (fillAfter is false)'};raf=requestAnimationFrame(tick)}
 $$('select',f).forEach(s=>s.addEventListener('change',()=>{const k=s.dataset.k;st[k]=k==='dur'?+s.value:s.value;ctl.pause();show()}));
 $('[data-x]',f).addEventListener('click',run);show();
 const S=o.steps;
 return{n:()=>S.length,note:'',draw(i){Object.assign(st,S[i].set||{});show();if(S[i].play)run()},cap:i=>S[i].cap,
  destroy(){if(anim)anim.cancel();cancelAnimationFrame(raf)}};
};

/* SharedPreferences live demo: the phone UI on one side, the real MyPrefs.xml file on the other. "Close app" clears the screen but not the file. */
Viz.prefsdemo=(c,o,ctl)=>{
 let file={},screen={name:'',age:'',result:''},open=true,log=[];
 const w=el('div','vpd');const ph=el('div','vpd-ph');const side=el('div','vpd-side');w.appendChild(ph);w.appendChild(side);c.appendChild(w);
 const xml=()=>{const L=["<?xml version='1.0' encoding='utf-8' standalone='yes' ?>",'<map>'];
  if(file.username!==undefined)L.push('    <string name="username">'+file.username.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</string>');
  if(file.userage!==undefined)L.push('    <int name="userage" value="'+file.userage+'" />');L.push('</map>');return L};
 const A={
  type(v){screen.name=v.name;screen.age=v.age},
  save(){const age=parseInt(screen.age,10);if(!/^[+-]?\d+$/.test(String(screen.age).trim())||!(age>=-2147483648&&age<=2147483647)){log.push('Toast: Enter a valid age');return}
   file.username=screen.name;file.userage=age;log.push('apply() → saved to MyPrefs.xml')},
  load(){screen.result='Name: '+(file.username!==undefined?file.username:'No Name')+'\nAge: '+(file.userage!==undefined?file.userage:0);log.push('getString / getInt → shown on screen')},
  close(){open=false;screen={name:'',age:'',result:''};log.push('app closed — the screen is gone')},
  reopen(){open=true;log.push('app opened again')},
  clear(){file={};log.push('edit().clear().apply() → file emptied')},
  reset(){file={};screen={name:'',age:'',result:''};open=true;log=[]}};
 function render(){
  const body=open?'<input class="w-edit" data-f="name" placeholder="Enter Name" aria-label="Name" value="'+esc(screen.name)+'"><input class="w-edit" data-f="age" placeholder="Enter Age" inputmode="numeric" aria-label="Age" value="'+esc(screen.age)+'"><button type="button" class="w-btn" data-x="save">Save Data</button><button type="button" class="w-btn" data-x="load">Load Data</button><div class="w-text vpd-res">'+esc(screen.result).replace(/\n/g,'<br>')+'</div>':'<div class="w-text" style="color:#64748b">📱 App closed</div><button type="button" class="w-btn" data-x="reopen">Open the app again</button>';
  ph.innerHTML=phone('SharedPrefDemo',body);
  side.innerHTML='<h4 class="vpd-h">/data/data/…/shared_prefs/MyPrefs.xml</h4><pre class="val-code vpd-file">'+xml().map(l=>'<span class="ln">'+hlLine(l,'xml')+'</span>').join('')+'</pre><div class="vz-console">'+esc(log.slice(-4).join('\n'))+'</div><div class="vpd-acts"><button type="button" class="vz-btn" data-x="close">Close app</button><button type="button" class="vz-btn" data-x="clear">Clear prefs</button></div>';
  $$('[data-f]',ph).forEach(i=>i.addEventListener('input',()=>{screen[i.dataset.f]=i.value}));
  $$('[data-x]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();A[b.dataset.x]();render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'',draw(i){A.reset();for(let k=0;k<=i;k++)if(S[k].a)A[S[k].a](S[k].v);render()},cap:i=>S[i].cap};
};
/* Storage chooser: four yes/no questions → the storage the instructor's decision guide recommends */
Viz.storechooser=(c,o,ctl)=>{
 const Q=[['small','Is it only a few small settings (name, theme, a flag)?'],['net','Must several users or devices share the data?'],['live','Must changes appear on other phones instantly (real time)?'],['php','Do you already have a PHP / web server and database?']];
 const st={small:true,net:false,live:false,php:false};
 const w=el('div','vsch');const qs=el('div','vsch-q');const out=el('div','vsch-out');w.appendChild(qs);w.appendChild(out);c.appendChild(w);
 function pick(){if(!st.net)return st.small?['🗝️','SharedPreferences','Small settings on this phone only. (Lecture 8 — today)']:['🗃️','SQLite (or Room)','Structured records on this phone, offline. (Lecture 11)'];
  if(st.live||!st.php)return['🔥','Firebase','Shared cloud data with real-time sync and no server to run. (Lecture 12)'];return['🖥️','MySQL + PHP','Shared data through your own web server. (Lecture 13)']}
 function render(){qs.innerHTML=Q.map(([k,t])=>'<div class="vsch-row"><span>'+esc(t)+'</span><span class="vsch-yn"><button type="button" data-k="'+k+'" data-v="1" aria-pressed="'+st[k]+'">Yes</button><button type="button" data-k="'+k+'" data-v="0" aria-pressed="'+!st[k]+'">No</button></span></div>').join('');
  const p=pick();out.innerHTML='<span class="vsch-ic">'+p[0]+'</span><div><b>'+esc(p[1])+'</b><small>'+esc(p[2])+'</small></div>';
  $$('[data-k]',qs).forEach(b=>b.addEventListener('click',()=>{ctl.pause();st[b.dataset.k]=b.dataset.v==='1';render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'',draw(i){Object.assign(st,S[i].set);render()},cap:i=>S[i].cap+' → **'+pick()[1]+'**'};
};
/* Rotation lab: one counter kept three ways (plain Activity variable, onSaveInstanceState Bundle, ViewModel) through rotate, process death and finish(). The callbacks appear in a Logcat box. */
Viz.rotatelab=(c,o,ctl)=>{
 let st,log;
 const w=el('div','vrl');c.appendChild(w);
 const L=(...a)=>a.forEach(x=>log.push(x));
 const A={
  reset(){st={v:0,b:0,m:0,saved:0,land:false,gone:false,bg:false,spin:false};log=[]},
  open(){L('onCreate(savedInstanceState = null)','onStart()','onResume()')},
  plus(v){if(st.gone||st.bg)return;const n=v||1;st.v+=n;st.b+=n;st.m+=n;L('tap + → count = '+st.m)},
  rotate(){if(st.gone||st.bg)return;st.saved=st.b;L('— rotate —','onPause()','onStop()','onSaveInstanceState(outState)  // count saved','onDestroy()  // old object gone','onCreate(savedInstanceState ≠ null)','onStart()','onResume()');st.land=!st.land;st.v=0;st.b=st.saved;st.spin=true},
  home(){if(st.gone||st.bg)return;st.saved=st.b;st.bg=true;L('— Home —','onPause()','onStop()','onSaveInstanceState(outState)')},
  kill(){if(!st.bg)return;L('— system needs memory: process killed —','(no onDestroy is called!)');st.v=0;st.m=0;st.b=0;st.killed=true},
  back(){if(!st.bg)return;st.bg=false;if(st.killed){st.b=st.saved;st.killed=false;L('— user returns —','onCreate(savedInstanceState ≠ null)','onStart()','onResume()')}else L('— user returns —','onRestart()','onStart()','onResume()')},
  finish(){if(st.gone||st.bg)return;st.gone=true;L('— finish() —','onPause()','onStop()','onDestroy()  // nothing is saved');st.v=0;st.b=0;st.m=0},
  reopen(){if(!st.gone)return;st.gone=false;A.open()}};
 const cell=(icon,name,val,note)=>'<div class="vrl-cell"><span class="vrl-ic">'+icon+'</span><small>'+esc(name)+'</small><b>'+val+'</b><em>'+esc(note)+'</em></div>';
 function render(){
  const body=st.gone?'<div class="w-text" style="color:#64748b">Activity finished</div><button type="button" class="w-btn" data-x="reopen">Open again</button>':st.bg?'<div class="w-text" style="color:#64748b">🏠 App in the background</div>'+(st.killed?'':'<button type="button" class="w-btn" data-x="kill">Kill the process</button>')+'<button type="button" class="w-btn" data-x="back">Return to the app</button>':'<div class="w-text vrl-big">'+st.b+'</div><button type="button" class="w-btn" data-x="plus">+ 1</button>';
  w.innerHTML='<div class="vrl-ph'+(st.land?' land':'')+(st.spin&&!reduceMotion()?' spin':'')+'">'+phone('CounterApp · '+(st.land?'landscape':'portrait'),body)+'</div><div class="vrl-side"><div class="vrl-cells">'+cell('📦','var count in the Activity',st.gone||st.bg&&st.killed?0:st.v,'lost on rotation')+cell('💾','onSaveInstanceState Bundle',st.gone?0:(st.bg?st.saved:st.b),'survives rotation and process death')+cell('🧠','ViewModel',st.gone||st.killed?0:st.m,'survives rotation')+'</div><div class="vz-console vrl-log">'+esc(log.slice(-8).join('\n'))+'</div><div class="vpd-acts"><button type="button" class="vz-btn" data-x="rotate">🔄 Rotate</button><button type="button" class="vz-btn" data-x="home">🏠 Home</button><button type="button" class="vz-btn" data-x="finish">✖ finish()</button></div></div>';
  st.spin=false;
  $$('[data-x]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();A[b.dataset.x]();render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'',draw(i){A.reset();A.open();for(let k=0;k<=i;k++)if(S[k].a)A[S[k].a](S[k].v);render()},cap:i=>S[i].cap};
};
/* Splash race: what the user sees over time with the old 3-second SplashActivity vs the SplashScreen API. */
Viz.splashrace=(c,o,ctl)=>{
 const lanes=o.lanes,max=o.max||4;
 const w=el('div','vsr');c.appendChild(w);
 function at(l,t){let cur=l.segs[0];for(const s of l.segs)if(t>=s[0])cur=s;return cur}
 function render(t){
  w.innerHTML=lanes.map(l=>{const cur=at(l,t);
   return '<div class="vsr-lane"><div class="vsr-h"><b>'+esc(l.label)+'</b><small>'+esc(l.sub||'')+'</small></div><div class="vsr-row"><div class="vsr-mini" style="background:'+cur[3]+'"><span>'+cur[2]+'</span><small>'+esc(cur[1])+'</small></div><div class="vsr-bar">'+l.segs.map((s,k)=>{const e=k+1<l.segs.length?l.segs[k+1][0]:max;return '<i style="left:'+(s[0]/max*100)+'%;width:'+((e-s[0])/max*100)+'%;background:'+s[3]+';opacity:'+(t>=s[0]?1:.25)+'" title="'+esc(s[1])+'"><span>'+esc(s[1])+'</span></i>'}).join('')+'<em class="vsr-cur" style="left:'+(Math.min(t,max)/max*100)+'%"></em></div></div></div>'}).join('')+'<div class="vsr-t">t = '+t.toFixed(1)+' s</div>'}
 const S=o.script;
 return{n:()=>S.length,note:'',draw(i){render(S[i].t)},cap:i=>S[i].cap};
};
/* getView lab: scroll a ListView one row per step; count getView(), inflate() and findViewById() calls with row reuse and the ViewHolder (binding in tag) switched on or off. */
Viz.getviewlab=(c,o,ctl)=>{
 const V=o.visible||5,items=o.items,N=items.length,F=o.fields||4,opt={reuse:true,holder:true};
 const cols=['#2563eb','#0891b2','#7c3aed','#059669','#d97706','#db2777'];
 const w=el('div','vgv');c.appendChild(w);
 const tg=(k,label)=>'<button type="button" class="vz-btn" data-o="'+k+'" aria-pressed="'+opt[k]+'">'+(opt[k]?'✓ ':'✗ ')+label+'</button>';
 function render(i){
  const calls=V+i,infl=opt.reuse?V+(i>0?1:0):calls,find=F*(opt.holder&&opt.reuse?infl:calls);
  let rows='';for(let p=i;p<i+V;p++){const id=opt.reuse?p%(V+1):p,isNew=i>0&&p===i+V-1;rows+='<div class="vgv-row'+(isNew?' new':'')+'"><i style="background:'+cols[id%cols.length]+'">'+(opt.reuse?'#'+(id+1):'new')+'</i><span>'+esc(items[p])+'</span><small>pos '+p+'</small></div>'}
  const last=i===0?'first screen: getView(0…'+(V-1)+', convertView = null) → inflate '+V+' rows':'getView('+(i+V-1)+', convertView = '+(opt.reuse?(i===1?'null) → nothing scrapped yet: inflate one spare row':'row #'+((i+V-1)%(V+1)+1)+') → reuse it'):'ignored) → inflate a NEW row')+(opt.holder&&opt.reuse?', views from tag':', findViewById() × '+F);
  w.innerHTML='<div class="vgv-win">'+rows+'</div><div class="vgv-side"><div class="vgv-stats"><div><b>'+N+'</b>songs in the list</div><div><b>'+calls+'</b>getView() calls</div><div class="'+(infl>V+1?'bad':'')+'"><b>'+infl+'</b>rows inflated</div><div class="'+(find>F*(V+1)?'bad':'')+'"><b>'+find+'</b>findViewById() calls</div></div><div class="vz-console">'+esc(last)+'</div><div class="vpd-acts">'+tg('reuse','Reuse convertView')+tg('holder','ViewHolder (tag)')+'</div></div>';
  $$('[data-o]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();opt[b.dataset.o]=!opt[b.dataset.o];render(ctl.i||0)}))}
 return{n:()=>Math.min(N-V+1,o.steps||10),note:'sim',draw(i){render(i)},
  cap:i=>i===0?'Only the **'+V+' visible rows** are inflated, even though the list has **'+N+'** songs.':i===1?'First scroll: the new bottom row appears before the top one leaves, so **one spare row** is inflated (6 in total).':'Scrolled '+i+' rows: the row that left the top is handed back as **convertView** and filled with song **'+(i+V-1)+'**. Switch the options off to see the cost.'};
};
/* Latitude / longitude map: equirectangular grid; step through cities, or tap one. */
Viz.latlng=(c,o,ctl)=>{
 const P=o.places,w=el('div','vll');c.appendChild(w);
 const X=lon=>lon+180,Y=lat=>90-lat;
 let grid='';for(let lo=-150;lo<=150;lo+=30)grid+='<line x1="'+X(lo)+'" y1="0" x2="'+X(lo)+'" y2="180" class="g"/>';for(let la=-60;la<=60;la+=30)grid+='<line x1="0" y1="'+Y(la)+'" x2="360" y2="'+Y(la)+'" class="g"/>';
 function render(k){const p=P[k];
  const dots=P.map((q,j)=>'<circle cx="'+X(q.lon)+'" cy="'+Y(q.lat)+'" r="'+(j===k?4.5:2.6)+'" class="'+(j===k?'cur':'d')+'"/>').join('');
  w.innerHTML='<div class="vll-map"><svg viewBox="0 0 360 180" role="img" aria-label="World grid with the equator, the prime meridian and city points">'+grid+'<line x1="0" y1="90" x2="360" y2="90" class="eq"/><line x1="180" y1="0" x2="180" y2="180" class="pm"/><line x1="0" y1="'+Y(p.lat)+'" x2="'+X(p.lon)+'" y2="'+Y(p.lat)+'" class="lat"/><line x1="'+X(p.lon)+'" y1="180" x2="'+X(p.lon)+'" y2="'+Y(p.lat)+'" class="lon"/>'+dots+'<text x="4" y="86" class="t">Equator 0°</text><text x="183" y="10" class="t">Prime meridian 0°</text><text x="176" y="176" class="t">S</text><text x="176" y="20" class="t">N</text></svg></div><div class="vll-side"><b class="vll-name">'+esc(p.name)+'</b><div class="vll-v lat"><i>latitude</i>'+p.lat.toFixed(4)+'° <small>'+(p.lat>=0?'North of the equator (+)':'South of the equator (−)')+'</small></div><div class="vll-v lon"><i>longitude</i>'+p.lon.toFixed(4)+'° <small>'+(p.lon>=0?'East of Greenwich (+)':'West of Greenwich (−)')+'</small></div><div class="vz-console">location.latitude  = '+p.lat+'\nlocation.longitude = '+p.lon+'</div><div class="vpd-acts">'+P.map((q,j)=>'<button type="button" class="vz-btn" data-k="'+j+'" aria-pressed="'+(j===k)+'">'+esc(q.short||q.name)+'</button>').join('')+'</div></div>';
  $$('[data-k]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();ctl.go(+b.dataset.k)}))}
 return{n:()=>P.length,note:'',draw(i){render(i)},cap:i=>P[i].cap||''};
};
/* Location app flow on a phone: idle → permission → loading → coordinates → address. */
Viz.locflow=(c,o)=>{
 const w=el('div','vlf');c.appendChild(w);const S=o.steps;
 const scr={
  idle:()=>'<button type="button" class="w-btn">📡 Get my location</button><div class="w-text vlf-k">Latitude: --<br>Longitude: --<br>Address: --</div>',
  perm:()=>'<div class="vlf-dim"><div class="vlf-dlg"><b>Allow '+esc(o.app||'GPS Demo')+' to access this device’s location?</b><div class="vlf-pick"><span class="on">◉ Precise</span><span>○ Approximate</span></div><span class="vlf-opt">While using the app</span><span class="vlf-opt">Only this time</span><span class="vlf-opt">Don’t allow</span></div></div>',
  load:()=>'<button type="button" class="w-btn" disabled style="opacity:.5">📡 Get my location</button><div class="vlf-spin" aria-hidden="true"></div><div class="w-text vlf-k" style="text-align:center">Getting your location…</div>',
  coords:s=>'<button type="button" class="w-btn">📡 Get my location</button><div class="w-text vlf-k">Latitude: '+s.lat+'<br>Longitude: '+s.lon+'<br><small>± '+s.acc+' m</small><br>Address: …</div>',
  addr:s=>'<button type="button" class="w-btn">📡 Get my location</button><div class="w-text vlf-k">Latitude: '+s.lat+'<br>Longitude: '+s.lon+'<br><small>± '+s.acc+' m</small><br>Address:<br><b>'+esc(s.addr)+'</b></div>'};
 return{n:()=>S.length,note:'sim',
  draw(i){const s=S[i];w.innerHTML='<div class="vlf-ph">'+phone(o.app||'GPS Demo',scr[s.screen](s))+'</div><div class="vlf-side"><div class="vlf-steps">'+S.map((x,j)=>'<span class="'+(j===i?'cur':j<i?'done':'')+'">'+(j+1)+'. '+esc(x.label)+'</span>').join('')+'</div><pre class="val-code vlf-code">'+(s.code||'').split('\n').map(l=>'<span class="ln">'+hlLine(l,'kotlin')+'</span>').join('')+'</pre></div>'},
  cap:i=>S[i].cap};
};
/* Cursor walker: the cursor arrow moves row by row through a query result while the matching Kotlin line lights up. */
Viz.cursorwalk=(c,o)=>{
 const R=o.rows,C=o.cols,L=o.code.split('\n'),at=o.at;
 const S=[{k:'query',pos:-1,cap:'`rawQuery()` runs the SELECT. The cursor waits **before** the first row (position −1).'}];
 R.forEach((r,i)=>{S.push({k:i?'next':'first',pos:i,ret:true,cap:(i||o.loop==='while'?'`moveToNext()`':'`moveToFirst()`')+' returns **true**: the cursor points at row '+i+'.'});S.push({k:'read',pos:i,read:i,cap:'Read the columns of the current row with `getInt` / `getString` (by column name).'})});
 S.push({k:'next',pos:R.length,ret:false,cap:'`moveToNext()` returns **false**: no more rows, the loop ends.'});
 S.push({k:'close',pos:R.length,closed:true,cap:'`close()` frees the cursor. Always close it (or use `.use { }`).'});
 const w=el('div','vcw');c.appendChild(w);
 return{n:()=>S.length,note:'logic',
  draw(i){const s=S[i],out=[];for(let k=0;k<=i;k++)if(S[k].read!=null)out.push(o.line(R[S[k].read]));
   const rows=R.map((r,j)=>'<tr class="'+(j===s.pos&&!s.closed?'cur':'')+(j<s.pos||s.closed?' seen':'')+'"><td class="vcw-ar">'+(j===s.pos&&!s.closed?'▶':'')+'</td>'+r.map(v=>'<td>'+esc(String(v))+'</td>').join('')+'</tr>').join('');
   const pre=s.pos===-1?'<tr class="cur"><td class="vcw-ar">▶</td><td colspan="'+C.length+'" class="vcw-edge">before first (−1)</td></tr>':'',post=s.pos===R.length&&!s.closed?'<tr class="cur"><td class="vcw-ar">▶</td><td colspan="'+C.length+'" class="vcw-edge">after last</td></tr>':'';
   const hl=at[s.k];
   w.innerHTML='<div class="vcw-l"><table class="vcw-t'+(s.closed?' closed':'')+'"><thead><tr><th></th>'+C.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+pre+rows+post+'</tbody></table>'+(s.ret!=null?'<div class="vcw-ret '+(s.ret?'ok':'no')+'">returns '+s.ret+'</div>':'')+'</div><div class="vcw-r"><pre class="val-code">'+L.map((l,k)=>'<span class="ln'+(k===hl||(Array.isArray(hl)&&hl.includes(k))?' vcw-hl':'')+'">'+hlLine(l,'kotlin')+'</span>').join('')+'</pre><div class="vz-console">'+esc(out.join('\n')||' ')+'</div></div>'},
  cap:i=>S[i].cap};
};
/* Filter builder: choose WHERE / LIKE / city / ORDER BY / LIMIT; see the SQL with ? placeholders, the args, and the rows that match. */
Viz.sqlfilter=(c,o,ctl)=>{
 const R=o.rows,C=o.cols,st={min:'',like:'',city:'',order:'',limit:''};
 const opts={min:['','50','70','85'],like:['','A','S','H'],city:['','Okara','Lahore','Karachi'],order:['','marks DESC','name ASC'],limit:['','3']};
 const lab={min:'marks ≥',like:'name starts with',city:'city =',order:'ORDER BY',limit:'LIMIT'};
 const w=el('div','vsf');c.appendChild(w);
 function run(){let r=R.slice();const where=[],args=[];
  if(st.min){where.push('marks >= ?');args.push(st.min);r=r.filter(x=>x[4]>=+st.min)}
  if(st.like){where.push('name LIKE ?');args.push(st.like+'%');r=r.filter(x=>x[1].toLowerCase().startsWith(st.like.toLowerCase()))}
  if(st.city){where.push('city = ?');args.push(st.city);r=r.filter(x=>x[3]===st.city)}
  if(st.order==='marks DESC')r.sort((a,b)=>b[4]-a[4]);else if(st.order==='name ASC')r.sort((a,b)=>a[1].localeCompare(b[1]));
  if(st.limit)r=r.slice(0,+st.limit);
  const sql='SELECT * FROM students'+(where.length?'\nWHERE '+where.join(' AND '):'')+(st.order?'\nORDER BY '+st.order:'')+(st.limit?'\nLIMIT '+st.limit:'');
  return{r,sql,args}}
 function render(){const q=run();
  w.innerHTML='<div class="vsf-ctl">'+Object.keys(opts).map(k=>'<label><span>'+lab[k]+'</span><select data-k="'+k+'">'+opts[k].map(v=>'<option value="'+v+'"'+(st[k]===v?' selected':'')+'>'+(v||'—')+'</option>').join('')+'</select></label>').join('')+'</div><pre class="val-code vsf-sql">'+q.sql.split('\n').map(l=>'<span class="ln">'+hlLine(l,'sql')+'</span>').join('')+'</pre><div class="vsf-args">args = arrayOf('+q.args.map(a=>'"'+esc(a)+'"').join(', ')+')</div><table class="vsf-t"><thead><tr>'+C.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+(q.r.length?q.r.map(x=>'<tr>'+x.map(v=>'<td>'+esc(String(v))+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+C.length+'" class="vsf-none">no rows match</td></tr>')+'</tbody></table><div class="vsf-n">'+q.r.length+' of '+R.length+' rows</div>';
  $$('[data-k]',w).forEach(s=>s.addEventListener('change',()=>{ctl.pause();st[s.dataset.k]=s.value;render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'logic',draw(i){Object.assign(st,{min:'',like:'',city:'',order:'',limit:''},S[i].set);render()},cap:i=>S[i].cap};
};
/* SQL injection: the same login typed two ways — glued into the SQL string, or passed as ? arguments. */
Viz.injection=(c,o,ctl)=>{
 const U=o.users,st={u:'ali',p:'1234',safe:false};const w=el('div','vij');c.appendChild(w);
 const norm=s=>s.replace(/\s+/g,' ').toLowerCase();
 function evalQ(){
  if(st.safe){const m=U.find(x=>x[0]===st.u&&x[1]===st.p);return{sql:"SELECT * FROM USERS WHERE USERNAME = ? AND PASSWORD = ?",args:'arrayOf("'+st.u+'", "'+st.p+'")',ok:!!m,who:m&&m[0],why:m?'Exactly one row matches.':'No row has this username AND this password.'}}
  const sql="SELECT * FROM USERS WHERE USERNAME = '"+st.u+"' AND PASSWORD = '"+st.p+"'";
  const inj=/' or '1'='1/.test(norm(st.p))||/' or '1'='1/.test(norm(st.u))||/'\s*--/.test(st.u);
  if(inj)return{sql,args:'null',ok:true,who:U[0][0],why:'The typed quote ENDED the text and OR \'1\'=\'1\' is always true → every row matches. Logged in as the first user without the password!'};
  if(/'/.test(st.u+st.p))return{sql,args:'null',ok:null,why:'A stray quote breaks the SQL → SQLiteException, the app crashes.'};
  const m=U.find(x=>x[0]===st.u&&x[1]===st.p);return{sql,args:'null',ok:!!m,who:m&&m[0],why:m?'Exactly one row matches.':'No row matches.'}}
 function render(){const q=evalQ();
  w.innerHTML='<div class="vij-form"><label>Username<input data-f="u" value="'+esc(st.u)+'" autocomplete="off" spellcheck="false"></label><label>Password<input data-f="p" value="'+esc(st.p)+'" autocomplete="off" spellcheck="false"></label><div class="vpd-acts"><button type="button" class="vz-btn" data-m="0" aria-pressed="'+!st.safe+'">✗ Glued into the string</button><button type="button" class="vz-btn" data-m="1" aria-pressed="'+st.safe+'">✓ ? placeholders</button></div></div><pre class="val-code vij-sql">'+hlLine(q.sql,'sql')+'</pre><div class="vij-args">args = '+esc(q.args)+'</div><div class="vij-res '+(q.ok===null?'err':q.ok?(st.safe?'ok':'bad'):'no')+'"><b>'+(q.ok===null?'💥 Crash':q.ok?'🔓 Logged in as '+esc(q.who):'🔒 Login refused')+'</b><small>'+esc(q.why)+'</small></div>';
  $$('[data-f]',w).forEach(i=>i.addEventListener('input',()=>{st[i.dataset.f]=i.value;const r=evalQ();const sq=$('.vij-sql',w);sq.innerHTML=hlLine(r.sql,'sql');$('.vij-args',w).textContent='args = '+r.args;const rs=$('.vij-res',w);rs.className='vij-res '+(r.ok===null?'err':r.ok?(st.safe?'ok':'bad'):'no');rs.innerHTML='<b>'+(r.ok===null?'💥 Crash':r.ok?'🔓 Logged in as '+esc(r.who):'🔒 Login refused')+'</b><small>'+esc(r.why)+'</small>'}));
  $$('[data-m]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();st.safe=b.dataset.m==='1';render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'sim',draw(i){Object.assign(st,S[i].set);render()},cap:i=>S[i].cap};
};
/* Firebase JSON tree: apply setValue / push / removeValue step by step and highlight what changed. */
const fbClone=o=>JSON.parse(JSON.stringify(o));
const fbTree=(obj,path,hl,del)=>{if(obj===null||typeof obj!=='object')return '<span class="vjt-v">'+esc(JSON.stringify(obj))+'</span>';
 return '<ul class="vjt-ul">'+Object.keys(obj).map(k=>{const p=path?path+'/'+k:k;const cls=(hl.has(p)?' hl':'')+(del.has(p)?' del':'');const v=obj[k];
  return '<li class="vjt-li'+cls+'"><span class="vjt-k">'+esc(k)+'</span>'+(v!==null&&typeof v==='object'?fbTree(v,p,hl,del):': '+fbTree(v,p,hl,del))+'</li>'}).join('')+'</ul>'};
const fbSet=(root,path,val)=>{const ks=path.split('/');let o=root;for(let i=0;i<ks.length-1;i++){if(typeof o[ks[i]]!=='object'||o[ks[i]]===null)o[ks[i]]={};o=o[ks[i]]}if(val===null)delete o[ks.at(-1)];else o[ks.at(-1)]=fbClone(val)};
const fbGet=(root,path)=>path.split('/').reduce((o,k)=>o&&o[k],root);
Viz.jsontree=(c,o)=>{
 const w=el('div','vjt');c.appendChild(w);const S=o.script;
 return{n:()=>S.length+1,note:'sim',
  draw(i){let t=fbClone(o.tree||{});const hl=new Set(),del=new Set();
   for(let k=0;k<i;k++){const s=S[k],last=k===i-1,path=s.op==='push'?s.path+'/'+s.key:s.path;
    if(last&&s.op==='remove'){del.add(path);continue}
    fbSet(t,path,s.op==='remove'?null:s.value);if(last){hl.add(path);const v=fbGet(t,path);if(v&&typeof v==='object')Object.keys(v).forEach(x=>hl.add(path+'/'+x))}}
   const s=S[i-1];
   w.innerHTML='<pre class="val-code vjt-code">'+(s?s.code:o.code0||'// the database at the start').split('\n').map(l=>'<span class="ln">'+hlLine(l,'kotlin')+'</span>').join('')+'</pre><div class="vjt-box"><div class="vjt-h">🔥 Realtime Database (console → Data)</div>'+(Object.keys(t).length||del.size?fbTree(t,'',hl,del):'<div class="vjt-empty">null — the database is empty</div>')+'</div>'},
  cap:i=>i?S[i-1].cap:(o.cap0||'The database is one JSON tree.')};
};
/* Real-time sync: phone A, the server, phone B. Each change on the server reaches every phone with a listener. */
Viz.rtsync=(c,o)=>{
 const w=el('div','vrs');c.appendChild(w);const S=o.script;
 const line=s=>'👨‍🎓 '+s.name+' | '+s.age+' yrs | '+s.city;
 return{n:()=>S.length,note:'sim',
  draw(i){let srv={},bOnline=true,bView={},calls={A:0,B:0},flash='',lastLog='';
   const fire=(who)=>{calls[who]++};
   for(let k=0;k<=i;k++){const s=S[k];flash='';
    if(s.a==='start'){fire('A');fire('B')}
    else if(s.a==='add'){srv[s.key]=fbClone(s.s);flash=s.by;fire('A');if(bOnline){fire('B');bView=fbClone(srv)}}
    else if(s.a==='edit'){srv[s.key][s.field]=s.value;flash='console';fire('A');if(bOnline){fire('B');bView=fbClone(srv)}}
    else if(s.a==='remove'){delete srv[s.key];flash='console';fire('A');if(bOnline){fire('B');bView=fbClone(srv)}}
    else if(s.a==='offline'){bOnline=false}
    else if(s.a==='online'){bOnline=true;fire('B');bView=fbClone(srv)}
    if(bOnline)bView=fbClone(srv)}
   const list=v=>{const ks=Object.keys(v);return ks.length?ks.map(k=>'<div class="w-text vrs-row">'+esc(line(v[k]))+'</div>').join(''):'<div class="w-text" style="color:#64748b">No Records Found</div>'};
   w.innerHTML='<div class="vrs-col">'+phone('Phone A',list(srv))+'<small class="vrs-n">onDataChange × '+calls.A+'</small></div><div class="vrs-mid"><div class="vrs-srv'+(flash?' flash':'')+'"><b>🔥 Students</b>'+(Object.keys(srv).length?fbTree(srv,'',new Set(),new Set()):'<div class="vjt-empty">null</div>')+'</div><div class="vrs-arrows">⇄</div></div><div class="vrs-col'+(bOnline?'':' off')+'">'+phone('Phone B'+(bOnline?'':' · offline ✈️'),list(bView))+'<small class="vrs-n">onDataChange × '+calls.B+'</small></div>'},
  cap:i=>S[i].cap};
};
/* Firebase Authentication flow: the phone screen and the console's Users tab, step by step. */
Viz.authflow=(c,o)=>{
 const w=el('div','vaf');c.appendChild(w);const S=o.script;
 const form=s=>s.screen==='main'?'<div class="w-text">Welcome, '+esc(s.email)+'</div><button type="button" class="w-btn">Logout</button>':'<input class="w-edit" readonly value="'+esc(s.email||'')+'" placeholder="Email" aria-label="Email"><input class="w-edit" readonly value="'+('•'.repeat((s.pass||'').length))+'" placeholder="Password" aria-label="Password">'+(s.screen==='register'?'<input class="w-edit" readonly value="'+('•'.repeat((s.confirm||'').length))+'" placeholder="Confirm Password" aria-label="Confirm password"><button type="button" class="w-btn">CREATE ACCOUNT</button>':'<button type="button" class="w-btn">LOGIN</button>');
 return{n:()=>S.length,note:'sim',
  draw(i){const s=S[i];const users=[];for(let k=0;k<=i;k++)if(S[k].adds)users.push(S[k].adds);
   w.innerHTML='<div class="vaf-ph">'+phone(s.screen==='register'?'Register':s.screen==='login'?'Login':'MainActivity',form(s)+(s.toast?'<div class="vaf-toast">'+esc(s.toast)+'</div>':''))+'</div><div class="vaf-side"><div class="vaf-h">Firebase console → Authentication → Users</div><table class="vsf-t"><thead><tr><th>Identifier</th><th>User UID</th></tr></thead><tbody>'+(users.length?users.map((u,k)=>'<tr class="'+(S[i].adds===u?'vaf-new':'')+'"><td>'+esc(u.email)+'</td><td class="vaf-uid">'+esc(u.uid)+'</td></tr>').join(''):'<tr><td colspan="2" class="vsf-none">no users yet</td></tr>')+'</tbody></table>'+(s.code?'<pre class="val-code vaf-code">'+s.code.split('\n').map(l=>'<span class="ln">'+hlLine(l,'kotlin')+'</span>').join('')+'</pre>':'')+'</div>'},
  cap:i=>S[i].cap};
};
/* Security Rules checker: pick the rules, who is asking and what they ask for. */
Viz.rulescheck=(c,o,ctl)=>{
 const st={rules:'test',signed:false,op:'write',path:'Students'};const w=el('div','vrc');c.appendChild(w);
 const R={test:{label:'Test mode',json:'{\n  "rules": {\n    ".read": true,\n    ".write": true\n  }\n}',note:'Open to everyone until the trial period ends — then everything is denied.'},
  auth:{label:'Signed-in users',json:'{\n  "rules": {\n    ".read": "auth != null",\n    ".write": "auth != null"\n  }\n}',note:'Any signed-in user can read and write everything.'},
  owner:{label:'Owner only',json:'{\n  "rules": {\n    "users": {\n      "$uid": {\n        ".read": "auth !== null && auth.uid === $uid",\n        ".write": "auth !== null && auth.uid === $uid"\n      }\n    }\n  }\n}',note:'Each user can only reach users/<their own uid>. Paths with no rule are denied.'},
  locked:{label:'Locked mode',json:'{\n  "rules": {\n    ".read": false,\n    ".write": false\n  }\n}',note:'Apps are denied everything (your own servers can still use the Admin SDK).'}};
 const PATHS={Students:'Students','users/uid_ali':'users/uid_ali  (Ali’s own)','users/uid_sara':'users/uid_sara  (Sara’s)'};
 function decide(){const r=st.rules;if(r==='test')return[true,'".'+st.op+'": true → allowed for anyone, even without signing in.'];
  if(r==='locked')return[false,'".'+st.op+'": false → denied.'];
  if(r==='auth')return st.signed?[true,'auth != null and Ali is signed in → allowed.']:[false,'Not signed in, so auth is null → Permission denied.'];
  if(!st.path.startsWith('users/'))return[false,'No rule covers "'+st.path+'" → denied by default.'];
  if(!st.signed)return[false,'Not signed in → auth is null → denied.'];
  return st.path==='users/uid_ali'?[true,'$uid = uid_ali and auth.uid = uid_ali → allowed.']:[false,'$uid = uid_sara but auth.uid = uid_ali → denied.']}
 const sel=(k,opts)=>'<select data-k="'+k+'">'+Object.entries(opts).map(([v,l])=>'<option value="'+v+'"'+(String(st[k])===v?' selected':'')+'>'+esc(l)+'</option>').join('')+'</select>';
 function render(){const [ok,why]=decide();
  w.innerHTML='<div class="vsf-ctl"><label><span>Rules</span>'+sel('rules',Object.fromEntries(Object.entries(R).map(([k,v])=>[k,v.label])))+'</label><label><span>Who asks</span>'+sel('signed',{false:'Not signed in',true:'Ali (signed in, uid_ali)'})+'</label><label><span>Operation</span>'+sel('op',{read:'read',write:'write'})+'</label><label><span>Path</span>'+sel('path',PATHS)+'</label></div><div class="vrc-grid"><pre class="val-code vrc-json">'+R[st.rules].json.split('\n').map(l=>'<span class="ln">'+hlLine(l,'json')+'</span>').join('')+'</pre><div class="vij-res '+(ok?'ok':'bad')+'"><b>'+(ok?'✅ Allowed':'⛔ Permission denied')+'</b><small>'+esc(why)+'</small><small>'+esc(R[st.rules].note)+'</small></div></div>';
  $$('[data-k]',w).forEach(s=>s.addEventListener('change',()=>{ctl.pause();st[s.dataset.k]=s.dataset.k==='signed'?s.value==='true':s.value;render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'logic',draw(i){Object.assign(st,S[i].set);render()},cap:i=>S[i].cap};
};
/* Round trip: phone → PHP → MySQL → PHP → phone, one hop per step, with the real payload of each hop. */
Viz.roundtrip=(c,o)=>{
 const N=[['📱','Android app'],['🐘','PHP on Apache'],['🗄️','MySQL']];const w=el('div','vrt');c.appendChild(w);const S=o.script;
 return{n:()=>S.length,note:'sim',
  draw(i){const s=S[i];const a=Math.min(s.from,s.to),b=Math.max(s.from,s.to);
   w.innerHTML='<div class="vrt-row">'+N.map((n,k)=>'<div class="vrt-node'+(k===s.from||k===s.to?' on':'')+'"><span>'+n[0]+'</span><b>'+n[1]+'</b>'+(k===0?'<small class="vrt-th '+(s.thread==='bg'?'bg':'ui')+'">'+(s.thread==='bg'?'background thread':'UI thread')+'</small>':'')+'</div>'+(k<2?'<div class="vrt-ar'+(k>=a&&k<b?' hot':'')+(s.to<s.from?' back':'')+'"><i></i></div>':'')).join('')+'</div><div class="vrt-pk"><div class="vrt-lab">'+esc(s.label)+'</div><pre class="val-code">'+s.body.split('\n').map(l=>'<span class="ln">'+hlLine(l,s.lang||'text')+'</span>').join('')+'</pre></div>'},
  cap:i=>S[i].cap};
};
/* Table → JSON: json_encode one row per step; switch to see mysqli's default (numbers as text). */
Viz.rowsjson=(c,o,ctl)=>{
 const w=el('div','vrj');c.appendChild(w);let asText=true;
 function render(k){const rows=o.rows.slice(0,k);const cell=v=>typeof v==='number'?(asText?'"'+v+'"':String(v)):JSON.stringify(v);
  const json=rows.length?'[\n'+rows.map(r=>'  {'+o.cols.map((c2,j)=>'"'+c2+'":'+cell(r[j])).join(',')+'}').join(',\n')+'\n]':'[]';
  w.innerHTML='<div class="vrj-l"><div class="vrj-h">MySQL table: students</div><table class="vsf-t"><thead><tr>'+o.cols.map(x=>'<th>'+esc(x)+'</th>').join('')+'</tr></thead><tbody>'+o.rows.map((r,j)=>'<tr class="'+(j<k?'vrj-done':'')+(j===k-1?' vrj-new':'')+'">'+r.map(v=>'<td>'+esc(String(v))+'</td>').join('')+'</tr>').join('')+'</tbody></table><div class="vpd-acts"><button type="button" class="vz-btn" data-t="1" aria-pressed="'+asText+'">mysqli default: numbers as "text"</button><button type="button" class="vz-btn" data-t="0" aria-pressed="'+!asText+'">numbers as numbers</button></div></div><div class="vrj-r"><div class="vrj-h">echo json_encode($students);</div><pre class="val-code">'+json.split('\n').map(l=>'<span class="ln">'+hlLine(l,'json')+'</span>').join('')+'</pre></div>';
  $$('[data-t]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();asText=b.dataset.t==='1';render(k)}))}
 return{n:()=>o.rows.length+1,note:'logic',draw(i){render(i)},cap:i=>i===0?'Start: an empty PHP array → json_encode gives [].':i===o.rows.length?'All rows encoded: one JSON object per row, inside one array. The app reads it with JSONArray.':'Row '+i+' becomes one {…} object.'};
};
/* Thread lab: where the slow network call runs — main thread (crash), AsyncTask, or a coroutine. */
Viz.threadlab=(c,o)=>{
 const w=el('div','vtl2');c.appendChild(w);const S=o.script;
 return{n:()=>S.length,note:'sim',
  draw(i){const s=S[i];const lane=(name,blocks)=>'<div class="vtl2-lane"><b>'+name+'</b><div class="vtl2-track">'+blocks.map(x=>'<span class="vtl2-b '+x[2]+'" style="left:'+x[0]+'%;width:'+x[1]+'%">'+esc(x[3])+'</span>').join('')+'</div></div>';
   w.innerHTML='<div class="vtl2-mode">'+esc(s.mode)+'</div>'+lane('UI (main) thread',s.ui||[])+lane('Background thread',s.bg||[])+'<div class="vij-res '+(s.ok?'ok':'bad')+'"><b>'+esc(s.result)+'</b>'+(s.why?'<small>'+esc(s.why)+'</small>':'')+'</div>'},
  cap:i=>S[i].cap};
};
/* XAMPP control panel: start Apache and MySQL and see which URLs work. */
Viz.xampp=(c,o,ctl)=>{
 const st={apache:false,mysql:false};const w=el('div','vxp');c.appendChild(w);
 const U=[['http://localhost/phpmyadmin','apache','mysql'],['http://localhost/school_app/fetch.php','apache','mysql'],['http://10.0.2.2/school_app/fetch.php (from the emulator)','apache','mysql']];
 function render(){const svc=(k,n,d)=>'<div class="vxp-svc"><span class="vxp-dot '+(st[k]?'on':'')+'"></span><div><b>'+n+'</b><small>'+(st[k]?'Running':'Stopped')+' — '+d+'</small></div><button type="button" class="vz-btn" data-s="'+k+'">'+(st[k]?'Stop':'Start')+'</button></div>';
  w.innerHTML='<div class="vxp-panel"><div class="vxp-h">XAMPP Control Panel</div>'+svc('apache','Apache','web server, runs the .php files')+svc('mysql','MySQL','database (MariaDB in XAMPP)')+'</div><div class="vxp-urls">'+U.map(u=>{const ok=st.apache&&st.mysql,half=st.apache&&!st.mysql;return '<div class="vxp-u '+(ok?'ok':'bad')+'"><code>'+esc(u[0])+'</code><small>'+(ok?'✅ works':half?'⚠️ page loads, but PHP cannot reach the database':'❌ connection refused (Apache is off)')+'</small></div>'}).join('')+'</div>';
  $$('[data-s]',w).forEach(b=>b.addEventListener('click',()=>{ctl.pause();st[b.dataset.s]=!st[b.dataset.s];render()}))}
 const S=o.script;
 return{n:()=>S.length,note:'sim',draw(i){Object.assign(st,S[i].set);render()},cap:i=>S[i].cap};
};

/* ---------- presentation ---------- */
const ICON={grid:'<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
 play:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/></svg>',
 notes:'<svg viewBox="0 0 24 24"><path d="M4 4h16v12H8l-4 4z"/><path d="M8 9h8M8 12h5"/></svg>',
 full:'<svg viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
 sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/></svg>',
 screen:'<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
 x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>'};
const P={l:0,i:0,slides:[],root:null,ctl:null,code:null,digits:'',open:false,
 build(){
  if(this.root)return;
  const r=el('div','pz');r.hidden=true;r.setAttribute('role','dialog');r.setAttribute('aria-modal','true');r.setAttribute('aria-label','Lecture presentation');r.tabIndex=-1;
  r.innerHTML='<header class="pz-top"><div class="pz-brand"><small class="pz-lec"></small><span class="pz-ltitle"></span></div><span class="pz-count" aria-live="polite"></span><div class="pz-tools">'+
   '<button type="button" class="pz-ib" data-pa="overview" title="Slide overview (O)" aria-label="Slide overview" aria-pressed="false">'+ICON.grid+'</button>'+
   '<button type="button" class="pz-ib" data-pa="notes" title="Presenter notes (N)" aria-label="Presenter notes" aria-pressed="false">'+ICON.notes+'</button>'+
   '<button type="button" class="pz-ib wide-only" data-pa="presenter" title="Open presenter window" aria-label="Open presenter window">'+ICON.screen+'</button>'+
   '<button type="button" class="pz-ib pz-watch" data-pa="watch" title="Watch mode: auto-play like a video (W)" aria-label="Watch mode" aria-pressed="false">'+ICON.play+'<span class="wide-only">Watch</span></button>'+
   '<button type="button" class="pz-ib" data-pa="theme" title="Light / dark slides (L)" aria-label="Toggle slide theme">'+ICON.sun+'</button>'+
   '<button type="button" class="pz-ib" data-pa="full" title="Fullscreen (F)" aria-label="Fullscreen" aria-pressed="false">'+ICON.full+'</button>'+
   '<button type="button" class="pz-ib" data-pa="close" title="Exit presentation" aria-label="Exit presentation">'+ICON.x+'</button></div></header>'+
   '<div class="pz-progress"><span></span></div><main class="pz-stage"></main><aside class="pz-notes" hidden aria-label="Presenter notes"></aside><div class="pz-overview" hidden></div>'+
   '<footer class="pz-nav"><button type="button" class="pz-ib" data-pa="prev" aria-label="Previous slide">← Prev</button><div class="grow pz-dots"></div><button type="button" class="pz-ib pz-next" data-pa="next" aria-label="Next slide">Next →</button></footer>';
  document.body.appendChild(r);this.root=r;
  r.addEventListener('click',e=>{const b=e.target.closest('[data-pa]');if(!b)return;const a=b.dataset.pa;
   ({prev:()=>this.go(this.i-1,-1),next:()=>this.go(this.i+1,1),overview:()=>this.toggleOverview(),notes:()=>this.toggleNotes(),full:()=>this.toggleFull(),theme:()=>this.toggleTheme(),watch:()=>this.toggleWatch(),close:()=>this.close(),presenter:()=>Presenter.openWindow()})[a]()});
  // swipe
  let sx=0,sy=0,ok=false;const st=$('.pz-stage',r);
  st.addEventListener('touchstart',e=>{const t=e.touches[0];ok=!e.target.closest('.vz,.pz-code pre,input,button,select,details');sx=t.clientX;sy=t.clientY},{passive:true});
  st.addEventListener('touchend',e=>{if(!ok)return;const t=e.changedTouches[0],dx=t.clientX-sx,dy=t.clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.4)this.go(this.i+(dx<0?1:-1),dx<0?1:-1)},{passive:true});
  document.addEventListener('fullscreenchange',()=>$('[data-pa="full"]',r).setAttribute('aria-pressed',!!document.fullscreenElement));
  window.addEventListener('keydown',e=>this.key(e),true);
 },
 async show(l,i){
  this.build();const r=this.root;r.dataset.pt=Store.d.pt;
  if(!this.open){r.hidden=false;document.body.classList.add('pz-open');this.open=true;this.lastFocus=document.activeElement;r.focus({preventScroll:true})}
  if(this.l!==l||!this.slides.length){this.l=l;this.slides=[];$('.pz-stage',r).innerHTML='<div class="pz-loading">Loading slides…</div>';
   try{const d=await loadDeck(l);this.deck=d;this.slides=compose(l,d)}catch(e){$('.pz-stage',r).innerHTML='<div class="pz-loading">'+esc(e.message)+'. Check your connection and try again.</div>';return}
   $('.pz-lec',r).textContent='Lecture '+pad(l);$('.pz-ltitle',r).textContent=this.deck.title;this.buildDots();this.i=-1}
  this.go(clamp(i,0,this.slides.length-1),0);
 },
 buildDots(){const d=$('.pz-dots',this.root);d.innerHTML=this.slides.length<=48?this.slides.map((s,k)=>'<button type="button" class="pz-dot" data-k="'+k+'" aria-label="Go to slide '+(k+1)+': '+esc(plain(s.title))+'"></button>').join(''):'';$$('.pz-dot',d).forEach(b=>b.addEventListener('click',()=>this.go(+b.dataset.k,+b.dataset.k>this.i?1:-1)))},
 go(i,dir){
  if(!this.slides.length)return;i=clamp(i,0,this.slides.length-1);if(i===this.i&&dir!==0)return;
  if(this.ctl){this.ctl.destroy();this.ctl=null}this.code=null;Tip.hide();
  this.i=i;const s=this.slides[i],stage=$('.pz-stage',this.root);
  const node=this.render(s,i);node.classList.add(dir<0?'enter-prev':'enter-next');stage.innerHTML='';stage.appendChild(node);this.fit(node);node.scrollTop=0;
  $('.pz-progress span',this.root).style.width=((i+1)/this.slides.length*100)+'%';
  $('.pz-count',this.root).textContent=(i+1)+' / '+this.slides.length;
  const seen=Store.obj('seen',this.l);seen[i]=1;Store.d.slide[this.l]=i;Store.d.last={l:this.l,s:i};Store.save();
  $$('.pz-dot',this.root).forEach((b,k)=>{b.classList.toggle('on',k===i);b.classList.toggle('seen',!!seen[k])});
  $('[data-pa="prev"]',this.root).disabled=i===0;$('[data-pa="next"]',this.root).disabled=i===this.slides.length-1;
  this.fillNotes();if(!$('.pz-overview',this.root).hidden)this.fillOverview();
  const h='#present/'+this.l+'/'+(i+1);if(location.hash!==h)history.replaceState(null,'',h);
  Presenter.send();
  if(this.watching)this.watchStep();
 },
 fit(node){node.style.zoom='';if(innerWidth<700)return;let z=1;while(node.scrollHeight>node.clientHeight+4&&z>0.72){z=Math.round((z-0.04)*100)/100;node.style.zoom=z}},
 toggleWatch(f){this.watching=f===undefined?!this.watching:!!f;const b=$('[data-pa="watch"]',this.root);if(b)b.setAttribute('aria-pressed',this.watching);this.root.classList.toggle('watching',this.watching);this.wg=(this.wg||0)+1;clearTimeout(this.wt);if(this.watching)this.watchStep()},
 watchStep(){
  const g=this.wg=(this.wg||0)+1;clearTimeout(this.wt);const s=this.slides[this.i];if(!s)return;
  const later=(ms,f)=>{this.wt=setTimeout(()=>{if(g===this.wg&&this.watching&&this.open)f()},ms)};
  const next=()=>{if(this.i>=this.slides.length-1){this.toggleWatch(false);return}this.go(this.i+1,1)};
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(this.ctl){const c=this.ctl;later(1500,function poll(){if(!c.timer&&c.i<c.w.n()-1){if(reduce)c.step();else c.play()}if(c.i>=c.w.n()-1&&!c.timer)later(3000,next);else later(reduce?2500:700,poll)});return}
  if(this.code&&s.lines){const self=this;later(3000,function step(){if(self.code.k<s.lines.length-1){self.codeStep(1);later(3800,step)}else later(2500,next)});return}
  const txt=plain([s.title,s.text,s.q,s.takeaway,s.analogy].concat(s.points||[],s.steps||[],s.o||[]).filter(Boolean).join(' '));
  later(Math.max(6000,Math.min(16000,3500+txt.length*45)),next);
 },
 render(s,i){
  const k=s.kind||'concept',n=el('article','pz-slide');n.setAttribute('aria-roledescription','slide');n.setAttribute('aria-label',(i+1)+' of '+this.slides.length+': '+plain(s.title||s.q));
  const kick=t=>'<div class="pz-kicker">'+esc(t)+(s.era?'<i class="'+(s.era==='Legacy'?'legacy':'modern')+'">'+esc(s.era)+'</i>':'')+'</div>';
  const copy=el('div','pz-copy');
  if(k==='title'){n.classList.add('solo','pz-title');n.innerHTML='<div class="pz-num">'+pad(this.l)+'</div><h2>'+md(s.title)+'</h2><p class="pz-text">'+md(s.text||'')+'</p><p class="pz-hint"><kbd>→</kbd> next · <kbd>F</kbd> fullscreen · <kbd>N</kbd> notes · <kbd>O</kbd> overview · <kbd>S</kbd> step animation · <kbd>W</kbd> watch mode</p>';return n}
  if(k==='objectives'||k==='summary'||k==='update'){n.classList.add('solo');if(k==='update')n.classList.add('pz-update');copy.innerHTML=kick(k==='summary'?'Quick revision':k==='update'?'Android today':'Learning objectives')+'<h2>'+md(s.title)+'</h2><ul class="pz-list">'+(s.points||[]).map((p,j)=>'<li><b>'+(k==='summary'?'✓':k==='update'?'↗':j+1)+'</b><span>'+md(p)+'</span></li>').join('')+'</ul>';
   if(k==='summary'){const q=this.score();if(q.total)copy.appendChild(el('p','pz-score','Quiz score for this lecture: <b>'+q.right+' / '+q.total+'</b>'));
    const done=typeof CourseApp!=='undefined'&&CourseApp.state.storage.completed[this.l];const b=el('button','pz-check',done?'✓ Lecture completed':'Mark lecture as complete');b.type='button';b.setAttribute('aria-pressed',!!done);
    b.addEventListener('click',()=>{if(typeof CourseApp!=='undefined'&&!CourseApp.state.storage.completed[this.l]){CourseApp.toggleComplete(this.l)}b.textContent='✓ Lecture completed';b.setAttribute('aria-pressed','true')});copy.appendChild(b)}
   if(k==='summary'&&s.glossary)copy.appendChild(el('div','pz-gloss','<h3>Glossary <small>tap or hover a word</small></h3><div>'+s.glossary.map(t=>tipBtn(esc(t),esc(t))).join('')+'</div>'));
   n.appendChild(copy);return n}
  if(k==='try'){n.classList.add('solo');copy.innerHTML=kick(s.tag||'Try it yourself')+'<h2>'+md(s.title)+'</h2>'+(s.text?'<p class="pz-text">'+md(s.text)+'</p>':'');
   const g=el('div','pz-try');(s.items||[]).forEach((it,j)=>{const sec=el('section',null,'<h3><b>'+(j+1)+'</b>'+md(it.title)+'</h3><p>'+md(it.task)+'</p><details><summary>💡 Hint</summary><p>'+md(it.hint)+'</p></details><details class="ans"><summary>✅ Show answer</summary></details>');
    const a=$('.ans',sec);a.appendChild(codeBlock(it.answer,it.lang||'kotlin','Try'+(j+1)+'.kt'));if(it.output)a.appendChild(el('div','pz-out',esc(it.output)));g.appendChild(sec)});
   copy.appendChild(g);n.appendChild(copy);return n}
  if(k==='bloom'){n.classList.add('solo');copy.innerHTML=kick('Bloom’s Taxonomy')+'<h2>'+md(s.title)+'</h2>'+bloomHtml(s.bloom);n.appendChild(copy);return n}
  if(k==='quiz'){n.classList.add('solo');copy.innerHTML=kick(s.tag||'Quick check')+'<h2>'+md(s.q)+'</h2><div class="pz-quiz">'+s.o.map((o,j)=>'<button type="button" class="pz-opt" data-j="'+j+'"><b>'+'ABCD'[j]+'</b><span>'+md(o)+'</span></button>').join('')+'</div><p class="pz-feedback" aria-live="polite"></p>';
   const fb=$('.pz-feedback',copy),opts=$$('.pz-opt',copy),prevAns=Store.obj('quiz',this.l)[i];
   const mark=(j,save)=>{opts.forEach((b,x)=>{b.classList.toggle('right',x===s.a);b.classList.toggle('wrong',x===j&&j!==s.a)});fb.className='pz-feedback '+(j===s.a?'ok':'no');fb.innerHTML=(j===s.a?'Correct! ':'Not quite. The answer is '+'ABCD'[s.a]+'. ')+md(s.e||'');if(save){Store.obj('quiz',this.l)[i]=j===s.a;Store.save();Presenter.send()}};
   opts.forEach(b=>b.addEventListener('click',()=>mark(+b.dataset.j,true)));if(prevAns!==undefined)fb.textContent='You answered this before ('+(prevAns?'correct':'incorrect')+'). Try again.';n.appendChild(copy);return n}
  if(k==='compare'||k==='mistake'){n.classList.add('solo');copy.innerHTML=kick(s.tag||(k==='mistake'?'Common mistake':'Old vs modern'))+'<h2>'+md(s.title)+'</h2>'+(s.text?'<p class="pz-text">'+md(s.text)+'</p>':'');
   const cmp=el('div','pz-compare');[s.left,s.right].forEach((side,j)=>{const d=el('div');const cls=k==='mistake'?(j?'good':'bad'):(side.era==='Modern'||j===1&&!side.era?'modern':'legacy');d.innerHTML='<span class="pz-tag '+cls+'">'+esc(side.label||(k==='mistake'?(j?'✓ Correct':'✗ Wrong'):(j?'Modern':'Legacy')))+'</span>';d.appendChild(codeBlock(side.code,side.lang||s.lang,side.file));if(side.note)d.appendChild(el('p',null,md(side.note)));cmp.appendChild(d)});
   copy.appendChild(cmp);if(s.takeaway)copy.appendChild(el('div','pz-take',md(s.takeaway)));n.appendChild(copy);return n}
  if(k==='task'){n.classList.add('solo');copy.innerHTML=kick(s.tag||'Practical task')+'<h2>'+md(s.title)+'</h2>'+(s.text?'<p class="pz-text">'+md(s.text)+'</p>':'')+'<ul class="pz-list">'+(s.steps||[]).map((p,j)=>'<li><b>'+(j+1)+'</b><span>'+md(p)+'</span></li>').join('')+'</ul>'+(s.deliver?'<div class="pz-take" style="margin-top:1rem">Submit: '+md(s.deliver)+'</div>':'');
   const tasks=Store.obj('tasks',this.l),key=String(i),b=el('button','pz-check',tasks[key]?'✓ Done':'Mark as done');b.type='button';b.setAttribute('aria-pressed',!!tasks[key]);
   b.addEventListener('click',()=>{tasks[key]=!tasks[key];Store.save();b.textContent=tasks[key]?'✓ Done':'Mark as done';b.setAttribute('aria-pressed',!!tasks[key])});copy.appendChild(b);n.appendChild(copy);return n}
  // concept & code
  copy.innerHTML=kick(s.tag||(k==='code'?'Code example':'Concept'))+'<h2>'+md(s.title)+'</h2>'+(s.text?'<p class="pz-text">'+md(s.text)+'</p>':'')+(s.points?'<ul class="pz-list" style="margin-bottom:.8em">'+s.points.map((p,j)=>'<li><b>'+(j+1)+'</b><span>'+md(p)+'</span></li>').join('')+'</ul>':'')+(s.analogy?'<div class="pz-analogy"><b>Real life:</b><span>'+md(s.analogy)+'</span></div>':'');
  n.appendChild(copy);
  const vis=el('div','pz-visual');
  if(s.code){n.classList.add('wide');const cb=codeBlock(s.code,s.lang,s.file);vis.appendChild(cb);
   if(s.output)vis.appendChild(el('div','pz-out',esc(s.output)));
   if(s.lines){const ex=el('div','pz-explain','<button type="button" class="vz-btn" data-l="-1">‹ Line</button><p aria-live="polite">Press <b>S</b> or “Line ›” to explain the code line by line.</p><button type="button" class="vz-btn" data-l="1">Line ›</button>');copy.appendChild(ex);
    const st={k:-1,box:cb,p:$('p',ex)};this.code=st;$$('[data-l]',ex).forEach(b=>b.addEventListener('click',()=>this.codeStep(+b.dataset.l)))}
   if(s.change)copy.appendChild(el('p','pz-change','<b>Change it:</b> '+md(s.change)));
   const run=s.run||(s.lang==='xml'||/android|Activity|setContent|R\.id/.test(s.code)?'android':s.lang==='sql'?'sql':s.lang==='php'?'php':(!s.lang||s.lang==='kotlin')?'kotlin':'');
   const RUN={kotlin:'Try it: paste into <a href="https://play.kotlinlang.org" target="_blank" rel="noopener">Kotlin Playground</a> or a Kotlin file in Android Studio.',android:'Run it in Android Studio: put it in your project, then press ▶ Run on an emulator or phone. (Android code does not run in the browser.)',sql:'Try it in Android Studio → App Inspection → Database Inspector, or any SQLite tool.',php:'Run it with XAMPP: save in htdocs and open http://localhost/… in a browser.'};
   if(RUN[run])vis.appendChild(el('p','pz-run',RUN[run]))}
  else if(s.viz){if(s.wide||['timeline','tracer','range','conveyor','studio','attrlab','autocomplete','permlife','backstack','animlab','roundtrip','rowsjson','threadlab','xampp','jsontree','rtsync','authflow','rulescheck','cursorwalk','sqlfilter','injection','getviewlab','latlng','locflow','rotatelab','splashrace','prefsdemo','machine','threads','storage','intent','perm','notify','xmlphone','table'].includes(s.viz.type))n.classList.add('wide');this.ctl=mountViz(vis,s.viz)}
  else if(s.big){vis.innerHTML='<div style="font-size:clamp(5rem,14vw,12rem);text-align:center" aria-hidden="true">'+esc(s.big)+'</div>'}
  if(s.takeaway)copy.appendChild(el('div','pz-take',md(s.takeaway)));
  if(vis.childNodes.length)n.appendChild(vis);else n.classList.add('solo');
  return n;
 },
 codeStep(d){const c=this.code;if(!c)return;const L=this.slides[this.i].lines;c.k=clamp(c.k+d,-1,L.length-1);const lines=$$('.ln',c.box);c.box.classList.toggle('stepping',c.k>=0);
  if(c.k<0){lines.forEach(x=>x.classList.remove('on'));c.p.innerHTML='Press <b>S</b> or “Line ›” to explain the code line by line.';return}
  const [a,b]=parseRange(L[c.k][0]);lines.forEach((x,j)=>x.classList.toggle('on',j+1>=a&&j+1<=b));const first=lines[a-1];if(first)first.scrollIntoView({block:'nearest'});
  c.p.innerHTML='<b>Line'+(a===b?' '+a:'s '+a+'–'+b)+':</b> '+md(L[c.k][1])},
 score(){const q=Store.obj('quiz',this.l);let right=0,total=0;this.slides.forEach((s,k)=>{if(s.kind==='quiz'){total++;if(q[k])right++}});return{right,total}},
 fillNotes(){const s=this.slides[this.i],box=$('.pz-notes',this.root);box.innerHTML='<h3>Presenter notes · slide '+(this.i+1)+'</h3>'+(s.notes?String(s.notes).split('\n').map(p=>'<p>'+md(p)+'</p>').join(''):'<p>No extra notes. Ask a student to explain this slide in their own words.</p>')+(s.ask?'<p><b>Ask the class:</b> '+md(s.ask)+'</p>':'')},
 toggleNotes(f){const b=$('.pz-notes',this.root);b.hidden=f===undefined?!b.hidden:!f;$('[data-pa="notes"]',this.root).setAttribute('aria-pressed',!b.hidden)},
 fillOverview(){const o=$('.pz-overview',this.root),seen=Store.obj('seen',this.l);o.innerHTML='<h3>All slides — Lecture '+pad(this.l)+'</h3><div class="pz-grid">'+this.slides.map((s,k)=>'<button type="button" class="pz-thumb'+(k===this.i?' on':'')+(seen[k]?' seen':'')+'" data-k="'+k+'"><small>'+(k+1)+' · '+esc(s.kind||'concept')+'</small><span>'+md(s.title||s.q||'')+'</span></button>').join('')+'</div>';$$('.pz-thumb',o).forEach(b=>b.addEventListener('click',()=>{this.toggleOverview(false);this.go(+b.dataset.k,+b.dataset.k>this.i?1:-1)}))},
 toggleOverview(f){const o=$('.pz-overview',this.root);const show=f===undefined?o.hidden:f;o.hidden=!show;if(show){this.fillOverview();const cur=$('.pz-thumb.on',o);cur&&cur.focus()}$('[data-pa="overview"]',this.root).setAttribute('aria-pressed',show)},
 toggleFull(){if(document.fullscreenElement)document.exitFullscreen&&document.exitFullscreen();else{const d=document.documentElement;(d.requestFullscreen||d.webkitRequestFullscreen||function(){}).call(d)}},
 toggleTheme(){Store.d.pt=Store.d.pt==='light'?'dark':'light';Store.save();this.root.dataset.pt=Store.d.pt},
 close(){if(!this.open)return;this.toggleWatch(false);if(this.ctl){this.ctl.destroy();this.ctl=null}if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen();this.root.hidden=true;this.open=false;document.body.classList.remove('pz-open');this.toggleNotes(false);this.toggleOverview(false);
  const target='#lecture-'+this.l;if(location.hash!==target)location.hash=target;if(this.lastFocus&&this.lastFocus.focus)try{this.lastFocus.focus({preventScroll:true})}catch(e){}},
 hide(){if(this.open){this.toggleWatch(false);this.root.hidden=true;this.open=false;document.body.classList.remove('pz-open');if(this.ctl){this.ctl.destroy();this.ctl=null}}},
 key(e){
  if(!this.open)return;const t=e.target,typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
  if(typing&&e.key!=='Escape')return;if(e.ctrlKey||e.metaKey||e.altKey)return;
  const k=e.key,lk=k.length===1?k.toLowerCase():k;let used=true;
  if(/^[0-9]$/.test(k)){this.digits+=k;clearTimeout(this.dt);this.dt=setTimeout(()=>this.digits='',1500)}
  else if(k==='Enter'&&this.digits){this.go(+this.digits-1,+this.digits-1>this.i?1:-1);this.digits=''}
  else if(k==='ArrowRight'||k==='PageDown'||k===' '||k==='Spacebar')this.go(this.i+1,1);
  else if(k==='ArrowLeft'||k==='PageUp')this.go(this.i-1,-1);
  else if(k==='Home')this.go(0,-1);else if(k==='End')this.go(this.slides.length-1,1);
  else if(lk==='f')this.toggleFull();else if(lk==='n')this.toggleNotes();else if(lk==='o')this.toggleOverview();else if(lk==='l')this.toggleTheme();else if(lk==='w')this.toggleWatch();
  else if(lk==='s'){if(this.ctl)this.ctl.step();else if(this.code)this.codeStep(1)}
  else if(lk==='p'){if(this.ctl)this.ctl.play()}else if(lk==='r'){if(this.ctl)this.ctl.reset();else if(this.code)this.codeStep(-99)}
  else if(k==='Escape'){if(!$('.pz-overview',this.root).hidden)this.toggleOverview(false);else if(!$('.pz-notes',this.root).hidden)this.toggleNotes(false);else if(!document.fullscreenElement)this.close()}
  else used=false;
  if(used){e.preventDefault();e.stopImmediatePropagation()}else if(k.length===1||k==='Escape')e.stopImmediatePropagation();
 }
};

/* ---------- presenter window (second screen) ---------- */
const chan='BroadcastChannel' in window?new BroadcastChannel('mad-presentation'):null;
const Presenter={win:null,
 openWindow(){this.win=window.open(location.pathname+'#presenter','madPresenter','width=980,height=720');if(!this.win)alert('Allow pop-ups for this site to open the presenter window.')},
 send(){if(!chan||!P.open||!P.slides.length)return;const s=P.slides[P.i],nx=P.slides[P.i+1];chan.postMessage({t:'state',l:P.l,i:P.i,total:P.slides.length,title:plain(s.title||s.q),notes:s.notes||'',ask:s.ask||'',next:nx?plain(nx.title||nx.q):'— End of lecture —',lec:P.deck.title})},
 console(){
  document.title='Presenter view';const box=el('div','pc','<header><b>Presenter view · waiting for the presentation…</b><span class="timer">00:00</span></header><main><section><h3>Current slide</h3><h2 class="c-t">Open a presentation in the main window</h2><h3 style="margin-top:1rem">Notes</h3><div class="notes c-n"></div></section><section><h3>Next</h3><h2 class="c-x" style="font-size:1.3rem"></h2><p style="color:#a9b6d3">Keys here: ← → to move the main presentation.</p></section></main><footer><button type="button" data-c="prev">← Previous</button><button type="button" data-c="next">Next →</button></footer>');
  document.body.appendChild(box);document.body.classList.add('pz-open');const t0=Date.now();setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);$('.timer',box).textContent=pad(Math.floor(s/60))+':'+pad(s%60)},1000);
  if(!chan){$('.c-t',box).textContent='This browser does not support presenter sync.';return}
  chan.onmessage=e=>{const m=e.data;if(m.t!=='state')return;$('header b',box).textContent='Lecture '+pad(m.l)+' · '+m.lec+' · slide '+(m.i+1)+' / '+m.total;$('.c-t',box).innerHTML=md(m.title);$('.c-n',box).innerHTML=(m.notes?String(m.notes).split('\n').map(p=>'<p>'+md(p)+'</p>').join(''):'<p>No notes for this slide.</p>')+(m.ask?'<p><b>Ask:</b> '+md(m.ask)+'</p>':'');$('.c-x',box).innerHTML=md(m.next)};
  box.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b)chan.postMessage({t:'cmd',c:b.dataset.c})});
  window.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' '){e.preventDefault();chan.postMessage({t:'cmd',c:'next'})}if(e.key==='ArrowLeft'){e.preventDefault();chan.postMessage({t:'cmd',c:'prev'})}e.stopImmediatePropagation()},true);
  chan.postMessage({t:'hello'});
 }};
if(chan)chan.addEventListener('message',e=>{const m=e.data;if(m.t==='hello')Presenter.send();if(m.t==='cmd'&&P.open){if(m.c==='next')P.go(P.i+1,1);if(m.c==='prev')P.go(P.i-1,-1)}});

/* ---------- integration with the existing course app ---------- */
const playSvg='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
function startAt(n){const s=Store.d.slide[n];return(typeof s==='number'?s:0)+1}
function presentBtn(n,label){const b=el('button','present-btn',playSvg+'<span>'+esc(label||'Present')+'</span>');b.type='button';b.dataset.present=n;b.setAttribute('aria-label',(label||'Present')+' lecture '+n+' as slides');return b}
function meter(n){const total=Store.d.total[n],seen=Object.keys(Store.d.seen[n]||{}).length;if(!total)return'';return'<i><b style="width:'+Math.round(Math.min(seen,total)/total*100)+'%"></b></i><span>'+Math.min(seen,total)+'/'+total+' slides</span>'}
function decorate(){
 $$('[data-lecture-card]').forEach(card=>{const n=+card.dataset.lectureCard,open=$('.open-lecture',card);if(!open||$('.card-actions',card))return;const w=el('div','card-actions');open.replaceWith(w);w.appendChild(presentBtn(n));w.appendChild(open);const m=el('div','slide-meter');m.dataset.meter=n;w.before(m)});
 $$('.lecture-section').forEach(sec=>{const n=+sec.dataset.lecture,tb=$('.lecture-toolbar',sec);if(tb&&!$('.present-btn',tb))tb.prepend(presentBtn(n,'Present slides'))});
 const hero=$('.hero-copy');if(hero&&!$('.resume-card',hero)){const r=el('div','resume-card');r.hidden=true;hero.appendChild(r)}
 refresh();
}
function refresh(){
 $$('[data-meter]').forEach(m=>m.innerHTML=meter(+m.dataset.meter));
 const r=$('.resume-card');if(r){const last=Store.d.last;if(last&&last.l){const t=(typeof LECTURES!=='undefined'&&LECTURES[last.l-1])?LECTURES[last.l-1].title:'Lecture '+last.l;r.hidden=false;r.innerHTML='<div><small>Resume where you stopped</small><strong>Lecture '+pad(last.l)+' · slide '+(last.s+1)+'</strong><br><span style="color:var(--muted);font-size:.85rem">'+esc(t)+'</span></div>';r.appendChild(presentBtn(last.l,'Resume slides'));const rd=el('button','secondary-button','Read lecture');rd.type='button';rd.addEventListener('click',()=>CourseApp.openLecture(last.l));r.appendChild(rd)}}
}
async function lessonPanel(n){
 const sec=document.getElementById('lecture-'+n);if(!sec)return;let d;try{d=await loadDeck(n)}catch(e){return}
 const slides=compose(n,d),seen=Store.d.seen[n]||{};let p=$('.lesson-panel',sec);if(!p){p=el('section','lesson-panel');p.setAttribute('aria-label','Lesson map');const shell=$('.lecture-frame-shell',sec);shell.parentNode.insertBefore(p,shell)}
 p.innerHTML='<div class="lesson-panel-head"><div><span class="eyebrow">Lecture '+pad(n)+' · '+slides.length+' concept slides</span><h2>'+esc(d.title)+'</h2></div><div class="card-actions"></div></div><ul class="lesson-objectives">'+d.objectives.map(o=>'<li>'+md(o)+'</li>').join('')+'</ul>'+(d.bloom?'<details class="lesson-bloom"><summary>Bloom’s outcomes: Head · Heart · Hand</summary>'+bloomHtml(d.bloom)+'</details>':'')+'<div class="lesson-map" role="list">'+slides.map((s,k)=>'<button type="button" role="listitem" class="'+(seen[k]?'seen':'')+'" data-goto="'+k+'">'+(k+1)+'. '+esc(plain(s.title||s.q))+'</button>').join('')+'</div>';
 const acts=$('.card-actions',p);acts.appendChild(presentBtn(n,Store.d.slide[n]?'Resume at slide '+startAt(n):'Present from start'));
 $$('[data-goto]',p).forEach(b=>b.addEventListener('click',()=>{location.hash='present/'+n+'/'+(+b.dataset.goto+1)}));
 refresh();
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-present]');if(!b)return;e.preventDefault();e.stopPropagation();const n=+b.dataset.present;location.hash='present/'+n+'/'+startAt(n)},true);

function hook(){
 if(typeof CourseApp==='undefined'){decorate();return}
 const route=CourseApp.route,showLecture=CourseApp.showLecture;
 CourseApp.route=function(initial){const h=decodeURIComponent((location.hash||'').slice(1));
  if(h==='presenter'){Presenter.console();return}
  const m=h.match(/^present\/(\d+)(?:\/(\d+))?$/);
  if(m){const l=+m[1];if(l>=1&&l<=16){if(this.state.view!=='course'||this.state.currentLecture!==l){this.showView('course');this.showLecture(l,false)}P.show(l,(+m[2]||1)-1);return}}
  P.hide();refresh();return route.call(this,initial)};
 CourseApp.showLecture=function(n,initial){const r=showLecture.call(this,n,initial);lessonPanel(n);return r};
 decorate();
 const h=location.hash.slice(1);if(/^present\//.test(h)||h==='presenter')CourseApp.route(true);else if(CourseApp.state.view==='course')lessonPanel(CourseApp.state.currentLecture);
}
hook();
window.MADPresent={open:(l,s)=>{location.hash='present/'+l+'/'+((s||0)+1)},hide:()=>P.hide(),store:Store,loadDeck,compose,md,esc,plain,Viz,mountViz,codeBlock,isOpen:()=>P.open,close:()=>P.close()};
})();
