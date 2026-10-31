/* floor2.js — LANTAI 2 (ruang tidur + ruang makan & dapur) dan tangga di ruang utama.
   Taruh sefolder dengan index.html, muat PALING AKHIR (setelah secret3d.js):
   <script src="floor2.js?v=1"></script>
   Cara kerja: tangga ada di sisi kanan-depan ruang utama (dekat lemari trofi). Tap tangga -> naik.
   Di lantai 2 ada tombol "turun" dan tombol pindah ruangan (tidur <-> makan).
   Mau geser tangga? Ubah angka di STAIR di bawah. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof hits==='undefined'||typeof lh==='undefined'||typeof lgb==='undefined'||typeof goalT==='undefined')return;

/* ===== EDIT: posisi & ukuran tangga di ruang utama (koordinat dunia) ===== */
const STAIR={x:9.4,z:2.55,w:1.4,n:9,run:.44,rise:.33};
/* kamera saat turun kembali ke lantai 1 */
const BACK={x:7.4,z:4.2};

console.log('floor2.js v11 loaded');
/* lencana tes sementara: muncul merah di pojok kiri-bawah saat di lantai 2. Kalau tidak muncul = browser memuat floor2.js yang lama. Hapus 3 baris BADGE kalau sudah beres. */
const BADGE=document.createElement('div');BADGE.textContent='floor2 v11';BADGE.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;background:#e84a5f;color:#fff;font:11px monospace;padding:3px 6px;display:none;pointer-events:none';document.body.appendChild(BADGE);
const PX='"Press Start 2P",monospace',VT='VT323,monospace';
const F2=window.F2={on:false,room:0,cx:120};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));

function cvTex(w,h,fn,px,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 if(px)t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 const d=()=>{g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true};d();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(d);return t}
const pl=(w,h,mat,x,y,z,p,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);if(ry)m.rotation.y=ry;p.add(m);return m};
const grp=(x,y,z,p,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;p.add(g);return g};
const sp=(r,c,x,y,z,p,basic)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),basic?BM(c):M(c));m.position.set(x,y,z);p.add(m);return m};
function sign(txt,w,h,p,x,y,z,ry,col){const t=cvTex(256,64,(g,W,H)=>{g.fillStyle=col||'#f3f8ff';g.fillRect(0,0,W,H);g.strokeStyle='#1f3a5f';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);
 g.fillStyle='#1f3a5f';g.font='16px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,W/2,H/2+2)});
 return pl(w,h,BM('#ffffff',{map:t,side:THREE.DoubleSide}),x,y,z,p,ry)}

/* ===== lampu bersama (satu saja supaya ringan) ===== */
const L2=new THREE.PointLight('#ffe2b0',.3,16);L2.position.set(120,3.6,.5);S.add(L2);
/* redam lampu scene utama (ambient/directional) selama di lantai 2 — kalau masih terlalu terang, kecilkan DIM */
const DIM=1,LBASE=new Map();
function dimLights(on){const found=[];S.traverse(o=>{if(o.isLight&&o!==L2&&o!==pLight){if(!LBASE.has(o))LBASE.set(o,o.intensity);o.intensity=on?LBASE.get(o)*DIM:LBASE.get(o);found.push(o.type+':'+LBASE.get(o)+'->'+o.intensity)}});console.log('floor2 dimLights',on,found)}

/* ===== kerangka ruangan (lantai, dinding belakang & kiri, lis) ===== */
function shell(g,o){
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),o.floorMat);fl.rotation.x=-Math.PI/2;g.add(fl);
 const WM=o.flat?BM:M;const bw=new THREE.Mesh(new THREE.PlaneGeometry(10,5),WM(o.wallB));bw.position.set(0,2.5,-3.5);g.add(bw);
 const lw=new THREE.Mesh(new THREE.PlaneGeometry(7,5),WM(o.wallL));lw.rotation.y=Math.PI/2;lw.position.set(-5,2.5,0);g.add(lw);
 bx(10,.9,.1,o.trim,0,.45,-3.45,g);bx(.1,.9,7,o.trim,-4.95,.45,0,g);bx(10,.2,.2,'#2e527f',0,0,3.5,g)}
/* jendela di dinding belakang; langit ganti siang/malam */
const WIN=[];
function windowAt(g,x,y,w,h){
 bx(w+.3,h+.3,.08,'#ffffff',x,y,-3.46,g);
 const pane=pl(w,h,BM('#8fd0f0'),x,y,-3.41,g);
 const sun=pl(.3,.3,BM('#f9d45c'),x+w*.2,y+h*.2,-3.405,g),moon=pl(.26,.26,BM('#e6f6ff'),x+w*.2,y+h*.2,-3.405,g);
 const stars=[0,1,2,3,4,5].map(i=>pl(.05,.05,BM('#ffffff'),x-w*.4+((i*37)%10)/10*w*.8,y-h*.05+((i*53)%10)/10*h*.4,-3.404,g));
 const hill=pl(w,h*.28,BM('#6fb36f'),x,y-h*.36,-3.408,g);
 bx(.06,h,.05,'#ffffff',x,y,-3.38,g);bx(w,.06,.05,'#ffffff',x,y,-3.38,g);bx(w+.4,.08,.22,'#ffffff',x,y-h/2-.15,-3.36,g);
 bx(.4,h+.6,.12,'#f4a6c0',x-w/2-.25,y,-3.36,g);bx(.4,h+.6,.12,'#f4a6c0',x+w/2+.25,y,-3.36,g);bx(w+1.2,.08,.1,'#8a5a34',x,y+h/2+.4,-3.36,g);
 WIN.push({pane,sun,moon,stars,hill})}
/* pintu */
function door(par,x,z,ry,txt,col,dk,fn){const g=grp(x,0,z,par,ry);
 bx(1.5,2.85,.14,'#5a3b22',0,1.42,0,g);bx(1.2,2.65,.1,col,0,1.32,.06,g);bx(.85,.95,.04,dk,0,1.95,.12,g);bx(.85,.95,.04,dk,0,.7,.12,g);
 sp(.07,'#f2c14e',.45,1.25,.16,g);sign(txt,1.3,.33,g,0,3.1,.09,0);
 const m=pl(1.1,.55,M('#e84a5f'),0,.015,.55,g);m.rotation.x=-Math.PI/2;lact(g,fn);return g}

const A={wdT:0,wd:0,frT:0,fr:0,stove:false,water:0,lamp:false,pend:true};

/* ======================================================================
   RUANG TIDUR  (x = 120)
   ====================================================================== */
