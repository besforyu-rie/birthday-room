/* live3d.js — HANYA untuk versi 3D (index.html). Jangan dimuat di index2d.html.
   Muat PALING AKHIR, setelah wall3d.js:
     <script src="live3d.js?v=1"></script>

   Isi:
   1. Presence: siapa online & lagi di ruang mana (koleksi Firestore "presence").
   2. Ava mengikuti player: ava-mu selalu ada di ruangan yang sedang kamu lihat, ava teman yang online
      muncul di ruangan tempat mereka sebenarnya berada, ava offline ikut "mampir" ke ruangan yang sedang dilihat.
   3. Gerak realtime ava yang ONLINE (koleksi "pos"): tujuan jalan / duduk dikirim, ava teman di layarmu berjalan & duduk sama.
      Ava offline tetap keliling acak di device masing-masing.
   4. Interaksi realtime (koleksi "live"): elus kucing, kasih makan ikan, bintang jatuh, sofa, TV, tangkap balon,
      sapa, tiup lilin. Muncul sebagai efek + toast di layar semua orang.
   5. Mode pesta: hitung mundur, ledakan konfeti, ava berkumpul, Aqsa tiup lilin -> semua layar ikut merayakan.

   Device tester: pakai kode kedua (hashDev di secret3d.js) atau di console: localStorage.setItem('bday-dev','1').
   Syarat: aturan Firestore untuk presence, live, party sudah dipublish.
   Tes lokal tanpa nunggu jam 10 malam: buka index.html?partytest=25  (pesta mulai 25 detik setelah halaman dibuka).
   Ganti jam pesta tanpa edit file: buat dokumen party/main di Firestore dengan field startAt (timestamp).
   Kalau Firestore gagal, semua fitur ini mati diam-diam dan web 3D tetap jalan seperti biasa. */
