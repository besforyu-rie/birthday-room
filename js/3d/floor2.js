/* floor2.js — LANTAI 2 (ruang tidur + ruang makan & dapur) dan tangga di ruang utama.
   Taruh sefolder dengan index.html, muat PALING AKHIR (setelah secret3d.js):
   <script src="floor2.js?v=2"></script>
   Cara kerja: tangga ada di sisi kanan-depan ruang utama (dekat lemari trofi). Tap tangga -> naik.
   Di lantai 2 ada tombol "turun" dan tombol pindah ruangan (tidur <-> makan).
   Mau geser tangga? Ubah angka di STAIR di bawah.
   v15: kamar tidur & ruang makan diperluas ke kanan sebesar EXT (default 7). Kamar tidur -> ruang santai (TV, sofa, beanbag, rak buku, meja catur, pojok tanaman),
   ruang makan -> kamar mandi (bak mandi, shower, toilet, wastafel). Dapur dilengkapi mesin kopi, toaster, ketel, microwave, blender, buffet, jam dinding, dll. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof hits==='undefined'||typeof lh==='undefined'||typeof lgb==='undefined'||typeof goalT==='undefined')return;

/* ===== EDIT: posisi & ukuran tangga di ruang utama (koordinat dunia) ===== */
const STAIR={x:9.4,z:2.55,w:1.4,n:9,run:.44,rise:.33};
/* kamera saat turun kembali ke lantai 1 */
const BACK={x:7.4,z:4.2};

console.log('floor2.js v15 loaded (kamar tidur + ruang santai, dapur + kamar mandi)');
const PX='"Press Start 2P",monospace',VT='VT323,monospace';
const F2=window.F2={on:false,room:0,cx:120};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
const _Y=new THREE.Vector3(0,1,0),_Z=new THREE.Vector3(0,0,1),V3=(x,y,z)=>new THREE.Vector3(x,y,z);
/* ===== EDIT: lebar perluasan ke kanan (satuan dunia). Kamar tidur & ruang makan jadi 10+EXT lebar ===== */
const EXT=7,FX=[];
const gl=(w,h,d,c,x,y,z,p)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),BM(c));m.position.set(x,y,z);p.add(m);return m};
const mkWood=(rep,pal,ln)=>cvTex(128,128,g=>{for(let r=0;r<8;r++){g.fillStyle=pal[r%4];g.fillRect(0,r*16,128,16);g.fillStyle=ln;g.fillRect(0,r*16+15,128,1);g.fillRect((r*37)%128,r*16,1,15)}},true,rep);
const puff=(x,y,z,p,s)=>{const q=bx(s||.1,s||.1,s||.1,'#ffffff',x,y,z,p);q.material=new THREE.MeshLambertMaterial({color:'#ffffff',transparent:true,opacity:.6});q.visible=false;return q};

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
const L2=new THREE.PointLight('#ffe2b0',.3,26);L2.position.set(120,3.6,.5);S.add(L2);
/* redam lampu scene utama (ambient/directional) selama di lantai 2 — kalau masih terlalu terang, kecilkan DIM */
const DIM=1,LBASE=new Map();
function dimLights(on){const found=[];S.traverse(o=>{if(o.isLight&&o!==L2&&o!==pLight){if(!LBASE.has(o))LBASE.set(o,o.intensity);o.intensity=on?LBASE.get(o)*DIM:LBASE.get(o);found.push(o.type+':'+LBASE.get(o)+'->'+o.intensity)}});console.log('floor2 dimLights',on,found)}

/* ===== kerangka ruangan (lantai, dinding belakang & kiri, lis) ===== */
function shell(g,o){
 const E=o.ext||0,WM=o.flat?BM:M;
 const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),o.floorMat);fl.rotation.x=-Math.PI/2;g.add(fl);
 const bw=new THREE.Mesh(new THREE.PlaneGeometry(10,5),WM(o.wallB));bw.position.set(0,2.5,-3.5);g.add(bw);
 const lw=new THREE.Mesh(new THREE.PlaneGeometry(7,5),WM(o.wallL));lw.rotation.y=Math.PI/2;lw.position.set(-5,2.5,0);g.add(lw);
 bx(10,.9,.1,o.trim,0,.45,-3.45,g);bx(.1,.9,7,o.trim,-4.95,.45,0,g);bx(10,.2,.2,'#2e527f',0,0,3.5,g);
 if(E){const cx=5+E/2;/* perluasan kanan: lantai, dinding belakang, lis */
  const f2=new THREE.Mesh(new THREE.PlaneGeometry(E,7),o.extFloorMat||o.floorMat);f2.rotation.x=-Math.PI/2;f2.position.set(cx,0,0);g.add(f2);
  const b2=new THREE.Mesh(new THREE.PlaneGeometry(E,5),o.extWallMat||WM(o.extWallB||o.wallB));b2.position.set(cx,2.5,-3.5);g.add(b2);
  bx(E,.9,.1,o.extTrim||o.trim,cx,.45,-3.45,g);bx(E,.2,.2,'#2e527f',cx,0,3.5,g);bx(.2,.2,7.2,'#2e527f',5+E,0,0,g)}}
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

const MARBb='#f4efe4',GOLDb='#d9b24c';
/* pintu mewah: dua daun kayu gelap, fanlight emas, kusen marmer (dipakai di kamar & balkon). sx = posisi papan nama di samping pintu */
function luxDoor(par,x,z,ry,txt,fn,sx){const d=grp(x,0,z,par,ry);
 bx(1.7,2.9,.1,'#2a1a10',0,1.45,-.04,d);
 [-1,1].forEach(s=>{const X=s*.37;bx(.72,2.8,.1,'#4a2c1a',X,1.4,.02,d);bx(.5,.7,.04,'#5b3822',X,.6,.08,d);pl(.46,1.05,BM('#a9cbe6'),X,1.95,.1,d);[2.5,1.4,.25].forEach(y=>bx(.52,.04,.03,GOLDb,X,y,.1,d));cy(.03,.03,.34,GOLDb,s*.1,1.3,.13,d,8);sp(.05,GOLDb,s*.1,1.5,.13,d)});
 bx(.03,2.8,.12,GOLDb,0,1.4,.07,d);
 const fan=new THREE.Mesh(new THREE.CircleGeometry(.75,20,0,Math.PI),BM('#a9cbe6'));fan.position.set(0,2.8,.05);d.add(fan);
 const ar=new THREE.Mesh(new THREE.TorusGeometry(.78,.05,6,24,Math.PI),M(GOLDb));ar.position.set(0,2.8,.08);d.add(ar);
 const sg=grp(0,2.8,.07,d);for(let i=0;i<7;i++){const a=-Math.PI/2+i*Math.PI/6,sk=bx(.025,.75,.02,GOLDb,-Math.sin(a)*.375,Math.cos(a)*.375,0,sg);sk.rotation.z=a}
 [-1,1].forEach(s=>bx(.14,2.85,.18,MARBb,s*.82,1.42,.05,d));bx(1.7,.05,.5,'#e3dccb',0,.025,.28,d);
 sign(txt,1.0,.26,d,sx,1.9,.09,0);
 const m=pl(1.1,.55,M('#e84a5f'),0,.015,.65,d);m.rotation.x=-Math.PI/2;lact(d,fn);return d}
const A={wdT:0,wd:0,frT:0,fr:0,stove:false,water:0,lamp:false,pend:true};
Object.assign(A,{tv:0,neon:true,fl:false,flw:0,coffee:0,kettle:0,toast:0,micro:0,blend:0,bub:false,shower:0,bsink:0,duck:0,flush:0,lidT:0});

/* ======================================================================
   RUANG TIDUR  (x = 120)
   ====================================================================== */