const BED=new THREE.Group();BED.position.set(120,0,0);S.add(BED);BED.visible=false;
const woodTex=cvTex(128,128,g=>{for(let r=0;r<8;r++){g.fillStyle=['#d9b98a','#cfae7c','#dcbf92','#c9a876'][r%4];g.fillRect(0,r*16,128,16);g.fillStyle='#b8925f';g.fillRect(0,r*16+15,128,1);g.fillRect((r*37)%128,r*16,1,15)}},true,[5,3.5]);
shell(BED,{floorMat:new THREE.MeshLambertMaterial({map:woodTex}),wallB:'#c4b2ee',wallL:'#d3c6f3',trim:'#efe6ff'});
windowAt(BED,3.3,3.1,1.7,1.3);
/* lampu tali di dinding belakang */
const fairy=[];for(let i=0;i<17;i++){const u=i/16,b=sp(.06,['#f2c14e','#f4a6c0','#8fd0f0','#ffffff','#8fd18a'][i%5],-4.8+u*9.6,4.6-.25*Math.sin(u*Math.PI*4)*.5,-3.4,BED,true);fairy.push(b)}
/* karpet */
[[2,'#a98bd6'],[1.6,'#f4a6c0'],[1.1,'#fff6c8']].forEach(([r,c],i)=>{const m=cy(r,r,.02,c,.1,.012+i*.004,1.1,BED);m.scale.z=.7});
/* tempat tidur */
const bed=grp(2.7,0,-1.8,BED);
bx(2.4,.3,3.3,'#8a5a34',0,.3,0,bed);[[-1.1,-1.55],[1.1,-1.55],[-1.1,1.55],[1.1,1.55]].forEach(([x,z])=>bx(.15,.3,.15,'#5a3b22',x,.15,z,bed));
bx(2.2,.32,3.1,'#fffdf3',0,.6,0,bed);bx(2.24,.16,2.0,'#8fd0f0',0,.8,.55,bed);bx(2.26,.17,.14,'#ffffff',0,.81,-.5,bed);
bx(.9,.2,.55,'#ffffff',-.55,.85,-1.2,bed);bx(.9,.2,.55,'#f4a6c0',.55,.85,-1.2,bed);bx(2.5,1.3,.14,'#8a5a34',0,1.0,-1.6,bed);bx(2.5,.12,.2,'#5a3b22',0,1.68,-1.6,bed);
const BEDSAY=['zzz... lima menit lagi','kasurnya empuk banget','bantalnya wangi','jangan bangunin, lagi mimpi kue'];
lact(bed,()=>say3(bed,pick(BEDSAY)));
/* meja samping + lampu tidur (tap = nyala/mati) */
const nsG=grp(.9,0,-3.1,BED);bx(.8,.7,.6,'#c98b52',0,.35,0,nsG);bx(.6,.2,.02,'#a8743f',0,.45,.31,nsG);sp(.03,'#f2c14e',0,.45,.33,nsG);
cy(.18,.2,.06,'#5a3b22',0,.73,0,nsG);cy(.03,.03,.5,'#5a3b22',0,1.0,0,nsG);
const lampShade=new THREE.Mesh(new THREE.CylinderGeometry(.2,.32,.34,12),BM('#cdbf9a'));lampShade.position.set(0,1.3,0);nsG.add(lampShade);
function toggleLamp(){A.lamp=!A.lamp;lampShade.material.color.set(A.lamp?'#ffe9a0':'#cdbf9a');say3(nsG,A.lamp?'lampu tidur nyala~':'lampu mati')}
lact(nsG,toggleLamp);
/* lemari baju (pintu bisa dibuka) */
const wd=grp(-3.3,0,-3.0,BED);
bx(2.0,3.4,.06,'#d9b98a',0,1.7,-.42,wd);bx(.06,3.4,.9,'#d9b98a',-.97,1.7,0,wd);bx(.06,3.4,.9,'#d9b98a',.97,1.7,0,wd);bx(2.0,.08,.9,'#d9b98a',0,3.4,0,wd);bx(2.0,.08,.9,'#c9a876',0,.04,0,wd);
bx(1.9,.05,.05,'#8a5a34',0,2.9,0,wd);
[['#e84a5f',-.6],['#4f8fe8',-.25],['#f2c14e',.1],['#8fd18a',.45],['#a98bd6',.75]].forEach(([c,x])=>bx(.28,1.0,.08,c,x,2.35,0,wd));
bx(.5,.5,.4,'#f4a6c0',-.5,.3,-.1,wd);bx(.5,.4,.4,'#8fd0f0',.4,.25,-.1,wd);
const dL=grp(-1.0,0,.45,wd),dR=grp(1.0,0,.45,wd);
bx(.98,3.3,.06,'#c98b52',.5,1.7,0,dL);sp(.05,'#f2c14e',.85,1.6,.06,dL);bx(.98,3.3,.06,'#c98b52',-.5,1.7,0,dR);sp(.05,'#f2c14e',-.85,1.6,.06,dR);
lact(wd,()=>{A.wdT=A.wdT?0:1;say3(wd,A.wdT?'isinya jaket & kaos favorit':'lemari ditutup')});
/* meja kerja + laptop + kursi (di dinding kiri) */
const desk=grp(-4.35,0,.7,BED,Math.PI/2);
bx(1.9,.1,.9,'#c98b52',0,1.0,0,desk);[[-.85,-.35],[.85,-.35],[-.85,.35],[.85,.35]].forEach(([x,z])=>bx(.1,1.0,.1,'#8a5a34',x,.5,z,desk));bx(.6,.7,.7,'#a8743f',.6,.62,0,desk);
bx(.7,.05,.5,'#cfd6e0',-.1,1.08,.05,desk);
const scr=grp(-.1,1.1,-.2,desk);scr.rotation.x=-.25;bx(.72,.5,.04,'#1f3a5f',0,.27,0,scr);
const lapTex=cvTex(160,100,(g,W,H)=>{g.fillStyle='#143268';g.fillRect(0,0,W,H);g.fillStyle='#8fd0f0';g.font='12px '+PX;g.textAlign='left';g.textBaseline='top';g.fillText('aqsa.exe',10,10);g.fillStyle='#f2c14e';g.fillText('happy bday!',10,34);g.fillStyle='#2a3a5c';g.fillRect(10,66,130,8);g.fillStyle='#8fd18a';g.fillRect(10,66,90,8)},true);
pl(.64,.4,BM('#ffffff',{map:lapTex}),0,.27,.025,scr);
bx(.16,.14,.16,'#ffffff',.6,1.12,.1,desk);bx(.3,.06,.22,'#e84a5f',.55,1.1,-.2,desk);bx(.26,.06,.2,'#4f8fe8',.55,1.16,-.2,desk);
bx(.7,.1,.7,'#4f8fe8',0,.6,1.0,desk);bx(.7,.8,.1,'#3b7dd8',0,1.05,1.35,desk);cy(.05,.05,.5,'#2e527f',0,.3,1.0,desk);cy(.3,.3,.04,'#2e527f',0,.04,1.0,desk);
const LAPSAY=['lagi ngerjain apa nih?','autosave... 99%','ada 3 tab terbuka, semuanya resep kue'];
lact(desk,()=>say3(desk,pick(LAPSAY)));
/* poster bulan & bintang di dinding kiri */
{const pg=grp(-4.93,3.2,-1.7,BED);bx(.06,1.6,1.15,'#ffffff',0,0,0,pg);
 const t=cvTex(110,150,(g,W,H)=>{g.fillStyle='#1f3a8a';g.fillRect(0,0,W,H);g.fillStyle='#fff';for(let i=0;i<18;i++)g.fillRect((i*47)%W,(i*83)%H,2,2);g.fillStyle='#f9e9a0';g.beginPath();g.arc(62,62,26,0,7);g.fill();g.fillStyle='#1f3a8a';g.beginPath();g.arc(74,56,24,0,7);g.fill();g.fillStyle='#f4a6c0';g.font='16px '+PX;g.textAlign='center';g.fillText('zzz',W/2,128)},true);
 pl(1.0,1.45,BM('#ffffff',{map:t}),.04,0,0,pg,Math.PI/2)}
