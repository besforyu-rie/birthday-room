/* ============================================================================
   guestbook3d.js — MEJA BUKU TAMU 3D di lounge
   Dimuat PALING AKHIR (setelah greet3d.js dan live3d.js). Tidak mengubah file lain.

   Isi:
   - meja berkain + papan "BUKU TAMU" + buku terbuka di penyangga, bel, tempat pensil, bebek
   - halaman buku menampilkan 6 tamu terbaru (foto kepala 3D ava + nama)
   - klik meja / buku  -> jendela "buku tamu" berisi SEMUA tamu (ava 3D + nama)
   - klik bel -> ting!   klik bebek -> kwek!
   - otomatis ikut data pengunjung yang sudah ada (koleksi Firebase `visitors`), tanpa aturan baru
   ============================================================================ */
(function(){
'use strict';
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof build3!=='function'||typeof openM!=='function'){
  console.warn('[guestbook3d] dilewati: index.html belum siap');return}

/* ---------- PENGATURAN (edit di sini saja) ---------- */
const GB={
  room:0,            // 0 = ruang utama (di samping tangga), 1 = lounge
  x:7.3,z:4.5,       // posisi di ruang utama (tangga ada di x:9.4, jadi meja di sisi kirinya)
  lx:-3.1,lz:null,   // posisi kalau room:1 (lounge). lz null = otomatis di depan jalur jalan
  title:'BUKU TAMU',
  plaque:'welcome, tamu!',
  rows:3             // tamu per halaman buku (2 halaman)
};

const INK='#1f3a5f',BLUE='#4f7fb8',BLUE2='#2e527f',SKY='#8dbdf7',CREAM='#f3f8ff',YEL='#f2c14e',RED='#e84a5f';
const FPX="'Press Start 2P',monospace",FVT="'VT323',monospace";
const TOP=.86;

/* ---------- util 3D ---------- */
const mat=c=>new THREE.MeshLambertMaterial({color:c});
const put=(p,geo,c,x,y,z)=>{const m=new THREE.Mesh(geo,mat(c));m.position.set(x,y,z);p.add(m);return m};
const B=(p,w,h,d,c,x,y,z)=>put(p,new THREE.BoxGeometry(w,h,d),c,x,y,z);
const Cy=(p,rt,rb,h,c,x,y,z)=>put(p,new THREE.CylinderGeometry(rt,rb,h,18),c,x,y,z);
const Sp=(p,r,c,x,y,z,sx,sy,sz)=>{const m=put(p,new THREE.SphereGeometry(r,16,12),c,x,y,z);m.scale.set(sx||1,sy||1,sz||1);return m};
const H=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- util kanvas ---------- */
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function star(g,x,y,r,c){g.fillStyle=c;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.28,y-r*.28);g.lineTo(x+r,y);g.lineTo(x+r*.28,y+r*.28);g.lineTo(x,y+r);g.lineTo(x-r*.28,y+r*.28);g.lineTo(x-r,y);g.lineTo(x-r*.28,y-r*.28);g.closePath();g.fill()}
function fit(g,t,w){t=String(t);if(g.measureText(t).width<=w)return t;while(t.length>1&&g.measureText(t+'..').width>w)t=t.slice(0,-1);return t+'..'}
const mkCv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const mkTex=c=>{const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};

/* ---------- status online/offline: koleksi Firestore "presence" (sama dengan live3d.js, hanya dibaca) ---------- */
const ONLINE_MS=200000; /* samakan dengan ONLINE_MS di live3d.js */
const ROOMN=['ruang utama','lounge','galeri kenangan','kamar tidur','ruang makan','balkon','basement','teras','taman'];
const PRES=new Map();let presOK=false,tOff=0;
function startPres(n){
  if(typeof db!=='undefined'&&db&&typeof fs!=='undefined'&&fs){
    try{fs.onSnapshot(fs.collection(db,'presence'),s=>{
      s.docChanges().forEach(ch=>{
        const id=ch.doc.id;if(ch.type==='removed'){PRES.delete(id);return}
        const d=ch.doc.data();if(!d.ts||!d.ts.toMillis)return;
        const ms=d.ts.toMillis();PRES.set(id,{r:+d.r,ms});
        if(typeof did!=='undefined'&&id===did&&!ch.doc.metadata.hasPendingWrites){const o=ms-Date.now();if(Math.abs(o)<6*3600000)tOff=o}});
      presOK=true},e=>{console.warn('[guestbook3d] presence',e);presOK=false})}catch(e){console.warn(e)}
  }else if(n<80)setTimeout(()=>startPres(n+1),500);
}
/* null = status tidak diketahui (presence tidak terbaca) -> label online/offline disembunyikan, bukan salah ditampilkan */
function status(a){
  if(!presOK)return null;
  const p=PRES.get(a.id),fresh=p&&(Date.now()+tOff-p.ms<ONLINE_MS);
  if(typeof did!=='undefined'&&a.id===did)return{on:true,r:fresh?p.r:-2};
  return fresh?{on:true,r:p.r}:{on:false};
}
const roomTxt=s=>!s||!s.on||s.r===-2?'':(s.r>=0&&s.r<=8?ROOMN[s.r]:'tab tidak aktif');