const BED=new THREE.Group();BED.position.set(120,0,0);S.add(BED);BED.visible=false;
const woodTex=mkWood([5,3.5],['#d9b98a','#cfae7c','#dcbf92','#c9a876'],'#b8925f');
const loungeTex=mkWood([5*EXT/10,3.5],['#efe3d0','#e6d8c1','#f2e8d6','#e2d3ba'],'#c9b89a');
shell(BED,{floorMat:new THREE.MeshLambertMaterial({map:woodTex}),wallB:'#c4b2ee',wallL:'#d3c6f3',trim:'#efe6ff',ext:EXT,extFloorMat:new THREE.MeshLambertMaterial({map:loungeTex}),extWallB:'#f3d3e3',extTrim:'#fff0f7'});
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
function toggleLamp(){A.lamp=!A.lamp;const cc=A.lamp?'#ffe9a0':'#cdbf9a';lampShade.material.color.set(cc);lampShade2.material.color.set(cc);say3(nsG,A.lamp?'lampu tidur nyala~':'lampu mati')}
lact(nsG,toggleLamp);
/* lemari baju (pintu bisa dibuka) */
const wd=grp(-3.3,0,-3.0,BED);
bx(2.0,3.4,.06,'#d9b98a',0,1.7,-.42,wd);bx(.06,3.4,.9,'#d9b98a',-.97,1.7,0,wd);bx(.06,3.4,.9,'#d9b98a',.97,1.7,0,wd);bx(2.0,.08,.9,'#d9b98a',0,3.4,0,wd);bx(2.0,.08,.9,'#c9a876',0,.04,0,wd);
bx(1.9,.05,.05,'#8a5a34',0,2.9,0,wd);
/* isi lemari: pakaian bergantung di hanger (kaos, gaun, jaket, celana, hoodie), tumpukan baju terlipat, sepatu; di atas lemari: koper, kotak topi, selimut */
{const hang=(x,z,kind,c1,c2)=>{
  bx(.012,.1,.012,'#9aa3b2',x,2.95,z,wd);[-1,1].forEach(sg=>{const a=bx(.2,.018,.018,'#b8864f',x+sg*.09,2.83,z,wd);a.rotation.z=-sg*.3});
  if(kind==='shirt'){bx(.28,.46,.05,c1,x,2.55,z,wd);[-1,1].forEach(sg=>{const a=bx(.1,.24,.05,c1,x+sg*.18,2.68,z,wd);a.rotation.z=sg*.55});bx(.1,.04,.056,'#ffffff',x,2.78,z,wd);bx(.04,.3,.056,c2,x,2.55,z,wd)}
  else if(kind==='dress'){bx(.2,.26,.05,c1,x,2.68,z,wd);[-1,1].forEach(sg=>bx(.03,.12,.03,c1,x+sg*.07,2.82,z,wd));const k=cy(.11,.27,.52,c1,x,2.3,z,wd);k.scale.z=.2;bx(.22,.04,.056,c2,x,2.55,z,wd)}
  else if(kind==='jacket'){bx(.32,.62,.07,c1,x,2.48,z,wd);[-1,1].forEach(sg=>{const a=bx(.1,.5,.06,c1,x+sg*.2,2.5,z,wd);a.rotation.z=sg*.18});bx(.03,.5,.076,c2,x,2.45,z,wd);[2.62,2.5,2.38].forEach(y=>sp(.018,'#f2c14e',x+.06,y,z+.04,wd));bx(.12,.05,.075,c2,x,2.78,z,wd)}
  else if(kind==='pants'){bx(.26,.06,.05,c2,x,2.78,z,wd);[-1,1].forEach(sg=>bx(.115,.6,.05,c1,x+sg*.065,2.46,z,wd));bx(.09,.07,.056,c2,x-.08,2.7,z,wd)}
  else{bx(.3,.46,.07,c1,x,2.55,z,wd);[-1,1].forEach(sg=>{const a=bx(.11,.28,.07,c1,x+sg*.2,2.65,z,wd);a.rotation.z=sg*.45});const hd=sp(.11,c1,x,2.77,z-.02,wd);hd.scale.set(1.2,.8,.6);bx(.012,.14,.012,'#ffffff',x-.03,2.62,z+.04,wd);bx(.012,.14,.012,'#ffffff',x+.03,2.62,z+.04,wd);bx(.16,.08,.02,c2,x,2.42,z+.04,wd)}};
 hang(-.8,-.045,'shirt','#e84a5f','#ffffff');hang(-.5,.045,'dress','#a98bd6','#f2c14e');hang(-.2,-.045,'jacket','#4f8fe8','#2b4a7a');
 hang(.12,.045,'pants','#3f6fb5','#2b4a7a');hang(.43,-.045,'hoodie','#f2c14e','#d9a62e');hang(.75,.045,'shirt','#8fd18a','#ffffff');
 /* rak + tumpukan baju terlipat */
 bx(1.9,.04,.7,'#c9a876',0,1.15,-.06,wd);
 const stk=(x,y0,z,cols,w,d)=>cols.forEach((c,i)=>bx(w,.07,d,c,x+(i%2?.012:-.012),y0+.035+i*.072,z,wd));
 stk(-.6,.08,-.12,['#f4a6c0','#f7c3d6','#f4a6c0','#ee8fb0'],.46,.36);stk(-.08,.08,-.12,['#8fd0f0','#6fb8e0','#8fd0f0'],.42,.34);stk(.42,.08,-.12,['#3f6fb5','#35609e','#3f6fb5','#35609e'],.4,.34);
 stk(-.55,1.17,-.1,['#ffffff','#fff1cf','#ffffff','#f9d6e4','#ffffff'],.4,.3);stk(-.05,1.17,-.1,['#8fd18a','#a8dca3','#8fd18a'],.4,.3);stk(.5,1.17,-.1,['#e84a5f','#f2c14e','#e84a5f','#f2c14e'],.4,.3);
 const shoe=(x,c)=>{bx(.12,.04,.3,'#ffffff',x,.1,.05,wd);bx(.12,.09,.2,c,x,.165,-.0,wd);const t=sp(.06,c,x,.14,.17,wd);t.scale.set(1,.7,1)};shoe(.8,'#e84a5f');shoe(.93,'#e84a5f');
 /* di atas lemari */
 const yT=3.44;
 bx(.9,.38,.52,'#8a5a34',-.55,yT+.19,0,wd);[-.82,-.28].forEach(x=>bx(.06,.4,.54,'#6b4423',x,yT+.19,0,wd));bx(.3,.04,.04,'#d9b24c',-.55,yT+.4,0,wd);sp(.03,'#d9b24c',-.55,yT+.2,.27,wd);
 cy(.26,.26,.22,'#f4a6c0',.35,yT+.11,0,wd);cy(.28,.28,.06,'#f7c3d6',.35,yT+.25,0,wd);cy(.265,.265,.03,'#e84a5f',.35,yT+.12,0,wd);
 cy(.32,.32,.02,'#e6c27a',.35,yT+.29,0,wd);cy(.17,.19,.12,'#e6c27a',.35,yT+.36,0,wd);cy(.19,.19,.03,'#e84a5f',.35,yT+.31,0,wd);
 stk(.8,yT-.04,0,['#fff1cf','#a98bd6','#fff1cf','#8fd0f0'],.3,.4)}
const dL=grp(-1.0,0,.45,wd),dR=grp(1.0,0,.45,wd);
bx(.98,3.3,.06,'#c98b52',.5,1.7,0,dL);sp(.05,'#f2c14e',.85,1.6,.06,dL);bx(.98,3.3,.06,'#c98b52',-.5,1.7,0,dR);sp(.05,'#f2c14e',-.85,1.6,.06,dR);
lact(wd,()=>{A.wdT=A.wdT?0:1;say3(wd,A.wdT?'isinya jaket & kaos favorit':'lemari ditutup')});
/* meja kerja + laptop + kursi (di dinding kiri) */
const desk=grp(-4.35,0,.3,BED,Math.PI/2);
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
/* ---------- tanaman bunga (dibuat ulang): pot terakota bertepi, daun melengkung, 5 bunga bermahkota. tap = bergoyang ---------- */
{const pg=grp(4.55,0,-.3,BED);
 cy(.3,.22,.46,'#c98b52',0,.23,0,pg);cy(.35,.35,.08,'#b7743f',0,.5,0,pg);cy(.29,.29,.03,'#4a3320',0,.535,0,pg);cy(.285,.285,.04,'#e9b98a',0,.33,0,pg);
 for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=.18+(i%3)*.06,tip=V3(Math.cos(a)*r*1.6,.82+(i%3)*.1,Math.sin(a)*r*1.6);
  limb(V3(Math.cos(a)*.05,.54,Math.sin(a)*.05),tip,.012,'#3f9150',pg,.012);
  const lf=sp(.12,i%2?'#4fa05a':'#5fb86a',tip.x,tip.y,tip.z,pg);lf.scale.set(1.3,.35,.8);lf.rotation.y=-a}
 [['#f4a6c0',-.2,1.25,.1],['#f2c14e',.18,1.4,.05],['#e84a5f',0,1.12,.22],['#ffffff',.2,1.1,-.18],['#a98bd6',-.12,1.2,-.2]].forEach(([c,x,y,z])=>{
  limb(V3(x*.2,.54,z*.2),V3(x,y,z),.014,'#3f9150',pg,.016);
  const l1=sp(.07,'#4fa05a',x*.55,.54+(y-.54)*.45,z*.55,pg);l1.scale.set(1.6,.35,.7);
  const fh=grp(x,y,z,pg);for(let k=0;k<6;k++){const a=k*Math.PI/3,pt=sp(.065,c,Math.cos(a)*.085,0,Math.sin(a)*.085,fh);pt.scale.set(1,.45,1)}
  sp(.05,c==='#f2c14e'?'#e8913a':'#f2c14e',0,.02,0,fh)});
 const FL=['bunganya wangi~','udah disiram tadi pagi','cantik banget!','kelopaknya warna-warni'];
 lact(pg,()=>{A.flw=1.4;say3(pg,pick(FL))});
 FX.push((dt)=>{if(A.flw>0){A.flw-=dt;pg.rotation.z=Math.sin(A.flw*14)*.06*Math.min(1,A.flw)}else pg.rotation.z=0})}

/* ---------- meja samping kanan + lampu tidur kedua (ikut nyala bersama yang kiri) ---------- */
const ns2=grp(4.5,0,-3.1,BED);bx(.8,.7,.6,'#c98b52',0,.35,0,ns2);bx(.6,.2,.02,'#a8743f',0,.45,.31,ns2);sp(.03,'#f2c14e',0,.45,.33,ns2);
cy(.18,.2,.06,'#5a3b22',-.15,.73,0,ns2);cy(.03,.03,.5,'#5a3b22',-.15,1.0,0,ns2);
const lampShade2=new THREE.Mesh(new THREE.CylinderGeometry(.2,.32,.34,12),BM('#cdbf9a'));lampShade2.position.set(-.15,1.3,0);ns2.add(lampShade2);
bx(.2,.14,.1,'#e84a5f',.22,.77,.05,ns2);cy(.05,.05,.03,'#ffffff',.22,.8,.11,ns2).rotation.x=Math.PI/2;bx(.26,.05,.18,'#4f8fe8',.2,.8,-.12,ns2);
lact(ns2,toggleLamp);

/* ---------- lemari laci + hiasan (dinding kiri) ---------- */
const dres=grp(-4.55,0,-1.5,BED,Math.PI/2);
bx(1.4,.9,.55,'#c98b52',0,.45,0,dres);bx(1.46,.06,.6,'#e9c99a',0,.93,0,dres);
[.2,.45,.7].forEach(y=>{bx(1.3,.2,.02,'#b7743f',0,y,.285,dres);sp(.03,'#f2c14e',-.25,y,.3,dres);sp(.03,'#f2c14e',.25,y,.3,dres)});
bx(.34,.14,.22,'#f4a6c0',-.5,1.03,0,dres);bx(.36,.03,.24,'#f2c14e',-.5,1.1,0,dres);
cy(.05,.06,.16,'#8fd0f0',-.12,1.04,.1,dres);cy(.02,.02,.05,'#f2c14e',-.12,1.15,.1,dres);cy(.045,.05,.12,'#f4a6c0',0,1.02,-.08,dres);
bx(.3,.4,.04,'#8a5a34',.3,1.16,-.15,dres);pl(.24,.32,BM('#ffd6e8'),.3,1.16,-.125,dres);
potPlant(dres,.58,.96,.0,.9,['#f4a6c0','#ffffff']);
lact(dres,()=>say3(dres,pick(['laci-lacinya rapi','ada kotak perhiasan kecil','wangi parfum~','foto kenangan di atas laci'])));

/* ---------- karpet samping kasur ---------- */
bx(1.8,.02,.8,'#f4a6c0',3.0,.012,.55,BED);bx(1.6,.022,.6,'#fff1f6',3.0,.014,.55,BED);

/* ======================================================================
   RUANG SANTAI  (perluasan kanan kamar tidur, x 5 → 5+EXT)
   ====================================================================== */
windowAt(BED,10.2,3.15,1.7,1.3);
for(let i=0;i<14;i++){const u=i/13;fairy.push(sp(.06,['#f2c14e','#f4a6c0','#8fd0f0','#ffffff','#8fd18a'][i%5],5.2+u*6.6,4.6-.25*Math.sin(u*Math.PI*3)*.5,-3.4,BED,true))}
/* karpet bertingkat */
[[2.3,'#7fc4c4'],[1.95,'#fff1d6'],[1.5,'#f4a6c0'],[.95,'#fff6c8']].forEach(([r,c],i)=>{const m=cy(r,r,.02,c,9.6,.012+i*.004,-.5,BED);m.scale.z=.7});