/* tanaman */
{const pg=grp(4.55,0,-.3,BED);cy(.28,.2,.4,'#c98b52',0,.2,0,pg);cy(.03,.03,.7,'#4fa05a',0,.7,0,pg);[[0,1.0,.2],[.18,.85,0],[-.18,.75,0]].forEach(([x,y,z],i)=>{const l=bx(.4,.08,.22,'#4fa05a',x,y,z,pg);l.rotation.z=i%2?.5:-.5});sp(.12,'#f4a6c0',0,1.1,0,pg)}
/* lubang tangga turun (dengan pagar) */
const dn=grp(3.9,0,2.2,BED);
bx(1.5,.02,1.9,'#10203d',0,.03,0,dn);
[['#7a5530',-.55],['#4a3320',0],['#2a1d12',.55]].forEach(([c,z])=>bx(1.3,.025,.5,c,0,.045,z,dn));
bx(1.62,.06,.06,'#8a5a34',0,.04,-.98,dn);bx(1.62,.06,.06,'#8a5a34',0,.04,.98,dn);bx(.06,.06,1.9,'#8a5a34',-.78,.04,0,dn);bx(.06,.06,1.9,'#8a5a34',.78,.04,0,dn);
[[.78,-.95],[.78,0],[.78,.95],[-.78,-.95],[-.78,.95]].forEach(([x,z])=>bx(.06,.9,.06,'#8a5a34',x,.45,z,dn));
bx(.06,.06,1.9,'#5a3b22',.78,.9,0,dn);bx(1.6,.06,.06,'#5a3b22',0,.9,-.95,dn);bx(1.6,.06,.06,'#5a3b22',0,.9,.95,dn);
sign('turun',.9,.22,dn,-.2,1.2,-.95,0);
lact(dn,()=>goDown());
/* pintu ke ruang makan */
door(BED,-1.0,-3.43,0,'ruang makan','#f2b84b','#c9922a',()=>swap());
/* pintu ke balkon (dinding kiri) */
door(BED,-4.93,2.6,Math.PI/2,'balkon','#8dbdf7','#4f7fb8',()=>goBalcony());

/* ======================================================================
   RUANG MAKAN + DAPUR  (x = 160)
   ====================================================================== */
