/* MAD Course labs: interactive simulators and the animation library.
   Everything here is a browser simulation that models what Android does. Real Android code runs in Android Studio. */
(function(){
'use strict';
const P=window.MADPresent;if(!P)return;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const esc=P.esc,md=P.md,plain=P.plain,pad=n=>String(n).padStart(2,'0');
const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e};
const code=(host,src,lang,file)=>{host.innerHTML='';host.appendChild(P.codeBlock(src,lang||'kotlin',file))};
let cleanup=null;

/* ================= 1. Activity lifecycle ================= */
function lifecycle(root){
 root.innerHTML='<div class="lab-two"><div><div class="lc-phone" data-s="none"><div class="lc-screen"><div class="lc-app"><b>Counter app</b><span class="lc-count">0</span><button type="button" class="lc-plus">+1</button></div><div class="lc-dialog">Allow camera?</div><div class="lc-home">Home screen</div></div></div><label class="lab-check"><input type="checkbox" id="lc-vm"> Keep the count in a <b>ViewModel</b></label></div>'+
 '<div><div class="lc-states">'+['onCreate','onStart','onResume','onPause','onStop','onDestroy'].map(c=>'<span data-cb="'+c+'">'+c+'()</span>').join('')+'<span data-cb="onRestart" class="re">onRestart()</span></div><p class="lab-state" aria-live="polite">The app is not running.</p><div class="lab-btns">'+[['launch','▶ Launch app'],['dialog','Permission dialog'],['home','Press Home'],['return','Return to app'],['rotate','⟳ Rotate'],['back','← Back']].map(b=>'<button type="button" data-do="'+b[0]+'">'+b[1]+'</button>').join('')+'</div><div class="lab-log" aria-live="polite"><b>Logcat</b><ol></ol></div></div></div>'+
 '<p class="lab-note">On Android 12+ pressing Back on the first screen of an app sends it to the background (onPause, onStop) without destroying it. Older versions destroy it, as shown here.</p>';
 const phone=$('.lc-phone',root),log=$('.lab-log ol',root),stt=$('.lab-state',root);let state='none',count=0,busy=false,timers=[];
 const TEXT={none:'The app is not running.',resumed:'**Resumed**: visible and in front. The user can tap.',paused:'**Paused**: partly covered. Still visible, no input.',stopped:'**Stopped**: not visible. Android may kill it for memory.',destroyed:'**Destroyed**: the Activity object is gone.'};
 const allow={none:['launch'],destroyed:['launch'],resumed:['dialog','home','rotate','back'],paused:['return','home'],stopped:['return']};
 function sync(){phone.dataset.s=state;stt.innerHTML=md(TEXT[state]);$('.lc-count',root).textContent=count;$$('[data-do]',root).forEach(b=>b.disabled=busy||!allow[state].includes(b.dataset.do))}
 function play(cbs,end,mid){busy=true;sync();cbs.forEach((cb,i)=>timers.push(setTimeout(()=>{$$('[data-cb]',root).forEach(x=>x.classList.toggle('on',x.dataset.cb===cb));const li=el('li',null,'<code>'+cb+'()</code>');log.appendChild(li);log.parentNode.scrollTop=1e5;if(mid&&mid.at===i)mid.fn();if(i===cbs.length-1){busy=false;state=end;sync()}},420*(i+1))))}
 root.addEventListener('click',e=>{
  if(e.target.closest('.lc-plus')&&state==='resumed'){count++;sync();return}
  const b=e.target.closest('[data-do]');if(!b||b.disabled)return;const a=b.dataset.do;log.appendChild(el('li','act','— '+b.textContent.replace(/^[^A-Za-z]+/,'')+' —'));
  if(a==='launch'){count=0;play(['onCreate','onStart','onResume'],'resumed')}
  else if(a==='dialog')play(['onPause'],'paused');
  else if(a==='home')play(state==='paused'?['onStop']:['onPause','onStop'],'stopped');
  else if(a==='return')play(state==='paused'?['onResume']:['onRestart','onStart','onResume'],'resumed');
  else if(a==='back')play(['onPause','onStop','onDestroy'],'destroyed');
  else if(a==='rotate'){const keep=$('#lc-vm',root).checked;phone.classList.toggle('land');play(['onPause','onStop','onDestroy','onCreate','onStart','onResume'],'resumed',{at:3,fn(){if(!keep){count=0;log.appendChild(el('li','warn','count reset to 0: it was a field of the old Activity'))}else log.appendChild(el('li','ok','count kept: the ViewModel survived'));sync()}})}
 });
 sync();cleanup=()=>timers.forEach(clearTimeout);
}

/* ================= 2. Intent builder ================= */
const INTENTS={
 screen:{t:'Open another screen (explicit)',f:[['cls','Activity class','DetailActivity'],['key','Extra key','name'],['val','Extra value','Ali']],to:'Your DetailActivity',
  code:v=>'val intent = Intent(this, '+v.cls+'::class.java)\nintent.putExtra("'+v.key+'", "'+v.val+'")\nstartActivity(intent)\n\n// In '+v.cls+':\nval '+v.key+' = intent.getStringExtra("'+v.key+'")',man:v=>'<activity android:name=".'+v.cls+'" />',note:'An **explicit** intent names the class. The Activity must be declared in the manifest.'},
 dial:{t:'Dial a phone number',f:[['num','Number','03001234567']],to:'Phone app',code:v=>'val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:'+v.num+'"))\nstartActivity(intent)',man:()=>'<!-- No permission needed: the user presses Call -->',note:'`ACTION_DIAL` only opens the dialer, so no permission is needed. `ACTION_CALL` calls at once and needs the dangerous permission CALL_PHONE.'},
 sms:{t:'Write an SMS',f:[['num','Number','03001234567'],['body','Message','Class at 9 am']],to:'Messages app',code:v=>'val intent = Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:'+v.num+'"))\nintent.putExtra("sms_body", "'+v.body+'")\nstartActivity(intent)',man:()=>'<!-- No permission needed: the SMS app sends it -->',note:'Google Play lets only default SMS apps use SEND_SMS. Opening the SMS app with an intent is the accepted way.'},
 email:{t:'Write an email',f:[['to','To','teacher@example.com'],['sub','Subject','Assignment 1']],to:'Email app',code:v=>'val intent = Intent(Intent.ACTION_SENDTO).apply {\n    data = Uri.parse("mailto:")\n    putExtra(Intent.EXTRA_EMAIL, arrayOf("'+v.to+'"))\n    putExtra(Intent.EXTRA_SUBJECT, "'+v.sub+'")\n}\nstartActivity(intent)',man:()=>'<queries>\n    <intent>\n        <action android:name="android.intent.action.SENDTO" />\n        <data android:scheme="mailto" />\n    </intent>\n</queries>',note:'The `<queries>` block (Android 11+) is needed only if you first check which app can handle the intent.'},
 web:{t:'Open a web page',f:[['url','Address','https://developer.android.com']],to:'Browser',code:v=>'val intent = Intent(Intent.ACTION_VIEW, Uri.parse("'+v.url+'"))\nstartActivity(intent)',man:()=>'<!-- No permission needed -->',note:'An **implicit** intent names an action. Android finds an app that can do it.'},
 map:{t:'Show a place on the map',f:[['q','Place','University of Okara']],to:'Maps app',code:v=>'val uri = Uri.parse("geo:0,0?q=" + Uri.encode("'+v.q+'"))\nstartActivity(Intent(Intent.ACTION_VIEW, uri))',man:()=>'<!-- No permission needed -->',note:'The `geo:` scheme opens any installed maps app.'},
 share:{t:'Share text',f:[['text','Text','I built my first Android app!']],to:'Share sheet',code:v=>'val send = Intent(Intent.ACTION_SEND).apply {\n    type = "text/plain"\n    putExtra(Intent.EXTRA_TEXT, "'+v.text+'")\n}\nstartActivity(Intent.createChooser(send, "Share with"))',man:()=>'<!-- No permission needed -->',note:'`createChooser` always shows the list of apps, even if the user set a default.'},
 photo:{t:'Take a picture',f:[],to:'Camera app',code:()=>'private val takePhoto = registerForActivityResult(\n    ActivityResultContracts.TakePicturePreview()) { bitmap ->\n    imageView.setImageBitmap(bitmap)\n}\n\n// On a button click:\ntakePhoto.launch(null)',man:()=>'<!-- No CAMERA permission needed when the camera APP takes the photo -->',note:'Your app needs the CAMERA permission only when it opens the camera itself (CameraX).'}};
function intent(root){
 root.innerHTML='<div class="lab-two"><div><label class="lab-field">What should happen?<select id="in-type">'+Object.keys(INTENTS).map(k=>'<option value="'+k+'">'+INTENTS[k].t+'</option>').join('')+'</select></label><div id="in-fields"></div><div class="in-flow"><span>Your app</span><i></i><span>Android</span><i></i><span id="in-to"></span></div><p class="lab-note" id="in-note"></p></div><div class="pzv"><h3 class="lab-h">Kotlin</h3><div id="in-code"></div><h3 class="lab-h">AndroidManifest.xml</h3><div id="in-man"></div></div></div>';
 const clean=s=>String(s).replace(/["\\\n]/g,'');
 function draw(keep){const k=$('#in-type',root).value,I=INTENTS[k],box=$('#in-fields',root);
  if(!keep)box.innerHTML=I.f.map(f=>'<label class="lab-field">'+f[1]+'<input type="text" data-k="'+f[0]+'" value="'+esc(f[2])+'" maxlength="60"></label>').join('');
  const v={};$$('input',box).forEach(i=>v[i.dataset.k]=clean(i.value));
  code($('#in-code',root),I.code(v),'kotlin','MainActivity.kt');code($('#in-man',root),I.man(v),'xml','AndroidManifest.xml');
  $('#in-to',root).textContent=I.to;$('#in-note',root).innerHTML=md(I.note);const fl=$('.in-flow',root);fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go')}
 $('#in-type',root).addEventListener('change',()=>draw(false));root.addEventListener('input',e=>{if(e.target.matches('#in-fields input'))draw(true)});draw(false);
}

/* ================= 3. Layout lab ================= */
function layout(root){
 root.innerHTML='<div class="lab-two"><div><div class="ly-phone"><div class="ly-bar">Layout Lab</div><div class="ly-root"><div class="ly-v tv">Welcome</div><div class="ly-v et">Enter name</div><div class="ly-v bt">SAVE</div></div></div></div>'+
 '<div><div class="lab-controls"><label class="lab-field">orientation<select id="ly-o"><option>vertical</option><option>horizontal</option></select></label><label class="lab-field">gravity<select id="ly-g"><option>start</option><option>center</option><option>end</option></select></label><label class="lab-field">padding <output id="ly-po">16dp</output><input type="range" id="ly-p" min="0" max="32" step="4" value="16"></label><label class="lab-field">margin between views <output id="ly-mo">8dp</output><input type="range" id="ly-m" min="0" max="24" step="4" value="8"></label><label class="lab-check"><input type="checkbox" id="ly-w"> Equal <b>layout_weight</b></label><label class="lab-check"><input type="checkbox" id="ly-mp"> Children <b>match_parent</b> across</label></div><div class="pzv" id="ly-code"></div></div></div>';
 function draw(){const o=$('#ly-o',root).value,g=$('#ly-g',root).value,p=+$('#ly-p',root).value,m=+$('#ly-m',root).value,w=$('#ly-w',root).checked,mp=$('#ly-mp',root).checked,box=$('.ly-root',root),vert=o==='vertical';
  $('#ly-po',root).textContent=p+'dp';$('#ly-mo',root).textContent=m+'dp';
  const fx={start:'flex-start',center:'center',end:'flex-end'}[g];
  box.style.cssText='flex-direction:'+(vert?'column':'row')+';padding:'+p+'px;gap:'+m+'px;justify-content:'+(w?'stretch':fx)+';align-items:'+(mp?'stretch':vert?fx:'flex-start');
  $$('.ly-v',box).forEach(v=>{v.style.flex=w?'1 1 0':'0 0 auto'});
  const main=vert?'height':'width',cross=vert?'width':'height';
  const child=(tag,extra)=>'    <'+tag+'\n        android:layout_'+main+'="'+(w?'0dp':'wrap_content')+'"\n        android:layout_'+cross+'="'+(mp?'match_parent':'wrap_content')+'"'+(w?'\n        android:layout_weight="1"':'')+(m?'\n        android:layout_margin'+(vert?'Bottom':'End')+'="'+m+'dp"':'')+'\n        '+extra+' />';
  code($('#ly-code',root),'<LinearLayout\n    xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent"\n    android:orientation="'+o+'"\n    android:gravity="'+(g==='center'?'center':g)+'"\n    android:padding="'+p+'dp">\n\n'+child('TextView','android:text="Welcome"')+'\n\n'+child('EditText','android:hint="Enter name"')+'\n\n'+child('Button','android:text="Save"')+'\n\n</LinearLayout>','xml','res/layout/activity_main.xml')}
 root.addEventListener('input',draw);root.addEventListener('change',draw);draw();
}

/* ================= 4. Permission helper ================= */
const PERMS=[
 ['INTERNET','Use the internet','normal','Granted at install. No dialog.',''],
 ['VIBRATE','Vibrate the phone','normal','Granted at install. No dialog.',''],
 ['CAMERA','Use the camera inside your app','dangerous','Not needed if you open the camera app with an intent.','take pictures and record video'],
 ['ACCESS_FINE_LOCATION','Get GPS location','dangerous','Android 12+: the user may choose approximate location only. Background location is a separate request.','access this device’s location'],
 ['RECORD_AUDIO','Record with the microphone','dangerous','Recording in the background also needs a foreground service (Android 14+: with type microphone).','record audio'],
 ['READ_CONTACTS','Read contacts','dangerous','Ask only when the user taps the feature that needs contacts.','access your contacts'],
 ['POST_NOTIFICATIONS','Show notifications','dangerous','Run-time permission since Android 13 (API 33). Older versions grant it automatically.','send you notifications'],
 ['READ_MEDIA_IMAGES','Read photos','dangerous','Android 13+. Replaces READ_EXTERNAL_STORAGE. The photo picker needs no permission.','access photos on this device'],
 ['BLUETOOTH_CONNECT','Talk to paired Bluetooth devices','dangerous','Android 12+. Replaces the old BLUETOOTH permission.','find, connect to and determine the relative position of nearby devices'],
 ['CALL_PHONE','Call a number directly','dangerous','Use ACTION_DIAL instead and you need no permission.','make and manage phone calls'],
 ['SEND_SMS','Send SMS directly','dangerous','Google Play allows this only for default SMS apps. Use an SMS intent instead.','send and view SMS messages'],
 ['SCHEDULE_EXACT_ALARM','Set exact alarms','special','Android 12+. The user grants it on a settings screen, not in a dialog.','']];
function perm(root){
 root.innerHTML='<div class="lab-two"><div><label class="lab-field">Feature<select id="pm-sel">'+PERMS.map((p,i)=>'<option value="'+i+'">'+p[1]+'</option>').join('')+'</select></label><p id="pm-type"></p><p class="lab-note" id="pm-note"></p><div class="pm-phone"><div class="pm-dialog" id="pm-dialog"></div><p class="pm-result" id="pm-result" aria-live="polite"></p></div></div><div class="pzv"><h3 class="lab-h">AndroidManifest.xml</h3><div id="pm-man"></div><h3 class="lab-h">Kotlin</h3><div id="pm-code"></div></div></div>';
 function draw(){const p=PERMS[+$('#pm-sel',root).value],name=p[0],type=p[2];
  $('#pm-type',root).innerHTML='<span class="pm-badge '+type+'">'+type+' permission</span> <code>'+name+'</code>';$('#pm-note',root).textContent=p[3];
  code($('#pm-man',root),'<uses-permission android:name="android.permission.'+name+'" />','xml','AndroidManifest.xml');
  code($('#pm-code',root),type==='normal'?'// Normal permission: the manifest line is enough.\n// Use the feature directly.':type==='special'?'// Special permission: send the user to Settings.\nval am = getSystemService(AlarmManager::class.java)\nif (!am.canScheduleExactAlarms()) {\n    startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM))\n}':'private val ask = registerForActivityResult(\n    ActivityResultContracts.RequestPermission()) { granted ->\n    if (granted) useFeature() else explainWhyNeeded()\n}\n\nfun onButtonClick() {\n    val p = Manifest.permission.'+name+'\n    if (checkSelfPermission(p) == PackageManager.PERMISSION_GRANTED) {\n        useFeature()\n    } else {\n        ask.launch(p)\n    }\n}','kotlin','MainActivity.kt');
  const dg=$('#pm-dialog',root),rs=$('#pm-result',root);rs.textContent='';
  if(type==='dangerous'){dg.hidden=false;dg.innerHTML='<p>Allow <b>MAD Demo</b> to '+esc(p[4])+'?</p><button type="button" data-g="1">While using the app</button><button type="button" data-g="2">Only this time</button><button type="button" data-g="0">Don’t allow</button>'}
  else{dg.hidden=true;rs.innerHTML=type==='normal'?'No dialog. Android grants this when the app is installed.':'No dialog. The user switches it on in Settings.'}}
 root.addEventListener('click',e=>{const b=e.target.closest('[data-g]');if(!b)return;const g=+b.dataset.g;$('#pm-dialog',root).hidden=true;$('#pm-result',root).innerHTML=g?'<b class="ok">granted = true</b> → <code>useFeature()</code> runs'+(g===2?'. Next launch the app must ask again.':'.'):'<b class="no">granted = false</b> → <code>explainWhyNeeded()</code> runs. Deny twice and Android stops showing the dialog.'});
 $('#pm-sel',root).addEventListener('change',draw);draw();
}

/* ================= 5. SQL playground ================= */
const SEED=()=>({next:7,rows:[[1,'Ali','Okara',82],[2,'Sara','Lahore',91],[3,'Bilal','Okara',47],[4,'Hina','Sahiwal',68],[5,'Usman','Lahore',55],[6,'Ayesha','Okara',74]].map(r=>({id:r[0],name:r[1],city:r[2],marks:r[3]}))});
const COLS=['id','name','city','marks'];
function runSql(sql,db){
 const strs=[];let s=sql.trim().replace(/;+\s*$/,'').replace(/'((?:[^']|'')*)'/g,(_,x)=>{strs.push(x.replace(/''/g,"'"));return'\u0001'+(strs.length-1)+'\u0001'}).replace(/\s+/g,' ');
 if(!s)throw Error('Type a statement first.');
 const val=t=>{t=t.trim();let m;if((m=t.match(/^\u0001(\d+)\u0001$/)))return strs[+m[1]];if(/^-?\d+(\.\d+)?$/.test(t))return +t;if(/^null$/i.test(t))return null;throw Error('Cannot read the value '+t.replace(/\u0001\d+\u0001/g,"'…'")+'. Put text in single quotes.')};
 const col=c=>{c=c.trim().toLowerCase();if(!COLS.includes(c))throw Error('no such column: '+c);return c};
 const tbl=t=>{if(t.toLowerCase()!=='student')throw Error('no such table: '+t+' (the practice table is called student)')};
 const where=w=>{if(!w)return()=>true;const ors=w.split(/ or /i).map(part=>{const ands=part.split(/ and /i).map(c=>{const m=c.trim().match(/^(\w+)\s*(>=|<=|!=|<>|=|>|<|like)\s*(.+)$/i);if(!m)throw Error('Cannot read the condition: '+c.trim());const k=col(m[1]),op=m[2].toLowerCase(),v=val(m[3]);
    if(op==='like'){const re=new RegExp('^'+String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.')+'$','i');return r=>re.test(String(r[k]))}
    return r=>{const a=r[k];return op==='='?a==v:op==='!='||op==='<>'?a!=v:op==='>'?a>v:op==='<'?a<v:op==='>='?a>=v:a<=v}});return r=>ands.every(f=>f(r))});return r=>ors.some(f=>f(r))};
 let m;
 if((m=s.match(/^select (.+?) from (\w+)(?: where (.+?))?(?: order by (\w+)(?: (asc|desc))?)?(?: limit (\d+))?$/i))){tbl(m[2]);let rows=db.rows.filter(where(m[3]));
  const agg=m[1].trim().match(/^(count|sum|avg|max|min)\s*\(\s*(\*|\w+)\s*\)$/i);
  if(agg){const fn=agg[1].toLowerCase();if(fn==='count')return{cols:['COUNT('+agg[2]+')'],rows:[[rows.length]],msg:'1 row'};const k=col(agg[2]),xs=rows.map(r=>+r[k]);const out=!xs.length?null:fn==='sum'?xs.reduce((a,b)=>a+b,0):fn==='avg'?Math.round(xs.reduce((a,b)=>a+b,0)/xs.length*100)/100:fn==='max'?Math.max.apply(null,xs):Math.min.apply(null,xs);return{cols:[fn.toUpperCase()+'('+k+')'],rows:[[out]],msg:'1 row'}}
  const cs=m[1].trim()==='*'?COLS:m[1].split(',').map(col);
  if(m[4]){const k=col(m[4]),d=(m[5]||'asc').toLowerCase()==='desc'?-1:1;rows=rows.slice().sort((a,b)=>(a[k]>b[k]?1:a[k]<b[k]?-1:0)*d)}
  if(m[6])rows=rows.slice(0,+m[6]);
  return{cols:cs,rows:rows.map(r=>cs.map(c=>r[c])),msg:rows.length+' row'+(rows.length===1?'':'s')}}
 if((m=s.match(/^insert into (\w+)\s*(?:\(([^)]*)\))?\s*values\s*\((.+)\)$/i))){tbl(m[1]);const vals=m[3].split(',').map(val),cs=m[2]?m[2].split(',').map(col):(vals.length===4?COLS:['name','city','marks']);
  if(cs.length!==vals.length)throw Error(vals.length+' values for '+cs.length+' columns');const row={id:null,name:null,city:null,marks:null};cs.forEach((c,i)=>row[c]=vals[i]);
  if(row.id===null)row.id=db.next;if(db.rows.some(r=>r.id===row.id))throw Error('UNIQUE constraint failed: student.id');db.next=Math.max(db.next,row.id+1);db.rows.push(row);return{msg:'1 row inserted (id '+row.id+')',show:true}}
 if((m=s.match(/^update (\w+) set (.+?)(?: where (.+))?$/i))){tbl(m[1]);const sets=m[2].split(',').map(x=>{const p=x.split('=');if(p.length!==2)throw Error('Cannot read: SET '+x.trim());return[col(p[0]),val(p[1])]}),f=where(m[3]);let n=0;db.rows.forEach(r=>{if(f(r)){sets.forEach(([k,v])=>r[k]=v);n++}});return{msg:n+' row'+(n===1?'':'s')+' updated'+(m[3]?'':' (no WHERE: every row changed!)'),show:true}}
 if((m=s.match(/^delete from (\w+)(?: where (.+))?$/i))){tbl(m[1]);const f=where(m[2]),before=db.rows.length;db.rows=db.rows.filter(r=>!f(r));const n=before-db.rows.length;return{msg:n+' row'+(n===1?'':'s')+' deleted'+(m[2]?'':' (no WHERE: the table is now empty!)'),show:true}}
 throw Error('This playground understands SELECT, INSERT, UPDATE and DELETE on the student table.');
}
function sql(root){
 const EX=["SELECT * FROM student","SELECT name, marks FROM student WHERE marks >= 60 ORDER BY marks DESC","SELECT * FROM student WHERE city = 'Okara' AND marks > 50","SELECT * FROM student WHERE name LIKE 'A%'","SELECT AVG(marks) FROM student","INSERT INTO student(name, city, marks) VALUES('Zain', 'Okara', 88)","UPDATE student SET marks = 50 WHERE id = 3","DELETE FROM student WHERE marks < 50"];
 root.innerHTML='<p class="lab-note">Practice table <code>student(id, name, city, marks)</code>. It lives in this page only.</p><div class="sql-ex">'+EX.map((x,i)=>'<button type="button" data-ex="'+i+'">'+esc(x.split(' ').slice(0,2).join(' '))+(i===1?' … ORDER BY':i===2?' … AND':i===3?' … LIKE':'')+'</button>').join('')+'</div><textarea id="sql-in" rows="3" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="SQL statement">SELECT * FROM student</textarea><div class="lab-btns"><button type="button" class="go" id="sql-run">▶ Run</button><button type="button" id="sql-reset">↺ Reset table</button></div><p class="sql-msg" id="sql-msg" aria-live="polite"></p><div class="sql-out" id="sql-out"></div>';
 let db=SEED();const input=$('#sql-in',root),msg=$('#sql-msg',root),out=$('#sql-out',root);
 const table=(cols,rows)=>'<table><thead><tr>'+cols.map(c=>'<th>'+esc(c)+'</th>').join('')+'</tr></thead><tbody>'+(rows.length?rows.map(r=>'<tr>'+r.map(c=>'<td>'+(c===null?'<i>NULL</i>':esc(c))+'</td>').join('')+'</tr>').join(''):'<tr><td colspan="'+cols.length+'"><i>no rows</i></td></tr>')+'</tbody></table>';
 function run(){try{const r=runSql(input.value,db);msg.className='sql-msg ok';msg.textContent='✓ '+r.msg;out.innerHTML=r.show?table(COLS,db.rows.map(x=>COLS.map(c=>x[c]))):table(r.cols,r.rows)}catch(e){msg.className='sql-msg no';msg.textContent='✗ '+e.message}}
 root.addEventListener('click',e=>{const x=e.target.closest('[data-ex]');if(x){input.value=EX[+x.dataset.ex];run();return}if(e.target.closest('#sql-run'))run();if(e.target.closest('#sql-reset')){db=SEED();input.value='SELECT * FROM student';run();msg.textContent='Table reset to the six starting rows.'}});
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();run()}});run();
}

