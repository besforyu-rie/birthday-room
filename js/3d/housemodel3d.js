/* housemodel3d.js — MINIATUR RUMAH di LOUNGE + halaman preview 3D seluruh rumah.
   Taruh sefolder dengan index.html, muat SETELAH outdoor3d.js (disarankan setelah wall3d.js, sebelum live3d.js):
     <script src="housemodel3d.js?v=1"></script>
   Cara kerja:
   - Di lounge (pojok kanan-depan, dekat pintu teras) ada miniatur rumah di bawah kubah kaca. Tap = buka preview.
   - Preview = layar penuh dengan model 3D rumah mewah (serasi dengan teras): portico + pilar + pediment, balustrade marmer,
     taman formal (air mancur, gazebo kubah), lantai 1, lantai 2 + balkon, atap, dan garasi di basement.
   - Seret = putar, scroll / cubit = zoom. Tombol bawah: tampak luar, lantai 1, lantai 2, garasi (potongan denah dengan nama ruangan).
   - Siang/malam ikut tombol lampu di ruang utama. Esc / tombol "tutup" untuk keluar.
   Mau geser miniaturnya? Ubah MINI di bawah (koordinat lokal lounge). */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof LG==='undefined'||typeof lact==='undefined'||typeof say3==='undefined'||typeof winFx==='undefined')return;

/* ===== EDIT: posisi miniatur di lounge (koordinat lokal lounge) ===== */
const MINI={x:6.3,z:1.9};
const MINI_SCALE=.036;

console.log('housemodel3d.js v1 loaded');
const PX='"Press Start 2P",monospace';
const GOLDC='#d9b24c',MARBC='#f4efe4',MARB2C='#e3dccb',WALLC='#f0e5d0',IRONC='#1d222c';

