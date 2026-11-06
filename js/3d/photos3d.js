/* photos3d.js v6 — ALBUM FOTO (v6: buku tidak kepotong di laptop, buku & foto tali lebih 3D) BERSAMA (hasil photo booth) di RUANG KENANGAN (hanya versi 3D / index.html)
   Muat setelah room3d.js, upgrade3d.js, interact3d.js (urutan dengan booth3d.js bebas):
     <script src="js/3d/photos3d.js?v=6"></script>
   Butuh booth3d.js v2 yang sudah ditambal (tombol "simpan ke galeri").

   Isi:
   - window.PHOTOS3D.save(canvas,{names,layout,cap})  -> simpan strip (JPEG kecil) ke Firestore koleksi "photos"
   - Benda "album foto" di ruang kenangan (podium kayu + buku album, tap = buka album): BUKU album 3D (balik halaman), tap foto = besar, ‹ › geser, download, hapus (hanya foto yang dibuat di perangkat ini)
   - 6 foto TERBARU digantung di tali dinding belakang ruang kenangan (tap = buka besar)
   - Data baru diambil dari Firebase HANYA setelah ruang kenangan / album dibuka (hemat kuota)

   ATURAN FIRESTORE (Firebase console -> Firestore Database -> Rules). Tambahkan di dalam "match /databases/{database}/documents { ... }"
   tanpa menghapus aturan koleksi lain yang sudah ada, lalu klik Publish:
     match /photos/{id} {
       allow read: if true;
       allow create: if request.resource.data.img is string
                     && request.resource.data.img.size() < 800000
                     && request.resource.data.createdAt == request.time;
       allow delete: if true;     // tanpa login, aturan tidak bisa tahu siapa pemilik foto; ganti ke "if false" kalau mau hapus lewat console saja
     }
   Uji cepat: buka Console lalu ketik  PHOTOS3D.openAlbum() */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||!window.GRP||typeof lact!=='function'||typeof openM!=='function'||typeof bx!=='function'||
   typeof mb==='undefined'||typeof ov==='undefined'||typeof esc!=='function'||typeof winFx==='undefined'||typeof did==='undefined'){
 console.warn('photos3d.js: butuh index.html + room3d.js (ruang kenangan, lact, openM) — muat file ini setelah interact3d.js');return}

/* ===== EDIT ===== */
const COL='photos',LIMIT=30,MAXW=480;           /* koleksi Firestore, jumlah foto yang dimuat, lebar maks foto tersimpan (px) */
const AL_POS={x:2.65,z:-1.0};                   /* posisi podium album di ruang kenangan */
const HANG_H=1.3;                               /* tinggi maks foto yang digantung di dinding (supaya tidak menimpa bangku) */
const GR=window.GRP;
const P={list:[],started:false,loaded:false,pending:false,err:'',view:null,curId:null,t0:0,spread:0};
const MON=['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nov','des'];
const fd=t=>{const d=new Date(t||Date.now());return d.getDate()+' '+MON[d.getMonth()]+' '+d.getFullYear()};
const dateOf=p=>p.ts||(p.createdAt&&p.createdAt.toMillis?p.createdAt.toMillis():Date.now());
const nm=p=>p.names&&p.names.length?p.names.join(', '):'photo booth';
const okImg=u=>typeof u==='string'&&u.startsWith('data:image/jpeg;base64,');

/* ======================================================================
   1) FIREBASE
   ====================================================================== */
const ready=()=>typeof db!=='undefined'&&!!db&&typeof fs!=='undefined'&&!!fs;
const waitDB=async ms=>{const t0=Date.now();while(!ready()&&Date.now()-t0<ms)await new Promise(r=>setTimeout(r,250));return ready()};
function start(){
 if(P.started||P.pending)return;
 if(!ready()){P.pending=true;waitDB(15000).then(ok=>{P.pending=false;if(ok)start();else{P.err='no-db';refresh()}});return}
 P.started=true;P.loaded=false;P.err='';
 try{fs.onSnapshot(fs.query(fs.collection(db,COL),fs.orderBy('createdAt','desc'),fs.limit(LIMIT)),
  s=>{P.list=s.docs.map(d=>({id:d.id,...d.data()})).filter(p=>okImg(p.img));P.err='';P.loaded=true;refresh()},
  e=>{P.err=(e&&e.code)||'error';P.started=false;refresh()})}catch(e){P.err='error';P.started=false;refresh()}}