(()=>{
/* ===== EDIT BAGIAN INI ===== */
const PARTY_ISO='2026-11-07T22:00:00+07:00'; /* jam pesta (WIB). bisa ditimpa dokumen party/main */
const HB=75000;          /* heartbeat presence (ms). jangan terlalu kecil, hemat kuota Firestore */
const ONLINE_MS=200000;  /* dianggap online kalau heartbeat terakhir kurang dari ini */
const AMBIENT=0;         /* ava offline yang dipaksa "mampir" ke ruangan yang sedang kamu lihat. 0 = mati (dunia konsisten: kamu ketemu mereka kalau kamu yang datang ke ruangan mereka) */
const SPREAD=true;       /* saat web dibuka, ava offline tersebar ke berbagai ruangan (bukan numpuk di ruangan yang kamu buka) */
/* =========================== */
const g0=fn=>{try{return fn()}catch(e){return null}};
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof V==='undefined'||typeof did==='undefined'||
   typeof place==='undefined'||typeof say3==='undefined'||typeof paintV==='undefined')return;

const ROOMN=['ruang utama','lounge','galeri kenangan','kamar tidur','ruang makan','balkon','basement','teras','taman'];
const ENTRY={0:{x:-5.8,z:6.8},1:{x:-4,z:1.2},2:{x:-4,z:1.3},3:{x:2.9,z:1.7},4:{x:-4,z:1.5},5:{x:-2.2,z:-2.2},6:{x:1.9,z:-1},7:{x:0,z:-2.2},8:{x:-3.9,z:.5}};
const CX={120:3,160:4,200:5,240:6,280:7,320:8}; /* posisi kamera -> nomor ruangan (lantai 2, basement, teras, taman) */
const lsg=k=>{try{return localStorage.getItem(k)}catch(e){return null}};
const isAqsaName=n=>String(n||'').trim().toLowerCase()==='aqsa';
const qs=new URLSearchParams(location.search),TEST=+qs.get('partytest')||0;
/* tanpa console: index.html?dev=1 -> device ini jadi tester (bukan Aqsa). index.html?reset=1 -> hapus semua flag (kode rahasia diminta lagi) */
try{if(qs.get('reset')==='1'){localStorage.removeItem('bday-aqsa');localStorage.removeItem('bday-dev')}
 if(qs.get('dev')==='1')localStorage.setItem('bday-dev','1')}catch(e){}
/* device Aqsa = sudah masuk kamar rahasia dengan kode Aqsa. Device tester (flag bday-dev, diset kode kedua) TIDAK dianggap Aqsa,
   kecuali sedang gladi bersih (?partytest=...) supaya tombol tiup lilin bisa dites. */
const aqsaDevice=()=>lsg('bday-aqsa')==='1'&&(lsg('bday-dev')!=='1'||TEST>0);

/* ---------- identitas & ruangan saat ini ---------- */
function myName(){
 if(aqsaDevice())return 'Aqsa';
 const o=g0(()=>own);
 if(o&&o.n){const n=String(o.n).trim().slice(0,12);if(n)return n}
 return null}
function myRoom(){
 const F=window.F2;
 if(F&&F.on){const r=CX[Math.round(F.cx)];if(r!=null)return r}
 return typeof curRoom==='number'?curRoom:0}
const eff=r=>(r===2&&!window.GRP)?1:r; /* galeri belum ada -> dianggap lounge, sama seperti place() */

/* ---------- waktu server (perkiraan) ---------- */
let off=0;const serverNow=()=>Date.now()+off;

/* ---------- UI: HUD, toast, banner, tombol ---------- */
const css=document.createElement('style');
css.textContent=`
#lvh{position:fixed;top:8px;left:8px;z-index:15;font:20px VT323,monospace;background:rgba(243,248,255,.92);border:3px solid var(--ink);padding:2px 8px;pointer-events:none;line-height:1.15;display:none}
#lvh b{color:#2fa84f}#lvh i{font-style:normal;color:#b0293f}
#lvt{position:fixed;left:8px;bottom:70px;z-index:15;display:flex;flex-direction:column;gap:4px;pointer-events:none;max-width:70vw}
#lvt div{font:20px VT323,monospace;background:#fff;border:3px solid var(--ink);padding:2px 8px;transition:opacity .4s;line-height:1.1}
#lvb{position:fixed;left:0;right:0;top:34%;z-index:25;text-align:center;pointer-events:none;font:clamp(14px,4.5vw,28px)/1.6 'Press Start 2P',monospace;color:#fff;text-shadow:3px 3px 0 var(--hot),-2px -2px 0 var(--ink);opacity:0;transition:opacity .3s;padding:0 12px}
#lvb.on{opacity:1}#lvb.big{font-size:clamp(40px,16vw,110px)}
`;document.head.appendChild(css);
const mk=(tag,id,par)=>{const e=document.createElement(tag);if(id)e.id=id;(par||document.body).appendChild(e);return e};
const hud=mk('div','lvh'),tc=mk('div','lvt'),bn=mk('div','lvb');
function toast(t){const e=document.createElement('div');e.textContent=t;tc.appendChild(e);
 while(tc.children.length>3)tc.removeChild(tc.firstChild);
 setTimeout(()=>{e.style.opacity=0;setTimeout(()=>e.remove(),450)},4500)}
let bnT=0;
function banner(t,ms,big){bn.textContent=t;bn.className='on'+(big?' big':'');clearTimeout(bnT);if(ms)bnT=setTimeout(()=>{bn.className=''},ms)}
const bar=document.getElementById('bar');
const mkBtn=(txt,cls,fn)=>{const b=document.createElement('button');b.className='btn '+cls;b.textContent=txt;b.style.display='none';b.onclick=fn;if(bar)bar.prepend(b);return b};

/* ---------- avatar: pindah ruangan ---------- */
function canRoom(r){return !window.R3||!!(R3.BND&&R3.BND[r])||r<=2}
function warp(v,r){
 if(v.room===r)return;
 if(!canRoom(r))return;
 place(v,r);const e=ENTRY[r]||ENTRY[0];
 v.x=e.x;v.z=e.z;v.dx=0;v.dz=1;v.mode=null;v.goal=null;v.path=null;v.xfer=null;v.seat=null;v.f=2;
 if(window.R3){R3.ensure(v);const R=v.R;R.wp=[];R.act=null;R.poi=-1;R.dance=false;R.wait=.3;R.fa=0}
 if(v.L)v.L(0);if(v.Ar)v.Ar(0,0);
 g0(()=>paintV(v))}
function moveRemote(v,tr,mr){
 const now=Date.now();
 if(v._mvTo===tr){if(now-v._mvAt<9000)return;v._mvTo=null;v._lx=null;warp(v,tr);return}
 v._mvTo=tr;v._mvAt=now;
 /* kalau kita sedang melihat ruangan asalnya dan ada pintu langsung: jalan lewat pintu */
 if(mr===v.room&&window.R3&&typeof DRS!=='undefined'){
  const d=(DRS[v.room]||[]).find(x=>x.to===tr);
  if(d){v.mode=null;v.goal=null;v.path=null;R3.ensure(v);v._lx=d;v.xfer=d;
   if(R3.goTo(v,d.x,d.z,null))return;
   v.xfer=null;v._lx=null}}
 v._mvTo=null;warp(v,tr)}

/* ---------- presence ---------- */
const P=new Map();let known=new Set(),ready=false,lastMr=-9,gatherAt=0,lastG=0;
let lastP={n:null,r:null},lastPW=0,pT=0;
function pub(force){
 if(!db||!fs)return;
 const n=myName();if(!n)return;
 const r=document.hidden?-1:myRoom(),now=Date.now();
 if(!force&&n===lastP.n&&r===lastP.r&&now-lastPW<HB)return;
 if(now-lastPW<3600){if(!pT)pT=setTimeout(()=>{pT=0;pub(true)},3700-(now-lastPW));return}
 lastP={n,r};lastPW=now;
 fs.setDoc(fs.doc(db,'presence',did),{n,r,ts:fs.serverTimestamp()}).catch(e=>console.warn('presence',e))}
const fresh=p=>serverNow()-p.ms<ONLINE_MS;
function onlineMap(){const m=new Map();P.forEach((p,id)=>{if(fresh(p))m.set(id,p)});return m}

function renderHud(){
 if(!db){hud.style.display='none';return}
 const on=onlineMap(),ids=new Set(on.keys());
 if(myName()&&lastP.n)ids.add(did);
 /* toast saat ada yang baru online (bukan snapshot awal) */
 if(ready){ids.forEach(id=>{if(id!==did&&!known.has(id)){const p=on.get(id);if(p)toast(isAqsaName(p.n)?'Aqsa udah online!':p.n+' masuk ke web')}})}
 known=ids;
 let h='<b>●</b> '+ids.size+' online';
 if(!isAqsaName(myName())){let aq=null;on.forEach((p,id)=>{if(id!==did&&isAqsaName(p.n))aq=p});
  if(aq)h+=' · <i>Aqsa '+(aq.r>=0&&aq.r<=8?'di '+ROOMN[aq.r]:'online')+'</i>'}
 if(partyTxt)h+=' · '+partyTxt;
 hud.innerHTML=h;hud.style.display='block'}

/* ---------- event realtime ---------- */
const seen=new Set();let lastE=0;
function emit(k){
 try{
  if(!db||!fs)return;const n=myName();if(!n)return;
  const r=myRoom();if(!(r>=0&&r<=8))return;
  const now=Date.now();if(now-lastE<2600)return;lastE=now;
  fs.setDoc(fs.doc(db,'live',did),{n,k,r,ts:fs.serverTimestamp()}).catch(e=>console.warn('live',e))
 }catch(e){console.warn(e)}}
const PH={pet:'elus kucing~',feed:'nyam~',wish:'make a wish~',sit:'nyaman~',tv:'seru nih~',balloon:'tangkap balon!',candle:'tiup lilin!'};
const TX={pet:'ngelus kucing',feed:'kasih makan ikan',wish:'minta bintang jatuh',sit:'duduk di sofa',tv:'nonton TV',balloon:'main tangkap balon',candle:'meniup lilin',wave:'menyapa semua orang'};
function dropFood(){g0(()=>{for(let i=0;i<4;i++)food.push(bx(.05,.05,.05,'#f2c14e',3.4+Math.random()*1,1.9,-2.6,LG))})}
function celebrate(blow){
 if(blow)g0(()=>{lit=false;flames.forEach(f=>f.visible=false)});
 banner('Selamat ulang tahun, Aqsa!',7000);
 [0,1200,2400].forEach(t=>setTimeout(()=>g0(confetti),t))}
function onEvent(id,d){
 const k=d.k,n=String(d.n||'tamu').slice(0,12),r=+d.r,mr=myRoom();
 toast(n+' '+(TX[k]||k)+(r!==mr&&ROOMN[r]?' ('+ROOMN[r]+')':''));
 if(r===mr){
  const v=V.get(id);
  if(v&&v.room===eff(r)&&v.tg){let t=PH[k];if(k==='wave'&&typeof GREET!=='undefined')t=GREET[Math.random()*GREET.length|0];if(t){say3(v.tg,t);g0(()=>{sayT=3})}}
  if(k==='feed'&&r===1)dropFood();
  if(k==='wish'&&r===0&&g0(()=>night))g0(()=>winClick())}
 if(k==='candle'&&isAqsaName(n))celebrate(true)}

/* pasang pemancar event ke benda yang sudah ada (perilaku lama tetap jalan) */
function hook(o,kind,pre,post){
 if(!o||!o.userData||typeof o.userData.fn!=='function'||o._lv)return;
 o._lv=1;const f=o.userData.fn;
 o.userData.fn=function(){let p=null;try{p=pre?pre():null}catch(e){}
  const r=f.apply(this,arguments);
  try{if(!post||post(p))emit(kind)}catch(e){}
  return r}}
function hookAll(){
 hook(g0(()=>cat),'pet');
 hook(g0(()=>tank),'feed');
 hook(g0(()=>sf),'sit');
 hook(g0(()=>tg0),'tv');hook(g0(()=>tvG),'tv');
 hook(g0(()=>ar),'balloon');
 hook(g0(()=>cake),'candle',()=>!!g0(()=>lit),was=>was&&!g0(()=>lit)); /* hanya saat lilin menyala lalu padam */
 const wg=g0(()=>hits.find(o=>o.userData&&o.userData.fn===winClick));if(wg)hook(wg,'wish')}

/* ---------- mode pesta ---------- */
let PSTART=TEST>0?Date.now()+TEST*1000:Date.parse(PARTY_ISO),partyTxt='',litSet=false,boom=false,lastNum=-1;
const cbtn=mkBtn('tiup lilin','alt',()=>{
 if(g0(()=>lit)){const c=g0(()=>cake);if(c&&c.userData.fn)c.userData.fn()}
 else toast('lilinnya sudah ditiup')});
const fmt=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),h=s/3600|0,m=(s%3600)/60|0,q=s%60,p=x=>String(x).padStart(2,'0');return h?h+':'+p(m)+':'+p(q):m+':'+p(q)};
function gather(){
 if(!window.R3)return;
 const sp=[];[2.9,3.9].forEach(z=>{for(let x=-3.3;x<=3.4;x+=1.1)sp.push([Math.round(x*10)/10,z])});
 let i=0;
 V.forEach((v,id)=>{if(id===did||v._pin)return;
  warp(v,0);const s=sp[i++%sp.length];
  g0(()=>{R3.ensure(v);R3.goTo(v,s[0],s[1],{f:[0,-1],w:[40,60]})})})}