/* ---------- util tekstur ---------- */
function cvTex(w,h,fn){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 const d=()=>{g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true};d();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(d);return t}
const haloTex=cvTex(64,64,g=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,225,150,.95)');r.addColorStop(.35,'rgba(255,200,110,.35)');r.addColorStop(1,'rgba(255,190,90,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
function labelTex(txt,fs){return cvTex(256,64,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle=GOLDC;g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);g.lineWidth=1.5;g.strokeRect(10,10,W-20,H-20);
 g.fillStyle='#f0cf6a';g.font=(fs||14)+'px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,W/2,H/2+2)})}

/* ======================================================================
   MODEL RUMAH (dipakai dua kali: miniatur di lounge & preview layar penuh)
   Koordinat: x kanan, z ke depan (muka rumah menghadap +z), y atas. Tanah di y=0.
   ====================================================================== */
function buildHouse(){
 const root=new THREE.Group(),MC={};
 const L=(c,e)=>{const k=c+'|'+(e||'');return MC[k]||(MC[k]=new THREE.MeshLambertMaterial({color:c,emissive:e||'#000000'}))};
 const B=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
 const put=(geo,mat,x,y,z,p)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);(p||root).add(m);return m};
 const box=(w,h,d,c,x,y,z,p)=>put(new THREE.BoxGeometry(w,h,d),L(c),x,y,z,p);
 const cyl=(rt,rb,h,c,x,y,z,p,seg)=>put(new THREE.CylinderGeometry(rt,rb,h,seg||14),L(c),x,y,z,p);
 const sph=(r,c,x,y,z,p)=>put(new THREE.SphereGeometry(r,12,9),L(c),x,y,z,p);
 const grp=(x,y,z,p)=>{const g=new THREE.Group();g.position.set(x,y,z);(p||root).add(g);return g};
 const tor=(R,t,c,x,y,z,p,rx,ry,arc)=>{const m=put(new THREE.TorusGeometry(R,t,6,24,arc||Math.PI*2),L(c),x,y,z,p);m.rotation.x=rx||0;m.rotation.y=ry||0;return m};
 const flat=(w,d,c,x,y,z,p)=>{const m=put(new THREE.PlaneGeometry(w,d),L(c),x,y,z,p);m.rotation.x=-Math.PI/2;return m};
 const tri=(w,h,d,c,x,y,z,p)=>{const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);return put(g,L(c),x,y,z,p)};
 const balGeo=new THREE.LatheGeometry([[.07,0],[.07,.05],[.045,.12],[.045,.2],[.08,.32],[.085,.4],[.07,.48],[.045,.58],[.045,.76],[.07,.84],[.07,.9]].map(a=>new THREE.Vector2(a[0],a[1])),8);
 const balu=(x,y,z,p,s)=>{const m=put(balGeo,L(MARBC),x,y,z,p);if(s)m.scale.setScalar(s);return m};
 const glassMat=B('#a9cbe6'),lampMat=B('#f4e6b8'),halos=[];
 const halo=(x,y,z,p,s)=>{const h=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));h.scale.set(s,s,1);h.position.set(x,y,z);h.raycast=()=>{};(p||root).add(h);halos.push(h);return h};
 const label=(txt,x,y,z,p,sc,fs)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex(txt,fs),transparent:true,depthTest:false}));s.scale.set(2.5*(sc||1),.625*(sc||1),1);s.position.set(x,y,z);s.renderOrder=10;s.raycast=()=>{};p.add(s);return s};

 const H1=4.0,H2=3.4,PL=.25,SLAB=.2;               /* tinggi lantai 1, lantai 2, plinth, pelat */
 const Y1=PL,Y2=PL+H1+SLAB,YR=Y2+H2;               /* alas lantai 1, alas lantai 2, dasar atap */
 const W=12,D=7;                                    /* denah rumah (x,z) */

 /* ---------- tanah: diorama (tanah coklat + rumput) ---------- */
 const soilM=[L('#7a5a3a'),L('#7a5a3a'),L('#5fae5a'),L('#4a3220'),L('#7a5a3a'),L('#7a5a3a')];
 const soil=put(new THREE.BoxGeometry(20,3.2,16),soilM,-3,-1.6,1);
 const lot=grp(0,0,0);                              /* semua yang di atas tanah (disembunyikan saat mode garasi) */
 [[-6,-4.2,2.6],[-9.5,2.6,2.2],[-12,-5.5,2.0]].forEach(([x,z,r],i)=>flat(r*1.4,r,i%2?'#6cbb64':'#68b660',x,.012,z,lot).rotation.z=i);
 /* ---------- plinth + teras ---------- */
 const plin=grp(0,0,0,lot);
 box(12.6,PL,7.6,MARB2C,0,PL/2,0,plin);box(12.8,.06,7.8,GOLDC,0,PL-.02,0,plin);
 const ter=grp(0,0,0,lot);
 box(12.6,PL,3.2,'#efe9db',0,PL/2,5.1,ter);box(12.8,.05,3.4,GOLDC,0,PL-.01,5.1,ter);
 {const m=put(new THREE.CircleGeometry(1.15,32),L('#efe6d2'),0,PL+.012,5.2,ter);m.rotation.x=-Math.PI/2;
  const r=put(new THREE.RingGeometry(1.0,1.1,32),L(GOLDC),0,PL+.02,5.2,ter);r.rotation.x=-Math.PI/2;
  const s=put(new THREE.CircleGeometry(.5,8),L('#1f3358'),0,PL+.025,5.2,ter);s.rotation.x=-Math.PI/2}
 /* tangga depan */
 [0,1,2].forEach(k=>{const h=.1+.07*(2-k);box(3.8-k*.2,h,.5,MARBC,0,h/2,6.95+k*.5,ter)});
 /* balustrade: depan (dengan celah tangga), sisi kanan (penuh), sisi kiri (celah gerbang) */
 const rail=(x,z,len,alongZ)=>{if(alongZ){box(.24,.1,len,MARBC,x,1.12+PL-.1,z,ter);box(.2,.14,len,MARBC,x,PL+.07,z,ter)}else{box(len,.1,.24,MARBC,x,1.12+PL-.1,z,ter);box(len,.14,.2,MARBC,x,PL+.07,z,ter)}};
 const bals=(x0,z0,x1,z1,skip)=>{const n=Math.max(2,Math.round(Math.hypot(x1-x0,z1-z0)/.36));for(let i=0;i<=n;i++){const u=i/n,x=x0+(x1-x0)*u,z=z0+(z1-z0)*u;if(skip&&skip(x,z))continue;balu(x,PL+.1,z,ter,.95)}};
 rail(-4.25,6.7,4.1,false);rail(4.25,6.7,4.1,false);bals(-6.3,6.7,-2.1,6.7);bals(2.1,6.7,6.3,6.7);
 rail(6.3,5.1,3.2,true);bals(6.3,3.5,6.3,6.7);
 rail(-6.3,6.0,1.4,true);rail(-6.3,3.95,.9,true);bals(-6.3,6.7,-6.3,5.6);bals(-6.3,4.4,-6.3,3.5);
 [[6.3,6.7],[2.1,6.7],[-2.1,6.7],[-6.3,6.7],[6.3,3.5],[-6.3,3.5],[6.3,5.1],[-6.3,5.6],[-6.3,4.4]].forEach(([x,z])=>{box(.34,1.1,.34,MARBC,x,PL+.55,z,ter);box(.44,.07,.44,MARBC,x,PL+1.13,z,ter);box(.28,.05,.28,GOLDC,x,PL+1.19,z,ter);sph(.12,GOLDC,x,PL+1.34,z,ter)});
 /* gerbang taman di sisi kiri teras */
 {const g=grp(-6.3,PL,5.0,ter);[-.7,.7].forEach(z=>{box(.36,1.9,.36,'#e9e1cf',0,.95,z,g);sph(.14,GOLDC,0,2.05,z,g)});
  for(let i=0;i<7;i++)cyl(.015,.015,1.5,IRONC,0,.8,-.45+i*.15,g,6);tor(.55,.03,GOLDC,0,1.35,0,g,0,Math.PI/2,Math.PI);
  label('taman',.1,2.7,0,g,.55,12)}
 /* guci, bangku, meja teh, lampu di teras */
 [[-3.9,3.95],[3.9,3.95]].forEach(([x,z])=>{const u=grp(x,PL,z,ter);box(.5,.12,.5,MARBC,0,.06,0,u);cyl(.12,.2,.35,MARBC,0,.3,0,u,12);sph(.3,MARBC,0,.6,0,u);tor(.27,.02,GOLDC,0,.92,0,u,Math.PI/2);sph(.34,'#3a8a47',0,1.3,0,u);sph(.2,'#4fa05a',0,1.68,0,u)});
 {const t=grp(4.1,PL,5.6,ter);cyl(.55,.55,.06,MARBC,0,.98,0,t,20);tor(.55,.02,GOLDC,0,1.0,0,t,Math.PI/2);cyl(.06,.09,.95,GOLDC,0,.5,0,t,10);cyl(.3,.34,.05,GOLDC,0,.03,0,t,14);
  [[-.9,0],[.9,0]].forEach(([x,z])=>{box(.55,.08,.55,'#1f2f4f',x,.52,z,t);box(.55,.6,.1,'#1f2f4f',x,.85,z-.22,t)});cyl(.1,.12,.14,'#f6f0e6',0,1.1,0,t)}
 {const bn=grp(-3.9,PL,3.85,ter);box(1.6,.18,.5,'#1f2f4f',0,.62,0,bn);box(1.64,.05,.54,GOLDC,0,.52,0,bn);box(1.6,.6,.1,'#1f2f4f',0,.95,-.25,bn)}
 const lampGlows=[];
 const lampPost=(p,x,z,h)=>{const l=grp(x,0,z,p);box(.34,.2,.34,IRONC,0,.1,0,l);cyl(.04,.07,h,IRONC,0,h/2+.1,0,l,8);const gl=put(new THREE.BoxGeometry(.3,.4,.3),lampMat,0,h+.3,0,l);box(.42,.07,.42,GOLDC,0,h+.55,0,l);put(new THREE.ConeGeometry(.28,.2,4),L(GOLDC),0,h+.7,0,l).rotation.y=Math.PI/4;halo(0,h+.3,0,l,1.9);lampGlows.push(gl);return l};
 lampPost(ter,5.5,3.9,2.2);lampPost(ter,-5.5,6.2,2.2);lampPost(lot,-1.9,8.2,2.2);lampPost(lot,1.9,8.2,2.2);
 /* jalan depan + pagar besi + gerbang */
 flat(2.6,1.5,'#e9e1cd',0,.014,8.35,lot);
 {const z=8.95,fe=(x0,x1)=>{box(x1-x0,.05,.05,IRONC,(x0+x1)/2,1.15,z,lot);box(x1-x0,.05,.05,IRONC,(x0+x1)/2,.3,z,lot);const n=Math.round((x1-x0)/.22);for(let i=0;i<=n;i++){const x=x0+(x1-x0)*i/n;cyl(.014,.014,1.2,IRONC,x,.62,z,lot,5);if(i%2===0)put(new THREE.ConeGeometry(.04,.1,6),L(GOLDC),x,1.3,z,lot)}};
  fe(-12.6,-1.7);fe(1.7,6.6);[-1.55,1.55].forEach(x=>{box(.46,.3,.46,MARBC,x,.15,z,lot);box(.36,1.9,.36,'#e9e1cf',x,1.25,z,lot);box(.46,.08,.46,MARBC,x,2.24,z,lot);sph(.16,GOLDC,x,2.45,z,lot)});
  [-9,-5,-2.7,2.7,6.6].forEach(x=>{box(.22,1.5,.22,'#e9e1cf',x,.75,z,lot);sph(.08,GOLDC,x,1.6,z,lot)})}

 /* ---------- LANTAI 1 (cangkang) ---------- */
 const s1=grp(0,Y1,0);
 box(W,H1,.25,WALLC,0,H1/2,D/2-.125,s1);box(W,H1,.25,WALLC,0,H1/2,-D/2+.125,s1);box(.25,H1,D,WALLC,-W/2+.125,H1/2,0,s1);box(.25,H1,D,WALLC,W/2-.125,H1/2,0,s1);
 box(W+.3,.14,D+.3,'#dccba6',0,1.2,0,s1);
 [-W/2,W/2].forEach(x=>[-D/2,D/2].forEach(z=>{for(let i=0;i<6;i++){const wide=i%2?.5:.34;box(wide,.52,.5,MARB2C,x+(x<0?1:-1)*.05,.3+i*.68,z+(z<0?1:-1)*.05,s1)}}));
 function win(p,x,y,z,ry,w,h){const g=grp(x,y,z,p);g.rotation.y=ry;
  box(w+.3,h+.3,.12,MARBC,0,0,0,g);put(new THREE.PlaneGeometry(w,h),glassMat,0,0,.07,g);box(.05,h,.03,MARBC,0,0,.09,g);box(w,.05,.03,MARBC,0,h*.12,.09,g);
  box(w+.55,.1,.3,MARBC,0,-h/2-.2,.12,g);box(w+.5,.1,.25,MARBC,0,h/2+.2,.1,g);
  [-1,1].forEach(s=>box(.36,h+.15,.06,'#2b4a3a',s*(w/2+.3),0,.1,g));return g}
 function door(p,x,y,z){const d=grp(x,y,z,p);box(1.8,2.9,.12,'#2a1a10',0,1.45,0,d);
  [-1,1].forEach(s=>{box(.78,2.8,.1,'#4a2c1a',s*.4,1.4,.06,d);box(.54,.7,.04,'#5b3822',s*.4,.6,.13,d);put(new THREE.PlaneGeometry(.5,1.05),glassMat,s*.4,1.95,.12,d);[.25,1.4,2.5].forEach(yy=>box(.56,.04,.03,GOLDC,s*.4,yy,.14,d));sph(.05,GOLDC,s*.1,1.4,.16,d)});
  box(.03,2.8,.12,GOLDC,0,1.4,.12,d);const fan=put(new THREE.CircleGeometry(.85,20,0,Math.PI),glassMat,0,2.9,.07,d);tor(.88,.05,GOLDC,0,2.9,.1,d,0,0,Math.PI);
  [-1,1].forEach(s=>box(.16,3.0,.2,MARBC,s*.97,1.5,.06,d));box(2.0,.12,.3,MARBC,0,3.78,.08,d);return d}
 win(s1,-4.7,2.2,D/2,0,1.4,2.2);win(s1,4.7,2.2,D/2,0,1.4,2.2);
 door(s1,0,0,D/2+.04);
 [-1.8,1.8].forEach(z=>{win(s1,-W/2,2.2,z,-Math.PI/2,1.3,2.2);win(s1,W/2,2.2,z,Math.PI/2,1.3,2.2)});
 [-4.2,-1.4,1.4,4.2].forEach(x=>win(s1,x,2.2,-D/2,Math.PI,1.3,2.2));
 /* ---------- portico: pilar, entablature, pediment ---------- */
 const por=grp(0,Y1,0);
 [-2.8,-1.0,1.0,2.8].forEach(x=>{const c=grp(x,0,4.9,por);box(.55,.14,.55,MARBC,0,.07,0,c);box(.42,.1,.42,MARBC,0,.19,0,c);cyl(.17,.2,3.3,MARBC,0,1.89,0,c,16);box(.44,.08,.44,GOLDC,0,3.58,0,c);box(.54,.14,.54,MARBC,0,3.69,0,c);sph(.07,GOLDC,-.27,3.66,0,c);sph(.07,GOLDC,.27,3.66,0,c);box(.62,.08,.62,MARBC,0,3.8,0,c)});
 box(6.6,.22,.7,MARBC,0,3.95,4.9,por);box(6.7,.28,.62,MARB2C,0,4.2,4.9,por);box(6.9,.05,.8,GOLDC,0,4.36,4.9,por);box(6.9,.1,.8,MARBC,0,4.42,4.9,por);
 box(6.4,.2,1.45,MARBC,0,4.0,4.2,por);
 for(let i=0;i<20;i++)box(.12,.1,.12,MARBC,-3.15+i*.33,3.8,5.2,por);
 tri(6.9,1.05,.55,MARBC,0,4.47,4.9,por);tri(5.6,.82,.2,'#efe6d2',0,4.52,5.2,por);
 {const m=put(new THREE.CircleGeometry(.22,14),L(GOLDC),0,4.78,5.31,por)}
 [-1.9,1.9].forEach(x=>{const lt=put(new THREE.BoxGeometry(.2,.38,.2),lampMat,x,2.7,5.0,por);lampGlows.push(lt);box(.28,.06,.28,GOLDC,x,2.95,5.0,por);halo(x,2.7,5.1,por,1.5)});
 /* ---------- PELAT + LANTAI 2 ---------- */
 const up=grp(0,0,0);
 box(W+.4,SLAB,D+.4,MARBC,0,Y1+H1+SLAB/2,0,up);box(W+.5,.05,D+.5,GOLDC,0,Y1+H1+.02,0,up);
 const s2=grp(0,Y2,0,up);
 box(W,H2,.25,WALLC,0,H2/2,D/2-.125,s2);box(W,H2,.25,WALLC,0,H2/2,-D/2+.125,s2);box(.25,H2,D,WALLC,-W/2+.125,H2/2,0,s2);box(.25,H2,D,WALLC,W/2-.125,H2/2,0,s2);
 [-W/2,W/2].forEach(x=>[-D/2,D/2].forEach(z=>{for(let i=0;i<5;i++){const wide=i%2?.5:.34;box(wide,.5,.5,MARB2C,x+(x<0?1:-1)*.05,.3+i*.68,z+(z<0?1:-1)*.05,s2)}}));
 [-4.6,-2.6,2.6,4.6].forEach(x=>win(s2,x,1.8,D/2,0,1.1,1.7));win(s2,0,2.0,D/2,0,1.4,2.1);
 [-1.8,1.8].forEach(z=>win(s2,W/2,1.8,z,Math.PI/2,1.2,1.7));
 [-4,-1.3,1.3,4].forEach(x=>win(s2,x,1.8,-D/2,Math.PI,1.2,1.7));
 win(s2,-W/2,1.6,-2.9,-Math.PI/2,1.0,1.7);win(s2,-W/2,1.6,2.9,-Math.PI/2,1.0,1.7);
 /* pintu kaca ke balkon (dinding kiri) */
 {const d=grp(-W/2,0,0,s2);d.rotation.y=-Math.PI/2;box(2.1,2.8,.14,MARBC,0,1.4,0,d);[-1,1].forEach(s=>{box(.9,2.55,.06,'#5b3822',s*.46,1.35,.06,d);put(new THREE.PlaneGeometry(.7,2.2),glassMat,s*.46,1.4,.1,d)});box(.04,2.6,.08,GOLDC,0,1.35,.1,d)}
 /* ---------- BALKON (kiri, menghadap taman) ---------- */
 const bal=grp(-W/2-1.2,Y2,0,up);
 box(2.5,.16,4.2,'#b99a72',0,.08,0,bal);box(2.6,.06,4.3,MARBC,0,-.02,0,bal);
 [-1.8,1.8].forEach(z=>[-1.0].forEach(x=>{const c=grp(x,-Y2+PL,z,bal);box(.4,.12,.4,MARBC,0,.06,0,c);cyl(.12,.14,Y2-PL-.35,MARBC,0,(Y2-PL)/2,0,c,12);box(.36,.1,.36,GOLDC,0,Y2-PL-.18,0,c)}));
 {const rl=(x,z,len,aZ)=>{if(aZ){box(.12,.1,len,MARBC,x,1.05,z,bal);box(.1,.06,len,MARBC,x,.2,z,bal);const n=Math.round(len/.34);for(let i=0;i<=n;i++)balu(x,.16,z-len/2+i*len/n,bal,.9)}else{box(len,.1,.12,MARBC,x,1.05,z,bal);box(len,.06,.1,MARBC,x,.2,z,bal);const n=Math.round(len/.34);for(let i=0;i<=n;i++)balu(x-len/2+i*len/n,.16,z,bal,.9)}};
  rl(-1.18,0,4.2,true);rl(0,2.05,2.4,false);rl(0,-2.05,2.4,false);
  [[-1.18,2.05],[-1.18,-2.05]].forEach(([x,z])=>{box(.26,1.2,.26,MARBC,x,.65,z,bal);sph(.1,GOLDC,x,1.32,z,bal)})}
 {const t=grp(-.4,.16,.9,bal);cyl(.38,.38,.04,'#c98b52',0,.7,0,t,16);cyl(.04,.04,.7,'#5a3b22',0,.35,0,t,6);cyl(.2,.2,.04,'#5a3b22',0,.02,0,t,10);cyl(.08,.07,.1,'#f6f0e6',0,.78,0,t,10);
  [[0,.75,'#4fb3a8'],[0,-.75,'#4fb3a8']].forEach(([x,z])=>box(.45,.5,.45,'#4fb3a8',x+.0,.25,z,t));
  for(let i=0;i<9;i++){const u=i/8;sph(.05,['#f0cf6a','#fff1cf','#f4a6c0','#ffffff'][i%4],-1.1,2.0-.22*Math.sin(u*Math.PI),-2.0+u*4.0,bal)}}
 /* ---------- ATAP (hip) + cornice ---------- */
 const roof=grp(0,0,0);
 box(W+.6,.25,D+.6,MARBC,0,YR+.12,0,roof);box(W+.7,.05,D+.7,GOLDC,0,YR-.02,0,roof);
 for(let i=0;i<37;i++)box(.12,.1,.1,MARBC,-W/2-.2+i*.34,YR-.1,D/2+.3,roof);
 {const w=W+1.6,d=D+1.6,h=2.7,r=(w-d)/2,y0=YR+.25;
  const v=(x,y,z)=>[x,y,z],A=v(-w/2,0,d/2),Bv=v(w/2,0,d/2),C=v(w/2,0,-d/2),Dv=v(-w/2,0,-d/2),R1=v(-r,h,0),R2=v(r,h,0);
  const pos=[].concat(A,Bv,R2,A,R2,R1,Bv,C,R2,C,Dv,R1,C,R1,R2,Dv,A,R1);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();
  const m=put(g,new THREE.MeshLambertMaterial({color:'#33507d',side:THREE.DoubleSide}),0,y0,0,roof);
  const m2=put(g,new THREE.MeshLambertMaterial({color:'#243a5e',wireframe:true}),0,y0+.012,0,roof);
  box(r*2,.14,.2,GOLDC,0,y0+h,0,roof);sph(.16,GOLDC,-r,y0+h,0,roof);sph(.16,GOLDC,r,y0+h,0,roof);
  /* dormer depan */
  [-3.4,3.4].forEach(x=>{const dg=grp(x,y0+.95,2.3,roof);box(1.3,1.2,1.1,WALLC,0,.5,0,dg);put(new THREE.PlaneGeometry(.8,.8),glassMat,0,.55,.56,dg);box(1.0,.06,.1,MARBC,0,.1,.58,dg);tri(1.6,.75,1.3,'#33507d',0,1.1,0,dg);sph(.07,GOLDC,0,1.9,.0,dg)});
  /* cerobong */
  box(.9,2.0,.9,'#8b4a3c',4.1,y0+h*.55+.6,-1.2,roof);box(1.1,.15,1.1,MARBC,4.1,y0+h*.55+1.65,-1.2,roof)}

 /* ---------- TAMAN (kiri rumah) ---------- */
 const gar=grp(0,0,0,lot);
 flat(5.9,10.0,'#6cbb64',-9.5,.012,1.5,gar);
 /* jalan batu gerbang -> air mancur */
 flat(3.4,1.0,'#e9e1cd',-8.0,.02,5.0,gar);{const r=put(new THREE.CylinderGeometry(1.75,1.75,.03,28),L('#e9e1cd'),-9.7,.02,3.7,gar);tor(1.75,.04,MARBC,-9.7,.04,3.7,gar,Math.PI/2)}
 /* air mancur bertingkat */
 const fo=grp(-9.7,0,3.7,gar);cyl(1.2,1.3,.5,MARBC,0,.25,0,fo,22);tor(1.22,.09,MARBC,0,.52,0,fo,Math.PI/2);tor(1.22,.02,GOLDC,0,.62,0,fo,Math.PI/2);cyl(1.05,1.05,.06,'#8fd0f0',0,.53,0,fo,22);
 cyl(.3,.4,.8,MARBC,0,.9,0,fo,14);cyl(.75,.8,.1,MARBC,0,1.35,0,fo,18);tor(.76,.03,GOLDC,0,1.41,0,fo,Math.PI/2);cyl(.62,.62,.04,'#8fd0f0',0,1.41,0,fo,18);cyl(.12,.18,.6,MARBC,0,1.75,0,fo,10);sph(.14,'#e6f6ff',0,2.1,0,fo);
 const drops=[];for(let i=0;i<10;i++){const d=put(new THREE.SphereGeometry(.05,6,5),B('#bfe6ff'),0,2.1,0,fo);d.userData.keep=true;drops.push(d)}
 /* gazebo kubah */
 const gz=grp(-10.2,0,-1.9,gar);box(2.5,.14,2.5,MARBC,0,.07,0,gz);box(2.2,.1,2.2,MARB2C,0,.17,0,gz);
 [[-.95,-.95],[.95,-.95],[-.95,.95],[.95,.95]].forEach(([x,z])=>{cyl(.1,.12,2.0,MARBC,x,1.2,z,gz,12);box(.3,.1,.3,GOLDC,x,2.25,z,gz)});
 box(2.2,.12,.12,MARBC,0,2.35,-.95,gz);box(2.2,.12,.12,MARBC,0,2.35,.95,gz);box(.12,.12,2.2,MARBC,-.95,2.35,0,gz);box(.12,.12,2.2,MARBC,.95,2.35,0,gz);
 {const dm=put(new THREE.SphereGeometry(1.45,18,9,0,Math.PI*2,0,Math.PI/2),L('#4a9d8f'),0,2.4,0,gz);dm.scale.y=.6;tor(1.45,.05,GOLDC,0,2.42,0,gz,Math.PI/2);cyl(.04,.1,.4,GOLDC,0,3.4,0,gz,8);sph(.12,GOLDC,0,3.65,0,gz)}
 box(1.5,.12,.4,'#1f2f4f',0,.5,-.7,gz);box(1.5,.45,.08,'#1f2f4f',0,.8,-.9,gz);
 /* pohon, hedge, bedeng bunga, cemara, patung */
 const tree=(x,z,sc)=>{const t=grp(x,0,z,gar);cyl(.14*sc,.2*sc,1.6*sc,'#5a3b22',0,.8*sc,0,t,8);const cs=['#3f9150','#4fa05a','#5fb86a','#479a57'];
  [[0,2.1,0,.9],[.5,2.5,.1,.6],[-.45,2.4,-.1,.55],[.1,2.9,.05,.5],[-.2,1.8,.4,.5],[.3,1.9,-.4,.5]].forEach(([a,b,c,r],i)=>sph(r*sc,cs[i%4],a*sc,b*sc,c*sc,t));
  [[.4,1.9,.6],[-.5,2.2,.5],[.1,2.8,.45],[.6,2.4,.3]].forEach(([a,b,c],i)=>sph(.09*sc,i%2?'#f4a6c0':'#fff1f4',a*sc,b*sc,c*sc,t))};
 tree(-11.6,-4.6,1.1);tree(-11.5,6.0,1.0);tree(-7.2,-5.4,.9);
 box(.6,1.2,10.2,'#2f7a45',-12.55,.6,1.5,gar);for(let i=0;i<7;i++)sph(.34,'#2f7a45',-12.55,1.35,-3.1+i*1.45,gar);
 box(5.6,1.1,.6,'#2f7a45',-9.5,.55,-5.5,gar);
 [[-8.2,6.9,2.4],[-11.2,6.9,2.0]].forEach(([x,z,wd])=>{const b=grp(x,0,z,gar);box(wd,.4,.7,MARBC,0,.2,0,b);box(wd+.06,.05,.76,GOLDC,0,.4,0,b);box(wd-.2,.1,.5,'#5a3b22',0,.42,0,b);
  const n=Math.round(wd/.22);for(let i=0;i<n;i++){const xx=-wd/2+.2+i*(wd-.4)/(n-1);cyl(.01,.01,.4,'#4fa05a',xx,.65,(i%2)*.15-.08,b,4);sph(.1,['#e84a5f','#f2c14e','#f4a6c0','#a98bd6','#ffffff'][i%5],xx,.9,(i%2)*.15-.08,b)}});
 [[-12.0,.6],[-12.0,-3.1]].forEach(([x,z],i)=>{const c=grp(x,0,z,gar);cyl(.05,.06,.5,'#5a3b22',0,.25,0,c,6);put(new THREE.ConeGeometry(.36,2.2,8),L(i%2?'#2a6b3b':'#256233'),0,1.55,0,c)});
 {const s=grp(-7.4,0,1.2,gar);box(.8,.16,.8,MARBC,0,.08,0,s);box(.5,.9,.5,MARBC,0,.6,0,s);box(.62,.08,.62,GOLDC,0,1.1,0,s);cyl(.2,.28,.9,MARBC,0,1.6,0,s,10);cyl(.15,.2,.5,MARBC,0,2.3,0,s,10);sph(.13,MARBC,0,2.65,0,s)}
 lampPost(gar,-8.0,6.0,1.9);lampPost(gar,-8.4,.6,1.9);

 /* ---------- INTERIOR: denah potongan (hanya tampil di mode lantai 1 / 2 / garasi) ---------- */
 const WL='#f3e9d2',PW=.55;
 function room(p,x0,x1,z0,z1,col,txt,ly,fs){const w=x1-x0,d=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;box(w,.06,d,col,cx,.03,cz,p);
  box(w,PW,.12,WL,cx,PW/2,z0+.06,p);box(w,PW,.12,WL,cx,PW/2,z1-.06,p);box(.12,PW,d,WL,x0+.06,PW/2,cz,p);box(.12,PW,d,WL,x1-.06,PW/2,cz,p);label(txt,cx,ly||2.3,cz,p,.8,fs)}
 const in1=grp(0,Y1,0),in2=grp(0,Y2,0),inB=grp(0,-3.1,0);
 /* lantai 1 */
 room(in1,-5.9,.1,-3.4,3.4,'#c9dbf1','ruang utama',2.3);
 room(in1,.1,5.9,-3.4,-.2,'#d9b98a','lounge',2.3);
 room(in1,.1,5.9,-.2,3.4,'#e6dcc8','galeri kenangan',2.3,12);
 {const t=grp(-3.0,0,.3,in1);box(2.6,.1,1.4,'#4f7fb8',0,1.0,0,t);cyl(.45,.5,.3,'#a9cdf9',0,1.2,0,t,14);cyl(.3,.3,.1,'#8dbdf7',0,1.4,0,t,14);box(.1,.3,.1,'#f2c14e',0,1.6,0,t);
  [[-1.0,-.7],[1.0,-.7],[-1.0,.7],[1.0,.7]].forEach(([x,z])=>box(.12,1.0,.12,'#2e527f',x,.5,z,t))}
 box(.6,2.4,2.2,'#a8743f',-5.5,1.2,-1.3,in1);[0,1,2,3].forEach(i=>box(.35,.5,.3,['#e84a5f','#4f8fe8','#f2c14e','#8fd18a'][i],-5.5,.5+i*.6,-1.3,in1));
 box(2.4,1.8,.1,'#7fa6d6',-3.3,2.0,-3.28,in1);
 const stairs=grp(-1.3,0,2.7,in1);[...Array(9)].forEach((_,i)=>box(1.1,(i+1)*.42,.3,i%2?'#c98b52':'#d9a066',0,(i+1)*.21,-.9+i*.3,stairs));
 box(2.6,.7,.9,'#4f8fe8',1.9,.45,-2.7,in1);box(2.6,.8,.25,'#3b73c6',1.9,.95,-3.1,in1);
 box(1.6,.1,.7,'#c98b52',4.1,.9,-3.0,in1);box(1.4,.9,.1,'#10203d',4.1,1.5,-3.2,in1);
 {const tk=put(new THREE.BoxGeometry(1.5,1.0,.8),new THREE.MeshLambertMaterial({color:'#8dbdf7',transparent:true,opacity:.55}),5.2,1.45,-2.3,in1)}box(1.0,.9,.9,'#a8743f',5.2,.45,-2.3,in1);
 cyl(1.3,1.3,.03,'#f4a6c0',3.2,.07,-1.2,in1,22);
 [0,1,2].forEach(i=>box(.08,1.2,.9,['#4f7fb8','#e0a93f','#4f7fb8'][i],5.7,1.5,.7+i*.9,in1));box(1.4,.5,.5,'#4f8fe8',3.2,.25,1.7,in1);
 /* lantai 2 */
 room(in2,-5.9,-.2,-3.4,3.4,'#d9c8f3','kamar tidur',2.2);
 room(in2,-.2,5.9,-3.4,3.4,'#cfe0cf','ruang makan & dapur',2.2,10);
 room(in2,-8.4,-6.0,-2.1,2.1,'#b99a72','balkon',2.0,13);
 box(2.4,.5,3.3,'#8a5a34',-3.0,.3,-1.7,in2);box(2.2,.3,3.1,'#fffdf3',-3.0,.7,-1.7,in2);box(2.2,.16,2.0,'#8fd0f0',-3.0,.92,-1.2,in2);box(.9,.2,.5,'#f4a6c0',-3.4,.95,-3.0,in2);
 box(.9,.7,.6,'#c98b52',-1.4,.35,-3.1,in2);box(.7,2.9,2.0,'#d9b98a',-5.5,1.45,-1.3,in2);box(.7,1.0,1.8,'#c98b52',-5.5,.5,2.0,in2);
 box(5.2,.9,.8,'#4f7fb8',2.9,.45,-3.0,in2);box(1.2,2.6,.9,'#c9d3e2',5.2,1.3,-1.6,in2);box(2.8,.12,1.5,'#c98b52',1.6,1.0,.9,in2);
 [[.5,-.2],[2.7,-.2],[.5,2.0],[2.7,2.0]].forEach(([x,z])=>box(.5,.6,.5,'#4f8fe8',x,.4,z,in2));cyl(.45,.45,.1,'#fff1cf',-.0+1.6,1.1,.9,in2,10);
 box(.12,.9,.12,'#5a3b22',-7.2,.5,0,in2);cyl(.35,.35,.05,'#c98b52',-7.6,.7,0,in2,12);
 /* garasi (basement) */
 box(11.4,.2,6.4,'#4a5160',0,.1,0,inB);
 [[11.8,1.7,.2,0,.95,-3.3],[11.8,1.7,.2,0,.95,3.3],[.2,1.7,6.8,-5.8,.95,0],[.2,1.7,6.8,5.8,.95,0]].forEach(([w,h,d,x,y,z])=>box(w,h,d,'#b9b2a2',x,y,z,inB));
 for(let i=0;i<4;i++)box(.1,.02,1.6,'#f2c14e',-3.6+i*2.4,.22,2.2,inB);
 {const c=grp(-2.4,.2,-.4,inB);c.rotation.y=.12;box(2.9,.55,1.35,'#1d3a78',0,.55,0,c);box(1.5,.5,1.2,'#2b4f9a',-.15,1.05,0,c);box(.04,.3,1.0,'#a9cbe6',.55,1.05,0,c);box(2.95,.07,1.38,GOLDC,0,.68,0,c);
  [[-.95,-.7],[-.95,.7],[.95,-.7],[.95,.7]].forEach(([x,z])=>{const w=cyl(.3,.3,.2,'#10141c',x,.3,z,c,14);w.rotation.x=Math.PI/2});[-.45,.45].forEach(z=>sph(.12,'#fff3b0',1.47,.6,z,c))}
 [[3.6,-2.7],[4.8,-2.7]].forEach(([x,z])=>{box(1.0,1.6,.5,'#8a5a34',x,.9,z,inB);[.5,.95,1.4].forEach(y=>box(1.0,.05,.5,'#5a3b22',x,y+.1,z,inB))});
 box(1.0,.09,1.6,'#c98b52',3.2,.3,.0,inB);box(1.0,.5,.7,'#e84a5f',4.6,.35,1.4,inB);
 label('garasi',.0,2.2,0,inB,.8);label('basement',-3.0,2.2,-2.8,inB,.55,10);
 /* gabungkan geometri statis per kelompok (+ per material) supaya hanya beberapa draw call; mode & animasi tetap jalan karena kelompok tetap terpisah */
 const bake=(g,skip)=>{g.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(g.matrixWorld).invert(),bk=new Map(),dead=[];
  const walk=o=>{if(skip&&skip.includes(o))return;
   if(o.isMesh&&!Array.isArray(o.material)&&!o.userData.keep){const ge=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();ge.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv,o.matrixWorld));
    let b=bk.get(o.material);if(!b)bk.set(o.material,b={p:[],n:[]});b.p.push(ge.attributes.position.array);b.n.push(ge.attributes.normal.array);dead.push(o)}
   o.children.forEach(walk)};
  g.children.forEach(walk);dead.forEach(o=>o.parent.remove(o));
  const cat=a=>{let n=0;a.forEach(x=>n+=x.length);const r=new Float32Array(n);let i=0;a.forEach(x=>{r.set(x,i);i+=x.length});return r};
  bk.forEach((b,mat)=>{const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.BufferAttribute(cat(b.p),3));ge.setAttribute('normal',new THREE.BufferAttribute(cat(b.n),3));g.add(new THREE.Mesh(ge,mat))})};
 bake(s1);bake(s2);bake(up,[s2]);bake(roof);bake(por);bake(plin);bake(ter);bake(gar);bake(lot,[plin,ter,gar]);bake(in1);bake(in2);bake(inB);
 [in1,in2,inB].forEach(g=>g.visible=false);

 /* ---------- mode tampilan ---------- */
 const cur={s1:1,s2:1};
 const MODES={
  out:{roof:1,por:1,up:1,s1:1,s2:1,plin:1,lot:1,top:1,in1:0,in2:0,inB:0},
  l1:{roof:0,por:0,up:0,s1:.13,s2:0,plin:1,lot:1,top:1,in1:1,in2:0,inB:0},
  l2:{roof:0,por:1,up:1,s1:1,s2:.13,plin:1,lot:1,top:1,in1:0,in2:1,inB:0},
  b:{roof:0,por:0,up:0,s1:0,s2:0,plin:0,lot:0,top:0,in1:0,in2:0,inB:1}};
 let mode='out',tg=MODES.out;
 function setMode(m,instant){mode=m;tg=MODES[m];
  roof.visible=!!tg.roof;por.visible=!!tg.por;up.visible=!!tg.up;plin.visible=!!tg.plin;lot.visible=!!tg.lot;soilM[2].visible=!!tg.top;
  in1.visible=!!tg.in1;in2.visible=!!tg.in2;inB.visible=!!tg.inB;
  if(instant){cur.s1=tg.s1;cur.s2=tg.s2;apply()}}
 function apply(){s1.scale.y=Math.max(.001,cur.s1);s1.visible=cur.s1>.03;s2.scale.y=Math.max(.001,cur.s2);s2.visible=cur.s2>.03}
 let ln=null;
 function update(dt,t,night){
  const k=Math.min(1,dt*8);cur.s1+=(tg.s1-cur.s1)*k;cur.s2+=(tg.s2-cur.s2)*k;apply();
  if(night!==ln){ln=night;glassMat.color.set(night?'#ffcf7a':'#a9cbe6');lampMat.color.set(night?'#ffd98a':'#f4e6b8');halos.forEach(h=>h.material.opacity=night?.85:0)}
  drops.forEach((d,i)=>{const u=(t*.9+i/drops.length)%1,a=i*2.4;d.position.set(Math.cos(a)*u*.95,2.1+3.6*u*(1-u)-.85*u,Math.sin(a)*u*.95)})}
 setMode('out',true);
 return{root,setMode,update,get mode(){return mode}};
}
window.__HM_build=buildHouse;

