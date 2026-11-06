/* booth3d.js v3 — PHOTO BOOTH (v3: tiap foto bisa beda latar, pose [17], zoom, sudut kamera [6], filter [7]; ekspresi bisa ikut pose atau bawaan ava)
   --- catatan versi 2 di bawah ---
   booth3d.js v2 — PHOTO BOOTH yang bisa dimasuki + foto bareng ava (HANYA versi 3D / index.html)
   Muat PALING AKHIR (setelah interact3d.js & live3d.js; urutan dengan perpus3d.js bebas):
     <script src="js/3d/booth3d.js?v=2"></script>        <- ganti ?v=1 jadi ?v=2 supaya browser ambil file baru
   TIDAK ada file lain yang diubah.

   Cara kerja:
   - Tap booth -> ava-mu masuk, tirai menutup, muncul layar pilih peserta (maks 4, yang online ditandai hijau).
   - Layar atur foto: pilih LATAR (7 tema), lalu untuk tiap foto 1-4 pilih POSE (8 pose) dan ZOOM (penuh / setengah badan / wajah). Ada tombol "acak".
   - 4x jepret (tulisan "PHOTO BOOTH" di latar foto sudah dihapus).
   - Layar hasil: ganti BENTUK (strip 4 / grid 2x2 / polaroid), KERTAS (7 warna + motif), TULISAN di bawah (bisa diketik + 3 gaya huruf) tanpa foto ulang.
   - EDIT STIKER: stiker 3D (dirender dari model three.js, ada bayangan), tap lalu geser untuk atur posisi, 3 ukuran, undo.
   - "pakai kamera asli" = photo booth webcam lama (tidak diubah).
   Uji cepat: buka Console lalu ketik  BOOTH3D.enter() */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof bo==='undefined'||typeof act==='undefined'||typeof V==='undefined'||typeof did==='undefined'||
   typeof build3!=='function'||typeof snap!=='function'||typeof openM!=='function'||typeof ov==='undefined'||typeof edit!=='function'||typeof EXTRA==='undefined'||typeof say3!=='function'){
 console.warn('booth3d.js: butuh index.html (bo, build3, snap, openM, edit) — muat file ini PALING AKHIR');return}

/* ===== EDIT ===== */
const MAXP=4;                 /* maks ava di satu foto */
const FRONT={x:-5,z:3.4};     /* titik berdiri ava di depan booth (ruang utama) */
const origBooth=typeof booth==='function'?booth:null;   /* booth webcam lama */
const wt=ms=>new Promise(r=>setTimeout(r,ms));
const NV='#1f3a5f',BL='#3b7dd8',BD='#1f4a9c',YL='#f2c14e',RD='#e84a5f',WH='#f3f8ff',GD='#d9b24c';
const ST={busy:false,inside:false,walk:null,v:null,sel:[],crew:[],R:null,set:null,raf:0,pose:0,bt:0,cur:.32,made:false,shooting:false,
 plan:[{p:0,z:0,t:0,a:0,f:0},{p:2,z:0,t:4,a:1,f:3},{p:3,z:1,t:1,a:3,f:0},{p:1,z:2,t:3,a:0,f:6}],ex:0,slot:0,theme:0,shots:[],layout:'strip',paper:0,pick:0,cap:null,font:0,stk:[],size:1,spr:null,ui:null,url:''};

