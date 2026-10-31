/* outdoor3d.js v4 (LUXURY) — TERAS + TAMAN bergaya rumah mewah, dan pintu ke teras di LOUNGE (kanan akuarium).
   Taruh sefolder dengan index.html, muat SETELAH floor2.js (dan basement3d.js) dan SEBELUM interact3d.js:
   <script src="basement3d.js?v=1"></script>
   <script src="outdoor3d.js?v=4"></script>
   <script src="interact3d.js?v=5"></script>
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

console.log('outdoor3d.js v4 (luxury, pintu di lounge kanan akuarium) loaded');
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
[[-1.0,0],[1.0,0]].forEach(([x,z],i)=>{const c=grp(x,0,z,tt,i?-Math.PI/2:Math.PI/2);gbx(.6,.08,.6,LM('#1f2f4f'),0,.52,0,c);[[-.26,-.26],[.26,-.26],[-.26,.26],[.26,.26]].forEach(([a,b])=>gcy(.03,.04,.5,GOLD,a,.25,b,c,8));gbx(.6,.7,.08,LM('#1f2f4f'),0,.9,-.27,c);gbx(.64,.05,.1,GOLD,0,1.27,-.27,c)});
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
   TAMAN (x = 320) — taman formal: pagar tanaman, parterre, air mancur bertingkat, gazebo kubah
   ====================================================================== */
const GAR=new THREE.Group();GAR.position.set(320,0,0);S.add(GAR);GAR.visible=false;
const grassTex=cvTex(128,128,g=>{g.fillStyle='#5fae5a';g.fillRect(0,0,128,128);g.fillStyle='#6cbb64';g.fillRect(0,0,64,128);
 for(let i=0;i<220;i++){g.fillStyle=['#52a050','#74c46c','#5bab57'][i%3];g.fillRect((i*47)%128,(i*83)%128,2,3)}},false,[5,3.5]);
const stoneTex=cvTex(64,64,g=>{g.fillStyle='#e9e1cd';g.fillRect(0,0,64,64);g.fillStyle='#bdb299';g.fillRect(0,0,64,2);g.fillRect(0,0,2,64);g.fillRect(32,0,2,32);g.fillRect(0,32,64,2);
 for(let i=0;i<30;i++){g.fillStyle='rgba(150,135,105,.12)';g.fillRect((i*29)%64,(i*17)%64,2,2)}},true,[1,1]);
const leafTex=cvTex(64,64,g=>{g.fillStyle='#2f7a45';g.fillRect(0,0,64,64);for(let i=0;i<160;i++){g.fillStyle=['#276a3b','#3a8a50','#2c7340','#45985a'][i%4];g.fillRect((i*37)%64,(i*53)%64,3,3)}},true,[4,1]);
const leafMat=new THREE.MeshLambertMaterial({map:leafTex});
{const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),new THREE.MeshLambertMaterial({map:grassTex}));fl.rotation.x=-Math.PI/2;GAR.add(fl);
 const hd=new THREE.Mesh(new THREE.PlaneGeometry(10,5),new THREE.MeshLambertMaterial({map:cvTex(64,64,g=>{g.fillStyle='#2a6b3b';g.fillRect(0,0,64,64);for(let i=0;i<140;i++){g.fillStyle=['#245c33','#337a46','#2c6d3d'][i%3];g.fillRect((i*41)%64,(i*59)%64,3,3)}},true,[5,2.5])}));hd.position.set(0,2.5,-3.5);GAR.add(hd);
 /* pagar tanaman potong rapi + bola topiary + mawar */
 gbx(10,1.5,.5,leafMat,0,.75,-3.25,GAR);for(let i=0;i<11;i++)gsp(.32,LM('#2f7a45'),-5+i,1.62,-3.2,GAR);
 for(let i=0;i<60;i++)sp(.1,['#f4a6c0','#f2c14e','#ffffff','#e84a5f'][i%4],-4.8+((i*37)%96)/10,.3+((i*53)%12)/10,-2.97,GAR,true);
 for(let i=0;i<40;i++)sp(.12,['#f4a6c0','#f2c14e','#ffffff','#e84a5f'][i%4],-4.8+((i*37)%96)/10,1.9+((i*53)%26)/10,-3.45,GAR,true);
 gbx(10.2,.12,.3,MARB2,0,.06,3.5,GAR)}