/* ======================================================================
   MINIATUR DI LOUNGE (di bawah kubah kaca, berputar pelan)
   ====================================================================== */
const ped=new THREE.Group();ped.position.set(MINI.x,0,MINI.z);LG.add(ped);
{const LM=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||'#000000'});
 const bx2=(w,h,d,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),LM(c));m.position.set(x,y,z);ped.add(m);return m};
 bx2(1.3,.12,1.3,'#e3dccb',0,.06,0);bx2(1.15,.74,1.15,'#f4efe4',0,.49,0);bx2(1.22,.06,1.22,GOLDC,0,.88,0);bx2(1.2,.04,1.2,GOLDC,0,.2,0);
 const gl=new THREE.Mesh(new THREE.BoxGeometry(1.08,.8,1.08),new THREE.MeshBasicMaterial({color:'#bfe0ff',transparent:true,opacity:.16,depthWrite:false}));gl.position.set(0,1.31,0);ped.add(gl);
 [[-.54,-.54],[.54,-.54],[-.54,.54],[.54,.54]].forEach(([x,z])=>bx2(.04,.8,.04,GOLDC,x,1.31,z));bx2(1.12,.04,1.12,GOLDC,0,1.72,0);
 const topK=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),LM(GOLDC));topK.position.set(0,1.78,0);ped.add(topK)}