/* rak buku tinggi */
const bk=grp(5.9,0,-3.2,BED);
{const WC='#c98b52';
 bx(.06,3.3,.55,WC,-.55,1.65,0,bk);bx(.06,3.3,.55,WC,.55,1.65,0,bk);bx(1.16,3.3,.04,'#a8743f',0,1.65,-.26,bk);
 [.03,.95,1.7,2.45,3.3].forEach(y=>bx(1.16,.06,.55,WC,0,y,0,bk));
 [-.28,.28].forEach(x=>{bx(.54,.82,.03,'#d9b98a',x,.49,.28,bk);sp(.03,'#f2c14e',x*-.2,.5,.31,bk)});
 const row=(y,x0,arr)=>{let x=x0;arr.forEach(([w,h,c])=>{bx(w,h,.32,c,x+w/2,y+h/2+.03,0,bk);x+=w+.012})};
 row(.98,-.5,[[.08,.5,'#e84a5f'],[.07,.6,'#4f8fe8'],[.09,.5,'#f2c14e'],[.07,.55,'#8fd18a'],[.08,.62,'#a98bd6'],[.07,.5,'#f4a6c0'],[.09,.58,'#4f8fe8'],[.07,.52,'#e84a5f']]);
 row(1.73,-.5,[[.08,.5,'#8fd18a'],[.09,.58,'#f4a6c0'],[.07,.5,'#a98bd6'],[.08,.6,'#f2c14e']]);
 bx(.3,.4,.04,'#8a5a34',.3,1.95,0,bk);pl(.24,.32,BM('#ffd6e8'),.3,1.95,.025,bk);
 sp(.1,'#4f8fe8',-.02,1.86,.0,bk);bx(.2,.02,.2,'#d9b24c',-.02,1.76,0,bk);
 row(2.48,-.5,[[.08,.5,'#f2c14e'],[.07,.55,'#e84a5f'],[.09,.48,'#4f8fe8'],[.08,.6,'#8fd18a'],[.07,.52,'#a98bd6']]);
 potPlant(bk,.25,2.51,0,1.2,['#f4a6c0','#f2c14e']);
 bx(.2,.14,.12,'#2a2f3a',-.1,2.58,0,bk);bx(.16,.1,.01,'#e84a5f',-.1,2.6,.065,bk);
 cy(.2,.17,.12,'#c98b52',-.25,3.39,0,bk);potPlant(bk,.2,3.33,0,1.4,['#ffffff','#f4a6c0','#f2c14e'])}
lact(bk,()=>say3(bk,pick(['bukunya banyak banget','ada kamera polaroid di rak','mau baca yang mana ya','tanaman di atas rak masih segar'])));

/* neon "happy bday Aqsa" di atas TV (tap = nyala/mati) */
const neonTex=cvTex(512,128,(g,W,H)=>{g.clearRect(0,0,W,H);g.textAlign='center';g.textBaseline='middle';g.font='44px '+PX;g.shadowColor='#ff5fa8';g.shadowBlur=22;g.fillStyle='#ffd6ec';g.fillText('happy bday',W/2,H/2-14);g.shadowColor='#ffb23f';g.fillStyle='#ffe28a';g.fillText('Aqsa',W/2,H/2+34)},true);
const ng=grp(7.6,0,-3.47,BED);const neonPl=pl(2.6,.65,BM('#ffffff',{map:neonTex,transparent:true,side:THREE.DoubleSide}),0,3.15,0,ng);
lact(ng,()=>{A.neon=!A.neon;neonPl.visible=A.neon;say3(ng,A.neon?'neonnya nyala~':'neon dimatikan')});

/* meja TV + TV (tap = ganti channel) */
const tvTex=[
 cvTex(512,128,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#1f3a8a');gr.addColorStop(1,'#6a3fb5');g.fillStyle=gr;g.fillRect(0,0,W,H);g.fillStyle='#fff';for(let i=0;i<16;i++)g.fillRect((i*53)%W,(i*29)%H,3,3);g.fillStyle='#ffe28a';g.font='24px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('happy birthday Aqsa!',W/2,H/2)},true,[1,1]),
 cvTex(160,90,(g,W,H)=>{g.fillStyle='#ffd6e8';g.fillRect(0,0,W,H);g.fillStyle='#f4a6c0';g.fillRect(40,50,80,30);g.fillStyle='#fff6e8';g.fillRect(40,44,80,8);g.fillStyle='#e84a5f';[60,80,100].forEach(x=>g.fillRect(x,30,4,14));g.fillStyle='#ffb23f';[60,80,100].forEach(x=>g.fillRect(x,24,4,6));g.fillStyle='#1f3a5f';g.font='10px '+PX;g.textAlign='center';g.fillText('kue!',W/2,16)},true),
 cvTex(160,90,(g,W,H)=>{['#ffffff','#f2e14c','#4fd1d1','#4fd14f','#d14fd1','#d14f4f','#4f4fd1'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(i*W/7,0,W/7+1,H*.7)});g.fillStyle='#10203d';g.fillRect(0,H*.7,W,H*.3);g.fillStyle='#fff';g.font='10px '+PX;g.textAlign='center';g.fillText('no signal',W/2,H*.88)},true),
 cvTex(16,9,(g,W,H)=>{g.fillStyle='#0b0f18';g.fillRect(0,0,W,H)},true)];
const tvg=grp(7.6,0,-3.1,BED);
[-.75,.75].forEach(x=>[-.18,.18].forEach(z=>bx(.06,.2,.06,'#5a3b22',x,.1,z,tvg)));
bx(1.7,.5,.5,'#e8d8b8',0,.45,0,tvg);bx(1.76,.05,.54,'#c98b52',0,.72,0,tvg);
[-.42,.42].forEach(x=>{bx(.76,.34,.02,'#d9c59a',x,.45,.26,tvg);sp(.03,'#f2c14e',x*.3,.45,.28,tvg)});
bx(.5,.04,.3,'#222a36',0,.77,0,tvg);bx(.14,.1,.08,'#222a36',0,.84,0,tvg);bx(1.5,.88,.06,'#10151f',0,1.32,0,tvg);
const tvMat=BM('#ffffff',{map:tvTex[0]});pl(1.4,.78,tvMat,0,1.32,.035,tvg);
sp(.015,'#8fd18a',.68,.9,.035,tvg,true);
const TVSAY=['channel kue ulang tahun!','no signal... ','channel pesta lagi tayang','tv dimatikan dulu'];
lact(tvg,()=>{A.tv=(A.tv+1)%4;tvMat.map=tvTex[A.tv];tvMat.needsUpdate=true;say3(tvg,['lagi tayang: ucapan buat Aqsa',TVSAY[0],TVSAY[1],TVSAY[3]][A.tv])});

/* sofa (menghadap depan) + bantal + selimut */
const sof=grp(10.2,0,-2.95,BED);
[[-1.25,-.4],[1.25,-.4],[-1.25,.4],[1.25,.4]].forEach(([x,z])=>bx(.1,.14,.1,'#5a3b22',x,.07,z,sof));
bx(2.84,.3,1.0,'#4a9a9a',0,.29,0,sof);bx(2.84,.8,.28,'#4a9a9a',0,.7,-.36,sof);
[-.57,.57].forEach(x=>{bx(1.12,.2,.8,'#6fb7b7',x,.54,.1,sof);const b=bx(1.08,.55,.2,'#6fb7b7',x,.88,-.2,sof);b.rotation.x=-.12});
[-1.28,1.28].forEach(x=>bx(.28,.7,1.0,'#3f8a8a',x,.5,0,sof));
bx(2.5,.03,.04,'#f2c14e',0,.46,.52,sof);
bx(.42,.42,.14,'#f4a6c0',-.85,.86,0,sof).rotation.set(0,.3,.25);bx(.42,.42,.14,'#f2c14e',.85,.84,0,sof).rotation.set(0,-.3,-.2);bx(.38,.38,.12,'#fff1d6',.1,.84,-.02,sof).rotation.set(0,.1,.1);
bx(.55,.05,.9,'#fff1d6',1.28,.86,.05,sof);bx(.5,.3,.05,'#fff1d6',1.28,.7,.5,sof);
const SOFASEATS=[{x:9.63,z:-2.8,st:{x:9.63,z:-1.6}},{x:10.77,z:-2.8,st:{x:10.77,z:-1.6}}];
lact(sof,()=>say3(sof,pick(['sofanya empuk banget','bantalnya lucu~','enak buat rebahan sambil nonton'])));

/* meja kopi */
const ctb=grp(10.2,0,-.7,BED);
[[-.65,-.33],[.65,-.33],[-.65,.33],[.65,.33]].forEach(([x,z])=>bx(.07,.5,.07,'#5a3b22',x,.25,z,ctb));
bx(1.5,.07,.8,'#c98b52',0,.5,0,ctb);bx(1.3,.02,.6,'#e8f4fb',0,.545,0,ctb);bx(1.3,.03,.65,'#a8743f',0,.18,0,ctb);
bx(.5,.03,.3,'#f2c14e',-.35,.57,.0,ctb);sp(.1,'#fff6e8',-.4,.68,0,ctb);cy(.03,.03,.1,'#fff6e8',-.28,.65,.0,ctb);cy(.05,.04,.06,'#8fd0f0',-.5,.62,.1,ctb);
bx(.36,.05,.26,'#e84a5f',.3,.6,.1,ctb).rotation.y=.3;bx(.34,.05,.24,'#4f8fe8',.3,.65,.1,ctb).rotation.y=-.2;
cy(.05,.04,.16,'#8dbdf7',.55,.64,-.2,ctb);[['#e84a5f',-.02],['#f2c14e',.02],['#f4a6c0',0]].forEach(([c,o],i)=>{cy(.008,.008,.14,'#4fa05a',.55+o,.78,-.2,ctb);sp(.045,c,.55+o,.86+i*.02,-.2,ctb)});
cy(.05,.05,.1,'#fff6e8',.05,.6,-.2,ctb);sp(.02,'#ffb23f',.05,.67,-.2,ctb,true);
lact(ctb,()=>say3(ctb,pick(['ada teh + kue kering','majalahnya seru dibaca','lilinnya wangi vanila'])));

/* beanbag (menghadap TV) */
function bean(x,z,c,c2){const g=grp(x,0,z,BED);const b=sp(.6,c,0,.36,0,g);b.scale.set(1,.65,1);const t=sp(.38,c2,0,.52,0,g);t.scale.set(1,.35,1);bx(.12,.05,.06,'#ffffff',.0,.2,.58,g);return g}
const bean1=bean(7.0,-1.35,'#f2c14e','#f7d77e'),bean2=bean(8.2,-1.15,'#f4a6c0','#f8c3d6');
const BEAN1=[{x:7.0,z:-1.35,st:{x:7.0,z:-.45},f:[0,-1]}],BEAN2=[{x:8.2,z:-1.15,st:{x:8.2,z:-.3},f:[0,-1]}];
lact(bean1,()=>say3(bean1,'empuk banget~'));lact(bean2,()=>say3(bean2,'enak buat nonton'));

/* kursi baca + meja kecil */
const arm=grp(6.2,0,.8,BED,Math.PI/2);
[[-.38,-.36],[.38,-.36],[-.38,.36],[.38,.36]].forEach(([x,z])=>bx(.07,.2,.07,'#5a3b22',x,.1,z,arm));
bx(.95,.3,.9,'#f4a6c0',0,.35,0,arm);bx(.8,.14,.7,'#f7c3d6',0,.57,.04,arm);bx(.95,.75,.22,'#f4a6c0',0,.75,-.34,arm);[-.47,.47].forEach(x=>bx(.16,.5,.9,'#ee8fb0',x,.55,0,arm));
bx(.36,.3,.1,'#fff6c8',0,.82,-.2,arm).rotation.x=-.2;
const ARMSEAT=[{x:6.2,z:.8,st:{x:7.2,z:.8},f:[1,0]}];
lact(arm,()=>say3(arm,pick(['kursi baca favorit','cocok buat baca sambil ngopi'])));
const side=grp(6.2,0,1.95,BED);cy(.35,.35,.04,'#c98b52',0,.6,0,side);cy(.05,.05,.58,'#5a3b22',0,.3,0,side);cy(.25,.25,.03,'#5a3b22',0,.02,0,side);
bx(.3,.06,.22,'#4f8fe8',-.1,.65,0,side);bx(.28,.05,.2,'#f2c14e',-.1,.7,0,side);cy(.06,.05,.1,'#ffffff',.15,.68,.08,side);
cy(.05,.06,.04,'#5a3b22',.05,.64,-.15,side);cy(.02,.02,.25,'#5a3b22',.05,.78,-.15,side);const sh2=new THREE.Mesh(new THREE.CylinderGeometry(.1,.16,.17,10),BM('#ffe9a0'));sh2.position.set(.05,.98,-.15);side.add(sh2);
lact(side,()=>say3(side,pick(['ada teh hangat di meja','buku yang belum selesai dibaca','lampu bacanya hangat'])));