/* ---------- data tamu (sama persis dengan yang dipakai lounge) ---------- */
function guests(){
  const m=new Map();
  try{if(typeof remote!=='undefined'&&Array.isArray(remote))remote.forEach(a=>m.set(a.id,a))}catch(e){}
  try{if(typeof own!=='undefined'&&own&&typeof did!=='undefined')m.set(did,{...own,id:did})}catch(e){}
  const mx=typeof MAX==='number'?MAX:20;
  const base=[...m.values()].sort((a,b)=>(b.ts||0)-(a.ts||0)).slice(0,mx),n=base.length;
  return base.map((a,i)=>({...a,_num:n-i,_st:status(a)})).reverse(); /* tamu #1 (paling lama) di paling atas */
}
const onCount=l=>l.filter(a=>a._st&&a._st.on).length;
const vk=a=>JSON.stringify([a.g,a.hs,a.pn,a.hd,a.hc,a.sc,a.sk,a.ah,a.gl,a.fc,a.ey,a.bj,a.cp,a.ac,a.ex,a.xc,a.xp]);

/* ---------- panggung & cahaya (dipakai foto kartu dan penampil 3D) ---------- */
const AY=.18; /* tinggi permukaan panggung */
function rig(sc){
  sc.add(new THREE.HemisphereLight(0xffffff,0x9cc4f0,.78));
  const k=new THREE.DirectionalLight(0xffffff,.62);k.position.set(2.5,5,4);sc.add(k);
  const rm=new THREE.DirectionalLight(0x9fd0ff,.45);rm.position.set(-4,3,-3);sc.add(rm)}
function pedestal(){
  const g=new THREE.Group(),mk=(geo,c,y)=>{const m=new THREE.Mesh(geo,mat(c));m.position.y=y;g.add(m);return m};
  mk(new THREE.CylinderGeometry(.98,1.02,.08,40),BLUE2,.04);mk(new THREE.CylinderGeometry(.84,.9,.1,40),CREAM,.13);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.86,.028,8,48),new THREE.MeshBasicMaterial({color:YEL}));ring.rotation.x=Math.PI/2;ring.position.y=.18;g.add(ring);g.userData.ring=ring;
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.36,20),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.2,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.186;g.add(sh);
  return g}

/* ---------- studio foto mini: render ava 3D -> gambar (1 renderer saja, di-cache) ---------- */
let PR=null;
function studio(){
  if(PR!==null)return PR;
  try{
    const r=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
    r.setPixelRatio(1);r.setClearColor(0x000000,0);
    const sc=new THREE.Scene();rig(sc);const ped=pedestal();sc.add(ped);
    PR={r,sc,ped,cam:new THREE.PerspectiveCamera(26,1,.1,60)};
  }catch(e){console.warn('[guestbook3d] studio gagal',e);PR=false}
  return PR;
}
function dispose(o){o.traverse(q=>{if(q.geometry)q.geometry.dispose();if(q.material)(Array.isArray(q.material)?q.material:[q.material]).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})})}
function shot(a,mode){
  const P=studio();if(!P)return '';
  const v={a,g:new THREE.Group()};
  try{build3(v)}catch(e){console.warn(e);return ''}
  const head=mode==='head',W=head?176:300,Hh=head?176:400;
  v.g.rotation.y=head?.38:.5;P.ped.visible=!head;v.g.position.y=head?0:AY;
  if(!head&&v.arms&&v.arms[1])v.arms[1].rotation.z=2.55;           // melambai
  P.sc.add(v.g);P.r.setSize(W,Hh,false);P.cam.aspect=W/Hh;
  if(head){P.cam.position.set(0,1.75,3.7);P.cam.lookAt(0,1.7,0)}
  else{P.cam.position.set(0,2.5,7.1);P.cam.lookAt(0,1.3,0)}
  P.cam.updateProjectionMatrix();P.r.render(P.sc,P.cam);
  let url='';try{url=P.r.domElement.toDataURL('image/png')}catch(e){}
  P.sc.remove(v.g);dispose(v.g);return url;
}
const IM=new Map();let schT=0;
function sched(){if(schT)return;schT=setTimeout(()=>{schT=0;drawAll()},40)}
function pic(a,mode){
  const k=mode+vk(a);let e=IM.get(k);
  if(!e){
    if(IM.size>70)IM.delete(IM.keys().next().value);
    e={url:shot(a,mode),img:null,ok:false};IM.set(k,e);
    if(e.url){const im=new Image();e.img=im;im.onload=()=>{e.ok=true;sched()};im.src=e.url}
  }
  return e;
}

/* ---------- model meja ---------- */
const G=new THREE.Group();
const IN_LOUNGE=GB.room===1&&typeof LG!=='undefined';
const _x=IN_LOUNGE?GB.lx:GB.x;
const _z=IN_LOUNGE?(GB.lz!=null?GB.lz:((typeof RBD!=='undefined'&&RBD[1]?RBD[1].z1:2)+.75)):GB.z;
G.position.set(_x,0,_z);(IN_LOUNGE?LG:S).add(G);