const spin=new THREE.Group(),sc=new THREE.Group(),cen=new THREE.Group();
spin.position.y=.9+3.2*MINI_SCALE+.02;sc.scale.setScalar(MINI_SCALE);cen.position.set(3,0,-1);spin.add(sc);sc.add(cen);ped.add(spin);
const mini=buildHouse();cen.add(mini.root);
const sgn=new THREE.Sprite(new THREE.SpriteMaterial({map:labelTex('rumah Aqsa',13),transparent:true}));sgn.scale.set(1.5,.375,1);sgn.position.set(0,2.2,0);ped.add(sgn);
lact(ped,()=>openHouse());

/* ======================================================================
   PREVIEW LAYAR PENUH
   ====================================================================== */
const css=document.createElement('style');
css.textContent='#hm{position:fixed;inset:0;z-index:25;display:none;background:#9cc4f0;touch-action:none}#hm.on{display:block}#hm canvas{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}'
 +'#hm .ttl{position:absolute;top:12px;left:12px;right:96px;pointer-events:none;color:#fff;text-shadow:3px 3px 0 var(--hot)}#hm .ttl b{display:block;font:clamp(11px,3vw,16px)/1.6 "Press Start 2P",monospace}#hm .ttl span{font-size:20px;color:var(--ink);text-shadow:none;background:rgba(243,248,255,.85);padding:2px 8px;display:inline-block;margin-top:6px;border:3px solid var(--ink)}'
 +'#hm .cl{position:absolute;top:10px;right:10px}#hm .bb{position:absolute;bottom:10px;left:0;right:0;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;padding:0 8px}#hm .bb .btn.on{outline:4px solid #fff;outline-offset:1px}'
 +'#hm .hn{position:absolute;bottom:72px;left:0;right:0;text-align:center;font:9px "Press Start 2P",monospace;color:var(--ink);opacity:.7;pointer-events:none}';
