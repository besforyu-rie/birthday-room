/* basement3d.js — BASEMENT (ruang bawah tanah: garasi + mobil + dekor) dan tangga turun di ruang utama.
   Taruh sefolder dengan index.html, muat SETELAH floor2.js dan SEBELUM interact3d.js:
   <script src="floor2.js?v=1"></script>
   <script src="basement3d.js?v=1"></script>
   <script src="interact3d.js?v=3"></script>
   Cara kerja: lubang tangga turun ada di sisi kanan ruang utama, di sebelah tangga lantai 2 (sebelum lemari trofi).
   Tap lubang -> turun ke basement. Di basement ada tombol "naik" dan tangga di pojok kanan-belakang (tap = naik).
   Mau geser lubang tangga? Ubah angka di HOLE di bawah. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof hits==='undefined'||typeof lh==='undefined'||typeof lgb==='undefined'||
   typeof goalT==='undefined'||typeof lact==='undefined'||typeof act==='undefined'||typeof say3==='undefined'||typeof bx==='undefined'||
   typeof cy==='undefined'||typeof M==='undefined'||typeof amb==='undefined'||typeof sun==='undefined'||typeof lampL==='undefined')return;

/* ===== EDIT: posisi lubang tangga turun di ruang utama (koordinat dunia) ===== */
const HOLE={x:9.4,z:-1.6,w:1.4,l:2.0};
/* kamera saat naik kembali ke ruang utama */
const BACK={x:7.6,z:.6};

console.log('basement3d.js v1 loaded');
const F2=window.F2||(window.F2={on:false,room:0,cx:120});
const PX='"Press Start 2P",monospace';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
function cvTex(w,h,fn,px,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 if(px)t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 const d=()=>{g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true};d();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(d);return t}
const pl=(w,h,mat,x,y,z,p,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);if(ry)m.rotation.y=ry;p.add(m);return m};
const grp=(x,y,z,p,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;p.add(g);return g};
const sp=(r,c,x,y,z,p,basic)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),basic?BM(c):M(c));m.position.set(x,y,z);p.add(m);return m};
const bb=(w,h,d,c,x,y,z,p)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),BM(c));m.position.set(x,y,z);p.add(m);return m};
const cyx=(r,len,c,x,y,z,p)=>{const m=cy(r,r,len,c,x,y,z,p);m.rotation.z=Math.PI/2;return m};   /* silinder rebah, sumbu x */
const cyz=(r,len,c,x,y,z,p)=>{const m=cy(r,r,len,c,x,y,z,p);m.rotation.x=Math.PI/2;return m};   /* silinder rebah, sumbu z */
/* batang miring antara dua titik (bidang x-y) */
const bar=(ax,ay,bx_,by,th,c,z,p)=>{const L=Math.hypot(bx_-ax,by-ay),m=bx(L,th,th,c,(ax+bx_)/2,(ay+by)/2,z,p);m.rotation.z=Math.atan2(by-ay,bx_-ax);return m};
function signTex(txt,up){return cvTex(256,64,(g,W,H)=>{g.fillStyle='#f2c14e';g.fillRect(0,0,W,H);g.strokeStyle='#1f3a5f';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);
 g.fillStyle='#1f3a5f';g.font='16px '+PX;g.textAlign='left';g.textBaseline='middle';g.fillText(txt,18,H/2+2);g.beginPath();
 if(up){g.moveTo(212,44);g.lineTo(226,18);g.lineTo(240,44)}else{g.moveTo(212,18);g.lineTo(240,18);g.lineTo(226,44)}g.fill()})}
const mkSprite=(tex,x,y,z,p)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));s.scale.set(1.9,.48,1);s.position.set(x,y,z);p.add(s);return s};

const A={on:true,hl:false,wash:0,sq:0};

/* ======================================================================
   TANGGA TURUN DI RUANG UTAMA (sebelah tangga lantai 2)
   ====================================================================== */
