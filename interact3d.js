/* interact3d.js — avatar PEMAIN ikut berinteraksi dengan benda yang di-tap.
   Taruh sefolder dengan index.html, muat PALING AKHIR (setelah floor2.js):
   <script src="interact3d.js?v=4"></script>
   Syarat: room3d.js versi terbaru (mengekspor window.R3) dan pemain sudah punya avatar ("+ bikin ava").

   Cara kerja: tap benda -> avatarmu jalan ke sana (lewat jalur yang menghindari perabot) lalu berdiri / duduk.
   Kalau avatarmu sedang di ruangan lain, dia langsung muncul di pintu ruangan itu lalu jalan ke benda.
   Tap benda yang sama lagi saat duduk = berdiri. Duduk otomatis berdiri sendiri setelah SIT_MAX detik.
   Tanpa avatar, semua benda berperilaku seperti biasa.

   Ruangan: 0 utama, 1 lounge, 2 galeri kenangan, 3 kamar tidur (lantai 2), 4 ruang makan (lantai 2), 5 balkon (lantai 2), 6 basement, 7 teras, 8 taman.
   Basement/teras/taman butuh basement3d.js & outdoor3d.js dimuat sebelum file ini.
   Mau ubah titik berdiri / ucapan? Cari bagian "EDIT" di bawah. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof V==='undefined'||typeof place==='undefined'||typeof unplace==='undefined'||
   typeof lh==='undefined'||typeof say3==='undefined'||typeof did==='undefined'||typeof paintV==='undefined'||!window.R3)return;
const R3=window.R3,SIT_MAX=90;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const g0=fn=>{try{return fn()}catch(e){return null}};

/* ===== EDIT: ruangan lantai 2 untuk jalan avatar (rintangan = [xMin,xMax,zMin,zMax], koordinat lokal ruangan) ===== */
/*ROOMS*/
const ROOMS={
 3:{obs:[[1.35,4.05,-3.5,-.05],[.4,1.4,-3.5,-2.7],[-4.6,-2,-3.6,-2.3],[-5,-3.6,-.3,1.7],[4.1,5,-.7,.1],[3.1,4.7,1.2,3.2]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:2.7,z:.5,f:[0,-1],w:[5,9],max:2},{x:.9,z:-2.4,f:[0,-1],w:[4,8],max:1},{x:-3.3,z:-2,f:[0,-1],w:[4,8],max:1},{x:-3.4,z:.7,f:[-1,0],w:[5,9],max:1}]},
 4:{obs:[[-1,2.6,0,1.8],[-.4,3.4,-3.6,-2.6],[-4.6,-3,-3.6,-2.3]],
    bnd:{x0:-4.5,x1:4.6,z0:-2.9,z1:3.2},
    pois:[{x:.2,z:-2.2,f:[0,-1],w:[4,8],max:1},{x:2.6,z:-2.2,f:[0,-1],w:[4,8],max:1},{x:-2.7,z:-2.2,f:[-1,0],w:[4,8],max:1},{x:.8,z:-1.0,f:[0,1],w:[4,8],max:2}]}
};
/* titik muncul saat avatar pindah ruangan: pintu / tangga masing-masing ruangan */
const ENTRY={0:{x:-5.8,z:6.8},1:{x:-4,z:1.2},2:{x:-4,z:1.3},3:{x:2.9,z:1.7},4:{x:-4,z:1.5}};
/* balkon (ruang 5 = lantai 2, ruang ke-3). obs = rintangan [xMin,xMax,zMin,zMax] */
ROOMS[5]={obs:[[.2,1.8,-.25,1.6],[-3.8,-2.6,-.7,1.4],[-2.7,-1.9,-.5,.3],[-4.5,-3.8,1.6,2.3],[3.4,4.0,1.6,2.2],[3.6,4.8,-2.9,-1.2],[-4.7,-3.7,-3.6,-2.3],[4.0,5,2.5,3.4],[-4.7,-3.9,2.7,3.4]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:-1.5,z:2.7,f:[0,1],w:[5,9],max:1},{x:2.6,z:2.7,f:[0,1],w:[5,9],max:1},{x:3.1,z:1.9,f:[1,0],w:[5,9],max:1},{x:0,z:-1.6,f:[0,-1],w:[4,8],max:1}]};
ENTRY[5]={x:-2.2,z:-2.2};
/* basement (ruang 6) — dipasang kalau basement3d.js dimuat */
ROOMS[6]={obs:[[-2.2,1.2,-1.5,.1],[1.6,4.8,-3.5,-2.2],[-4.7,-2.5,-3.5,-2.75],[-2.1,-1.1,-3.5,-2.55],[-5,-3.8,-2.05,-.05],[-5,-3.8,1.65,2.75],[2.2,4,1.55,2.25],[3.7,4.9,-1.25,.25]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:-.5,z:.9,f:[0,-1],w:[5,9],max:2},{x:-3.4,z:-1,f:[-1,0],w:[5,9],max:1},{x:-3.2,z:2.2,f:[-1,0],w:[4,8],max:1},{x:3.1,z:1.05,f:[0,1],w:[4,8],max:1}]};
ENTRY[6]={x:1.9,z:-1};
/* teras (ruang 7) & taman (ruang 8) — dipasang kalau outdoor3d.js dimuat */
ROOMS[7]={obs:[[-3.5,-.9,-3.5,-2.5],[.4,2.4,-.8,1.2],[3.8,4.8,-3.4,-2.3],[-4.7,-3.4,-3.4,-2.8],[-4.6,-3.9,2.6,3.3]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:-2.2,z:-1.9,f:[0,-1],w:[5,9],max:2},{x:1.4,z:1.7,f:[0,-1],w:[5,9],max:2},{x:4.3,z:-1.8,f:[0,-1],w:[4,8],max:1}]};
ROOMS[8]={obs:[[-1.1,1.7,-.9,1.9],[1.9,4.3,-3.2,-.8],[-4.1,-2.7,-3.3,-1.8],[-3.5,-1.1,2.3,3.1],[3.5,4.5,1.8,2.8]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:.3,z:2.3,f:[0,-1],w:[6,12],max:2},{x:3.1,z:-.2,f:[0,-1],w:[6,12],max:2},{x:-3.4,z:-1.2,f:[0,-1],w:[4,8],max:1},{x:-2.3,z:1.9,f:[0,1],w:[4,8],max:1}]};
ENTRY[7]={x:0,z:-2.2};ENTRY[8]={x:-3.9,z:.5};
/*ENDROOMS*/