/* meja berkain + renda pinggir */
B(G,1.66,.04,.78,BLUE2,0,.02,0);
B(G,1.62,.76,.74,SKY,0,.38,0);
B(G,1.7,.06,.78,BLUE,0,.77,0);
B(G,1.78,.06,.86,CREAM,0,.83,0);
for(let i=0;i<9;i++)Sp(G,.075,CREAM,-.72+i*.18,.07,.385,1,.8,.7);
[-1,1].forEach(s=>[-.24,0,.24].forEach(z=>Sp(G,.07,CREAM,s*.82,.07,z,.7,.8,1)));
/* plakat depan */
const plC=mkCv(512,128),plT=mkTex(plC);
B(G,1.26,.34,.02,BLUE2,0,.42,.38);
const plM=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.3),new THREE.MeshBasicMaterial({map:plT}));plM.position.set(0,.42,.392);G.add(plM);

/* papan nama di belakang */
B(G,.045,.82,.045,BLUE2,-.6,TOP+.4,-.3);B(G,.045,.82,.045,BLUE2,.6,TOP+.4,-.3);
B(G,1.34,.5,.05,BLUE2,0,TOP+.9,-.3);
const sgC=mkCv(512,256),sgT=mkTex(sgC);
const sgM=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.36),new THREE.MeshBasicMaterial({map:sgT}));sgM.position.set(0,TOP+.9,-.272);G.add(sgM);

/* penyangga buku + buku terbuka */
const BK=new THREE.Group();BK.position.set(0,TOP+.03,.1);G.add(BK);
B(BK,1.04,.05,.36,BLUE2,0,0,.04);
const tilt=new THREE.Group();tilt.position.set(0,.04,.03);tilt.rotation.x=-.62;BK.add(tilt);
B(tilt,1.1,.76,.045,BLUE2,0,.38,0);                      // sampul
B(tilt,1.12,.07,.12,INK,0,.02,.07);                      // bibir penahan
B(tilt,.5,.66,.03,'#e9e2cf',-.27,.38,.027);B(tilt,.5,.66,.03,'#e9e2cf',.27,.38,.027); // tumpukan kertas
B(tilt,.5,.66,.03,'#fffdf3',-.27,.38,.04);B(tilt,.5,.66,.03,'#fffdf3',.27,.38,.04);
B(tilt,.035,.7,.06,YEL,0,.38,.03);                       // punggung emas
B(tilt,.05,.22,.008,RED,.03,.0,.07);                     // pita pembatas
const pgL=mkCv(512,512),pgR=mkCv(512,512),tL=mkTex(pgL),tR=mkTex(pgR);
[[tL,-.27],[tR,.27]].forEach(([t,x])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.47,.6),new THREE.MeshBasicMaterial({map:t}));m.position.set(x,.38,.0565);tilt.add(m)});

/* tempat pensil kawaii */
const cup=new THREE.Group();cup.position.set(-.7,TOP,-.02);G.add(cup);
Cy(cup,.09,.075,.18,YEL,0,.09,0);Cy(cup,.092,.092,.02,'#d9a42a',0,.18,0);
[-1,1].forEach(s=>{B(cup,.02,.034,.01,'#1f2a44',s*.034,.1,.083);Sp(cup,.016,'#f4a6c0',s*.062,.075,.072,1,.6,.4)});
B(cup,.035,.012,.01,'#1f2a44',0,.075,.085);
[['#e84a5f',.3,.12],['#4f8fe8',-.25,-.1],['#8fd18a',.05,.2]].forEach(([c,rz,rx],i)=>{
  const p=new THREE.Group();p.position.set(0,.17,0);p.rotation.z=rz;p.rotation.x=rx;cup.add(p);
  Cy(p,.011,.011,.3,c,0,.15,0);Sp(p,.032,i%2?'#ffffff':YEL,0,.32,0)});

/* bel */
const bellG=new THREE.Group();bellG.position.set(-.6,TOP,.27);G.add(bellG);
Cy(bellG,.13,.14,.03,'#c98b52',0,.015,0);
const dome=put(bellG,new THREE.SphereGeometry(.1,20,12,0,Math.PI*2,0,Math.PI/2),YEL,0,.03,0);dome.scale.y=.9;
Sp(bellG,.028,RED,0,.12,0);

/* bebek pesta */
const duck=new THREE.Group();duck.position.set(.68,TOP,.04);duck.rotation.y=-.25;G.add(duck);
const YD='#f7d94a';
Sp(duck,.16,YD,0,.15,0,1,.82,1.15);Sp(duck,.05,YD,0,.19,-.19,1,1,1.2);
[-1,1].forEach(s=>{Sp(duck,.06,'#f2c14e',s*.15,.16,0,.5,.8,1.1);B(duck,.026,.034,.014,'#1f2a44',s*.045,.35,.196);Sp(duck,.022,'#f4a6c0',s*.078,.31,.17,1,.7,.5)});
Sp(duck,.105,YD,0,.33,.1);B(duck,.075,.028,.06,'#f28c28',0,.31,.208);
const hat=put(duck,new THREE.ConeGeometry(.055,.14,12),RED,0,.47,.1);hat.rotation.z=.15;Sp(duck,.02,'#ffffff',-.01,.55,.1);

/* kilau bintang kecil */
const spk=['#f2c14e','#ffffff','#8fd0f0','#f4a6c0','#f2c14e'].map((c,i)=>{
  const m=new THREE.Mesh(new THREE.OctahedronGeometry(.045,0),new THREE.MeshBasicMaterial({color:c}));m.userData.p=i;G.add(m);return m});