const DIN=new THREE.Group();DIN.position.set(160,0,0);S.add(DIN);DIN.visible=false;
const tileTex=cvTex(64,64,g=>{g.fillStyle='#c4d2e2';g.fillRect(0,0,64,64);g.fillStyle='#9bb8d9';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)},true,[10,7]);
shell(DIN,{flat:true,floorMat:new THREE.MeshBasicMaterial({map:tileTex}),wallB:'#8fbf9f',wallL:'#9dc9ab',trim:'#cdbb8c'});
windowAt(DIN,.2,3.15,1.4,1.1);
/* backsplash */
{const t=cvTex(64,64,g=>{g.fillStyle='#cadcf0';g.fillRect(0,0,64,64);g.fillStyle='#8fb5e6';g.fillRect(0,0,64,2);g.fillRect(0,0,2,64)},true,[13,2.6]);pl(7.8,1.3,new THREE.MeshLambertMaterial({map:t}),.9,1.65,-3.49,DIN)}
/* karpet bawah meja */
[[2.2,'#f2c14e'],[1.8,'#fff6c8']].forEach(([r,c],i)=>{const m=cy(r,r,.02,c,.8,.012+i*.004,.9,DIN);m.scale.z=.7});
/* kabinet dapur sepanjang dinding belakang */
bx(7.8,.9,.8,'#4f7fb8',.9,.45,-3.1,DIN);bx(7.9,.08,.9,'#e8d8b0',.9,.94,-3.08,DIN);
[-2.4,-1.1,3.9,4.4].forEach(x=>{bx(.03,.8,.02,'#2e527f',x,.45,-2.69,DIN);bx(.2,.04,.04,'#cfd6e0',x+.3,.7,-2.67,DIN)});
bx(1.2,1.0,.5,'#8dbdf7',-1.4,3.2,-3.25,DIN);bx(1.2,1.0,.5,'#8dbdf7',4.1,3.2,-3.25,DIN);bx(.04,.9,.02,'#2e527f',-1.4,3.2,-2.99,DIN);bx(.04,.9,.02,'#2e527f',4.1,3.2,-2.99,DIN);
/* wastafel */
const sinkG=grp(.2,0,-3.1,DIN);bx(1.0,.04,.5,'#9fb4cc',0,.99,0,sinkG);bx(.9,.02,.4,'#7f95b0',0,1.0,0,sinkG);
cy(.03,.03,.5,'#cfd6e0',0,1.2,-.25,sinkG);bx(.03,.03,.3,'#cfd6e0',0,1.43,-.1,sinkG);
const stream=cy(.012,.012,.43,'#8fd0f0',0,1.2,.05,sinkG);stream.visible=false;
lact(sinkG,()=>{A.water=1.6;say3(sinkG,'cuci piring dulu~')});
/* kompor + wajan (tap = masak) */
const stG=grp(2.6,0,-3.1,DIN);bx(1.3,.9,.8,'#cfd6e0',0,.45,0,stG);bx(1.3,.06,.8,'#2a3a52',0,.96,0,stG);bx(.9,.5,.02,'#10203d',0,.4,.41,stG);bx(.9,.04,.04,'#8a97ab',0,.72,.43,stG);
const burners=[[-.3,-.2],[.3,-.2],[-.3,.2],[.3,.2]].map(([x,z])=>cy(.18,.18,.03,'#10203d',x,.99,z,stG));
[-.4,-.13,.13,.4].forEach(x=>sp(.05,'#e84a5f',x,.62,.42,stG));
cy(.27,.24,.08,'#2a2f3a',-.3,1.04,-.2,stG);bx(.45,.04,.08,'#2a2f3a',-.7,1.06,-.2,stG);cy(.12,.12,.02,'#ffffff',-.3,1.09,-.2,stG);cy(.05,.05,.025,'#f2c14e',-.3,1.1,-.2,stG);
bx(1.3,.25,.7,'#cfd6e0',0,2.05,-.05,stG);bx(.5,1.5,.4,'#cfd6e0',0,3.05,-.2,stG);
const steam=[0,1,2,3].map(i=>{const q=bx(.1,.1,.1,'#ffffff',-.3,1.3,-.2,stG);q.material.transparent=true;q.material.opacity=.6;q.visible=false;return q});
const STSAY=['ceplok telur, jadi!','wanginya enak','awas panas~'];
lact(stG,()=>{A.stove=!A.stove;burners.forEach(b=>b.material.color.set(A.stove?'#e84a5f':'#10203d'));say3(stG,A.stove?pick(STSAY):'kompor mati')});
/* kulkas (pintu bisa dibuka) */
const fr=grp(-3.9,0,-2.95,DIN);
bx(1.3,3.0,.08,'#c9d3e2',0,1.5,-.41,fr);bx(.08,3.0,.9,'#c9d3e2',-.61,1.5,0,fr);bx(.08,3.0,.9,'#c9d3e2',.61,1.5,0,fr);bx(1.3,.08,.9,'#c9d3e2',0,3.0,0,fr);bx(1.3,.08,.9,'#c9d3e2',0,.04,0,fr);
[.7,1.4,2.1].forEach(y=>bx(1.14,.04,.8,'#cfe0f6',0,y,0,fr));
bx(.2,.4,.2,'#ffffff',-.35,.93,.1,fr);bx(.2,.08,.2,'#4f8fe8',-.35,1.17,.1,fr);bx(.4,.25,.3,'#fff6c8',.2,.85,.1,fr);bx(.4,.06,.3,'#e84a5f',.2,1.0,.1,fr);
bx(.3,.3,.3,'#8fd18a',-.3,1.58,.1,fr);bx(.3,.22,.3,'#f2c14e',.25,1.53,.1,fr);bx(.4,.3,.3,'#f4a6c0',0,2.28,.1,fr);
const frD=grp(-.65,0,.45,fr);bx(1.3,3.0,.08,'#d9e2ef',.65,1.5,.04,frD);bx(.05,.6,.08,'#8a97ab',1.15,1.7,.1,frD);bx(1.3,.9,.09,'#e6f6ff',.65,2.55,.05,frD);
lact(fr,()=>{A.frT=A.frT?0:1;say3(fr,A.frT?'isinya sisa kue ultah!':'kulkas ditutup')});
/* meja makan + kursi + isi meja */
const tb=grp(.8,0,.9,DIN);bx(3.0,.12,1.5,'#c98b52',0,1.0,0,tb);bx(2.6,.02,.5,'#f4a6c0',0,1.07,0,tb);
[[-1.3,-.6],[1.3,-.6],[-1.3,.6],[1.3,.6]].forEach(([x,z])=>bx(.14,1.0,.14,'#8a5a34',x,.5,z,tb));
[[-.7,-.45],[.7,-.45],[-.7,.45],[.7,.45]].forEach(([x,z])=>{cy(.22,.2,.03,'#ffffff',x,1.09,z,tb);cy(.1,.1,.02,'#8dbdf7',x,1.11,z,tb)});
cy(.1,.14,.3,'#8dbdf7',0,1.22,0,tb);[[0,1.5,0,'#e84a5f'],[.1,1.42,.04,'#f2c14e'],[-.1,1.44,-.03,'#f4a6c0']].forEach(([x,y,z,c])=>{cy(.01,.01,.3,'#4fa05a',x*.5,1.33,z,tb);sp(.07,c,x,y,z,tb)});
cy(.25,.15,.14,'#f2c14e',.75,1.14,0,tb);[[.7,1.28],[.8,1.25],[.76,1.3]].forEach(([x,y],i)=>sp(.08,i%2?'#e84a5f':'#8fd18a',x,y,(i-1)*.06,tb));
function chair(g,x,z,ry){const c=grp(x,0,z,g,ry);bx(.7,.1,.7,'#4f8fe8',0,.6,0,c);bx(.7,.8,.1,'#3b7dd8',0,1.05,-.3,c);[[-.28,-.28],[.28,-.28],[-.28,.28],[.28,.28]].forEach(([a,b])=>bx(.08,.6,.08,'#2e527f',a,.3,b,c))}
chair(DIN,.1,-.2,0);chair(DIN,1.5,-.2,0);chair(DIN,.1,2.0,Math.PI);chair(DIN,1.5,2.0,Math.PI);
const TBSAY=['makan bareng yuk!','laper... kapan kuenya?','meja udah rapi nih'];
lact(tb,()=>say3(tb,pick(TBSAY)));
/* lampu gantung di atas meja (tap = nyala/mati) */
const pend=grp(.8,0,.9,DIN);cy(.015,.015,1.7,'#2a3a52',0,4.15,0,pend);
const pShade=new THREE.Mesh(new THREE.CylinderGeometry(.15,.55,.35,14),BM('#ffe9a0'));pShade.position.set(0,3.3,0);pend.add(pShade);
sp(.12,'#fff6c8',0,3.15,0,pend,true);
/* cahaya lampu gantung: lokal, hanya menjangkau area meja makan (jarak 4.5) */
const pLight=new THREE.PointLight('#ffd9a0',0,4.5,2);pLight.position.set(160.8,3.0,.9);S.add(pLight);
lact(pend,()=>{A.pend=!A.pend;pShade.material.color.set(A.pend?'#ffe9a0':'#cdbf9a');say3(pend,A.pend?'lampu makan nyala':'lampu makan mati')});
/* papan menu + rak di dinding kiri */
{const bd=grp(-4.93,3.0,-1.7,DIN);bx(.06,1.2,1.7,'#8a5a34',0,0,0,bd);
 const t=cvTex(256,176,(g,W,H)=>{g.fillStyle='#24323f';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.font='34px '+VT;g.textAlign='center';g.fillText('menu hari ini',W/2,42);g.font='28px '+VT;['nasi goreng','kue ulang tahun','es teh manis'].forEach((s,i)=>g.fillText(s,W/2,86+i*32))});
 pl(1.55,1.05,BM('#ffffff',{map:t}),.04,0,0,bd,Math.PI/2)}
{const sh=grp(-4.8,2.2,.1,DIN);bx(.3,.06,2.0,'#c98b52',0,0,0,sh);[-.7,0,.7].forEach((z,i)=>{cy(.12,.1,.14,['#f4a6c0','#8fd0f0','#f2c14e'][i],0,.1,z,sh)})}
/* tong sampah + pintu ke kamar tidur */
cy(.2,.17,.5,'#8a97ab',4.3,.25,-2.2,DIN);
door(DIN,-4.93,1.5,Math.PI/2,'kamar tidur','#a98bd6','#7b5bb5',()=>swap());

