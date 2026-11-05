/* perpus3d.js v1 — PERPUSTAKAAN RAHASIA
   Muat PALING AKHIR (setelah upgrade3d.js, dan setelah komplek3d.js / mart3d.js kalau ada):
     <script src="js/3d/perpus3d.js?v=1"></script>
   Cara kerja:
   - Di ruang utama, tap rak buku -> zoom rak (dari upgrade3d.js). Ada SATU buku hijau tua berpita emas (agak menonjol, berkilau tipis) di rak ke-2 dari bawah.
   - Tap buku itu = "narik buku": buku miring keluar, klik, rak berderit dan MENGAYUN terbuka seperti pintu, di belakangnya ada lorong hangat.
     Layar memudar -> masuk PERPUSTAKAAN RAHASIA (ruang 12, x = 540).
   - Di dalam: rak penuh buku, tangga, perapian, meja baca, globe, kucing tidur, surat rahasia, buku rahasia. Tombol "keluar" (atau tap pintu rak di dinding kanan) = balik ke ruang utama; rak menutup lagi.
   - TIDAK ada file lain yang diubah. Dipasang lewat window.winFx + goRoom milik room3d.js (lewat tombol lounge), sama seperti komplek3d.js.
   Uji cepat tanpa narik buku: buka Console (F12) lalu ketik  PERPUS.go()
   Mau ganti isi surat / buku / posisi buku rahasia? Lihat bagian EDIT. Bisa juga ditimpa dari index.html:  window.PERPUS_CFG={letter:{...}}  (sebelum script ini). */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof sh==='undefined'||typeof lact==='undefined'||typeof say3==='undefined'||
   typeof goalT==='undefined'||typeof cam==='undefined'||typeof cv==='undefined'||typeof lgb==='undefined'||typeof winFx!=='function'){
 console.warn('perpus3d.js: butuh room3d.js + upgrade3d.js (rak buku `sh`, zoom rak) — muat file ini PALING AKHIR');return}

/* ===== EDIT ===== */
const CFG=Object.assign({
 LX:540,            /* posisi dunia perpustakaan (lounge 40, galeri 80, 120-280 lantai2/teras, 360 kafe, 420 komplek, 480 mart) */
 ZOOM:1.25,         /* seberapa jauh kamera di dalam perpustakaan (makin besar = makin jauh) */
 PW:4,              /* batas geser kamera kiri-kanan */
 row:1.0,           /* tinggi alas rak tempat buku rahasia: 0.1 (paling bawah) / 1.0 / 1.9 / 2.8 */
 z:-.2,             /* posisi sepanjang rak, -1.1 .. 1.1 (diambil buku terdekat) */
 title:'LIBRARY',
 letter:{title:'surat rahasia',text:'selamat datang di perpustakaan rahasia, Aqsa.\n\nruangan ini cuma kamu yang tahu. semua buku di sini nunggu kamu baca pelan-pelan, kapan pun kamu mau.\n\nselamat ulang tahun. semoga tahun ini isinya cerita-cerita yang bagus.'},
 book:{title:'buku rahasia',text:'bab 1: sebuah rak yang bisa dibuka.\n\ndi balik rak itu ada ruangan hangat, kucing yang tidur, dan secangkir teh yang nggak pernah dingin.\n\nbab 2 belum ditulis. kamu yang nentuin isinya.'},
 whisper:['sssttt... ini rahasia ya','buku-bukunya wangi kertas tua','jangan berisik, nanti ketahuan'],
},window.PERPUS_CFG||{});

const LX=CFG.LX,PX='"Press Start 2P",monospace';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const ease=x=>1-Math.pow(1-x,3),cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const F2=window.F2||(window.F2={on:false,room:0,cx:120});
const sOn=()=>typeof SFX==='undefined'||!!SFX.on;

/* ---------- material & primitif ---------- */
const LMc={};const LM=(c,e)=>{const k=c+'|'+(e||'');return LMc[k]||(LMc[k]=new THREE.MeshLambertMaterial({color:c,emissive:e||'#000000'}))};
const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
const mt=c=>typeof c==='string'?LM(c):c;
const mesh=(geo,mat,x,y,z,p)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m};
const grp=(x,y,z,p,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;p.add(g);return g};
const box=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),mt(c),x,y,z,p);
const cyl=(rt,rb,h,c,x,y,z,p,sg)=>mesh(new THREE.CylinderGeometry(rt,rb,h,sg||14),mt(c),x,y,z,p);
const sph=(r,c,x,y,z,p)=>mesh(new THREE.SphereGeometry(r,12,9),mt(c),x,y,z,p);
const cone=(r,h,c,x,y,z,p,sg)=>mesh(new THREE.ConeGeometry(r,h,sg||8),mt(c),x,y,z,p);
const flat=(w,d,c,x,y,z,p)=>{const m=mesh(new THREE.PlaneGeometry(w,d),mt(c),x,y,z,p);m.rotation.x=-Math.PI/2;return m};
const tex=(c,px,rep)=>{const t=new THREE.CanvasTexture(c);if(px)t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t};
function cv2(w,h,fn,px,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);const t=tex(c,px,rep);t.userData={c,g,w,h,fn};
 if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{c.getContext('2d').clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true});return t}
const tplane=(w,h,t,x,y,z,p,ry,rx)=>{const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshLambertMaterial({map:t}),x,y,z,p);if(ry)m.rotation.y=ry;if(rx)m.rotation.x=rx;return m};
const bplane=(w,h,t,x,y,z,p,ry)=>{const m=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true}),x,y,z,p);if(ry)m.rotation.y=ry;return m};
const zone=(w,h,d,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),x,y,z,p);
const GLOW=cv2(64,64,(g,W,H)=>{const r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.45)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,W,H)});
const glow=(c,sz,x,y,z,p,op)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:GLOW,color:c,transparent:true,opacity:op==null?.8:op,blending:THREE.AdditiveBlending,depthWrite:false}));s.scale.set(sz,sz,1);s.position.set(x,y,z);s.raycast=()=>{};p.add(s);return s};
const rnd0=seed=>{let s=seed;return()=>(s=(s*16807)%2147483647)/2147483647};