/* pagar besi + tiang batu (kiri) + gerbang kembali ke teras */
function ironFence(z,len){const n=Math.round(len/.2);gbx(.05,.05,len,IRON,-4.9,1.15,z,GAR);gbx(.05,.05,len,IRON,-4.9,.3,z,GAR);
 for(let i=0;i<=n;i++){const zz=z-len/2+i*len/n;gcy(.014,.014,1.2,IRON,-4.9,.7,zz,GAR,6);if(i%2===0)mesh(new THREE.ConeGeometry(.035,.1,6),GOLD,-4.9,1.35,zz,GAR)}}
ironFence(-1.9,3.2);ironFence(2.4,2.0);
[-3.4,-.3,1.4,3.4].forEach(z=>{gbx(.2,1.5,.2,PIER,-4.9,.75,z,GAR);gsp(.1,GOLD,-4.9,1.62,z,GAR)});
const gate2=mkGate(GAR,'teras',true,3.2);lact(gate2,()=>goTeras2());
/* jalan batu: gerbang -> air mancur -> gazebo */
function path(x,z,w,d){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshLambertMaterial({map:stoneTex}));m.rotation.x=-Math.PI/2;m.position.set(x,.013,z);GAR.add(m);return m}
path(-2.7,.5,3.6,1.0);path(2.3,-.9,.9,2.2);
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
/* ---- pohon hias berbunga (interaktif) ---- */
function tree(x,z,sc,name){const t=grp(x,0,z,GAR);cy(.14*sc,.2*sc,1.6*sc,'#5a3b22',0,.8*sc,0,t);
 const cols=['#3f9150','#4fa05a','#5fb86a','#479a57'];
 [[0,2.1,0,.9],[.5,2.5,.1,.6],[-.45,2.4,-.1,.55],[.1,2.9,.05,.5],[-.2,1.8,.4,.5],[.3,1.9,-.4,.5]].forEach(([a,b,c,r],i)=>sp(r*sc,cols[i%4],a*sc,b*sc,c*sc,t));
 [[.4,1.9,.6],[-.5,2.2,.5],[.1,2.8,.45],[.6,2.4,.3],[-.55,2.6,-.1],[.2,2.1,.7],[-.2,1.7,.65]].forEach(([a,b,c],i)=>sp(.09*sc,i%2?'#f4a6c0':'#fff1f4',a*sc,b*sc,c*sc,t));
 lact(t,()=>say3(t,pick(name)));return t}
tree(-3.4,-2.5,1.2,['pohonnya rindang','ada apel kecil di dahannya','teduh banget di sini']);
tree(4.0,2.3,1.0,['pohonnya cantik','ada burung bersarang?']);
/* ---- parterre: bedeng marmer + pagar buxus (interaktif) ---- */
function planter(x,z,wd,interactive,name){const b=grp(x,0,z,GAR);gbx(wd,.4,.7,MARB,0,.2,0,b);gbx(wd+.06,.05,.76,GOLD,0,.4,0,b);gbx(wd-.2,.1,.5,LM('#5a3b22'),0,.42,0,b);
 const n=Math.round(wd/.22);for(let i=0;i<n;i++){const xx=-wd/2+.2+i*(wd-.4)/(n-1),zz=(i%2)*.15-.08;cy(.01,.01,.45,'#4fa05a',xx,.7,zz,b);sp(.1,['#e84a5f','#f2c14e','#f4a6c0','#a98bd6','#ffffff'][i%5],xx,.95+(i%3)*.05,zz,b)}
 [-1,1].forEach(s=>gsp(.2,LM('#2f7a45'),s*(wd/2-.05),.55,0,b));
 if(interactive)lact(b,()=>say3(b,pick(name)));return b}