/* lampu lantai (tap = nyala/mati) */
const flg=grp(11.8,0,-3.05,BED);cy(.2,.22,.04,'#2a3a52',0,.02,0,flg);cy(.025,.025,2.2,'#2a3a52',0,1.14,0,flg);
const flShade=new THREE.Mesh(new THREE.CylinderGeometry(.2,.36,.5,12),BM('#cdbf9a'));flShade.position.set(0,2.35,0);flg.add(flShade);
lact(flg,()=>{A.fl=!A.fl;flShade.material.color.set(A.fl?'#ffe9a0':'#cdbf9a');say3(flg,A.fl?'lampu lantai nyala~':'lampu lantai mati')});

/* pojok tanaman: rak bertingkat + monstera */
function potPlant(p,x,y,z,sc,fc){const g=grp(x,y,z,p);cy(.14*sc,.1*sc,.16*sc,'#c98b52',0,.08*sc,0,g);cy(.12*sc,.12*sc,.02*sc,'#4a3320',0,.165*sc,0,g);
 for(let i=0;i<6;i++){const a=i*Math.PI/3,l=sp(.08*sc,i%2?'#4fa05a':'#5fb86a',Math.cos(a)*.1*sc,.25*sc,Math.sin(a)*.1*sc,g);l.scale.set(1,.8,1)}
 if(fc)fc.forEach((c,i)=>{const a=i*2.1;sp(.045*sc,c,Math.cos(a)*.07*sc,.36*sc,Math.sin(a)*.07*sc,g)});return g}
const pst=grp(11.2,0,2.3,BED);
[[-.42,-.28],[.42,-.28],[-.42,.28],[.42,.28]].forEach(([x,z])=>bx(.05,1.3,.05,'#8a5a34',x,.65,z,pst));
[.25,.7,1.15].forEach(y=>bx(.95,.04,.6,'#c98b52',0,y,0,pst));
[[-.25,.29,['#f4a6c0','#ffffff']],[.25,.29,['#f2c14e']],[0,.74,['#e84a5f','#f2c14e']],[-.28,.74,null],[.28,1.19,['#a98bd6','#ffffff']],[-.2,1.19,['#f4a6c0']]].forEach(([x,y,f])=>potPlant(pst,x,y,0,1,f));
lact(pst,()=>say3(pst,pick(['rak tanamannya cantik','bunganya lagi mekar~','udah disiram belum ya'])));
const mon=grp(11.4,0,3.0,BED);cy(.34,.26,.5,'#e9e2d2',0,.25,0,mon);cy(.36,.36,.05,'#cfc6b2',0,.52,0,mon);cy(.3,.3,.03,'#4a3320',0,.55,0,mon);
for(let i=0;i<7;i++){const a=i*2.4,d=.3+.1*(i%3),tip=V3(Math.cos(a)*d,1.0+.28*(i%4),Math.sin(a)*d);limb(V3(Math.cos(a)*.04,.55,Math.sin(a)*.04),tip,.02,'#3f9150',mon,.025);
 const lf=sp(.24,i%2?'#3f9150':'#4fa05a',tip.x,tip.y+.05,tip.z,mon);lf.scale.set(1,.28,1.2);lf.rotation.y=a}
lact(mon,()=>say3(mon,pick(['monsteranya tumbuh subur','daunnya lebar banget~'])));

/* meja catur + 2 bangku */
const chessTex=cvTex(128,128,g=>{for(let a=0;a<8;a++)for(let b=0;b<8;b++){g.fillStyle=(a+b)%2?'#6b4423':'#f6e3b4';g.fillRect(a*16,b*16,16,16)}},true);
const gt=grp(8.6,0,2.2,BED);cy(.62,.62,.05,'#c98b52',0,.78,0,gt);cy(.06,.06,.76,'#5a3b22',0,.38,0,gt);cy(.3,.3,.04,'#5a3b22',0,.02,0,gt);
{const cb=pl(.7,.7,BM('#ffffff',{map:chessTex}),0,.81,0,gt);cb.rotation.x=-Math.PI/2;
 [[-.2,-.1,'#ffffff'],[.1,.15,'#ffffff'],[.2,-.2,'#2a2f3a'],[-.1,.2,'#2a2f3a']].forEach(([x,z,c])=>{cy(.035,.04,.1,c,x,.87,z,gt);sp(.035,c,x,.95,z,gt)})}
lact(gt,()=>say3(gt,pick(['main catur yuk!','skak mat!','siapa yang giliran jalan?'])));
function stool(x,z,c){const g=grp(x,0,z,BED);cy(.22,.22,.08,c,0,.5,0,g);[[-.14,-.14],[.14,-.14],[-.14,.14],[.14,.14]].forEach(([a,b])=>cy(.025,.025,.48,'#5a3b22',a,.24,b,g));return g}
const stl1=stool(7.5,2.2,'#4fb3a8'),stl2=stool(9.7,2.2,'#e07a8f');
const STL1=[{x:7.5,z:2.2,st:{x:7.5,z:3.0},f:[1,0]}],STL2=[{x:9.7,z:2.2,st:{x:9.7,z:3.0},f:[-1,0]}];
lact(stl1,()=>say3(stl1,'duduk sini, main catur'));lact(stl2,()=>say3(stl2,'giliranmu~'));

/* animasi ruang santai */
FX.push((dt,t)=>{
 if(A.tv===0)tvTex[0].offset.x=(tvTex[0].offset.x-dt*.12)%1;
 neonPl.material.opacity=A.neon?.88+.12*Math.sin(t*5):1;
});
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
luxDoor(BED,-4.93,2.5,Math.PI/2,'balkon',()=>goBalcony(),1.5);

/* ======================================================================
   RUANG MAKAN + DAPUR  (x = 160)
   ====================================================================== */
const DIN=new THREE.Group();DIN.position.set(160,0,0);S.add(DIN);DIN.visible=false;
const tileTex=cvTex(64,64,g=>{g.fillStyle='#c4d2e2';g.fillRect(0,0,64,64);g.fillStyle='#9bb8d9';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)},true,[10,7]);
const batWall=cvTex(64,64,g=>{g.fillStyle='#d4ecf3';g.fillRect(0,0,64,64);g.fillStyle='#b4dbe8';g.fillRect(0,0,64,2);g.fillRect(0,0,2,64)},true,[EXT*2.2,11]);
const batFloor=cvTex(64,64,g=>{g.fillStyle='#e8f1f6';g.fillRect(0,0,64,64);g.fillStyle='#bcd8e6';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32)},true,[EXT*2.2,15]);
shell(DIN,{flat:true,floorMat:new THREE.MeshBasicMaterial({map:tileTex}),wallB:'#8fbf9f',wallL:'#9dc9ab',trim:'#cdbb8c',ext:EXT,extFloorMat:new THREE.MeshBasicMaterial({map:batFloor}),extWallMat:new THREE.MeshBasicMaterial({map:batWall}),extTrim:'#ffffff'});
pl(EXT,.18,BM('#7fc4d8'),5+EXT/2,1.6,-3.485,DIN);
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
/* isi kulkas: sayur & buah, susu, jus, yogurt, kue ultah sisa, telur, keju, semangka */
const pie=(r,a0,a1,h,c,x,y,z,p)=>{const sh=new THREE.Shape();sh.moveTo(0,0);sh.absarc(0,0,r,a0,a1,false);sh.lineTo(0,0);const g=new THREE.ExtrudeGeometry(sh,{depth:h,bevelEnabled:false,curveSegments:18});g.rotateX(-Math.PI/2);const m=new THREE.Mesh(g,M(c));m.position.set(x,y,z);p.add(m);return m};
{const lt=sp(.2,'#7fc96b',-.33,.28,.05,fr);lt.scale.y=.85;sp(.14,'#a6dc8e',-.3,.33,.12,fr);
 [[0,.16,0],[.14,.16,.12],[.1,.16,-.14]].forEach(([x,y,z])=>{sp(.075,'#e0412e',x,y,z,fr);bx(.04,.02,.04,'#3f9a4f',x,y+.07,z,fr)});
 [[.3,.11,0],[.4,.11,.05],[.35,.18,.02]].forEach(([x,y,z])=>{const c=cy(.035,.01,.38,'#f2802a',x,y,z,fr);c.rotation.x=Math.PI/2;bx(.05,.03,.05,'#3f9a4f',x,y,z+.2,fr)});
 /* rak 1: susu, jus, yogurt, mentega, selai */
 bx(.16,.3,.16,'#ffffff',-.38,.87,0,fr);bx(.165,.1,.165,'#4f8fe8',-.38,.82,0,fr);bx(.16,.06,.09,'#ffffff',-.38,1.05,0,fr);cy(.03,.03,.03,'#e84a5f',-.38,1.09,0,fr);
 cy(.065,.065,.28,'#f58b2a',-.18,.86,.04,fr);cy(.03,.03,.08,'#f58b2a',-.18,1.04,.04,fr);cy(.034,.034,.03,'#ffffff',-.18,1.1,.04,fr);
 ['#f4a6c0','#8fd0f0','#f2c14e'].forEach((c,i)=>{cy(.06,.045,.1,'#ffffff',.05+i*.14,.77,.1,fr);cy(.063,.063,.015,c,.05+i*.14,.83,.1,fr);cy(.062,.047,.03,c,.05+i*.14,.77,.1,fr)});
 bx(.14,.05,.08,'#fff1a6',.38,.745,-.14,fr);bx(.145,.03,.085,'#c9d3e2',.38,.735,-.14,fr);cy(.05,.05,.1,'#c9304f',.38,.77,.1,fr);cy(.052,.052,.02,'#d9b24c',.38,.83,.1,fr);
 /* rak 2: sisa kue ultah (sepotong sudah diambil), telur, keju */
 cy(.25,.25,.02,'#ffffff',-.22,1.43,.02,fr);
 pie(.19,0,Math.PI*1.5,.07,'#f4d9a0',-.22,1.44,.02,fr);pie(.19,0,Math.PI*1.5,.03,'#fff6e8',-.22,1.51,.02,fr);pie(.19,0,Math.PI*1.5,.07,'#f4d9a0',-.22,1.54,.02,fr);pie(.195,0,Math.PI*1.5,.03,'#f4a6c0',-.22,1.61,.02,fr);
 sp(.035,'#d72f52',-.31,1.66,-.05,fr);sp(.035,'#d72f52',-.2,1.66,-.12,fr);
 bx(.34,.04,.2,'#d9c8a8',.28,1.44,-.08,fr);[[.19,-.12],[.28,-.12],[.37,-.12],[.19,-.04],[.28,-.04],[.37,-.04]].forEach(([x,z])=>{const e=sp(.04,'#f4e6cf',x,1.5,z,fr);e.scale.y=1.25});
 pie(.12,0,1.0,.07,'#f6d34a',.28,1.42,.22,fr);
 /* rak 3: mangkuk buah + semangka */
 cy(.2,.14,.1,'#e6f6ff',-.25,2.17,0,fr);sp(.07,'#e0412e',-.3,2.28,.02,fr);sp(.07,'#8fd18a',-.2,2.28,-.05,fr);sp(.07,'#f58b2a',-.25,2.3,.08,fr);
 pie(.212,0,Math.PI,.03,'#4fa05a',.3,2.125,.12,fr);pie(.2,0,Math.PI,.04,'#e84a5f',.3,2.14,.12,fr);[[.24,.04],[.32,.06],[.36,-.02]].forEach(([x,z])=>bx(.018,.012,.03,'#1a1a1a',x,2.185,z,fr))}