/* ---------- buku-buku digabung jadi 1 mesh (ringan) ---------- */
const VC=THREE.VertexColors!==undefined?THREE.VertexColors:true;
function mergeBoxes(list){
 const P=[],N=[],C=[],I=[];let o=0;const col=new THREE.Color();
 list.forEach(b=>{col.set(b.c);const hx=b.w/2,hy=b.h/2,hz=b.d/2;
  [[1,0,0,[[hx,-hy,hz],[hx,-hy,-hz],[hx,hy,-hz],[hx,hy,hz]]],[-1,0,0,[[-hx,-hy,-hz],[-hx,-hy,hz],[-hx,hy,hz],[-hx,hy,-hz]]],
   [0,1,0,[[-hx,hy,hz],[hx,hy,hz],[hx,hy,-hz],[-hx,hy,-hz]]],[0,-1,0,[[-hx,-hy,-hz],[hx,-hy,-hz],[hx,-hy,hz],[-hx,-hy,hz]]],
   [0,0,1,[[-hx,-hy,hz],[hx,-hy,hz],[hx,hy,hz],[-hx,hy,hz]]],[0,0,-1,[[hx,-hy,-hz],[-hx,-hy,-hz],[-hx,hy,-hz],[hx,hy,-hz]]]
  ].forEach(([nx,ny,nz,q])=>{q.forEach(v=>{P.push(v[0]+b.x,v[1]+b.y,v[2]+b.z);N.push(nx,ny,nz);C.push(col.r,col.g,col.b)});I.push(o,o+1,o+2,o,o+2,o+3);o+=4})});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(P),3));g.setAttribute('normal',new THREE.BufferAttribute(new Float32Array(N),3));
 g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(C),3));g.setIndex(new THREE.BufferAttribute(new Uint16Array(I),1));return g}
const BKC=['#7b2a35','#2f5d46','#2a3f6b','#8a5a34','#5a3a6b','#a07a2c','#3b3b44','#6b3a2a','#d9cfae','#3f6b72','#8c3f2a'];
const BAND=['#d9b24c','#e8dcc0','#c9a14a'];

/* ======================================================================
   1) PERPUSTAKAAN (ruang 12)
   ====================================================================== */
const LIB=new THREE.Group();LIB.position.set(LX,0,0);S.add(LIB);LIB.visible=false;
const RX=5.4,Z0=-4.6,Z1=3.4,WH=5.2,ZC=(Z0+Z1)/2,DZ=Z1-Z0;
const anim={fire:[],flick:[],orbs:[],steam:[],dust:null,cat:null,globe:null,spin:0};

/* lantai kayu + karpet */
{const wood=cv2(128,128,g=>{for(let r=0;r<8;r++)for(let k=-1;k<3;k++){const x=(r*37)%64+k*64;g.fillStyle=['#5a3a22','#4d311c','#654226','#53371f'][(r+k+8)%4];g.fillRect(x,r*16,64,16);g.fillStyle='#2e1b0e';g.fillRect(x,r*16,64,1);g.fillRect(x,r*16,1,16)}},1,[5,4]);
 box(2*RX+.5,.3,DZ+.5,'#2b1a0e',0,-.16,ZC,LIB);tplane(2*RX,DZ,wood,0,0,ZC,LIB,0,-Math.PI/2);
 const rug=cv2(256,176,(g,W,H)=>{g.fillStyle='#d9b24c';g.fillRect(0,0,W,H);g.fillStyle='#6e2330';g.fillRect(6,6,W-12,H-12);g.fillStyle='#d9b24c';g.fillRect(16,16,W-32,H-32);g.fillStyle='#7b2a35';g.fillRect(20,20,W-40,H-40);
  for(let x=40;x<W-30;x+=26)for(let y=34;y<H-30;y+=26){g.fillStyle='#d9b24c';g.fillRect(x,y,6,6);g.fillStyle='#a8283a';g.fillRect(x+13,y+13,5,5)}},1);
 tplane(5.2,3.5,rug,0,.015,.25,LIB,0,-Math.PI/2)}

/* dinding: wallpaper hijau tua + panel kayu */
{const wp=cv2(64,64,g=>{g.fillStyle='#24402f';g.fillRect(0,0,64,64);g.fillStyle='#2c4c39';for(let x=0;x<64;x+=16)g.fillRect(x,0,8,64);g.fillStyle='#caa24a';for(let x=4;x<64;x+=16)for(let y=8;y<64;y+=16)g.fillRect(x,y,2,2)},1);
 const mk=(rx,ry)=>{const t=wp.clone();t.needsUpdate=true;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);t.magFilter=t.minFilter=THREE.NearestFilter;return new THREE.MeshLambertMaterial({map:t})};
 mesh(new THREE.BoxGeometry(2*RX+.5,WH,.3),mk(8,5),0,WH/2,Z0-.15,LIB);
 mesh(new THREE.BoxGeometry(.3,WH,DZ),mk(6,5),-RX-.15,WH/2,ZC,LIB);mesh(new THREE.BoxGeometry(.3,WH,DZ),mk(6,5),RX+.15,WH/2,ZC,LIB);
 box(2*RX+.5,.16,.5,'#3a2414',0,WH+.08,Z0-.1,LIB);box(.5,.16,DZ,'#3a2414',-RX-.1,WH+.08,ZC,LIB);box(.5,.16,DZ,'#3a2414',RX+.1,WH+.08,ZC,LIB);
 box(2*RX,.9,.1,'#4a2f1a',0,.45,Z0+.05,LIB);box(2*RX,.05,.14,'#d9b24c',0,.92,Z0+.05,LIB);
 box(.1,.9,DZ,'#4a2f1a',-RX+.05,.45,ZC,LIB);box(.1,.9,DZ,'#4a2f1a',RX-.05,.45,ZC,LIB)}

/* rak buku dinding (frame + papan + buku gabungan) */
function bookcase(cx,cz,ry,w,h,seed){const g=grp(cx,0,cz,LIB,ry),D=.55,rows=5,rnd=rnd0(seed),WD='#5a3a22',WD2='#3a2414';
 box(w,h,.05,WD2,0,h/2,-D/2+.03,g);[-1,1].forEach(s=>box(.12,h,D,WD,s*(w/2-.06),h/2,0,g));box(w+.1,.16,D+.06,WD,0,h+.02,0,g);box(w,.1,D,WD,0,.05,0,g);
 const rh=(h-.2)/rows,L=[];
 for(let r=0;r<rows;r++){const y0=.1+r*rh;box(w-.2,.08,D,WD,0,y0,0,g);let x=-w/2+.2;const end=w/2-.2,mh=rh-.14;
  while(x<end-.12){if(rnd()<.06){x+=.18+rnd()*.14;continue}
   const bw=.07+rnd()*.12,bh=mh*(.62+rnd()*.38),bd=D*(.62+rnd()*.2),c=BKC[(rnd()*BKC.length)|0];
   L.push({w:bw,h:bh,d:bd,x:x+bw/2,y:y0+.04+bh/2,z:-D/2+.06+bd/2,c});
   if(rnd()<.5)L.push({w:bw*1.04,h:.03,d:bd*1.02,x:x+bw/2,y:y0+.04+bh*.7,z:-D/2+.06+bd/2+.003,c:BAND[(rnd()*3)|0]});
   if(rnd()<.08){const lw=.08,lh2=bh*.95;L.push({w:lw,h:lh2,d:bd,x:x+bw+lw/2+.05,y:y0+.04+lh2/2,z:-D/2+.06+bd/2,c:BKC[(rnd()*BKC.length)|0]});x+=lw+.05}
   x+=bw+.006}}
 g.add(new THREE.Mesh(mergeBoxes(L),new THREE.MeshLambertMaterial({vertexColors:VC})));
 lact(g,()=>say3(g,pick(CFG.whisper)));return g}