/* ---------- gambar halaman, papan, plakat ---------- */
function drawPlaque(){
  const g=plC.getContext('2d');g.clearRect(0,0,512,128);g.fillStyle='#fffdf3';rr(g,6,6,500,116,18);g.fill();
  g.lineWidth=8;g.strokeStyle=BLUE;rr(g,6,6,500,116,18);g.stroke();
  g.fillStyle=INK;g.font='24px '+FPX;g.textAlign='center';g.textBaseline='middle';g.fillText(GB.plaque,256,66);
  star(g,52,64,15,YEL);star(g,460,64,15,YEL);plT.needsUpdate=true}
function drawSign(n,on){
  const g=sgC.getContext('2d');g.setTransform(1,0,0,256/154,0,0);g.clearRect(0,0,512,154);
  g.fillStyle='#fffdf3';rr(g,6,6,500,142,16);g.fill();g.lineWidth=8;g.strokeStyle=BLUE;rr(g,6,6,500,142,16);g.stroke();
  g.fillStyle=INK;g.font='34px '+FPX;g.textAlign='center';g.textBaseline='middle';g.fillText(GB.title,256,64);
  g.fillStyle=BLUE;g.font='34px '+FVT;
  g.fillText(!n?'tulis namamu di sini!':(presOK?n+' tamu · '+on+' online':n+' tamu sudah mampir'),256,114);
  star(g,44,64,15,YEL);star(g,468,64,15,YEL);sgT.needsUpdate=true}
const PW=320,PH=410,ROWBG=['#e3efff','#fdf0c8','#e6f3dc'],GRN='#2fa84f',GRY='#a9b6c9';
function badge(g,x,y,on){g.fillStyle=on?'#3ddc6b':GRY;g.beginPath();g.arc(x,y,9,0,Math.PI*2);g.fill();g.lineWidth=3;g.strokeStyle=INK;g.stroke()}
function drawPage(cv,t,idx,list,spr){
  const g=cv.getContext('2d'),per=GB.rows,on=onCount(list),base=spr*per*2;
  g.setTransform(512/PW,0,0,512/PH,0,0);g.clearRect(0,0,PW,PH);
  g.fillStyle='#fffdf3';g.fillRect(0,0,PW,PH);
  g.textBaseline='middle';g.textAlign='center';g.fillStyle=BLUE2;g.font='13px '+FPX;
  g.fillText(idx===0?GB.title:(presOK?on+' ONLINE':list.length+' TAMU'),PW/2,30);
  star(g,34,30,9,YEL);star(g,PW-34,30,9,YEL);
  g.fillStyle='#d6e3f5';g.fillRect(30,46,PW-60,3);
  if(!list.length&&idx===0){
    g.fillStyle=BLUE;g.font='34px '+FVT;['belum ada tamu','yang mampir...','','tap buku ini ya!'].forEach((s,i)=>g.fillText(s,PW/2,150+i*40))}
  const part=list.slice(base+idx*per,base+idx*per+per);
  for(let i=0;i<per;i++){
    const y=62+i*106,a=part[i];
    if(!a){if(list.length||idx){g.setLineDash([6,6]);g.lineWidth=3;g.strokeStyle='#d6e3f5';rr(g,14,y,PW-28,98,14);g.stroke();g.setLineDash([]);g.fillStyle='#c3d3ea';g.font='26px '+FVT;g.fillText('(kosong)',PW/2,y+49)}continue}
    const st=a._st;
    g.fillStyle=ROWBG[(idx*per+i)%3];rr(g,14,y,PW-28,98,14);g.fill();g.lineWidth=3;g.strokeStyle='#c5d8f2';rr(g,14,y,PW-28,98,14);g.stroke();
    const fx=26,fy=y+11,fs=76,tx=fx+fs+14;
    const gr=g.createLinearGradient(0,fy,0,fy+fs);gr.addColorStop(0,'#cfe6ff');gr.addColorStop(1,'#9cc4f0');g.fillStyle=gr;g.fillRect(fx,fy,fs,fs);
    const e=pic(a,'head');if(e.ok)g.drawImage(e.img,fx,fy,fs,fs);
    g.lineWidth=4;g.strokeStyle=INK;g.strokeRect(fx,fy,fs,fs);
    if(st)badge(g,fx+fs-3,fy+3,st.on);
    g.textAlign='left';g.fillStyle=INK;g.font='36px '+FVT;
    if(st){
      g.fillText(fit(g,a.n||'tamu',PW-28-76-40-34),tx,y+30);
      g.fillStyle='#6b8ab5';g.font='22px '+FVT;g.textAlign='right';g.fillText('#'+a._num,PW-24,y+30);g.textAlign='left';
      g.fillStyle=st.on?GRN:'#8794a8';g.font='28px '+FVT;g.fillText(st.on?'online':'offline',tx,y+60);
      const rt=roomTxt(st);if(rt){g.fillStyle='#6b8ab5';g.font='21px '+FVT;g.fillText(fit(g,'di '+rt,PW-28-76-40),tx,y+83)}
    }else{
      g.fillText(fit(g,a.n||'tamu',PW-28-76-40),tx,y+40);
      g.fillStyle='#6b8ab5';g.font='24px '+FVT;g.fillText('tamu #'+a._num,tx,y+72);
    }
    g.textAlign='center';
  }
  g.fillStyle='#9bb3d6';g.font='10px '+FPX;g.fillText(String(spr*2+idx+1),PW/2,PH-12);
  t.needsUpdate=true;
}
let spread=0;
const spreads=n=>Math.max(1,Math.ceil(n/(GB.rows*2)));
function drawAll(){const list=guests();if(spread>=spreads(list.length))spread=0;drawPage(pgL,tL,0,list,spread);drawPage(pgR,tR,1,list,spread);drawSign(list.length,onCount(list))}

