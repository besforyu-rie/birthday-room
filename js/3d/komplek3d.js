/* komplek3d.js v1 — KAFE PRIBADI (kanan teras) + KOMPLEK PERUMAHAN MEWAH (depan teras) + TANGGA PUTIH keluar rumah.
   Taruh sefolder dengan outdoor3d.js, muat PALING AKHIR (setelah outdoor3d.js / interact3d.js / guestbook3d.js):
     <script src="js/3d/komplek3d.js?v=1"></script>
   Cara kerja (outdoor3d.js TIDAK diubah, semua dipasang dari file ini):
   - TERAS: balustrade depan dibuka di tengah -> tangga marmer putih turun ke halaman depan -> gerbang emas. Tap tangga = keluar ke KOMPLEK.
            balustrade sisi kanan dibuka -> gerbang besi bertanda "kafe". Tap gerbang = masuk KAFE.
   - KAFE   : kafe pribadi (pergola, bar marmer + mesin espresso, etalase kue, meja bundar, sofa, lampu gantung, bunting ultah). Tombol "teras" untuk kembali.
   - KOMPLEK: jalan komplek mewah: minimarket (Royal Mart), mansion tetangga, gerbang + tangga putih "rumah Aqsa", pos satpam, taman + air mancur, mobil lewat.
              Tap gerbang/tangga "rumah Aqsa" atau tombol "teras" untuk kembali.
   v2: tap minimarket Royal Mart = MASUK ke interiornya (mart3d.js, ruang 11). komplek3d.js membuka API window.KOMP untuk itu.
   Siang/malam mengikuti tombol lampu di ruang utama (malam: lampu jalan, jendela, lampu mobil menyala hangat).
   Mau geser / ubah ukuran? Lihat bagian EDIT di bawah.
   CATATAN: di kafe (ruang 9) & komplek (ruang 10) avatar pemain bisa berjalan ke benda yang di-tap; jalan, rintangan, tempat duduk & titik berdiri diatur di ROOMS[9] / ROOMS[10] dalam interact3d.js
   (KX & MX di bawah harus sama dengan KAF_X & KOM_X di interact3d.js). */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof lh==='undefined'||typeof lact==='undefined'||typeof say3==='undefined'||
   typeof goalT==='undefined'||typeof lgb==='undefined'||typeof LG==='undefined')return;
const TER=S.children.find(o=>o.isGroup&&o.position.x===280&&o.position.y===0&&o.position.z===0);
if(!TER){console.warn('komplek3d.js: teras (outdoor3d.js) tidak ditemukan — muat file ini SETELAH outdoor3d.js');return}

/* ===== EDIT ===== */
const KX=360,MX=420;          /* posisi dunia kafe & komplek (lounge 40, teras 280, taman 320 sudah terpakai) */
const ZK=1.45,ZM=1.85;        /* kamera dijauhkan segini kali di kafe / komplek (supaya area yang lebar muat) */
const GAPX=1.65;              /* setengah lebar bukaan tangga di balustrade depan teras */
const CZ=.5,GAPZ=.9;          /* posisi z & setengah lebar bukaan gerbang kafe di sisi kanan teras */
const YG=-.75;                /* tinggi halaman depan di bawah lantai teras */

console.log('komplek3d.js v2.2 (model rumah Aqsa 2 lantai <-> rumah tetangga ditukar) loaded');
const F2=window.F2||(window.F2={on:false,room:0,cx:120});
const PX='"Press Start 2P",monospace';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
const LMc={};const LM=(c,e)=>{const k=c+'|'+(e||'');return LMc[k]||(LMc[k]=new THREE.MeshLambertMaterial({color:c,emissive:e||'#000000'}))};
const mt=c=>typeof c==='string'?LM(c):c;
const MARB=LM('#f4efe4'),MARB2=LM('#e3dccb'),GOLD=LM('#d9b24c','#4a3a0c'),IRON=LM('#1d222c'),NAVY=LM('#1f2f4f'),PIER=LM('#e9e1cf'),LEAF=LM('#2f7a45');
const GLASS=new THREE.MeshLambertMaterial({color:'#bfe0f2',transparent:true,opacity:.35,depthWrite:false});

/* ---------- primitif ---------- */
const mesh=(geo,mat,x,y,z,p)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m};
const grp=(x,y,z,p,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;p.add(g);return g};
const box=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),mt(c),x,y,z,p);
const cyl=(rt,rb,h,c,x,y,z,p,sg)=>mesh(new THREE.CylinderGeometry(rt,rb,h,sg||14),mt(c),x,y,z,p);
const sph=(r,c,x,y,z,p)=>mesh(new THREE.SphereGeometry(r,12,9),mt(c),x,y,z,p);
const cone=(r,h,c,x,y,z,p,sg)=>mesh(new THREE.ConeGeometry(r,h,sg||8),mt(c),x,y,z,p);
const tor=(R,t,c,x,y,z,p,rx,ry,arc)=>{const m=mesh(new THREE.TorusGeometry(R,t,6,24,arc||Math.PI*2),mt(c),x,y,z,p);m.rotation.x=rx||0;m.rotation.y=ry||0;return m};
const flat=(w,d,c,x,y,z,p)=>{const m=mesh(new THREE.PlaneGeometry(w,d),mt(c),x,y,z,p);m.rotation.x=-Math.PI/2;return m};
const wallp=(w,h,c,x,y,z,p,ry)=>{const m=mesh(new THREE.PlaneGeometry(w,h),mt(c),x,y,z,p);if(ry)m.rotation.y=ry;return m};
const zone=(w,h,d,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),x,y,z,p);
/* prisma segitiga (pediment): lebar w, tinggi h, tebal d, dasar di yb */
const prism=(w,h,d,c,x,yb,z,p)=>{const m=mesh(new THREE.CylinderGeometry(1,1,1,3),mt(c),x,yb+h/3,z,p);m.rotation.x=-Math.PI/2;m.scale.set(w/1.7320508,d,h/1.5);return m};
/* atap limas (piramida) */
const pyr=(w,d,h,c,x,yb,z,p)=>{const g=new THREE.ConeGeometry(1,1,4);g.rotateY(Math.PI/4);const m=mesh(g,mt(c),x,yb+h/2,z,p);m.scale.set(w/1.4142136,h,d/1.4142136);return m};
const balGeo=new THREE.LatheGeometry([[.07,0],[.07,.05],[.045,.12],[.045,.2],[.08,.32],[.085,.4],[.07,.48],[.045,.58],[.045,.76],[.07,.84],[.07,.9]].map(a=>new THREE.Vector2(a[0],a[1])),10);
const balu=(x,y,z,p,sc)=>{const m=mesh(balGeo,MARB,x,y,z,p);if(sc)m.scale.setScalar(sc);return m};

/* ---------- tekstur ---------- */
function cvTex(w,h,fn,px,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 if(px)t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 const d=()=>{g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true};d();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(d);return t}
const haloTex=cvTex(64,64,(g,W,H)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,225,150,.95)');r.addColorStop(.35,'rgba(255,200,110,.35)');r.addColorStop(1,'rgba(255,190,90,0)');g.fillStyle=r;g.fillRect(0,0,W,H)});
function signTex(txt,ar){return cvTex(256,64,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);g.lineWidth=1.5;g.strokeRect(10,10,W-20,H-20);
 g.fillStyle='#f0cf6a';g.font='16px '+PX;g.textAlign='left';g.textBaseline='middle';g.fillText(txt,22,H/2+2);
 if(ar){g.beginPath();if(ar==='down'){g.moveTo(212,18);g.lineTo(240,18);g.lineTo(226,44)}else if(ar==='up'){g.moveTo(212,44);g.lineTo(226,18);g.lineTo(240,44)}
  else if(ar==='right'){g.moveTo(214,16);g.lineTo(214,48);g.lineTo(242,32)}else{g.moveTo(242,16);g.lineTo(242,48);g.lineTo(214,32)}g.fill()}})}
const spr=(tex,x,y,z,p,sc)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));s.scale.set(1.9*(sc||1),.48*(sc||1),1);s.position.set(x,y,z);s.raycast=()=>{};p.add(s);return s};
/* papan datar bertekstur kanvas (bahan basic = tetap terang, jadi seperti papan menyala) */
const board=(wm,hm,tw,th,fn,x,y,z,p,ry)=>{const m=mesh(new THREE.PlaneGeometry(wm,hm),new THREE.MeshBasicMaterial({map:cvTex(tw,th,fn)}),x,y,z,p);if(ry)m.rotation.y=ry;return m};

/* ---------- cahaya malam ---------- */
const glows=[],glass=[],halos=[];
const halo=(x,y,z,p,s)=>{const h=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
 h.scale.set(s||1.5,s||1.5,1);h.position.set(x,y,z);h.raycast=()=>{};p.add(h);halos.push(h);return h};