/* ---------- tekstur kanvas ---------- */
function cvT(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true});return t}
const disposeObj=o=>o.traverse(q=>{if(q.geometry)q.geometry.dispose();if(q.material){[].concat(q.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}});

/* ======================================================================
   1) MODEL BOOTH (menggantikan kotak biru lama). Koordinat lokal: depan = +z (grup sudah diputar menghadap ruangan)
   ====================================================================== */
while(bo.children.length){const o=bo.children[0];bo.remove(o);disposeObj(o)}
const B=(w,h,d,c,x,y,z)=>bx(w,h,d,c,x,y,z,bo);
B(1.62,.12,1.32,NV,0,.06,0);                                         /* alas */
[-1,1].forEach(s=>{B(.12,2.4,1.2,BL,s*.75,1.32,0);B(.13,.08,1.2,YL,s*.75,1.0,0);B(.13,.08,1.2,RD,s*.75,2.2,0)});
B(1.4,2.4,.1,BD,0,1.32,-.55);                                         /* dinding belakang */
B(1.62,.5,.14,BL,0,2.35,.58);B(1.64,.06,.16,YL,0,2.1,.58);            /* kusen atas depan */
B(1.8,.12,1.5,NV,0,2.64,.02);B(1.9,.06,1.6,YL,0,2.72,.02);            /* atap */
[-.6,.6].forEach(x=>B(.08,.3,.08,NV,x,2.85,.05));
B(1.58,.5,.1,YL,0,3.0,.06);B(1.5,.42,.12,NV,0,3.0,.1);                /* papan nama */
{const sg=new THREE.Mesh(new THREE.PlaneGeometry(1.4,.35),new THREE.MeshBasicMaterial({map:cvT(360,90,(g,W,H)=>{g.fillStyle=NV;g.fillRect(0,0,W,H);g.strokeStyle=YL;g.lineWidth=5;g.strokeRect(4,4,W-8,H-8);
 g.fillStyle='#fff6c8';g.font='24px "Press Start 2P",monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('PHOTO BOOTH',W/2,H/2+2)})}));sg.position.set(0,3.0,.17);bo.add(sg)}
const bulbs=[];for(let i=0;i<7;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),new THREE.MeshBasicMaterial({color:'#ffd25a'}));m.position.set(-.66+i*.22,2.36,.66);bo.add(m);bulbs.push(m)}
B(1.1,.1,.5,'#8a5a1f',0,.5,-.2);B(.1,.4,.4,'#6a3f12',-.4,.25,-.2);B(.1,.4,.4,'#6a3f12',.4,.25,-.2);   /* bangku di dalam */
B(.5,.36,.06,NV,0,1.45,-.48);cy(.15,.15,.04,WH,0,1.45,-.45,bo).rotation.x=Math.PI/2;cy(.1,.1,.08,'#333',0,1.45,-.43,bo).rotation.x=Math.PI/2;
B(1.3,.03,.8,'#2e527f',0,.015,.95);B(1.1,.035,.6,'#c8453f',0,.02,.95);                                      /* keset */
B(.04,.34,.26,NV,.81,1.35,.1);[['#f4a6c0',0],['#8fd0f0',.075],['#f2c14e',.15]].forEach(([c,o])=>{B(.02,.26,.065,WH,.835,1.35,-.02+o);B(.022,.2,.045,c,.838,1.35,-.02+o)});   /* tray strip */
const curs=[-1,1].map(s=>{const g=new THREE.Group();g.position.set(s*.7,0,.56);bo.add(g);
 bx(1,1.95,.06,RD,-s*.5,1.12,0,g);[.2,.5,.8].forEach(x=>bx(.05,1.95,.065,'#b0293f',-s*x,1.12,0,g));g.scale.x=.32;return g});
cy(.025,.025,1.5,GD,0,2.08,.56,bo).rotation.z=Math.PI/2;
bo._i3=1;   /* interact3d.js: jangan dibungkus (jalan masuk diatur di sini) */

/* ======================================================================
   2) MASUK / KELUAR BOOTH
   ====================================================================== */
const me=()=>V.get(did);
function clr(v){v.mode=null;v.goal=null;v.path=null;v.xfer=null;v.seat=null;v.f=2;const R=v.R;if(R){R.wp=[];R.act=null;R.dance=false;R.poi=-1;R.hold=0;R.wait=.2}try{paintV(v)}catch(e){}}
function enter(){
 if(ST.busy)return;ST.busy=true;ST.made=false;
 const v=me();
 if(v&&window.R3&&v.room===0){
  try{const sat=v.mode==='sit';clr(v);if(sat)R3.eject(v.room,v);R3.ensure(v);
   if(R3.goTo(v,FRONT.x,FRONT.z,{f:[-1,0],w:[.5,.5]})){ST.walk={v,t:0};return}}catch(e){console.warn('booth3d',e)}}
 goIn(v&&v.room===0?v:null)}
function goIn(v){
 ST.inside=true;ST.v=v||null;ST.sel=V.has(did)?[did]:[];
 if(v){v.g.visible=v.tg.visible=false;if(v.R){v.R.wp=[];v.R.act=null;v.R.wait=600}}
 setTimeout(()=>{if(ST.inside)picker()},850)}
function leave(){
 if(!ST.inside&&!ST.busy)return;
 ST.inside=false;ST.walk=null;stopSet();
 const v=ST.v;ST.v=null;
 if(v&&v.g){v.g.visible=v.tg.visible=v.room?true:(typeof curRoom==='undefined'||curRoom===0);if(v.R){v.R.wp=[];v.R.act=null;v.R.wait=.6}if(ST.made)say3(v.tg,'lucu banget fotonya~')}
 ST.busy=false;ST.made=false}
try{new MutationObserver(()=>{if(ST.inside&&!ov.classList.contains('on'))leave()}).observe(ov,{attributes:true,attributeFilter:['class']})}catch(e){}
bo.userData.fn=enter;

/* animasi booth di ruang utama: bohlam kedip, tirai membuka/menutup, tunggu ava sampai di depan */
function step(dt){
 ST.bt+=dt;const rate=ST.inside?7:2.2,k=Math.floor(ST.bt*rate);
 bulbs.forEach((b,i)=>b.material.color.set((k+i)%2?'#ffd25a':'#7a5a1c'));
 const tg=ST.inside?.74:.32;ST.cur+=(tg-ST.cur)*Math.min(1,dt*6);curs.forEach(c=>{c.scale.x=ST.cur});
 if(ST.walk){const w=ST.walk;w.t+=dt;const v=w.v;if(!v||!v.R||!v.R.wp||!v.R.wp.length||w.t>8){ST.walk=null;goIn(v)}}}
{const _w=winFx;winFx=function(dt){_w(dt);try{step(dt)}catch(e){console.warn('booth3d',e)}}}

/* ======================================================================
   3) LAYAR PILIH PESERTA
   ====================================================================== */
const cs=document.createElement('style');cs.textContent='.bt-g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-height:44vh;overflow:auto;padding:2px}.bt-c{border:3px solid var(--ink);background:#fff;padding:3px;cursor:pointer;display:flex;flex-direction:column;align-items:center;font:16px/1 VT323,monospace;color:var(--ink);position:relative}'+
 '.bt-c img{width:100%;aspect-ratio:1;display:block;background:#e3efff}.bt-c span{padding:3px 0 1px;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.bt-c.on{outline:4px solid #f2c14e;outline-offset:1px;background:#fff6d6}'+
 '.bt-c i{position:absolute;top:4px;right:4px;width:10px;height:10px;border-radius:50%;background:#2fa84f;border:2px solid var(--ink)}.bt-c i.off{background:#b8b0a8}.bt-c b{position:absolute;top:2px;left:4px;font:9px "Press Start 2P",monospace;color:#e84a5f;text-shadow:1px 1px 0 #fff}';
document.head.appendChild(cs);
const onl=()=>{try{return window.LIVE3D?window.LIVE3D.online():new Set()}catch(e){return new Set()}};
function people(){const on=onl(),out=[];V.forEach((v,id)=>{if(v&&v.a)out.push({id,a:v.a,on:on.has(id)||id===did})});
 out.sort((p,q)=>((q.id===did)-(p.id===did))||(q.on-p.on)||String(p.a.n).localeCompare(String(q.a.n)));return out}
const BLANK='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const th=a=>{try{return snap(a,'head')||BLANK}catch(e){return BLANK}};
function picker(){
 stopLoop();ST.shooting=false;
 const list=people(),LV=!!window.LIVE3D;ST.sel=ST.sel.filter(id=>list.some(p=>p.id===id));
 openM(`<h2>photo booth</h2>${list.length?`<p style="font-size:20px;margin-bottom:8px">pilih yang mau foto bareng (maks ${MAXP}).${LV?' yang online ditandai hijau.':''}</p><div class="bt-g">${list.map(p=>`<button class="bt-c" data-id="${esc(p.id)}"><b></b>${LV?`<i class="${p.on?'':'off'}"></i>`:''}<img alt="" src="${th(p.a)}"><span>${esc(p.a.n||'tamu')}${p.id===did?' (aku)':''}</span></button>`).join('')}</div>`+
  `<div class="row"><button class="btn alt" id="btol">semua online</button><button class="btn alt" id="btme">cuma aku</button><button class="btn alt" id="btno">kosongkan</button></div>`:
  '<p style="font-size:22px">belum ada ava. bikin ava dulu lewat tombol di bawah, atau pakai kamera asli.</p>'}<p id="btmsg" style="font-size:20px;margin:6px 0"></p>`+
  `<div class="row">${list.length?'<button class="btn" id="btgo">masuk booth</button>':''}${origBooth?'<button class="btn alt" id="btcam">pakai kamera asli</button>':''}</div>`);
 const chips=[...mb.querySelectorAll('.bt-c')],msg=$('#btmsg');
 const refresh=()=>{chips.forEach(c=>{const k=ST.sel.indexOf(c.dataset.id);c.classList.toggle('on',k>=0);c.querySelector('b').textContent=k>=0?String(k+1):''});
  if(msg)msg.textContent='dipilih: '+ST.sel.length+'/'+MAXP;const go=$('#btgo');if(go)go.disabled=!ST.sel.length};
 chips.forEach(c=>c.onclick=()=>{const id=c.dataset.id,k=ST.sel.indexOf(id);if(k>=0)ST.sel.splice(k,1);else if(ST.sel.length<MAXP)ST.sel.push(id);else{if(msg)msg.textContent='maksimal '+MAXP+' orang di booth';return}refresh()});
 const q=id=>{const e=$(id);return e};
 if(q('#btol'))q('#btol').onclick=()=>{const ids=list.filter(p=>p.on).map(p=>p.id);if(V.has(did)&&!ids.includes(did))ids.unshift(did);ST.sel=ids.slice(0,MAXP);refresh()};
 if(q('#btme'))q('#btme').onclick=()=>{ST.sel=V.has(did)?[did]:[];refresh()};
 if(q('#btno'))q('#btno').onclick=()=>{ST.sel=[];refresh()};
 if(q('#btgo'))q('#btgo').onclick=stage;
 if(q('#btcam'))q('#btcam').onclick=()=>{try{origBooth()}catch(e){console.warn(e)}};
 refresh()}


/* ---------- gaya UI baru (chip, palet stiker, bar tombol) ---------- */
{const cs2=document.createElement('style');cs2.textContent='.bt-l{font:9px "Press Start 2P",monospace;margin:12px 0 6px;opacity:.75}.bt-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}'+
 '.bt-ch{border:3px solid var(--ink);background:#fff;color:var(--ink);padding:3px 9px;font:19px/1 VT323,monospace;cursor:pointer;box-shadow:2px 2px 0 var(--ink)}.bt-ch:active{transform:translate(2px,2px);box-shadow:none}.bt-ch.on{outline:4px solid #f2c14e;outline-offset:1px}.bt-ch img{display:block;width:54px;height:43px}'+
 '.bt-sp{display:flex;flex-wrap:wrap;gap:6px}.bt-sk{width:42px;height:42px;padding:2px;border:3px solid var(--ink);background:#fff;cursor:pointer;font:14px "Press Start 2P",monospace;color:var(--ink);box-shadow:2px 2px 0 var(--ink)}.bt-sk img{width:100%;height:100%;display:block;object-fit:contain}.bt-sk.on{outline:4px solid #f2c14e;outline-offset:1px;background:#fff6d6}'+
 '.bt-bar{position:sticky;bottom:-18px;background:var(--cream);padding:8px 0 4px;margin-top:8px;z-index:2}.bt-bar .row{margin-top:0}';document.head.appendChild(cs2)}

/* ======================================================================
   4) TEMA LATAR, POSE, KERTAS, FONT
   ====================================================================== */
const rnd0=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();
const THEMES=[
 {n:'biru',bg:'#9cc4f0',cur:['#e84a5f','#b0293f'],
  wall:{rep:[7,3],fn:g=>{g.fillStyle='#86b3e6';g.fillRect(0,0,64,64);g.fillStyle='#9cc4f0';for(let x=0;x<64;x+=16)g.fillRect(x,0,8,64);g.fillStyle='#f2c14e';for(let x=4;x<64;x+=16)for(let y=8;y<64;y+=16)g.fillRect(x,y,2,2)}},
  floor:{fn:g=>{g.fillStyle='#2e527f';g.fillRect(0,0,64,64);g.fillStyle='#3b7dd8';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)}}},
 {n:'pink',bg:'#f6b8cf',cur:['#b0457a','#8d2f5e'],
  wall:{rep:[7,3],fn:g=>{g.fillStyle='#f6b8cf';g.fillRect(0,0,64,64);g.fillStyle='#f9cadb';for(let x=0;x<64;x+=16)g.fillRect(x,0,8,64);g.fillStyle='#ffffff';for(let x=4;x<64;x+=16)for(let y=8;y<64;y+=16)g.fillRect(x,y,2,2)}},
  floor:{fn:g=>{g.fillStyle='#9a4f74';g.fillRect(0,0,64,64);g.fillStyle='#e58bb0';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)}}},
 {n:'langit',bg:'#8ec8f5',cur:['#ffffff','#cfe3f7'],
  wall:{w:280,h:92,fn:(g,W,H)=>{['#6fb4f2','#86c2f6','#9fd0f8','#b8def9'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,i*H/4,W,H/4+1)});
   const cl=(x,y)=>{g.fillStyle='#fff';g.fillRect(x+4,y+4,28,8);g.fillRect(x,y+8,40,8);g.fillRect(x+10,y,16,8)};[[20,14],[120,30],[210,8],[170,58],[40,56],[255,40]].forEach(p=>cl(p[0],p[1]))}},
  floor:{fn:g=>{g.fillStyle='#5fb35f';g.fillRect(0,0,64,64);g.fillStyle='#74c874';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)}}},
 {n:'malam',bg:'#141b3f',cur:['#4a3a9a','#32267a'],
  wall:{w:280,h:92,fn:(g,W,H)=>{g.fillStyle='#141b3f';g.fillRect(0,0,W,H);g.fillStyle='#1a2350';g.fillRect(0,H*.55,W,H*.45);
   for(let i=0;i<46;i++){const x=Math.floor(rnd0()*W),y=Math.floor(rnd0()*H*.9);g.fillStyle=i%5?'#fff6c8':'#8fd0f8';g.fillRect(x,y,2,2);if(i%9===0){g.fillRect(x-2,y,6,2);g.fillRect(x,y-2,2,6)}}
   g.fillStyle='#f2e6a0';g.beginPath();g.arc(236,26,14,0,7);g.fill();g.fillStyle='#141b3f';g.beginPath();g.arc(242,22,12,0,7);g.fill()}},
  floor:{fn:g=>{g.fillStyle='#222a58';g.fillRect(0,0,64,64);g.fillStyle='#323e80';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)}}},
 {n:'kuning',bg:'#ffe58a',cur:['#e8743b','#c95a22'],
  wall:{rep:[7,3],fn:g=>{g.fillStyle='#ffe58a';g.fillRect(0,0,64,64);g.fillStyle='#ffc94d';g.fillRect(12,12,8,8);g.fillRect(44,44,8,8);g.fillStyle='#fff3bf';g.fillRect(44,12,4,4);g.fillRect(12,44,4,4)}},
  floor:{fn:g=>{g.fillStyle='#f2c14e';g.fillRect(0,0,64,64);g.fillStyle='#fff0b0';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)}}},
 {n:'mint',bg:'#bfead0',cur:['#f4a6c0','#e07aa4'],
  wall:{rep:[7,3],fn:g=>{g.fillStyle='#bfead0';g.fillRect(0,0,64,64);g.fillStyle='#d3f4df';for(let y=0;y<64;y+=16)g.fillRect(0,y,64,8);g.fillStyle='#ffffff';g.fillRect(30,4,4,4)}},
  floor:{fn:g=>{g.fillStyle='#2f8f6a';g.fillRect(0,0,64,64);g.fillStyle='#58b88f';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)}}},
 {n:'ungu',bg:'#d8c6f4',cur:['#f2c14e','#d9a52e'],
  wall:{rep:[7,3],fn:g=>{g.fillStyle='#d8c6f4';g.fillRect(0,0,64,64);g.fillStyle='#f2c14e';g.fillRect(30,8,4,12);g.fillRect(26,12,12,4);g.fillStyle='#ffffff';g.fillRect(10,40,3,9);g.fillRect(7,43,9,3);g.fillRect(50,36,3,9);g.fillRect(47,39,9,3)}},
  floor:{fn:g=>{g.fillStyle='#5a3d9a';g.fillRect(0,0,64,64);g.fillStyle='#7a5ac0';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)}}}
];
const ZN=['penuh','setengah','wajah'];
const POSES=[
 {n:'senyum',ex:1,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(0,0,.08);v.g.position.y=Math.sin(t*2+j)*.012}},
 {n:'peace',ex:2,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(-2.45+Math.sin(t*7+j)*.08,0,.3);v.g.position.y=Math.sin(t*2+j)*.012}},
 {n:'hore',ex:3,f:(v,j,n,t)=>{const w=Math.sin(t*9+j)*.12;v.arms[0].rotation.set(0,0,-2.7-w);v.arms[1].rotation.set(0,0,2.7+w);v.g.position.y=Math.abs(Math.sin(t*5+j*.7))*.2}},
 {n:'rangkul',ex:2,f:(v,j,n,t)=>{const L=j>0,Rr=j<n-1;v.arms[0].rotation.set(L?.5:0,0,L?-1.35:-.08);v.arms[1].rotation.set(Rr?.5:0,0,Rr?1.35:.08);v.g.position.y=Math.sin(t*2+j)*.012;v.g.rotation.z=(j-(n-1)/2)*.04}},
 {n:'gaya',ex:1,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.65);v.arms[1].rotation.set(0,0,.65);v.g.position.y=Math.sin(t*2+j)*.012;v.g.rotation.z=Math.sin(t*1.5+j)*.03}},
 {n:'lambai',ex:2,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(0,0,2.3+Math.sin(t*8+j)*.28);v.g.position.y=Math.sin(t*2+j)*.012}},
 {n:'goyang',ex:2,f:(v,j,n,t)=>{const s=Math.sin(t*4+j*.8);v.arms[0].rotation.set(0,0,-.9+s*.3);v.arms[1].rotation.set(0,0,.9+s*.3);v.g.rotation.z=s*.09;v.g.position.y=Math.abs(s)*.05}},
 {n:'rentang',ex:3,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-1.5);v.arms[1].rotation.set(0,0,1.5);v.g.position.y=Math.sin(t*2+j)*.02}},
 {n:'lompat',ex:2,f:(v,j,n,t)=>{const w=Math.sin(t*9+j)*.1;v.arms[0].rotation.set(0,0,-2.7-w);v.arms[1].rotation.set(0,0,2.7+w);v.g.position.y=Math.abs(Math.sin(t*3+j*.5))*.45}},
 {n:'kaget',ex:4,f:(v,j,n,t)=>{v.arms[0].rotation.set(-.3,0,-1.9);v.arms[1].rotation.set(-.3,0,1.9);v.g.position.y=Math.abs(Math.sin(t*10+j))*.06;v.g.rotation.z=Math.sin(t*14+j)*.03}},
 {n:'ngantuk',ex:6,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(0,0,.08);v.g.rotation.z=Math.sin(t*1.2+j)*.1;v.g.position.y=Math.sin(t*1.2+j)*.01}},
 {n:'cool',ex:0,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.25);v.arms[1].rotation.set(0,0,.25);v.g.rotation.y=.4;v.g.position.y=Math.sin(t*2+j)*.01}},
 {n:'manyun',ex:5,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(0,0,.08);v.g.rotation.z=Math.sin(t*2+j)*.02;v.g.position.y=-.02}},
 {n:'gantian',ex:3,f:(v,j,n,t)=>{const w=Math.sin(t*8+j)*.12;if(j%2===0){v.arms[0].rotation.set(0,0,-2.7-w);v.arms[1].rotation.set(0,0,.08)}else{v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(0,0,2.7+w)}v.g.position.y=Math.sin(t*2+j)*.012}},
 {n:'belakang',ex:0,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(0,0,.08);v.g.rotation.y=Math.PI-(j-(n-1)/2)*.1;v.g.position.y=Math.sin(t*2+j)*.012}},
 {n:'saling hadap',ex:1,f:(v,j,n,t)=>{const d=j-(n-1)/2;v.arms[0].rotation.set(0,0,-.08);v.arms[1].rotation.set(0,0,.08);v.g.rotation.y=d<0?.9:d>0?-.9:0;v.g.position.y=Math.sin(t*2+j)*.012}},
 {n:'muter',ex:2,f:(v,j,n,t)=>{v.arms[0].rotation.set(0,0,-.7);v.arms[1].rotation.set(0,0,.7);v.g.rotation.y=Math.sin(t*2.2+j)*1.1;v.g.position.y=Math.abs(Math.sin(t*2.2+j))*.06}}
];
const ANG=['lurus','geser kiri','geser kanan','dari atas','dari bawah','miring'];
const FILT=[{n:'normal',css:''},{n:'sepia',css:'sepia(1)'},{n:'hitam putih',css:'grayscale(1) contrast(1.1)'},{n:'hangat',css:'sepia(.25) saturate(1.35) brightness(1.04)'},{n:'dingin',css:'saturate(1.1) brightness(1.03) hue-rotate(12deg)'},{n:'pixel',css:''},{n:'retro',css:'sepia(.35) contrast(.92) saturate(1.25)'}];
/* filter dipasang ke hasil jepretan (rumus warna sendiri, tidak pakai ctx.filter supaya jalan juga di Safari) */
function applyFilter(c,f){
 if(!f)return c;const W=c.width,H=c.height,g=c.getContext('2d');
 if(f===5){const k=7,s2=document.createElement('canvas');s2.width=Math.round(W/k);s2.height=Math.round(H/k);const sg=s2.getContext('2d');sg.imageSmoothingEnabled=true;sg.drawImage(c,0,0,s2.width,s2.height);g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;g.drawImage(s2,0,0,W,H);g.imageSmoothingEnabled=true;return c}
 const im=g.getImageData(0,0,W,H),d=im.data;
 for(let i=0;i<d.length;i+=4){const r=d[i],gg=d[i+1],b=d[i+2];
  if(f===1){d[i]=.393*r+.769*gg+.189*b;d[i+1]=.349*r+.686*gg+.168*b;d[i+2]=.272*r+.534*gg+.131*b}
  else if(f===2){const y=(.299*r+.587*gg+.114*b-128)*1.1+128;d[i]=d[i+1]=d[i+2]=y}
  else if(f===3){d[i]=r*1.08+6;d[i+1]=gg+2;d[i+2]=b*.86}
  else if(f===4){d[i]=r*.88;d[i+1]=gg*.98;d[i+2]=b*1.12+6}
  else if(f===6){d[i]=(r*.85+30)+8;d[i+1]=gg*.85+30;d[i+2]=(b*.85+30)-10}}
 g.putImageData(im,0,0);
 if(f===6){const v=g.createRadialGradient(W/2,H/2,H*.3,W/2,H/2,H*.85);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(40,20,0,.45)');g.fillStyle=v;g.fillRect(0,0,W,H)}
 return c}
const PAPERS=[
 {n:'biru',c:'#9cc4f0',p:'stripe',pc:'#86b3e6',fr:'#1f3a5f',tx:'#ffffff',st:'#3b7dd8'},
 {n:'pink',c:'#f8c6d8',p:'dots',pc:'#f4a6c0',fr:'#7a2f4f',tx:'#ffffff',st:'#d9648f'},
 {n:'krem',c:'#fff3d6',p:'grid',pc:'#f1e0b8',fr:'#5a3b1a',tx:'#5a3b1a'},
 {n:'hitam',c:'#20232e',p:'stars',pc:'#3a4060',fr:'#f3f8ff',tx:'#f2c14e'},
 {n:'mint',c:'#bfead0',p:'check',pc:'#a9ddbf',fr:'#1f5a3f',tx:'#ffffff',st:'#2f9a68'},
 {n:'ungu',c:'#d8c6f4',p:'dots',pc:'#c4aaec',fr:'#3d2a66',tx:'#ffffff',st:'#7a5ac0'},
 {n:'putih',c:'#ffffff',p:'none',fr:'#1f3a5f',tx:'#1f3a5f'}
];
const FONTS=[
 {n:'pixel',b:14,f:s=>s+'px "Press Start 2P",monospace'},
 {n:'retro',b:34,f:s=>s+'px VT323,monospace'},
 {n:'tulis',b:26,f:s=>'italic bold '+s+'px "Comic Sans MS","Segoe Print",cursive'}
];
const SCL=1.5;   /* skala resolusi hasil strip */

/* ======================================================================
   5) BILIK 3D
   ====================================================================== */
function mkR(){if(ST.R)return ST.R;try{const R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setPixelRatio(1);R.setSize(600,480,false);R.domElement.style.cssText='width:100%;height:100%;display:block';ST.R=R;return R}catch(e){return null}}
function applyTheme(i){
 const S2=ST.set;if(!S2)return;const T=THEMES[i];ST.theme=i;
 const swap=(m,t)=>{if(m.map)m.map.dispose();m.map=t;m.needsUpdate=true};
 swap(S2.wm,cvT(T.wall.w||64,T.wall.h||64,T.wall.fn,T.wall.rep));
 swap(S2.fm,cvT(64,64,T.floor.fn,[8,5]));
 S2.sc.background=new THREE.Color(T.bg);
 S2.cu.forEach(c=>c.children.forEach((m,k)=>m.material.color.set(k%2?T.cur[1]:T.cur[0])))}
function buildSet(){
 if(ST.set)return ST.set;
 const sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(32,1.25,.1,60);
 sc.add(new THREE.AmbientLight(0xffffff,.85));const dl=new THREE.DirectionalLight(0xffffff,.5);dl.position.set(2,4,5);sc.add(dl);
 const wm=new THREE.MeshLambertMaterial(),fm=new THREE.MeshLambertMaterial();
 const bw=new THREE.Mesh(new THREE.PlaneGeometry(14,4.6),wm);bw.position.set(0,2.3,-1);sc.add(bw);
 const fp=new THREE.Mesh(new THREE.PlaneGeometry(14,8),fm);fp.rotation.x=-Math.PI/2;fp.position.set(0,0,3);sc.add(fp);
 /* (tulisan PHOTO BOOTH di latar foto sudah dihapus) — hanya untaian lampu */
 const bl=[];for(let i=0;i<13;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.045,8,6),new THREE.MeshBasicMaterial({color:'#ffd25a'}));m.position.set(-2.1+i*.35,2.85,-.93);sc.add(m);bl.push(m)}
 const cu=[-1,1].map(s=>{const g=new THREE.Group();[0,1,2].forEach(i=>{const m=new THREE.Mesh(new THREE.BoxGeometry(.28,4.4,.14),new THREE.MeshLambertMaterial({color:i%2?'#b0293f':RD}));m.position.set(-s*i*.26,2.2,0);g.add(m)});g.position.z=-.5;sc.add(g);return g});   /* tirai DI BELAKANG ava (ava di z=0, latar di z=-1) supaya tidak pernah menutupi peserta */
 ST.set={sc,cam,bl,cu,wm,fm};applyTheme(ST.theme);return ST.set}