planter(-2.3,2.7,2.4,true,['bunganya warna-warni~','wangi banget','lagi mekar semua']);
planter(1.9,2.9,2.0,false);
/* ---- lampu taman klasik ---- */
const glow=[];[[-2.8,-.5],[4.3,.9]].forEach(([x,z])=>{const l=grp(x,0,z,GAR);gbx(.34,.2,.34,IRON,0,.1,0,l);gcy(.04,.07,1.9,IRON,0,1.1,0,l,8);gcy(.08,.08,.08,GOLD,0,.8,0,l,10);
 glow.push(mesh(new THREE.BoxGeometry(.28,.34,.28),BM('#f4e6b8'),0,2.15,0,l));gbx(.38,.07,.38,GOLD,0,2.38,0,l);mesh(new THREE.ConeGeometry(.24,.18,4),GOLD,0,2.5,0,l).rotation.y=Math.PI/4;halo(0,2.15,0,l,1.6)});
/* ---- cemara italia, patung marmer, guci, lengkung mawar ---- */
[[-4.5,-1.0],[-4.5,2.2],[4.65,-.2]].forEach(([x,z],i)=>{const c=grp(x,0,z,GAR);cy(.05,.06,.5,'#5a3b22',0,.25,0,c);const k=mesh(new THREE.ConeGeometry(.36,2.4,8),LM(i%2?'#2a6b3b':'#256233'),0,1.7,0,c);gsp(.2,LM('#2f7a45'),0,2.9,0,c)});
{const s=grp(-.9,0,-2.55,GAR);
 gbx(.9,.18,.9,MARB,0,.09,0,s);gbx(.7,.18,.7,MARB,0,.27,0,s);gbx(.5,1.0,.5,MARB,0,.86,0,s);gbx(.62,.1,.62,GOLD,0,1.41,0,s);gbx(.7,.08,.7,MARB,0,1.5,0,s);
 gcy(.2,.3,.95,MARB,0,2.02,0,s,10);gcy(.16,.2,.5,MARB,0,2.75,0,s,10);gsp(.13,MARB,0,3.1,0,s);
 const a1=gcy(.05,.05,.55,MARB,.22,2.8,0,s,8);a1.rotation.z=-.5;const a2=gcy(.05,.05,.55,MARB,-.2,3.0,0,s,8);a2.rotation.z=2.4;
 lact(s,()=>say3(s,pick(['patung marmer, cantik ya','kayak di museum aja','dingin... marmer asli?'])))}
urn(GAR,-2.0,-.25,1,'#3a8a47');urn(GAR,-2.0,1.25,1,'#3a8a47');
{const ar=grp(-3.9,0,.5,GAR);[-.55,.55].forEach(z=>gcy(.04,.05,2.1,MARB,0,1.05,z,ar,8));torus(.55,.04,GOLD,0,2.1,0,ar,0,Math.PI/2,Math.PI);
 for(let i=0;i<14;i++){const a=i*Math.PI/13;sp(.09,['#e84a5f','#f4a6c0','#ffffff'][i%3],0,2.1+Math.sin(a)*.55,-Math.cos(a)*.55,ar)}
 for(let i=0;i<6;i++)sp(.08,['#e84a5f','#f4a6c0'][i%2],0,.5+i*.3,i%2?.55:-.55,ar)}
/* kupu-kupu */
const flies=[0,1,2].map(i=>{const b=grp(0,1.6,0,GAR);const c=['#f4a6c0','#f2c14e','#8fd0f0'][i];bx(.2,.02,.12,c,-.1,0,0,b);bx(.2,.02,.12,c,.1,0,0,b);return b});

/* ======================================================================
   NAVIGASI & HUD
   ====================================================================== */