function partyTick(){
 const tl=PSTART-serverNow(),inWin=tl<=0&&tl>-20*60000;
 partyTxt=tl>0&&tl<3600000?'pesta '+fmt(tl):inWin?'pesta berlangsung':'';
 if(tl>15000){litSet=false;boom=false;lastNum=-1}
 if(tl<=15000&&tl>-20*60000&&!litSet){litSet=true;g0(()=>{if(!lit){lit=true;flames.forEach(f=>f.visible=true)}})}
 if(tl<=10000&&tl>0){const n=Math.ceil(tl/1000);if(n!==lastNum){lastNum=n;banner(String(n),1500,true)}}
 if(tl<=0&&!boom){boom=true;if(tl>-8000){celebrate(false);gather()}}
 cbtn.style.display=(aqsaDevice()&&tl<=15000&&tl>-20*60000&&g0(()=>lit))?'':'none'}

/* ---------- gerak realtime ava online (koleksi "pos") ----------
   Yang dikirim hanya TUJUAN (bukan posisi tiap frame), jadi hemat kuota. Penerima menjalankan pencari jalan yang sama.
   Hanya dokumen di ruangan yang sedang kamu lihat yang didengarkan. */
let netOn=false,unsubPos=null,subRoom=-9,lastKey='',pendPos=false,lastPosW=0;
const q1=v=>Math.round(v*10)/10;
function trackOwn(){
 if(!netOn)return;const me=V.get(did);if(!me||!me.R||!myName())return;
 const R=me.R,dest=R.wp&&R.wp.length?R.wp[R.wp.length-1]:null,g=me.goal,m=(g&&g.mode)||me.mode||'';
 const tx=g?g.x:dest?dest.x:me.x,tz=g?g.z:dest?dest.z:me.z;
 const key=me.room+'|'+q1(tx)+','+q1(tz)+'|'+m;
 if(key!==lastKey){lastKey=key;pendPos=true}
 const now=Date.now();
 if(pendPos&&now-lastPosW>3500&&me.room>=0&&me.room<=8){
  pendPos=false;lastPosW=now;
  fs.setDoc(fs.doc(db,'pos',did),{r:me.room,x:q1(me.x),z:q1(me.z),tx:q1(tx),tz:q1(tz),m:(m==='sit'||m==='watch')?m:'',ts:fs.serverTimestamp()}).catch(e=>console.warn('pos',e))}}