/* ===== daftarkan kamar tidur (3) & ruang makan (4) ke sistem jalan-jalan ===== */
const grpAt=x=>S.children.find(o=>o.isGroup&&o.position.x===x&&o.position.y===0&&o.position.z===0);
const BEDG=grpAt(120),DING=grpAt(160),BALG=grpAt(200),BASG=grpAt(240),TERG=grpAt(280),TAMG=grpAt(320),HAS2=!!(BEDG&&DING),RG={};
if(HAS2){
 [3,4].forEach(r=>R3.addRoom(r,ROOMS[r].obs,ROOMS[r].bnd,ROOMS[r].pois));
 DRS[3]=[{x:3.9,z:1.0,to:0,sx:7.7,sz:3.5},{x:-1,z:-2.5,to:4,sx:-4,sz:1.5}];
 DRS[4]=[{x:-4.2,z:1.5,to:3,sx:-1,sz:-2.4}];
 RBD[3]=RBD[4]={x0:-4,x1:4,z0:-2,z1:2};
 if(BALG){
  R3.addRoom(5,ROOMS[5].obs,ROOMS[5].bnd,ROOMS[5].pois);
  DRS[3].push({x:-4.2,z:2.6,to:5,sx:-2.2,sz:-2.3});          /* pintu balkon di kamar tidur */
  DRS[5]=[{x:-2.2,z:-2.5,to:3,sx:-3.8,sz:2.6}];               /* pintu balkon -> kamar tidur */
  RBD[5]={x0:-4,x1:4,z0:-2,z1:2}}
 RG[3]=BEDG;RG[4]=DING;if(BALG)RG[5]=BALG;
}
/* ===== basement (ruang 6) ===== */
if(BASG){
 R3.addRoom(6,ROOMS[6].obs,ROOMS[6].bnd,ROOMS[6].pois);
 DRS[6]=[{x:1.9,z:-1.5,to:0,sx:7.7,sz:-1.6}];
 RBD[6]={x0:-3,x1:4,z0:.8,z1:2.8};
 RG[6]=BASG}
