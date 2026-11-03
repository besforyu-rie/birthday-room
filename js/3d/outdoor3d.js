/* outdoor3d.js v7 (LUXURY + TAMAN LUAS + PATUNG MIKO) — TERAS + TAMAN bergaya rumah mewah, dan pintu ke teras di LOUNGE (kanan akuarium).
   Taruh sefolder dengan index.html, muat SETELAH floor2.js (dan basement3d.js) dan SEBELUM interact3d.js:
   <script src="basement3d.js?v=1"></script>
   <script src="outdoor3d.js?v=4"></script>
   <script src="outdoor3d.js?v=6"></script>
   <script src="interact3d.js?v=8"></script>
   Cara kerja: lounge DIPERLUAS ke kanan 3 satuan, dan pintu teras (sama persis dengan pintu "masuk" di teras) dipasang di dinding belakang, di kanan akuarium.
   Tap pintu -> teras. "masuk rumah" di teras -> balik ke lounge.
   Di teras, tap gerbang di sisi kiri -> taman. Tombol di bar atas untuk kembali.
   Siang/malam mengikuti tombol lampu di ruang utama (malam: lentera + jendela menyala hangat).
   Mau geser pintunya? Ubah angka DOOR di bawah (koordinat lokal lounge; z=-3.43 = dinding belakang, x = posisi ke kanan). Lebar tambahan lounge: EXT.
   CATATAN: pintu masuk rumah sekarang di TENGAH teras (x=0), jadi di interact3d.js ENTRY[7] = {x:0,z:-2.2}. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof hits==='undefined'||typeof lh==='undefined'||typeof lgb==='undefined'||
   typeof goalT==='undefined'||typeof lact==='undefined'||typeof act==='undefined'||typeof say3==='undefined'||typeof bx==='undefined'||
   typeof cy==='undefined'||typeof M==='undefined'||typeof LG==='undefined'||typeof lfl==='undefined'||typeof lbw==='undefined')return;

/* ===== EDIT: posisi pintu ke teras di dinding belakang lounge (koordinat lokal lounge) ===== */
const DOOR={x:6.5,z:-3.43};
/* lebar tambahan lounge ke arah kanan */
const EXT=3;
/* ===== EDIT: taman ===== */
const GX=6;              /* tambahan lebar taman ke kanan (satuan; taman asli lebar 10) */
const GZ=1.3;            /* kamera dijauhkan segini kali saat di taman supaya yang lebar muat */
const SWX=8.4,SWZ=-.5;   /* posisi ayunan di taman (koordinat lokal taman). Kalau diubah, samakan obstacle ayunan di ROOMS[8] interact3d.js */

console.log('outdoor3d.js v5 (taman luas: ayunan, aneka bunga, kupu-kupu) loaded');
const F2=window.F2||(window.F2={on:false,room:0,cx:120});
const PX='"Press Start 2P",monospace';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
const LM=(c,e)=>new THREE.MeshLambertMaterial({color:c,emissive:e||'#000000'});
function cvTex(w,h,fn,px,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 if(px)t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 const d=()=>{g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true};d();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(d);return t}
const pl=(w,h,mat,x,y,z,p,ry)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);if(ry)m.rotation.y=ry;p.add(m);return m};
const grp=(x,y,z,p,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;p.add(g);return g};
const sp=(r,c,x,y,z,p,basic)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),basic?BM(c):M(c));m.position.set(x,y,z);p.add(m);return m};
const cyx=(r,len,c,x,y,z,p)=>{const m=cy(r,r,len,c,x,y,z,p);m.rotation.z=Math.PI/2;return m};

/* ---- helper mewah: bahan marmer / emas / besi, mesh dari material, prisma, torus ---- */
const MARB=LM('#f4efe4'),MARB2=LM('#e3dccb'),GOLD=LM('#d9b24c','#4a3a0c'),IRON=LM('#1d222c'),PIER=LM('#e9e1cf');
const mesh=(geo,mat,x,y,z,p)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m};
const gbx=(w,h,d,mat,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,p);
const gcy=(rt,rb,h,mat,x,y,z,p,seg)=>mesh(new THREE.CylinderGeometry(rt,rb,h,seg||14),mat,x,y,z,p);
const gsp=(r,mat,x,y,z,p)=>mesh(new THREE.SphereGeometry(r,12,9),mat,x,y,z,p);
const torus=(R,t,mat,x,y,z,p,rx,ry,arc)=>{const m=mesh(new THREE.TorusGeometry(R,t,6,24,arc||Math.PI*2),mat,x,y,z,p);m.rotation.x=rx||0;m.rotation.y=ry||0;return m};
/* prisma segitiga (untuk pediment): lebar w, tinggi h, tebal d, dasar di yb */
const prism=(w,h,d,mat,x,yb,z,p)=>{const m=mesh(new THREE.CylinderGeometry(1,1,1,3),mat,x,yb+h/3,z,p);m.rotation.x=-Math.PI/2;m.scale.set(w/1.7320508,d,h/1.5);return m};
/* baluster (satu mesh, geometri dipakai bersama) */
const balGeo=new THREE.LatheGeometry([[.07,0],[.07,.05],[.045,.12],[.045,.2],[.08,.32],[.085,.4],[.07,.48],[.045,.58],[.045,.76],[.07,.84],[.07,.9]].map(a=>new THREE.Vector2(a[0],a[1])),10);
const balu=(x,y,z,p,sc,mat)=>{const m=mesh(balGeo,mat||MARB,x,y,z,p);if(sc)m.scale.setScalar(sc);return m};
/* halo cahaya hangat (muncul saat malam) */
const haloTex=cvTex(64,64,(g,W,H)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,225,150,.95)');r.addColorStop(.35,'rgba(255,200,110,.35)');r.addColorStop(1,'rgba(255,190,90,0)');g.fillStyle=r;g.fillRect(0,0,W,H)});
const halos=[];
const halo=(x,y,z,p,s)=>{const h=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
 h.scale.set(s||1.4,s||1.4,1);h.position.set(x,y,z);h.raycast=()=>{};p.add(h);halos.push(h);return h};
const rng=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})();

function signTex(txt,up){return cvTex(256,64,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);
 g.lineWidth=1.5;g.strokeRect(10,10,W-20,H-20);
 g.fillStyle='#f0cf6a';g.font='16px '+PX;g.textAlign='left';g.textBaseline='middle';g.fillText(txt,22,H/2+2);g.beginPath();
 if(up){g.moveTo(212,44);g.lineTo(226,18);g.lineTo(240,44)}else{g.moveTo(212,18);g.lineTo(240,18);g.lineTo(226,44)}g.fill()})}
const mkSprite=(tex,x,y,z,p,sc)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));s.scale.set(1.9*(sc||1),.48*(sc||1),1);s.position.set(x,y,z);p.add(s);return s};
const A={fount:true};

/* ======================================================================
   LOUNGE DIPERLUAS KE KANAN + PINTU KE TERAS (kanan akuarium, di dinding belakang)
   ====================================================================== */
const widen=(mesh,h)=>{const w0=10,w1=10+EXT,g=new THREE.PlaneGeometry(w1,h);g.translate(EXT/2,0,0);
 const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*w1/w0);uv.needsUpdate=true;
 const m=mesh.material.map;if(m){m.wrapS=THREE.RepeatWrapping;m.needsUpdate=true}
 mesh.geometry.dispose();mesh.geometry=g};
widen(lfl,7);widen(lbw,5);
bx(EXT,.9,.1,'#dbe9fb',5+EXT/2,.45,-3.45,LG);
const doorG=grp(DOOR.x,0,DOOR.z,LG);
/* ======================================================================
   TERAS (x = 280) — beranda mewah: lantai marmer, pilar, pediment, balustrade
   ====================================================================== */
const TER=new THREE.Group();TER.position.set(280,0,0);S.add(TER);TER.visible=false;
const marbleTex=cvTex(256,256,g=>{
 for(let a=0;a<2;a++)for(let b=0;b<2;b++){g.fillStyle=(a+b)%2?'#d6d0c2':'#f6f1e7';g.fillRect(a*128,b*128,128,128)}
 for(let i=0;i<16;i++){g.strokeStyle='rgba(120,108,92,.16)';g.lineWidth=1;g.beginPath();const x=rng()*256,y=rng()*256;g.moveTo(x,y);g.bezierCurveTo(x+30,y+20,x+50,y-20,x+90,y+10);g.stroke()}
 g.fillStyle='#caa24a';g.fillRect(0,0,256,2);g.fillRect(0,0,2,256);g.fillRect(0,127,256,2);g.fillRect(127,0,2,256)},false,[5,3.5]);
const wallTex=cvTex(512,256,(g,W,H)=>{
 g.fillStyle='#f0e5d0';g.fillRect(0,0,W,H);
 for(let i=0;i<300;i++){g.fillStyle=i%2?'rgba(170,140,95,.06)':'rgba(255,255,255,.1)';g.fillRect((i*97)%W,(i*53)%H,4,2)}
 const bh=19,top=H-57;g.fillStyle='#dccba6';g.fillRect(0,top,W,57);g.fillStyle='#bca67c';
 for(let r=0;r<3;r++){const y=top+r*bh;g.fillRect(0,y,W,2);for(let c=0;c<W/64+1;c++)g.fillRect(c*64+(r%2?32:0),y,2,bh)}});
const medTex=cvTex(256,256,g=>{
 g.fillStyle='#efe6d2';g.fillRect(0,0,256,256);
 g.strokeStyle='#caa24a';g.lineWidth=5;[120,104].forEach(r=>{g.beginPath();g.arc(128,128,r,0,7);g.stroke()});
 g.fillStyle='#1f3358';g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8-Math.PI/2,r=i%2?38:92;g.lineTo(128+Math.cos(a)*r,128+Math.sin(a)*r)}g.closePath();g.fill();
 g.fillStyle='#d9b24c';g.beginPath();g.arc(128,128,16,0,7);g.fill()});