const glowBox=(w,h,d,x,y,z,p)=>{const m=mesh(new THREE.BoxGeometry(w,h,d),BM('#f4e6b8'),x,y,z,p);glows.push(m);return m};
const glassPane=(w,h,x,y,z,p,ry)=>{const m=mesh(new THREE.PlaneGeometry(w,h),BM('#a9cbe6'),x,y,z,p);if(ry)m.rotation.y=ry;glass.push(m);return m};
function lamp(p,x,y0,z,h){const l=grp(x,y0,z,p);box(.34,.2,.34,IRON,0,.1,0,l);cyl(.04,.07,h,IRON,0,h/2+.1,0,l,8);glowBox(.3,.4,.3,0,h+.3,0,l);box(.42,.07,.42,GOLD,0,h+.55,0,l);cone(.28,.2,GOLD,0,h+.7,0,l,4).rotation.y=Math.PI/4;halo(0,h+.3,0,l,1.9);return l}
function tree(p,x,z,sc,y0){const t=grp(x,y0||0,z,p);cyl(.14*sc,.2*sc,1.6*sc,'#5a3b22',0,.8*sc,0,t,8);const cs=['#3f9150','#4fa05a','#5fb86a','#479a57'];
 [[0,2.1,0,.9],[.5,2.5,.1,.6],[-.45,2.4,-.1,.55],[.1,2.9,.05,.5],[-.2,1.8,.4,.5],[.3,1.9,-.4,.5]].forEach(([a,b,c,r],i)=>sph(r*sc,cs[i%4],a*sc,b*sc,c*sc,t));return t}
function hedge(p,x,z,w,d,h){box(w,h||1.1,d,LEAF,x,(h||1.1)/2,z,p);const n=Math.max(2,Math.round(w/.7));for(let i=0;i<n;i++)sph(.32,LEAF,x-w/2+.35+i*(w-.7)/(n-1),(h||1.1)+.02,z,p)}
function urn(p,x,y0,z,sc){const u=grp(x,y0,z,p);box(.5*sc,.12*sc,.5*sc,MARB,0,.06*sc,0,u);cyl(.12*sc,.2*sc,.35*sc,MARB,0,.3*sc,0,u,12);sph(.3*sc,MARB,0,.6*sc,0,u);tor(.27*sc,.02*sc,GOLD,0,.92*sc,0,u,Math.PI/2);sph(.34*sc,'#3a8a47',0,1.3*sc,0,u);sph(.2*sc,'#4fa05a',0,1.68*sc,0,u);return u}
function bench(p,x,z,ry,y0){const b=grp(x,y0||0,z,p,ry);box(1.6,.1,.5,WOOD(),0,.55,0,b);box(1.6,.5,.08,WOOD(),0,.9,-.22,b);[-.7,.7].forEach(s=>box(.08,.55,.45,GOLD,s,.27,0,b));return b}
function WOOD(){return LM('#a8743f')}
function chair(p,x,z,ry,col){const c=grp(x,0,z,p,ry);box(.6,.08,.6,col||NAVY,0,.52,0,c);[[-.26,-.26],[.26,-.26],[-.26,.26],[.26,.26]].forEach(([a,b])=>cyl(.03,.04,.5,GOLD,a,.25,b,c,8));box(.6,.7,.08,col||NAVY,0,.9,-.27,c);box(.64,.05,.1,GOLD,0,1.27,-.27,c);return c}
function person(p,x,z,o){const g=grp(x,0,z,p);box(.16,.5,.18,o.pants||'#2a3a52',-.1,.25,0,g);box(.16,.5,.18,o.pants||'#2a3a52',.1,.25,0,g);box(.4,.5,.24,o.shirt,0,.75,0,g);
 if(o.apron)box(.34,.42,.04,'#f4efe4',0,.66,.14,g);box(.3,.3,.28,'#f2d0a9',0,1.15,0,g);box(.32,.12,.3,o.hair||'#2a1a10',0,1.32,0,g);box(.03,.05,.02,'#222',-.07,1.17,.15,g);box(.03,.05,.02,'#222',.07,1.17,.15,g);
 if(o.cap){box(.36,.1,.34,o.cap,0,1.43,0,g);box(.36,.03,.16,o.cap,0,1.38,.2,g)}
 const mk=s=>{const a=grp(s*.27,.95,0,g);box(.12,.42,.14,o.shirt,0,-.2,0,a);box(.12,.1,.14,'#f2d0a9',0,-.45,0,a);return a};
 return{g,armR:mk(1),armL:mk(-1)}}
function car(p,col){const c=grp(0,0,0,p);box(2.5,.5,1.1,col,0,.5,0,c);box(1.3,.42,1.0,col,-.1,.96,0,c);box(1.34,.3,1.02,GLASS,-.1,.98,0,c);box(2.52,.05,1.12,GOLD,0,.62,0,c);
 [[-.8,-.55],[-.8,.55],[.8,-.55],[.8,.55]].forEach(([x,z])=>{const w=cyl(.27,.27,.18,'#10141c',x,.27,z,c,14);w.rotation.x=Math.PI/2});
 [-.35,.35].forEach(z=>{glowBox(.06,.16,.26,1.26,.55,z,c);const t=mesh(new THREE.BoxGeometry(.05,.14,.24),BM('#e84a5f'),-1.26,.55,z,c)});halo(1.5,.55,0,c,1.6);return c}
function win(p,x,y,z,w,h,ry){const g=grp(x,y,z,p,ry);box(w+.3,h+.3,.12,MARB,0,0,0,g);glassPane(w,h,0,0,.07,g);box(.05,h,.03,MARB,0,0,.09,g);box(w,.05,.03,MARB,0,h*.12,.09,g);box(w+.55,.1,.3,MARB,0,-h/2-.2,.12,g);box(w+.5,.1,.25,MARB,0,h/2+.2,.1,g);
 [-1,1].forEach(s=>box(.36,h+.15,.06,'#2b4a3a',s*(w/2+.3),0,.1,g));return g}
function modalList(title,items,msg){if(typeof openM!=='function')return false;
 openM('<h2>'+title+'</h2><div class="row" style="flex-direction:column">'+items.map((m,i)=>'<button class="btn kp3" data-i="'+i+'" style="text-align:left">'+m+'</button>').join('')+'</div><p class="from" id="kp3m" style="margin:10px 0 0">'+msg+'</p>');
 document.querySelectorAll('.kp3').forEach(b=>b.onclick=()=>{const m=document.getElementById('kp3m');if(m)m.textContent='oke! '+items[+b.dataset.i].split(' — ')[0]+' sudah masuk pesanan~ (gratis buat Aqsa)'});return true}

/* ======================================================================
   1) TERAS: bukaan balustrade + tangga putih + halaman depan + gerbang kafe
   ====================================================================== */
const near=(a,b,e)=>Math.abs(a-b)<(e||.012);
{const kill=[];
 TER.children.forEach(o=>{if(!o.isMesh||!o.geometry)return;const p=o.position,g=o.geometry,gp=g.parameters||{};
  if(g.type==='LatheGeometry'){if(near(p.z,3.45)&&Math.abs(p.x)<GAPX)kill.push(o);if(near(p.x,4.9)&&p.z>CZ-GAPZ&&p.z<CZ+GAPZ)kill.push(o)}
  if(g.type==='BoxGeometry'){
   if(near(p.z,3.45)&&near(gp.width,10)&&(near(p.y,1.12)||near(p.y,.11)))kill.push(o);
   if(near(p.x,4.9)&&near(gp.depth,7)&&(near(p.y,1.12)||near(p.y,.11)))kill.push(o);
   if(near(p.z,3.5)&&near(gp.width,10.2)&&near(p.y,.06))kill.push(o)}
  if(p.y<1.6&&((near(p.x,0)&&near(p.z,3.45))||(near(p.x,4.9)&&near(p.z,0))))kill.push(o)});
 kill.forEach(o=>TER.remove(o))}
/* rel balustrade pengganti (dua potong di kiri-kanan tangga, dua potong di kiri-kanan gerbang kafe) */
const rail=(x,z,len,aZ)=>{if(aZ){box(.24,.1,len,MARB,x,1.12,z,TER);box(.2,.14,len,MARB,x,.11,z,TER)}else{box(len,.1,.24,MARB,x,1.12,z,TER);box(len,.14,.2,MARB,x,.11,z,TER)}};
rail((-5-GAPX)/2,3.45,5-GAPX,false);rail((5+GAPX)/2,3.45,5-GAPX,false);
box(5.1-GAPX,.12,.3,MARB2,(-5.1-GAPX)/2,.06,3.5,TER);box(5.1-GAPX,.12,.3,MARB2,(5.1+GAPX)/2,.06,3.5,TER);
rail(4.9,(-3.5+CZ-GAPZ)/2,CZ-GAPZ+3.5,true);rail(4.9,(3.5+CZ+GAPZ)/2,3.5-CZ-GAPZ,true);
/* fasad marmer di bawah lantai teras (supaya teras terlihat "tinggi" di atas halaman) */
box(10.2,-YG,.3,MARB2,0,YG/2-.005,3.35,TER);box(10.4,.05,.34,GOLD,0,-.03,3.37,TER);box(.2,-YG,7,MARB2,5.1,YG/2-.005,0,TER);box(.2,-YG,7,MARB2,-5.1,YG/2-.005,0,TER);