if(TERG&&TAMG){
 [7,8].forEach(r=>R3.addRoom(r,ROOMS[r].obs,ROOMS[r].bnd,ROOMS[r].pois));
 DRS[7]=[{x:3,z:-2.5,to:0,sx:8.1,sz:-3.4},{x:-4.2,z:.5,to:8,sx:-3.9,sz:.6}];
 DRS[8]=[{x:-4.2,z:.5,to:7,sx:-3.9,sz:.6}];
 RBD[7]=RBD[8]={x0:-3,x1:4,z0:1,z1:2.8};
 RG[7]=TERG;RG[8]=TAMG}
if(Object.keys(RG).length){
 const _place=place;
 place=function(v,r){
  const G=RG[r];if(!G)return _place(v,r);
  unplace(v);v.room=r;G.add(v.g,v.tg);lh.push(v.g);v.g.visible=v.tg.visible=true};
}

/* ===== inti: perintah ke avatar pemain ===== */
const own=()=>V.get(did);
function clearV(v){
 v.mode=null;v.goal=null;v.path=null;v.xfer=null;v.seat=null;v.f=2;
 const R=v.R;if(R){R.wp=[];R.act=null;R.dance=false;R.poi=-1;R.hold=0;R.wait=.2}
 paintV(v)}
function standUp(v){clearV(v);R3.eject(v.room,v)}
function warp(v,room){
 if(v.room===room)return;
 place(v,room);const e=ENTRY[room];v.x=e.x;v.z=e.z;v.dx=0;v.dz=1;
 R3.ensure(v);const R=v.R;R.wp=[];R.act=null;R.poi=-1;R.dance=false;R.wait=.2;R.fa=0;
 if(v.L)v.L(0);if(v.Ar)v.Ar(0,0)}

let P=null,sitT=0;
/* sp = {kind:'stand'|'sit', room, x, z, f:[hadapX,hadapZ], w:[detikMin,detikMax], say, stage:{x,z} (untuk sit)} */
function visit(sp){
 const v=own();if(!v||sp.room==null)return false;
 R3.ensure(v);
 if(sp.kind==='sit'&&v.mode==='sit'&&v.room===sp.room&&Math.hypot(v.x-sp.x,v.z-sp.z)<.7){standUp(v);say3(v.tg,'oke, berdiri dulu');P=null;return true}
 clearV(v);warp(v,sp.room);
 const st=sp.kind==='sit'?sp.stage:sp,an=sp.kind==='sit'?{f:[0,1],w:[.5,.5]}:{f:sp.f,w:sp.w||[22,34]};
 const ok=R3.goTo(v,st.x,st.z,an);
 if(!ok&&sp.kind!=='sit'){v.x=sp.x;v.z=sp.z;R3.eject(v.room,v);v.R.fa=Math.atan2((sp.f||[0,1])[0],(sp.f||[0,1])[1])}
 P={v,sp,t:0};return true}

function tick(dt){
 const v=own();
 if(v&&v.mode==='sit'){sitT+=dt;if(sitT>SIT_MAX){sitT=0;standUp(v);say3(v.tg,'pegel, berdiri dulu~')}}else sitT=0;
 if(!P)return;
 if(v!==P.v||v.room!==P.sp.room){P=null;return}
 P.t+=dt;const R=v.R;if(!R)return;
 if(R.wp.length&&P.t<20)return;
 const s=P.sp;P=null;
 if(s.kind==='sit'){R.wp=[];R.act=null;v.goal={x:s.x,z:s.z,mode:'sit'};v.seat=s.seat==null?null:s.seat}
 if(s.say)say3(v.tg,s.say)}
{const _wf=winFx;winFx=function(dt){_wf(dt);try{tick(dt)}catch(e){console.warn(e)}}}

/* ===== pasang ke benda: tap benda -> avatar pergi ke sana ===== */
function wrap(o,specFn,opt){
 if(!o||o._i3||!o.userData||typeof o.userData.fn!=='function')return;
 o._i3=1;const f=o.userData.fn;opt=opt||{};
 o.userData.fn=function(){
  if(own()){
   let sp=null;try{sp=specFn(o)}catch(e){console.warn(e)}
   if(sp)visit(sp);
   if(opt.replace){if(!sp&&opt.full)say3(o,opt.full);else if(opt.then)opt.then();return}}
  return f.apply(this,arguments)}}
const st=(room,x,z,f,say,w)=>()=>({kind:'stand',room,x,z,f,say:typeof say==='function'?say():say,w});
const findIn=(G,x,z,nth)=>{const a=G?G.children.filter(o=>o.userData&&typeof o.userData.fn==='function'&&Math.abs(o.position.x-x)<.02&&Math.abs(o.position.z-z)<.02):[];return a[nth||0]};
const under=(o,G)=>{for(;o;o=o.parent)if(o===G)return true;return false};