function shrink(c){
 const s=Math.min(1,MAXW/c.width),o=document.createElement('canvas');o.width=Math.round(c.width*s);o.height=Math.round(c.height*s);
 const g=o.getContext('2d');g.fillStyle='#ffffff';g.fillRect(0,0,o.width,o.height);g.imageSmoothingQuality='high';g.drawImage(c,0,0,o.width,o.height);
 let q=.76,u=o.toDataURL('image/jpeg',q);while(u.length>650000&&q>.4){q-=.1;u=o.toDataURL('image/jpeg',q)}return u}
async function save(canvas,meta){
 meta=meta||{};
 if(!(await waitDB(6000)))return{ok:false,err:'no-db'};
 try{
  await fs.addDoc(fs.collection(db,COL),{img:shrink(canvas),names:(meta.names||[]).slice(0,4).map(s=>String(s).slice(0,14)),by:String(did||''),
   cap:String(meta.cap||'').slice(0,28),layout:String(meta.layout||'strip').slice(0,10),ts:Date.now(),createdAt:fs.serverTimestamp()});
  return{ok:true}}catch(e){return{ok:false,err:(e&&e.code)||'error'}}}

/* ======================================================================
   2) BENDA ALBUM (podium + buku) di ruang kenangan
   ====================================================================== */
const AL=new THREE.Group();AL.position.set(AL_POS.x,0,AL_POS.z);AL.rotation.y=-.35;GR.add(AL);
bx(.64,.12,.64,'#5a3b22',0,.06,0,AL);bx(.34,.74,.34,'#a8743f',0,.49,0,AL);bx(.88,.06,.68,'#c98b52',0,.89,0,AL);bx(.5,.05,.5,'#8a5a34',0,.14,0,AL);
const bk=new THREE.Group();bk.position.set(0,.99,.02);bk.rotation.x=-.28;AL.add(bk);
bx(.72,.1,.52,'#c9507f',0,0,0,bk);bx(.66,.07,.46,'#fff6e0',0,.075,0,bk);bx(.72,.05,.52,'#f4a6c0',0,.135,0,bk);bx(.06,.2,.52,'#c9507f',-.36,.075,0,bk);bx(.05,.08,.08,'#f2c14e',.37,.12,0,bk);
bx(.22,.012,.26,'#fffdf3',.12,.165,0,bk);bx(.17,.014,.17,'#cfe0f6',.12,.17,-.02,bk);bx(.17,.014,.05,'#f2c14e',.12,.172,.09,bk);
const LC=document.createElement('canvas');LC.width=256;LC.height=72;const lg=LC.getContext('2d'),LT=new THREE.CanvasTexture(LC);LT.magFilter=LT.minFilter=THREE.NearestFilter;
function drawLab(){
 lg.clearRect(0,0,256,72);lg.fillStyle='#1f3a5f';lg.fillRect(0,0,256,72);lg.strokeStyle='#f2c14e';lg.lineWidth=4;lg.strokeRect(3,3,250,66);
 lg.textAlign='center';lg.textBaseline='middle';lg.fillStyle='#fff6c8';lg.font='15px "Press Start 2P",monospace';lg.fillText('album foto',128,26);
 lg.fillStyle='#8fd0f0';lg.font='12px "Press Start 2P",monospace';lg.fillText(P.loaded&&!P.err?P.list.length+' foto':'tap buka',128,52);LT.needsUpdate=true}
drawLab();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawLab);
{const lm=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.31),new THREE.MeshBasicMaterial({map:LT,transparent:true}));lm.position.set(0,1.55,0);lm.rotation.y=.35;AL.add(lm);
 bx(.03,.45,.03,'#5a3b22',0,1.3,0,AL)}
lact(AL,()=>openAlbum());
/* rintangan supaya avatar tidak menembus podium */
if(window.R3&&R3.OB&&R3.OB[2]&&R3.addRoom){try{const o=R3.OB[2].concat([[AL_POS.x-.5,AL_POS.x+.5,AL_POS.z-.5,AL_POS.z+.5]]);R3.addRoom(2,o,R3.BND[2],R3.POIS[2])}catch(e){console.warn('photos3d',e)}}

/* ======================================================================
   3) FOTO TERBARU DIGANTUNG DI DINDING (6 slot) — v6: polaroid TEBAL, diikat tali V dari paku, jepitan kayu, bergoyang pelan
   ====================================================================== */