function clearCrew(){ST.crew.forEach(c=>{if(c.v&&c.v.g){if(c.v.g.parent)c.v.g.parent.remove(c.v.g);disposeObj(c.v.g)}if(c.sh){if(c.sh.parent)c.sh.parent.remove(c.sh);c.sh.geometry.dispose();c.sh.material.dispose()}});ST.crew=[]}
/* kamera: z 0 = badan penuh, 1 = setengah badan, 2 = close-up wajah SEMUA peserta (merapat) */
function aim(z,k){
 const S2=ST.set;if(!S2)return;const n=Math.max(1,ST.crew.length),full=[5.2,6,6.9,7.6][n-1],sp=z===2?.66:.95;
 ST.crew.forEach((c,j)=>{const x=(j-(n-1)/2)*sp;c.v.g.position.x=x;c.sh.position.x=x});   /* mode wajah: semua peserta merapat supaya wajahnya muat semua */
 let d=full,ly=1.12,camY=1.25;
 if(z===1){d=Math.max(3.5,((n-1)*sp+1.1)/.717);ly=1.35;camY=1.4}
 else if(z===2){d=Math.max(2.5,((n-1)*sp+.85)/.717);ly=1.52;camY=1.55}
 const A=((ST.plan[k]||{}).a)|0;let cx=0,cy=camY,roll=0;
 if(A===1){cx=-d*.28;roll=.06}else if(A===2){cx=d*.28;roll=-.06}else if(A===3)cy=camY+d*.22;else if(A===4)cy=Math.max(.35,camY-d*.2);else if(A===5)roll=.14;
 S2.cam.position.set(cx,cy,d);S2.cam.lookAt(0,ly,0);if(roll)S2.cam.rotateZ(roll);
 const hw=(d+.5)*Math.tan(16*Math.PI/180)*1.25;S2.cu.forEach((c,i)=>{c.visible=d>4.5;c.position.x=(i?1:-1)*(hw-.2)})}