/* kayu & bata perapian di tengah dinding belakang */
{const f=grp(0,0,Z0+.5,LIB);
 box(3.0,2.5,.9,'#7a6552',0,1.25,0,f);box(3.4,.2,1.15,'#4a2f1a',0,2.6,.05,f);box(3.5,.06,1.2,'#d9b24c',0,2.5,.06,f);
 flat(2.4,1.0,'#8a7a66',0,.02,1.2,f);box(2.6,.14,1.1,'#6e5d4b',0,.07,.95,f);
 mesh(new THREE.PlaneGeometry(1.6,1.35),BM('#0d0806'),0,.85,.455,f);
 box(.14,1.4,.12,'#5a4636',-.88,.8,.45,f);box(.14,1.4,.12,'#5a4636',.88,.8,.45,f);box(1.9,.14,.12,'#5a4636',0,1.5,.45,f);
 [-.12,.12].forEach(x=>{const lg=cyl(.1,.1,1.0,'#4a2f1a',0,.2+Math.abs(x)*.4,.5,f,8);lg.rotation.z=Math.PI/2;lg.rotation.y=x*2.4});
 [['#ff5a2a',.5,.9,-.35],['#ff9a3d',.62,1.1,0],['#ffd25a',.4,.75,.3]].forEach(([c,r,h,x],i)=>{const fl=mesh(new THREE.ConeGeometry(r*.5,h*.75,6),BM(c),x,.4+h*.3,.52,f);anim.fire.push({m:fl,i,h:h*.75})});
 const gl=glow('#ff8a3a',3.6,0,.9,.9,f,.7);anim.flick.push(gl);const gl2=glow('#ff8a3a',5.5,0,.8,1.4,f,.28);anim.flick.push(gl2);
 /* mantel: lilin, jam, buku */
 [-1.15,1.15].forEach((x,i)=>{cyl(.07,.07,.34,'#f4efe4',x,2.87,.05,f,10);const fl=cone(.04,.1,'#ffd25a',x,3.09,.05,f,5);fl.material=BM('#ffd25a');anim.fire.push({m:fl,i:i+3,h:.1,c:1});glow('#ffcf7a',.6,x,3.09,.05,f,.7)});
 box(.45,.5,.2,'#3a2414',0,2.95,0,f);box(.36,.36,.02,'#f4efe4',0,2.95,.11,f);box(.03,.14,.02,'#1d222c',0,2.98,.125,f);box(.1,.03,.02,'#1d222c',.03,2.93,.125,f);
 box(.5,.1,.3,'#2a3f6b',-.6,2.75,0,f);box(.45,.1,.28,'#7b2a35',-.6,2.85,0,f);
 /* papan nama di atas perapian */
 const nm=CFG.title.split(' '),l1=nm.slice(0,Math.ceil(nm.length/2)).join(' '),l2=nm.slice(Math.ceil(nm.length/2)).join(' ');
 const t=cv2(320,110,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=6;g.strokeRect(4,4,W-8,H-8);g.lineWidth=2;g.strokeRect(14,14,W-28,H-28);g.fillStyle='#f0cf6a';g.textAlign='center';g.textBaseline='middle';g.font='20px '+PX;g.fillText(l1,W/2,H/2-14);g.font='24px '+PX;g.fillText(l2,W/2,H/2+20)},1);
 bplane(3.0,1.03,t,0,3.9,-.4,f);box(3.1,1.13,.06,'#d9b24c',0,3.9,-.44,f);
 lact(f,()=>say3(f,pick(['hangat... perapiannya nyala terus','krek krek~ suara kayu terbakar','tempat paling nyaman se-rumah'])))}

bookcase(-3.15,Z0+.3,0,3.3,4.6,11);bookcase(3.15,Z0+.3,0,3.3,4.6,23);
const lcase=bookcase(-RX+.3,-1.95,Math.PI/2,4.2,4.6,37);bookcase(RX-.3,-2.3,-Math.PI/2,3.4,4.6,51);

/* tangga perpustakaan bersandar di rak kiri */
{const g=grp(-RX+1.35,0,-1.4,LIB,Math.PI/2);const W=.9,TN=Math.tan(.17);
 [-1,1].forEach(s=>{const r=box(.07,3.9,.07,'#a8743f',s*W/2,1.95,-1.95*TN,g);r.rotation.x=-.17});
 for(let i=0;i<8;i++){const y=.4+i*.46;box(W,.05,.1,'#c98b52',0,y,-(y*TN),g)}
 box(W+.1,.07,.1,'#d9b24c',0,3.75,-3.75*TN,g);[-1,1].forEach(s=>cyl(.05,.05,.07,'#d9b24c',s*W/2,.03,.05,g,8));
 lact(g,()=>say3(g,pick(['tangga rak, jangan dipanjat ya','buat ngambil buku yang paling atas'])))}