/* ---------- suara kecil ---------- */
let AC=null;
function tone(f,d,type,v,delay,f2){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.resume)AC.resume();
  const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
  g.gain.setValueAtTime(v||.12,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.03)}catch(e){}}
let bellT=0,duckT=0,popT=0;
function ring(){bellT=.9;tone(1318,.9,'sine',.12);tone(1760,.7,'sine',.07,.02);if(typeof say3==='function')say3(bellG,'ting!')}
function squeak(){duckT=.5;tone(820,.14,'square',.05,0,520);tone(700,.12,'square',.05,.16,460);if(typeof say3==='function')say3(duck,'kwek!')}

/* ---------- jendela buku tamu (panggung 3D) ---------- */
const st=document.createElement('style');
st.textContent=`
#md:has(.gbw){max-width:580px;color:#fff;padding:18px 16px 22px;border:5px solid #f2c14e;box-shadow:0 0 0 4px var(--ink),0 22px 60px rgba(0,0,0,.5);
 background:radial-gradient(circle at 15% 0%,rgba(143,208,240,.28),transparent 46%),radial-gradient(circle at 92% 8%,rgba(242,193,78,.2),transparent 42%),radial-gradient(rgba(255,255,255,.35) 1px,transparent 1.7px) 0 0/44px 44px,linear-gradient(165deg,#2b4f86 0%,#1b3358 55%,#13233f 100%)}
.gbw{color:#fff}
.gb-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:2px 40px 6px 0}
.gb-ttl{font:15px/1.5 'Press Start 2P',monospace;color:#fff;text-shadow:3px 3px 0 #3b7dd8,-1px -1px 0 var(--ink)}
.gb-chips{display:flex;gap:6px;flex-wrap:wrap}
.gb-chip{font:19px VT323,monospace;padding:0 10px;border-radius:99px;background:rgba(255,255,255,.14);border:2px solid rgba(255,255,255,.3);color:#e6f1ff}
.gb-chip.on{color:#9bf0b3;border-color:rgba(155,240,179,.5);background:rgba(61,220,107,.14)}
.gb-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px 14px;margin-top:12px;perspective:1000px}
.gb-card{position:relative;padding-top:24%;cursor:pointer;transform-style:preserve-3d;transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .5s cubic-bezier(.2,.8,.2,1);will-change:transform;-webkit-tap-highlight-color:transparent}
.gb-card.hv{transition:transform .08s linear}
.gb-face{position:relative;border-radius:16px;padding:8px 8px 12px;transform-style:preserve-3d;background:linear-gradient(180deg,rgba(255,255,255,.2),rgba(255,255,255,.06));border:2px solid rgba(255,255,255,.3);box-shadow:0 14px 26px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.4)}
.gb-face::after{content:'';position:absolute;inset:0;border-radius:14px;pointer-events:none;background:radial-gradient(circle at var(--mx,50%) var(--my,20%),rgba(255,255,255,.3),transparent 55%);opacity:var(--gl,0);transition:opacity .25s;transform:translateZ(70px)}
.gb-stage{position:relative;aspect-ratio:1/1.02;border-radius:11px;background:radial-gradient(ellipse 72% 40% at 50% 90%,rgba(255,236,170,.6),transparent 72%),linear-gradient(#69a0e6,#3a67a6 68%,#2a4f86);box-shadow:inset 0 0 0 2px rgba(255,255,255,.26),inset 0 -22px 34px rgba(0,0,0,.2);transform:translateZ(6px)}
.gb-stage img{position:absolute;left:50%;bottom:-5%;width:98%;transform:translateX(-50%) translateZ(56px);filter:drop-shadow(0 10px 8px rgba(0,0,0,.4));pointer-events:none;transition:transform .25s}
.gb-card:hover .gb-stage img{transform:translateX(-50%) translateZ(80px) scale(1.04)}
.gb-ld{position:absolute;inset:0;display:grid;place-items:center;font:22px VT323,monospace;opacity:.7}
.gb-num{position:absolute;left:-7px;top:-9px;z-index:2;background:#f2c14e;color:var(--ink);border:3px solid var(--ink);box-shadow:2px 2px 0 var(--ink);font:9px 'Press Start 2P',monospace;padding:5px 6px;transform:translateZ(90px) rotate(-5deg)}
.gb-me{position:absolute;right:-7px;top:-9px;z-index:2;background:#e84a5f;color:#fff;border:3px solid var(--ink);box-shadow:2px 2px 0 var(--ink);font:7px 'Press Start 2P',monospace;padding:5px 6px;transform:translateZ(90px) rotate(6deg)}
.gb-plate{margin-top:11px;text-align:center;transform:translateZ(26px)}
.gb-nm{font:10px/1.6 'Press Start 2P',monospace;color:#fff;text-shadow:2px 2px 0 rgba(0,0,0,.5);word-break:break-all}
.gb-pill{display:inline-flex;align-items:center;gap:6px;margin-top:7px;padding:0 10px 0 8px;border-radius:99px;font:20px VT323,monospace;background:rgba(0,0,0,.3);border:2px solid rgba(255,255,255,.25)}
.gb-pill::before{content:'';width:9px;height:9px;border-radius:50%;background:#7d8aa0}
.gb-pill.on{color:#9bf0b3}.gb-pill.on::before{background:#3ddc6b;box-shadow:0 0 8px #3ddc6b;animation:gbblink 1.6s infinite}.gb-pill.off{color:#a9b6c9}
@keyframes gbblink{50%{opacity:.45}}
.gb-rm{font:19px VT323,monospace;color:#cfe3ff;opacity:.8;margin-top:3px}
.gb-empty{text-align:center;font:25px/1.25 VT323,monospace;padding:34px 10px;margin-top:14px;border:3px dashed rgba(255,255,255,.35);border-radius:14px;background:rgba(255,255,255,.07)}
.gb-vstage{position:relative;height:min(54vh,430px);margin-top:12px;border-radius:16px;overflow:hidden;border:3px solid rgba(255,255,255,.32);background:radial-gradient(ellipse 62% 36% at 50% 90%,rgba(255,236,170,.55),transparent 72%),linear-gradient(#69a0e6,#3a67a6 66%,#2a4f86);box-shadow:inset 0 0 50px rgba(0,0,0,.28),0 14px 30px rgba(0,0,0,.45)}
.gb-vstage canvas{width:100%;height:100%;display:block;cursor:grab;touch-action:none}
.gb-nav{position:absolute;top:50%;margin-top:-26px;width:38px;height:52px;border:3px solid var(--ink);background:#f2c14e;color:var(--ink);font:34px/1 VT323,monospace;cursor:pointer;box-shadow:3px 3px 0 var(--ink);padding:0 0 4px}
.gb-nav:active{transform:translate(2px,2px)}.gb-nav.l{left:8px}.gb-nav.r{right:8px}
.gb-hint{position:absolute;left:0;right:0;bottom:8px;text-align:center;font:18px VT323,monospace;opacity:.75;pointer-events:none;text-shadow:1px 1px 0 rgba(0,0,0,.5)}
.gb-vinfo{text-align:center;margin-top:12px}
.gb-vnm{font:14px/1.6 'Press Start 2P',monospace;text-shadow:3px 3px 0 #3b7dd8;word-break:break-all}
.gb-vrow{display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;margin-top:8px}
.gb-vrow .gb-pill{margin-top:0}
.gb-say{position:absolute;left:50%;top:14%;transform:translateX(-50%);z-index:3;background:#fff;color:var(--ink);border:3px solid var(--ink);padding:3px 10px;font:22px/1.1 VT323,monospace;max-width:86%;text-align:center;pointer-events:none;box-shadow:3px 3px 0 var(--ink);animation:gbpop .25s ease-out}
@keyframes gbpop{from{transform:translateX(-50%) scale(.6);opacity:0}}`;
document.head.appendChild(st);