function layout(){
 ST.crew.forEach((c,j)=>{const n=ST.crew.length,x=(j-(n-1)/2)*.95;c.v.g.position.set(x,0,0);c.sh.position.set(x,.015,0)})}
function setExpr(i){ST.crew.forEach(c=>{c.v.a=ST.ex===1?Object.assign({},c.a):Object.assign({},c.a,{ex:POSES[i].ex});build3(c.v)})}   /* ST.ex: 0 = ekspresi ikut pose, 1 = ekspresi bawaan ava */
function loop(now){
 if(!ST.R||!ST.set)return;ST.raf=requestAnimationFrame(loop);
 const t=now/1000,n=ST.crew.length,P=POSES[ST.pose];
 ST.crew.forEach((c,j)=>{const v=c.v;if(!v.arms)return;const d=j-(n-1)/2;v.g.rotation.y=-d*.1;v.g.rotation.z=0;P.f(v,j,n,t)});
 const k=Math.floor(t*(ST.shooting?7:2.5));ST.set.bl.forEach((b,i)=>b.material.color.set((k+i)%2?'#ffd25a':'#7a5a1c'));
 ST.R.render(ST.set.sc,ST.set.cam)}
function stopLoop(){if(ST.raf){cancelAnimationFrame(ST.raf);ST.raf=0}}
function stopSet(){stopLoop();ST.shooting=false;clearCrew();if(ST.set){ST.set.sc.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){[].concat(o.material).forEach(m=>{if(m.map)m.map.dispose();m.dispose()})}});ST.set=null}
 if(ST.R){try{ST.R.dispose();ST.R.forceContextLoss()}catch(e){}ST.R=null}}