const holeG=grp(HOLE.x,0,HOLE.z,S);
{const e=new THREE.Mesh(new THREE.PlaneGeometry(HOLE.w+.4,HOLE.l+1.0),M('#c9dbf1'));e.rotation.x=-Math.PI/2;e.position.set(HOLE.x+.05-HOLE.x,.011,0);holeG.add(e);
 const hw=HOLE.w/2,hl=HOLE.l/2;
 bx(HOLE.w-.1,.02,HOLE.l-.1,'#10203d',0,.03,0,holeG);
 ['#8a6038','#6b4a2c','#4a3320','#2a1d12'].forEach((c,i)=>bx(HOLE.w-.2,.025,(HOLE.l-.2)/4-.02,c,0,.045,hl-.2-(i+.5)*(HOLE.l-.2)/4+.0,holeG));
 bx(HOLE.w+.12,.06,.06,'#8a5a34',0,.04,-hl,holeG);bx(HOLE.w+.12,.06,.06,'#8a5a34',0,.04,hl,holeG);bx(.06,.06,HOLE.l,'#8a5a34',-hw,.04,0,holeG);bx(.06,.06,HOLE.l,'#8a5a34',hw,.04,0,holeG);
 /* pagar: kiri, kanan, belakang (sisi depan/+z dibiarkan terbuka untuk masuk) */
 [[hw,-hl],[hw,0],[-hw,-hl],[-hw,0],[hw,hl],[-hw,hl]].forEach(([x,z])=>bx(.06,.9,.06,'#8a5a34',x,.45,z,holeG));
 bx(.06,.06,HOLE.l,'#5a3b22',-hw,.9,0,holeG);bx(.06,.06,HOLE.l,'#5a3b22',hw,.9,0,holeG);bx(HOLE.w,.06,.06,'#5a3b22',0,.9,-hl,holeG);
 bx(HOLE.w,.18,.05,'#c9a876',0,.09,hl+.05,holeG);
 const hb=new THREE.Mesh(new THREE.BoxGeometry(HOLE.w+.2,.8,HOLE.l+.3),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hb.position.set(0,.4,0);holeG.add(hb)}
const signD=mkSprite(signTex('basement',false),0,2.7,0,holeG);
act(holeG,()=>goDown());

/* ======================================================================
   BASEMENT  (x = 240)
   ====================================================================== */
const BASE=new THREE.Group();BASE.position.set(240,0,0);S.add(BASE);BASE.visible=false;

/* cahaya khusus basement: lampu bohlam + lampu mobil */
const BL=new THREE.PointLight('#ffe9b8',.55,18);BL.position.set(240,3.6,.5);S.add(BL);
const HL=new THREE.PointLight('#fff0c0',0,7,2);HL.position.set(241.6,.9,-.7);S.add(HL);

/* kerangka ruangan */
const floorTex=cvTex(128,128,g=>{g.fillStyle='#8c96a3';g.fillRect(0,0,128,128);
 for(let i=0;i<90;i++){g.fillStyle=['#838d9a','#959fac','#7d8794'][i%3];g.fillRect((i*47)%128,(i*83)%128,3,2)}
 g.fillStyle='#6f7986';g.fillRect(0,0,128,2);g.fillRect(0,0,2,128);g.fillRect(0,63,128,1);g.fillRect(63,0,1,128)},true,[5,3.5]);
const blockTex=(rx,ry)=>cvTex(128,64,g=>{g.fillStyle='#5f6a79';g.fillRect(0,0,128,64);
 for(let r=0;r<4;r++){const off=r%2?16:0;for(let k=-1;k<5;k++){g.fillStyle=['#7c8796','#86919f','#747f8e','#808b9a'][(r+k+8)%4];g.fillRect(k*32+off+1,r*16+1,30,14)}}},true,[rx,ry]);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshLambertMaterial({map:floorTex}));fl.rotation.x=-Math.PI/2;BASE.add(fl);
 const bw=new THREE.Mesh(new THREE.PlaneGeometry(10,5),new THREE.MeshLambertMaterial({map:blockTex(5,3)}));bw.position.set(0,2.5,-3.5);BASE.add(bw);
 const lw=new THREE.Mesh(new THREE.PlaneGeometry(7,5),new THREE.MeshLambertMaterial({map:blockTex(3.5,3)}));lw.rotation.y=Math.PI/2;lw.position.set(-5,2.5,0);BASE.add(lw);
 bx(10,.5,.1,'#4a5568',0,.25,-3.45,BASE);bx(.1,.5,7,'#4a5568',-4.95,.25,0,BASE);bx(10,.2,.2,'#2e527f',0,0,3.5,BASE)}
/* garis parkir */
bb(3.9,.012,.07,'#f2c14e',-.5,.012,.38,BASE);bb(3.9,.012,.07,'#f2c14e',-.5,.012,-1.78,BASE);bb(.07,.012,2.16,'#f2c14e',-2.45,.012,-.7,BASE);