/* EDIT: titik berdiri & ucapan tiap benda. room, x, z = tempat berdiri, f = arah hadap, say = ucapan, w = lama diam (detik) */
function scan(){
 /* --- lounge (ruang 1) --- */
 wrap(g0(()=>sf),()=>{
  const me=own(),used=[...V.values()].filter(o=>o!==me&&sitting(o)).map(o=>o.seat),i=[0,1].find(j=>!used.includes(j));
  if(i==null)return null;
  return {kind:'sit',room:1,seat:i,x:SEAT[i],z:-2.35,stage:{x:SEAT[i],z:-1.4},say:'nyaman~'}},{replace:true,full:'sofa penuh'});
 wrap(g0(()=>tg0),()=>{
  const me=own(),n=[...V.values()].filter(o=>o!==me&&watching(o)).length;
  return {kind:'stand',room:1,x:1.2+[0,-1.2,1.2][n%3],z:-1.2,f:[0,-1],w:[25,35],say:'seru nih~'}},{replace:true,then:()=>tv()});
 wrap(g0(()=>tank),st(1,3.9,-1.4,[0,-1],'ikannya lucu~',[12,20]));

 /* --- ruang utama (ruang 0) --- */
 wrap(g0(()=>cake),st(0,0,2.9,[0,-1],'kuenya wangi~',[14,24]));
 wrap(g0(()=>tvG),st(0,0,-3.45,[0,-1],'nonton tv~',[20,30]));
 wrap(g0(()=>ar),st(0,-5,.5,[-1,0],'main dulu ah',[15,25]));
 wrap(g0(()=>bo),st(0,-5,3.4,[-1,0],'foto yuk!',[12,20]));
 wrap(g0(()=>sh),st(0,-5.5,-2.8,[-1,0],'mau baca buku apa ya',[15,25]));
 wrap(g0(()=>rd),st(0,-5.1,-1,[-1,0],'lagunya enak',[15,25]));
 wrap(g0(()=>ph),st(0,5.6,-.35,[0,-1],'halo?',[12,20]));
 wrap(g0(()=>cat),()=>({kind:'stand',room:0,x:Math.max(-5,Math.min(8,cat.position.x)),z:3,f:[0,1],w:[14,24],say:'meong~ sini kucing'}));
 wrap(S.children.find(o=>o.isGroup&&Math.abs(o.position.x-8.2)<.01&&Math.abs(o.position.z+5.3)<.01),st(0,8.1,-4.2,[0,-1],'balonnya lucu',[12,20]));
 wrap(S.children.find(o=>o.geometry&&o.geometry.type==='SphereGeometry'&&Math.abs(o.position.x+2.3)<.01&&Math.abs(o.position.z+4.6)<.01),
  ()=>({kind:'sit',room:0,x:-2.3,z:-4.6,stage:{x:-2.3,z:-3.65},say:'empuk banget~'}));

 /* --- galeri kenangan (ruang 2): berdiri di depan foto terdekat --- */
 const GRPG=window.GRP,V3=new THREE.Vector3();
 if(GRPG)lh.forEach(o=>{
  if(o._i3||!under(o,GRPG)||typeof o.userData.fn!=='function'||String(o.userData.fn).indexOf('goRoom')>=0)return;
  wrap(o,()=>{o.getWorldPosition(V3);const lx=V3.x-GRPG.position.x,X=[-3.3,0,3.3].reduce((a,b)=>Math.abs(b-lx)<Math.abs(a-lx)?b:a);
   return {kind:'stand',room:2,x:X,z:X===0?-1.7:-1.9,f:[0,-1],w:[18,30],say:pick(['kenangan ya...','lucu banget fotonya','jadi kangen~'])}})});

 /* --- dekor galeri kenangan yang tadinya tidak bisa di-tap: bangku, kursi santai, tanaman, rak, lukisan --- */
 if(GRPG&&!GRPG._zones&&typeof lact==='function'){
  GRPG._zones=1;
  /* zona tap tak terlihat (transparan) di atas benda; y0 = tinggi dasar, h = tinggi zona */
  const zone=(x,z,w,d,y0,h,lines)=>{const g=new THREE.Group();g.position.set(x,0,z);
   const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));m.position.y=y0+h/2;g.add(m);GRPG.add(g);
   lact(g,()=>say3(g,pick(lines)));return g};
  zone(0,-2.7,2.9,.75,0,.9,['bangkunya empuk','duduk santai sambil liatin foto','banyak kenangan di sini']);
  zone(4.35,.9,.95,.95,0,1.2,['kursinya nyaman banget','tempat favorit buat ngelamun']);
  zone(-4.2,-3.0,.7,.7,0,2.0,['tanamannya segar~','udah disiram belum ya']);
  zone(-4.75,-1.3,.4,1.7,2.0,1.4,['bukunya banyak banget','ada album lama di rak ini']);
  zone(-4.8,2.8,.3,1.0,2.5,1.0,['lukisannya bagus','siang-siang cerah ya']);
  zone(-4.8,-3.0,.3,1.0,2.5,1.0,['lukisan malamnya syahdu','bintangnya banyak']);
 }
 if(GRPG&&GRPG._zones){
  wrap(findIn(GRPG,0,-2.7),()=>{
   const me=own(),others=[...V.values()].filter(o=>o!==me&&o.room===2&&o.mode==='sit'),
         c=[-.9,-.2,.5,1.2].find(x=>!others.some(o=>Math.abs(o.x-x)<.5));
   if(c==null)return {kind:'stand',room:2,x:0,z:-1.7,f:[0,-1],w:[10,18],say:'bangkunya penuh, aku berdiri aja'};
   return {kind:'sit',room:2,x:c,z:-2.6,stage:{x:c,z:-1.6},say:'enak duduk di sini sambil liatin foto'}});
  wrap(findIn(GRPG,4.35,.9),st(2,3.4,.9,[1,0],'kursinya nyaman, tapi lihat-lihat dulu',[12,20]));
  wrap(findIn(GRPG,-4.2,-3.0),st(2,-3.5,-2.5,[-1,0],'tanamannya segar',[10,18]));
  wrap(findIn(GRPG,-4.75,-1.3),st(2,-4.1,-1.3,[-1,0],'bukunya banyak banget',[12,20]));
  wrap(findIn(GRPG,-4.8,2.8),st(2,-4.1,2.8,[-1,0],'lukisannya bagus',[10,18]));
  wrap(findIn(GRPG,-4.8,-3.0),st(2,-4.1,-2.0,[-1,0],'lukisan malamnya syahdu',[10,18]));
 }

 /* --- kamar tidur (ruang 3) --- */
 if(HAS2){
  wrap(findIn(BEDG,2.7,-1.8),()=>({kind:'sit',room:3,x:2.7,z:-.5,stage:{x:2.7,z:.4},say:'empuk banget kasurnya'}));
  wrap(findIn(BEDG,.9,-3.1),st(3,.9,-2.4,[0,-1],'lampu tidurnya imut',[10,18]));
  wrap(findIn(BEDG,-3.3,-3),st(3,-3.3,-2,[0,-1],'baju apa ya hari ini',[12,20]));
  wrap(findIn(BEDG,-4.35,.7),st(3,-3.4,.7,[-1,0],'kerja dulu sebentar',[15,25]));

  /* --- ruang makan (ruang 4) --- */
  wrap(findIn(DING,.2,-3.1),st(4,.2,-2.4,[0,-1],'cuci piring dulu~',[10,18]));
  wrap(findIn(DING,2.6,-3.1),st(4,2.6,-2.4,[0,-1],'masak apa ya',[12,20]));
  wrap(findIn(DING,-3.9,-2.95),st(4,-2.7,-2.2,[-1,0],'ada sisa kue nggak?',[10,18]));
  /* --- balkon (ruang 5) --- */
  if(BALG){
   wrap(findIn(BALG,1.0,.3),()=>{
    const me=own(),taken=[...V.values()].some(o=>o!==me&&o.room===5&&o.mode==='sit'&&Math.abs(o.x-1.0)<.5&&Math.abs(o.z+.55)<.5);
    if(taken)return {kind:'stand',room:5,x:-.2,z:-1.2,f:[1,0],w:[10,18],say:'kursinya udah dipakai, aku berdiri aja'};
    return {kind:'sit',room:5,x:1.0,z:-.55,stage:{x:1.0,z:-1.5},say:'kuenya kelihatan enak!'}});
   wrap(findIn(BALG,-3.2,.4),()=>{
    const me=own(),taken=[...V.values()].some(o=>o!==me&&o.room===5&&o.mode==='sit'&&o.x<-2.5);
    if(taken)return {kind:'stand',room:5,x:-2.3,z:1.5,f:[-1,0],w:[8,14],say:'kursi santainya lagi dipakai'};
    return {kind:'sit',room:5,x:-3.2,z:.1,stage:{x:-3.2,z:1.6},say:'enak banget rebahan di sini~'}});
   wrap(findIn(BALG,-2.3,-.1),st(5,-1.6,-.1,[-1,0],'es lemonnya seger',[10,18]));
   wrap(findIn(BALG,-4.1,1.9),st(5,-3.5,2.4,[-1,0],'banyak banget kadonya!',[12,20]));
   wrap(findIn(BALG,3.7,1.9),st(5,3.1,1.9,[1,0],'wah bintangnya kelihatan jelas',[15,25]));
   wrap(findIn(BALG,-4.2,-2.9),st(5,-3.4,-2.3,[-1,0],'palemnya segar banget',[10,18]));
   wrap(findIn(BALG,4.1,-2.0),st(5,3.3,-1.6,[1,0],'lemonnya belum matang',[10,18]));
   wrap(findIn(BALG,-4.3,3.0),st(5,-3.3,3.0,[-1,0],'bunganya cantik~',[10,18]));
   wrap(findIn(BALG,4.55,3.0),st(5,3.6,2.8,[1,0],'balonnya lucu',[12,20]));
  }

  wrap(findIn(DING,.8,.9,0),()=>{
   const me=own(),used=[...V.values()].filter(o=>o!==me&&o.room===4&&o.mode==='sit').map(o=>Math.round(o.x*10)),
         c=[.1,1.5].find(x=>!used.includes(Math.round(x*10)));
   return {kind:'sit',room:4,x:c==null?.1:c,z:-.2,stage:{x:c==null?.1:c,z:-1},say:'makan bareng yuk!'}});
 }

 /* --- basement (ruang 6) --- */
 if(BASG){
  wrap(findIn(BASG,-.5,-.7),st(6,-.5,.9,[0,-1],'mobilnya imut ya!',[12,20]));
  wrap(findIn(BASG,-4.35,-1.0),st(6,-3.4,-1,[-1,0],'lagi benerin apa nih?',[12,20]));
  wrap(findIn(BASG,-4.93,.9),st(6,-3.3,.95,[-1,0],'ayo main dart!',[10,18]));
  wrap(findIn(BASG,-4.3,2.2),st(6,-3.2,2.2,[-1,0],'cuci baju dulu~',[10,18]));
  wrap(findIn(BASG,-3.6,-3.05),st(6,-3.6,-2.35,[0,-1],'banyak barang lama di sini',[12,20]));
  wrap(findIn(BASG,3.1,1.9),st(6,3.1,1.05,[0,1],'sepedanya masih bagus',[10,18]));
  wrap(findIn(BASG,4.2,-.5),st(6,3.2,-.5,[1,0],'sisa dekor ultah~',[10,18]));
 }

 /* --- teras (ruang 7) & taman (ruang 8) --- */
 if(TERG&&TAMG){
  wrap(findIn(TERG,-2.2,-3.0),st(7,-2.2,-1.9,[0,-1],'enak buat ngopi sore',[12,20]));
  wrap(findIn(TERG,1.4,.2),st(7,1.4,1.7,[0,-1],'teh hangat + kue, mantap',[12,20]));
  wrap(findIn(TERG,4.3,-2.8),st(7,4.3,-1.8,[0,-1],'tanamannya subur',[10,18]));
  wrap(findIn(TAMG,.3,.5),st(8,.3,2.3,[0,-1],'make a wish~',[14,24]));
  wrap(findIn(TAMG,3.1,-2.0),st(8,3.1,-.2,[0,-1],'gazebonya adem banget',[14,24]));
  wrap(findIn(TAMG,-3.4,-2.5),st(8,-3.4,-1.2,[0,-1],'pohonnya rindang',[10,18]));
  wrap(findIn(TAMG,-2.3,2.7),st(8,-2.3,1.9,[0,1],'bunganya warna-warni~',[10,18]));
  wrap(findIn(TAMG,4.0,2.3),st(8,3.1,2.3,[1,0],'pohonnya cantik',[10,18]));
 }
}
try{scan()}catch(e){console.warn('interact3d',e)}
setInterval(()=>{try{scan()}catch(e){}},4000);
})();