/* ======================================================================
   TANGGA DI RUANG UTAMA (dekat lemari trofi)
   ====================================================================== */
const stair=grp(0,0,0,S);
{const e=new THREE.Mesh(new THREE.PlaneGeometry(1.6,6.2),M('#c9dbf1'));e.rotation.x=-Math.PI/2;e.position.set(STAIR.x+.2,.01,5.0);stair.add(e)}
const {x:sx,z:z0,w:sw,n,run,rise}=STAIR,top=n*rise;
for(let i=0;i<n;i++){const h=(i+1)*rise;bx(sw,h,run,i%2?'#c98b52':'#d9a066',sx,h/2,z0+i*run+run/2,stair)}
const zEnd=z0+n*run;
bx(sw,.15,1.2,'#c98b52',sx,top-.075,zEnd+.6,stair);
[sx-sw/2+.06,sx+sw/2-.06].forEach(x=>cy(.06,.06,top,'#8a5a34',x,top/2,zEnd+1.1,stair));
[sx-sw/2+.05,sx+sw/2-.05].forEach(xr=>{
 for(let i=0;i<n;i+=2)bx(.06,.835,.06,'#8a5a34',xr,(i+1)*rise+.4175,z0+i*run+run/2,stair);
 const L=Math.hypot(top,n*run),r=bx(.08,.06,L,'#5a3b22',xr,(1.0+top+1.0)/2,z0+n*run/2,stair);r.rotation.x=-Math.atan2(top,n*run);
 bx(.06,1.0,.06,'#8a5a34',xr,top+.5,zEnd+.04,stair);bx(.06,1.0,.06,'#8a5a34',xr,top+.5,zEnd+1.1,stair);bx(.08,.06,1.2,'#5a3b22',xr,top+1.0,zEnd+.6,stair)});
bx(sw,.06,.08,'#5a3b22',sx,top+1.0,zEnd+1.15,stair);
const signT=cvTex(256,64,(g,W,H)=>{g.fillStyle='#f2c14e';g.fillRect(0,0,W,H);g.strokeStyle='#1f3a5f';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);g.fillStyle='#1f3a5f';g.font='18px '+PX;g.textAlign='left';g.textBaseline='middle';g.fillText('lantai 2',22,H/2+2);g.beginPath();g.moveTo(212,44);g.lineTo(226,18);g.lineTo(240,44);g.fill()});
const sgn=new THREE.Sprite(new THREE.SpriteMaterial({map:signT,transparent:true}));sgn.scale.set(1.9,.48,1);const SGY=top+2.2;sgn.position.set(sx,SGY,zEnd+.6);stair.add(sgn);
act(stair,()=>goUp());

/* ======================================================================
   BALKON  (x = 200) — masuk lewat pintu di dinding kiri kamar tidur
   ====================================================================== */