/* ---- tangga marmer putih + pegangan balustrade + gerbang halaman depan ---- */
const EXIT=grp(0,0,0,TER);
{const NS=4,RS=-YG/NS,RUN=.45,SW=GAPX-.05;
 for(let i=0;i<NS;i++){const top=-RS*(i+1),h=top-YG;if(h<.01)continue;box(SW*2,h,RUN,MARB,0,YG+h/2,3.5+RUN*(i+.5),EXIT);box(SW*2,.03,.05,GOLD,0,top+.005,3.5+RUN*(i+1)-.03,EXIT)}
 /* bordes (landasan) + halaman depan berpaving */
 const pav=cvTex(64,64,g=>{g.fillStyle='#e9e1cd';g.fillRect(0,0,64,64);g.fillStyle='#bdb299';g.fillRect(0,0,64,2);g.fillRect(0,0,2,64);g.fillRect(32,0,2,32);g.fillRect(0,32,64,2)},true,[4,3.2]);
 const z0=3.5+RUN*NS,z1=6.9;
 mesh(new THREE.PlaneGeometry(8,z1-3.5),new THREE.MeshLambertMaterial({map:pav}),0,YG+.004,(3.5+z1)/2,TER).rotation.x=-Math.PI/2;
 flat(2.6,z1-3.5,'#f4efe4',0,YG+.008,(3.5+z1)/2,EXIT);
 /* pegangan: balusters mengikuti anak tangga + handrail miring + tiang ujung */
 [-1,1].forEach(s=>{const x=s*SW;
  for(let i=0;i<NS;i++){const top=-RS*(i+1);[.3,.7].forEach(u=>{const z=3.5+RUN*(i+u),ry=1.05-(z-3.5)*(RS/RUN);balu(x,top+.02,z,EXIT,(ry-.1-top)/.9)})}
  const len=Math.hypot(RUN*NS,RS*NS),r=box(.2,.09,len,MARB,x,1.05-RS*NS/2,3.5+RUN*NS/2,EXIT);r.rotation.x=Math.atan2(RS*NS,RUN*NS);
  [[3.5,0],[z0,YG]].forEach(([z,b])=>{box(.34,1.2,.34,MARB,x,b+.6,z,EXIT);box(.44,.07,.44,MARB,x,b+1.24,z,EXIT);box(.28,.05,.28,GOLD,x,b+1.3,z,EXIT);sph(.12,GOLD,x,b+1.45,z,EXIT)})});
 /* gerbang emas di ujung halaman */
 [-1.55,1.55].forEach(x=>{box(.4,.18,.4,MARB,x,YG+.09,z1,TER);box(.34,2.0,.34,PIER,x,YG+1.1,z1,TER);box(.44,.1,.44,MARB,x,YG+2.15,z1,TER);box(.3,.06,.3,GOLD,x,YG+2.23,z1,TER);sph(.15,GOLD,x,YG+2.4,z1,TER)});
 const ar=tor(1.55,.035,GOLD,0,YG+1.95,z1,EXIT,0,0,Math.PI);ar.scale.y=.45;
 [[-1,-4],[1,4]].forEach(([s,x1])=>{const n=Math.round((Math.abs(x1)-1.55)/.2);for(let i=0;i<=n;i++){const x=s*(1.7+i*(Math.abs(x1)-1.7)/n);cyl(.014,.014,1.3,IRON,x,YG+.7,z1,TER,5);if(i%2===0)cone(.035,.1,GOLD,x,YG+1.4,z1,TER,6)}
  box(Math.abs(x1)-1.55,.05,.05,IRON,s*(Math.abs(x1)+1.55)/2,YG+1.3,z1,TER);box(Math.abs(x1)-1.55,.05,.05,IRON,s*(Math.abs(x1)+1.55)/2,YG+.3,z1,TER)});
 hedge(TER,-3.7,5.2,.6,3.4,1.1);hedge(TER,3.7,5.2,.6,3.4,1.1);
 lamp(TER,-2.1,YG,5.6,2.1);lamp(TER,2.1,YG,5.6,2.1);
 spr(signTex('komplek','down'),0,2.55,3.7,EXIT,.75);
 const zn=zone(3.4,1.2,3.6,0,YG+.5,5.2,EXIT)}
lact(EXIT,()=>goKomplek());

/* ---- gerbang kafe di sisi kanan teras ---- */
{const g=grp(4.9,0,CZ,TER);
 [-.8,.8].forEach(z=>{box(.4,.18,.4,MARB,0,.09,z,g);box(.34,2.0,.34,PIER,0,1.1,z,g);box(.44,.1,.44,MARB,0,2.15,z,g);box(.3,.06,.3,GOLD,0,2.23,z,g);sph(.15,GOLD,0,2.4,z,g)});
 for(let i=0;i<=10;i++){const z=-.6+i*.12;cyl(.018,.018,1.7,IRON,0,.95,z,g,6);cone(.045,.14,GOLD,0,1.87,z,g,6)}
 box(.04,.05,1.6,IRON,0,.35,0,g);box(.04,.05,1.6,IRON,0,1.5,0,g);tor(.6,.03,GOLD,0,1.55,0,g,0,Math.PI/2,Math.PI);tor(.17,.018,GOLD,0,1.0,0,g,0,Math.PI/2);
 spr(signTex('kafe','right'),.2,3.2,0,g);zone(.6,2.2,2,0,1.1,0,g);lact(g,()=>goKafe())}

/* ======================================================================
   2) KAFE PRIBADI (x = KX)
   ====================================================================== */
const KAF=new THREE.Group();KAF.position.set(KX,0,0);S.add(KAF);KAF.visible=false;
const kfl=[],kfx={};
{const woodTex=cvTex(256,256,g=>{for(let r=0;r<8;r++){g.fillStyle=['#b98757','#a8743f','#c49464','#b07c4a'][r%4];g.fillRect(0,r*32,256,32);for(let k=0;k<3;k++){g.fillStyle='rgba(60,35,15,.25)';g.fillRect((r*71+k*97)%256,r*32,2,32)}g.fillStyle='rgba(60,35,15,.35)';g.fillRect(0,r*32,256,2)}},false,[4,2.6]);
 mesh(new THREE.PlaneGeometry(14,9),new THREE.MeshLambertMaterial({map:woodTex}),0,0,0,KAF).rotation.x=-Math.PI/2;
 const wt=cvTex(512,256,(g,W,H)=>{g.fillStyle='#f0e5d0';g.fillRect(0,0,W,H);for(let i=0;i<260;i++){g.fillStyle=i%2?'rgba(170,140,95,.06)':'rgba(255,255,255,.1)';g.fillRect((i*97)%W,(i*53)%H,4,2)}
  g.fillStyle='#dccba6';g.fillRect(0,H-70,W,70);g.fillStyle='#bca67c';for(let r=0;r<3;r++){const y=H-70+r*23;g.fillRect(0,y,W,2);for(let c=0;c<W/64+1;c++)g.fillRect(c*64+(r%2?32:0),y,2,23)}});
 mesh(new THREE.PlaneGeometry(14,5.4),new THREE.MeshBasicMaterial({map:wt}),0,2.7,-4.5,KAF);
 box(14,.1,.1,MARB,0,1.15,-4.46,KAF);box(14.2,.22,.5,MARB,0,5.35,-4.3,KAF);box(14.2,.05,.52,GOLD,0,5.2,-4.3,KAF);
 /* sudut batu quoin */
 [-6.85,6.85].forEach(x=>{for(let i=0;i<7;i++)box(i%2?.5:.34,.5,.2,MARB2,x,.3+i*.7,-4.4,KAF)});
 /* karpet area tempat duduk kiri */
 const rug=cvTex(256,192,(g,W,H)=>{g.fillStyle='#1f3358';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=6;g.strokeRect(6,6,W-12,H-12);g.lineWidth=2;g.strokeRect(18,18,W-36,H-36);g.fillStyle='#d9b24c';g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2,r=i%2?22:56;g.lineTo(W/2+Math.cos(a)*r,H/2+Math.sin(a)*r)}g.closePath();g.fill()});
 mesh(new THREE.PlaneGeometry(5.6,4.2),new THREE.MeshBasicMaterial({map:rug}),-3.4,.015,.9,KAF).rotation.x=-Math.PI/2;
 /* jalur marmer dari gerbang teras */
 flat(14,1.4,'#efe9db',0,.012,3.6,KAF)}
/* balustrade marmer sisi kiri, kanan, dan depan */
{const rl=(x,z,len,aZ,gap)=>{const n=Math.max(2,Math.round(len/.34));if(aZ){box(.24,.1,len,MARB,x,1.12,z,KAF);box(.2,.14,len,MARB,x,.11,z,KAF)}else{box(len,.1,.24,MARB,x,1.12,z,KAF);box(len,.14,.2,MARB,x,.11,z,KAF)}
  for(let i=0;i<=n;i++){const t=-len/2+i*len/n,px=aZ?x:x+t,pz=aZ?z+t:z;if(gap&&gap(px,pz))continue;balu(px,.17,pz,KAF)}};
 rl(-6.9,-1.75,5.5,true);rl(-6.9,3.75,1.5,true);rl(6.9,0,9,true);rl(0,4.45,14,false);
 [[-6.9,-4.4],[6.9,-4.4],[-6.9,4.45],[6.9,4.45],[-6.9,.95],[-6.9,3.05],[-3.5,4.45],[0,4.45],[3.5,4.45]].forEach(([x,z])=>{box(.36,1.2,.36,MARB,x,.6,z,KAF);box(.46,.08,.46,MARB,x,1.24,z,KAF);box(.3,.05,.3,GOLD,x,1.3,z,KAF);sph(.13,GOLD,x,1.46,z,KAF)})}