/* ---------- layar atur foto (latar, pose, zoom) ---------- */
const mkChips=(el,labels,fn,colors)=>{el.innerHTML='';labels.forEach((t,i)=>{const b=document.createElement('button');b.className='bt-ch';b.textContent=t;if(colors&&colors[i]){b.style.background=colors[i][0];b.style.color=colors[i][1]}b.onclick=()=>fn(i);el.appendChild(b)});return[...el.children]};
function stage(){
 const ids=ST.sel.filter(id=>V.has(id)&&V.get(id).a);if(!ids.length){picker();return}
 const R=mkR();if(!R){openM('<h2>photo booth</h2><p style="font-size:22px">grafis 3D tidak bisa dibuka di perangkat ini. coba kamera asli.</p>'+(origBooth?'<div class="row"><button class="btn" id="btcam">pakai kamera asli</button></div>':''));const b=$('#btcam');if(b)b.onclick=()=>origBooth();return}
 const S2=buildSet();stopLoop();clearCrew();
 ST.crew=ids.map(id=>{const a=V.get(id).a,v={a:Object.assign({},a),g:new THREE.Group()};build3(v);S2.sc.add(v.g);
  const sh=new THREE.Mesh(new THREE.CircleGeometry(.42,16),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.18,depthWrite:false}));sh.rotation.x=-Math.PI/2;S2.sc.add(sh);return{id,a,v,sh}});
 ST.slot=0;layout();
 const cur=()=>ST.plan[ST.slot];
 const preview=()=>{const p=cur();ST.pose=p.p;if(ST.theme!==p.t)applyTheme(p.t);setExpr(p.p);aim(p.z,ST.slot);R.domElement.style.filter=FILT[p.f|0].css};
 openM(`<h2>photo booth</h2><div class="cam" id="btcv"><div id="cd"></div><div id="fl"></div></div>`+
  `<div class="row"><button class="btn" id="btgo2">start (4 foto)</button><button class="btn alt" id="btrnd">acak</button><button class="btn alt" id="btback">ganti peserta</button></div>`+
  `<p id="btmsg" style="font-size:20px;margin-top:8px">${ST.crew.length} ava di dalam booth. tiap foto bisa beda latar, pose, zoom, sudut &amp; filter: pilih nomor foto dulu, lalu atur.</p>`+
  `<div class="bt-l">atur foto ke-</div><div class="bt-row" id="bts"></div>`+
  `<div class="bt-l">latar foto ini</div><div class="bt-row" id="bth"></div>`+
  `<div class="bt-l">pose</div><div class="bt-row" id="btp"></div><div class="bt-l">zoom</div><div class="bt-row" id="btz"></div>`+
  `<div class="bt-l">sudut kamera</div><div class="bt-row" id="bta"></div><div class="bt-l">filter (pixel &amp; retro terlihat setelah jepret)</div><div class="bt-row" id="btf"></div>`+
  `<div class="bt-l">ekspresi ava</div><div class="bt-row" id="bte"></div>`);
 $('#btcv').prepend(R.domElement);
 let cT,cS,cP,cZ,cA,cF,cE;
 const ui=()=>{const p=cur();cT.forEach((b,i)=>b.classList.toggle('on',i===p.t));
  cS.forEach((b,i)=>{const q=ST.plan[i];b.classList.toggle('on',i===ST.slot);b.textContent=(i+1)+' '+POSES[q.p].n+' · '+ZN[q.z]});
  cP.forEach((b,i)=>b.classList.toggle('on',i===p.p));cZ.forEach((b,i)=>b.classList.toggle('on',i===p.z));
  cA.forEach((b,i)=>b.classList.toggle('on',i===(p.a|0)));cF.forEach((b,i)=>b.classList.toggle('on',i===(p.f|0)));cE.forEach((b,i)=>b.classList.toggle('on',i===ST.ex))};
 ST.ui=ui;
 const go=fn=>i=>{if(ST.shooting)return;fn(i);preview();ui()};
 cT=mkChips($('#bth'),THEMES.map(t=>t.n).concat(['samakan semua']),go(i=>{if(i>=THEMES.length){const t=cur().t;ST.plan.forEach(q=>q.t=t)}else cur().t=i}),THEMES.map(t=>[t.bg,'#1f3a5f']).concat([['#fff','#1f3a5f']]));
 cS=mkChips($('#bts'),[1,2,3,4].map(String),go(i=>{ST.slot=i}));
 cP=mkChips($('#btp'),POSES.map(p=>p.n),go(i=>{cur().p=i}));
 cZ=mkChips($('#btz'),ZN,go(i=>{cur().z=i}));
 cA=mkChips($('#bta'),ANG,go(i=>{cur().a=i}));
 cF=mkChips($('#btf'),FILT.map(f=>f.n),go(i=>{cur().f=i}));
 cE=mkChips($('#bte'),['ikut pose','bawaan ava'],go(i=>{ST.ex=i}));
 $('#btback').onclick=picker;$('#btgo2').onclick=shoot;
 $('#btrnd').onclick=()=>{if(ST.shooting)return;const sh=(n)=>[...Array(n).keys()].sort(()=>Math.random()-.5).slice(0,4),ps=sh(POSES.length),ts=sh(THEMES.length),as=sh(ANG.length),fs=sh(FILT.length),zs=[0,0,1,2].sort(()=>Math.random()-.5);
  ST.plan=[0,1,2,3].map(i=>({p:ps[i],z:zs[i],t:ts[i],a:as[i],f:fs[i]}));preview();ui()};
 preview();ui();ST.raf=requestAnimationFrame(loop)}