const frD=grp(-.65,0,.45,fr);bx(1.3,3.0,.08,'#d9e2ef',.65,1.5,.04,frD);bx(.05,.6,.08,'#8a97ab',1.15,1.7,.1,frD);bx(1.3,.9,.09,'#e6f6ff',.65,2.55,.05,frD);
bx(1.0,.03,.12,'#cfe0f6',.65,1.2,-.06,frD);cy(.04,.04,.2,'#d72f52',.4,1.32,-.06,frD);cy(.012,.012,.05,'#d72f52',.4,1.45,-.06,frD);cy(.04,.04,.2,'#f2c14e',.55,1.32,-.06,frD);cy(.045,.045,.26,'#7a3b1f',.75,1.35,-.06,frD);cy(.045,.045,.26,'#cfe9ff',.9,1.35,-.06,frD);cy(.03,.03,.03,'#4f8fe8',.9,1.5,-.06,frD);
lact(fr,()=>{A.frT=A.frT?0:1;say3(fr,A.frT?'isinya sisa kue ultah!':'kulkas ditutup')});
/* meja makan + kursi + isi meja */
const tb=grp(.8,0,.9,DIN);bx(3.0,.12,1.5,'#c98b52',0,1.0,0,tb);bx(2.6,.02,.5,'#f4a6c0',0,1.07,0,tb);
[[-1.3,-.6],[1.3,-.6],[-1.3,.6],[1.3,.6]].forEach(([x,z])=>bx(.14,1.0,.14,'#8a5a34',x,.5,z,tb));
[[-.7,-.45],[.7,-.45],[-.7,.45],[.7,.45]].forEach(([x,z])=>{cy(.22,.2,.03,'#ffffff',x,1.09,z,tb);cy(.1,.1,.02,'#8dbdf7',x,1.11,z,tb)});
cy(.1,.14,.3,'#8dbdf7',0,1.22,0,tb);[[0,1.5,0,'#e84a5f'],[.1,1.42,.04,'#f2c14e'],[-.1,1.44,-.03,'#f4a6c0']].forEach(([x,y,z,c])=>{cy(.01,.01,.3,'#4fa05a',x*.5,1.33,z,tb);sp(.07,c,x,y,z,tb)});
cy(.25,.15,.14,'#f2c14e',.75,1.14,0,tb);[[.7,1.28],[.8,1.25],[.76,1.3]].forEach(([x,y],i)=>sp(.08,i%2?'#e84a5f':'#8fd18a',x,y,(i-1)*.06,tb));
function chair(g,x,z,ry){const c=grp(x,0,z,g,ry);bx(.7,.1,.7,'#4f8fe8',0,.6,0,c);bx(.7,.8,.1,'#3b7dd8',0,1.05,-.3,c);[[-.28,-.28],[.28,-.28],[-.28,.28],[.28,.28]].forEach(([a,b])=>bx(.08,.6,.08,'#2e527f',a,.3,b,c));lact(c,()=>say3(c,pick(['kursinya nyaman','duduk sini~','makan bareng yuk!'])));return c}
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
{const sh=grp(-4.8,2.2,-.3,DIN);bx(.3,.06,1.3,'#c98b52',0,0,0,sh);[-.4,0,.4].forEach((z,i)=>{cy(.12,.1,.14,['#f4a6c0','#8fd0f0','#f2c14e'][i],0,.1,z,sh)})}
/* tong sampah + pintu ke kamar tidur */
cy(.2,.17,.5,'#8a97ab',4.3,.25,-2.2,DIN);
door(DIN,-4.93,1.5,Math.PI/2,'kamar tidur','#a98bd6','#7b5bb5',()=>swap());

/* ======================================================================
   DAPUR: perabotan tambahan (x -5 → 5)
   ====================================================================== */
{const TOP=.98;
/* karpet panjang di depan kabinet */
bx(5.6,.02,.8,'#f6e3b4',.9,.012,-2.1,DIN);bx(5.6,.022,.1,'#e07a8f',.9,.014,-2.35,DIN);bx(5.6,.022,.1,'#e07a8f',.9,.014,-1.85,DIN);

/* mesin kopi */
const cf=grp(-2.55,TOP,-3.1,DIN);
bx(.62,.05,.5,'#2a2f3a',0,.025,0,cf);bx(.5,.5,.38,'#c9304f',0,.3,-.04,cf);bx(.54,.1,.42,'#a8243e',0,.58,-.04,cf);
cy(.14,.11,.22,'#3a2a20',-.1,.74,-.1,cf);cy(.15,.15,.03,'#2a2f3a',-.1,.87,-.1,cf);
bx(.3,.08,.1,'#cfd6e0',.05,.42,.16,cf);cy(.025,.025,.1,'#cfd6e0',.05,.34,.18,cf);
cy(.08,.06,.1,'#ffffff',.05,.1,.17,cf);cy(.07,.07,.01,'#6b3f1f',.05,.145,.17,cf);sp(.025,'#8fd18a',.2,.5,.15,cf);sp(.025,'#f2c14e',.1,.5,.15,cf);
const cfS=[0,1,2].map(()=>puff(.05,.2,.17,cf,.06));
lact(cf,()=>{A.coffee=2.4;say3(cf,pick(['kopinya wangi~','satu espresso, jadi!','kopi dulu biar semangat']))});

/* toaster (roti naik saat di-tap) */
const ts=grp(-1.75,TOP,-3.1,DIN);
bx(.46,.28,.3,'#cfd6e0',0,.17,0,ts);bx(.48,.03,.32,'#9aa3b2',0,.32,0,ts);bx(.46,.03,.3,'#8a97ab',0,.03,0,ts);
[-.1,.1].forEach(x=>bx(.05,.01,.2,'#10203d',x,.335,0,ts));bx(.04,.1,.05,'#e84a5f',.24,.2,.1,ts);
const toasts=[-.1,.1].map(x=>bx(.04,.2,.17,'#e8b86a',x,.2,0,ts));
lact(ts,()=>{A.toast=2.2;say3(ts,pick(['ting! rotinya jadi','roti panggang hangat~']))});

/* ketel */
const kt=grp(-1.05,TOP,-3.1,DIN);
cy(.16,.19,.3,'#e84a5f',0,.17,0,kt);cy(.12,.16,.06,'#c9304f',0,.35,0,kt);sp(.04,'#2a2f3a',0,.4,0,kt);
bx(.2,.05,.05,'#e84a5f',.22,.25,0,kt).rotation.z=.5;bx(.04,.28,.06,'#2a2f3a',-.2,.22,0,kt);bx(.1,.04,.06,'#2a2f3a',-.17,.37,0,kt);
const ktS=[0,1,2].map(()=>puff(.3,.38,0,kt,.07));
lact(kt,()=>{A.kettle=2.6;say3(kt,pick(['air panas siap!','teh hangat enak nih','tuuut... airnya mendidih']))});

/* rak piring di samping wastafel */
const dr=grp(1.25,TOP,-3.1,DIN);
bx(.6,.03,.4,'#9fb4cc',0,.015,0,dr);[-.28,.28].forEach(x=>[-.18,.18].forEach(z=>bx(.02,.2,.02,'#9fb4cc',x,.12,z,dr)));
[-.2,-.07,.06,.19].forEach((x,i)=>{const p=cy(.14,.14,.02,i%2?'#ffffff':'#e6f6ff',x,.17,0,dr);p.rotation.z=Math.PI/2});
cy(.06,.05,.1,'#8dbdf7',.3,.08,.1,dr);
lact(dr,()=>say3(dr,pick(['piringnya bersih berkilau','tinggal dikeringin','gelasnya udah dicuci'])));

/* microwave */
const mw=grp(3.85,TOP,-3.1,DIN);
bx(.7,.4,.5,'#e6e9ef',0,.2,0,mw);bx(.7,.03,.52,'#cfd6e0',0,.405,0,mw);
const mwG=bx(.44,.3,.02,'#10203d',-.08,.2,.26,mw);mwG.material=BM('#10203d');
bx(.14,.3,.02,'#cfd6e0',.25,.2,.26,mw);const mwD=bx(.1,.04,.02,'#10203d',.25,.3,.275,mw);mwD.material=BM('#10203d');[.22,.15].forEach(y=>sp(.025,'#8a97ab',.25,y,.275,mw));
lact(mw,()=>{A.micro=3;say3(mw,pick(['ting! hangat','masuk microwave dulu...','makanannya udah panas']))});

/* blender smoothie */
const bl=grp(4.55,TOP,-3.1,DIN);
bx(.24,.18,.24,'#2a2f3a',0,.09,0,bl);const bjar=grp(0,.18,0,bl);cy(.11,.09,.34,'#d8eefc',0,.17,0,bjar);cy(.095,.075,.2,'#f4a6c0',0,.12,0,bjar);cy(.12,.12,.03,'#2a2f3a',0,.35,0,bjar);sp(.03,'#e84a5f',.05,.4,0,bjar);
lact(bl,()=>{A.blend=1.6;say3(bl,pick(['brrrr... smoothie stroberi!','jus segar!']))});

/* tempat sendok + spatula */
const cr=grp(3.42,TOP,-3.3,DIN);cy(.09,.08,.2,'#8fb5e6',0,.1,0,cr);
[-.04,0,.04].forEach((x,i)=>{const u=cy(.012,.012,.32,i%2?'#c98b52':'#cfd6e0',x,.3,0,cr);u.rotation.z=(i-1)*.18});sp(.035,'#c98b52',-.07,.46,0,cr);
lact(cr,()=>say3(cr,pick(['sendok kayu favorit','spatulanya masih baru'])));

/* pot herbal di ambang jendela */
const hb=grp(.2,2.49,-3.28,DIN);
[[-.45,'#7fc96b'],[0,'#4fa05a'],[.45,'#9ad27f']].forEach(([x,c])=>{cy(.09,.07,.13,'#c98b52',x,.065,0,hb);const l=sp(.11,c,x,.2,0,hb);l.scale.y=.8;sp(.06,c,x+.06,.28,.02,hb)});
lact(hb,()=>say3(hb,pick(['basil, mint, rosemary','herbalnya wangi segar','buat masak nanti'])));

/* rak bumbu */
const rk=grp(-2.55,2.3,-3.3,DIN);
bx(1.1,.05,.2,'#8a5a34',0,0,0,rk);[-.5,.5].forEach(x=>bx(.04,.18,.2,'#8a5a34',x,-.1,0,rk));
[-.4,-.2,0,.2,.4].forEach((x,i)=>{cy(.05,.05,.16,'#e6f6ff',x,.1,0,rk);cy(.053,.053,.04,['#e84a5f','#f2c14e','#4fa05a','#a98bd6','#f58b2a'][i],x,.2,0,rk)});
lact(rk,()=>say3(rk,pick(['garam, lada, paprika...','bumbunya lengkap'])));

/* jam dinding (jarum jalan sesuai waktu asli) */
const clkTex=cvTex(128,128,(g,W,H)=>{g.clearRect(0,0,W,H);g.fillStyle='#fffdf3';g.beginPath();g.arc(64,64,60,0,7);g.fill();g.fillStyle='#1f3a5f';g.font='14px '+PX;g.textAlign='center';g.textBaseline='middle';for(let i=1;i<=12;i++){const a=i*Math.PI/6;g.fillText(String(i),64+Math.sin(a)*45,64-Math.cos(a)*45)}},true);
const wc=grp(-3.9,0,-3.46,DIN);cy(.44,.44,.06,'#8a5a34',0,3.95,0,wc).rotation.x=Math.PI/2;
pl(.82,.82,BM('#ffffff',{map:clkTex,transparent:true}),0,3.95,.035,wc);
const hG=grp(0,3.95,.06,wc),mG=grp(0,3.95,.065,wc);bx(.04,.22,.015,'#1f3a5f',0,.1,0,hG);bx(.03,.32,.015,'#e84a5f',0,.15,0,mG);
lact(wc,()=>{const d=new Date();say3(wc,'sekarang jam '+d.getHours()+'.'+String(d.getMinutes()).padStart(2,'0'))});

/* buffet kayu di dinding kiri: keranjang buah, vas bunga, stand mixer, rice cooker */
const bf=grp(-4.55,0,-.1,DIN,Math.PI/2);
bx(1.5,.9,.55,'#4f7fb8',0,.45,0,bf);bx(1.56,.06,.6,'#e8d8b0',0,.93,0,bf);
[-.37,.37].forEach(x=>{bx(.68,.7,.02,'#5f8fc8',x,.45,.285,bf);sp(.03,'#f2c14e',x>0?.07:-.07,.45,.3,bf)});
cy(.2,.16,.12,'#c98b52',-.5,1.02,0,bf);[['#e0412e',-.55,0],['#f58b2a',-.45,.06],['#8fd18a',-.5,-.07],['#f2c14e',-.42,-.05]].forEach(([c,x,z])=>sp(.07,c,x,1.1,z,bf));
cy(.06,.05,.2,'#8dbdf7',-.15,1.06,0,bf);[['#e84a5f',-.02],['#f2c14e',.02],['#f4a6c0',0]].forEach(([c,o],i)=>{cy(.008,.008,.2,'#4fa05a',-.15+o,1.25,0,bf);sp(.05,c,-.15+o,1.37+i*.02,0,bf)});
bx(.32,.05,.2,'#c9304f',.2,.985,0,bf);bx(.08,.3,.1,'#c9304f',.12,1.15,0,bf);bx(.28,.12,.12,'#c9304f',.2,1.32,0,bf);cy(.11,.08,.1,'#cfd6e0',.28,1.05,0,bf);
cy(.17,.17,.22,'#fffdf3',.58,1.07,0,bf);sp(.17,'#fffdf3',.58,1.18,0,bf).scale.y=.45;sp(.02,'#e84a5f',.58,1.1,.17,bf,true);
lact(bf,()=>say3(bf,pick(['nasinya udah matang','kue-kue di sini enak','buah segar buat dessert','vas bunganya cantik~'])));

FX.push((dt,t)=>{
 ['coffee','kettle','toast','micro','blend'].forEach(k=>{if(A[k]>0)A[k]-=dt});
 cfS.forEach((q,i)=>{if(A.coffee>0){const u=(t*.9+i*.33)%1;q.visible=true;q.position.set(.05+Math.sin(t*4+i)*.02,.25+u*.5,.17);q.material.opacity=.55*(1-u)}else q.visible=false});
 ktS.forEach((q,i)=>{if(A.kettle>0){const u=(t*.9+i*.33)%1;q.visible=true;q.position.set(.3+u*.1,.38+u*.6,Math.sin(t*3+i)*.03);q.material.opacity=.6*(1-u)}else q.visible=false});
 toasts.forEach(m=>m.position.y=.2+(A.toast>0&&A.toast<1.6?.12*Math.min(1,(1.6-A.toast)*8):0));
 mwG.material.color.set(A.micro>0?'#ffe28a':'#10203d');mwD.material.color.set(A.micro>0?'#8fd18a':'#10203d');
 bjar.position.x=A.blend>0?Math.sin(t*70)*.012:0;
 const d=new Date();hG.rotation.z=-((d.getHours()%12)+d.getMinutes()/60)*Math.PI/6;mG.rotation.z=-(d.getMinutes()+d.getSeconds()/60)*Math.PI/30});
}