const fd=document.createElement('div');fd.style.cssText='position:fixed;inset:0;background:#1c2438;opacity:0;pointer-events:none;transition:opacity .25s;z-index:30';document.body.appendChild(fd);
let busy=false,IN=0;
const trans=fn=>{if(busy)return;busy=true;fd.style.opacity=1;setTimeout(()=>{try{fn()}finally{fd.style.opacity=0;setTimeout(()=>{busy=false},260)}},270)};
const barEl=document.getElementById('bar');
const mkBtn=(t,fn)=>{const b=document.createElement('button');b.className='btn alt';b.textContent=t;b.style.display='none';b.onclick=fn;if(barEl)barEl.prepend(b);return b};
const btnA=mkBtn('masuk rumah',()=>{IN===7?goMain():goTeras2()}),btnB=mkBtn('taman',()=>goTaman());
function show(r){
 IN=r;const G=r===7?TER:GAR;
 S.children.forEach(o=>{if(!o.isLight)o.visible=(o===G)});
 mode=1;F2.on=true;F2.room=3;F2.cx=r===7?280:320;
 goalT.set(F2.cx,2.2,0);if(typeof tgt!=='undefined')tgt.copy(goalT);
 lgb.style.display='none';if(typeof vb!=='undefined')vb.style.display='none';const st=document.getElementById('sticky');if(st)st.style.display='none';
 btnA.textContent=r===7?'masuk rumah':'teras';btnA.style.display='';btnB.style.display=r===7?'':'none';
 if(typeof sayEl!=='undefined')sayEl.style.display='none'}
function goTeras(){trans(()=>show(7))}
function goTeras2(){trans(()=>show(7))}
function goTaman(){trans(()=>show(8))}
function goMain(){trans(()=>{
 if(!IN)return;IN=0;
 if(typeof lgb.onclick==='function'){lgb.onclick();lgb.onclick()}
 S.children.forEach(o=>{if(o.isGroup&&o.position.x>=100&&o.position.y===0&&o.position.z===0)o.visible=false});
 F2.on=false;F2.room=0;lgb.style.display='';btnA.style.display=btnB.style.display='none';
 if(typeof sayEl!=='undefined')sayEl.style.display='none'})}

/* ======================================================================
   ANIMASI PER FRAME
   ====================================================================== */
let lastNight=null;
function step(dt){
 const t=performance.now()/1000;
 signT.position.y=4.1+Math.sin(t*2.2)*.1;
 if(!IN)return;
 const nt=(typeof night!=='undefined')&&night;
 if(nt!==lastNight){lastNight=nt;const c=nt?'#ffd98a':'#f4e6b8';terGlow.forEach(m=>m.material.color.set(c));lampGl.material.color.set(c);glow.forEach(m=>m.material.color.set(c));
  winGlass.forEach(m=>m.material.color.set(nt?'#ffcf7a':'#a9cbe6'));halos.forEach(h=>{h.material.opacity=nt?.85:0})}
 fl1.forEach((b,i)=>b.scale.setScalar(.85+.3*Math.sin(t*3+i)));gzl.forEach((b,i)=>b.scale.setScalar(.85+.3*Math.sin(t*3+i*1.3)));
 if(IN===8){
  drops.forEach((d,i)=>{if(!A.fount){d.visible=false;return}d.visible=true;const u=(t*.9+i/drops.length)%1,a=i*2.4;d.position.set(Math.cos(a)*u*.95,2.1+.9*4*u*(1-u)-.85*u,Math.sin(a)*u*.95)});
  const rp=(t*.8)%1;ripple.visible=A.fount;ripple.scale.setScalar(.5+rp*1.2);ripple.material.opacity=1-rp;
  flies.forEach((b,i)=>{const a=t*.6+i*2.1;b.position.set(Math.cos(a)*(2+i*.6)+.3,1.4+Math.sin(t*1.7+i)*.3,Math.sin(a*1.3)*(1.4+i*.4)+.5);b.rotation.y=-a;b.rotation.z=Math.sin(t*20+i)*.5})}}
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);try{step(dt)}catch(e){console.warn('outdoor3d',e)}}}
})();