const rugTex=cvTex(128,224,(g,W,H)=>{
 g.fillStyle='#6d1a2a';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=5;g.strokeRect(5,5,W-10,H-10);g.lineWidth=1.5;g.strokeRect(14,14,W-28,H-28);
 g.fillStyle='#d9b24c';for(let i=0;i<4;i++){const y=40+i*46;g.beginPath();g.moveTo(W/2,y-16);g.lineTo(W/2+16,y);g.lineTo(W/2,y+16);g.lineTo(W/2-16,y);g.closePath();g.fill()}});
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshLambertMaterial({map:marbleTex}));fl.rotation.x=-Math.PI/2;TER.add(fl);
 const bw=new THREE.Mesh(new THREE.PlaneGeometry(10,5),BM('#ffffff',{map:wallTex}));bw.position.set(0,2.5,-3.5);TER.add(bw);
 const md=new THREE.Mesh(new THREE.CircleGeometry(1.9,40),new THREE.MeshLambertMaterial({map:medTex}));md.rotation.x=-Math.PI/2;md.position.set(0,.012,.4);TER.add(md);
 const rg=new THREE.Mesh(new THREE.PlaneGeometry(1.4,2.2),BM('#ffffff',{map:rugTex}));rg.rotation.x=-Math.PI/2;rg.position.set(0,.02,-2.0);TER.add(rg);
 /* chair rail, quoin sudut, kornis + dentil emas */
 gbx(10,.1,.1,MARB,0,1.12,-3.43,TER);
 [-4.78,4.78].forEach(x=>{for(let i=0;i<7;i++)gbx(i%2?.5:.34,.5,.2,MARB2,x,.3+i*.65,-3.4,TER)});
 gbx(10,.22,.5,MARB,0,4.85,-3.25,TER);gbx(10,.05,.52,GOLD,0,4.72,-3.25,TER);
 for(let i=0;i<33;i++)gbx(.12,.1,.1,MARB,-4.8+i*.3,4.64,-3.04,TER);
 gbx(10.2,.12,.3,MARB2,0,.06,3.5,TER)}

/* ---- pilar + entablature + pediment di atas pintu ---- */
function column(x,h){const c=grp(x,0,-3.15,TER);
 gbx(.5,.14,.5,MARB,0,.07,0,c);gbx(.4,.1,.4,MARB,0,.19,0,c);gcy(.17,.19,h,MARB,0,.24+h/2,0,c,16);
 gbx(.42,.08,.42,GOLD,0,.24+h+.04,0,c);gbx(.5,.14,.5,MARB,0,.24+h+.15,0,c);gsp(.07,GOLD,-.27,.24+h+.12,0,c);gsp(.07,GOLD,.27,.24+h+.12,0,c);gbx(.58,.08,.58,MARB,0,.24+h+.26,0,c);return c}
column(-1.15,3.31);column(1.15,3.31);
gbx(3.3,.2,.6,MARB,0,3.95,-3.15,TER);gbx(3.3,.28,.55,MARB2,0,4.19,-3.15,TER);gbx(3.5,.05,.7,GOLD,0,4.34,-3.1,TER);gbx(3.5,.1,.7,MARB,0,4.4,-3.1,TER);
prism(3.5,.62,.5,MARB,0,4.45,-3.2,TER);

/* ---- pintu masuk rumah: dua daun, lengkung fanlight emas ---- */
const winGlass=[];
/* pintu mewah: dua daun, fanlight emas, kusen marmer (dipakai di teras & lounge) */
function luxDoor(d){
gbx(1.7,2.9,.1,LM('#2a1a10'),0,1.45,-.04,d);
[-1,1].forEach(s=>{const x=s*.37;
 gbx(.72,2.8,.1,LM('#4a2c1a'),x,1.4,.02,d);gbx(.5,.7,.04,LM('#5b3822'),x,.6,.08,d);
 winGlass.push(gbx(.46,1.05,.02,BM('#a9cbe6'),x,1.95,.08,d));
 gbx(.52,.04,.03,GOLD,x,2.5,.1,d);gbx(.52,.04,.03,GOLD,x,1.4,.1,d);gbx(.52,.04,.03,GOLD,x,.25,.1,d);
 gcy(.03,.03,.34,GOLD,s*.1,1.3,.13,d,8);gsp(.05,GOLD,s*.1,1.5,.13,d);gbx(.5,.18,.03,GOLD,x,.12,.08,d)});
gbx(.03,2.8,.12,GOLD,0,1.4,.07,d);
{const fan=new THREE.Mesh(new THREE.CircleGeometry(.75,20,0,Math.PI),BM('#a9cbe6'));fan.position.set(0,2.8,.05);d.add(fan);winGlass.push(fan);
 const sg=grp(0,2.8,.07,d);for(let i=0;i<7;i++){const a=-Math.PI/2+i*Math.PI/6;const sk=gbx(.025,.75,.02,GOLD,0,.375,0,sg);sk.position.set(-Math.sin(a)*.375,Math.cos(a)*.375,0);sk.rotation.z=a}
 torus(.78,.05,GOLD,0,2.8,.08,d,0,0,Math.PI)}
[-1,1].forEach(s=>gbx(.14,2.85,.18,MARB,s*.82,1.42,.05,d));gbx(.16,.22,.14,GOLD,0,3.66,.1,d);gbx(1.7,.05,.5,MARB2,0,.025,.28,d);
}
const d=grp(0,0,-3.43,TER);luxDoor(d);
mkSprite(signTex('masuk',true),0,4.62,.6,d,.62);
lact(d,()=>goMain());
/* ---- pintu teras di lounge (sama dengan pintu "masuk" di teras) ---- */
luxDoor(doorG);
const signT=mkSprite(signTex('teras',false),0,4.1,.4,doorG,.8);
lact(doorG,()=>goTeras());

/* ---- jendela besar + daun jendela + tirai ---- */
function win3(x){const w=grp(x,0,-3.4,TER);
 gbx(1.5,2.4,.1,MARB,0,2.85,0,w);winGlass.push(pl(1.2,2.1,BM('#a9cbe6'),0,2.85,.06,w));
 gbx(.05,2.1,.03,MARB,0,2.85,.08,w);gbx(1.2,.05,.03,MARB,0,2.85,.08,w);gbx(1.2,.04,.03,MARB,0,3.55,.08,w);
 [-.42,.42].forEach(s=>gbx(.3,2.0,.05,LM('#d9c08a'),s,2.85,.1,w));
 gbx(1.8,.1,.3,MARB,0,1.7,.12,w);[-.7,.7].forEach(s=>gbx(.1,.14,.2,MARB,s,1.58,.1,w));
 [-1,1].forEach(s=>{gbx(.5,2.4,.06,LM('#2b4a3a'),s*.98,2.9,.08,w);for(let i=0;i<9;i++)gbx(.46,.025,.02,LM('#3d6650'),s*.98,1.8+i*.25,.12,w)});
 prism(1.9,.34,.24,MARB,0,4.1,.08,w);return w}
win3(-3.2);win3(3.2);

/* ---- lentera dinding (menyala malam hari) ---- */
const terGlow=[];[-4.7,-1.68,1.68,4.7].forEach((x,i)=>{const y=i%3?2.6:2.9;
 gbx(.08,.7,.06,IRON,x,y,-3.43,TER);gbx(.26,.06,.2,GOLD,x,y+.38,-3.34,TER);
 terGlow.push(mesh(new THREE.BoxGeometry(.2,.42,.16),BM('#f4e6b8'),x,y,-3.32,TER));
 mesh(new THREE.ConeGeometry(.17,.14,4),GOLD,x,y+.5,-3.32,TER).rotation.y=Math.PI/4;halo(x,y,-3.2,TER,1.5)});

/* ---- balustrade marmer (pengganti pagar kayu) ---- */
function bal(x,z,len,alongZ){const n=Math.max(2,Math.round(len/.34));
 if(alongZ){gbx(.24,.1,len,MARB,x,1.12,z,TER);gbx(.2,.14,len,MARB,x,.11,z,TER)}else{gbx(len,.1,.24,MARB,x,1.12,z,TER);gbx(len,.14,.2,MARB,x,.11,z,TER)}
 for(let i=0;i<=n;i++){const t=-len/2+i*len/n;balu(alongZ?x:x+t,.17,alongZ?z+t:z,TER)}}
function post(x,z){gbx(.36,1.2,.36,MARB,x,.6,z,TER);gbx(.46,.08,.46,MARB,x,1.24,z,TER);gbx(.3,.05,.3,GOLD,x,1.3,z,TER);gsp(.13,GOLD,x,1.46,z,TER)}
bal(4.9,0,7,true);bal(0,3.45,10,false);bal(-4.9,-1.9,3.2,true);bal(-4.9,2.4,2.0,true);
[[4.9,3.45],[2.5,3.45],[0,3.45],[-2.5,3.45],[-4.9,3.45],[4.9,0],[4.9,-3.4],[-4.9,-3.4],[-4.9,1.4],[-4.9,-.3]].forEach(a=>post(a[0],a[1]));

/* ---- gerbang taman (sisi kiri): tiang batu + jeruji besi + lengkung emas ---- */
function mkGate(p,label,up,sy){const g=grp(-4.9,0,.5,p);
 [-.8,.8].forEach(z=>{gbx(.4,.18,.4,MARB,0,.09,z,g);gbx(.34,2.0,.34,PIER,0,1.1,z,g);gbx(.44,.1,.44,MARB,0,2.15,z,g);gbx(.3,.06,.3,GOLD,0,2.23,z,g);gsp(.15,GOLD,0,2.4,z,g)});
 for(let i=0;i<=10;i++){const z=-.6+i*.12;gcy(.018,.018,1.7,IRON,0,.95,z,g,6);mesh(new THREE.ConeGeometry(.045,.14,6),GOLD,0,1.87,z,g)}
 gbx(.04,.05,1.6,IRON,0,.35,0,g);gbx(.04,.05,1.6,IRON,0,1.5,0,g);torus(.6,.03,GOLD,0,1.55,0,g,0,Math.PI/2,Math.PI);torus(.17,.018,GOLD,0,1.0,0,g,0,Math.PI/2);
 mkSprite(signTex(label,up),.2,sy,0,g);return g}