document.head.appendChild(css);
const hm=document.createElement('div');hm.id='hm';
hm.innerHTML='<canvas></canvas><div class="ttl"><b>rumah Aqsa</b><span id="hmc"></span></div><button class="btn alt cl" id="hmx">tutup</button><div class="hn">seret = putar &nbsp; scroll / cubit = zoom</div>'
 +'<div class="bb"><button class="btn" data-m="out">tampak luar</button><button class="btn" data-m="l1">lantai 1</button><button class="btn" data-m="l2">lantai 2</button><button class="btn" data-m="b">garasi</button></div>';
document.body.appendChild(hm);
const CAP={out:'teras marmer, taman formal, lantai 2 + balkon',l1:'ruang utama · lounge · galeri kenangan',l2:'kamar tidur · ruang makan & dapur · balkon',b:'basement: garasi + mobil'};
const hcv=hm.querySelector('canvas'),capEl=hm.querySelector('#hmc'),btns=[...hm.querySelectorAll('[data-m]')];

let ren=null,sc2=null,cam2=null,big=null,amb2=null,sun2=null,raf=0,open=false,lt=0;
let yaw=.55,pit=.42,dist=36,gp=null,auto=true;const tgt2=new THREE.Vector3(-3,3.2,1.6),tg2=new THREE.Vector3(-3,3.2,1.6);
const MT={out:{y:3.4,p:.42},l1:{y:1.2,p:.95},l2:{y:4.4,p:.95},b:{y:-2.0,p:.95}};
function init(){
 ren=new THREE.WebGLRenderer({canvas:hcv,antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,2));
 sc2=new THREE.Scene();cam2=new THREE.PerspectiveCamera(40,1,.1,200);
 amb2=new THREE.AmbientLight(0xffffff,.8);sun2=new THREE.DirectionalLight(0xffffff,.65);sun2.position.set(8,16,12);sc2.add(amb2,sun2);
 big=buildHouse();sc2.add(big.root);
 const dn=n=>{sc2.background=new THREE.Color(n?'#141f4a':'#9cc4f0');amb2.intensity=n?.45:.8;sun2.intensity=n?.25:.65;hm.style.background=n?'#141f4a':'#9cc4f0'};dn.last=null;init.dn=dn;
 hcv.onpointerdown=e=>{hcv.setPointerCapture(e.pointerId);const o=gp||(gp=new Map());o.set(e.pointerId,{x:e.clientX,y:e.clientY});auto=false;hcv.style.cursor='grabbing'};
 hcv.onpointermove=e=>{if(!gp||!gp.has(e.pointerId))return;const p=gp.get(e.pointerId);
  if(gp.size===1){yaw-=(e.clientX-p.x)*.006;pit=clamp(pit+(e.clientY-p.y)*.004,.1,1.35)}
  else if(gp.size===2){const o=[...gp.entries()].find(([id])=>id!==e.pointerId)[1],d0=Math.hypot(p.x-o.x,p.y-o.y),d1=Math.hypot(e.clientX-o.x,e.clientY-o.y);dist=clamp(dist*(d0/Math.max(1,d1)),14,70)}
  p.x=e.clientX;p.y=e.clientY};
 hcv.onpointerup=hcv.onpointercancel=e=>{if(gp)gp.delete(e.pointerId);hcv.style.cursor='grab'};
 hcv.onwheel=e=>{e.preventDefault();dist=clamp(dist+e.deltaY*.03,14,70)};
 btns.forEach(b=>b.onclick=()=>pick(b.dataset.m));
 hm.querySelector('#hmx').onclick=closeHouse;
}
function pick(m){big.setMode(m);btns.forEach(b=>b.classList.toggle('on',b.dataset.m===m));capEl.textContent=CAP[m];tg2.set(-3,MT[m].y,1.6);goalPit=MT[m].p;
 pitGoal=true}