/* meja bulat + lampu baca + buku terbuka + cangkir */
{const t=grp(0,0,-.1,LIB);cyl(.85,.85,.09,'#6b4326',0,.85,0,t,24);cyl(.1,.16,.8,'#4a2f1a',0,.42,0,t,10);cyl(.45,.5,.08,'#4a2f1a',0,.04,0,t,16);
 cyl(.18,.2,.05,'#d9b24c',-.3,.92,-.1,t,12);cyl(.025,.025,.38,'#d9b24c',-.3,1.13,-.1,t,6);
 mesh(new THREE.CylinderGeometry(.12,.28,.2,12,1,true),new THREE.MeshLambertMaterial({color:'#2f7a45',emissive:'#1d5a30',side:THREE.DoubleSide}),-.3,1.36,-.1,t);
 glow('#ffe9a0',1.1,-.3,1.25,-.1,t,.65);glow('#ffe9a0',2.6,-.3,.95,-.1,t,.22);
 const cup=grp(.5,.9,-.3,t);cyl(.09,.07,.1,'#f4efe4',0,.05,0,cup,12);cyl(.075,.075,.01,'#7a4a2a',0,.1,0,cup,12);
 for(let i=0;i<3;i++)anim.steam.push(glow('#ffffff',.2,0,.2,0,cup,.3));
 lact(t,()=>say3(t,pick(['teh-nya masih anget','lampu hijau ini bikin betah baca'])));
 /* buku terbuka di atas meja (dipisah dari grup meja supaya tap-nya sendiri) */
 const bk=grp(.22,.91,.02,LIB);box(.33,.03,.42,'#7b2a35',-.17,0,0,bk);box(.33,.03,.42,'#7b2a35',.17,0,0,bk);box(.3,.03,.4,'#efe6cf',-.17,.03,0,bk).rotation.z=.06;box(.3,.03,.4,'#efe6cf',.17,.03,0,bk).rotation.z=-.06;
 for(let i=0;i<5;i++){box(.2,.002,.012,'#8a7a66',-.17,.05,-.12+i*.06,bk);box(.2,.002,.012,'#8a7a66',.17,.05,-.12+i*.06,bk)}
 zone(.7,.25,.5,0,.1,0,bk);lact(bk,()=>readModal(CFG.book.title,CFG.book.text))}

/* dua kursi tangan */
function armchair(x,z,ry,c,d){const g=grp(x,0,z,LIB,ry);box(1.15,.28,1.0,c,0,.4,0,g);box(1.15,1.0,.26,c,0,.95,-.46,g);[-1,1].forEach(s=>{box(.22,.5,1.0,d,s*.6,.55,.02,g);box(.26,.06,1.0,'#d9b24c',s*.6,.82,.02,g)});
 box(.9,.14,.8,d,0,.58,.08,g);[[-.5,-.45],[.5,-.45],[-.5,.45],[.5,.45]].forEach(([a,b])=>cyl(.05,.04,.18,'#3a2414',a,.09,b,g,6));
 lact(g,()=>say3(g,pick(['empuk banget','kursi paling enak buat baca'])));return g}
armchair(-2.5,.2,Math.PI/2,'#7b2a35','#5e1f2a');armchair(2.5,.2,-Math.PI/2,'#2f5d46','#234a38');

/* lampu lantai + meja kecil (kiri) */
{const g=grp(-3.55,0,1.2,LIB);cyl(.2,.24,.06,'#d9b24c',0,.03,0,g,12);cyl(.03,.03,2.0,'#d9b24c',0,1.0,0,g,6);
 mesh(new THREE.CylinderGeometry(.22,.38,.5,12,1,true),new THREE.MeshLambertMaterial({color:'#f6e3b0',emissive:'#ffcf7a',emissiveIntensity:.6,side:THREE.DoubleSide}),0,2.15,0,g);
 glow('#ffd98a',1.6,0,2.1,0,g,.7);glow('#ffd98a',3.4,0,1.2,0,g,.18);lact(g,()=>say3(g,'lampu baca, selalu nyala'))}

/* meja tulis + surat rahasia */
{const d=grp(-3.55,0,-3.2,LIB,Math.PI/2);box(1.6,.08,.8,'#6b4326',0,.85,0,d);[[-.7,-.3],[.7,-.3],[-.7,.3],[.7,.3]].forEach(([a,b])=>box(.08,.82,.08,'#4a2f1a',a,.41,b,d));
 box(1.4,.5,.04,'#5a3a22',0,.55,-.34,d);
 const l=grp(-.1,.9,0,d);const ppr=box(.5,.01,.38,'#fff6dc',0,0,0,l);ppr.rotation.y=.12;for(let i=0;i<5;i++)box(.34,.002,.015,'#8a7a66',-.02,.008,-.12+i*.06,l).rotation.y=.12;
 const sl=sph(.035,'#a8283a',.14,.016,.1,l);
 const q=grp(.45,.9,.15,d);const qs=cyl(.008,.008,.55,'#e8dcc0',0,.12,0,q,5);qs.rotation.z=.9;box(.04,.18,.004,'#f4efe4',.22,.28,0,q).rotation.z=-.6;
 cyl(.07,.06,.12,'#1c2438',.55,.06,-.2,d,10);
 glow('#ffe9a0',.5,-.1,1.0,0,d,.35);
zone(.7,.5,.6,-.1,1.0,0,d);lact(d,()=>readModal(CFG.letter.title,CFG.letter.text))}

/* globe */
{const g=grp(3.95,0,-3.0,LIB);cyl(.28,.32,.06,'#4a2f1a',0,.03,0,g,12);cyl(.04,.05,.9,'#d9b24c',0,.5,0,g,6);
 const gt=cv2(128,64,(c,W,H)=>{c.fillStyle='#2a5f9e';c.fillRect(0,0,W,H);c.fillStyle='#5aa65c';[[18,18,22,12],[50,26,18,16],[80,14,26,10],[96,38,16,12],[30,44,16,9],[64,48,22,7]].forEach(([x,y,w,h])=>{c.fillRect(x,y,w,h)});c.fillStyle='#e8f4ff';c.fillRect(0,0,W,4);c.fillRect(0,H-4,W,4)},1);
 const pv=grp(0,1.2,0,g);pv.rotation.z=.4;const gs=mesh(new THREE.SphereGeometry(.42,16,12),new THREE.MeshLambertMaterial({map:gt}),0,0,0,pv);anim.globe=gs;
 mesh(new THREE.TorusGeometry(.5,.025,6,24,Math.PI*1.7),LM('#d9b24c'),0,0,0,pv).rotation.y=Math.PI/2;
 lact(g,()=>{anim.spin=4;say3(g,pick(['wuuush~ dunia berputar','mau ke mana dulu?']))})}

/* kucing tidur di bantal */
{const g=grp(1.35,.02,1.35,LIB,-.5);cyl(.5,.5,.1,'#a8283a',0,.05,0,g,16);cyl(.46,.46,.03,'#d9b24c',0,.115,0,g,16).scale.y=.4;
 const body=sph(.32,'#efe2c8',0,.36,0,g);body.scale.set(1.2,.7,1);const head=sph(.2,'#efe2c8',.34,.32,.05,g);cone(.06,.12,'#4b3426',.4,.5,.12,g,4);cone(.06,.12,'#4b3426',.4,.5,-.02,g,4);
 box(.35,.1,.1,'#4b3426',-.32,.28,.1,g);sph(.07,'#4b3426',.4,.28,.17,g);anim.cat=body;
 lact(g,()=>say3(g,pick(['zzz... (Miko versi perpustakaan)','purr... purr...','jangan dibangunin~'])))}