const gate=mkGate(TER,'taman',false,3.4);
lact(gate,()=>goTaman());

/* ---- bangku berlapis beludru (dinding belakang kiri) ---- */
const tb=grp(-2.2,0,-3.0,TER);
gbx(1.6,.18,.6,LM('#1f2f4f'),0,.62,0,tb);gbx(1.64,.05,.64,GOLD,0,.52,0,tb);gbx(1.6,.7,.12,LM('#1f2f4f'),0,1.05,-.3,tb);gbx(1.64,.05,.14,GOLD,0,1.42,-.3,tb);
[[-.72,-.25],[.72,-.25],[-.72,.25],[.72,.25]].forEach(([x,z])=>gcy(.04,.05,.5,GOLD,x,.27,z,tb,8));
gbx(.5,.16,.4,LM('#d9b24c'),-.4,.78,0,tb);gbx(.4,.3,.12,LM('#f4ecd8'),.4,.9,-.1,tb);gbx(.38,.3,.12,LM('#8b2a3c'),.05,.9,-.1,tb);
lact(tb,()=>say3(tb,pick(['enak buat ngopi sore','bantalnya empuk','angin teras sejuk banget'])));
/* ---- meja marmer + kursi emas ---- */
const tt=grp(1.4,0,.2,TER);
gcy(.62,.62,.06,MARB,0,.98,0,tt,24);torus(.62,.02,GOLD,0,1.0,0,tt,Math.PI/2);gcy(.07,.1,.95,GOLD,0,.5,0,tt,12);gcy(.3,.34,.06,GOLD,0,.04,0,tt,16);
cy(.12,.14,.16,'#f6f0e6',0,1.13,0,tt);cy(.05,.05,.06,'#f6f0e6',0,1.24,0,tt);[[.3,.2],[-.3,-.2]].forEach(([x,z])=>cy(.09,.06,.07,'#f6f0e6',x,1.1,z,tt));
gcy(.2,.2,.04,GOLD,-.25,1.06,.3,tt);cy(.2,.2,.08,'#fff1cf',-.25,1.12,.3,tt);cy(.2,.2,.03,'#f4a6c0',-.25,1.18,.3,tt);
[[-1.0,0],[1.0,0]].forEach(([x,z],i)=>{const c=grp(x,0,z,tt,i?-Math.PI/2:Math.PI/2);gbx(.6,.08,.6,LM('#1f2f4f'),0,.52,0,c);[[-.26,-.26],[.26,-.26],[-.26,.26],[.26,.26]].forEach(([a,b])=>gcy(.03,.04,.5,GOLD,a,.25,b,c,8));gbx(.6,.7,.08,LM('#1f2f4f'),0,.9,-.27,c);gbx(.64,.05,.1,GOLD,0,1.27,-.27,c);lact(c,()=>say3(c,pick(['kursinya empuk','duduk sini yuk','pas banget buat ngeteh'])))});
lact(tt,()=>say3(tt,pick(['teh hangat + kue, mantap','duduk sini, temenin aku','ada sisa kue ultah nih'])));
/* ---- guci besar + topiary (interaktif) ---- */
const pot=grp(4.3,0,-2.8,TER);
gbx(.7,.14,.7,MARB,0,.07,0,pot);gcy(.2,.32,.5,MARB,0,.4,0,pot,14);gsp(.38,MARB,0,.78,0,pot);gcy(.36,.26,.14,MARB,0,1.08,0,pot,14);torus(.34,.025,GOLD,0,1.14,0,pot,Math.PI/2);
gcy(.04,.05,.5,LM('#6b4423'),0,1.4,0,pot,8);sp(.55,'#3f9150',0,1.95,0,pot);sp(.36,'#4fa05a',.25,2.35,.1,pot);sp(.1,'#f4a6c0',.3,2.55,.3,pot);sp(.1,'#fff1cf',-.3,2.1,.45,pot);
lact(pot,()=>say3(pot,pick(['tanamannya subur','udah disiram belum ya'])));
/* ---- guci topiary tambahan di samping pintu (dekor) ---- */
function urn(p,x,z,sc,col){const u=grp(x,0,z,p);
 gbx(.5*sc,.12*sc,.5*sc,MARB,0,.06*sc,0,u);gcy(.12*sc,.2*sc,.35*sc,MARB,0,.3*sc,0,u,12);gsp(.3*sc,MARB,0,.6*sc,0,u);gcy(.28*sc,.2*sc,.12*sc,MARB,0,.86*sc,0,u,12);
 torus(.27*sc,.02*sc,GOLD,0,.92*sc,0,u,Math.PI/2);gcy(.025*sc,.03*sc,.3*sc,LM('#6b4423'),0,1.1*sc,0,u,6);gsp(.34*sc,LM(col||'#3a8a47'),0,1.35*sc,0,u);gsp(.2*sc,LM(col||'#4fa05a'),0,1.72*sc,0,u);return u}
urn(TER,1.85,-3.0,1);urn(TER,-4.4,-3.0,1.1);
/* ---- tiang lampu klasik dekat gerbang ---- */
const lamp=grp(-4.3,0,3.0,TER);gbx(.34,.2,.34,IRON,0,.1,0,lamp);gcy(.04,.07,2.4,IRON,0,1.3,0,lamp,8);gcy(.08,.08,.08,GOLD,0,.9,0,lamp,10);
const lampGl=mesh(new THREE.BoxGeometry(.3,.4,.3),BM('#f4e6b8'),0,2.65,0,lamp);gbx(.42,.07,.42,GOLD,0,2.9,0,lamp);mesh(new THREE.ConeGeometry(.28,.2,4),GOLD,0,3.04,0,lamp).rotation.y=Math.PI/4;gsp(.06,GOLD,0,3.2,0,lamp);halo(0,2.65,0,lamp,1.7);
/* ---- lampu tali (di depan dinding, melewati bagian pintu) ---- */
const fl1=[];for(let i=0;i<14;i++){const u=i/13,x=-4.6+u*9.2;if(Math.abs(x)<1.9)continue;fl1.push(sp(.06,['#f0cf6a','#fff1cf','#f4a6c0','#ffffff','#f0cf6a'][i%5],x,4.5-.14*Math.sin(u*Math.PI*3),-2.75,TER,true))}

/* ======================================================================
   TAMAN (x = 320) — DIPERLUAS ke kanan (GX), ayunan duduk, aneka bunga bermodel, kupu-kupu bersayap
   ====================================================================== */
const GAR=new THREE.Group();GAR.position.set(320,0,0);S.add(GAR);GAR.visible=false;
const GW=10+GX,GC=GX/2;                       /* lebar taman & titik tengahnya (x lokal) */
const grassTex=cvTex(128,128,g=>{g.fillStyle='#5fae5a';g.fillRect(0,0,128,128);g.fillStyle='#6cbb64';g.fillRect(0,0,64,128);
 for(let i=0;i<220;i++){g.fillStyle=['#52a050','#74c46c','#5bab57'][i%3];g.fillRect((i*47)%128,(i*83)%128,2,3)}},false,[.5*GW,3.5]);
const stoneTex=cvTex(64,64,g=>{g.fillStyle='#e9e1cd';g.fillRect(0,0,64,64);g.fillStyle='#bdb299';g.fillRect(0,0,64,2);g.fillRect(0,0,2,64);g.fillRect(32,0,2,32);g.fillRect(0,32,64,2);
 for(let i=0;i<30;i++){g.fillStyle='rgba(150,135,105,.12)';g.fillRect((i*29)%64,(i*17)%64,2,2)}},true,[1,1]);
const leafTex=cvTex(64,64,g=>{g.fillStyle='#2f7a45';g.fillRect(0,0,64,64);for(let i=0;i<160;i++){g.fillStyle=['#276a3b','#3a8a50','#2c7340','#45985a'][i%4];g.fillRect((i*37)%64,(i*53)%64,3,3)}},true,[.4*GW,1]);
const leafMat=new THREE.MeshLambertMaterial({map:leafTex});

/* ======================================================================
   SISTEM BUNGA — model low-poly digabung per jenis, ditanam pakai InstancedMesh (hemat draw call)
   jenis: rose (mawar), tulip, daisy, sun (bunga matahari), lav (lavender), lily (lili), blos (kembang kecil 5 kelopak)
   ====================================================================== */
const FM=(p,r,s)=>{const q=new THREE.Quaternion().setFromEuler(new THREE.Euler((r&&r[0])||0,(r&&r[1])||0,(r&&r[2])||0,'YXZ'));
 const sc=typeof s==='number'?new THREE.Vector3(s,s,s):s?new THREE.Vector3(s[0],s[1],s[2]):new THREE.Vector3(1,1,1);
 return new THREE.Matrix4().compose(new THREE.Vector3(p[0],p[1],p[2]),q,sc)};
function Acc(){this.p=[];this.n=[];this.c=[]}
Acc.prototype.add=function(geo,m,col){const g=geo.index?geo.toNonIndexed():geo.clone();if(m)g.applyMatrix4(m);
 const P=g.attributes.position.array,N=g.attributes.normal.array;for(let i=0;i<P.length;i++){this.p.push(P[i]);this.n.push(N[i])}
 if(col){const k=new THREE.Color(col);for(let i=0;i<P.length/3;i++)this.c.push(k.r,k.g,k.b)}g.dispose();return this};
Acc.prototype.geo=function(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));
 if(this.c.length)g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));return g};