/* pipa di dinding belakang */
cyx(.07,9.6,'#b87333',0,4.35,-3.3,BASE);cyx(.06,9.6,'#8a97ab',0,4.05,-3.3,BASE);
[-4,-2,0,2,4].forEach(x=>{bx(.1,.5,.08,'#4a5568',x,4.2,-3.38,BASE)});
[-4.8,4.8].forEach(x=>{sp(.1,'#b87333',x,4.35,-3.3,BASE);sp(.09,'#8a97ab',x,4.05,-3.3,BASE)});
cy(.06,.06,.3,'#e84a5f',-2.6,4.35,-3.3,BASE).rotation.x=Math.PI/2;

/* jendela kecil di atas (pemandangan siang/malam) */
const WIN={};
bx(1.9,1.0,.1,'#3b4558',-.2,3.55,-3.46,BASE);
WIN.pane=pl(1.6,.7,BM('#8fd0f0'),-.2,3.55,-3.41,BASE);
WIN.grass=pl(1.6,.2,BM('#6fb36f'),-.2,3.3,-3.405,BASE);
WIN.sun=pl(.22,.22,BM('#f9d45c'),.3,3.75,-3.4,BASE);WIN.moon=pl(.2,.2,BM('#e6f6ff'),.3,3.75,-3.4,BASE);
WIN.stars=[0,1,2,3,4].map(i=>pl(.04,.04,BM('#ffffff'),-.8+((i*37)%10)/10*1.2,3.55+((i*53)%10)/10*.25,-3.4,BASE));
bx(.05,.7,.04,'#3b4558',-.2,3.55,-3.38,BASE);bx(1.6,.05,.04,'#3b4558',-.2,3.55,-3.38,BASE);