/* ======================================================================
   KAMAR MANDI  (perluasan kanan dapur, x 5 → 5+EXT) — sekat kaca buram, pintu terbuka di z -.9…1.1
   ====================================================================== */
{const PX0=5.2;
bx(.2,1.4,2.6,'#e9f4f8',PX0,.7,-2.2,DIN);bx(.2,1.4,2.4,'#e9f4f8',PX0,.7,2.3,DIN);
bx(.24,.08,2.6,'#8fb5e6',PX0,1.42,-2.2,DIN);bx(.24,.08,2.4,'#8fb5e6',PX0,1.42,2.3,DIN);
const gm=new THREE.MeshBasicMaterial({color:'#cfe9f5',transparent:true,opacity:.28,side:THREE.DoubleSide,depthWrite:false});
[[-2.2,2.6],[2.3,2.4]].forEach(([z,l])=>{const p=new THREE.Mesh(new THREE.PlaneGeometry(l,2.1),gm);p.rotation.y=Math.PI/2;p.position.set(PX0,2.45,z);DIN.add(p);bx(.1,.06,l,'#ffffff',PX0,3.5,z,DIN);
 for(let k=1;k<4;k++)bx(.08,2.1,.04,'#ffffff',PX0,2.45,z-l/2+k*l/4,DIN)});
[-.85,1.05].forEach(z=>bx(.26,3.5,.1,'#ffffff',PX0,1.75,z,DIN));bx(.26,.35,2.0,'#ffffff',PX0,3.33,.1,DIN);bx(.5,.03,2.0,'#cfd6e0',PX0,.015,.1,DIN);
sign('kamar mandi',1.5,.28,DIN,PX0+.14,3.33,.1,Math.PI/2);

/* bak mandi (air + busa) */
const tub=grp(7.0,0,-2.75,DIN);
bx(2.6,.1,1.4,'#e3eef5',0,.05,0,tub);bx(2.6,.75,.16,'#f4f8fb',0,.375,.62,tub);bx(2.6,.75,.16,'#f4f8fb',0,.375,-.62,tub);bx(.16,.75,1.4,'#f4f8fb',-1.22,.375,0,tub);bx(.16,.75,1.4,'#f4f8fb',1.22,.375,0,tub);
bx(2.68,.04,.24,'#ffffff',0,.77,.62,tub);bx(2.68,.04,.24,'#ffffff',0,.77,-.62,tub);bx(.24,.04,1.4,'#ffffff',-1.22,.77,0,tub);bx(.24,.04,1.4,'#ffffff',1.22,.77,0,tub);
bx(2.28,.03,1.08,'#8fd0f0',0,.56,0,tub);
[[-1.1,-.55],[1.1,-.55],[-1.1,.55],[1.1,.55]].forEach(([x,z])=>cy(.07,.05,.06,'#c9a876',x,-.0,z,tub));
cy(.03,.03,.14,'#cfd6e0',-.9,.82,-.5,tub);bx(.03,.03,.22,'#cfd6e0',-.9,.9,-.4,tub);sp(.035,'#4f8fe8',-1.0,.84,-.5,tub);sp(.035,'#e84a5f',-.8,.84,-.5,tub);
const rod=cy(.015,.015,2.8,'#cfd6e0',0,3.0,.74,tub);rod.rotation.z=Math.PI/2;
for(let i=0;i<10;i++)bx(.03,.08,.03,'#cfd6e0',-1.3+i*.29,2.97,.74,tub);
[-1,1].forEach(s=>{for(let k=0;k<4;k++)bx(.12,1.85,.04,k%2?'#8fd0f0':'#f4a6c0',s*(1.05+k*.11),2.05,.74+(k%2)*.05,tub)});
const bubs=[];for(let i=0;i<16;i++){const b=sp(.08+.04*(i%3),'#ffffff',-.95+((i*37)%19)/10,.6,-.45+((i*53)%9)/10,tub,true);b.visible=false;bubs.push(b)}
lact(tub,()=>{A.bub=!A.bub;say3(tub,A.bub?'busanya banyak, wangi stroberi~':'airnya diganti dulu ya')});
const duck=grp(7.45,.57,-2.65,DIN);{const b=sp(.12,'#f9d45c',0,.1,0,duck);b.scale.set(1.2,.9,1);sp(.08,'#f9d45c',0,.23,.08,duck);bx(.07,.03,.06,'#f58b2a',0,.22,.18,duck);sp(.015,'#1a1a1a',.04,.26,.13,duck,true);sp(.015,'#1a1a1a',-.04,.26,.13,duck,true)}
lact(duck,()=>{A.duck=1.2;say3(duck,pick(['kwek kwek!','bebek karet imut~']))});

/* shower di dinding */
const shw=grp(7.8,0,-3.42,DIN);cy(.025,.025,2.4,'#cfd6e0',0,1.8,0,shw);bx(.04,.04,.5,'#cfd6e0',0,3.0,.25,shw);cy(.17,.12,.05,'#cfd6e0',0,2.95,.5,shw);
const drops=[0,1,2,3,4,5,6].map(i=>{const q=bx(.02,.2,.02,'#9fd8ee',((i*37)%9-4)*.025,2.5,.5+((i*53)%9-4)*.02,shw);q.visible=false;return q});
lact(shw,()=>{A.shower=3;say3(shw,pick(['air hangat~','shower dulu biar seger','guyuran air hangat enak banget']))});

/* toilet + tutup yang bisa dibuka */
const wcg=grp(9.4,0,-3.0,DIN);
bx(.62,.72,.26,'#f7fbfd',0,.9,-.3,wcg);bx(.66,.05,.3,'#ffffff',0,1.27,-.3,wcg);bx(.14,.03,.04,'#cfd6e0',.2,1.32,-.3,wcg);bx(.3,.5,.4,'#f0f4f8',0,.25,0,wcg);
cy(.32,.24,.22,'#ffffff',0,.5,.12,wcg).scale.z=1.3;cy(.33,.33,.04,'#eef3f7',0,.63,.12,wcg).scale.z=1.3;
const wWater=cy(.22,.22,.02,'#8fd0f0',0,.62,.14,wcg);wWater.material=BM('#8fd0f0');wWater.scale.z=1.2;
const lid=grp(0,.66,-.28,wcg);cy(.32,.32,.03,'#ffffff',0,0,.4,lid).scale.z=1.3;
cy(.07,.07,.12,'#ffffff',-.85,1.2,-.42,wcg).rotation.z=Math.PI/2;bx(.02,.12,.08,'#cfd6e0',-.93,1.2,-.46,wcg);
lact(wcg,()=>{if(!A.lidT){A.lidT=1;say3(wcg,'tutupnya dibuka dulu...')}else{A.lidT=0;A.flush=1.6;say3(wcg,'sreeet~ flush!')}});

/* wastafel + cermin + perlengkapan */
const vn=grp(11.0,0,-3.05,DIN);
bx(1.5,.8,.8,'#d9b98a',0,.4,0,vn);bx(1.56,.06,.86,'#f6f9fb',0,.83,0,vn);
[-.37,.37].forEach(x=>{bx(.68,.62,.02,'#e6c99a',x,.4,.41,vn);sp(.03,'#f2c14e',x>0?.07:-.07,.45,.43,vn)});
cy(.26,.2,.04,'#e8f0f6',0,.87,.05,vn);cy(.2,.2,.01,'#c7d9e6',0,.895,.05,vn);
cy(.025,.025,.3,'#cfd6e0',0,1.0,-.22,vn);bx(.03,.03,.2,'#cfd6e0',0,1.14,-.13,vn);sp(.03,'#4f8fe8',-.1,.89,-.22,vn);sp(.03,'#e84a5f',.1,.89,-.22,vn);
const bstream=cy(.012,.012,.22,'#8fd0f0',0,1.02,-.04,vn);bstream.visible=false;
cy(.05,.05,.14,'#f4a6c0',-.55,.93,-.05,vn);bx(.04,.03,.1,'#f4a6c0',-.55,1.02,-.01,vn);
cy(.05,.04,.1,'#8dbdf7',.52,.9,-.1,vn);[['#e84a5f',-.015],['#f2c14e',.015]].forEach(([c,o])=>{const bs=cy(.01,.01,.2,c,.52+o,1.03,-.1,vn);bs.rotation.z=o*6});
bx(.25,.06,.18,'#fff1d6',-.55,.89,.2,vn);potPlant(vn,.62,.86,.15,.7,['#f4a6c0']);
lact(vn,()=>{A.bsink=1.6;say3(vn,pick(['cuci tangan dulu~','wangi sabun stroberi','airnya hangat']))});
const mr=grp(11.0,0,-3.47,DIN);bx(1.3,1.25,.05,'#d9b98a',0,2.45,0,mr);pl(1.16,1.1,BM('#bfe4f6'),0,2.45,.03,mr);
[[-.3,.5],[.05,.5]].forEach(([x,w])=>{const gl2=pl(.09,1.0,BM('#ffffff',{transparent:true,opacity:.35}),x,2.45,.032,mr);gl2.rotation.z=.4});
bx(1.0,.07,.1,'#ffffff',0,3.2,.05,mr);gl(.9,.03,.04,'#fff6c8',0,3.2,.1,mr);
lact(mr,()=>say3(mr,pick(['cantik banget hari ini!','selamat ulang tahun, Aqsa!','rambutnya udah rapi?'])));

/* keranjang cucian, rak handuk, timbangan, keset */
const hp=grp(5.85,0,2.5,DIN);cy(.3,.26,.7,'#d9b98a',0,.35,0,hp);[.15,.35,.55].forEach(y=>cy(.305,.305,.03,'#b8925f',0,y,0,hp));cy(.32,.32,.05,'#c9a876',0,.72,0,hp);bx(.3,.3,.06,'#f4a6c0',.15,.82,.1,hp).rotation.z=.5;
lact(hp,()=>say3(hp,pick(['cucian kotor menumpuk...','jangan lupa dicuci ya'])));
const lad=grp(5.6,0,-1.7,DIN);[-.42,.42].forEach(z=>{bx(.05,1.7,.05,'#8a5a34',0,.85,z,lad).rotation.z=.08});
[.45,.8,1.15,1.5].forEach(y=>bx(.04,.03,.9,'#8a5a34',-y*.08,y,0,lad));
[[.8,'#f4a6c0'],[1.15,'#8fd0f0'],[1.5,'#fff1d6']].forEach(([y,c])=>bx(.14,.34,.7,c,-y*.08+.02,y-.15,0,lad));
lact(lad,()=>say3(lad,pick(['handuknya empuk & wangi','handuk pink favorit'])));
const bsc=grp(8.3,0,-.9,DIN,.4);bx(.55,.05,.55,'#f6f9fb',0,.03,0,bsc);bx(.3,.01,.1,'#10203d',0,.06,.1,bsc);
lact(bsc,()=>say3(bsc,pick(['jangan diliat angkanya...','timbangan rahasia~','berat badan: rahasia dong!'])));
bx(1.8,.02,.7,'#7fc4c4',7.0,.012,-1.45,DIN);bx(1.6,.022,.1,'#fff1d6',7.0,.014,-1.45,DIN);
{const m=cy(.55,.55,.02,'#f4a6c0',11.0,.012,-1.95,DIN);m.scale.z=.7}

/* pakis di pojok + jendela kecil */
windowAt(DIN,9.2,3.3,1.1,.9);
const fern=grp(11.35,0,2.5,DIN);cy(.3,.22,.4,'#e9e2d2',0,.2,0,fern);cy(.31,.31,.05,'#cfc6b2',0,.42,0,fern);cy(.26,.26,.03,'#4a3320',0,.44,0,fern);
for(let i=0;i<12;i++){const a=i*.52,d=.45+.15*(i%3),tip=V3(Math.cos(a)*d,.9+.12*(i%4),Math.sin(a)*d);limb(V3(Math.cos(a)*.05,.44,Math.sin(a)*.05),tip,.015,'#3f9150',fern,.02);
 const l1=sp(.13,i%2?'#4fa05a':'#5fb86a',tip.x,tip.y,tip.z,fern);l1.scale.set(1.5,.3,.8);l1.rotation.y=-a;
 const mid=V3(tip.x*.55,.44+(tip.y-.44)*.6,tip.z*.55);const l2=sp(.09,'#4fa05a',mid.x,mid.y,mid.z,fern);l2.scale.set(1.4,.3,.8);l2.rotation.y=-a}
lact(fern,()=>say3(fern,pick(['pakisnya suka lembap','daunnya rimbun banget~'])));

FX.push((dt,t)=>{
 ['shower','bsink','duck','flush'].forEach(k=>{if(A[k]>0)A[k]-=dt});
 bubs.forEach((b,i)=>{b.visible=!!A.bub;if(A.bub){const s=1+.12*Math.sin(t*2+i);b.scale.setScalar(s)}});
 drops.forEach((q,i)=>{if(A.shower>0){q.visible=true;const u=(t*1.8+i*.14)%1;q.position.y=2.9-u*2.3}else q.visible=false});
 bstream.visible=A.bsink>0;
 duck.position.y=.57+Math.sin(t*2)*.01+(A.duck>0?Math.abs(Math.sin(A.duck*8))*.12:0);
 lid.rotation.x+=((A.lidT?-1.55:0)-lid.rotation.x)*Math.min(1,dt*8);
 wWater.material.color.set(A.flush>0?'#d8f3ff':'#8fd0f0');wWater.scale.set(1+(A.flush>0?.15*Math.sin(t*20):0),1,1.2)});
}

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
const deckTex=cvTex(256,256,g=>{for(let a=0;a<2;a++)for(let b=0;b<2;b++){g.fillStyle=(a+b)%2?'#d6d0c2':'#f6f1e7';g.fillRect(a*128,b*128,128,128)}
 for(let i=0;i<14;i++){g.strokeStyle='rgba(120,108,92,.16)';g.lineWidth=1;g.beginPath();const x=(i*71)%256,y=(i*113)%256;g.moveTo(x,y);g.bezierCurveTo(x+30,y+20,x+50,y-20,x+90,y+10);g.stroke()}
 g.fillStyle='#caa24a';g.fillRect(0,0,256,2);g.fillRect(0,0,2,256);g.fillRect(0,127,256,2);g.fillRect(127,0,2,256)},false,[5,3.5]);
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshLambertMaterial({map:deckTex}));fl.rotation.x=-Math.PI/2;BAL.add(fl)}
bx(10,.2,.2,'#2e527f',0,0,3.5,BAL);
/* dinding luar rumah (warna tidak terpengaruh lampu) + garis papan */
{const wt=cvTex(512,256,(g,W,H)=>{g.fillStyle='#f0e5d0';g.fillRect(0,0,W,H);for(let i=0;i<300;i++){g.fillStyle=i%2?'rgba(170,140,95,.06)':'rgba(255,255,255,.1)';g.fillRect((i*97)%W,(i*53)%H,4,2)}
  const bh=19,top=H-57;g.fillStyle='#dccba6';g.fillRect(0,top,W,57);g.fillStyle='#bca67c';for(let r=0;r<3;r++){const y=top+r*bh;g.fillRect(0,y,W,2);for(let c=0;c<W/64+1;c++)g.fillRect(c*64+(r%2?32:0),y,2,bh)}});
 pl(10,5,BM('#ffffff',{map:wt}),0,2.5,-3.5,BAL)}