const GSPH=new THREE.SphereGeometry(1,7,5),GCYL=new THREE.CylinderGeometry(.8,1,1,5),GCIR=new THREE.CircleGeometry(1,7),GOCT=new THREE.OctahedronGeometry(1,0),GCON=new THREE.ConeGeometry(1,1,6),GCYL2=new THREE.CylinderGeometry(1,1,1,10);
function bladeG(len,wid){const s=new THREE.Shape();s.moveTo(0,0);s.quadraticCurveTo(wid*1.2,len*.45,0,len);s.quadraticCurveTo(-wid*1.2,len*.45,0,0);return new THREE.ShapeGeometry(s)}
const GR1='#3f9a4f',GR2='#4cae5c';
const stemG=(a,h,r)=>a.add(GCYL,FM([0,h/2,0],null,[r,h,r]),GR1);
const leavesG=(a,geo,n,y0,dy,lean,col)=>{for(let k=0;k<n;k++)a.add(geo,FM([0,y0+k*dy,0],[0,k*2.4+.5,-lean],1),col||GR2)};
/* mawar */
function mkRose(){const P=new Acc(),G=new Acc(),h=.46;stemG(G,h,.012);leavesG(G,bladeG(.16,.06),3,.12,.09,1.05);
 G.add(GCON,FM([0,h-.005,0],[Math.PI,0,0],[.045,.05,.045]),GR1);
 P.add(new THREE.SphereGeometry(1,8,5,0,Math.PI*2,Math.PI/2,Math.PI/2),FM([0,h+.085,0],null,[.105,.085,.105]));
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5;P.add(GSPH,FM([0,h+.07,0],[0,a,0]).multiply(FM([0,0,.075],[.55,0,0],[.07,.06,.028])))}
 for(let k=0;k<6;k++){const a=k*Math.PI/3+.3;P.add(GSPH,FM([0,h+.1,0],[0,a,0]).multiply(FM([0,0,.04],[-.35,0,0],[.055,.075,.03])))}
 P.add(GSPH,FM([0,h+.1,0],null,[.045,.05,.045]));
 return{P,G,h}}
/* tulip */
function mkTulip(){const P=new Acc(),G=new Acc(),h=.5;stemG(G,h,.013);
 G.add(bladeG(.34,.07),FM([0,.03,0],[0,0,-.4],1),GR2);G.add(bladeG(.3,.07),FM([0,.04,0],[0,Math.PI+.6,-.45],1),GR2);
 const pts=[[0,0],[.04,.012],[.07,.06],[.078,.11],[.064,.16],[.03,.2],[0,.218]].map(a=>new THREE.Vector2(a[0],a[1]));
 P.add(new THREE.LatheGeometry(pts,6),FM([0,h,0],null,[1,1,.85]));
 return{P,G,h}}
/* daisy */
function mkDaisy(){const P=new Acc(),G=new Acc(),h=.3;stemG(G,h,.01);leavesG(G,bladeG(.12,.04),2,.06,.07,1.1);
 const pg=bladeG(.1,.022);pg.rotateX(-Math.PI/2);for(let k=0;k<13;k++)P.add(pg,FM([0,h+.004,0],[.25,k*Math.PI*2/13,0],1));
 G.add(GSPH,FM([0,h+.012,0],null,[.03,.018,.03]),'#f2c14e');return{P,G,h}}
/* bunga matahari (kepala miring menghadap kamera) */
function mkSun(){const P=new Acc(),G=new Acc(),h=1.0;stemG(G,h,.028);leavesG(G,bladeG(.3,.12),3,.3,.22,.9);
 const Hm=FM([0,h,0],[1.15,0,0],1),p1=bladeG(.17,.04),p2=bladeG(.13,.04);p1.rotateX(-Math.PI/2);p2.rotateX(-Math.PI/2);
 for(let k=0;k<16;k++){P.add(p1,Hm.clone().multiply(FM([0,0,0],[.15,k*Math.PI/8,0],1)).multiply(FM([0,0,-.1],null,1)));
  P.add(p2,Hm.clone().multiply(FM([0,-.012,0],[.3,k*Math.PI/8+Math.PI/16,0],1)).multiply(FM([0,0,-.09],null,1)))}
 G.add(GCYL2,Hm.clone().multiply(FM([0,.012,0],null,[.125,.035,.125])),'#5a3b1f');G.add(GCYL2,Hm.clone().multiply(FM([0,.03,0],null,[.07,.03,.07])),'#7a5226');
 G.add(GSPH,Hm.clone().multiply(FM([0,-.035,0],null,[.1,.04,.1])),GR1);return{P,G,h:h+.1}}
/* lavender */
function mkLav(){const P=new Acc(),G=new Acc(),h=.5;stemG(G,h,.008);leavesG(G,bladeG(.22,.02),3,.0,.01,.35);
 for(let k=0;k<9;k++){const r=.032-.0018*k;P.add(GOCT,FM([(k%2?1:-1)*.008,.26+k*.027,0],[0,k*.8,0],[r,.04,r]))}return{P,G,h}}
/* lili */
function mkLily(){const P=new Acc(),G=new Acc(),h=.5;stemG(G,h,.014);leavesG(G,bladeG(.3,.045),3,.1,.1,.6);
 const pg=bladeG(.2,.05),pi=bladeG(.17,.045);
 for(let k=0;k<3;k++){P.add(pg,FM([0,h,0],[1.0,k*Math.PI*2/3,0],1));P.add(pi,FM([0,h,0],[.8,k*Math.PI*2/3+Math.PI/3,0],1))}
 for(let k=0;k<5;k++){const a=k*Math.PI*2/5;G.add(GCYL,FM([0,h,0],[.35,a,0],[.004,.12,.004]),'#e8d28a');
  G.add(GSPH,FM([0,h,0],[.35,a,0]).multiply(FM([0,.125,0],null,.013)),'#c9742b')}return{P,G,h}}
/* kembang kecil 5 kelopak (hadap +z), untuk pagar tanaman, pohon & lengkung mawar */
function mkBlos(){const P=new Acc(),G=new Acc();for(let k=0;k<5;k++)P.add(GCIR,FM([0,0,0],[0,0,k*Math.PI*2/5]).multiply(FM([0,.05,0],null,[.045,.055,.01])));
 G.add(GCIR,FM([0,0,.006],null,.024),'#f2c14e');return{P,G,h:0}}
const FT={rose:mkRose(),tulip:mkTulip(),daisy:mkDaisy(),sun:mkSun(),lav:mkLav(),lily:mkLily(),blos:mkBlos()};
const FSW={rose:.05,tulip:.07,daisy:.08,sun:.03,lav:.09,lily:.06};         /* besar goyangan angin per jenis */
const FCOL={rose:['#e84a5f','#d72f52','#f4a6c0','#ffffff','#f2c14e','#ff8a9a'],tulip:['#e84a5f','#f2c14e','#f4a6c0','#a98bd6','#ff9a3d','#ffffff','#d7385a'],
 daisy:['#ffffff','#ffffff','#fff1cf','#f9d6e4'],sun:['#f6c928','#f2b01e','#f7d54a'],lav:['#9a7fd1','#8a6cc8','#b49be0','#7f8fe0'],
 lily:['#f4a6c0','#ffffff','#f58b4c','#ffd1dc'],blos:['#f4a6c0','#fff1f4','#ffffff','#e84a5f','#f2c14e']};
const flRng=(()=>{let s=11;return()=>(s=(s*16807)%2147483647)/2147483647})();
const pickc=(k,i)=>{const a=FCOL[k];return i==null?a[Math.floor(flRng()*a.length)]:a[i%a.length]};
const FL={};Object.keys(FT).forEach(k=>FL[k]=[]);
const FTG=[];                                                               /* titik hinggap kupu-kupu (puncak bunga) */
function plant(type,x,y,z,o){o=o||{};const s=o.s||(.9+flRng()*.25);
 FL[type].push({x,y,z,s,yaw:o.yaw==null?flRng()*6.283:o.yaw,col:o.col||pickc(type),ph:flRng()*6.283,q:null,sa:FSW[type]||0});
 if(flRng()<.4)FTG.push([x,y+FT[type].h*s+.1,z])}
const _lk=new THREE.Matrix4(),_ZERO=new THREE.Vector3(0,0,0),_UP=new THREE.Vector3(0,1,0),_FZ=new THREE.Vector3(0,0,1);
function plantB(x,y,z,n,o){o=o||{};const nz=new THREE.Vector3(n[0],n[1],n[2]).normalize();
 _lk.lookAt(nz,_ZERO,Math.abs(nz.y)>.95?_FZ:_UP);const q=new THREE.Quaternion().setFromRotationMatrix(_lk);
 q.multiply(new THREE.Quaternion().setFromAxisAngle(_FZ,flRng()*6.283));
 FL.blos.push({x,y,z,s:o.s||(.85+flRng()*.4),yaw:0,col:o.col||pickc('blos'),ph:0,q,sa:0})}
const FMP=new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide}),FMG=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const FI=[],_p=new THREE.Vector3(),_q=new THREE.Quaternion(),_e=new THREE.Euler(),_s=new THREE.Vector3(),_m=new THREE.Matrix4();
function setFl(e,t){const L=e.L;for(let i=0;i<L.length;i++){const f=L[i];
  if(f.q)_q.copy(f.q);else{_e.set(f.sa?Math.sin(t*1.3+f.ph)*f.sa:0,f.yaw,f.sa?Math.cos(t*1.1+f.ph*1.7)*f.sa:0,'YXZ');_q.setFromEuler(_e)}
  _p.set(f.x,f.y,f.z);_s.set(f.s,f.s,f.s);_m.compose(_p,_q,_s);e.mp.setMatrixAt(i,_m);e.mg.setMatrixAt(i,_m)}
 e.mp.instanceMatrix.needsUpdate=true;e.mg.instanceMatrix.needsUpdate=true}