function applyPos(id,d){
 const p=P.get(id);if(!p||!fresh(p))return;
 const v=V.get(id);if(!v||!window.R3)return;
 const r=eff(+d.r);if(!canRoom(r))return;
 if(v.room!==r){warp(v,r);v.x=d.x;v.z=d.z}
 R3.ensure(v);const R=v.R;
 v._ctl=Date.now();v._pin=true;v._mvTo=null;v._lx=null;v.xfer=null;v.mode=null;v.goal=null;v.seat=null;v.f=2;g0(()=>paintV(v));
 if(Math.hypot(v.x-d.x,v.z-d.z)>1.2){v.x=d.x;v.z=d.z;R.wp=[];R.act=null}
 if(d.m==='sit'||d.m==='watch'){R.wp=[];R.act=null;R.dance=false;v.goal={x:d.tx,z:d.tz,mode:d.m}}
 else if(Math.hypot(d.tx-v.x,d.tz-v.z)>.15){if(!R3.goTo(v,d.tx,d.tz,{w:[8,16]})){v.x=d.tx;v.z=d.tz}}
 else{R.wp=[];R.act=null;R.wait=Math.max(R.wait||0,6)}}
function subPos(r){
 subRoom=r;if(unsubPos){try{unsubPos()}catch(e){}unsubPos=null}
 try{unsubPos=fs.onSnapshot(fs.query(fs.collection(db,'pos'),fs.where('r','==',r)),s=>{
  s.docChanges().forEach(ch=>{if(ch.type==='removed'||ch.doc.id===did)return;
   const d=ch.doc.data();if(!d.ts||!d.ts.toMillis||serverNow()-d.ts.toMillis()>ONLINE_MS)return;applyPos(ch.doc.id,d)})},e=>console.warn('pos',e))}catch(e){console.warn(e)}}