/* chair rail, quoin sudut, kornis marmer + dentil emas (sama seperti teras) */
bx(10,.1,.1,MARBb,0,1.12,-3.43,BAL);
[-4.78,4.78].forEach(x=>{for(let i=0;i<7;i++)bx(i%2?.5:.34,.5,.2,'#e3dccb',x,.3+i*.65,-3.4,BAL)});
bx(10,.22,.5,MARBb,0,4.85,-3.25,BAL);bx(10,.05,.52,GOLDb,0,4.72,-3.25,BAL);for(let i=0;i<33;i++)bx(.12,.1,.1,MARBb,-4.8+i*.3,4.64,-3.04,BAL);
/* pintu kembali ke kamar tidur */
luxDoor(BAL,-2.2,-3.43,0,'kamar tidur',()=>goBedroom(),-1.5);
/* jendela kamar dari luar + kotak bunga */
bx(1.9,1.5,.08,MARBb,2.8,2.8,-3.44,BAL);bx(2.2,.1,.3,MARBb,2.8,3.62,-3.3,BAL);[-1,1].forEach(s=>bx(.4,1.7,.06,'#2b4a3a',2.8+s*1.15,2.8,-3.36,BAL));
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
/* pagar: balustrade marmer + tiang bola emas (sama seperti balkon di model rumah) */
const balGeo=new THREE.LatheGeometry([[.07,0],[.07,.05],[.045,.12],[.045,.2],[.08,.32],[.085,.4],[.07,.48],[.045,.58],[.045,.76],[.07,.84],[.07,.9]].map(a=>new THREE.Vector2(a[0],a[1])),8);
const balu=(x,y,z)=>{const m=new THREE.Mesh(balGeo,M(MARBb));m.position.set(x,y,z);m.scale.setScalar(.95);BAL.add(m)};
/* tepi lantai marmer + garis emas */
bx(10.3,.14,.4,MARBb,0,.05,3.5,BAL);bx(10.3,.04,.42,GOLDb,0,.13,3.5,BAL);[-4.95,4.95].forEach(x=>{bx(.4,.14,7.2,MARBb,x,.05,0,BAL);bx(.42,.04,7.2,GOLDb,x,.13,0,BAL)});
function railLine(x,z,len,alongZ){
 const n=Math.round(len/.36);
 if(alongZ){bx(.24,.1,len,MARBb,x,1.1,z,BAL);bx(.2,.12,len,MARBb,x,.2,z,BAL);for(let i=0;i<=n;i++)balu(x,.2,z-len/2+i*len/n)}
 else{bx(len,.1,.24,MARBb,x,1.1,z,BAL);bx(len,.12,.2,MARBb,x,.2,z,BAL);for(let i=0;i<=n;i++)balu(x-len/2+i*len/n,.2,z)}
 [-1,1].forEach(k=>{const px=alongZ?x:x+k*len/2,pz=alongZ?z+k*len/2:z;bx(.34,1.2,.34,MARBb,px,.6,pz,BAL);bx(.44,.07,.44,MARBb,px,1.23,pz,BAL);bx(.28,.05,.28,GOLDb,px,1.29,pz,BAL);sp(.13,GOLDb,px,1.45,pz,BAL)})}
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
/* teropong bintang: tripod 3 kaki bertemu di satu titik, kolom, garpu, tabung + pencari */