/* melayang: bola cahaya + debu */
for(let i=0;i<4;i++){const o=grp(-1.4+i*.95,2.1,-.5+(i%2)*.4,LIB);sph(.07,i%2?'#bfe6ff':'#ffe9a0',0,0,0,o).material=BM(i%2?'#bfe6ff':'#ffe9a0');glow(i%2?'#8fd0f0':'#ffd98a',.7,0,0,0,o,.7);anim.orbs.push({g:o,y:2.1+(i%3)*.25,p:i*1.7})}
{const N=70,pos=new Float32Array(N*3),b=new Float32Array(N*3);for(let i=0;i<N;i++){b[i*3]=-RX+.6+Math.random()*(2*RX-1.2);b[i*3+1]=.4+Math.random()*3.8;b[i*3+2]=Z0+.8+Math.random()*(DZ-1.2)}
 pos.set(b);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const p=new THREE.Points(g,new THREE.PointsMaterial({color:'#ffe9b0',size:.07,transparent:true,opacity:.65,depthWrite:false}));p.frustumCulled=false;LIB.add(p);anim.dust={p,b,N}}

/* obor dinding */
[[-RX+.35,2.6,1.4,Math.PI/2],[RX-.35,2.6,-.1,-Math.PI/2]].forEach(([x,y,z,ry])=>{const s=grp(x,y,z,LIB,ry);box(.12,.5,.1,'#d9b24c',0,0,0,s);cyl(.06,.04,.2,'#f4efe4',0,.3,.1,s,8);const f=cone(.04,.12,'#ffd25a',0,.48,.1,s,5);f.material=BM('#ffd25a');anim.fire.push({m:f,i:7,h:.12,c:1});glow('#ffcf7a',.9,0,.45,.12,s,.7)});

/* pintu rak keluar (dinding kanan): sedikit terbuka, lorong hangat di baliknya */
const CORR=cv2(96,192,(g,W,H)=>{g.fillStyle='#0b0a10';g.fillRect(0,0,W,H);const vx=W/2,vy=H*.52;
 g.fillStyle='#1d1612';g.beginPath();g.moveTo(0,0);g.lineTo(vx-14,vy-28);g.lineTo(vx-14,vy+34);g.lineTo(0,H);g.fill();g.beginPath();g.moveTo(W,0);g.lineTo(vx+14,vy-28);g.lineTo(vx+14,vy+34);g.lineTo(W,H);g.fill();
 g.fillStyle='#2e2016';g.beginPath();g.moveTo(0,H);g.lineTo(vx-14,vy+34);g.lineTo(vx+14,vy+34);g.lineTo(W,H);g.fill();
 for(let i=0;i<7;i++){const y=vy+34+i*i*3.6+i*3,k=i/6;g.fillStyle=k%2?'#4a3220':'#3a281a';g.fillRect(vx-14-k*34,Math.min(y,H-4),28+k*68,3)}
 g.fillStyle='#2a1c12';for(let i=0;i<4;i++){const t=i/4,x=14+t*(vx-28),h=(1-t)*60+16;g.fillRect(x,vy-h,5,h*2);g.fillRect(W-x-5,vy-h,5,h*2)}
 const r=g.createRadialGradient(vx,vy,2,vx,vy,52);r.addColorStop(0,'rgba(255,214,130,1)');r.addColorStop(.4,'rgba(255,170,70,.55)');r.addColorStop(1,'rgba(255,150,50,0)');g.fillStyle=r;g.fillRect(0,0,W,H)},1);
const EXITG=grp(RX-.02,0,1.6,LIB,-Math.PI/2);
{const g=EXITG;bplane(1.9,3.3,CORR,0,1.65,.12,g);box(.2,3.5,.3,'#4a2f1a',-1.0,1.75,.12,g);box(.2,3.5,.3,'#4a2f1a',1.0,1.75,.12,g);box(2.2,.2,.3,'#4a2f1a',0,3.55,.12,g);box(2.0,.05,.34,'#d9b24c',0,3.42,.12,g);
 const hinge=grp(-.9,0,.18,g);hinge.rotation.y=-.85;const rnd=rnd0(77),L=[];box(1.7,3.3,.1,'#5a3a22',.85,1.65,0,hinge);
 for(let r=0;r<5;r++){const y0=.12+r*.64;let x=.14;while(x<1.55){const bw=.06+rnd()*.1,bh=.35+rnd()*.2;L.push({w:bw,h:bh,d:.2,x:x+bw/2,y:y0+bh/2+.04,z:.12,c:BKC[(rnd()*BKC.length)|0]});x+=bw+.006}box(1.6,.05,.22,'#a8743f',.85,y0,.1,hinge)}
 hinge.add(new THREE.Mesh(mergeBoxes(L),new THREE.MeshLambertMaterial({vertexColors:VC})));
 sph(.06,'#d9b24c',1.55,1.6,.12,hinge);glow('#ffcf7a',3.2,0,1.5,.5,g,.35);
 const sg=cv2(256,64,(c,W,H)=>{c.fillStyle='#1c2438';c.fillRect(0,0,W,H);c.strokeStyle='#d9b24c';c.lineWidth=6;c.strokeRect(3,3,W-6,H-6);c.fillStyle='#f0cf6a';c.font='22px '+PX;c.textAlign='center';c.textBaseline='middle';c.fillText('keluar',W/2,H/2+2)},1);
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:sg,transparent:true}));sp.scale.set(1.5,.38,1);sp.position.set(0,4.0,.3);sp.raycast=()=>{};g.add(sp);
 zone(2.2,3.6,1.2,0,1.8,.4,g);lact(g,()=>exitLib())}

/* ---------- modal baca ---------- */
function readModal(title,text){
 if(typeof SFX!=='undefined'&&SFX.click&&sOn())SFX.click();
 if(typeof openM==='function')openM('<h2>'+esc(title)+'</h2><p style="font-size:22px;line-height:1.35">'+esc(text).replace(/\n/g,'<br>')+'</p>');
 else say3(LIB,text.split('\n')[0])}