/* ---------- sinkron ava ---------- */
const hashS=t=>{let h=0;for(let i=0;i<t.length;i++)h=(h*31+t.charCodeAt(i))>>>0;return h};
function homeRooms(){const a=[0,1];if(window.GRP)a.push(2);for(let r=3;r<=8;r++)if(window.R3&&R3.BND&&R3.BND[r])a.push(r);return a}
const ambient=()=>[...V.entries()].filter(([id,v])=>id!==did&&!v._pin);
function sync(){
 const mr=myRoom(),tr=eff(mr),me=V.get(did),now=Date.now();
 if(netOn&&subRoom!==tr)subPos(tr);
 if(mr!==lastMr){lastMr=mr;gatherAt=now+1200}
 if(me&&me.room!==tr)warp(me,tr);
 const on=onlineMap();
 V.forEach((v,id)=>{
  if(id===did)return;
  const p=on.get(id);
  if(!v._homed){v._homed=true;if(SPREAD&&!(p&&p.r>=0)){const hr=homeRooms();warp(v,hr[hashS(id)%hr.length])}}
  if(p&&p.r>=0&&p.r<=8){v._pin=true;const t2=eff(p.r);if(v.room===t2){v._mvTo=null;v._lx=null}else moveRemote(v,t2,mr)}
  else v._pin=false});
 /* ava offline mampir ke ruangan yang sedang dilihat */
 if(now>gatherAt&&now-lastG>3500){
  const am=ambient(),here=am.filter(([,v])=>v.room===tr).length,want=Math.min(AMBIENT,am.length);
  if(here<want){
   const c=am.filter(([,v])=>v.room!==tr&&!v.mode&&!v.goal);
   if(c.length){lastG=now;warp(c[Math.random()*c.length|0][1],tr)}}}}