const ROPES=[[4.3,-2.05],[4.3,-1.25],[4.3,1.25],[4.3,2.05],[2.2,-2.05],[2.2,2.05]],TILT=[.03,-.04,.035,-.03,.04,-.035];   /* [tinggi y, posisi x] */
const DROP=.22,MG=.04,CAPH=.12,FDEP=.03;        /* panjang tali, tepi polaroid, tepi bawah (tempat tulisan), tebal polaroid */
function strand(m,x1,y1,x2,y2){m.scale.x=Math.hypot(x2-x1,y2-y1);m.position.set((x1+x2)/2,(y1+y2)/2,.03);m.rotation.z=Math.atan2(y2-y1,x2-x1)}
const SL=ROPES.map((r,i)=>{
 const g=new THREE.Group();g.position.set(r[1],r[0],-3.33);g.rotation.z=TILT[i];g.visible=false;GR.add(g);
 const sh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.17,depthWrite:false}));sh.position.z=-.15;g.add(sh);   /* bayangan jatuh di tembok */
 bx(.07,.07,.05,'#e8b04a',0,0,.02,g);bx(.035,.035,.06,'#b5812a',0,0,.03,g);                                                                                                      /* paku */
 const sl=bx(1,.014,.014,'#8a6a3a',0,0,.03,g),sr=bx(1,.014,.014,'#8a6a3a',0,0,.03,g);                                                                                              /* tali V */
 const fr=bx(1,1,1,'#fffdf3',0,0,0,g);                                                                                                                                              /* badan polaroid (punya ketebalan) */
 const pm=new THREE.MeshBasicMaterial({color:'#ffffff'}),ph=new THREE.Mesh(new THREE.PlaneGeometry(1,1),pm);g.add(ph);
 const p1=bx(.06,.13,.045,'#f2c14e',0,0,.012,g),p2=bx(.06,.13,.045,'#f2c14e',0,0,.012,g);                                                                                           /* jepitan kayu */
 lact(g,()=>{const k=P.list.findIndex(p=>p.id===s.id);if(s.id&&k>=0)openOne(k)});
 const s={g,sh,ph,pm,fr,sl,sr,p1,p2,id:null};return s});
function layout(s,w,h){
 const fw=w+2*MG,fh=h+MG+CAPH,cx=fw/2-.05;
 s.ph.scale.set(w,h,1);s.ph.position.set(0,-DROP-MG-h/2,FDEP/2+.002);
 s.fr.scale.set(fw,fh,FDEP);s.fr.position.set(0,-DROP-fh/2,0);
 s.sh.scale.set(fw+.02,fh+.02,1);s.sh.position.set(.09,-DROP-fh/2-.07,-.15);
 strand(s.sl,0,0,-cx,-DROP);strand(s.sr,0,0,cx,-DROP);
 s.p1.position.set(-cx,-DROP-.03,.012);s.p2.position.set(cx,-DROP-.03,.012)}
function setSlot(k,p){
 const s=SL[k];if(!p){s.g.visible=false;s.id=null;return}
 if(s.id===p.id){s.g.visible=true;return}
 s.id=p.id;s.g.visible=false;
 const im=new Image();im.onload=()=>{if(s.id!==p.id)return;
  const t=new THREE.Texture(im);t.minFilter=t.magFilter=THREE.LinearFilter;t.generateMipmaps=false;t.needsUpdate=true;if(s.pm.map)s.pm.map.dispose();s.pm.map=t;s.pm.needsUpdate=true;
  const a=im.width/im.height,w=Math.min(.62,HANG_H*a),h=w/a;layout(s,w,h);s.g.visible=true};
 im.src=p.img}