/* ======================================================================
   2) PINTU RAHASIA DI RUANG UTAMA: buku rahasia + rak mengayun + lorong
   ====================================================================== */
const P0=sh.position.clone(),R0=sh.rotation.y,HZ=-1.25,MAXA=1.75;
const par=sh.parent||S;
function setOpen(a){const th=R0+a,s0=Math.sin(R0),c0=Math.cos(R0),s=Math.sin(th),c=Math.cos(th);
 sh.position.x=P0.x+HZ*s0-HZ*s;sh.position.z=P0.z+HZ*c0-HZ*c;sh.position.y=P0.y;sh.rotation.y=th}
const door=new THREE.Group();door.position.copy(P0);door.rotation.y=R0;door.scale.copy(sh.scale);par.add(door);door.visible=false;
const dwy=cv2(128,256,(g,W,H)=>{g.fillStyle='#07060a';g.fillRect(0,0,W,H);const vx=W/2,vy=H*.5;
 g.fillStyle='#17110d';g.beginPath();g.moveTo(0,0);g.lineTo(vx-18,vy-36);g.lineTo(vx-18,vy+40);g.lineTo(0,H);g.fill();g.beginPath();g.moveTo(W,0);g.lineTo(vx+18,vy-36);g.lineTo(vx+18,vy+40);g.lineTo(W,H);g.fill();
 g.fillStyle='#2a1c12';g.beginPath();g.moveTo(0,H);g.lineTo(vx-18,vy+40);g.lineTo(vx+18,vy+40);g.lineTo(W,H);g.fill();
 for(let i=0;i<8;i++){const y=vy+40+i*i*3.3+i*3;g.fillStyle=i%2?'#5a3d26':'#46301e';g.fillRect(vx-18-i*8,Math.min(y,H-3),36+i*16,3)}
 g.fillStyle='#24180f';for(let i=0;i<4;i++){const t=i/4,x=10+t*(vx-34),h=(1-t)*80+20;g.fillRect(x,vy-h,6,h*2);g.fillRect(W-x-6,vy-h,6,h*2)}
 const r=g.createRadialGradient(vx,vy+6,2,vx,vy+6,70);r.addColorStop(0,'rgba(255,224,150,1)');r.addColorStop(.35,'rgba(255,176,80,.6)');r.addColorStop(1,'rgba(255,150,50,0)');g.fillStyle=r;g.fillRect(0,0,W,H)},1);
{const pl=new THREE.Mesh(new THREE.PlaneGeometry(1.9,2.95),new THREE.MeshBasicMaterial({map:dwy,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));pl.position.set(-.18,1.475,0);pl.rotation.y=Math.PI/2;door.add(pl);
 const FR='#4a2f1a';box(.16,3.1,.14,FR,-.22,1.55,-1.0,door);box(.16,3.1,.14,FR,-.22,1.55,1.0,door);box(.16,.16,2.14,FR,-.22,3.06,0,door);
 box(.18,.04,1.9,'#d9b24c',-.2,3.0,0,door);box(.34,.05,1.9,'#6e4a2a',-.12,.025,0,door);
 const sp=mesh(new THREE.PlaneGeometry(2.8,2.4),new THREE.MeshBasicMaterial({map:GLOW,color:'#ffb85a',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}),.95,.03,0,door);sp.rotation.x=-Math.PI/2;door.userData.spill=sp;
 const gl=glow('#ffcf7a',3.2,.1,1.5,0,door,0);door.userData.gl=gl}

/* buku rahasia: ganti satu buku biasa di rak (default rak ke-2 dari bawah) */
const SB={g:null,sp:null,hit:null,ok:false,base:null,h:0,d:0};
{let best=null;
 sh.children.forEach(m=>{const gp=m.geometry&&m.geometry.parameters;if(!gp||m.geometry.type!=='BoxGeometry')return;
  if(Math.abs(m.rotation.x)>.01||Math.abs(m.rotation.z)>.01)return;
  if(Math.abs(m.position.y-gp.height/2-CFG.row)>.03)return;
  if(gp.width===.4&&gp.height===.8&&Math.abs(gp.depth-.17)<.001)return;
  if(gp.width<.32||gp.width>.45||gp.height<.45||gp.height>.82||gp.depth<.1||gp.depth>.23)return;
  const sc=Math.abs(m.position.z-CFG.z)-gp.depth*.8;if(!best||sc<best.sc)best={m,gp,sc}});
 let d,h,w,x,y,z;
 if(best){const m=best.m,gp=best.gp;d=gp.width;h=gp.height;w=gp.depth;x=m.position.x;y=m.position.y-h/2;z=m.position.z;
  m.visible=false;sh.children.forEach(o=>{const q=o.geometry&&o.geometry.parameters;if(o!==m&&q&&q.width===.015&&Math.abs(o.position.z-z)<.003)o.visible=false})}
 else{d=.4;h=.7;w=.16;x=0;y=CFG.row;z=CFG.z}
 const g=new THREE.Group();g.position.set(x+d/2+.02,y,z);sh.add(g);
 box(d,h,w,'#2c5a44',-d/2,h/2,0,g);
 [.14,.86].forEach(k=>box(.012,.05,w*1.03,'#d9b24c',.004,h*k,0,g));box(.012,h*.3,w*.62,'#1c2438',.005,h*.5,0,g);box(.014,.07,w*.3,'#d9b24c',.008,h*.5,0,g);
 const sp=glow('#ffe9a0',.34,.06,h*.5,0,g,.5);
 const hit=zone(d+.1,h+.06,w+.1,-d/2,h/2,0,g);
 SB.g=g;SB.sp=sp;SB.hit=hit;SB.ok=true;SB.base=g.position.clone();SB.h=h;SB.d=d}

/* ======================================================================
   3) SUARA
   ====================================================================== */
let AC=null;const A=()=>{if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}if(AC.state==='suspended')AC.resume();return AC};
function thunk(){const a=A();if(!a||!sOn())return;const T=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type='square';o.frequency.setValueAtTime(190,T);o.frequency.exponentialRampToValueAtTime(55,T+.14);g.gain.setValueAtTime(.16,T);g.gain.exponentialRampToValueAtTime(.001,T+.18);o.connect(g);g.connect(a.destination);o.start(T);o.stop(T+.2)}
function creak(dur){const a=A();if(!a||!sOn())return;const T=a.currentTime,o=a.createOscillator(),l=a.createOscillator(),lg=a.createGain(),f=a.createBiquadFilter(),g=a.createGain();
 o.type='sawtooth';o.frequency.setValueAtTime(95,T);o.frequency.linearRampToValueAtTime(58,T+dur);l.frequency.value=7;lg.gain.value=9;l.connect(lg);lg.connect(o.frequency);
 f.type='lowpass';f.frequency.value=420;g.gain.setValueAtTime(.0001,T);g.gain.linearRampToValueAtTime(.07,T+.25);g.gain.setValueAtTime(.07,T+dur-.35);g.gain.linearRampToValueAtTime(.0001,T+dur);
 o.connect(f);f.connect(g);g.connect(a.destination);o.start(T);l.start(T);o.stop(T+dur+.05);l.stop(T+dur+.05)}