let acc=0;
function frame(dt){
 /* ava-mu & ava teman online tidak boleh keluar ruangan lewat AI pintu acak */
 const me=V.get(did);
 V.forEach(v=>{if((v===me||v._pin)&&v.xfer&&v.xfer!==v._lx){v.xfer=null;if(v.R){v.R.wp=[];v.R.act=null;v.R.wait=.6}}});
 V.forEach(v=>{if(v._ctl&&v._pin&&Date.now()-v._ctl<25000&&v.R&&!(v.R.wp&&v.R.wp.length)&&!v.goal&&!v.mode)v.R.wait=Math.max(v.R.wait||0,.6)}); /* ava online diam sampai ada perintah baru dari pemiliknya */
 trackOwn();
 acc+=dt;if(acc>=.5){acc=0;sync()}}

/* ---------- tombol sapa ---------- */
let sapaT=0;
const sbtn=mkBtn('sapa','',()=>{
 if(Date.now()-sapaT<8000)return;sapaT=Date.now();
 sbtn.style.opacity=.5;setTimeout(()=>{sbtn.style.opacity=1},8000);
 emit('wave');
 const me=V.get(did);if(me&&me.tg&&typeof GREET!=='undefined'){say3(me.tg,GREET[Math.random()*GREET.length|0]);g0(()=>{sayT=3})}});
setInterval(()=>{sbtn.style.display=(db&&myName())?'':'none'},1000);

/* ---------- jaringan Firestore ---------- */
function startNet(){
 try{
  fs.onSnapshot(fs.collection(db,'presence'),s=>{
   s.docChanges().forEach(ch=>{const id=ch.doc.id;
    if(ch.type==='removed'){P.delete(id);return}
    const d=ch.doc.data();if(!d.ts||!d.ts.toMillis)return;
    const ms=d.ts.toMillis();P.set(id,{n:String(d.n||'').slice(0,12),r:+d.r,ms});
    if(id===did&&!ch.doc.metadata.hasPendingWrites){const o=ms-Date.now();if(Math.abs(o)<6*3600000)off=o}});
   renderHud();ready=true},e=>console.warn('presence',e));
  let first=true;
  fs.onSnapshot(fs.collection(db,'live'),s=>{
   if(first){first=false;return} /* abaikan event lama saat baru buka */
   s.docChanges().forEach(ch=>{
    if(ch.type==='removed'||ch.doc.id===did)return;
    const d=ch.doc.data();if(!d.ts||!d.ts.toMillis||!d.k)return;
    const key=ch.doc.id+'|'+d.ts.toMillis();
    if(seen.has(key))return;
    seen.add(key);if(seen.size>200)seen.delete(seen.values().next().value);
    onEvent(ch.doc.id,d)})},e=>console.warn('live',e));
  if(!TEST)fs.onSnapshot(fs.doc(db,'party','main'),s=>{
   if(!s.exists())return;const t=s.data().startAt,ms=t&&t.toMillis?t.toMillis():null;
   if(ms&&ms>Date.now()-86400000&&ms!==PSTART){PSTART=ms;litSet=false;boom=false;lastNum=-1}},e=>console.warn('party',e));
  netOn=true;pub(true);
 }catch(e){console.warn('live3d net',e)}}

/* ---------- jalan ---------- */
hookAll();
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);try{frame(dt)}catch(e){console.warn('live3d',e)}}}
setInterval(()=>{try{pub(false);renderHud()}catch(e){console.warn(e)}},1000);
setInterval(()=>{try{partyTick()}catch(e){console.warn(e)}},250);
document.addEventListener('visibilitychange',()=>{try{pub(true)}catch(e){}});
let tries=0;const iv=setInterval(()=>{if(db&&fs){clearInterval(iv);startNet()}else if(++tries>100)clearInterval(iv)},400);
})();