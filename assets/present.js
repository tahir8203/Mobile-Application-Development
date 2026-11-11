/* Mobile Application Development — Presentation Mode engine.
   One screen = one concept. Slide decks live in assets/slides/lNN.js and call MAD.deck(n, {...}). */
(function(){
'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md=t=>esc(t).replace(/&lt;(\/?)em&gt;/g,'<$1em>').replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`([^`]+)`/g,'<code>$1</code>');
const plain=t=>String(t==null?'':t).replace(/<\/?em>/g,'');
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const pad=n=>String(n).padStart(2,'0');
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ---------- storage (separate from the original course key) ---------- */
const Store={key:'madPresentationV1',d:{last:null,slide:{},seen:{},quiz:{},tasks:{},total:{},pt:'dark'},
 load(){try{const r=JSON.parse(localStorage.getItem(this.key)||'null');if(r&&typeof r==='object')for(const k in this.d){if(r[k]!==undefined&&typeof r[k]===typeof this.d[k])this.d[k]=r[k]}}catch(e){}},
 save(){try{localStorage.setItem(this.key,JSON.stringify(this.d))}catch(e){}},
 obj(k,l){return this.d[k][l]||(this.d[k][l]={})}};
Store.load();

/* ---------- deck loading ---------- */
const Decks={},waiting={};
window.MAD={deck(n,d){Decks[n]=d;(waiting[n]||[]).forEach(w=>w[0](d));delete waiting[n]}};
function loadDeck(n){
 if(Decks[n])return Promise.resolve(Decks[n]);
 return new Promise((res,rej)=>{const first=!waiting[n];(waiting[n]=waiting[n]||[]).push([res,rej]);
  if(first){const s=document.createElement('script');s.src='assets/slides/l'+pad(n)+'.js';
   s.onerror=()=>{(waiting[n]||[]).forEach(w=>w[1](new Error('Could not load slides for lecture '+n)));delete waiting[n];s.remove()};document.head.appendChild(s)}});
}
const BLOOM=[['head','🧠','Head','Cognitive · know & understand'],['heart','❤️','Heart','Affective · value & care'],['hand','🛠️','Hand','Psychomotor · build & do']];
function bloomHtml(b){return'<div class="pz-bloom">'+BLOOM.map(([k,ic,t,sub])=>'<section class="bl-'+k+'"><h3><span aria-hidden="true">'+ic+'</span> '+t+'<small>'+sub+'</small></h3><ul>'+(b[k]||[]).map(x=>'<li>'+md(x)+'</li>').join('')+'</ul></section>').join('')+'</div>'}
function compose(n,d){
 const s=[{kind:'title',title:d.title,text:d.subtitle,notes:d.intro||'Introduce the lecture. Ask students what they already know about this topic.'},
  {kind:'objectives',title:'By the end of this lecture you can…',points:d.objectives,notes:'Read the objectives aloud. Return to this slide at the end and ask students to tick off each one.'}];
 if(d.bloom)s.push({kind:'bloom',title:'Learning outcomes: Head, Heart, Hand',bloom:d.bloom,notes:'Bloom’s Taxonomy in three domains. Head = what students will know (cognitive). Heart = attitudes and values (affective). Hand = what they will be able to do with their hands in Android Studio (psychomotor).'});
 const all=s.concat(d.slides);Store.d.total[n]=all.length;return all;
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
 const bar=el('div','vz-bar','<button type="button" class="play">▶ Play</button><button type="button" data-a="back">‹ Back</button><button type="button" data-a="step">Step ›</button><button type="button" data-a="reset">↺ Reset</button><span class="cnt"></span>');
 box.appendChild(cap);box.appendChild(bar);
 const note=o.note||NOTE['note' in w?w.note:'sim'];if(note)box.appendChild(el('div','vz-sim',esc(note)));
 const playBtn=$('.play',bar),cnt=$('.cnt',bar);
 ctl.go=i=>{const n=w.n();ctl.i=clamp(i,0,n-1);w.draw(ctl.i);const c=w.cap?w.cap(ctl.i):(o.caps||[])[ctl.i];cap.innerHTML=md(c||'');cnt.textContent=(ctl.i+1)+' / '+n};
 ctl.pause=()=>{clearInterval(ctl.timer);ctl.timer=null;playBtn.textContent='▶ Play'};
 ctl.play=()=>{if(ctl.timer){ctl.pause();return}if(ctl.i>=w.n()-1)ctl.go(0);playBtn.textContent='⏸ Pause';ctl.timer=setInterval(()=>{if(ctl.i>=w.n()-1){ctl.pause();return}ctl.go(ctl.i+1)},o.speed||1700)};
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
 const kw=o.keyword||'var',fmt=v=>typeof v==='string'?'"'+v+'"':String(v);
 c.innerHTML='<div class="vv"><div class="vz-code1 vv-code"></div><div class="vv-box"><span class="vv-label">'+esc(o.name)+'</span><span class="vv-val"></span><span class="vv-type">'+esc(o.type)+'</span></div><div class="vz-console vv-out"></div></div>';
 const code=$('.vv-code',c),val=$('.vv-val',c),out=$('.vv-out',c),box=$('.vv-box',c);
 const steps=[{t:'decl'}];o.values.forEach((v,k)=>steps.push({t:k?'set':'init',v}));if(o.tryChange!==undefined)steps.push({t:'err',v:o.tryChange});steps.push({t:'print'});
 let prev=null;
 return{n:()=>steps.length,note:'logic',
  draw(i){let cur=null,lines=[];
   for(let k=0;k<=i;k++){const s=steps[k];if(s.t==='init'){cur=s.v;lines.push(kw+' '+o.name+': '+o.type+' = '+fmt(s.v))}else if(s.t==='set'){cur=s.v;lines.push(o.name+' = '+fmt(s.v))}else if(s.t==='err')lines.push(o.name+' = '+fmt(s.v)+'   // ✗ not allowed');else if(s.t==='print')lines.push('println('+o.name+')')}
   const s=steps[i];if(s.t==='decl')lines=[kw+' '+o.name+': '+o.type];
   code.innerHTML=lines.map(l=>hlLine(l,'kotlin')).join('\n');
   $$('.vv-old',box).forEach(x=>x.remove());
   if(prev!==null&&cur!==null&&cur!==prev)box.appendChild(el('span','vv-old',esc(fmt(prev))));
   val.textContent=cur===null?'':fmt(cur);val.classList.remove('on-pop');void val.offsetWidth;if(s.t==='init'||s.t==='set')val.classList.add('on-pop');
   out.innerHTML=s.t==='err'?'<span class="vv-err">Error: Val cannot be reassigned</span>':s.t==='print'?esc(String(cur)):'';prev=cur},
  cap(i){const s=steps[i];return s.t==='decl'?'A variable is a **labelled box**. `'+o.name+'` is the label; `'+o.type+'` decides what can go inside.':s.t==='init'?'The value **'+fmt(s.v)+'** is stored in the box.':s.t==='set'?'The old value is thrown away. The box now holds **'+fmt(s.v)+'**.':s.t==='err'?'`val` boxes are **sealed**: changing them is a compile-time error.':'`println('+o.name+')` reads the box and prints the **current** value.'}};
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
 c.innerHTML='<div class="vx"><div class="vz-code1">'+o.code.map((l,k)=>'<span class="xl" data-k="'+(k+1)+'">'+(hlLine(l,o.lang||'xml')||' ')+'</span>').join('')+'</div><div>'+phone(o.app||'My App',o.views.map(v=>v.type==='button'?'<button type="button" class="w-btn" data-v="'+v.id+'">'+esc(v.text)+'</button>':v.type==='edit'?'<input class="w-edit" data-v="'+v.id+'" value="'+esc(v.text)+'" aria-label="'+esc(v.id)+'">':v.type==='image'?'<div class="w-img" data-v="'+v.id+'">'+esc(v.text||'🖼')+'</div>':'<div class="w-text" data-v="'+v.id+'">'+esc(v.text)+'</div>').join(''))+'</div></div>';
 if(o.click){const b=$('[data-v="'+o.click.btn+'"]',c);b.addEventListener('click',()=>{count++;const t=$('[data-v="'+o.click.target+'"]',c);const src=o.click.from?($('[data-v="'+o.click.from+'"]',c).value||''):'';t.textContent=o.click.text.replace('{n}',count).replace('{v}',src);t.classList.remove('on-pop');void t.offsetWidth;t.classList.add('on-pop')})}
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
  st.addEventListener('touchstart',e=>{const t=e.touches[0];ok=!e.target.closest('.vz,.pz-code pre,input,button');sx=t.clientX;sy=t.clientY},{passive:true});
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
  if(this.ctl){this.ctl.destroy();this.ctl=null}this.code=null;
  this.i=i;const s=this.slides[i],stage=$('.pz-stage',this.root);
  const node=this.render(s,i);node.classList.add(dir<0?'enter-prev':'enter-next');stage.innerHTML='';stage.appendChild(node);node.scrollTop=0;
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
  if(k==='objectives'||k==='summary'){n.classList.add('solo');copy.innerHTML=kick(k==='summary'?'Quick revision':'Learning objectives')+'<h2>'+md(s.title)+'</h2><ul class="pz-list">'+(s.points||[]).map((p,j)=>'<li><b>'+(k==='summary'?'✓':j+1)+'</b><span>'+md(p)+'</span></li>').join('')+'</ul>';
   if(k==='summary'){const q=this.score();if(q.total)copy.appendChild(el('p','pz-score','Quiz score for this lecture: <b>'+q.right+' / '+q.total+'</b>'));
    const done=typeof CourseApp!=='undefined'&&CourseApp.state.storage.completed[this.l];const b=el('button','pz-check',done?'✓ Lecture completed':'Mark lecture as complete');b.type='button';b.setAttribute('aria-pressed',!!done);
    b.addEventListener('click',()=>{if(typeof CourseApp!=='undefined'&&!CourseApp.state.storage.completed[this.l]){CourseApp.toggleComplete(this.l)}b.textContent='✓ Lecture completed';b.setAttribute('aria-pressed','true')});copy.appendChild(b)}
   n.appendChild(copy);return n}
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
  else if(s.viz){if(s.wide||['machine','threads','storage','intent','perm','notify','xmlphone','table'].includes(s.viz.type))n.classList.add('wide');this.ctl=mountViz(vis,s.viz)}
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
window.MADPresent={open:(l,s)=>{location.hash='present/'+l+'/'+((s||0)+1)},hide:()=>P.hide(),store:Store,loadDeck,compose,md,esc,plain,Viz};
})();