/* papan "garasi" */
{const t=cvTex(256,64,(g,W,H)=>{g.fillStyle='#1f3a5f';g.fillRect(0,0,W,H);g.strokeStyle='#f4a6c0';g.lineWidth=5;g.strokeRect(4,4,W-8,H-8);g.fillStyle='#8fd0f0';g.font='20px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('GARASI',W/2,H/2+2)},true);
 pl(1.6,.4,BM('#ffffff',{map:t}),-.6,2.55,-3.46,BASE)}

/* bohlam gantung (tap = lampu nyala/mati) */
const bulbs=[];
function bulb(x,y,z){const g=grp(x,0,z,BASE);cy(.012,.012,1.3,'#222a36',0,y+.75,0,g);cy(.06,.06,.14,'#2a2f3a',0,y+.05,0,g);
 const b=sp(.13,'#fff3b0',0,y-.1,0,g,true);g.userData.b=b;bulbs.push(g);lact(g,toggleLamp);return g}
bulb(-.6,3.7,-.6);bulb(3.4,3.9,1.4);
const BULBPOS=bulbs.map(b=>b.position.x);
function toggleLamp(){A.on=!A.on;bulbs.forEach(g=>g.userData.b.material.color.set(A.on?'#fff3b0':'#6f6a58'));say3(bulbs[0],A.on?'lampu nyala':'gelap... nyalakan mobil aja')}

/* kotak sekring (tap = lampu) */
const fuse=grp(.9,2.3,-3.43,BASE);bx(.7,.9,.12,'#4a5568',0,0,0,fuse);bx(.6,.8,.04,'#6b778a',0,0,.07,fuse);
bb(.16,.08,.02,'#f2c14e',0,.28,.1,fuse);
const lever=grp(0,-.05,.11,fuse);bx(.06,.3,.04,'#e84a5f',0,.1,0,lever);bx(.14,.14,.05,'#2a3a52',0,0,-.01,lever);
[-.18,.18].forEach(x=>[.28,-.28].forEach(y=>sp(.025,'#2a3a52',x,y-.05,.1,fuse)));
lact(fuse,toggleLamp);

/* ---------------- MOBIL (menghadap +x) ---------------- */
const car=grp(-.5,0,-.7,BASE);
const BODY='#e84a5f',ROOF='#fff6c8';
{const sh=pl(3.7,1.9,BM('#000000',{transparent:true,opacity:.22,depthWrite:false}),0,.02,0,car);sh.rotation.x=-Math.PI/2}
bx(3.3,.5,1.5,BODY,0,.58,0,car);bx(3.32,.07,1.52,ROOF,0,.72,0,car);
bx(1.75,.62,1.36,BODY,-.15,1.14,0,car);bx(1.62,.08,1.3,ROOF,-.15,1.49,0,car);
[.69,-.69].forEach(z=>{bb(1.45,.38,.02,'#8fd0f0',-.15,1.15,z,car);bx(.08,.4,.04,BODY,-.15,1.15,z,car)});
bb(.02,.38,1.12,'#8fd0f0',.73,1.15,0,car);bb(.02,.38,1.12,'#8fd0f0',-1.03,1.15,0,car);
[1.67,-1.67].forEach(x=>bx(.14,.22,1.56,'#cfd6e0',x,.38,0,car));
bx(.06,.18,.7,'#2a3a52',1.66,.58,0,car);
const heads=[.5,-.5].map(z=>{const h=sp(.13,'#e8dcc4',1.65,.7,z,car,true);h.scale.x=.6;return h});
[.55,-.55].forEach(z=>bb(.06,.14,.28,'#c8283d',-1.66,.7,z,car));
[[1.0,.78],[1.0,-.78],[-1.0,.78],[-1.0,-.78]].forEach(([x,z])=>{cyz(.34,.2,'#22262e',x,.34,z,car);cyz(.16,.22,'#cfd6e0',x,.34,z,car)});
[.78,-.78].forEach(z=>bx(.08,.12,.14,BODY,.62,1.0,z*1.0,car));
{const t=cvTex(128,40,(g,W,H)=>{g.fillStyle='#f3f8ff';g.fillRect(0,0,W,H);g.strokeStyle='#1f3a5f';g.lineWidth=4;g.strokeRect(2,2,W-4,H-4);g.fillStyle='#1f3a5f';g.font='14px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('AQSA26',W/2,H/2+2)},true);
 pl(.5,.16,BM('#ffffff',{map:t}),1.745,.4,0,car,Math.PI/2)}
/* pita kado di atap */
bx(1.64,.1,.14,'#f4a6c0',-.15,1.54,0,car);bx(.14,.1,1.34,'#f4a6c0',-.15,1.54,0,car);[.15,-.15].forEach(z=>{const s=sp(.17,'#f4a6c0',-.15,1.68,z,car);s.scale.set(1.2,.7,.8)});sp(.07,'#e84a5f',-.15,1.66,0,car);
/* sorot lampu di lantai */
const beam=pl(2.2,1.3,BM('#fff6c8',{transparent:true,opacity:0,depthWrite:false}),2.9,.025,0,car);beam.rotation.x=-Math.PI/2;
const CARSAY=['tin tin!','mobilnya udah dicuci loh','mau jalan-jalan? nanti ya','bensinnya penuh!','ada pita kadonya di atap~'];
function honk(){if(typeof SFX!=='undefined'&&SFX.on===false)return;try{window._bsAc=window._bsAc||new (window.AudioContext||window.webkitAudioContext)();const ac=window._bsAc;ac.resume();
 [0,.36].forEach(d=>[349,440].forEach(f=>{const o=ac.createOscillator(),g=ac.createGain(),T=ac.currentTime+d;o.type='square';o.frequency.value=f;g.gain.setValueAtTime(.05,T);g.gain.setValueAtTime(.05,T+.16);g.gain.exponentialRampToValueAtTime(.0001,T+.28);o.connect(g);g.connect(ac.destination);o.start(T);o.stop(T+.3)}))}catch(e){}}
lact(car,()=>{A.hl=!A.hl;A.sq=1;honk();say3(car,pick(CARSAY))});

/* ---------------- TANGGA NAIK (pojok kanan-belakang) ---------------- */
const stairU=grp(0,0,0,BASE);
const SU={x0:1.7,n:9,run:.32,rise:.36,z:-2.9,w:1.2},top=SU.n*SU.rise,xe=SU.x0+SU.n*SU.run;
for(let i=0;i<SU.n;i++){const h=(i+1)*SU.rise;bx(SU.run,h,SU.w,i%2?'#a8743f':'#c98b52',SU.x0+i*SU.run+SU.run/2,h/2,SU.z,stairU)}
bx(.4,.15,SU.w,'#a8743f',xe+.2,top-.075,SU.z,stairU);
{const zf=SU.z+SU.w/2-.05;
 for(let i=0;i<SU.n;i+=2)bx(.06,.9,.06,'#8a5a34',SU.x0+i*SU.run+SU.run/2,(i+1)*SU.rise+.45,zf,stairU);
 bx(.06,.9,.06,'#8a5a34',xe+.3,top+.45,zf,stairU);
 bar(SU.x0,SU.rise+.9,xe+.35,top+.9,.07,'#5a3b22',zf,stairU)}
/* pintu terang di ujung atas */
bx(1.3,2.3,.12,'#5a3b22',4.45,top+1.15,-3.44,stairU);
pl(1.05,2.1,BM('#fff4cc'),4.45,top+1.1,-3.38,stairU);
bx(.04,2.1,.03,'#5a3b22',4.45,top+1.1,-3.36,stairU);bx(1.05,.04,.03,'#5a3b22',4.45,top+1.1,-3.36,stairU);
const signU=mkSprite(signTex('ruang utama',true),3.0,4.3,-2.7,BASE);
lact(stairU,()=>goUp());

/* ---------------- BANGKU KERJA + PAPAN PERKAKAS (dinding kiri) ---------------- */
const bench=grp(-4.35,0,-1.0,BASE,Math.PI/2);
bx(1.9,.1,.8,'#8a5a34',0,1.0,0,bench);[[-.85,-.3],[.85,-.3],[-.85,.3],[.85,.3]].forEach(([x,z])=>bx(.1,1.0,.1,'#5a3b22',x,.5,z,bench));
bx(1.7,.08,.7,'#6b4a2c',0,.35,0,bench);bx(.5,.2,.3,'#e84a5f',-.5,.49,0,bench);bx(.4,.25,.3,'#4f8fe8',.3,.51,0,bench);
bx(.22,.2,.22,'#4a5568',-.75,1.15,.1,bench);bx(.28,.05,.08,'#2a3a52',-.75,1.27,.1,bench);
bx(.04,.3,.04,'#8a5a34',-.2,1.17,.2,bench).rotation.z=1.57;bx(.14,.08,.08,'#8a97ab',-.05,1.07,.2,bench);
bx(.34,.16,.1,'#f2c14e',.4,1.11,.2,bench);bx(.08,.16,.18,'#2a3a52',.28,1.11,.2,bench);cy(.08,.08,.18,'#cfe0f6',.7,1.1,-.1,bench);
{const lp=grp(.8,1.05,-.2,bench);cy(.04,.04,.35,'#2a3a52',0,.18,0,lp);bar(0,.35,-.2,.55,.03,'#2a3a52',0,lp);cy(.1,.16,.14,'#f2c14e',-.2,.5,0,lp)}
{const pg=grp(-4.93,2.7,-1.0,BASE);bx(.05,1.6,2.1,'#c9a876',0,0,0,pg);
 const t=cvTex(200,150,(g,W,H)=>{g.fillStyle='#d2b284';g.fillRect(0,0,W,H);g.fillStyle='#b39368';for(let y=6;y<H;y+=12)for(let x=6;x<W;x+=12)g.fillRect(x,y,2,2);
  g.fillStyle='#8a5a34';g.fillRect(24,40,8,70);g.fillStyle='#8a97ab';g.fillRect(14,30,28,14);
  g.fillStyle='#cfd6e0';g.fillRect(70,40,8,80);g.beginPath();g.arc(74,36,12,0,7);g.fill();g.fillStyle='#d2b284';g.fillRect(70,22,8,12);
  g.fillStyle='#e84a5f';g.fillRect(106,64,10,44);g.fillStyle='#cfd6e0';g.fillRect(109,30,4,34);
  g.fillStyle='#cfd6e0';g.fillRect(134,40,50,22);g.fillStyle='#8a5a34';g.fillRect(126,36,12,34);for(let k=0;k<8;k++)g.fillRect(140+k*6,62,3,5);
  g.fillStyle='#4f8fe8';g.fillRect(138,90,14,40);g.fillRect(162,90,14,40);g.fillStyle='#8a97ab';g.fillRect(138,84,38,8)},true);
 pl(2.0,1.5,BM('#ffffff',{map:t}),.04,0,0,pg,Math.PI/2)}
const BENCHSAY=['lagi benerin apa nih?','paku, baut, lem... lengkap','awas ketiban palu'];
lact(bench,()=>say3(bench,pick(BENCHSAY)));

/* ---------------- PAPAN DART ---------------- */
const dart=grp(-4.93,3.0,.9,BASE);
cyx(.5,.06,'#2a1d12',0,0,0,dart);
{const t=cvTex(128,128,(g,W,H)=>{const c=W/2;[['#1f2330',62],['#f6f0e6',56],['#e84a5f',46],['#f6f0e6',38],['#4fa05a',28],['#f6f0e6',20],['#e84a5f',10],['#4fa05a',4]].forEach(([col,r],i)=>{g.fillStyle=i%2?col:col;g.beginPath();g.arc(c,c,r,0,7);g.fill()});
  g.strokeStyle='#1f2330';g.lineWidth=2;for(let k=0;k<10;k++){const a=k*Math.PI/10;g.beginPath();g.moveTo(c+Math.cos(a)*10,c+Math.sin(a)*10);g.lineTo(c+Math.cos(a)*56,c+Math.sin(a)*56);g.moveTo(c-Math.cos(a)*10,c-Math.sin(a)*10);g.lineTo(c-Math.cos(a)*56,c-Math.sin(a)*56);g.stroke()}},true);
 pl(.96,.96,BM('#ffffff',{map:t}),.04,0,0,dart,Math.PI/2)}
[[.06,.12,-.04],[.06,-.15,.2],[.06,.2,.1]].forEach(([x,y,z],i)=>{const d=cyx(.012,.22,i%2?'#e84a5f':'#4f8fe8',x+.1,y,z,dart);d.rotation.z=Math.PI/2});
const DARTSAY=['bullseye!','meleset dikit...','100 poin!','sekali lagi ah'];
lact(dart,()=>say3(dart,pick(DARTSAY)));

/* ---------------- MESIN CUCI (tap = muter) ---------------- */
const WM_X=-4.3,wm=grp(WM_X,0,2.2,BASE);
bx(.95,1.1,.95,'#e8eef7',0,.55,0,wm);bx(.97,.08,.97,'#cfd6e0',0,1.12,0,wm);bx(.04,.2,.95,'#cfe0f6',.49,.98,0,wm);
cyx(.33,.05,'#cfd6e0',.49,.5,0,wm);cyx(.27,.05,'#7fa8d4',.5,.5,0,wm);
const clothes=grp(.53,.5,0,wm);bx(.04,.3,.1,'#f4a6c0',0,0,0,clothes);bx(.04,.1,.3,'#f2c14e',0,.06,0,clothes);bx(.04,.2,.18,'#4f8fe8',0,-.04,.05,clothes);
[[.2,.97],[-.2,.97]].forEach(([z])=>cyx(.05,.04,'#4f8fe8',.51,.98,z,wm));
const WMSAY=['cuci baju dulu~','srrrr... wangi sabun','kaos kesayangan jangan sampai luntur'];
lact(wm,()=>{A.wash=3.2;say3(wm,pick(WMSAY))});

/* ---------------- RAK BESI + KARDUS ---------------- */
const shelf=grp(-3.6,0,-3.05,BASE);
[[-.95,-.25],[.95,-.25],[-.95,.25],[.95,.25]].forEach(([x,z])=>bx(.06,3.4,.06,'#8a97ab',x,1.7,z,shelf));
[.35,1.2,2.05,2.9].forEach(y=>bx(2.0,.05,.6,'#b9c4d4',0,y,0,shelf));
bx(.8,.6,.5,'#c9a876',-.5,.68,0,shelf);bx(.6,.5,.5,'#bf9b68',.35,.63,0,shelf);bx(.25,.04,.5,'#f6f0e6',.35,.9,0,shelf);
[['#e84a5f',-.7],['#4f8fe8',-.4],['#f2c14e',-.1]].forEach(([c,x])=>{cy(.14,.14,.24,c,x,1.34,0,shelf);cy(.15,.15,.03,'#cfd6e0',x,1.47,0,shelf)});
cy(.1,.1,.3,'#cfe0f6',.3,1.38,0,shelf);cy(.1,.1,.2,'#8fd18a',.6,1.32,0,shelf);
bx(.5,.35,.4,'#8dbdf7',-.5,2.25,0,shelf);bx(.5,.3,.4,'#a98bd6',.1,2.22,0,shelf);sp(.18,'#f2c14e',.65,2.28,0,shelf);
bx(.9,.5,.5,'#c9a876',-.4,3.2,0,shelf);
{const t=cvTex(96,32,(g,W,H)=>{g.fillStyle='#f6f0e6';g.fillRect(0,0,W,H);g.fillStyle='#1f3a5f';g.font='11px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('kenangan',W/2,H/2+1)},true);
 pl(.7,.23,BM('#ffffff',{map:t}),-.4,3.2,.26,shelf)}
bx(.6,.4,.45,'#e84a5f',.5,3.15,0,shelf);
const SHSAY=['kardus kenangan, jangan dibuka dulu','ada cat sisa dekor kamar','banyak barang lama di sini'];
lact(shelf,()=>say3(shelf,pick(SHSAY)));

/* ---------------- PEMANAS AIR (boiler) ---------------- */
const boiler=grp(-1.6,0,-3.0,BASE);
cy(.42,.42,2.0,'#d6dde8',0,1.15,0,boiler);cy(.44,.44,.06,'#8a97ab',0,.15,0,boiler);cy(.3,.3,.08,'#8a97ab',0,2.19,0,boiler);cy(.44,.44,.06,'#8a97ab',0,2.05,0,boiler);
cy(.04,.04,2.2,'#b87333',.15,3.25,0,boiler);cy(.04,.04,1.6,'#8a97ab',-.15,2.95,0,boiler);
{const gg=grp(0,1.6,.43,boiler);cyz(.1,.04,'#ffffff',0,0,0,gg);const nd=bb(.014,.08,.01,'#e84a5f',0,.035,.03,gg);boiler.userData.nd=nd;gg.userData.nd=nd;boiler.userData.gg=gg}
bx(.5,.18,.04,'#f2c14e',0,1.1,.43,boiler);
const BOILSAY=['air panasnya siap','suara gemericik... aman kok','jangan diutak-atik ya'];
lact(boiler,()=>say3(boiler,pick(BOILSAY)));

/* ---------------- SEPEDA ---------------- */
const bike=grp(3.1,0,1.9,BASE);
[-.6,.6].forEach(x=>{const w=new THREE.Mesh(new THREE.TorusGeometry(.38,.035,6,18),M('#2a2f3a'));w.position.set(x,.4,0);bike.add(w);sp(.05,'#cfd6e0',x,.4,0,bike)});
bar(-.6,.4,-.1,.35,.05,'#4f8fe8',0,bike);bar(-.1,.35,-.3,.95,.05,'#4f8fe8',0,bike);bar(-.3,.95,.4,.95,.05,'#4f8fe8',0,bike);
bar(.4,.95,.6,.4,.05,'#8a97ab',0,bike);bar(-.1,.35,.4,.95,.05,'#4f8fe8',0,bike);bar(-.6,.4,-.3,.95,.05,'#4f8fe8',0,bike);
bx(.04,.04,.5,'#2a2f3a',.4,1.05,0,bike);bx(.26,.06,.14,'#2a2f3a',-.32,1.02,0,bike);
bx(.3,.2,.4,'#c98b52',.62,.98,0,bike);sp(.07,'#f4a6c0',.62,1.14,.08,bike);sp(.06,'#f2c14e',.66,1.14,-.07,bike);
const BIKESAY=['kring kring!','udah lama nggak dipakai','ayo gowes sore-sore'];
lact(bike,()=>say3(bike,pick(BIKESAY)));

/* ---------------- TUMPUKAN KARDUS DEKOR ULTAH ---------------- */
const boxes=grp(4.2,0,-.5,BASE);
bx(.9,.6,.9,'#c9a876',0,.3,0,boxes);bx(.92,.04,.18,'#f6f0e6',0,.6,0,boxes);
{const b2=bx(.7,.5,.7,'#bf9b68',.05,.85,.05,boxes);b2.rotation.y=.2;const b3=bx(.5,.4,.5,'#d4b685',-.1,1.3,0,boxes);b3.rotation.y=-.15}
{const hat=new THREE.Mesh(new THREE.ConeGeometry(.14,.4,10),M('#f4a6c0'));hat.position.set(-.1,1.7,0);boxes.add(hat);sp(.05,'#f2c14e',-.1,1.92,0,boxes)}
{const t=cvTex(96,32,(g,W,H)=>{g.fillStyle='#f6f0e6';g.fillRect(0,0,W,H);g.fillStyle='#e84a5f';g.font='10px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('dekor ultah',W/2,H/2+1)},true);
 pl(.7,.23,BM('#ffffff',{map:t}),0,.3,.46,boxes)}
const BOXSAY=['sisa dekor ultah tahun lalu','ada topi pesta di atasnya','balonnya masih banyak'];
lact(boxes,()=>say3(boxes,pick(BOXSAY)));

/* ======================================================================
   NAVIGASI & HUD
   ====================================================================== */
const fd=document.createElement('div');fd.style.cssText='position:fixed;inset:0;background:#1f3a5f;opacity:0;pointer-events:none;transition:opacity .25s;z-index:30';document.body.appendChild(fd);
let busy=false,IN=false,sv=null;
const trans=fn=>{if(busy)return;busy=true;fd.style.opacity=1;setTimeout(()=>{try{fn()}finally{fd.style.opacity=0;setTimeout(()=>{busy=false},260)}},270)};
const barEl=document.getElementById('bar');
const btnUp=document.createElement('button');btnUp.className='btn alt';btnUp.textContent='naik';btnUp.style.display='none';btnUp.onclick=()=>goUp();if(barEl)barEl.prepend(btnUp);

function goDown(){trans(()=>{
 if(IN)return;IN=true;
 sv={bg:S.background&&S.background.clone?S.background.clone():null,amb:amb.intensity,sun:sun.intensity,lamp:lampL.intensity};
 if(S.background&&S.background.set)S.background.set('#1d2434');
 sun.intensity=.18;lampL.intensity=0;amb.intensity=A.on?.55:.14;
 S.children.forEach(o=>{if(!o.isLight)o.visible=(o===BASE)});BASE.visible=true;
 mode=1;F2.on=true;F2.room=3;F2.cx=240;
 goalT.set(240,2.2,0);if(typeof tgt!=='undefined')tgt.copy(goalT);
 lgb.style.display='none';if(typeof vb!=='undefined')vb.style.display='none';const st=document.getElementById('sticky');if(st)st.style.display='none';
 btnUp.style.display='';if(typeof sayEl!=='undefined')sayEl.style.display='none'})}
function goUp(){trans(()=>{
 if(!IN)return;IN=false;
 if(sv){if(sv.bg&&S.background&&S.background.copy)S.background.copy(sv.bg);amb.intensity=sv.amb;sun.intensity=sv.sun;lampL.intensity=sv.lamp;sv=null}
 BL.intensity=A.on?.55:0;
 /* pulihkan ruang utama lewat tombol lounge (dua kali: ke lounge lalu balik) */
 if(typeof lgb.onclick==='function'){lgb.onclick();lgb.onclick()}
 S.children.forEach(o=>{if(o.isGroup&&o.position.x>=100&&o.position.y===0&&o.position.z===0)o.visible=false});
 F2.on=false;F2.room=0;lgb.style.display='';btnUp.style.display='none';
 goalT.set(BACK.x,2.2,BACK.z);if(typeof tgt!=='undefined')tgt.copy(goalT);
 if(typeof sayEl!=='undefined')sayEl.style.display='none'})}

/* ======================================================================
   ANIMASI PER FRAME
   ====================================================================== */
const SGD=2.7,SGU=4.3;let lastNight=null;
function step(dt){
 const t=performance.now()/1000;
 signD.position.y=SGD+Math.sin(t*2.2)*.12;
 if(!IN)return;
 signU.position.y=SGU+Math.sin(t*2.2)*.12;
 const k=Math.min(1,dt*6);
 BL.intensity+=((A.on?.55:0)-BL.intensity)*k;amb.intensity+=((A.on?.55:.14)-amb.intensity)*k;
 HL.intensity+=((A.hl?1.6:0)-HL.intensity)*k;beam.material.opacity+=((A.hl?.3:0)-beam.material.opacity)*k;
 heads.forEach(h=>h.material.color.set(A.hl?'#ffffff':'#e8dcc4'));
 if(A.sq>0){A.sq-=dt*1.6;const q=Math.max(0,A.sq);car.position.y=Math.abs(Math.sin(q*10))*.06*q}else car.position.y=0;
 if(A.wash>0){A.wash-=dt;clothes.rotation.x+=dt*10;wm.position.x=WM_X+Math.sin(t*60)*.008}else wm.position.x=WM_X;
 bulbs.forEach((g,i)=>{g.rotation.z=Math.sin(t*1.1+i*2)*.03});
 lever.rotation.z+=((A.on?-.5:.5)-lever.rotation.z)*k;
 if(boiler.userData.gg)boiler.userData.gg.children[1].rotation.z=Math.sin(t*.8)*.5;
 const nt=(typeof night!=='undefined')&&night;
 if(nt!==lastNight){lastNight=nt;WIN.pane.material.color.set(nt?'#141f4a':'#8fd0f0');WIN.sun.visible=!nt;WIN.moon.visible=nt;WIN.stars.forEach(s=>s.visible=nt);WIN.grass.material.color.set(nt?'#1f4a3a':'#6fb36f')}}
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);try{step(dt)}catch(e){console.warn('basement3d',e)}}}
})();