const BAL=new THREE.Group();BAL.position.set(200,0,0);S.add(BAL);BAL.visible=false;
const BCOL=['#e84a5f','#f2c14e','#4f8fe8','#8fd18a','#f4a6c0','#a98bd6'];
const glow=(w,h,d,c,x,y,z,p)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),BM(c));m.position.set(x,y,z);p.add(m);return m};
const deckTex=cvTex(128,128,g=>{for(let r=0;r<8;r++){g.fillStyle=['#b99a72','#ae8f68','#bc9e76','#a98a64'][r%4];g.fillRect(0,r*16,128,16);g.fillStyle='#8f7350';g.fillRect(0,r*16+15,128,1);g.fillRect((r*37)%128,r*16,1,15)}},true,[5,3.5]);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshLambertMaterial({map:deckTex}));fl.rotation.x=-Math.PI/2;BAL.add(fl)}
bx(10,.2,.2,'#2e527f',0,0,3.5,BAL);
/* dinding luar rumah (warna tidak terpengaruh lampu) + garis papan */
{const bw=new THREE.Mesh(new THREE.PlaneGeometry(10,5),BM('#c9b48f'));bw.position.set(0,2.5,-3.5);BAL.add(bw)}
for(let i=0;i<8;i++)pl(10,.04,BM('#b39d78'),0,.95+i*.45,-3.485,BAL);
bx(10,.7,.1,'#a8946f',0,.35,-3.45,BAL);bx(10,.3,.7,'#8a5a34',0,4.85,-3.2,BAL);
/* pintu kembali ke kamar tidur */
door(BAL,-2.2,-3.43,0,'kamar tidur','#8dbdf7','#4f7fb8',()=>goBedroom());
/* jendela kamar dari luar + kotak bunga */
bx(1.9,1.5,.08,'#ffffff',2.8,2.8,-3.44,BAL);
const balGlass=pl(1.6,1.2,BM('#7fa8d4'),2.8,2.8,-3.39,BAL);
bx(.05,1.2,.04,'#ffffff',2.8,2.8,-3.36,BAL);bx(1.6,.05,.04,'#ffffff',2.8,2.8,-3.36,BAL);
bx(2.1,.12,.35,'#8a5a34',2.8,1.98,-3.25,BAL);
for(let i=0;i<6;i++){sp(.1,BCOL[(i+1)%6],2.1+i*.28,2.15,-3.2,BAL);sp(.07,'#4fa05a',2.1+i*.28,2.05,-3.3,BAL)}
/* lampu dinding (menyala di malam hari) */
const sconceG=[];[-.9,-4.3].forEach(x=>{bx(.08,.6,.06,'#2a3a52',x,2.6,-3.4,BAL);bx(.28,.06,.22,'#2a3a52',x,2.92,-3.3,BAL);bx(.28,.06,.22,'#2a3a52',x,2.34,-3.3,BAL);sconceG.push(glow(.2,.5,.16,'#e9dcb0',x,2.63,-3.3,BAL))});
/* spanduk HAPPY BIRTHDAY + bendera kecil + lampu tali */
{const t=cvTex(512,64,(g,W,H)=>{const s='HAPPY BIRTHDAY',n=s.length,w=W/n;for(let i=0;i<n;i++){g.fillStyle=BCOL[i%6];g.fillRect(i*w,0,w+1,H);g.fillStyle='#ffffff';g.font='22px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText(s[i]===' '?'':s[i],i*w+w/2,H/2+2)}g.strokeStyle='#1f3a5f';g.lineWidth=4;g.strokeRect(2,2,W-4,H-4)},true);
 pl(4.6,.575,BM('#ffffff',{map:t}),-.4,3.85,-3.46,BAL)}
cy(.01,.01,9.4,'#5a3b22',0,4.62,-3.0,BAL).rotation.z=Math.PI/2;
for(let i=0;i<13;i++){const x=-4.6+i*.7667,d=bx(.3,.3,.03,BCOL[i%6],x,4.42,-3.0,BAL);d.rotation.z=.785}
for(let i=0;i<14;i++){const u=i/13;fairy.push(sp(.06,['#f2c14e','#f4a6c0','#8fd0f0','#ffffff','#8fd18a'][i%5],-4.8+u*9.6,4.28-.18*Math.sin(u*Math.PI*3),-3.3,BAL,true))}
/* pagar: kiri, depan, kanan */
function railLine(x,z,len,alongZ){
 const n=Math.round(len/.5);
 if(alongZ){bx(.14,.1,len,'#8a5a34',x,1.1,z,BAL);bx(.1,.06,len,'#8a5a34',x,.25,z,BAL);for(let i=0;i<=n;i++)bx(.05,.9,.05,'#e8dcc4',x,.65,z-len/2+i*len/n,BAL);[-1,1].forEach(k=>{bx(.16,1.2,.16,'#6b4423',x,.6,z+k*len/2,BAL);sp(.1,'#8a5a34',x,1.27,z+k*len/2,BAL)})}
 else{bx(len,.1,.14,'#8a5a34',x,1.1,z,BAL);bx(len,.06,.1,'#8a5a34',x,.25,z,BAL);for(let i=0;i<=n;i++)bx(.05,.9,.05,'#e8dcc4',x-len/2+i*len/n,.65,z,BAL);[-1,1].forEach(k=>{bx(.16,1.2,.16,'#6b4423',x+k*len/2,.6,z,BAL);sp(.1,'#8a5a34',x+k*len/2,1.27,z,BAL)})}}
railLine(-4.9,0,7,true);railLine(0,3.45,10,false);railLine(4.9,0,7,true);
/* karpet bundar bertingkat di bawah meja */
[[1.8,'#7aa6d6'],[1.5,'#f6e3b4'],[1.1,'#e07a8f'],[.7,'#f2c14e']].forEach(([r,c],i)=>{const m=cy(r,r,.02,c,1.0,.012+i*.004,.3,BAL);m.scale.z=.8});
/* meja bistro + kue ulang tahun + teko + cangkir + vas */
const bt=grp(1.0,0,.3,BAL);
cy(.74,.74,.04,'#8a5a34',0,.99,0,bt);cy(.7,.7,.05,'#c98b52',0,1.03,0,bt);cy(.07,.07,.95,'#2a3a52',0,.5,0,bt);bx(.9,.05,.08,'#2a3a52',0,.04,0,bt);bx(.08,.05,.9,'#2a3a52',0,.04,0,bt);
cy(.22,.22,.13,'#fff1cf',0,1.15,0,bt);cy(.22,.22,.04,'#f4a6c0',0,1.23,0,bt);cy(.015,.015,.1,'#8fd0f0',0,1.3,0,bt);sp(.03,'#ffb23f',0,1.37,0,bt,true);
for(let k=0;k<6;k++)sp(.03,'#e84a5f',Math.cos(k*1.047)*.16,1.26,Math.sin(k*1.047)*.16,bt);
sp(.13,'#e8dcc4',-.38,1.17,.1,bt);cy(.07,.07,.03,'#e8dcc4',-.38,1.31,.1,bt);sp(.03,'#f2c14e',-.38,1.35,.1,bt);bx(.16,.04,.04,'#e8dcc4',-.52,1.2,.1,bt).rotation.z=.5;bx(.04,.12,.04,'#e8dcc4',-.23,1.18,.1,bt);
[[.42,.15],[.25,-.4]].forEach(([x,z])=>{cy(.12,.12,.015,'#f6f0e6',x,1.07,z,bt);cy(.07,.05,.08,'#7aa6d6',x,1.12,z,bt)});
cy(.06,.05,.22,'#8dbdf7',-.2,1.15,-.42,bt);[['#e84a5f',-.05],['#f2c14e',0],['#f4a6c0',.05]].forEach(([c,o],i)=>{cy(.01,.01,.2,'#4fa05a',-.2+o,1.35,-.42,bt);sp(.06,c,-.2+o,1.46+i*.02,-.42,bt)});
lact(bt,()=>say3(bt,pick(['ada kue buat Aqsa nih!','ngopi sore-sore enak banget','angin sepoi-sepoi~','duduk sini, temenin aku'])));
function balChair(x,z,ry){const c=grp(x,0,z,BAL,ry);bx(.6,.06,.6,'#8a5a34',0,.52,0,c);bx(.54,.08,.54,'#4fb3a8',0,.58,0,c);
 [[-.26,-.26],[.26,-.26],[-.26,.26],[.26,.26]].forEach(([a,b])=>bx(.06,.5,.06,'#5a3b22',a,.25,b,c));[-.27,.27].forEach(a=>bx(.06,.8,.06,'#5a3b22',a,.92,-.27,c));
 bx(.6,.07,.07,'#8a5a34',0,1.32,-.27,c);[-.15,0,.15].forEach(a=>bx(.07,.55,.04,'#8a5a34',a,1.0,-.27,c));bx(.46,.28,.06,'#4fb3a8',0,.95,-.22,c)}
balChair(1.0,-.55,0);balChair(1.0,1.15,Math.PI);
/* kursi santai + bantal + selimut, meja kecil + minuman + buku */
const lng=grp(-3.2,0,.4,BAL);
[[-.42,-.55],[.42,-.55],[-.42,1.0],[.42,1.0]].forEach(([a,b])=>bx(.08,.28,.08,'#5a3b22',a,.14,b,lng));
bx(1.0,.08,1.7,'#8a5a34',0,.3,.22,lng);bx(.9,.14,1.5,'#4fb3a8',0,.42,.25,lng);for(let k=0;k<4;k++)bx(.91,.145,.06,'#f6f0e6',0,.42,-.3+k*.42,lng);
bx(1.0,.08,1.0,'#8a5a34',0,.84,-.76,lng).rotation.x=.9;bx(.9,.14,.9,'#4fb3a8',0,.9,-.72,lng).rotation.x=.9;bx(.5,.14,.3,'#f4a6c0',0,1.1,-.93,lng).rotation.x=.9;
bx(.94,.04,.5,'#f2c14e',0,.5,.85,lng);bx(.95,.045,.08,'#e84a5f',0,.5,.75,lng);bx(.95,.045,.08,'#e84a5f',0,.5,.95,lng);
lact(lng,()=>say3(lng,pick(['rebahan dulu~','enak banget buat bengong','zzz...'])));
const stn=grp(-2.3,0,-.1,BAL);cy(.3,.3,.05,'#c98b52',0,.72,0,stn);cy(.04,.04,.7,'#5a3b22',0,.36,0,stn);cy(.2,.2,.04,'#5a3b22',0,.02,0,stn);
cy(.06,.05,.2,'#8fd0f0',.1,.85,.05,stn);sp(.07,'#f2c14e',.1,.97,.05,stn);bx(.015,.25,.015,'#e84a5f',.13,.98,.06,stn);bx(.3,.05,.22,'#e84a5f',-.08,.77,-.05,stn);bx(.28,.03,.2,'#fff1cf',-.08,.8,-.05,stn);
lact(stn,()=>say3(stn,pick(['es lemonnya seger','lagi baca apa ya','minumannya dingin banget'])));
/* tumpukan kado */
const gift=grp(-4.1,0,1.9,BAL);
bx(.55,.4,.55,'#e84a5f',0,.2,0,gift);bx(.57,.41,.1,'#f2c14e',0,.2,0,gift);bx(.1,.41,.57,'#f2c14e',0,.2,0,gift);
bx(.4,.3,.4,'#4f8fe8',.05,.55,0,gift);bx(.42,.31,.08,'#f4a6c0',.05,.55,0,gift);bx(.08,.31,.42,'#f4a6c0',.05,.55,0,gift);sp(.08,'#f4a6c0',.05,.74,0,gift);
bx(.35,.25,.35,'#8fd18a',.55,.125,.1,gift);bx(.37,.26,.07,'#ffffff',.55,.125,.1,gift);bx(.07,.26,.37,'#ffffff',.55,.125,.1,gift);sp(.07,'#ffffff',.55,.28,.1,gift);
lact(gift,()=>say3(gift,pick(['hadiah buat Aqsa!','jangan dibuka dulu~','penasaran isinya apa'])));
/* teropong bintang */
const tsc=grp(3.7,0,1.9,BAL);
[[.18,0,0,-.22],[-.18,0,0,.22],[0,.18,.22,0]].forEach(([x,z,rx,rz])=>{const l=cy(.02,.02,1.1,'#2a3a52',x,.55,z,tsc);l.rotation.x=rx;l.rotation.z=rz});
cy(.07,.07,.1,'#2a3a52',0,1.15,0,tsc);
const tube=cy(.09,.08,.95,'#e84a5f',0,1.3,0,tsc);tube.rotation.z=-.9;
[[.3,1.54],[-.3,1.06]].forEach(([x,y])=>{cy(.105,.105,.06,'#f2c14e',x,y,0,tsc).rotation.z=-.9});
cy(.04,.04,.18,'#2a3a52',-.43,.95,0,tsc).rotation.z=-.9;cy(.03,.03,.4,'#2a3a52',.05,1.53,.1,tsc).rotation.z=-.9;
lact(tsc,()=>say3(tsc,(typeof night!=='undefined'&&night)?'bintangnya kelihatan jelas banget!':'siang-siang cuma kelihatan awan'));
/* tanaman: palem di pot besar, pohon lemon, rambat di dinding, pot bunga */
function palm(x,z,sc){const g=grp(x,0,z,BAL);cy(.32*sc,.24*sc,.5*sc,'#c98b52',0,.25*sc,0,g);cy(.34*sc,.34*sc,.06*sc,'#a8743f',0,.5*sc,0,g);cy(.04,.05,.9*sc,'#6b4423',0,.95*sc,0,g);
 for(let k=0;k<7;k++){const a=k*Math.PI*2/7,l=bx(.8*sc,.05,.24*sc,k%2?'#4fa05a':'#5fb86a',Math.cos(a)*.4*sc,1.45*sc,Math.sin(a)*.4*sc,g);l.rotation.y=-a;l.rotation.z=-.35}
 sp(.12*sc,'#5fb86a',0,1.5*sc,0,g);lact(g,()=>say3(g,pick(['palemnya segar banget','daunnya lebar~','udah disiram belum ya'])));return g}
palm(-4.2,-2.9,1.2);
const lemon=grp(4.1,0,-2.0,BAL);cy(.34,.26,.5,'#c98b52',0,.25,0,lemon);cy(.05,.07,1.0,'#6b4423',0,1.0,0,lemon);sp(.6,'#4fa05a',0,1.8,0,lemon);sp(.42,'#5fb86a',.3,2.1,.1,lemon);sp(.4,'#4fa05a',-.3,2.0,-.1,lemon);
[[.45,1.7,.32],[-.4,1.9,.25],[.1,2.25,.35],[-.1,1.5,.5],[.5,2.0,-.2],[-.5,1.7,-.3]].forEach(([x,y,z])=>sp(.08,'#f2c14e',x,y,z,lemon));
lact(lemon,()=>say3(lemon,pick(['lemonnya belum matang','wangi jeruk~','nanti dibikin es lemon tea'])));
[0,1,2,3,4].forEach(i=>bx(.05,3.2,.04,'#8a5a34',4.15+i*.2,1.9,-3.38,BAL));[.9,1.6,2.3,3.0].forEach(y=>bx(.9,.04,.04,'#8a5a34',4.55,y,-3.37,BAL));
for(let i=0;i<16;i++){const lx=4.15+((i*37)%9)/10,ly=.8+((i*53)%25)/10;sp(.09,i%3?'#4fa05a':'#5fb86a',lx,ly,-3.33,BAL);if(i%4===0)sp(.07,'#f4a6c0',lx+.05,ly+.05,-3.3,BAL)}
const potFL=grp(-4.3,0,3.0,BAL);cy(.3,.22,.45,'#c98b52',0,.22,0,potFL);sp(.34,'#4fa05a',0,.7,0,potFL);[['#f4a6c0',-.15,.9,.2],['#f2c14e',.2,.85,.25],['#e84a5f',0,1.0,-.1],['#a98bd6',.25,.78,-.15]].forEach(([c,x,y,z])=>sp(.09,c,x,y,z,potFL));
lact(potFL,()=>say3(potFL,pick(['bunganya cantik~','wangi bunga'])));
/* balon di sudut pagar (bergoyang pelan) */
const balloonG=grp(4.55,1.2,3.0,BAL);
[[-.35,-.25,1.5],[-.1,-.3,2.0],[.2,-.2,1.6],[.35,0,2.1],[-.3,.1,2.4],[.05,.05,1.8]].forEach(([dx,dz,h],i)=>{const c=BCOL[i%6];cy(.006,.006,h,'#ffffff',dx,h/2,dz,balloonG);const b=sp(.3,c,dx,h+.3,dz,balloonG);b.scale.y=1.2;sp(.05,'#ffffff',dx-.1,h+.48,dz+.2,balloonG,true);sp(.04,c,dx,h-.02,dz,balloonG)});
lact(balloonG,()=>say3(balloonG,pick(['balonnya lucu~','hati-hati nanti terbang','pestanya meriah banget'])));
function goBedroom(){trans(()=>showRoom(0))}

/* ======================================================================
   NAVIGASI & HUD
   ====================================================================== */
const fd=document.createElement('div');fd.style.cssText='position:fixed;inset:0;background:#1f3a5f;opacity:0;pointer-events:none;transition:opacity .25s;z-index:30';document.body.appendChild(fd);
let busy=false;
const trans=fn=>{if(busy)return;busy=true;fd.style.opacity=1;setTimeout(()=>{try{fn()}finally{fd.style.opacity=0;setTimeout(()=>{busy=false},260)}},270)};
const bar=document.getElementById('bar');
const mkBtn=(txt,cls,fn)=>{const b=document.createElement('button');b.className='btn '+cls;b.textContent=txt;b.style.display='none';b.onclick=fn;if(bar)bar.prepend(b);return b};
const btnSwap=mkBtn('ruang makan','',()=>swap()),btnDown=mkBtn('turun','alt',()=>goDown());
function showRoom(r){
 dimLights(true);
 BADGE.style.display='';
 S.children.forEach(o=>{if(!o.isLight)o.visible=(o===[BED,DIN,BAL][r])});
 mode=1;F2.on=true;F2.room=r;F2.cx=[120,160,200][r];goalT.set(F2.cx,2.2,0);if(typeof tgt!=='undefined')tgt.copy(goalT);
 L2.position.set(F2.cx,r===1?3.6:3.4,.5);
 lgb.style.display='none';if(typeof vb!=='undefined')vb.style.display='none';const st=document.getElementById('sticky');if(st)st.style.display='none';
 btnDown.style.display=btnSwap.style.display='';btnSwap.textContent=r===0?'ruang makan':'kamar tidur';
 if(typeof sayEl!=='undefined')sayEl.style.display='none'}
function goUp(){trans(()=>showRoom(0))}
function swap(){trans(()=>showRoom(F2.room===0?1:0))}
function goBalcony(){trans(()=>showRoom(2))}
function goDown(){trans(()=>{
 dimLights(false);
 BADGE.style.display='none';
 pLight.intensity=0;
 /* pulihkan ruang utama lewat tombol lounge (dua kali: ke lounge lalu balik), lalu sembunyikan lantai 2 */
 if(typeof lgb.onclick==='function'){lgb.onclick();lgb.onclick()}
 BED.visible=DIN.visible=BAL.visible=false;F2.on=false;lgb.style.display='';
 btnDown.style.display=btnSwap.style.display='none';
 goalT.set(BACK.x,2.2,BACK.z);if(typeof tgt!=='undefined')tgt.copy(goalT);
 if(typeof sayEl!=='undefined')sayEl.style.display='none'})}

/* ======================================================================
   ANIMASI PER FRAME
   ====================================================================== */
let lastNight=null;
function step(dt){
 const t=performance.now()/1000;
 sgn.position.y=SGY+Math.sin(t*2.2)*.12;
 if(!F2.on)return;
 const nt=(typeof night!=='undefined')&&night;
 if(nt!==lastNight){lastNight=nt;balGlass.material.color.set(nt?'#ffd98a':'#7fa8d4');sconceG.forEach(m=>m.material.color.set(nt?'#ffd98a':'#e9dcb0'));WIN.forEach(w=>{w.pane.material.color.set(nt?'#141f4a':'#8fd0f0');w.sun.visible=!nt;w.moon.visible=nt;w.stars.forEach(s=>s.visible=nt);w.hill.material.color.set(nt?'#1f4a3a':'#6fb36f')})}
 const want=(nt?.55:.28)+(F2.room?0:(A.lamp?.8:0));L2.intensity+=(want-L2.intensity)*Math.min(1,dt*6);
 pLight.intensity+=((F2.room===1&&A.pend?1.2:0)-pLight.intensity)*Math.min(1,dt*6);
 const k=Math.min(1,dt*6);A.wd+=(A.wdT-A.wd)*k;A.fr+=(A.frT-A.fr)*k;
 dL.rotation.y=-1.7*A.wd;dR.rotation.y=1.7*A.wd;frD.rotation.y=-1.9*A.fr;
 fairy.forEach((b,i)=>b.scale.setScalar(.85+.3*Math.sin(t*3+i)));
 balloonG.rotation.z=Math.sin(t*1.3)*.05;balloonG.rotation.x=Math.cos(t*1.1)*.03;
 steam.forEach((q,i)=>{if(A.stove){const u=(t*.5+i*.25)%1;q.visible=true;q.position.y=1.25+u*.8;q.position.x=-.3+Math.sin(t*3+i)*.05;q.material.opacity=.6*(1-u)}else q.visible=false});
 if(A.water>0){A.water-=dt;stream.visible=true}else stream.visible=false}
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);step(dt)}}
})();