/* ======================================================================
   4) ALBUM (buku 3D) + PENAMPIL BESAR (polaroid digantung)
   ====================================================================== */
{const cs=document.createElement('style');cs.textContent=`
/* modal melebar otomatis kalau isinya album / foto (HP tetap 100%) */
#md:has(.pk-w){max-width:min(760px,100%)}
#md:has(.pv-st){max-width:min(520px,100%)}

/* ---- BUKU ----  ukuran dihitung dari LEBAR WADAH (cqw), jadi tidak mungkin kepotong lagi */
.pk-w{container-type:inline-size;padding:14px 0 20px;user-select:none;-webkit-user-select:none}
.pk-s{--pw:min(36vw,200px);--ph:calc(var(--pw)*1.5);perspective:1500px;perspective-origin:50% 38%}
@supports (width:1cqw){.pk-s{--pw:clamp(96px,min(calc((100cqw - 30px)/2),calc((100vh - 280px)/1.5),300px),300px)}}
.pk-t{transform-style:preserve-3d;transform:rotateX(var(--rx,9deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out}
.pk{position:relative;width:calc(var(--pw)*2);height:var(--ph);margin:0 auto;transition:transform .8s cubic-bezier(.4,.05,.2,1);transform-style:preserve-3d}
/* bayangan buku di meja */
.pk::before{content:"";position:absolute;left:0;right:0;bottom:-18px;height:30px;background:radial-gradient(ellipse at 50% 45%,rgba(20,40,70,.55),rgba(20,40,70,0) 68%);transform:translateZ(-2px);pointer-events:none;transition:left .8s ease,right .8s ease}
.pk.c0::before{left:50%}.pk.cN::before{right:50%}
.pk-l{position:absolute;left:50%;top:0;width:var(--pw);height:var(--ph);transform-origin:left center;transform-style:preserve-3d;transition:z-index 0s linear .5s}
.pk-f,.pk-b{position:absolute;inset:0;box-sizing:border-box;backface-visibility:hidden;-webkit-backface-visibility:hidden;background:#fffdf3;border:3px solid var(--ink);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;overflow:hidden;font:16px/1.1 VT323,monospace;color:var(--ink);text-align:center}
.pk-b{transform:rotateY(180deg)}
/* tepi tumpukan kertas */
.pk-f{box-shadow:1px 1px 0 #e7dcc0,2px 2px 0 #fffdf3,3px 3px 0 #ddd0ae,4px 4px 0 #fffdf3,5px 5px 0 #cfc19c}
.pk-b{box-shadow:-1px 1px 0 #e7dcc0,-2px 2px 0 #fffdf3,-3px 3px 0 #ddd0ae,-4px 4px 0 #fffdf3,-5px 5px 0 #cfc19c}
.pk-f::after,.pk-b::after{content:"";position:absolute;inset:0;pointer-events:none}
.pk-f::after{background:linear-gradient(90deg,rgba(0,0,0,.3),rgba(0,0,0,.07) 9%,rgba(0,0,0,0) 24%)}
.pk-b::after{background:linear-gradient(270deg,rgba(0,0,0,.3),rgba(0,0,0,.07) 9%,rgba(0,0,0,0) 24%)}
/* halaman meredup sebentar saat dibalik (ada kesan lengkung & bayangan) */
.pk-l.fl .pk-f,.pk-l.fl .pk-b{animation:pkbr 1s ease-in-out}
@keyframes pkbr{0%,100%{filter:none}45%{filter:brightness(.78)}}
/* sampul keras */
.pk-f.pk-cv{inset:-5px -5px -5px 0;box-shadow:2px 3px 0 #5e1a3a,4px 5px 0 rgba(31,58,95,.35)}.pk-b.pk-cv{inset:-5px 0 -5px -5px;box-shadow:-2px 3px 0 #5e1a3a,-4px 5px 0 rgba(31,58,95,.35)}
.pk-cv{padding:0;background:radial-gradient(circle,rgba(255,255,255,.2) 0 1.5px,transparent 2.5px) 0 0/14px 14px,linear-gradient(135deg,#dd5f90,#b23567);border-color:#5e1a3a;color:#fff6c8}
.pk-spn{position:absolute;left:0;top:0;bottom:0;width:13px;background:repeating-linear-gradient(0deg,#8f2a55 0 6px,#a63468 6px 12px);border-right:3px solid #5e1a3a}
.pk-b .pk-spn{left:auto;right:0;border-right:0;border-left:3px solid #5e1a3a}
.pk-frm{position:absolute;inset:10px 10px 10px 22px;border:3px solid #f2c14e;box-shadow:inset 0 0 0 3px #b23567,inset 0 0 0 5px #f2c14e;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:8px}
.pk-b .pk-frm{inset:10px 22px 10px 10px}
.pk-st{font:18px/1 VT323,monospace;letter-spacing:3px;color:#f2c14e}
.pk-cvt{font:14px/1.5 "Press Start 2P",monospace;background:#fff6c8;color:#1f3a5f;border:3px solid #1f3a5f;box-shadow:3px 3px 0 #5e1a3a;padding:8px 7px}.pk-cvt.pk-sm{font-size:11px}
.pk-mini{width:42px;height:52px;background:#fffdf3;border:2px solid #1f3a5f;transform:rotate(-7deg);box-sizing:border-box;padding:4px;margin:6px 0 2px;box-shadow:2px 2px 0 #5e1a3a}.pk-mini b{display:block;width:100%;height:68%;background:linear-gradient(135deg,#8fd0f0,#f4a6c0)}
.pk-cvs{font:20px/1.2 VT323,monospace;color:#fff6c8}
.pk-end{position:absolute;inset:9px;background:#fffdf3;border:2px dashed #c9507f;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:6px;color:#1f3a5f;font:19px/1.2 VT323,monospace;box-sizing:border-box}
/* foto di halaman: polaroid ditempel selotip */
.pk-pg{position:relative;flex:1 1 0;min-height:0;width:100%;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;transform:rotate(var(--r,0deg));transition:transform .2s}
.pk-pg:hover{transform:rotate(0) scale(1.03)}
.pk-pg::before{content:"";position:absolute;top:-5px;left:50%;width:38%;height:13px;margin-left:-19%;background:rgba(242,193,78,.85);border:1px dashed rgba(255,255,255,.75);transform:rotate(-4deg);z-index:2;box-shadow:1px 1px 0 rgba(31,58,95,.2)}
.pk-pg img{flex:1 1 0;min-height:0;width:100%;object-fit:contain;background:#fff;padding:5px;border:1px solid #d9cfb4;box-shadow:2px 3px 0 rgba(31,58,95,.25)}
.pk-pg small{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:17px}.pk-pg .pk-d{font-size:14px;opacity:.7}
.pk-bar{display:flex;gap:12px;justify-content:center;align-items:center;margin-top:2px}.pk-bar span{font:22px/1 VT323,monospace;min-width:54px;text-align:center}
.pg-bar{position:sticky;bottom:-18px;background:var(--cream);padding:8px 0 4px;margin-top:8px;z-index:2}.pg-bar .row{margin-top:0}

/* ---- PENAMPIL FOTO: polaroid digantung di tali ---- */
.pv-st{position:relative;border:4px solid var(--wood);background:repeating-linear-gradient(90deg,#e8f1fc 0 20px,#dbe8f7 20px 40px);box-shadow:inset 0 0 34px rgba(31,58,95,.2);padding:0 0 22px;overflow:hidden;touch-action:pan-y;user-select:none;-webkit-user-select:none}
.pv-rope{position:relative;height:8px;margin:16px 0 0;background:repeating-linear-gradient(135deg,#d2ad70 0 4px,#9a7843 4px 8px);box-shadow:0 3px 0 rgba(31,58,95,.28)}
.pv-rope::before,.pv-rope::after{content:"";position:absolute;top:-4px;width:12px;height:16px;background:#f2c14e;border:2px solid var(--ink)}
.pv-rope::before{left:8px}.pv-rope::after{right:8px}
.pv-z{perspective:1100px;filter:drop-shadow(4px 6px 0 rgba(31,58,95,.26));animation:pvin .6s cubic-bezier(.2,.8,.2,1)}
.pv-hang{width:max-content;max-width:calc(100% - 24px);margin:0 auto;transform-origin:50% 0;transform-style:preserve-3d;animation:pvsw 2.6s ease-out,pvidle 5s ease-in-out 2.6s infinite alternate}
.pv-kn{display:block;width:14px;height:14px;background:#f2c14e;border:2px solid var(--ink);border-radius:50%;margin:-8px auto 0;position:relative;z-index:2}
.pv-vs{display:block;width:100%;height:clamp(30px,7vh,50px);overflow:visible}
.pv-card{position:relative;background:#fffdf3;border:2px solid #cfc3a2;padding:12px 12px 0;transform-style:preserve-3d;transform:rotateX(var(--tx,0deg)) rotateY(var(--ty,0deg));transition:transform .15s ease-out}
.pv-card::before{content:"";position:absolute;inset:-2px;background:#d9cdac;border:2px solid #b7a97f;transform:translateZ(-8px)}
.pv-ph{position:relative;display:block;line-height:0;background:#fff;border:3px solid var(--ink)}
.pv-ph::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 35%,rgba(255,255,255,.3) 50%,transparent 65%);background-size:260% 100%;background-position:var(--gx,50%) 0}
.pv-img{display:block;max-width:100%;max-height:40vh;width:auto;height:auto;margin:0 auto;object-fit:contain}
.pv-cap{padding:8px 4px 11px;text-align:center;font:22px/1.1 VT323,monospace;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pv-pin{position:absolute;top:-15px;width:16px;height:32px;background:linear-gradient(90deg,#f2c14e 0 50%,#d8a73b 50%);border:2px solid var(--ink);z-index:3;transform:translateZ(5px)}
.pv-p1{left:8px}.pv-p2{right:8px}
@keyframes pvin{from{opacity:0;transform:translateY(-26px) scale(.72)}to{opacity:1;transform:none}}
@keyframes pvsw{0%{transform:rotate(9deg)}18%{transform:rotate(-6.5deg)}36%{transform:rotate(4.4deg)}54%{transform:rotate(-2.6deg)}72%{transform:rotate(1.3deg)}100%{transform:rotate(0)}}
@keyframes pvidle{from{transform:rotate(-.7deg)}to{transform:rotate(.7deg)}}
@media (prefers-reduced-motion:reduce){.pv-z,.pv-hang{animation:none!important}}
`;document.head.appendChild(cs)}
const q=s=>document.querySelector(s);
function openAlbum(){P.spread=0;start();renderGrid()}
function renderGrid(){
 P.view='grid';
 let body,wire=null;
 if(P.err)body=`<p style="font-size:22px">album belum bisa dibuka (${esc(P.err)}). ${P.err==='permission-denied'?'aturan Firestore untuk koleksi photos perlu dipasang dulu.':'coba lagi nanti.'}</p>`;
 else if(!P.loaded)body='<p style="font-size:22px">memuat album...</p>';
 else if(!P.list.length)body='<p style="font-size:22px">belum ada foto. bikin di photo booth, lalu tap "simpan ke galeri".</p>';
 else{
  /* urutan buku: sampul, sisi dalam sampul, foto TERLAMA dulu ... foto terbaru, (halaman kosong kalau ganjil), sisi dalam sampul belakang, sampul belakang */
  const asc=P.list.map((p,i)=>({t:'ph',i,p})).reverse();
  const pages=[{t:'cv'},{t:'in'}].concat(asc);if(asc.length%2)pages.push({t:'bl'});pages.push({t:'inb'},{t:'cvb'});
  const N=pages.length/2;P.spread=Math.max(0,Math.min(N,P.spread|0));const s0=P.spread;
  const face=g=>g.t==='ph'?`<div class="pk-pg" data-i="${g.i}" style="--r:${g.i%2?1.4:-1.4}deg"><img alt="" src="${esc(g.p.img)}"><small>${esc(nm(g.p))}</small><small class="pk-d">${esc(fd(dateOf(g.p)))}</small></div>`
   :g.t==='cv'?`<i class="pk-spn"></i><div class="pk-frm"><div class="pk-st">★ ★ ★</div><div class="pk-cvt">album<br>foto</div><div class="pk-mini"><b></b></div><div class="pk-cvs">${P.list.length} foto</div></div>`
   :g.t==='cvb'?'<i class="pk-spn"></i><div class="pk-frm"><div class="pk-st">★ ♥ ★</div><div class="pk-cvt pk-sm">sampai<br>jumpa</div><div class="pk-st">★ ★ ★</div></div>'
   :g.t==='in'?'<div class="pk-end"><div class="pk-st" style="color:#c9507f">♥</div>foto bareng<br>dari photo booth</div>'
   :g.t==='inb'?'<div class="pk-end"><div class="pk-st" style="color:#c9507f">♥</div>mau foto lagi?<br>cobain photo booth!</div>':'';
  const cls=g=>(g.t==='cv'||g.t==='cvb'||g.t==='in'||g.t==='inb')?' pk-cv':'';
  const shift=s=>s===0?'translateX(calc(var(--pw) * -.5))':s===N?'translateX(calc(var(--pw) * .5))':'none';
  /* tiap lembar punya kedalaman Z sendiri (tumpukan kertas sungguhan, bukan cuma z-index) */
  const tf=(k,s)=>k<s?`translateZ(${(k+1)*1.2}px) rotateY(-180deg)`:`translateZ(${(N-k)*1.2}px)`;
  let lv='';for(let k=0;k<N;k++)lv+=`<div class="pk-l" data-k="${k}" style="transform:${tf(k,s0)};z-index:${k<s0?k+1:N-k}"><div class="pk-f${cls(pages[2*k])}">${face(pages[2*k])}</div><div class="pk-b${cls(pages[2*k+1])}">${face(pages[2*k+1])}</div></div>`;
  body=`<div class="pk-w" id="pkw"><div class="pk-s"><div class="pk-t" id="pkt"><div class="pk${s0===0?' c0':s0===N?' cN':''}" id="pkb" style="transform:${shift(s0)}">${lv}</div></div></div></div><div class="pk-bar"><button class="btn alt" id="pkp">‹</button><span id="pki"></span><button class="btn alt" id="pkn">›</button></div><p style="font-size:17px;text-align:center;margin-top:4px">tap foto = besar · geser / tap halaman = balik</p>`;
  wire=()=>{
   const lvs=[...mb.querySelectorAll('.pk-l')],bkk=q('#pkb'),ind=q('#pki'),pv=q('#pkp'),nx=q('#pkn'),w=q('#pkw'),t3=q('#pkt');
   const set=(s,snd)=>{s=Math.max(0,Math.min(N,s));const o=P.spread;if(snd&&s!==o){try{SFX.click()}catch(e){}}P.spread=s;
    const a=Math.min(o,s),b=Math.max(o,s);
    lvs.forEach((l,k)=>{const from=tf(k,o),to=tf(k,s);l.style.transform=to;l.style.zIndex=k<s?k+1:N-k;
     if(k>=a&&k<b){l.classList.remove('fl');void l.offsetWidth;l.classList.add('fl');clearTimeout(l._t);l._t=setTimeout(()=>l.classList.remove('fl'),1100);
      /* balik kertas: terangkat dari tumpukan, melengkung di tengah, lalu mendarat */
      if(l.animate){const fw=k<s;try{if(l._a)l._a.cancel();
       l._a=l.animate([{transform:from,offset:0},{transform:`translateZ(46px) rotateY(${fw?-84:-96}deg) skewY(${fw?-5:5}deg)`,offset:.5},{transform:to,offset:1}],{duration:1000,easing:'cubic-bezier(.45,.05,.25,1)'})}catch(e){}}}});
    bkk.classList.toggle('c0',s===0);bkk.classList.toggle('cN',s===N);bkk.style.transform=shift(s);
    ind.textContent=(s+1)+'/'+(N+1);pv.disabled=s<=0;nx.disabled=s>=N};
   set(P.spread);
   pv.onclick=()=>set(P.spread-1,1);nx.onclick=()=>set(P.spread+1,1);
   /* buku sedikit miring mengikuti kursor (mouse saja) */
   w.onpointermove=e=>{if(e.pointerType==='touch')return;const r=w.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    t3.style.setProperty('--ry',(x*16).toFixed(1)+'deg');t3.style.setProperty('--rx',(9-y*10).toFixed(1)+'deg')};
   w.onpointerleave=()=>{t3.style.removeProperty('--ry');t3.style.removeProperty('--rx')};
   let x0=null,mv=false;w.onpointerdown=e=>{x0=e.clientX;mv=false};
   w.onpointerup=e=>{if(x0==null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>40){mv=true;set(P.spread+(dx<0?1:-1),1)}};
   w.onclick=e=>{if(mv){mv=false;return}const pg=e.target.closest('.pk-pg');
    if(pg)return openOne(+pg.dataset.i);
    if(e.target.closest('.pk-b'))set(P.spread-1,1);else if(e.target.closest('.pk-f'))set(P.spread+1,1)}}}
 openM(`<h2>album foto</h2><i id="pgm" hidden></i>${wire?'':`<p style="font-size:20px;margin-bottom:8px">${P.loaded&&!P.err?P.list.length+' foto dari photo booth':'foto dari photo booth'}</p>`}${body}`);
 if(wire)wire()}