function bloom(){Object.keys(FT).forEach(k=>{const L=FL[k];if(!L.length)return;const t=FT[k];
 const mp=new THREE.InstancedMesh(t.P.geo(),FMP,L.length),mg=new THREE.InstancedMesh(t.G.geo(),FMG,L.length),c=new THREE.Color();
 [mp,mg].forEach(m=>{m.frustumCulled=false;m.raycast=()=>{};GAR.add(m)});
 L.forEach((f,i)=>mp.setColorAt(i,c.set(f.col)));mp.instanceColor.needsUpdate=true;
 const e={k,mp,mg,L};FI.push(e);setFl(e,0)})}

{const fl=new THREE.Mesh(new THREE.PlaneGeometry(GW,7),new THREE.MeshLambertMaterial({map:grassTex}));fl.rotation.x=-Math.PI/2;fl.position.set(GC,0,0);GAR.add(fl);
 const hd=new THREE.Mesh(new THREE.PlaneGeometry(GW,5),new THREE.MeshLambertMaterial({map:cvTex(64,64,g=>{g.fillStyle='#2a6b3b';g.fillRect(0,0,64,64);for(let i=0;i<140;i++){g.fillStyle=['#245c33','#337a46','#2c6d3d'][i%3];g.fillRect((i*41)%64,(i*59)%64,3,3)}},true,[.5*GW,2.5])}));hd.position.set(GC,2.5,-3.5);GAR.add(hd);
 /* pagar tanaman potong rapi + bola topiary */
 gbx(GW,1.5,.5,leafMat,GC,.75,-3.25,GAR);for(let i=0;i<=GW;i++)gsp(.32,LM('#2f7a45'),-5+i,1.62,-3.2,GAR);
 /* kembang kecil di pagar (bukan bola lagi): bawah menempel di pagar, atas di dinding hijau */
 for(let i=0;i<110;i++)plantB(-4.8+flRng()*(GW-.4),.25+flRng()*1.2,-2.985,[0,0,1]);
 for(let i=0;i<70;i++)plantB(-4.8+flRng()*(GW-.4),1.85+flRng()*2.6,-3.47,[0,0,1]);
 gbx(GW+.2,.12,.3,MARB2,GC,.06,3.5,GAR)}
/* pagar besi + tiang batu (kiri) + gerbang kembali ke teras */
function ironFence(z,len){const n=Math.round(len/.2);gbx(.05,.05,len,IRON,-4.9,1.15,z,GAR);gbx(.05,.05,len,IRON,-4.9,.3,z,GAR);
 for(let i=0;i<=n;i++){const zz=z-len/2+i*len/n;gcy(.014,.014,1.2,IRON,-4.9,.7,zz,GAR,6);if(i%2===0)mesh(new THREE.ConeGeometry(.035,.1,6),GOLD,-4.9,1.35,zz,GAR)}}
ironFence(-1.9,3.2);ironFence(2.4,2.0);
[-3.4,-.3,1.4,3.4].forEach(z=>{gbx(.2,1.5,.2,PIER,-4.9,.75,z,GAR);gsp(.1,GOLD,-4.9,1.62,z,GAR)});
/* pagar besi sisi kanan (tepi taman yang diperluas) */
{const XR=-5+GW-.05,n=34;gbx(.05,.05,6.8,IRON,XR,1.15,0,GAR);gbx(.05,.05,6.8,IRON,XR,.3,0,GAR);
 for(let i=0;i<=n;i++){const zz=-3.4+i*6.8/n;gcy(.014,.014,1.2,IRON,XR,.7,zz,GAR,6);if(i%2===0)mesh(new THREE.ConeGeometry(.035,.1,6),GOLD,XR,1.35,zz,GAR)}
 [-3.4,-1.1,1.1,3.4].forEach(z=>{gbx(.2,1.5,.2,PIER,XR,.75,z,GAR);gsp(.1,GOLD,XR,1.62,z,GAR)})}
const gate2=mkGate(GAR,'teras',true,3.2);lact(gate2,()=>goTeras2());
/* jalan batu: gerbang -> air mancur -> gazebo; jalur baru air mancur -> ayunan */
function path(x,z,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:stoneTex}));m.rotation.x=-Math.PI/2;m.position.set(x,.013,z);GAR.add(m);return m}
path(-2.7,.5,3.6,1.0);path(2.3,-.9,.9,2.2);path(4.6,.5,5.2,1.0);
/* area bermain ayunan: pasir + bingkai kayu */
{const padTex=cvTex(64,64,g=>{g.fillStyle='#e6d2a0';g.fillRect(0,0,64,64);for(let i=0;i<120;i++){g.fillStyle=['#d9c28a','#efdcae','#cdb57c'][i%3];g.fillRect((i*37)%64,(i*53)%64,2,2)}},true,[3,3]);
 const pad=new THREE.Mesh(new THREE.PlaneGeometry(3.2,3.6),new THREE.MeshLambertMaterial({map:padTex}));pad.rotation.x=-Math.PI/2;pad.position.set(SWX,.011,SWZ-.1);GAR.add(pad);
 const WB=LM('#a8743f');gbx(3.3,.1,.1,WB,SWX,.05,SWZ-1.95,GAR);gbx(3.3,.1,.1,WB,SWX,.05,SWZ+1.75,GAR);gbx(.1,.1,3.7,WB,SWX-1.6,.05,SWZ-.1,GAR);gbx(.1,.1,3.7,WB,SWX+1.6,.05,SWZ-.1,GAR)}
{const r=cy(1.75,1.75,.03,'#e9e1cd',.3,.012,.5,GAR);r.material=new THREE.MeshLambertMaterial({map:stoneTex});
 torus(1.75,.045,MARB,.3,.03,.5,GAR,Math.PI/2);
 const ri=new THREE.Mesh(new THREE.RingGeometry(1.42,1.48,48),GOLD);ri.rotation.x=-Math.PI/2;ri.position.set(.3,.03,.5);GAR.add(ri)}
/* ---- air mancur bertingkat (interaktif) ---- */
const fo=grp(.3,0,.5,GAR);
gcy(1.2,1.3,.5,MARB,0,.25,0,fo,24);torus(1.22,.09,MARB,0,.52,0,fo,Math.PI/2);torus(1.22,.02,GOLD,0,.62,0,fo,Math.PI/2);
cy(1.05,1.05,.06,'#8fd0f0',0,.53,0,fo);gcy(.3,.4,.8,MARB,0,.9,0,fo,16);gcy(.75,.8,.1,MARB,0,1.35,0,fo,20);torus(.76,.03,GOLD,0,1.41,0,fo,Math.PI/2);
cy(.62,.62,.04,'#8fd0f0',0,1.41,0,fo);gcy(.12,.18,.6,MARB,0,1.75,0,fo,12);sp(.14,'#e6f6ff',0,2.1,0,fo);gcy(.05,.05,.1,GOLD,0,1.98,0,fo,8);
for(let i=0;i<8;i++){const a=i*Math.PI/4;gsp(.06,GOLD,Math.cos(a)*1.24,.6,Math.sin(a)*1.24,fo)}
const drops=[];for(let i=0;i<14;i++)drops.push(sp(.05,'#bfe6ff',0,2.1,0,fo,true));
const ripple=new THREE.Mesh(new THREE.TorusGeometry(.5,.02,4,18),BM('#e6f6ff',{transparent:true}));ripple.rotation.x=Math.PI/2;ripple.position.set(0,.55,0);fo.add(ripple);
[0,1,2,3].forEach(i=>{const a=i*Math.PI/2+.8;gsp(.14,MARB2,Math.cos(a)*1.3,.15,Math.sin(a)*1.3,fo)});
lact(fo,()=>{A.fount=!A.fount;say3(fo,A.fount?pick(['make a wish~','koin kecil dilempar... cplung!','airnya jernih banget']):'air mancurnya istirahat')});
/* ---- gazebo kubah: pilar marmer, balustrade, kubah hijau-tembaga ---- */
const gz=grp(3.1,0,-2.0,GAR);
gbx(2.8,.14,2.8,MARB,0,.07,0,gz);gbx(2.5,.1,2.5,MARB2,0,.17,0,gz);
[[-1.1,-1.1],[1.1,-1.1],[-1.1,1.1],[1.1,1.1]].forEach(([x,z])=>{gbx(.34,.14,.34,MARB,x,.24,z,gz);gcy(.1,.12,2.3,MARB,x,1.4,z,gz,14);gbx(.3,.1,.3,GOLD,x,2.6,z,gz)});
gbx(2.5,.12,.12,MARB,0,2.7,-1.1,gz);gbx(2.5,.12,.12,MARB,0,2.7,1.1,gz);gbx(.12,.12,2.5,MARB,-1.1,2.7,0,gz);gbx(.12,.12,2.5,MARB,1.1,2.7,0,gz);
[-.7,0,.7].forEach(v=>{balu(v,.3,-1.1,gz,.8);balu(-1.1,.3,v,gz,.8);balu(1.1,.3,v,gz,.8)});
gbx(2.2,.06,.06,MARB,0,1.05,-1.1,gz);gbx(.06,.06,2.2,MARB,-1.1,1.05,0,gz);gbx(.06,.06,2.2,MARB,1.1,1.05,0,gz);
{const dome=new THREE.Mesh(new THREE.SphereGeometry(1.7,20,10,0,Math.PI*2,0,Math.PI/2),LM('#4a9d8f'));dome.scale.y=.55;dome.position.set(0,2.76,0);gz.add(dome);
 torus(1.7,.05,GOLD,0,2.78,0,gz,Math.PI/2);torus(1.1,.03,GOLD,0,3.2,0,gz,Math.PI/2);gcy(.04,.1,.4,GOLD,0,3.72,0,gz,8);gsp(.12,GOLD,0,3.98,0,gz)}