const $gb=id=>document.getElementById(id);
const chipsHTML=l=>`<span class="gb-chip">${l.length} tamu</span>${presOK?`<span class="gb-chip on">${onCount(l)} online</span>`:''}`;
const headHTML=l=>`<div class="gb-hd"><div class="gb-ttl">buku tamu</div><div class="gb-chips" id="gbchips">${chipsHTML(l)}</div></div>`;
const pillHTML=s=>s?`<div class="gb-pill ${s.on?'on':'off'}">${s.on?'online':'offline'}</div>`:'';
const roomHTML=s=>roomTxt(s)?`<div class="gb-rm">di ${H(roomTxt(s))}</div>`:'';
let curId=null,VW=null;
const stopV=()=>{if(VW){VW.stop();VW=null}};

/* penampil 3D hidup: ava berdiri di panggung, bisa diputar, melambai, lompat saat di-tap */
function viewer(cv,a0){
  let r;try{r=new THREE.WebGLRenderer({canvas:cv,antialias:true,alpha:true})}catch(e){return null}
  const box=cv.parentNode,W=box.clientWidth||320,Hh=box.clientHeight||400;
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.setSize(W,Hh,false);r.setClearColor(0x000000,0);
  const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(28,W/Hh,.1,60);cam.position.set(0,2.4,7.6);cam.lookAt(0,1.25,0);
  rig(sc);const ped=pedestal();sc.add(ped);
  const sk=['#f2c14e','#ffffff','#8fd0f0','#f4a6c0','#f2c14e','#ffffff'].map((c,i)=>{const m=new THREE.Mesh(new THREE.OctahedronGeometry(.06,0),new THREE.MeshBasicMaterial({color:c}));sc.add(m);return m});
  const v={a:a0,g:new THREE.Group()};sc.add(v.g);
  let yaw=.45,drag=false,lx=0,mv=0,idle=0,run=true,raf=0,wave=2.4,jump=0,tm=0,lt=performance.now();
  const api={k:vk(a0),set(a){v.a=a;build3(v);v.g.position.y=AY;wave=1.8;api.k=vk(a)},stop(){run=false;cancelAnimationFrame(raf);try{dispose(sc);r.dispose();r.forceContextLoss()}catch(e){}}};
  api.set(a0);
  const greet=()=>{
    jump=.6;wave=2.2;
    const pool=typeof GREET!=='undefined'&&GREET.length?GREET:['halo!','hai hai!','selamat ulang tahun!'];
    box.querySelectorAll('.gb-say').forEach(x=>x.remove());
    const s=document.createElement('div');s.className='gb-say';s.textContent=pool[Math.random()*pool.length|0];box.appendChild(s);setTimeout(()=>s.remove(),2800)};
  cv.onpointerdown=e=>{drag=true;lx=e.clientX;mv=0;idle=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}cv.style.cursor='grabbing'};
  cv.onpointermove=e=>{if(drag){const d=e.clientX-lx;mv+=Math.abs(d);yaw+=d*.012;lx=e.clientX;idle=0}};
  cv.onpointerup=cv.onpointercancel=()=>{if(drag&&mv<6)greet();drag=false;cv.style.cursor='grab'};
  (function loop(now){
    if(!run)return;if(!cv.isConnected){api.stop();return}
    raf=requestAnimationFrame(loop);
    const dt=Math.min(.05,(now-lt)/1000||0);lt=now;tm+=dt;
    if(!drag){idle+=dt;if(idle>1.6)yaw+=dt*.7}
    v.g.rotation.y=yaw;ped.userData.ring.rotation.z+=dt*.6;
    let y=AY+Math.abs(Math.sin(tm*2))*.012;
    if(jump>0){jump-=dt;y+=Math.sin((1-Math.max(0,jump)/.6)*Math.PI)*.38}
    v.g.position.y=y;
    if(v.arms&&v.arms[1]){if(wave>0){wave-=dt;v.arms[1].rotation.z=2.3+Math.sin(now/95)*.38}else v.arms[1].rotation.z=Math.sin(tm*1.8)*.04}
    sk.forEach((m,i)=>{const a=tm*.8+i*1.05;m.position.set(Math.cos(a)*1.25,.5+((i*.37+tm*.25)%1)*2.2,Math.sin(a)*.9);m.rotation.y=tm*2+i;m.scale.setScalar(.7+Math.sin(tm*3+i)*.3)});
    r.render(sc,cam)})(lt);
  return api;
}