function openOne(i){
 const n=P.list.length;if(!n)return openAlbum();
 i=((i%n)+n)%n;const p=P.list[i];P.view='one';P.curId=p.id;P.spread=Math.ceil((n-1-i+2)/2);
 const mine=p.by===did;
 openM(`<h2>${esc(nm(p))}</h2><i id="pgo" hidden></i>`+
  `<div class="pv-st" id="pvs"><div class="pv-rope"></div><div class="pv-z"><div class="pv-hang" id="pvh"><i class="pv-kn"></i>`+
  `<svg class="pv-vs" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path d="M50 0 L6 40 M50 0 L94 40" fill="none" stroke="#8a6a3a" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg>`+
  `<div class="pv-card" id="pvc"><i class="pv-pin pv-p1"></i><i class="pv-pin pv-p2"></i><span class="pv-ph"><img class="pv-img" id="pgi" src="${esc(p.img)}" alt=""></span><div class="pv-cap">${esc(fd(dateOf(p)))}</div></div>`+
  `</div></div></div>`+
  `<p class="from" style="text-align:center">${p.cap?esc(p.cap)+' · ':''}${n-i}/${n}</p><p id="pgmsg" style="font-size:20px;text-align:center"></p>`+
  `<div class="pg-bar"><div class="row"><button class="btn alt" id="pgp">‹</button><button class="btn alt" id="pgn">›</button><a class="btn" id="pgd" style="text-decoration:none" download="photobooth.jpg" href="${esc(p.img)}">download</a>${mine?'<button class="btn alt" id="pgx">hapus</button>':''}<button class="btn alt" id="pgb">album</button></div></div>`);
 q('#pgp').onclick=()=>openOne(i+1);q('#pgn').onclick=()=>openOne(i-1);q('#pgb').onclick=renderGrid;
 const st=q('#pvs'),cd=q('#pvc'),im=q('#pgi');
 /* ukuran foto dihitung dari ruang yang tersedia (tidak pernah melebihi modal) */
 const fit=()=>{if(!im.naturalWidth)return;const aw=st.clientWidth-24-24-4-6,ah=innerHeight*.40,k=Math.min(aw/im.naturalWidth,ah/im.naturalHeight);im.style.width=Math.max(60,Math.floor(im.naturalWidth*k))+'px'};
 if(im.complete&&im.naturalWidth)fit();else im.onload=fit;
 /* miring 3D + kilau mengikuti jari / kursor; geser kiri-kanan = foto berikutnya */
 let x0=null;
 st.onpointerdown=e=>{x0=e.clientX};
 st.onpointermove=e=>{const r=st.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
  cd.style.setProperty('--ty',((x-.5)*26).toFixed(1)+'deg');cd.style.setProperty('--tx',((.5-y)*18).toFixed(1)+'deg');cd.style.setProperty('--gx',Math.round(x*100)+'%')};
 st.onpointerleave=()=>{cd.style.removeProperty('--ty');cd.style.removeProperty('--tx');cd.style.removeProperty('--gx')};
 st.onpointerup=e=>{if(x0==null)return;const dx=e.clientX-x0;x0=null;if(Math.abs(dx)>50)openOne(i+(dx<0?-1:1))};
 const dx=q('#pgx');if(dx){let sure=false;dx.onclick=async()=>{
  if(!sure){sure=true;dx.textContent='yakin hapus?';return}
  dx.disabled=true;try{await fs.deleteDoc(fs.doc(db,COL,p.id));P.list=P.list.filter(z=>z.id!==p.id);refresh();renderGrid()}
  catch(e){dx.disabled=false;dx.textContent='hapus';const m=q('#pgmsg');if(m)m.textContent=(e&&e.code)==='permission-denied'?'hapus ditolak database (aturan Firestore).':'gagal menghapus.'}}}}
function refresh(){
 drawLab();SL.forEach((s,k)=>setSlot(k,P.list[k]));
 if(!ov.classList.contains('on'))return;
 if(P.view==='grid'&&q('#pgm'))renderGrid();
 else if(P.view==='one'&&q('#pgo')&&!P.list.some(p=>p.id===P.curId))renderGrid()}

/* muat data hanya setelah ruang kenangan dibuka (coba lagi tiap 30 dtk kalau gagal) + foto di tali bergoyang pelan */
{const _w=winFx;winFx=function(dt){_w(dt);try{if(!GR.visible)return;
 if(!P.started&&!P.pending&&Date.now()-P.t0>30000){P.t0=Date.now();start()}
 const t=performance.now()/1000;SL.forEach((s,k)=>{if(!s.g.visible)return;s.g.rotation.z=TILT[k]+Math.sin(t*1.15+k*1.9)*.022;s.g.rotation.y=Math.sin(t*.8+k*1.3)*.07})}catch(e){}}}

window.PHOTOS3D={save,openAlbum,state:P};
console.log('photos3d.js v6 (album buku 3D, foto polaroid bertali) loaded');
})();