function chime(){const a=A();if(!a||!sOn())return;[523,659,784,1047].forEach((fr,i)=>{const T=a.currentTime+i*.11,o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.value=fr;g.gain.setValueAtTime(.0001,T);g.gain.linearRampToValueAtTime(.09,T+.02);g.gain.exponentialRampToValueAtTime(.0001,T+.7);o.connect(g);g.connect(a.destination);o.start(T);o.stop(T+.75)})}

/* ======================================================================
   4) NAVIGASI
   ====================================================================== */
const barEl=document.getElementById('bar');
const fd=document.createElement('div');fd.style.cssText='position:fixed;inset:0;background:#0b0a10;opacity:0;pointer-events:none;transition:opacity .3s;z-index:31';document.body.appendChild(fd);
const st=document.createElement('style');st.textContent='body.perpusseq [style*="34vh"],body.perpusseq button[style*="max-content"],body.perpusseq div.px[style*="max-content"]{display:none!important}';document.head.appendChild(st);
const btnBack=document.createElement('button');btnBack.className='btn alt';btnBack.textContent='keluar';btnBack.style.display='none';btnBack.onclick=()=>exitLib();if(barEl)barEl.prepend(btnBack);
let CUR=0,busy=false,saved=[],lgbD='',mainDist=0,mainYaw=null,mainPit=null,pendZ=0,wasZoom=false,doorOn=false,pd=0,sc=0,exitFix=0,prevF2=null,prevMode=null;
const quiet=()=>{if(typeof sayEl!=='undefined'&&sayEl)sayEl.style.display='none'};
const trans=fn=>{if(busy)return;busy=true;fd.style.opacity=1;setTimeout(()=>{try{fn()}finally{fd.style.opacity=0;setTimeout(()=>{busy=false},320)}},330)};
/* catat jarak kamera ruang utama tepat sebelum zoom rak */
/* mainDist/yaw/pit dicatat tiap frame di step() selama kamera NORMAL (bukan zoom rak) — jadi nilainya nggak ikut ter-zoom */
try{new MutationObserver(()=>{wasZoom=document.body.classList.contains('shelfzoom')}).observe(document.body,{attributes:true,attributeFilter:['class']})}catch(e){}
function hideBar(){saved=[];if(barEl)[...barEl.children].forEach(b=>{if(b===btnBack)return;const t=(b.textContent||'').trim().toLowerCase();if(/^(sapa|radio|sfx)/.test(t))return;saved.push([b,b.style.display]);b.style.display='none'})}
function restoreBar(){saved.forEach(([b,d])=>{b.style.display=d});saved=[]}
function enterLib(fromSeq){
 if(!CUR){prevF2={on:F2.on,room:F2.room,cx:F2.cx,pc:F2.pc,pw:F2.pw};prevMode=(typeof mode!=='undefined')?mode:null}
 CUR=1;S.children.forEach(o=>{if(!o.isLight)o.visible=(o===LIB)});
 mode=1;F2.on=true;F2.room=3;F2.cx=LX;F2.pc=0;F2.pw=CFG.PW;
 if(typeof dist==='number'){
  if(fromSeq&&mainDist){dist=mainDist;if(mainYaw!=null)yaw=mainYaw;if(mainPit!=null)pit=mainPit;pendZ=2}   /* biar efek 'kembali dari zoom rak' (upgrade3d.js) selesai dulu, baru zoom perpustakaan dipasang */
  else dist=Math.min(40,(mainDist||dist)*CFG.ZOOM)}
 goalT.set(LX,2.2,0);if(typeof tgt!=='undefined'&&tgt&&tgt.copy)tgt.copy(goalT);
 lgbD=lgb.style.display;hideBar();lgb.style.display='none';btnBack.style.display='';btnBack.textContent='keluar';
 const sk=document.getElementById('sticky');if(sk)sk.style.display='none';quiet();chime()}
function resetShelf(){setOpen(0);sh.position.copy(P0);sh.rotation.y=R0;doorOn=false;door.visible=false;
 if(SB.ok){SB.g.rotation.z=0;SB.g.position.copy(SB.base)}
 door.userData.spill.material.opacity=0;door.userData.gl.material.opacity=0}
function exitLib(){trans(()=>{
 CUR=0;pendZ=0;
 if(prevF2){F2.on=false;F2.room=prevF2.room||0;F2.cx=prevF2.cx;F2.pc=prevF2.pc||0;F2.pw=prevF2.pw||0}else{F2.on=false;F2.room=0;F2.pc=0;F2.pw=0}
 if(typeof mode!=='undefined'&&prevMode!=null)mode=prevMode;
 const fixCam=()=>{if(typeof dist==='number'){if(mainDist)dist=mainDist;else dist=dist/CFG.ZOOM}
  if(mainYaw!=null&&typeof yaw==='number')yaw=mainYaw;if(mainPit!=null&&typeof pit==='number')pit=mainPit};
 fixCam();
 try{if(typeof room!=='undefined')room=1;if(lgb.onclick)lgb.onclick();else if(typeof goRoom==='function')goRoom(0)}catch(e){console.warn('perpus3d: keluar',e)}
 fixCam();exitFix=4;   /* pasang ulang beberapa frame, kalau goRoom() menimpa jarak kamera */
 LIB.visible=false;resetShelf();restoreBar();btnBack.style.display='none';lgb.style.display=lgbD;quiet()})}
function goDirect(){trans(()=>{enterLib(false)})}