function limb(A,B,r,col,p,r2){const d=new THREE.Vector3().subVectors(B,A),L=d.length();const m=cy(r2==null?r:r2,r,L,col,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2,p);m.quaternion.setFromUnitVectors(_Y,d.normalize());return m}
function seg(A,B,w,t,col,p){const d=new THREE.Vector3().subVectors(B,A),L=d.length();const m=bx(w,t,L,col,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2,p);m.quaternion.setFromUnitVectors(_Z,d.normalize());return m}
const tsc=grp(3.7,0,1.9,BAL);
{const T=V3(0,1.14,0);
 [90,210,330].forEach(a=>{const r=a*Math.PI/180,F=V3(Math.cos(r)*.5,.03,Math.sin(r)*.5);limb(T,F,.024,'#2a3a52',tsc,.018);sp(.035,'#f2c14e',F.x,.03,F.z,tsc)});
 cy(.27,.27,.025,'#3a4a66',0,.5,0,tsc);                        /* tray penyangga */
 cy(.09,.11,.12,'#2a3a52',0,1.12,0,tsc);                        /* hub kaki */
 cy(.04,.05,.26,'#2a3a52',0,1.25,0,tsc);                        /* kolom */
 bx(.1,.04,.3,'#2a3a52',0,1.4,0,tsc);                           /* palang garpu */
 [-.105,.105].forEach(z=>bx(.06,.22,.03,'#2a3a52',0,1.5,z,tsc)); /* lengan garpu */
 const ax=cy(.02,.02,.3,'#f2c14e',0,1.55,0,tsc);ax.rotation.x=Math.PI/2;   /* poros */
 [-.15,.15].forEach(z=>sp(.035,'#f2c14e',0,1.55,z,tsc));
 const hd=grp(0,1.55,0,tsc);hd.rotation.z=-.7;                  /* kepala: miring ke atas kanan */
 cy(.085,.085,.9,'#e84a5f',0,.2,0,hd);                          /* tabung utama */
 cy(.1,.1,.2,'#c93a50',0,.7,0,hd);cy(.108,.108,.035,'#f2c14e',0,.82,0,hd);cy(.075,.075,.012,'#8fd0f0',0,.835,0,hd); /* tudung + lensa */
 cy(.055,.055,.1,'#2a3a52',0,-.3,0,hd);cy(.035,.035,.2,'#2a3a52',0,-.4,0,hd);cy(.045,.045,.04,'#f2c14e',0,-.52,0,hd); /* fokuser + lensa mata */
 cy(.03,.03,.38,'#2a3a52',-.125,.4,0,hd);cy(.038,.038,.04,'#f2c14e',-.125,.61,0,hd);        /* pencari */
 [.1,.38].forEach(y=>bx(.06,.04,.04,'#2a3a52',-.105,y,0,hd));}
lact(tsc,()=>say3(tsc,(typeof night!=='undefined'&&night)?'bintangnya kelihatan jelas banget!':'siang-siang cuma kelihatan awan'));
/* tanaman: palem di pot besar, pohon lemon, rambat di dinding, pot bunga */
function palm(x,z,sc){const g=grp(x,0,z,BAL);
 cy(.3*sc,.22*sc,.5*sc,'#c98b52',0,.25*sc,0,g);cy(.33*sc,.33*sc,.07*sc,'#a8743f',0,.52*sc,0,g);cy(.28*sc,.28*sc,.03*sc,'#4a3320',0,.55*sc,0,g);
 const P=[[0,.55],[.02,.9],[.06,1.2],[.12,1.5],[.2,1.75]].map(([dx,y])=>V3(dx*sc,y*sc,0));
 for(let i=0;i<4;i++){limb(P[i],P[i+1],.075*sc*(1-i*.1),'#7a5230',g,.075*sc*(1-(i+1)*.1));sp(.055*sc,'#6b4423',P[i+1].x,P[i+1].y,P[i+1].z,g)}
 const T=P[4],R=[[0,0],[.35,.28],[.75,.34],[1.05,.16],[1.25,-.18]],W=[.2,.26,.22,.12],C=['#4fa05a','#5fb86a','#3f9150','#5fb86a'];
 for(let k=0;k<9;k++){const a=k*Math.PI*2/9+.3,s2=sc*(k%2?.85:1.05),pts=R.map(([r,h])=>V3(T.x+Math.cos(a)*r*s2,T.y+h*s2*(k%3===0?.8:1),T.z+Math.sin(a)*r*s2));
  for(let i=0;i<4;i++)seg(pts[i],pts[i+1],W[i]*sc,.03,C[(i+k)%4],g)}
 [[.5,.6],[2.3,.5],[4.1,.55]].forEach(([a,h])=>seg(V3(T.x,T.y,T.z),V3(T.x+Math.cos(a)*.18*sc,T.y+h*sc,T.z+Math.sin(a)*.18*sc),.1*sc,.03,'#6fc67a',g));
 sp(.11*sc,'#4a3320',T.x,T.y,T.z,g);
 lact(g,()=>say3(g,pick(['palemnya segar banget','daunnya lebar~','udah disiram belum ya'])));return g}
palm(-4.2,-2.9,1.2);
const lemon=grp(4.1,0,-2.0,BAL);
cy(.36,.27,.5,'#c98b52',0,.25,0,lemon);cy(.39,.39,.07,'#a8743f',0,.52,0,lemon);cy(.33,.33,.03,'#4a3320',0,.55,0,lemon);
limb(V3(0,.55,0),V3(.03,1.4,0),.07,'#6b4423',lemon,.05);
[[.45,1.85,.15],[-.42,1.85,-.1],[.0,1.8,.4],[.1,1.8,-.4]].forEach(([x,y,z])=>limb(V3(.03,1.35,0),V3(x,y,z),.035,'#6b4423',lemon,.025));
[[0,1.95,0,.55,'#4fa05a'],[.45,1.85,.15,.38,'#5fb86a'],[-.42,1.85,-.1,.4,'#4a9a55'],[.05,2.3,.05,.38,'#5fb86a'],[0,1.8,.42,.34,'#5fb86a'],[.1,1.8,-.42,.34,'#4fa05a'],[.55,2.15,-.15,.28,'#4a9a55']].forEach(([x,y,z,r,c])=>sp(r,c,x,y,z,lemon));
[[.58,1.72,.42],[-.5,1.68,.3],[.15,2.15,.5],[-.2,1.5,.5],[.7,1.95,-.1],[-.6,1.95,-.3],[.3,1.55,-.5]].forEach(([x,y,z])=>{const l=sp(.09,'#f2c14e',x,y,z,lemon);l.scale.set(1,.85,1)});
lact(lemon,()=>say3(lemon,pick(['lemonnya belum matang','wangi jeruk~','nanti dibikin es lemon tea'])));
[0,1,2,3,4].forEach(i=>bx(.05,3.2,.04,'#8a5a34',4.15+i*.2,1.9,-3.38,BAL));[.9,1.6,2.3,3.0].forEach(y=>bx(.9,.04,.04,'#8a5a34',4.55,y,-3.37,BAL));
for(let i=0;i<16;i++){const lx=4.15+((i*37)%9)/10,ly=.8+((i*53)%25)/10;const lf=sp(.09,i%3?'#4fa05a':'#5fb86a',lx,ly,-3.33,BAL);lf.scale.set(1.3,.8,.6);if(i%4===0)sp(.07,'#f4a6c0',lx+.05,ly+.05,-3.3,BAL)}
const potFL=grp(-4.3,0,3.0,BAL);cy(.3,.22,.45,'#c98b52',0,.22,0,potFL);cy(.33,.33,.05,'#a8743f',0,.47,0,potFL);cy(.28,.28,.02,'#4a3320',0,.5,0,potFL);
[[0,.7,0,.3],[.18,.62,.1,.2],[-.2,.6,-.05,.2],[.05,.62,-.2,.18]].forEach(([x,y,z,r])=>{const b=sp(r,'#4fa05a',x,y,z,potFL);b.scale.y=.75});
[['#f4a6c0',-.15,1.0,.2],['#f2c14e',.2,.95,.25],['#e84a5f',0,1.12,-.1],['#a98bd6',.25,.9,-.15],['#ffffff',-.28,.88,-.1]].forEach(([c,x,y,z])=>{limb(V3(x*.3,.7,z*.3),V3(x,y,z),.012,'#3f9150',potFL);
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5;sp(.05,c,x+Math.cos(a)*.07,y,z+Math.sin(a)*.07,potFL)}sp(.045,'#f2c14e',x,y+.02,z,potFL)});
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
 S.children.forEach(o=>{if(!o.isLight)o.visible=(o===[BED,DIN,BAL][r])});
 mode=1;F2.on=true;F2.room=r;F2.cx=[120,160,200][r];const ox=r<2?EXT/2:0;goalT.set(F2.cx+ox,2.2,0);if(typeof tgt!=='undefined')tgt.copy(goalT);
 L2.position.set(F2.cx+(r<2?EXT/2:0),r===1?3.6:3.4,.5);
 lgb.style.display='none';if(typeof vb!=='undefined')vb.style.display='none';const st=document.getElementById('sticky');if(st)st.style.display='none';
 btnDown.style.display=btnSwap.style.display='';btnSwap.textContent=r===0?'ruang makan':'kamar tidur';
 if(typeof sayEl!=='undefined')sayEl.style.display='none'}
function goUp(){trans(()=>showRoom(0))}
function swap(){trans(()=>showRoom(F2.room===0?1:0))}
function goBalcony(){trans(()=>showRoom(2))}
function goDown(){trans(()=>{
 dimLights(false);
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
 FX.forEach(f=>f(dt,t));
 if(A.water>0){A.water-=dt;stream.visible=true}else stream.visible=false}
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);step(dt)}}
})();