/* ---- tampilan daftar (kartu 3D miring) ---- */
function fillGrid(list){
  const el=$gb('gbgrid');if(!el)return;
  const meId=typeof did!=='undefined'?did:null;
  el.innerHTML=list.map((a,i)=>`<div class="gb-card" data-id="${H(a.id)}"><div class="gb-face">${a.id===meId?'<span class="gb-me">kamu</span>':''}<span class="gb-num">#${a._num}</span><div class="gb-stage" data-i="${i}"><span class="gb-ld">...</span></div><div class="gb-plate"><div class="gb-nm">${H(a.n||'tamu')}</div>${pillHTML(a._st)}${roomHTML(a._st)}</div></div></div>`).join('');
  const boxes=[...el.querySelectorAll('.gb-stage')];let i=0;
  (function step(){
    if(!document.body.contains(el)||i>=boxes.length)return;
    const a=list[i],e=pic(a,'full');
    boxes[i].innerHTML=e.url?`<img src="${e.url}" alt="${H(a.n||'tamu')}">`:'<span class="gb-ld">?</span>';
    i++;setTimeout(step,0)})();
  el.onclick=ev=>{const c=ev.target.closest('.gb-card');if(c)showDetail(c.dataset.id)};
  el.onpointermove=ev=>{
    if(ev.pointerType==='touch')return;
    const c=ev.target.closest('.gb-card');
    el.querySelectorAll('.gb-card.hv').forEach(x=>{if(x!==c){x.classList.remove('hv');x.style.setProperty('--rx','0deg');x.style.setProperty('--ry','0deg');x.style.setProperty('--gl','0')}});
    if(!c)return;const b=c.getBoundingClientRect(),px=(ev.clientX-b.left)/b.width,py=(ev.clientY-b.top)/b.height;
    c.classList.add('hv');c.style.setProperty('--ry',((px-.5)*16).toFixed(1)+'deg');c.style.setProperty('--rx',((.5-py)*12).toFixed(1)+'deg');
    c.style.setProperty('--mx',(px*100).toFixed(0)+'%');c.style.setProperty('--my',(py*100).toFixed(0)+'%');c.style.setProperty('--gl','1')};
  el.onpointerleave=()=>el.querySelectorAll('.gb-card.hv').forEach(x=>{x.classList.remove('hv');x.style.setProperty('--rx','0deg');x.style.setProperty('--ry','0deg');x.style.setProperty('--gl','0')});
}
function addRow(){
  const row=$gb('gbrow');
  if(row&&typeof vb!=='undefined'){
    const b=document.createElement('button');b.className='btn alt';
    b.textContent=(typeof own!=='undefined'&&own)?'edit avaku':'+ bikin ava & masuk buku';
    b.onclick=()=>vb.click();row.appendChild(b)}
}
function showList(){
  const w=$gb('gbw');if(!w)return;stopV();curId=null;
  const list=guests();
  w.innerHTML=headHTML(list)+(list.length?'<div class="gb-grid" id="gbgrid"></div>':'<div class="gb-empty">bukunya masih kosong.<br>jadi tamu pertama yuk!</div>')+'<div class="row" id="gbrow"></div>';
  if(list.length)fillGrid(list);addRow();
}