/* ================= 6. Notification builder ================= */
function notify(root){
 root.innerHTML='<div class="lab-two"><div><div class="nt-phone"><div class="nt-status"><span>9:41</span><i class="nt-ico"></i></div><div class="nt-shade"><div class="nt-card"><small><b class="nt-app">MAD Demo</b> · <span class="nt-ch"></span> · now</small><strong class="nt-t"></strong><span class="nt-x"></span></div></div><p class="nt-why" aria-live="polite"></p></div></div>'+
 '<div><div class="lab-controls"><label class="lab-field">Title<input type="text" id="nt-title" value="Quiz 2 tomorrow" maxlength="40"></label><label class="lab-field">Text<input type="text" id="nt-text" value="Revise Lectures 5 to 7" maxlength="60"></label><label class="lab-field">Channel name<input type="text" id="nt-chan" value="Reminders" maxlength="24"></label><label class="lab-field">Importance<select id="nt-imp"><option value="LOW">LOW: silent</option><option value="DEFAULT" selected>DEFAULT: sound</option><option value="HIGH">HIGH: pops on screen</option></select></label><label class="lab-check"><input type="checkbox" id="nt-perm" checked> POST_NOTIFICATIONS granted (Android 13+)</label></div><div class="lab-btns"><button type="button" class="go" id="nt-send">🔔 notify()</button></div><div class="pzv" id="nt-code"></div></div></div>';
 const g=id=>$('#'+id,root),clean=s=>String(s).replace(/["\\\n]/g,'');let t;
 function draw(){const title=clean(g('nt-title').value),text=clean(g('nt-text').value),chan=clean(g('nt-chan').value),imp=g('nt-imp').value;
  $('.nt-t',root).textContent=title;$('.nt-x',root).textContent=text;$('.nt-ch',root).textContent=chan;
  code(g('nt-code'),'// 1. Create the channel once (Android 8+)\nval channel = NotificationChannel(\n    "reminders", "'+chan+'",\n    NotificationManager.IMPORTANCE_'+imp+')\ngetSystemService(NotificationManager::class.java)\n    .createNotificationChannel(channel)\n\n// 2. Build the notification\nval n = NotificationCompat.Builder(this, "reminders")\n    .setSmallIcon(R.drawable.ic_bell)\n    .setContentTitle("'+title+'")\n    .setContentText("'+text+'")\n    .setAutoCancel(true)\n    .build()\n\n// 3. Show it (needs POST_NOTIFICATIONS on Android 13+)\nNotificationManagerCompat.from(this).notify(1, n)','kotlin','MainActivity.kt')}
 function send(){const ph=$('.nt-phone',root),why=$('.nt-why',root),ok=g('nt-perm').checked,imp=g('nt-imp').value;clearTimeout(t);ph.className='nt-phone';void ph.offsetWidth;
  if(!ok){why.innerHTML='Nothing appears. On Android 13+ <code>notify()</code> does nothing until the user grants <b>POST_NOTIFICATIONS</b>.';return}
  ph.classList.add('show',imp==='HIGH'?'heads':'quiet');why.innerHTML=imp==='HIGH'?'HIGH importance: it pops over the screen (heads-up) and makes a sound.':imp==='LOW'?'LOW importance: no sound. It waits in the notification shade.':'DEFAULT importance: sound and a status-bar icon.';t=setTimeout(()=>ph.classList.remove('heads'),2600)}
 root.addEventListener('input',draw);g('nt-send').addEventListener('click',send);draw();cleanup=()=>clearTimeout(t);
}

/* ================= 7. Main thread vs background ================= */
function thread(root){
 root.innerHTML='<div class="lab-two"><div><div class="th-phone"><div class="th-spin"></div><button type="button" class="th-tap">Tap me: <b>0</b></button><div class="th-prog"><i></i></div><div class="th-anr" hidden><b>MAD Demo isn’t responding</b><span>Close app · Wait</span></div></div></div><div><p class="lab-state" id="th-state">The spinner is drawn by the <b>main thread</b>. Watch what happens to it.</p><div class="lab-btns"><button type="button" data-th="main">Run 6-second download on the <b>main thread</b></button><button type="button" data-th="bg" class="go">Run it on a <b>background thread</b></button></div><div class="lab-log"><b>What happened</b><ol></ol></div></div></div><p class="lab-note">The freeze is simulated here. On a real phone, blocking the main thread for about 5 seconds shows the “isn’t responding” dialog.</p>';
 const ph=$('.th-phone',root),log=$('.lab-log ol',root),bar=$('.th-prog i',root),tap=$('.th-tap b',root),anr=$('.th-anr',root);let taps=0,frozen=false,busy=false,queued=0,ts=[];
 const add=(t,c)=>{log.appendChild(el('li',c||null,t));log.parentNode.scrollTop=1e5};
 const later=(ms,f)=>ts.push(setTimeout(f,ms));
 root.addEventListener('click',e=>{
  if(e.target.closest('.th-tap')){if(frozen){queued++;return}taps++;tap.textContent=taps;return}
  const b=e.target.closest('[data-th]');if(!b||busy)return;busy=true;anr.hidden=true;bar.style.transition='none';bar.style.width='0';void bar.offsetWidth;
  if(b.dataset.th==='main'){frozen=true;ph.classList.add('frozen');add('download() started on the main thread','act');add('UI frozen: the spinner stops, taps are ignored','warn');
   later(5000,()=>{anr.hidden=false;add('5 s: Android shows “isn’t responding”','warn')});
   later(6000,()=>{frozen=false;ph.classList.remove('frozen');anr.hidden=true;bar.style.width='100%';taps+=queued;tap.textContent=taps;add('download finished. '+queued+' queued tap'+(queued===1?'':'s')+' delivered late.');queued=0;busy=false})}
  else{add('Thread { download() }.start()','act');add('UI stays smooth: keep tapping','ok');bar.style.transition='width 6s linear';bar.style.width='100%';
   later(6000,()=>{add('runOnUiThread { show result }: views are updated on the main thread','ok');busy=false})}
 });
 cleanup=()=>ts.forEach(clearTimeout);
}

/* ================= 8. dp / px converter ================= */
function dp(root){
 const DEN=[['mdpi',160],['hdpi',240],['xhdpi',320],['xxhdpi',480],['xxxhdpi',640]];
 root.innerHTML='<div class="lab-controls row"><label class="lab-field">Size in dp<input type="number" id="dp-in" value="48" min="1" max="400"></label></div><div class="dp-rows"></div><p class="lab-note"><code>px = dp × (dpi ÷ 160)</code>. A 48dp button is the same physical size on every screen, about 7.6 mm, which is why 48dp is the minimum touch target.</p>';
 function draw(){const v=Math.max(1,Math.min(400,+$('#dp-in',root).value||0));$('.dp-rows',root).innerHTML=DEN.map(d=>{const px=Math.round(v*d[1]/160);return'<div class="dp-row"><b>'+d[0]+'</b><small>'+d[1]+' dpi · ×'+(d[1]/160)+'</small><i><u style="width:'+Math.min(100,px/(400*4)*100*4)+'%"></u></i><strong>'+px+' px</strong></div>'}).join('')}
 root.addEventListener('input',draw);draw();
}

/* ================= registry + pages ================= */
const LABS=[
 {id:'lifecycle',ic:'🔄',t:'Activity lifecycle',d:'Press Home, Back and Rotate and watch every callback fire in order.',l:9,f:lifecycle},
 {id:'intent',ic:'✉️',t:'Intent builder',d:'Choose what should happen and get the Kotlin and manifest code.',l:5,f:intent},
 {id:'layout',ic:'📐',t:'Layout lab',d:'Change orientation, gravity, padding and weight. See the screen and the XML.',l:4,f:layout},
 {id:'perm',ic:'🔐',t:'Permission helper',d:'Pick a feature: see its type, the manifest line and the request code.',l:6,f:perm},
 {id:'sql',ic:'🗄️',t:'SQL playground',d:'Run SELECT, INSERT, UPDATE and DELETE on a practice student table.',l:11,f:sql},
 {id:'notify',ic:'🔔',t:'Notification builder',d:'Set the channel and importance, then fire the notification.',l:7,f:notify},
 {id:'thread',ic:'🧵',t:'Main thread vs background',d:'Freeze the UI with work on the main thread, then fix it.',l:15,f:thread},
 {id:'dp',ic:'📏',t:'dp to px converter',d:'See why layouts use dp instead of pixels.',l:4,f:dp}];

function hubPage(host,ctx){
 host.innerHTML='<div class="pp-head"><span class="eyebrow">Learn by doing</span><h1>Labs</h1><p>Interactive simulators for the ideas students find hardest. They model Android in the browser; the code they produce runs in Android Studio.</p></div>'+
 '<div class="hub-grid">'+LABS.map(l=>'<a class="hub-card lab'+(ctx.done[l.id]?' done':'')+'" href="#labs/'+l.id+'"><span class="ico">'+l.ic+'</span><b>'+l.t+'</b><p>'+l.d+'</p><small>Lecture '+pad(l.l)+(ctx.done[l.id]?' · tried ✓':'')+'</small></a>').join('')+'</div>'+
 '<h2 class="pp-h">Animation library</h2><p class="pp-note">Every animation from the slide decks, ready to step through on its own.</p><div class="chip-scroll" id="an-filter"><button type="button" class="on" data-l="0">All</button>'+Array.from({length:16},(_,i)=>'<button type="button" data-l="'+(i+1)+'">L'+pad(i+1)+'</button>').join('')+'</div><div class="an-list" id="an-list"><p class="pp-load">Loading animations…</p></div>';
 ctx.loadDecks().then(()=>{const box=$('#an-list',host);if(!box)return;const items=[];for(let l=1;l<=16;l++)(ctx.decks[l]||[]).forEach((s,i)=>{if(s.viz)items.push({l,i,t:plain(s.title||''),k:s.viz.type})});
  const draw=f=>{const xs=items.filter(x=>!f||x.l===f);box.innerHTML=xs.length?xs.map(x=>'<a href="#labs/anim/'+x.l+'/'+(x.i+1)+'"><span class="lec-chip">L'+pad(x.l)+'</span><b>'+esc(x.t)+'</b><small>'+esc(x.k)+'</small></a>').join(''):'<p class="pp-empty">No animations in this lecture.</p>'};draw(0);
  $('#an-filter',host).addEventListener('click',e=>{const b=e.target.closest('[data-l]');if(!b)return;$$('#an-filter button',host).forEach(x=>x.classList.toggle('on',x===b));draw(+b.dataset.l)})});
}
function labPage(host,lab,ctx){
 host.innerHTML='<a class="back-link" href="#labs">'+ctx.IC.back+' Labs</a><div class="pp-head"><span class="eyebrow">Lab · Lecture '+pad(lab.l)+'</span><h1>'+lab.ic+' '+lab.t+'</h1><p>'+lab.d+'</p></div><div class="lab-body"></div><div class="lab-foot"><a class="secondary-button" href="#lecture-'+lab.l+'">Read Lecture '+pad(lab.l)+'</a><a class="present-btn" href="#present/'+lab.l+'/1">▶ Slides for this topic</a></div><p class="pp-note">Simulation. It models Android’s behaviour in the browser. Android code runs in Android Studio.</p>';
 lab.f($('.lab-body',host),ctx);ctx.mark(lab.id);
}
function animPage(host,l,i,ctx){
 host.innerHTML='<a class="back-link" href="#labs">'+ctx.IC.back+' Labs</a><p class="pp-load">Loading…</p>';
 ctx.loadDecks().then(()=>{const s=(ctx.decks[l]||[])[i-1];if(!s||!s.viz){host.innerHTML='<a class="back-link" href="#labs">'+ctx.IC.back+' Labs</a><p class="pp-empty">Animation not found.</p>';return}
  host.innerHTML='<a class="back-link" href="#labs">'+ctx.IC.back+' Labs</a><div class="pp-head"><span class="eyebrow">Animation · Lecture '+pad(l)+'</span><h1>'+md(s.title||'')+'</h1>'+(s.text?'<p>'+md(s.text)+'</p>':'')+'</div><div class="pzv an-stage"></div>'+(s.takeaway?'<p class="an-take">'+md(s.takeaway)+'</p>':'')+'<div class="lab-foot"><a class="present-btn" href="#present/'+l+'/'+i+'">▶ Open this slide</a><a class="secondary-button" href="#lecture-'+l+'">Read Lecture '+pad(l)+'</a></div>';
  const ctl=P.mountViz($('.an-stage',host),s.viz);cleanup=()=>{if(ctl)ctl.destroy()};ctx.mark('anim')});
}
window.MADLabs={list:LABS,runSql,seed:SEED,
 render(host,sub,ctx){if(cleanup){try{cleanup()}catch(e){}cleanup=null}
  const lab=LABS.find(l=>l.id===sub[0]);
  if(lab)labPage(host,lab,ctx);else if(sub[0]==='anim'&&+sub[1]&&+sub[2])animPage(host,+sub[1],+sub[2],ctx);else hubPage(host,ctx);
  window.scrollTo(0,0)}};
})();