let goalPit=.42,pitGoal=false;
function size(){if(!ren)return;const w=innerWidth,h=innerHeight;ren.setSize(w,h,false);cam2.aspect=w/h;cam2.updateProjectionMatrix();if(!open)return;dist=clamp(w<h?Math.max(dist,52):dist,14,70)}
function loop(now){
 if(!open)return;raf=requestAnimationFrame(loop);
 const dt=Math.min(.1,(now-lt)/1000||0),t=now/1000;lt=now;
 const nt=typeof night!=='undefined'&&night;if(init.dn.last!==nt){init.dn.last=nt;init.dn(nt)}
 if(auto)yaw+=dt*.12;
 if(pitGoal&&!(gp&&gp.size)){pit+=(goalPit-pit)*Math.min(1,dt*4);if(Math.abs(goalPit-pit)<.01)pitGoal=false}
 tgt2.lerp(tg2,Math.min(1,dt*5));
 big.update(dt,t,nt);
 cam2.position.set(tgt2.x+dist*Math.sin(yaw)*Math.cos(pit),tgt2.y+dist*Math.sin(pit),tgt2.z+dist*Math.cos(yaw)*Math.cos(pit));cam2.lookAt(tgt2);
 ren.render(sc2,cam2)}
const onKey=e=>{if(e.key==='Escape')closeHouse()};
function openHouse(){
 if(open)return;if(!ren)init();open=true;hm.classList.add('on');
 dist=innerWidth<innerHeight?56:38;yaw=.55;pit=.42;auto=true;tgt2.set(-3,3.4,1.6);tg2.copy(tgt2);goalPit=.42;pitGoal=false;gp=null;
 big.setMode('out',true);btns.forEach(b=>b.classList.toggle('on',b.dataset.m==='out'));capEl.textContent=CAP.out;
 size();lt=performance.now();raf=requestAnimationFrame(loop);addEventListener('keydown',onKey);
 if(typeof sayEl!=='undefined')sayEl.style.display='none'}
function closeHouse(){if(!open)return;open=false;cancelAnimationFrame(raf);hm.classList.remove('on');removeEventListener('keydown',onKey)}
addEventListener('resize',size);

/* ---------- animasi miniatur ---------- */
const _w=winFx;
winFx=function(dt){_w(dt);try{
 const t=performance.now()/1000;
 if(LG.visible){spin.rotation.y+=dt*.35;sgn.position.y=2.2+Math.sin(t*2.2)*.06;mini.update(dt,t,typeof night!=='undefined'&&night)}
}catch(e){console.warn('housemodel3d',e)}};
})();