const beep=()=>{try{if(typeof SFX!=='undefined'&&SFX.click)SFX.click()}catch(e){}};
async function shoot(){
 const go=$('#btgo2'),bk=$('#btback'),rn=$('#btrnd');if(go)go.disabled=true;if(bk)bk.disabled=true;if(rn)rn.disabled=true;ST.shooting=true;
 const shots=[];
 for(let i=0;i<4;i++){
  if(!ST.R||!ST.set)return;const pl=ST.plan[i];ST.slot=i;ST.pose=pl.p;if(ST.theme!==pl.t)applyTheme(pl.t);setExpr(pl.p);aim(pl.z,i);ST.R.domElement.style.filter=FILT[pl.f|0].css;if(ST.ui)ST.ui();
  for(let n=3;n>0;n--){if(!$('#cd')||!ST.R)return;$('#cd').textContent=n;beep();await wt(900)}
  if(!$('#cd')||!ST.R)return;$('#cd').textContent='';$('#fl').style.opacity=1;setTimeout(()=>{const f=$('#fl');if(f)f.style.opacity=0},120);
  ST.R.render(ST.set.sc,ST.set.cam);const c=document.createElement('canvas');c.width=600;c.height=480;c.getContext('2d').drawImage(ST.R.domElement,0,0,600,480);shots.push(applyFilter(c,pl.f|0));await wt(700)}
 ST.shots=shots;ST.stk=[];ST.pick=0;ST.made=true;ST.ui=null;
 stopSet();showResult()}

/* ======================================================================
   6) HASIL: bentuk, kertas, tulisan (semua bisa diganti setelah foto)
   ====================================================================== */
function geom(){
 if(ST.layout==='grid'){const m=22,fw=220,fh=176,gp=12,b=m+fh*2+gp;return{W:m*2+fw*2+gp,H:b+80,cy:b+40,ph:[0,1,2,3].map(i=>({i,x:m+(i%2)*(fw+gp),y:m+(i>>1)*(fh+gp),w:fw,h:fh}))}}
 if(ST.layout==='polaroid')return{W:380,H:400,cy:346,ph:[{i:ST.pick,x:24,y:24,w:332,h:266}]};
 return{W:360,H:24+4*264+80,cy:24+4*264+40,ph:[0,1,2,3].map(i=>({i,x:24,y:24+i*264,w:312,h:250}))}}
function paintPaper(g,W,H,P){
 g.fillStyle=P.c;g.fillRect(0,0,W,H);g.fillStyle=P.pc||P.c;
 if(P.p==='stripe')for(let x=0;x<W;x+=16)g.fillRect(x,0,8,H);
 else if(P.p==='dots'){for(let y=10,r=0;y<H;y+=20,r++)for(let x=(r%2?20:10);x<W;x+=20){g.beginPath();g.arc(x,y,3,0,7);g.fill()}}
 else if(P.p==='grid'){for(let x=0;x<W;x+=18)g.fillRect(x,0,1,H);for(let y=0;y<H;y+=18)g.fillRect(0,y,W,1)}
 else if(P.p==='stars'){for(let y=12,r=0;y<H;y+=26,r++)for(let x=(r%2?30:12);x<W;x+=36){g.fillRect(x-1,y-4,3,9);g.fillRect(x-4,y-1,9,3)}}
 else if(P.p==='check'){for(let y=0,r=0;y<H;y+=14,r++)for(let x=(r%2?14:0);x<W;x+=28)g.fillRect(x,y,14,14)}}
function drawCap(g,t,cx,cyy,mw,P){
 const F=FONTS[ST.font];let s=F.b;g.textAlign='center';g.textBaseline='middle';g.font=F.f(s);
 while(g.measureText(t).width>mw&&s>8){s--;g.font=F.f(s)}
 g.lineJoin='round';if(P.st){g.strokeStyle=P.st;g.lineWidth=Math.max(3,s/3);g.strokeText(t,cx,cyy)}g.fillStyle=P.tx;g.fillText(t,cx,cyy)}
function drawStk(g,CW,CH,list){
 list.forEach(s=>{const im=ST.spr&&ST.spr[s.id];if(!im)return;const w=s.fs*CW;g.save();g.translate(s.fx*CW,s.fy*CH);g.rotate(s.r||0);
  g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=w*.06;g.shadowOffsetX=w*.02;g.shadowOffsetY=w*.04;g.drawImage(im,-w/2,-w/2,w,w);g.restore()})}
function compose(ws){
 const P=PAPERS[ST.paper],L=geom(),c=document.createElement('canvas');c.width=Math.round(L.W*SCL);c.height=Math.round(L.H*SCL);
 const g=c.getContext('2d');g.scale(SCL,SCL);paintPaper(g,L.W,L.H,P);
 const fw=ST.layout==='polaroid'?3:4;
 L.ph.forEach(r=>{const s=ST.shots[r.i];if(!s)return;g.fillStyle=P.fr;g.fillRect(r.x-fw,r.y-fw,r.w+fw*2,r.h+fw*2);g.drawImage(s,r.x,r.y,r.w,r.h)});
 const t=ST.cap==null?EXTRA.boothFooter:ST.cap;if(t)drawCap(g,String(t),L.W/2,L.cy,L.W-36,P);
 if(ws&&ST.stk.length){g.setTransform(1,0,0,1,0,0);drawStk(g,c.width,c.height,ST.stk)}
 return c}