/* ---- tampilan detail (penampil 3D hidup) ---- */
function infoHTML(a){return `<div class="gb-vnm">${H(a.n||'tamu')}</div><div class="gb-vrow"><span class="gb-chip">tamu #${a._num}</span>${pillHTML(a._st)}</div>${roomHTML(a._st)}`}
function showDetail(id){
  const w=$gb('gbw');if(!w)return;
  const list=guests(),i=list.findIndex(a=>a.id===id);if(i<0)return showList();
  stopV();curId=id;const a=list[i],n=list.length;
  w.innerHTML=headHTML(list)+`<div class="gb-vstage" id="gbv"><canvas id="gbcv"></canvas>${n>1?'<button class="gb-nav l" id="gbp" aria-label="sebelumnya">&lsaquo;</button><button class="gb-nav r" id="gbn" aria-label="berikutnya">&rsaquo;</button>':''}<div class="gb-hint">seret untuk memutar · tap untuk menyapa</div></div><div class="gb-vinfo" id="gbinfo">${infoHTML(a)}</div><div class="row" style="justify-content:center"><button class="btn alt" id="gbback">&lsaquo; semua tamu</button></div>`;
  VW=viewer($gb('gbcv'),a);
  const go=d=>{const L=guests();const k=L.findIndex(x=>x.id===curId);if(k<0)return showList();showDetail(L[(k+d+L.length)%L.length].id)};
  if($gb('gbp'))$gb('gbp').onclick=()=>go(-1);if($gb('gbn'))$gb('gbn').onclick=()=>go(1);
  $gb('gbback').onclick=showList;
}
function refreshOpen(){
  if(!$gb('gbw'))return;
  if(!curId){showList();return}
  const list=guests(),a=list.find(x=>x.id===curId);
  if(!a){showList();return}
  const c=$gb('gbchips'),f=$gb('gbinfo');if(c)c.innerHTML=chipsHTML(list);if(f)f.innerHTML=infoHTML(a);
  if(VW&&VW.k!==vk(a))VW.set(a);
}
function openBook(){openM('<div class="gbw" id="gbw"></div>');showList()}

/* ---------- klik ---------- */
const reg=(o,fn)=>{if(typeof lact==='function')lact(o,fn);else{o.userData.fn=fn;if(typeof lh!=='undefined')lh.push(o)}};
const reg2=IN_LOUNGE?reg:(o,fn)=>{if(typeof act==='function')act(o,fn);else{o.userData.fn=fn;if(typeof hits!=='undefined')hits.push(o)}};
reg2(G,openBook);reg2(bellG,ring);reg2(duck,squeak);

/* ---------- animasi + sinkron data ---------- */
let sig='',lastN=0;const born=performance.now(),duckY=TOP;
function poll(){
  const list=guests(),s=(presOK?'P':'p')+list.map(a=>a.id+vk(a)+a.n+(a._st?(a._st.on?'1'+a._st.r:'0'):'-')).join('|');
  if(s===sig)return;sig=s;
  if(performance.now()-born>8000&&list.length>lastN){popT=.6;if(typeof say3==='function'&&G.visible)say3(duck,'tamu baru!')}
  lastN=list.length;drawAll();
  refreshOpen();
}
let lt=performance.now(),pollT=0,spT=0;
(function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.1,(now-lt)/1000||0);lt=now;
  if(!G.visible||(IN_LOUNGE&&!LG.visible))return;
  const t=now/1000;
  pollT-=dt;if(pollT<=0){pollT=1.5;poll()}
  spT+=dt;if(spT>7){spT=0;const k=spreads(lastN);if(k>1){spread=(spread+1)%k;popT=.35;drawAll()}}
  /* bebek */
  let y=duckY+Math.abs(Math.sin(t*2.2))*.012,ry=-.25;
  if(duckT>0){duckT-=dt;const u=1-Math.max(0,duckT)/.5;y+=Math.sin(u*Math.PI)*.22;ry+=u*Math.PI*2}
  duck.position.y=y;duck.rotation.y=ry;duck.rotation.z=Math.sin(t*1.6)*.04;
  /* bel */
  if(bellT>0){bellT-=dt;bellG.rotation.z=Math.sin(bellT*38)*.2*Math.max(0,bellT)}else bellG.rotation.z=0;
  /* buku "pop" saat ada tamu baru */
  if(popT>0){popT-=dt;BK.scale.setScalar(1+Math.sin(Math.max(0,popT)/.6*Math.PI)*.12)}else BK.scale.setScalar(1);
  /* kilau */
  spk.forEach((m,i)=>{const a=t*.7+i*1.26;m.position.set(Math.cos(a)*.78,TOP+.78+Math.sin(t*1.5+i*2)*.07+(i%2)*.14,.12+Math.sin(a)*.3);m.rotation.y=t*2+i;m.scale.setScalar(.75+Math.sin(t*3+i)*.25)});
})(lt);

/* ---------- mulai ---------- */
drawPlaque();drawAll();startPres(0);
if(document.fonts&&document.fonts.load){
  Promise.all([document.fonts.load("14px 'Press Start 2P'"),document.fonts.load("24px 'VT323'")]).then(()=>{drawPlaque();drawAll()}).catch(()=>{})}
window.guestbook3d={open:openBook,refresh:drawAll,cfg:GB};
})();