gbx(1.8,.14,.5,LM('#1f2f4f'),0,.6,-.85,gz);gbx(1.8,.5,.08,LM('#1f2f4f'),0,.95,-1.02,gz);gbx(1.84,.04,.54,GOLD,0,.52,-.85,gz);gbx(.4,.14,.34,LM('#f4ecd8'),-.4,.75,-.85,gz);
const gzl=[];for(let i=0;i<9;i++){const u=i/8;gzl.push(sp(.05,['#f0cf6a','#fff1cf','#f4a6c0','#ffffff'][i%4],-1.0+u*2.0,2.45-.15*Math.sin(u*Math.PI),1.05,gz,true))}
lact(gz,()=>say3(gz,pick(['gazebonya adem banget','cocok buat baca buku di sini','lampu talinya cantik~'])));
/* ---- pohon hias berbunga (interaktif); bunganya kembang kecil menghadap keluar ---- */
function tree(x,z,sc,name){const t=grp(x,0,z,GAR);cy(.14*sc,.2*sc,1.6*sc,'#5a3b22',0,.8*sc,0,t);
 const cols=['#3f9150','#4fa05a','#5fb86a','#479a57'];
 [[0,2.1,0,.9],[.5,2.5,.1,.6],[-.45,2.4,-.1,.55],[.1,2.9,.05,.5],[-.2,1.8,.4,.5],[.3,1.9,-.4,.5]].forEach(([a,b,c,r],i)=>sp(r*sc,cols[i%4],a*sc,b*sc,c*sc,t));
 for(let i=0;i<26;i++){const u=flRng()*6.283,v=-.35+flRng()*1.3,nx=Math.cos(u)*Math.cos(v),ny=Math.sin(v),nz=Math.sin(u)*Math.cos(v),R=(.95+flRng()*.12)*sc;
  plantB(x+nx*R,2.25*sc+ny*R,z+nz*R,[nx,ny,nz],{col:pickc('blos',flRng()<.7?0:1),s:.8+flRng()*.3})}
 lact(t,()=>say3(t,pick(name)));return t}
tree(-3.4,-2.5,1.2,['pohonnya rindang','ada apel kecil di dahannya','teduh banget di sini']);
tree(4.0,2.3,1.0,['pohonnya cantik','ada burung bersarang?']);
tree(10.3,-1.1,1.15,['teduh banget di dekat ayunan','daunnya bergoyang pelan~']);
/* ---- bedeng bunga marmer + pagar buxus (interaktif). mix = daftar jenis bunga per baris ---- */
function planter(x,z,wd,interactive,name,mix,dp,rows){dp=dp||.7;rows=rows||2;mix=mix||[['rose','daisy'],['daisy']];
 const b=grp(x,0,z,GAR);gbx(wd,.4,dp,MARB,0,.2,0,b);gbx(wd+.06,.05,dp+.06,GOLD,0,.4,0,b);gbx(wd-.2,.1,dp-.2,LM('#5a3b22'),0,.42,0,b);
 [-1,1].forEach(s=>gsp(.2,LM('#2f7a45'),s*(wd/2-.05),.55,0,b));
 const n=Math.max(3,Math.round((wd-.5)/.2));
 for(let r=0;r<rows;r++){const zz=rows===1?0:(-.5+r/(rows-1))*(dp-.3),ty=mix[r%mix.length];
  for(let i=0;i<n;i++){const k=ty[i%ty.length],xx=x-(wd-.5)/2+i*(wd-.5)/(n-1)+(r%2?.1:0);
   plant(k,xx,.47,z+zz+(flRng()-.5)*.05,{col:pickc(k,Math.floor(i/3)+r*2),s:(r===0?1.05:.9)+flRng()*.2})}}
 if(interactive){const zn=new THREE.Mesh(new THREE.BoxGeometry(wd,.9,dp),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));zn.position.y=.85;b.add(zn);lact(b,()=>say3(b,pick(name)))}
 return b}
planter(-2.3,2.7,2.4,true,['bunganya warna-warni~','wangi banget','lagi mekar semua'],[['rose','tulip'],['daisy']]);
planter(1.9,2.9,2.0,false,null,[['tulip','daisy'],['lily']]);
planter(6.4,2.75,2.8,true,['mawarnya harum banget','hati-hati, ada durinya~','merah, pink, putih... cantik semua'],[['rose'],['rose'],['daisy']],.9,3);
planter(9.2,2.75,2.8,true,['tulipnya berbaris rapi, kayak di Belanda','warna-warni banget~','mekar semua!'],[['lily'],['tulip'],['tulip']],.9,3);
/* ---- bunga matahari berbaris di depan pagar tanaman kanan ---- */
for(let i=0;i<9;i++)plant('sun',6.0+i*.52,0,-2.72+(i%2)*.12,{s:.95+flRng()*.3,yaw:(flRng()-.5)*1.0});
/* ---- lavender di kiri-kanan jalan batu ---- */
for(let i=0;i<9;i++){plant('lav',4.85+i*.19,0,-.2,{s:.9+flRng()*.2});plant('lav',4.9+i*.19,0,-.38,{s:.85+flRng()*.2});
 plant('lav',5.5+i*.19,0,1.2,{s:.9+flRng()*.2});plant('lav',5.55+i*.19,0,1.38,{s:.85+flRng()*.2})}
/* ---- bedeng lili bundar (interaktif) ---- */
{const lb=grp(6.1,0,-2.0,GAR);gcy(.7,.72,.22,MARB,0,.11,0,lb,18);torus(.71,.03,GOLD,0,.23,0,lb,Math.PI/2);gcy(.62,.62,.04,LM('#5a3b22'),0,.22,0,lb,18);
 for(let i=0;i<9;i++){const a=i*Math.PI*2/9,r=i<6?.4:.12;plant('lily',6.1+Math.cos(a)*r,.24,-2.0+Math.sin(a)*r,{col:pickc('lily',i%4),s:1+flRng()*.2})}
 for(let i=0;i<6;i++){const a=i*Math.PI/3+.5;plant('daisy',6.1+Math.cos(a)*.56,.24,-2.0+Math.sin(a)*.56,{s:.8})}
 const zn=new THREE.Mesh(new THREE.BoxGeometry(1.3,.9,1.3),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));zn.position.y=.7;lb.add(zn);
 lact(lb,()=>say3(lb,pick(['lilinya anggun~','harum lembut banget','putih, pink, oranye... bagus!'])))}
/* ---- padang bunga aster kecil di rumput ---- */
[[10.2,1.6],[5.0,1.75],[3.6,-.3],[-3.0,1.45]].forEach(([cx,cz])=>{for(let i=0;i<7;i++){const a=flRng()*6.283,r=flRng()*.55;plant('daisy',cx+Math.cos(a)*r,0,cz+Math.sin(a)*r,{s:.8+flRng()*.3})}});
/* ---- lampu taman klasik ---- */
const glow=[];[[-2.8,-.5],[4.55,1.5],[7.0,1.75],[10.2,1.5]].forEach(([x,z])=>{const l=grp(x,0,z,GAR);gbx(.34,.2,.34,IRON,0,.1,0,l);gcy(.04,.07,1.9,IRON,0,1.1,0,l,8);gcy(.08,.08,.08,GOLD,0,.8,0,l,10);
 glow.push(mesh(new THREE.BoxGeometry(.28,.34,.28),BM('#f4e6b8'),0,2.15,0,l));gbx(.38,.07,.38,GOLD,0,2.38,0,l);mesh(new THREE.ConeGeometry(.24,.18,4),GOLD,0,2.5,0,l).rotation.y=Math.PI/4;halo(0,2.15,0,l,1.6)});