/* ---------- urutan narik buku -> rak terbuka -> masuk ---------- */
const SEQ={on:false,t:0,fade:false,click:false,creak:false,done:false};
function startSeq(){if(SEQ.on||busy||!SB.ok)return;SEQ.on=true;SEQ.t=0;SEQ.fade=SEQ.click=SEQ.creak=SEQ.done=false;document.body.classList.add('perpusseq');quiet()}
function stepSeq(dt){if(!SEQ.on)return;SEQ.t+=dt;const t=SEQ.t;
 /* 0-.55 : buku ditarik miring */
 if(t<1.1){const u=ease(cl(t/.55,0,1));SB.g.rotation.z=-.5*u;SB.g.position.x=SB.base.x+.1*u;
  if(!SEQ.click&&t>.5){SEQ.click=true;thunk()}}
 /* 1.0-3.1 : rak mengayun terbuka */
 if(t>=1.0&&t<3.2){if(!SEQ.creak){SEQ.creak=true;creak(2.1)}
  const u=ease(cl((t-1.0)/2.1,0,1));setOpen(MAXA*u);
  if(u>.04&&!doorOn){doorOn=true;door.visible=true}
  door.userData.spill.material.opacity=u*.9;door.userData.gl.material.opacity=u*.7}
 else if(t<1.0&&t>.55){const k=Math.sin(t*90)*.0025*cl((1-Math.abs(t-.8)/.25),0,1);sh.position.z=P0.z+k}
 if(t>=3.2&&t<3.5){setOpen(MAXA)}
 if(t>=3.5&&!SEQ.fade){SEQ.fade=true;fd.style.opacity=1}
 if(t>=3.85&&!SEQ.done){SEQ.done=true;
  window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));      /* keluar dari zoom rak (upgrade3d.js) */
  document.body.classList.remove('perpusseq');SEQ.on=false;
  enterLib(true);setTimeout(()=>{fd.style.opacity=0},120)}}

/* ---------- tap buku rahasia saat zoom rak (di-capture di window supaya didahulukan dari upgrade3d.js) ---------- */
const rcl=new THREE.Raycaster(),nd=new THREE.Vector2();let dn=null;
const legendHidden=()=>{const e=[...document.body.children].find(x=>x.tagName==='DIV'&&x.style&&x.style.maxHeight==='34vh');return !!e&&getComputedStyle(e).display==='none'};
const shelfOn=()=>document.body.classList.contains('shelfzoom')&&!CUR&&!legendHidden();
addEventListener('pointerdown',e=>{if(e.target===cv)dn={x:e.clientX,y:e.clientY,m:0}},true);
addEventListener('pointermove',e=>{if(dn&&e.target===cv){dn.m+=Math.abs(e.clientX-dn.x)+Math.abs(e.clientY-dn.y);dn.x=e.clientX;dn.y=e.clientY}},true);
addEventListener('pointerup',e=>{if(e.target!==cv)return;const d=dn;dn=null;
 if(SEQ.on){e.stopImmediatePropagation();e.stopPropagation();return}
 if(!d||d.m>=8||!SB.ok||!shelfOn()||!SB.g.visible)return;
 const r=cv.getBoundingClientRect();nd.set((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height*2-1));rcl.setFromCamera(nd,cam);
 if(rcl.intersectObject(SB.hit,false).length){e.stopImmediatePropagation();e.stopPropagation();startSeq()}},true);

/* ======================================================================
   5) ANIMASI
   ====================================================================== */
function step(dt){
 /* rak/pintu/LIB jangan ikut dinyalakan ulang oleh goRoom() */
 door.visible=doorOn&&!CUR;LIB.visible=(CUR===1);
 const t=performance.now()/1000;
 if(!CUR&&!SEQ.on&&!exitFix&&typeof dist==='number'&&!(F2&&F2.on)&&!document.body.classList.contains('shelfzoom')&&(typeof curRoom==='undefined'||curRoom===0)){
  mainDist=dist;if(typeof yaw==='number')mainYaw=yaw;if(typeof pit==='number')mainPit=pit}
 if(exitFix>0&&!CUR){exitFix--;if(typeof dist==='number'&&mainDist)dist=mainDist;if(mainYaw!=null&&typeof yaw==='number')yaw=mainYaw;if(mainPit!=null&&typeof pit==='number')pit=mainPit}
 if(SB.ok&&!SEQ.on&&!CUR)SB.sp.material.opacity=.25+.3*Math.abs(Math.sin(t*1.6));
 stepSeq(dt);
 if(!CUR)return;
 if(pendZ>0){pendZ--;if(!pendZ&&typeof dist==='number')dist=Math.min(40,(mainDist||dist)*CFG.ZOOM)}
 anim.fire.forEach(f=>{const k=.8+Math.sin(t*(11+f.i*2)+f.i)*.22+Math.sin(t*23+f.i*5)*.08;f.m.scale.set(1,k,1);if(!f.c)f.m.position.y=.4+f.h*.5*k-(f.h*.1)});
 anim.flick.forEach((g,i)=>{g.material.opacity=(i?.22:.62)+Math.sin(t*9+i*3)*.08+Math.sin(t*17)*.05});
 anim.orbs.forEach((o,i)=>{o.g.position.y=o.y+Math.sin(t*.9+o.p)*.18;o.g.position.x+=Math.sin(t*.4+o.p)*.0015;o.g.position.z+=Math.cos(t*.35+o.p)*.0015});
 anim.steam.forEach((s,i)=>{const u=(t*.45+i*.33)%1;s.position.y=.18+u*.5;s.position.x=Math.sin(t*2+i)*.03;s.material.opacity=(1-u)*.35;s.scale.setScalar(.14+u*.2)});
 if(anim.cat){const b=1+Math.sin(t*1.8)*.04;anim.cat.scale.set(1.2,.7*b,1)}
 if(anim.globe){anim.globe.rotation.y+=dt*(.25+anim.spin);anim.spin=Math.max(0,anim.spin-dt*1.6)}
 if(anim.dust){const a=anim.dust.p.geometry.attributes.position.array,b=anim.dust.b;for(let i=0;i<anim.dust.N;i++){a[i*3]=b[i*3]+Math.sin(t*.25+i)*.35;a[i*3+1]=b[i*3+1]+Math.sin(t*.4+i*1.7)*.25;a[i*3+2]=b[i*3+2]+Math.cos(t*.22+i*.6)*.3}anim.dust.p.geometry.attributes.position.needsUpdate=true}}
{const _w=winFx;winFx=function(dt){_w(dt);try{step(dt)}catch(e){console.warn('perpus3d',e)}}}

window.PERPUS={go:goDirect,exit:exitLib,pull:startSeq,cfg:CFG,
 /* untuk cek posisi buku rahasia: PERPUS.where() */
 where:()=>SB.ok?{x:SB.base.x,y:SB.base.y,z:SB.base.z}:null};
console.log('perpus3d.js v1 (perpustakaan rahasia: tarik buku hijau di rak) loaded');
})();