/* gerbang kembali ke teras (kiri depan) */
{const g=grp(-6.9,0,2.0,KAF);[-.8,.8].forEach(z=>{box(.4,.18,.4,MARB,0,.09,z,g);box(.34,2.0,.34,PIER,0,1.1,z,g);box(.44,.1,.44,MARB,0,2.15,z,g);box(.3,.06,.3,GOLD,0,2.23,z,g);sph(.15,GOLD,0,2.4,z,g)});
 for(let i=0;i<=10;i++){const z=-.6+i*.12;cyl(.018,.018,1.7,IRON,0,.95,z,g,6);cone(.045,.14,GOLD,0,1.87,z,g,6)}tor(.6,.03,GOLD,0,1.55,0,g,0,Math.PI/2,Math.PI);
 spr(signTex('teras','left'),-.1,3.2,0,g);zone(.6,2.2,2,0,1.1,0,g);lact(g,()=>toTerrace())}
/* tiang + balok pergola (kerangka atap terbuka) */
{[[-6.6,-4.1],[6.6,-4.1],[-6.6,4.0],[6.6,4.0],[0,4.0]].forEach(([x,z])=>{box(.55,.14,.55,MARB,x,.07,z,KAF);cyl(.17,.2,4.4,MARB,x,2.3,z,KAF,16);box(.44,.08,.44,GOLD,x,4.55,z,KAF);box(.58,.14,.58,MARB,x,4.65,z,KAF)});
 box(14,.18,.3,MARB,0,4.85,-4.1,KAF);box(14,.18,.3,MARB,0,4.85,4.0,KAF);[-6.6,6.6].forEach(x=>box(.3,.18,8.4,MARB,x,4.85,-.05,KAF));
 for(let i=0;i<9;i++)box(.14,.12,8.2,'#caa24a',-6+i*1.5,4.9,-.05,KAF);}
/* jendela lengkung kaca + tirai */
[-5.1,-2.2].forEach(x=>{const w=grp(x,0,-4.4,KAF);box(1.7,2.9,.12,MARB,0,2.35,0,w);glassPane(1.3,2.4,0,2.3,.07,w);mesh(new THREE.CircleGeometry(.65,20,0,Math.PI),BM('#a9cbe6'),0,3.5,.07,w).rotation.z=0;glass.push(w.children[w.children.length-1]);
 tor(.68,.045,GOLD,0,3.5,.09,w,0,0,Math.PI);box(.05,3.0,.03,MARB,0,2.4,.1,w);box(1.3,.05,.03,MARB,0,2.5,.1,w);box(2.0,.1,.3,MARB,0,.98,.12,w);[-1,1].forEach(s=>box(.34,2.9,.06,'#2b4a3a',s*.98,2.35,.1,w))});