/* ---- cemara italia, patung marmer, guci, lengkung mawar ---- */
[[-4.5,-1.0],[-4.5,2.2],[5.0,-.95]].forEach(([x,z],i)=>{const c=grp(x,0,z,GAR);cy(.05,.06,.5,'#5a3b22',0,.25,0,c);const k=mesh(new THREE.ConeGeometry(.36,2.4,8),LM(i%2?'#2a6b3b':'#256233'),0,1.7,0,c);gsp(.2,LM('#2f7a45'),0,2.9,0,c)});
/* ---- PATUNG MIKO (kucing siamese) versi besar: duduk di atas alas marmer; tap = ucapan / avatarmu mendekat ---- */
{const s=grp(-.9,0,-2.55,GAR);
 gbx(1.5,.16,1.5,MARB,0,.08,0,s);gbx(1.2,.16,1.2,MARB2,0,.24,0,s);gbx(.8,.76,.8,MARB,0,.7,0,s);gbx(.92,.06,.92,GOLD,0,1.1,0,s);gbx(.98,.1,.98,MARB,0,1.18,0,s);
 const pm=cvTex(128,40,(g,W,H)=>{g.fillStyle='#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=3;g.strokeRect(2,2,W-4,H-4);g.fillStyle='#f0cf6a';g.font='14px '+PX;g.textAlign='center';g.textBaseline='middle';g.fillText('MIKO',W/2,H/2+1)});
 pl(.5,.16,BM('#ffffff',{map:pm}),0,.7,.41,s);
 const k=grp(0,1.23,0,s);
 const CR=LM('#efe2c8'),CR2=LM('#dcc7a2'),BR=LM('#4b3426'),PK=LM('#e9a0a8'),EY=LM('#4aa8f0','#0d3350'),BK=LM('#111111'),WH=LM('#ffffff');
 const ell=(rx,ry,rz,m,x,y,z)=>{const e=gsp(1,m,x,y,z,k);e.scale.set(rx,ry,rz);return e};
 /* badan, dada, paha belakang */
 ell(.52,.62,.5,CR2,0,.62,-.12);ell(.4,.52,.36,CR,0,1.0,.14);
 [-1,1].forEach(sd=>{ell(.26,.34,.46,CR2,sd*.42,.36,-.02);ell(.12,.07,.18,BR,sd*.38,.07,.4);
  gcy(.12,.11,.5,CR,sd*.2,.65,.32,k,10);gcy(.1,.1,.35,BR,sd*.2,.22,.32,k,10);ell(.13,.07,.17,BR,sd*.2,.07,.37)});
 /* ekor gelap melingkar ke depan */
 const tc=new THREE.CatmullRomCurve3([[.5,.1,-.45],[.78,.1,-.15],[.82,.1,.25],[.62,.1,.58],[.3,.1,.7],[.02,.28,.64]].map(p=>new THREE.Vector3(p[0],p[1],p[2])));
 tc.getPoints(16).forEach((p,i)=>gsp(.1-.0025*i,BR,p.x,p.y,p.z,k));
 /* kepala, telinga, wajah gelap khas siamese */
 ell(.42,.37,.38,CR,0,1.78,.14);
 [-1,1].forEach(sd=>{const e=mesh(new THREE.ConeGeometry(.16,.36,4),BR,sd*.24,2.1,.08,k);e.rotation.z=-sd*.3;
  const i2=mesh(new THREE.ConeGeometry(.09,.24,4),PK,sd*.24,2.06,.13,k);i2.rotation.z=-sd*.3;
  ell(.07,.08,.04,EY,sd*.17,1.8,.5);gbx(.016,.09,.02,BK,sd*.17,1.8,.545,k);
  [-.1,0,.1].forEach(dy=>{const w=gcy(.004,.004,.4,WH,sd*.28,1.6+dy*.5,.56,k,4);w.rotation.z=Math.PI/2+sd*dy*2})});
 ell(.26,.22,.16,BR,0,1.7,.37);ell(.15,.11,.1,CR,0,1.62,.46);gsp(.04,PK,0,1.67,.55,k);
 /* kalung merah + lonceng emas */
 torus(.3,.035,LM('#c0392b'),0,1.4,.12,k,Math.PI/2);gsp(.06,GOLD,0,1.37,.42,k);
 lact(s,()=>say3(s,pick(['patung Miko versi jumbo!','Miko si siamese, gagah banget','meong~ (patungnya diam aja)','mata birunya cantik ya'])))}
urn(GAR,-2.0,-.25,1,'#3a8a47');urn(GAR,-2.0,1.25,1,'#3a8a47');
{const ar=grp(-3.9,0,.5,GAR);[-.55,.55].forEach(z=>gcy(.04,.05,2.1,MARB,0,1.05,z,ar,8));torus(.55,.04,GOLD,0,2.1,0,ar,0,Math.PI/2,Math.PI);
 /* mawar rambat di lengkungan: kembang kecil di kedua sisi */
 [-1,1].forEach(sd=>{for(let i=0;i<16;i++){const a=i*Math.PI/15;plantB(-3.9+sd*.05,2.1+Math.sin(a)*.55,.5-Math.cos(a)*.55,[sd,0,0],{col:pickc('rose',i%3===0?2:0),s:1.05})}
  for(let i=0;i<5;i++)[-.55,.55].forEach(z=>plantB(-3.9+sd*.05,.5+i*.35,.5+z,[sd,0,0],{col:pickc('rose',i%2?2:0),s:.95}))})}

/* ======================================================================
   AYUNAN DUDUK (2 kursi) — tap: avatarmu duduk lalu berayun; tap lagi = berdiri.
   Tanpa avatar: tap = ayunan didorong. Posisi: ubah SWX/SWZ di bagian EDIT atas file.
   ====================================================================== */
const SWY=2.62,SWW=2.1;                                  /* tinggi poros, kecepatan ayun (rad/detik) */
const WOOD=LM('#c98b52'),WOOD2=LM('#8a5a2e'),ROPE=LM('#efe2bd');
function limb(a,b,r,mat,p){const A=new THREE.Vector3(a[0],a[1],a[2]),B=new THREE.Vector3(b[0],b[1],b[2]),d=B.clone().sub(A),len=d.length();
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,len,8),mat);m.position.copy(A).add(B).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());p.add(m);return m}
const sw=grp(SWX,0,SWZ,GAR);
[-1.35,1.35].forEach(e=>{[-.95,.95].forEach(s=>{limb([0,SWY,e],[s,0,e],.06,WOOD,sw);gbx(.22,.1,.22,WOOD2,s,.05,e,sw)});limb([-.59,1.0,e],[.59,1.0,e],.035,WOOD2,sw);gsp(.09,WOOD2,0,SWY,e,sw)});
limb([0,SWY,-1.45],[0,SWY,1.45],.07,WOOD2,sw);
const seats=[-.5,.5].map((dz,i)=>{const g=grp(0,SWY,dz,sw);
 [-.27,.27].forEach(zz=>{gcy(.015,.015,2.03,ROPE,0,-1.015,zz,g,5);gsp(.035,ROPE,0,-2.0,zz,g)});
 gbx(.36,.06,.7,WOOD,0,-2.03,0,g);gbx(.3,.03,.6,LM(i?'#4f8fe8':'#e84a5f'),0,-1.995,0,g);
 const zn=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,.9),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));zn.position.set(0,-1.95,0);g.add(zn);
 return{g,z:SWZ+dz,A:.05,phi:0,ph:i*.7,push:0,occ:null}});
lact(sw,()=>{seats.forEach(s=>{if(!s.occ)s.push=6});say3(sw,pick(['wuuss~ ayunannya goyang','ayo duduk, aku dorong','ayunan baru, enak dipakai!']))});
window.SWING={x:SWX,z:SWZ,zs:seats.map(s=>s.z)};         /* dibaca interact3d.js */

/* ======================================================================
   KUPU-KUPU (bersayap, mengepak, hinggap di bunga) & KUNANG-KUNANG (malam)
   ====================================================================== */
const BODYM=LM('#2a1f1a'),WINGM=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
const BPAL=[{m:'#f58b2a',e:'#2a1a12',s:'#fff1cf'},{m:'#3f8fe8',e:'#10203f',s:'#bfe6ff'},{m:'#f4a6c0',e:'#6b2a44',s:'#ffffff'},{m:'#f6d34a',e:'#3a2a12',s:'#fff6c9'},{m:'#ffffff',e:'#8a8a99',s:'#cfd8e8'},{m:'#a98bd6',e:'#2d1f4a',s:'#f4e8ff'}];
function wingGeo(pal){const A2=new Acc(),R=FM([0,0,0],[Math.PI/2,0,0],1);
 const up=k=>{const s=new THREE.Shape();s.moveTo(0,.02*k);s.bezierCurveTo(.06*k,.24*k,.3*k,.3*k,.4*k,.16*k);s.bezierCurveTo(.44*k,.08*k,.34*k,-.02*k,.04*k,-.02*k);s.closePath();return s};
 const lo=k=>{const s=new THREE.Shape();s.moveTo(0,-.01*k);s.bezierCurveTo(.22*k,-.02*k,.34*k,-.1*k,.26*k,-.24*k);s.bezierCurveTo(.2*k,-.34*k,.06*k,-.3*k,0,-.14*k);s.closePath();return s};
 const lay=(z,k,col)=>{A2.add(new THREE.ShapeGeometry(up(k),6),R.clone().multiply(FM([0,0,z],null,1)),col);A2.add(new THREE.ShapeGeometry(lo(k),6),R.clone().multiply(FM([0,0,z],null,1)),col)};
 lay(.004,1.12,pal.e);lay(0,1,pal.m);
 [[.3,.17],[.2,.22],[.17,-.16]].forEach(([x,y])=>A2.add(new THREE.CircleGeometry(.032,8),R.clone().multiply(FM([x,y,-.004],null,1)),pal.s));
 return A2.geo()}
const BF=[];
function pickT(b){const air=flRng()<.28||!FTG.length;
 if(air){b.tx=-3+Math.random()*13;b.ty=1.0+Math.random()*1.6;b.tz=-2.4+Math.random()*5;b.land=false}
 else{const p=FTG[Math.floor(Math.random()*FTG.length)];b.tx=p[0]+(Math.random()-.5)*.08;b.ty=p[1];b.tz=p[2]+(Math.random()-.5)*.08;b.land=true}}
BPAL.forEach((pal,i)=>{const g=new THREE.Group(),gm=wingGeo(pal);
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.018,.012,.22,6),BODYM);body.rotation.x=Math.PI/2;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.032,6,5),BODYM);head.position.set(0,0,.13);g.add(head);
 [-1,1].forEach(s=>{const an=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.14,3),BODYM);an.position.set(s*.03,.04,.2);an.rotation.set(1.1,0,-s*.4);g.add(an)});
 const wl=new THREE.Group(),wr=new THREE.Group();wl.scale.x=-1;
 [wr,wl].forEach(w=>{w.add(new THREE.Mesh(gm,WINGM));w.position.y=.01;g.add(w)});
 const hz=new THREE.Mesh(new THREE.SphereGeometry(.5,6,4),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));g.add(hz);
 g.scale.setScalar(.7);const p0=FTG.length?FTG[(i*7)%FTG.length]:[i*2,1.2,0];g.position.set(p0[0],p0[1],p0[2]);GAR.add(g);
 const b={g,wl,wr,v:new THREE.Vector3(),ph:i*1.9+.5,perch:Math.random()*3,tx:0,ty:1,tz:0,land:false};pickT(b);BF.push(b);
 lact(g,()=>{say3(g,pick(['kupu-kupunya cantik~','eh kabur... jangan takut','sayapnya warna-warni banget']));b.perch=0;pickT(b);b.v.y+=1.2})});