function showResult(){
 const th2=ST.shots.map(s=>{const c=document.createElement('canvas');c.width=108;c.height=86;c.getContext('2d').drawImage(s,0,0,108,86);return c.toDataURL()});
 mb.innerHTML=`<h2>your photo!</h2><img class="big" id="brs" style="max-height:44vh;width:auto;margin:0 auto" alt="hasil foto">`+
  `<div class="bt-bar" style="margin-top:6px"><div class="row"><a class="btn" id="bdl" style="text-decoration:none" download="photobooth.png" href="#">download</a><button class="btn" id="se">edit stiker</button><button class="btn" id="bsv">simpan ke galeri</button><button class="btn alt" id="re">retake</button><button class="btn alt" id="bk">ganti peserta</button></div></div>`+
  `<div class="bt-l">bentuk</div><div class="bt-row" id="bly"></div><div id="bpkw"><div class="bt-l">pilih foto</div><div class="bt-row" id="bpk"></div></div>`+
  `<div class="bt-l">kertas</div><div class="bt-row" id="bpp"></div>`+
  `<div class="bt-l">tulisan di bawah</div><input id="bcp" maxlength="28" placeholder="tulis sesuatu..."><div class="bt-row" id="bfn"></div>`+
  `<p style="font-size:20px;margin-top:8px">di HP: kalau download tidak jalan, tahan lama gambarnya lalu pilih simpan.</p>`;
 const img=$('#brs'),dl=$('#bdl'),LY=['strip','grid','polaroid'];
 const upd=()=>{const c=compose(true);ST.url=c.toDataURL('image/png');img.src=ST.url;dl.href=ST.url};
 const cL=mkChips($('#bly'),['strip 4','grid 2x2','polaroid'],i=>{if(LY[i]!==ST.layout){ST.layout=LY[i];ST.stk=[]}sync();upd()});
 const cK=[];th2.forEach((u,i)=>{const b=document.createElement('button');b.className='bt-ch';b.innerHTML='<img alt="" src="'+u+'">';b.onclick=()=>{ST.pick=i;sync();upd()};$('#bpk').appendChild(b);cK.push(b)});
 const cP=mkChips($('#bpp'),PAPERS.map(p=>p.n),i=>{ST.paper=i;sync();upd()},PAPERS.map(p=>[p.c,p.n==='hitam'?'#fff':'#1f3a5f']));
 const cF=mkChips($('#bfn'),FONTS.map(f=>f.n),i=>{ST.font=i;sync();upd()});
 const inp=$('#bcp');inp.value=ST.cap==null?EXTRA.boothFooter:ST.cap;inp.oninput=()=>{ST.cap=inp.value;upd()};
 const sync=()=>{cL.forEach((b,i)=>b.classList.toggle('on',LY[i]===ST.layout));cK.forEach((b,i)=>b.classList.toggle('on',i===ST.pick));cP.forEach((b,i)=>b.classList.toggle('on',i===ST.paper));cF.forEach((b,i)=>b.classList.toggle('on',i===ST.font));$('#bpkw').style.display=ST.layout==='polaroid'?'':'none'};
 $('#re').onclick=stage;$('#bk').onclick=picker;$('#se').onclick=editor;
 {const sv=$('#bsv');sv.onclick=async()=>{
  if(!window.PHOTOS3D){sv.textContent='photos3d belum dimuat';return}
  sv.disabled=true;sv.textContent='menyimpan...';
  const names=ST.sel.map(id=>{const v=V.get(id);return v&&v.a?v.a.n:''}).filter(Boolean);
  const r=await PHOTOS3D.save(compose(true),{names,layout:ST.layout,cap:ST.cap==null?EXTRA.boothFooter:ST.cap});
  sv.textContent=r.ok?'tersimpan ✓':'gagal ('+r.err+')';if(!r.ok)sv.disabled=false}}
 sync();upd();
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{if($('#brs')===img)upd()})}

/* ======================================================================
   7) STIKER 3D (dirender dari model three.js jadi gambar transparan, lalu ditempel & bisa digeser)
   ====================================================================== */
const STK=[{id:'star',n:'bintang'},{id:'crown',n:'mahkota'},{id:'balloon',n:'balon'},{id:'cake',n:'kue'},{id:'hat',n:'topi pesta'},{id:'cat',n:'kucing'},{id:'gift',n:'kado'},
 {id:'moon',n:'bulan',lock:1},{id:'fish',n:'ikan',lock:1},{id:'ghost',n:'hantu',lock:1}];