/* papan nama, menu, rak bar belakang */
board(4.4,.7,512,80,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=7;g.strokeRect(4,4,W-8,H-8);g.lineWidth=2;g.strokeRect(14,14,W-28,H-28);g.fillStyle='#f0cf6a';g.font='24px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText("AQSA'S CAFE",W/2,H/2+2)},3.6,4.85,-4.3,KAF);
const MENU=[['kopi susu gula aren','22k'],['caffe latte','28k'],['cappuccino','28k'],['matcha latte','30k'],['es teh lemon','18k'],['croissant almond','25k'],['cheesecake','35k'],['red velvet slice','32k']];
const menuB=board(3.6,1.5,512,214,(g,W,H)=>{g.fillStyle='#22302a';g.fillRect(0,0,W,H);g.strokeStyle='#caa24a';g.lineWidth=6;g.strokeRect(4,4,W-8,H-8);g.fillStyle='#f0cf6a';g.font='20px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('MENU',W/2,34);
 g.font='11px '+PX;MENU.forEach((m,i)=>{const col=i<4?0:1,row=i%4,x=col?272:24,y=70+row*36;g.textAlign='left';g.fillStyle='#f4efe4';g.fillText(m[0].slice(0,19),x,y);g.fillStyle='#f0cf6a';g.fillText(m[1],x,y+15)})},3.6,3.7,-4.42,KAF);
box(3.84,1.74,.1,WOOD(),3.6,3.7,-4.46,KAF);
lact(menuB,()=>{if(!modalList('menu kafe',MENU.map(m=>m[0]+' — '+m[1]),'tap salah satu buat pesan, gratis buat Aqsa~'))say3(menuB,'kopi susu, latte, matcha, cheesecake...')});
{const sh=grp(3.6,0,-4.15,KAF);box(6.4,1.0,.6,NAVY,0,.5,0,sh);box(6.5,.08,.7,MARB,0,1.04,0,sh);box(6.5,.04,.72,GOLD,0,.96,0,sh);[1.55,2.0].forEach((y,k)=>{box(6.2,.07,.34,WOOD(),0,y+.5,-.1,sh);
  for(let i=0;i<12;i++){const x=-2.9+i*.53;if(k===0){cyl(.1,.08,.12,['#f4efe4','#e84a5f','#4f8fe8'][i%3],x,y+.58,-.1,sh,10)}else{cyl(.13,.13,.26,['#8a5a34','#c98b52','#5a3b22','#f4efe4'][i%4],x,y+.67,-.1,sh,10);cyl(.14,.14,.05,GOLD,x,y+.82,-.1,sh,10)}}});
 /* mesin espresso */
 const em=grp(1.9,1.08,0,sh);box(1.2,.55,.6,'#c9ced6',0,.28,0,em);box(1.24,.06,.64,GOLD,0,.58,0,em);[-.3,.3].forEach(x=>{cyl(.07,.07,.12,'#8d96a3',x,.1,.35,em,10);box(.04,.3,.04,'#8d96a3',x,.1,.4,em)});sph(.09,'#f4efe4',0,.4,.31,em);kfx.em=em;
 kfx.steam=[0,1,2].map(i=>{const s=mesh(new THREE.SphereGeometry(.05,6,5),BM('#ffffff',{transparent:true}),5.5+(i-1)*.07,2.1,-3.75,KAF);return s});
 lact(em,()=>say3(em,pick(['sssshhh... espresso-nya jadi','wangi kopi~','lagi nyeduh buat Aqsa'])))}
/* bar depan: counter marmer, panel beludru, etalase kue, kasir, kue ultah */
{const c=grp(3.4,0,-2.9,KAF);box(5.6,1.05,.85,NAVY,0,.52,0,c);box(5.8,.1,1.0,MARB,0,1.1,.02,c);box(5.82,.04,1.02,GOLD,0,1.03,.02,c);for(let i=0;i<12;i++)box(.3,.82,.05,'#2a406a',-2.5+i*.45,.52,.44,c);box(5.6,.05,.06,GOLD,0,.14,.45,c);
 const dc=grp(-1.9,1.16,0,c);box(1.5,.08,.7,MARB,0,0,0,dc);const dg=mesh(new THREE.BoxGeometry(1.4,.7,.64),GLASS,0,.4,0,dc);box(1.4,.04,.64,MARB,0,.42,0,dc);
 ['#e84a5f','#f2c14e','#f4a6c0','#8b4a3c','#fff1cf','#a98bd6'].forEach((col,i)=>{cyl(.15,.15,.14,col,-.5+(i%3)*.5,.1+(i<3?0:.32),0,dc,12);cyl(.15,.15,.04,'#f4efe4',-.5+(i%3)*.5,.2+(i<3?0:.32),0,dc,12);sph(.04,'#e84a5f',-.5+(i%3)*.5,.25+(i<3?0:.32),0,dc)});
 lact(dc,()=>say3(dc,pick(['kuenya baru keluar oven','pilih yang mana ya...','cheesecake-nya juara'])));
 const rg=grp(.7,1.16,.05,c);box(.5,.12,.4,'#2a3a52',0,.06,0,rg);box(.5,.3,.05,'#10151f',0,.3,-.1,rg).rotation.x=-.4;box(.4,.2,.02,'#3f6fb5',0,.3,-.08,rg).rotation.x=-.4;lact(rg,()=>say3(rg,'ting! kasir kafe'));
 const jar=grp(1.5,1.16,.2,c);cyl(.14,.14,.3,GLASS,0,.15,0,jar,12);cyl(.1,.1,.04,'#f2c14e',0,.08,0,jar,10);cyl(.15,.15,.03,GOLD,0,.32,0,jar,12);
 /* kue ultah */
 const ck=grp(2.35,1.16,.15,c);cyl(.34,.38,.06,GOLD,0,.03,0,ck,18);cyl(.28,.28,.2,'#fff1cf',0,.16,0,ck,18);cyl(.28,.28,.03,'#f4a6c0',0,.27,0,ck,18);cyl(.2,.2,.16,'#fff1cf',0,.37,0,ck,16);cyl(.2,.2,.03,'#f4a6c0',0,.46,0,ck,16);
 kfx.flames=[-.08,.08,0].map((x,i)=>{cyl(.012,.012,.12,'#8fd0f0',x,.54,i===2?.06:-.02,ck,6);return sph(.03,BM('#ffcf5a'),x,.63,i===2?.06:-.02,ck)});
 lact(ck,()=>say3(ck,pick(['kue ulang tahun buat Aqsa!','make a wish~','jangan ditiup dulu, belum difoto'])));
 /* area tap counter */
 const zc=zone(5.4,1.1,1.0,0,.55,0,c);lact(zc,()=>say3(c,pick(['mau pesan apa?','hari ini gratis kok, kan ulang tahun','kopi dulu atau kue dulu?'])))}
/* bangku bar */
[1.5,2.7,3.9,5.1].forEach(x=>{const s=grp(x,0,-1.85,KAF);cyl(.22,.22,.1,NAVY,0,.78,0,s,16);cyl(.04,.04,.75,GOLD,0,.38,0,s,8);tor(.18,.02,GOLD,0,.35,0,s,Math.PI/2);cyl(.2,.22,.04,GOLD,0,.02,0,s,14);lact(s,()=>say3(s,pick(['bangkunya tinggi, hati-hati','duduk sini, lihat barista bikin kopi'])))});
/* barista */
const bar1=person(KAF,3.2,-3.55,{shirt:'#2a406a',apron:true,hair:'#3a2418',cap:'#f4efe4'});lact(bar1.g,()=>say3(bar1.g,pick(['halo Aqsa! selamat ulang tahun~','pesanannya segera datang','kopi buatanku spesial hari ini'])));
/* meja bundar + kursi */
const tabs=[[-4.9,-.9],[-2.0,.6],[-4.7,2.7],[1.6,1.9]];
tabs.forEach(([x,z],i)=>{const t=grp(x,0,z,KAF);cyl(.62,.62,.06,MARB,0,.98,0,t,24);tor(.62,.02,GOLD,0,1.0,0,t,Math.PI/2);cyl(.07,.1,.95,GOLD,0,.5,0,t,12);cyl(.3,.34,.06,GOLD,0,.04,0,t,16);
 cyl(.11,.1,.2,GLASS,.0,1.13,0,t,10);sph(.1,['#f4a6c0','#fff1cf','#e84a5f','#f2c14e'][i],0,1.3,0,t);cyl(.09,.07,.07,'#f6f0e6',-.3,1.06,.15,t,10);cyl(.09,.07,.07,'#f6f0e6',.3,1.06,-.15,t,10);
 chair(t,-1.0,0,Math.PI/2);chair(t,1.0,0,-Math.PI/2);
 lact(t,()=>say3(t,pick(['meja kecil, cocok buat ngobrol','teh hangat + kue, mantap','ada bunga segar di sini'])))});
/* sudut sofa + meja kopi + lampu lantai */
{const s=grp(5.4,0,2.0,KAF,-Math.PI/2);box(3.0,.5,.9,'#4a9a9a',0,.3,0,s);box(3.0,.7,.22,'#3f8a8a',0,.8,-.42,s);[-1,1].forEach(k=>box(.24,.6,.9,'#3f8a8a',k*1.4,.55,0,s));box(.5,.3,.2,'#f2c14e',-.8,.65,.05,s);box(.5,.3,.2,'#f4a6c0',.8,.65,.05,s);[-1.3,1.3].forEach(x=>[-.4,.4].forEach(z=>cyl(.04,.05,.1,GOLD,x,.05,z,s,6)));
 lact(s,()=>say3(s,pick(['sofanya empuk banget','enak buat baca buku sambil ngopi'])))}
{const t=grp(3.8,0,2.0,KAF);box(1.1,.08,.7,WOOD(),0,.55,0,t);[[-.45,-.25],[.45,-.25],[-.45,.25],[.45,.25]].forEach(([x,z])=>box(.07,.5,.07,GOLD,x,.27,z,t));cyl(.1,.09,.1,'#f6f0e6',-.2,.64,0,t,10);box(.4,.04,.3,'#8b2a3c',.2,.61,0,t)}
{const l=grp(6.2,0,3.1,KAF);cyl(.04,.05,1.9,'#2a3a52',0,.95,0,l,6);cyl(.2,.3,.4,'#ffe9a0',0,2.05,0,l,10);const g=glowBox(.1,.1,.1,0,2.05,0,l);halo(0,2.05,0,l,1.6)}
/* tanaman: guci topiary di sudut, pot gantung */
urn(KAF,-6.2,0,-3.5,1.15);urn(KAF,6.3,0,-3.4,1.1);urn(KAF,-6.1,0,3.4,1);urn(KAF,5.9,0,3.5,1);
[-4.5,-1.5,2.0].forEach(x=>{const h=grp(x,0,3.4,KAF);cyl(.01,.01,1.0,GOLD,0,4.35,0,h,4);cyl(.26,.18,.22,'#c98b52',0,3.78,0,h,12);sph(.3,'#3f9150',0,4.0,0,h);sph(.2,'#4fa05a',.2,3.85,.1,h);sph(.08,'#f4a6c0',.15,4.2,.25,h)});
/* lampu gantung emas */
[-4.8,-2.0,0.8,3.6,6.0].forEach((x,i)=>{const z=i%2?.6:-.6,l=grp(x,0,z,KAF);cyl(.008,.008,1.4,GOLD,0,4.1,0,l,4);cone(.3,.24,GOLD,0,3.3,0,l,10);glowBox(.16,.12,.16,0,3.22,0,l);halo(0,3.1,0,l,2.0)});
/* bunting ulang tahun + lampu tali */
{const cols=['#e84a5f','#f2c14e','#4f8fe8','#f4a6c0','#8fd18a','#a98bd6'];kfx.fl=[];
 for(let i=0;i<22;i++){const u=i/21,x=-6.6+u*13.2,y=4.3-.5*Math.sin(u*Math.PI);const f=cone(.14,.3,cols[i%6],x,y-.18,3.7,KAF,3);f.rotation.x=Math.PI;f.scale.z=.2;kfx.fl.push(f)}
 for(let i=0;i<14;i++){const u=i/13,x=-6.4+u*7.2;kfx.fl.push(sph(.06,['#f0cf6a','#fff1cf','#f4a6c0','#ffffff'][i%4],x,4.6-.12*Math.sin(u*Math.PI*3),-4.15,KAF))}
 board(2.6,.45,320,56,(g,W,H)=>{g.fillStyle='#f4a6c0';g.fillRect(0,0,W,H);g.fillStyle='#1c2438';g.font='16px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('HAPPY BIRTHDAY',W/2,H/2+2)},-3.5,3.15,3.72,KAF)}
/* piring kecil bergambar kucing Miko di dinding (hiasan) */
{const w=grp(-6.2,2.4,-4.35,KAF);cyl(.4,.4,.05,'#f4efe4',0,0,0,w,18).rotation.x=Math.PI/2;tor(.4,.03,GOLD,0,0,.03,w);sph(.2,'#efe2c8',0,-.05,.06,w);cone(.07,.14,'#4b3426',-.12,.15,.06,w,4);cone(.07,.14,'#4b3426',.12,.15,.06,w,4);sph(.07,'#4b3426',0,-.08,.2,w);
 lact(w,()=>say3(w,'piring Miko, kucing kesayangan Aqsa'))}

/* ======================================================================
   3) KOMPLEK PERUMAHAN MEWAH (x = MX)
   ====================================================================== */
const KOM=new THREE.Group();KOM.position.set(MX,0,0);S.add(KOM);KOM.visible=false;
const cars=[],kmx={};
{const gt=cvTex(128,128,g=>{g.fillStyle='#5fae5a';g.fillRect(0,0,128,128);g.fillStyle='#6cbb64';g.fillRect(0,0,64,128);for(let i=0;i<220;i++){g.fillStyle=['#52a050','#74c46c','#5bab57'][i%3];g.fillRect((i*47)%128,(i*83)%128,2,3)}},false,[14,10]);
 const pv=cvTex(64,64,g=>{g.fillStyle='#e6dcc6';g.fillRect(0,0,64,64);g.fillStyle='#bdb299';g.fillRect(0,0,64,2);g.fillRect(0,0,2,64);g.fillRect(32,0,2,32);g.fillRect(0,32,64,2)},true,[28,1.2]);
 box(30,2,21.4,'#7a5a3a',0,-1.01,0,KOM);mesh(new THREE.PlaneGeometry(30,21.4),new THREE.MeshLambertMaterial({map:gt}),0,0,0,KOM).rotation.x=-Math.PI/2;
 /* jalan, trotoar, marka */
 flat(30,5,'#3a3f4a',0,.012,.7,KOM);mesh(new THREE.PlaneGeometry(30,1.6),new THREE.MeshLambertMaterial({map:pv}),0,.014,-2.6,KOM).rotation.x=-Math.PI/2;
 mesh(new THREE.PlaneGeometry(30,1.2),new THREE.MeshLambertMaterial({map:pv}),0,.014,3.8,KOM).rotation.x=-Math.PI/2;
 box(30,.14,.16,MARB,0,.07,-1.8,KOM);box(30,.14,.16,MARB,0,.07,3.2,KOM);
 for(let i=-7;i<=7;i++)box(1.0,.02,.12,'#f4efe4',i*2,.03,.7,KOM);
 for(let i=0;i<9;i++)box(2.0,.02,.3,'#f4efe4',-5.2,.03,-1.4+i*.55,KOM)}
/* tembok & pagar batas komplek */
box(30,2.2,.4,MARB2,0,1.1,-10.2,KOM);box(30.2,.12,.5,GOLD,0,2.25,-10.2,KOM);box(.4,2.2,21,MARB2,-14.8,1.1,0,KOM);box(.4,2.2,21,MARB2,14.8,1.1,0,KOM);
for(let i=-6;i<=6;i++)tree(KOM,i*2.2,-9.5,.9);

/* ---- mansion tetangga ---- */
/* ---- DUA MODEL RUMAH (v2.2: model ditukar) ----
   twoStoryHouse = rumah 2 lantai (jendela 2 baris) -> RUMAH AQSA (kamar tidur ada di lantai 2)
   lowHouse      = rumah panggung + tangga putih      -> RUMAH TETANGGA */
function twoStoryHouse(m,w,h,wall,roofc,D){
 box(w+.4,.35,D+.4,MARB2,0,.175,0,m);box(w,h,D,wall,0,.35+h/2,0,m);box(w+.5,.22,D+.5,MARB,0,.35+h+.11,0,m);box(w+.55,.05,D+.55,GOLD,0,.35+h-.02,0,m);
 pyr(w+.9,D+.9,1.9,roofc,0,.35+h+.22,0,m);
 box(.8,1.7,.8,'#8b4a3c',w/4,.35+h+1.4,-.4,m);
 const y0=.35,dz=D/2+.03;
 for(let i=0;i<3;i++){[-1,1].forEach(s=>{const wx=s*(1.9+i*1.55);if(Math.abs(wx)<w/2-.8){win(m,wx,y0+1.5,dz,.9,1.5);win(m,wx,y0+3.3,dz,.9,1.4)}})}
 win(m,0,y0+3.3,dz,1.2,1.4);
 /* pintu + portico */
 box(1.5,2.5,.12,'#4a2c1a',0,y0+1.25,dz,m);box(.04,2.4,.14,GOLD,0,y0+1.25,dz+.01,m);glassPane(1.2,.5,0,y0+2.3,dz+.07,m);[-1,1].forEach(s=>{cyl(.16,.19,2.8,MARB,s*1.05,y0+1.4,dz+.9,m,14);box(.44,.1,.44,GOLD,s*1.05,y0+2.85,dz+.9,m);box(.5,.12,.5,MARB,s*1.05,y0+2.95,dz+.9,m)});
 box(2.9,.22,1.2,MARB,0,y0+3.05,dz+.55,m);prism(3.0,.7,1.0,MARB,0,y0+3.16,dz+.55,m);
 box(w-.4,.09,.5,GOLD,0,y0+.01,dz+.3,m);
}
function lowHouse(g,SW){const RS=.225,RUN=.45,PH=.9;
 /* rumah di belakang: panggung teras, badan rumah, portico, atap */
 box(6.2,PH,4.075,MARB2,0,PH/2,-4.0625,g);box(6.3,.06,4.175,GOLD,0,PH,-4.0625,g);
 box(5.6,3.8,2.4,'#f0e5d0',0,PH+1.9,-4.7,g);pyr(6.5,3.2,1.9,'#33507d',0,PH+3.8,-4.7,g);box(.7,1.4,.7,'#8b4a3c',1.6,PH+4.7,-5.0,g);
 [-1.5,1.5].forEach(x=>win(g,x,PH+2.0,-3.47,1.0,1.7));box(1.5,2.4,.12,'#4a2c1a',0,PH+1.2,-3.46,g);box(.04,2.3,.14,GOLD,0,PH+1.2,-3.4,g);
 [-1.0,1.0].forEach(x=>{cyl(.15,.18,3.0,MARB,x,PH+1.6,-2.7,g,14);box(.4,.1,.4,GOLD,x,PH+3.15,-2.7,g)});box(3.0,.22,.9,MARB,0,PH+3.3,-2.7,g);prism(3.2,.7,.9,MARB,0,PH+3.41,-2.7,g);
 /* tangga putih naik ke teras rumah (3 anak tangga + tepi panggung) */
 for(let i=0;i<3;i++){const h=RS*(i+1);box(SW*2,h,RUN,MARB,0,h/2,-.9-RUN*i,g);box(SW*2,.03,.05,GOLD,0,h+.005,-.9-RUN*i+RUN/2-.03,g)}
 [-1,1].forEach(s=>{const x=s*SW,z0=-.675,z1=-2.025,len=Math.hypot(z0-z1,.675),r=box(.2,.09,len,MARB,x,1.225+.3375,(z0+z1)/2,g);r.rotation.x=Math.atan2(.675,z0-z1);
  for(let i=0;i<3;i++){const z=-.9-RUN*i,top=RS*(i+1),ry=1.225+(z0-z)*.5-.05;balu(x,top,z,g,(ry-top)/.9)}
  [[-.55,0],[-2.0,PH]].forEach(([z,b])=>{box(.34,1.2,.34,MARB,x,b+.6,z,g);box(.44,.07,.44,MARB,x,b+1.24,z,g);box(.28,.05,.28,GOLD,x,b+1.3,z,g);sph(.12,GOLD,x,b+1.45,z,g)})});
}
function mansion(x,zf,w,h,wall,roofc){const D=4,m=grp(x,0,zf-D/2,KOM);
 const hb=grp(0,0,D/2+1.7,m);lowHouse(hb,.8);
 /* halaman: jalan, pagar besi + gerbang, semak, lampu */
 flat(1.4,1.9,'#f4efe4',0,.36,D/2+1.45,m);
 const fz=D/2+1.9;[-1,1].forEach(s=>{const n=Math.round((w/2-.9)/.22);for(let i=0;i<=n;i++){const fx=s*(.9+i*(w/2-.9)/n);cyl(.014,.014,1.1,IRON,fx,.55,fz,m,5);if(i%2===0)cone(.035,.1,GOLD,fx,1.15,fz,m,6)}box(w/2-.9,.05,.05,IRON,s*(w/2+.9)/2,1.0,fz,m);box(w/2-.9,.05,.05,IRON,s*(w/2+.9)/2,.25,fz,m)});
 [-.85,.85].forEach(s=>{box(.3,1.6,.3,PIER,s,.8,fz,m);sph(.12,GOLD,s,1.72,fz,m)});
 hedge(m,-w/2+1.2,D/2+.7,1.6,.5,.9);hedge(m,w/2-1.2,D/2+.7,1.6,.5,.9);lamp(m,1.5,0,D/2+1.4,1.6);return m}
mansion(-9.6,-5.1,6,4.4,'#f0e5d0','#33507d');

/* ---- MINIMARKET "Royal Mart" ---- */
const MART=grp(-1.6,0,-7.1,KOM);
{const m=MART,D=4,W=8,zf=D/2;
 box(W+.4,.3,D+.4,'#d9d2c0',0,.15,0,m);box(W,4,D,'#f7f4ee',0,2.3,0,m);box(W+.5,.25,D+.5,MARB,0,4.42,0,m);box(W+.55,.06,D+.55,GOLD,0,4.28,0,m);
 /* interior terlihat dari kaca: lantai, rak gondola, kulkas, kasir, lampu langit-langit */
 box(W-.6,.04,D-.2,'#efe9db',0,.32,0,m);
 for(let r=0;r<2;r++)for(let k=0;k<3;k++){const x=-2.4+k*2.2,z=-.2+r*1.2;box(1.8,1.3,.4,'#cfd6e0',x,1.0,z,m);for(let i=0;i<7;i++)box(.22,.3,.3,['#e84a5f','#f2c14e','#4f8fe8','#8fd18a','#f4a6c0','#ff9a3d'][(i+k+r)%6],x-.75+i*.25,1.8,z,m)}
 box(W-.8,1.9,.5,'#bcd6e6',0,1.35,-1.7,m);for(let i=0;i<8;i++)for(let k=0;k<3;k++)box(.3,.3,.3,['#4f8fe8','#e84a5f','#8fd18a','#f2c14e','#ffffff'][(i+k)%5],-2.7+i*.76,.9+k*.55,-1.4,m);
 box(1.8,.9,.7,'#2a3a52',-3.0,.75,1.2,m);box(.4,.3,.3,'#10151f',-3.0,1.35,1.2,m);
 [-2.5,0,2.5].forEach(x=>glowBox(1.6,.06,.3,x,3.7,.4,m));
 /* kaca etalase + pintu kaca */
 const fg=[[-2.6,2.0],[2.6,2.0]];fg.forEach(([x,w])=>{wallp(w*1.7,2.7,GLASS,x,1.9,zf+.02,m);for(let i=0;i<4;i++)box(.05,2.7,.05,NAVY,x-w*.85+i*(w*1.7/3),1.9,zf+.04,m)});
 box(W,.12,.1,NAVY,0,3.28,zf+.04,m);box(W,.12,.1,NAVY,0,.5,zf+.04,m);
 [-1,1].forEach(s=>{wallp(.8,2.6,GLASS,s*.42,1.8,zf+.03,m);box(.06,2.6,.06,NAVY,s*.84,1.8,zf+.05,m);cyl(.025,.025,.7,GOLD,s*.12,1.7,zf+.1,m,6)});box(1.8,.1,.1,NAVY,0,3.1,zf+.05,m);
 /* kanopi bergaris + papan nama menyala */
 for(let i=0;i<8;i++){const a=box(1.0,.07,1.3,i%2?'#f4efe4':'#1f2f4f',-3.5+i,3.3,zf+.65,m);a.rotation.x=.22;box(1.0,.12,.04,GOLD,-3.5+i,3.0,zf+1.28,m)}
 board(7.2,.95,640,84,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=6;g.strokeRect(4,4,W-8,H-8);g.fillStyle='#f0cf6a';g.font='28px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('ROYAL MART',W/2,H/2-8);g.fillStyle='#8fd0f0';g.font='12px '+PX;g.fillText('buka 24 jam',W/2,H/2+22)},0,3.85,zf+.18,m);
 const op=board(.9,.4,128,56,(g,W,H)=>{g.fillStyle='#10203d';g.fillRect(0,0,W,H);g.strokeStyle='#e84a5f';g.lineWidth=4;g.strokeRect(3,3,W-6,H-6);g.fillStyle='#ff6b7d';g.font='18px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('OPEN',W/2,H/2+2)},3.1,1.9,zf+.1,m);
 /* depan toko: pot, bangku, rak sepeda, tong sampah, papan promo */
 urn(m,-1.4,0,zf+1.0,.9);urn(m,1.4,0,zf+1.0,.9);bench(m,3.0,zf+1.3,0);
 {const b=grp(-3.4,0,zf+1.2,m);[-.4,-.2,0,.2,.4].forEach(x=>{const t=tor(.2,.015,IRON,x,.28,0,b,0,Math.PI/2,Math.PI);});box(1.0,.03,.03,IRON,0,.1,0,b);const bk=grp(0,0,.3,b);tor(.25,.02,'#1d222c',-.45,.28,0,bk);tor(.25,.02,'#1d222c',.45,.28,0,bk);box(.9,.04,.04,'#e84a5f',0,.45,0,bk)}
 {const sb=grp(-4.6,0,zf+1.2,m);const a=box(.7,.9,.05,'#22302a',-.2,.5,0,sb);a.rotation.x=0;box(.06,.7,.06,WOOD(),-.5,.35,-.2,sb);box(.06,.7,.06,WOOD(),.1,.35,-.2,sb);box(.7,.5,.05,'#f2c14e',-.2,.5,.03,sb)}
 const zn=zone(8,3.6,2.6,0,1.8,zf+.5,m);lact(zn,()=>{if(typeof window.goMart==='function')window.goMart();else{console.warn('komplek3d: mart3d.js belum dimuat (taruh setelah komplek3d.js)');say3(MART,'Royal Mart lagi tutup sebentar')}})}

/* ---- gerbang + tangga putih "rumah Aqsa" (kembali ke teras) ---- */
const HG=grp(9.2,0,-3.4,KOM);
{const g=HG;
 /* rumah 2 lantai di atas panggung; tangga putih naik ke teras rumah */
 {const SW=1.5,RS=.225,RUN=.45,PH=.9,D=3,w=6;
  box(6.5,PH,5.6,MARB2,0,PH/2,-4.8,g);                         /* panggung (z -7.6 .. -2.0) */
  const hh=grp(0,PH-.35,-4.75,g);twoStoryHouse(hh,w,4.4,'#f0e5d0','#33507d',D);
    for(let i=0;i<3;i++){const h=RS*(i+1);box(SW*2,h,RUN,MARB,0,h/2,-.9-RUN*i,g);box(SW*2,.03,.05,GOLD,0,h+.005,-.9-RUN*i+RUN/2-.03,g)}
  [-1,1].forEach(s=>{const x=s*SW,z0=-.675,z1=-2.025,len=Math.hypot(z0-z1,.675),r=box(.2,.09,len,MARB,x,1.225+.3375,(z0+z1)/2,g);r.rotation.x=Math.atan2(.675,z0-z1);
   for(let i=0;i<3;i++){const z=-.9-RUN*i,top=RS*(i+1),ry=1.225+(z0-z)*.5-.05;balu(x,top,z,g,(ry-top)/.9)}
   [[-.55,0],[-2.0,PH]].forEach(([z,b])=>{box(.34,1.2,.34,MARB,x,b+.6,z,g);box(.44,.07,.44,MARB,x,b+1.24,z,g);box(.28,.05,.28,GOLD,x,b+1.3,z,g);sph(.12,GOLD,x,b+1.45,z,g)})})}
 /* pagar + gerbang depan, papan nama */
 [-1,1].forEach(s=>{for(let i=0;i<=12;i++){const x=s*(2.1+i*.25);cyl(.014,.014,1.2,IRON,x,.6,.2,g,5);if(i%2===0)cone(.035,.1,GOLD,x,1.25,.2,g,6)}box(3.0,.05,.05,IRON,s*3.6,1.1,.2,g);box(3.0,.05,.05,IRON,s*3.6,.25,.2,g);box(.35,1.6,.35,PIER,s*5.2,.8,.2,g);sph(.13,GOLD,s*5.2,1.72,.2,g)});
 [-1.85,1.85].forEach(x=>{box(.46,.22,.46,MARB,x,.11,.2,g);box(.38,2.0,.38,PIER,x,1.15,.2,g);box(.48,.1,.48,MARB,x,2.2,.2,g);sph(.15,GOLD,x,2.45,.2,g);glowBox(.18,.3,.18,x,2.1,.45,g);halo(x,2.1,.5,g,1.5)});
 const ar=tor(1.85,.035,GOLD,0,2.2,.2,g,0,0,Math.PI);ar.scale.y=.4;
 spr(signTex('rumah Aqsa','up'),0,3.55,.5,g,1.1);
 flat(3.0,1.6,'#f4efe4',0,.016,1.0,g);
 hedge(g,-4.4,-.4,1.2,.6,1);hedge(g,4.4,-.4,1.2,.6,1);
 zone(3.4,1.2,3.4,0,.6,-.4,g);lact(g,()=>toTerrace())}

/* ---- pos satpam + papan monumen + taman depan ---- */
{const p=grp(-12.0,0,5.4,KOM);box(2.0,.2,2.0,MARB2,0,.1,0,p);box(1.8,1.7,1.8,'#f0e5d0',0,1.05,0,p);box(2.3,.18,2.3,'#33507d',0,2.0,0,p);pyr(2.4,2.4,.9,'#33507d',0,2.09,0,p);win(p,0,1.2,.92,.9,.7);
 const gd=person(p,.0,.6,{shirt:'#2a3a52',pants:'#1f2a3f',cap:'#2a3a52'});gd.g.position.set(1.5,0,.9);lact(gd.g,()=>say3(gd.g,pick(['selamat datang di Royal Residence','rumah Aqsa lurus aja, yang ada tangga putih','ronda malam dulu ya~'])));
 const arm=grp(1.6,.9,-1.2,p);box(.08,.08,4.0,'#e84a5f',0,0,-1.8,arm);for(let i=0;i<5;i++)box(.09,.09,.4,'#ffffff',0,0,-.4-i*.8,arm);arm.rotation.x=1.2;
 box(.3,1.0,.3,'#e9e1cf',1.6,.5,-1.2,p);
 board(1.4,.4,256,72,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=4;g.strokeRect(3,3,W-6,H-6);g.fillStyle='#f0cf6a';g.font='14px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('POS SATPAM',W/2,H/2+2)},0,1.9,1.12,p).position.y=1.6;
 lact(p,()=>say3(p,'pos satpam, selalu siaga'))}
{const m=grp(-6.8,0,5.3,KOM);box(6.0,1.3,.6,MARB2,0,.65,0,m);box(6.2,.14,.8,MARB,0,1.37,0,m);box(6.1,.06,.7,GOLD,0,1.3,0,m);
 board(5.4,1.0,640,120,(g,W,H)=>{g.fillStyle='#22304a';g.fillRect(0,0,W,H);g.fillStyle='#f0cf6a';g.font='30px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('ROYAL',W/2,H/2-14);g.font='16px '+PX;g.fillStyle='#bfe6ff';g.fillText('R E S I D E N C E',W/2,H/2+26)},0,.72,.33,m);
 sph(.16,GOLD,-3.1,1.55,0,m);sph(.16,GOLD,3.1,1.55,0,m);hedge(m,-2.4,.9,1.2,.5,.6);hedge(m,2.4,.9,1.2,.5,.6);
 lact(m,()=>say3(m,pick(['komplek paling cantik se-Jakarta','Royal Residence, 24 jam aman'])))}
{const f=grp(0,0,6.9,KOM);
 flat(6.2,6.2,'#efe6d2',0,.016,0,f);const r=new THREE.Mesh(new THREE.RingGeometry(3.0,3.2,40),LM('#d9b24c'));r.rotation.x=-Math.PI/2;r.position.set(0,.03,0);f.add(r);
 cyl(1.6,1.7,.4,MARB,0,.2,0,f,24);tor(1.62,.08,MARB,0,.42,0,f,Math.PI/2);tor(1.62,.02,GOLD,0,.5,0,f,Math.PI/2);cyl(1.4,1.4,.05,'#8fd0f0',0,.43,0,f,24);
 cyl(.3,.4,.8,MARB,0,.8,0,f,14);cyl(.8,.85,.1,MARB,0,1.25,0,f,18);cyl(.68,.68,.04,'#8fd0f0',0,1.3,0,f,18);cyl(.12,.18,.6,MARB,0,1.6,0,f,10);sph(.14,'#e6f6ff',0,1.95,0,f);
 kmx.drops=[];for(let i=0;i<12;i++)kmx.drops.push(mesh(new THREE.SphereGeometry(.05,6,5),BM('#bfe6ff'),0,1.95,0,f));kmx.fo=f;
 lact(f,()=>say3(f,pick(['air mancur komplek, bening banget','make a wish~'])));
 [-1,1].forEach(s=>{bench(f,s*3.4,0,s>0?-Math.PI/2:Math.PI/2);lamp(f,s*3.6,0,-2.6,2.0);lamp(f,s*3.6,0,2.4,2.0)})}
tree(KOM,-12,7.4,1.1);tree(KOM,12,7.5,1.1);tree(KOM,-5.2,7.8,1.0);tree(KOM,5.4,7.6,1.0);tree(KOM,3.3,-4.6,1.0);tree(KOM,4.7,-4.3,.9);tree(KOM,-5.6,-4.8,.9);
{const cols=['#e84a5f','#f2c14e','#f4a6c0','#a98bd6','#ffffff'];[[-9.2,6.4],[9.5,6.4],[-2.8,9.3],[2.8,9.3]].forEach(([x,z])=>{box(2.4,.32,.7,MARB,x,.16,z,KOM);box(2.45,.04,.75,GOLD,x,.32,z,KOM);box(2.2,.08,.5,'#5a3b22',x,.34,z,KOM);for(let i=0;i<8;i++)sph(.1,cols[i%5],x-.95+i*.27,.5+(i%2)*.06,z+(i%2)*.1-.05,KOM)})}
/* lampu jalan sepanjang trotoar */
[-11,-4.4,3.2,12.6].forEach(x=>lamp(KOM,x,0,-2.5,2.4));[-6,2.4,8.8].forEach(x=>lamp(KOM,x,0,3.9,2.4));
/* mobil: 2 parkir + 2 lewat */
{const pk1=car(KOM,'#f4efe4');pk1.position.set(-7.2,0,-.95);const pk2=car(KOM,'#1d3a78');pk2.position.set(5.2,0,-.95);
 const a=car(KOM,'#8b2a3c');a.position.set(-14,0,1.5);cars.push({g:a,v:2.6,x0:-15,x1:15});
 const b=car(KOM,'#2f7a45');b.position.set(14,0,2.7);b.rotation.y=Math.PI;cars.push({g:b,v:-2.0,x0:-15,x1:15})}
/* kucing komplek di pagar (hiasan, tap = meong) */
{const c=grp(-6.4,0,-2.4,KOM);box(.5,.3,.3,'#efe2c8',0,.15,0,c);sph(.17,'#efe2c8',.28,.28,0,c);cone(.06,.12,'#4b3426',.24,.45,.08,c,4);cone(.06,.12,'#4b3426',.34,.45,.08,c,4);box(.4,.07,.07,'#4b3426',-.4,.15,0,c);lact(c,()=>say3(c,pick(['meong~','Miko-nya mana? ini kucing komplek'])))}

/* ======================================================================
   NAVIGASI
   ====================================================================== */
const fd=document.createElement('div');fd.style.cssText='position:fixed;inset:0;background:#1c2438;opacity:0;pointer-events:none;transition:opacity .25s;z-index:30';document.body.appendChild(fd);
const barEl=document.getElementById('bar');
let CUR=0,busy=false,zoomed=false,baseDist=0,hid=[],lastNight=null;
const btnBack=document.createElement('button');btnBack.className='btn alt';btnBack.textContent='teras';btnBack.style.display='none';btnBack.onclick=()=>toTerrace();if(barEl)barEl.prepend(btnBack);
const trans=fn=>{if(busy)return;busy=true;fd.style.opacity=1;setTimeout(()=>{try{fn()}finally{fd.style.opacity=0;setTimeout(()=>{busy=false},260)}},270)};
const setZoom=z=>{if(z){if(!zoomed){baseDist=dist;zoomed=true}dist=Math.min(40,baseDist*z)}else if(zoomed){dist=baseDist;zoomed=false}};
const quiet=()=>{if(typeof sayEl!=='undefined')sayEl.style.display='none'};
function enter(G,cx,zoom,pw,id){
 CUR=id;S.children.forEach(o=>{if(!o.isLight)o.visible=(o===G)});
 mode=1;F2.on=true;F2.room=3;F2.cx=cx;F2.pc=0;F2.pw=pw;setZoom(zoom);
 goalT.set(cx,2.2,0);if(typeof tgt!=='undefined')tgt.copy(goalT);
 if(!hid.length&&barEl)hid=[...barEl.children].filter(b=>b!==btnBack&&b.style.display!=='none'&&/^(masuk rumah|taman|teras)$/.test(b.textContent.trim()));
 hid.forEach(b=>b.style.display='none');btnBack.style.display='';btnBack.textContent='teras';btnBack.onclick=()=>toTerrace();lgb.style.display='none';quiet()}
function goKafe(){trans(()=>enter(KAF,KX,ZK,4,1))}
function goKomplek(after){trans(()=>{enter(KOM,MX,ZM,11,2);if(typeof after==='function')after()})}
function toTerrace(){trans(()=>{
 CUR=0;setZoom(0);S.children.forEach(o=>{if(!o.isLight)o.visible=(o===TER)});
 mode=1;F2.on=true;F2.room=3;F2.cx=280;F2.pc=0;F2.pw=0;goalT.set(280,2.2,0);if(typeof tgt!=='undefined')tgt.copy(goalT);
 hid.forEach(b=>b.style.display='');hid=[];btnBack.style.display='none';lgb.style.display='none';quiet()})}

/* ======================================================================
   ANIMASI
   ====================================================================== */
function step(dt){
 if(!CUR)return;const t=performance.now()/1000;
 const nt=(typeof night!=='undefined')&&night;
 if(nt!==lastNight){lastNight=nt;const c=nt?'#ffd98a':'#f4e6b8';glows.forEach(m=>m.material.color.set(c));glass.forEach(m=>m.material.color.set(nt?'#ffcf7a':'#a9cbe6'));halos.forEach(h=>{h.material.opacity=nt?.85:0})}
 if(CUR===1){
  kfx.steam.forEach((q,i)=>{const u=(t*.4+i*.33)%1;q.position.y=2.1+u*.55;q.position.x=5.5+(i-1)*.07+Math.sin(t*3+i)*.03;q.material.opacity=1-u});
  kfx.flames.forEach((f,i)=>f.scale.y=.85+Math.sin(t*14+i)*.25);
  kfx.fl.forEach((b,i)=>{if(b.geometry.type==='SphereGeometry')b.scale.setScalar(.85+.3*Math.sin(t*3+i));else b.rotation.z=Math.sin(t*1.6+i)*.12});
  bar1.armR.rotation.x=-.7+Math.sin(t*3)*.35;bar1.armL.rotation.x=-.4+Math.sin(t*2.4+1)*.2;bar1.g.position.y=Math.abs(Math.sin(t*1.5))*.02}
 else if(CUR===2){
  cars.forEach(c=>{const p=c.g.position;p.x+=c.v*dt;if(p.x>c.x1)p.x=c.x0;if(p.x<c.x0)p.x=c.x1});
  kmx.drops.forEach((d,i)=>{const u=(t*.9+i/kmx.drops.length)%1,a=i*2.4;d.position.set(Math.cos(a)*u*.7,1.95+.9*4*u*(1-u)-.9*u,Math.sin(a)*u*.7)})}}
/* ---- API untuk mart3d.js (interior Royal Mart = ruang CUR 3) ---- */
window.KOMP={
 cur:()=>CUR,
 go:(G,cx,zoom,pw,id,after)=>trans(()=>{enter(G,cx,zoom,pw,id);if(typeof after==='function')after()}),   /* pindah ke ruang baru (G = grup, cx = x dunia) */
 goKomplek,goKafe,toTerrace,
 setBack:(label,fn)=>{btnBack.textContent=label;btnBack.onclick=fn}                                      /* ubah label + aksi tombol kembali */
};
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);try{step(dt)}catch(e){console.warn('komplek3d',e)}}}
})();