function bfStep(dt,t){BF.forEach(b=>{const g=b.g,p=g.position;
 if(b.perch>0){b.perch-=dt;const f=.85+.3*Math.sin(t*2.4+b.ph);b.wr.rotation.z=f;b.wl.rotation.z=-f;if(b.perch<=0)pickT(b);return}
 const dx=b.tx-p.x,dy=b.ty-p.y,dz=b.tz-p.z,d=Math.hypot(dx,dy,dz);
 if(d<.14){if(b.land){p.set(b.tx,b.ty,b.tz);b.perch=2+Math.random()*3.5;b.v.set(0,0,0)}else pickT(b);return}
 const sp2=1.0+.35*Math.sin(t*.9+b.ph),k=Math.min(1,dt*2.4);
 b.v.x+=(dx/d*sp2+Math.sin(t*3.1+b.ph)*.5-b.v.x)*k;b.v.y+=(dy/d*sp2*.8+Math.sin(t*4.3+b.ph*2)*.45-b.v.y)*k;b.v.z+=(dz/d*sp2+Math.cos(t*2.7+b.ph)*.5-b.v.z)*k;
 p.x=Math.max(-4.5,Math.min(GW-5.5,p.x+b.v.x*dt));p.y=Math.max(.25,p.y+b.v.y*dt);p.z=Math.max(-3.1,Math.min(3.3,p.z+b.v.z*dt));
 if(Math.hypot(b.v.x,b.v.z)>.15){const ty=Math.atan2(b.v.x,b.v.z);let df=ty-g.rotation.y;df=Math.atan2(Math.sin(df),Math.cos(df));g.rotation.y+=df*Math.min(1,dt*6)}
 const f=.3+.8*Math.sin(t*(15+b.ph)+b.ph);b.wr.rotation.z=f;b.wl.rotation.z=-f})}
const FF=[];for(let i=0;i<14;i++){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:haloTex,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));
 s.scale.set(.3,.3,1);s.visible=false;s.raycast=()=>{};GAR.add(s);FF.push({s,x:-3+flRng()*13,y:.5+flRng()*1.6,z:-2.5+flRng()*5.5,ph:flRng()*6.283})}
function ffStep(t){FF.forEach(f=>{f.s.position.set(f.x+Math.sin(t*.4+f.ph)*.7,f.y+Math.sin(t*.9+f.ph*2)*.25,f.z+Math.cos(t*.35+f.ph)*.7);f.s.material.opacity=Math.max(0,.15+.85*Math.sin(t*1.6+f.ph*3))})}
bloom();

/* ======================================================================
   NAVIGASI & HUD
   ====================================================================== */
const fd=document.createElement('div');fd.style.cssText='position:fixed;inset:0;background:#1c2438;opacity:0;pointer-events:none;transition:opacity .25s;z-index:30';document.body.appendChild(fd);
let busy=false,IN=0,zoomed=false,baseDist=0;
const trans=fn=>{if(busy)return;busy=true;fd.style.opacity=1;setTimeout(()=>{try{fn()}finally{fd.style.opacity=0;setTimeout(()=>{busy=false},260)}},270)};
const barEl=document.getElementById('bar');
const mkBtn=(t,fn)=>{const b=document.createElement('button');b.className='btn alt';b.textContent=t;b.style.display='none';b.onclick=fn;if(barEl)barEl.prepend(b);return b};
const btnA=mkBtn('masuk rumah',()=>{IN===7?goMain():goTeras2()}),btnB=mkBtn('taman',()=>goTaman());
/* kamera taman yang luas: titik pandang digeser ke tengah taman, jarak kamera diperbesar, batas geser (upgrade3d.js) diperlebar lewat F2.pc / F2.pw */
function camGarden(on){
 F2.pc=on?GX/2:0;F2.pw=on?GX/2+3:0;
 if(on&&!zoomed){baseDist=dist;dist=Math.min(40,dist*GZ);zoomed=true}
 else if(!on&&zoomed){dist=baseDist;zoomed=false}}
addEventListener('resize',()=>{if(zoomed){baseDist=dist;dist=Math.min(40,dist*GZ)}});
function show(r){
 IN=r;const G=r===7?TER:GAR;
 S.children.forEach(o=>{if(!o.isLight)o.visible=(o===G)});
 mode=1;F2.on=true;F2.room=3;F2.cx=r===7?280:320;
 camGarden(r===8);
 goalT.set(F2.cx+(F2.pc||0),2.2,0);if(typeof tgt!=='undefined')tgt.copy(goalT);
 lgb.style.display='none';if(typeof vb!=='undefined')vb.style.display='none';const st=document.getElementById('sticky');if(st)st.style.display='none';
 btnA.textContent=r===7?'masuk rumah':'teras';btnA.style.display='';btnB.style.display=r===7?'':'none';
 if(typeof sayEl!=='undefined')sayEl.style.display='none'}
function goTeras(){trans(()=>show(7))}
function goTeras2(){trans(()=>show(7))}
function goTaman(){trans(()=>show(8))}
function goMain(){trans(()=>{
 if(!IN)return;IN=0;
 camGarden(false);
 if(typeof lgb.onclick==='function'){lgb.onclick();lgb.onclick()}
 S.children.forEach(o=>{if(o.isGroup&&o.position.x>=100&&o.position.y===0&&o.position.z===0)o.visible=false});
 F2.on=false;F2.room=0;lgb.style.display='';btnA.style.display=btnB.style.display='none';
 if(typeof sayEl!=='undefined')sayEl.style.display='none'})}

/* ======================================================================
   AYUNAN: fisika ayunan + avatar yang duduk ikut berayun
   - swStep() menghitung sudut ayun tiap kursi (waktu pakai jam sistem, jadi semua orang melihat ayunan yang sama)
   - postAv() dijalankan TEPAT SEBELUM render: menaikkan avatar ke kursi & memiringkannya mengikuti tali
   ====================================================================== */
const AV=typeof V!=='undefined'?V:new Map();
const swingOf=v=>{if(v.room!==8||v.mode!=='sit')return null;for(const s of seats)if(Math.abs(v.x-SWX)<.55&&Math.abs(v.z-s.z)<.45)return s;return null};
function swStep(dt){const tt=Date.now()/1000;
 seats.forEach(s=>s.occ=null);AV.forEach(v=>{const s=swingOf(v);if(s)s.occ=v});
 seats.forEach(s=>{const tg=s.occ?.62:(s.push>0?.4:.06);s.push=Math.max(0,s.push-dt);s.A+=(tg-s.A)*Math.min(1,dt*(s.occ?.8:.45));
  s.phi=s.A*Math.sin(tt*SWW+s.ph);s.g.rotation.z=s.phi})}
function relV(v){v._swS=null;v._swW=0;v.g.rotation.set(0,0,0);if(typeof paintV==='function'){try{paintV(v)}catch(e){}}}
const _qa=new THREE.Quaternion(),_qb=new THREE.Quaternion(),_qc=new THREE.Quaternion(),_Y3=new THREE.Vector3(0,1,0),_Z3=new THREE.Vector3(0,0,1);
function postAv(dt){const tt=Date.now()/1000;
 AV.forEach(v=>{const s=swingOf(v);if(!s)return;
  if(v._swS!==s){v._swS=s;v._swW=0;v._swBY=v.g.rotation.y}
  v._swW=Math.min(1,v._swW+dt*3);const w=v._swW*v._swW*(3-2*v._swW),phi=s.phi,px=SWX+SWY*Math.sin(phi),py=SWY-SWY*Math.cos(phi);
  v.g.position.set(v.x+(px-v.x)*w,py*w,v.z+(s.z-v.z)*w);
  _qa.setFromAxisAngle(_Y3,v._swBY);_qb.setFromAxisAngle(_Z3,phi).multiply(_qc.setFromAxisAngle(_Y3,Math.PI/2));
  v.g.quaternion.copy(_qa).slerp(_qb,w);
  if(v.tg)v.tg.position.set(v.g.position.x,v.g.position.y+2.35,v.g.position.z);
  if(v.legs&&w>.9){const k=-1.35-.25*Math.sin(tt*SWW+s.ph);v.legs[0].rotation.x=k;v.legs[1].rotation.x=k}})}
/* jalankan postAv tepat sebelum render supaya tidak ditimpa logika jalan avatar */
if(typeof REN!=='undefined'&&REN&&typeof REN.render==='function'){const _rr=REN.render;let _lt=performance.now();
 REN.render=function(a,b){try{const n=performance.now(),dt=Math.min(.1,(n-_lt)/1000);_lt=n;if(IN===8)postAv(dt)}catch(e){}return _rr.call(this,a,b)}}

/* ======================================================================
   ANIMASI PER FRAME
   ====================================================================== */
let lastNight=null,fc=0;
function step(dt){
 const t=performance.now()/1000;
 signT.position.y=4.1+Math.sin(t*2.2)*.1;
 AV.forEach(v=>{if(v._swS&&swingOf(v)!==v._swS)relV(v)});     /* avatar sudah bangun dari ayunan / pindah ruangan: tegakkan lagi */
 if(!IN)return;
 const nt=(typeof night!=='undefined')&&night;
 if(nt!==lastNight){lastNight=nt;const c=nt?'#ffd98a':'#f4e6b8';terGlow.forEach(m=>m.material.color.set(c));lampGl.material.color.set(c);glow.forEach(m=>m.material.color.set(c));
  winGlass.forEach(m=>m.material.color.set(nt?'#ffcf7a':'#a9cbe6'));halos.forEach(h=>{h.material.opacity=nt?.85:0});
  BF.forEach(b=>{b.g.visible=!nt});FF.forEach(f=>{f.s.visible=nt})}
 fl1.forEach((b,i)=>b.scale.setScalar(.85+.3*Math.sin(t*3+i)));gzl.forEach((b,i)=>b.scale.setScalar(.85+.3*Math.sin(t*3+i*1.3)));
 if(IN===8){
  drops.forEach((d,i)=>{if(!A.fount){d.visible=false;return}d.visible=true;const u=(t*.9+i/drops.length)%1,a=i*2.4;d.position.set(Math.cos(a)*u*.95,2.1+.9*4*u*(1-u)-.85*u,Math.sin(a)*u*.95)});
  const rp=(t*.8)%1;ripple.visible=A.fount;ripple.scale.setScalar(.5+rp*1.2);ripple.material.opacity=1-rp;
  swStep(dt);if(!nt)bfStep(dt,t);else ffStep(t);
  if((fc++&1)===0)FI.forEach(e=>setFl(e,t))}}
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);try{step(dt)}catch(e){console.warn('outdoor3d',e)}}}
})();