const SZ=[.15,.23,.33];
const PM=(c,s)=>new THREE.MeshPhongMaterial({color:c,shininess:s==null?70:s});
const mesh=(geo,c,x,y,z,p,s)=>{const m=new THREE.Mesh(geo,PM(c,s));m.position.set(x||0,y||0,z||0);if(p)p.add(m);return m};
const SPH=(r,c,x,y,z,p,sx,sy,sz)=>{const m=mesh(new THREE.SphereGeometry(r,22,16),c,x,y,z,p);m.scale.set(sx||1,sy||1,sz||1);return m};
const CYL=(rt,rb,h,c,x,y,z,p,seg)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg||28),c,x,y,z,p);
const CON=(r,h,c,x,y,z,p,seg)=>mesh(new THREE.ConeGeometry(r,h,seg||24),c,x,y,z,p);
const TOR=(r,t,c,x,y,z,p)=>{const m=mesh(new THREE.TorusGeometry(r,t,10,32),c,x,y,z,p);m.rotation.x=Math.PI/2;return m};
const BOXM=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),c,x,y,z,p);
const EXT=(sh,d)=>{const geo=new THREE.ExtrudeGeometry(sh,{depth:d,amount:d,bevelEnabled:true,bevelThickness:.07,bevelSize:.06,bevelSegments:3});geo.center();return geo};
const SB={
 star(g){const sh=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.36:.85,x=Math.cos(a)*r,y=Math.sin(a)*r;i?sh.lineTo(x,y):sh.moveTo(x,y)}sh.closePath();mesh(EXT(sh,.26),'#f7c93c',0,0,0,g,100)},
 crown(g){CYL(.62,.7,.42,'#f2c14e',0,-.3,0,g);TOR(.68,.05,'#d9a52e',0,-.5,0,g);TOR(.6,.05,'#d9a52e',0,-.1,0,g);
  for(let i=0;i<5;i++){const a=i/5*Math.PI*2,x=Math.sin(a)*.5,z=Math.cos(a)*.5;CON(.17,.6,'#f2c14e',x,.2,z,g,16);SPH(.08,i%2?'#4f8fe8':'#e84a5f',x,.55,z,g)}
  [-.55,0,.55].forEach(a=>SPH(.07,'#e84a5f',Math.sin(a)*.68,-.3,Math.cos(a)*.68,g));g.rotation.x=.3},
 balloon(g){SPH(.6,'#4f8fe8',0,.2,0,g,1,1.2,1);CON(.1,.16,'#3b7dd8',0,-.6,0,g,12);CYL(.012,.012,.6,'#d0d0d0',0,-.95,0,g,6);SPH(.1,'#ffffff',-.25,.55,.45,g,1,1.4,.5)},
 cake(g){CYL(.95,.95,.06,'#dfe9f5',0,-.62,0,g,32);CYL(.72,.72,.42,'#fff4e6',0,-.38,0,g,32);TOR(.72,.07,'#f4a6c0',0,-.17,0,g);
  CYL(.48,.48,.34,'#f4a6c0',0,0,0,g,32);TOR(.48,.06,'#ffffff',0,.17,0,g);CYL(.05,.05,.32,'#4f8fe8',0,.35,0,g,12);
  const fl=SPH(.07,'#ffd25a',0,.58,0,g,1,1.5,1);fl.material.emissive.set('#ffb020');SPH(.09,'#e84a5f',.25,.22,.1,g)},
 hat(g){CON(.55,1.4,'#e84a5f',0,0,0,g,28);[[-.3,.55*1.0/1.4],[.1,.55*.6/1.4]].forEach(p=>TOR(p[1]+.012,.04,'#f2c14e',0,p[0],0,g));TOR(.55,.05,'#f2c14e',0,-.7,0,g);SPH(.12,'#f2c14e',0,.72,0,g);g.rotation.z=-.25},
 cat(g){SPH(.6,'#f0b070',0,0,0,g,1.15,.95,.92);
  [-1,1].forEach(s=>{const e=CON(.24,.45,'#f0b070',s*.45,.55,0,g,4);e.rotation.z=-s*.35;const ei=CON(.12,.28,'#f4a6c0',s*.45,.52,.1,g,4);ei.rotation.z=-s*.35;
   SPH(.08,'#1f3a5f',s*.25,.08,.52,g);SPH(.025,'#ffffff',s*.25-.02,.12,.59,g);
   [.02,-.1].forEach((y,k)=>{const w=CYL(.012,.012,.5,'#333333',s*.78,y,.42,g,6);w.rotation.z=Math.PI/2+s*(k?-.15:.15)})});
  SPH(.06,'#e0709a',0,-.08,.58,g,1.3,.8,.8)},
 gift(g){BOXM(1.1,.85,1.1,'#4f8fe8',0,-.2,0,g);BOXM(1.2,.25,1.2,'#3b7dd8',0,.33,0,g);BOXM(.22,.88,1.12,'#f2c14e',0,-.2,0,g);BOXM(1.12,.88,.22,'#f2c14e',0,-.2,0,g);
  BOXM(.22,.27,1.22,'#f2c14e',0,.33,0,g);BOXM(1.22,.27,.22,'#f2c14e',0,.33,0,g);
  [-1,1].forEach(s=>{const b=new THREE.Mesh(new THREE.TorusGeometry(.2,.07,10,24),PM('#f2c14e'));b.position.set(s*.22,.62,0);b.rotation.z=s*-.7;g.add(b)});SPH(.1,'#e8b030',0,.55,0,g)},
 moon(g){const r1=.8,r2=.65,d=.35,x=(d*d+r1*r1-r2*r2)/(2*d),y=Math.sqrt(r1*r1-x*x),al=Math.atan2(y,x),be=Math.atan2(y,x-d),sh=new THREE.Shape();
  sh.absarc(0,0,r1,al,Math.PI*2-al,false);sh.absarc(d,0,r2,Math.PI*2-be,be,true);mesh(EXT(sh,.22),'#f7d86a',0,0,0,g,100);g.rotation.z=-.4},
 fish(g){SPH(.7,'#4f8fe8',0,0,0,g,1,.6,.45);const t=CON(.32,.5,'#3b7dd8',.85,0,0,g,4);t.rotation.z=Math.PI/2;CON(.2,.4,'#3b7dd8',0,.45,0,g,4);
  SPH(.12,'#ffffff',-.4,.1,.28,g);SPH(.06,'#1f3a5f',-.43,.1,.37,g)},
 ghost(g){SPH(.55,'#f4a6c0',0,.25,0,g);CYL(.55,.55,.8,'#f4a6c0',0,-.15,0,g);[-.4,-.2,0,.2,.4].forEach(x=>SPH(.17,'#f4a6c0',x,-.55,0,g));
  [-1,1].forEach(s=>SPH(.08,'#1f3a5f',s*.2,.3,.5,g,1,1.3,.6));SPH(.06,'#1f3a5f',0,.1,.53,g,1,1.2,.5)}
};
function makeSprites(){
 if(ST.spr)return ST.spr;
 let R;try{R=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true})}catch(e){return null}
 R.setPixelRatio(1);R.setSize(192,192,false);R.setClearColor(0x000000,0);
 const sc=new THREE.Scene();sc.add(new THREE.AmbientLight(0xffffff,.7));const dl=new THREE.DirectionalLight(0xffffff,.85);dl.position.set(-2,4,5);sc.add(dl);
 const cam=new THREE.PerspectiveCamera(30,1,.1,50),out={};
 STK.forEach(s=>{const o=new THREE.Group(),inner=new THREE.Group();SB[s.id](inner);o.add(inner);o.rotation.set(.22,-.45,0);sc.add(o);o.updateMatrixWorld(true);
  const bb=new THREE.Box3().setFromObject(o),sz=bb.getSize(new THREE.Vector3()),ce=bb.getCenter(new THREE.Vector3());
  const dist=Math.max(sz.x,sz.y)*.5*1.12/Math.tan(15*Math.PI/180)+sz.z*.5;
  cam.position.set(ce.x,ce.y,ce.z+dist);cam.lookAt(ce);R.render(sc,cam);
  const c=document.createElement('canvas');c.width=c.height=192;c.getContext('2d').drawImage(R.domElement,0,0,192,192);out[s.id]=c;sc.remove(o);disposeObj(o)});
 try{R.dispose();R.forceContextLoss()}catch(e){}
 return ST.spr=out}
function editor(){
 const spr=makeSprites();
 if(!spr){mb.innerHTML='<h2>edit stiker</h2><p style="font-size:22px">stiker 3D tidak bisa dibuat di perangkat ini.</p><div class="row"><button class="btn alt" id="bbk2">kembali</button></div>';$('#bbk2').onclick=showResult;return}
 const base=compose(false);
 mb.innerHTML=`<h2>edit stiker</h2><div class="bt-sp" id="bsp"></div><div class="bt-row" style="margin-top:8px"><span class="bt-l" style="margin:0 4px 0 0">ukuran</span><span class="bt-row" id="bsz"></span></div>`+
  `<canvas id="bcv" style="max-width:100%;max-height:40vh;width:auto;height:auto;display:block;margin:10px auto 0;border:3px solid var(--ink);touch-action:none"></canvas>`+
  `<p style="font-size:18px;margin-top:4px;text-align:center">tap di foto = tempel · tahan &amp; geser = atur posisi</p>`+
  `<div class="bt-bar"><div class="row"><button class="btn alt" id="beu">undo</button><button class="btn" id="bdn">selesai</button><a class="btn" id="bed" style="text-decoration:none" download="photobooth-stiker.png" href="#">download</a></div></div>`;
 const c=$('#bcv');c.width=base.width;c.height=base.height;const g=c.getContext('2d');
 const paint=()=>{g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.drawImage(base,0,0);drawStk(g,c.width,c.height,ST.stk)};
 let cur='star',drag=null;const btns=[];
 const mark=()=>btns.forEach(b=>b.classList.toggle('on',b.dataset.id===cur));
 const unl=()=>{try{return typeof ls==='function'&&ls('bday-unlock')}catch(e){return false}};
 STK.forEach(s=>{const b=document.createElement('button');b.className='bt-sk';b.dataset.id=s.id;
  if(s.lock&&!unl()){b.textContent='?';b.style.opacity='.5';b.title='main game, skor 40+'}
  else{const im=document.createElement('img');im.alt=s.n;im.src=spr[s.id].toDataURL();b.appendChild(im);b.title=s.n;b.onclick=()=>{cur=s.id;mark()}}
  $('#bsp').appendChild(b);btns.push(b)});
 const cz=mkChips($('#bsz'),['kecil','sedang','besar'],i=>{ST.size=i;cz.forEach((b,k)=>b.classList.toggle('on',k===i))});cz.forEach((b,k)=>b.classList.toggle('on',k===ST.size));
 mark();paint();
 const pos=e=>{const r=c.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
 c.onpointerdown=e=>{e.preventDefault();const p=pos(e);drag={id:cur,fx:p[0],fy:p[1],fs:SZ[ST.size],r:(Math.random()-.5)*.35};ST.stk.push(drag);try{c.setPointerCapture(e.pointerId)}catch(_){}try{if(typeof SFX!=='undefined'&&SFX.pop)SFX.pop()}catch(_){}paint()};
 c.onpointermove=e=>{if(!drag)return;const p=pos(e);drag.fx=p[0];drag.fy=p[1];paint()};
 c.onpointerup=c.onpointercancel=()=>{drag=null};
 $('#beu').onclick=()=>{ST.stk.pop();paint()};
 $('#bdn').onclick=showResult;
 $('#bed').onclick=()=>{$('#bed').href=c.toDataURL('image/png')}}

window.BOOTH3D={enter,leave,state:ST};
console.log('booth3d.js v3 (photo booth: latar/pose/zoom/sudut/filter per foto, ekspresi bawaan ava, kertas, caption, stiker 3D) loaded');
})();