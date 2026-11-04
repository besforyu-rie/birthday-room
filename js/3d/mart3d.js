/* mart3d.js v1 — INTERIOR ROYAL MART (ruang 11): bisa dimasuki beneran.
   Isi: rak gondola (snack, mie & instan, roti & sereal, kebutuhan rumah), 3 kulkas (pintu kaca bisa terbuka),
        freezer es krim, kasir (pindai + bayar + struk), rak coklat di kasir, sudut seduh, keranjang belanja, pintu kaca otomatis (keluar).
   Taruh sefolder dengan komplek3d.js (v2), muat SETELAH komplek3d.js:
     <script src="js/3d/komplek3d.js?v=2"></script>
     <script src="js/3d/mart3d.js?v=1"></script>
   Cara kerja:
   - Tap minimarket "Royal Mart" di komplek -> layar memudar -> masuk interior (grup dunia di x = MX).
   - Tap rak / kulkas / freezer = buka daftar barang, tap barang = masuk keranjang. Keranjang otomatis diambil saat pertama kali memasukkan barang.
   - Tap tumpukan keranjang = ambil keranjang / lihat isi keranjang. Tap kasir = bayar (tunai / QRIS / debit) -> struk -> kantong belanja.
   - Mau keluar (pintu kaca atau tombol "komplek") tapi keranjang masih ada isi = ditahan dulu: bayar atau taruh balik.
   - Avatar pemain ikut berjalan ke benda yang di-tap (diatur di interact3d.js v14 lewat window.MART3D), ava teman online yang masuk mart tampil di sini (live3d.js v5, ruang 11).
   EDIT: MX harus tidak bentrok dengan ruang lain (lounge 40, lantai 2: 120-240, teras 280, taman 320, kafe 360, komplek 420).
         Harga & isi rak ada di CATS di bawah. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof lh==='undefined'||typeof lact==='undefined'||typeof say3==='undefined'||
   typeof openM==='undefined'||typeof V==='undefined'||typeof did==='undefined')return;
if(window.__mart3dLoaded){console.warn('mart3d.js dimuat 2x! instance kedua diabaikan. Cek index.html / cache.');return}
window.__mart3dLoaded=true;
const K=window.KOMP;
if(!K||!K.go){console.warn('mart3d.js: butuh komplek3d.js v2 (window.KOMP) — muat file ini SETELAH komplek3d.js');return}

/* ===== EDIT ===== */
const MX=480;                    /* posisi dunia interior mart */
const ZM=1.45;                   /* kamera dijauhkan segini kali (lantai 14 x 9, sama seperti kafe) */
const PW=4;                      /* F2.pw — sama dengan kafe (lantai selebar itu) */
const ENTER={x:0,z:3.4};         /* titik muncul avatar saat masuk (di dalam pintu) */
const OUTSIDE={x:-1.6,z:-2.7};   /* titik muncul avatar di komplek saat keluar (depan pintu mart, trotoar) */

console.log('mart3d.js v1.3 loaded, instance',(window.__martN=(window.__martN||0)+1));
const PX='"Press Start 2P",monospace';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const rp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const q$=s=>document.querySelector(s);

/* ---------- bahan & primitif (salinan kecil dari komplek3d.js, supaya file ini berdiri sendiri) ---------- */
const LMc={};const LM=(c,e)=>{const k=c+'|'+(e||'');return LMc[k]||(LMc[k]=new THREE.MeshLambertMaterial({color:c,emissive:e||'#000000'}))};
const mt=c=>typeof c==='string'?LM(c):c;
const BM=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
const NAVY=LM('#1f2f4f'),GOLD=LM('#d9b24c','#4a3a0c'),MARB=LM('#f4efe4'),IRON=LM('#1d222c'),STEEL=LM('#cfd6e0');
const GLASS=new THREE.MeshLambertMaterial({color:'#bfe0f2',transparent:true,opacity:.3,depthWrite:false});
const mesh=(geo,mat,x,y,z,p)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);p.add(m);return m};
const grp=(x,y,z,p,ry)=>{const g=new THREE.Group();g.position.set(x,y,z);if(ry)g.rotation.y=ry;p.add(g);return g};
const box=(w,h,d,c,x,y,z,p)=>mesh(new THREE.BoxGeometry(w,h,d),mt(c),x,y,z,p);
const cyl=(rt,rb,h,c,x,y,z,p,sg)=>mesh(new THREE.CylinderGeometry(rt,rb,h,sg||14),mt(c),x,y,z,p);
const sph=(r,c,x,y,z,p)=>mesh(new THREE.SphereGeometry(r,12,9),mt(c),x,y,z,p);
const tor=(R,t,c,x,y,z,p,rx,ry,arc)=>{const m=mesh(new THREE.TorusGeometry(R,t,6,24,arc||Math.PI*2),mt(c),x,y,z,p);m.rotation.x=rx||0;m.rotation.y=ry||0;return m};
const flat=(w,d,mat,x,y,z,p)=>{const m=mesh(new THREE.PlaneGeometry(w,d),mt(mat),x,y,z,p);m.rotation.x=-Math.PI/2;return m};
const noHit=o=>{o.raycast=()=>{};return o};

/* ---------- tekstur kanvas (ukuran pangkat dua kalau diulang) ---------- */
function cvTex(w,h,fn,px,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 if(px)t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}
 const d=()=>{g.clearRect(0,0,w,h);fn(g,w,h);t.needsUpdate=true};d();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(d);return t}
const board=(wm,hm,tw,th,fn,x,y,z,p,ry)=>{const m=mesh(new THREE.PlaneGeometry(wm,hm),new THREE.MeshBasicMaterial({map:cvTex(tw,th,fn)}),x,y,z,p);if(ry)m.rotation.y=ry;return m};
/* papan nama: teks mengecil otomatis sampai muat */
const lbl=(txt,sub,col,bg)=>(g,W,H)=>{g.fillStyle=bg||'#1c2438';g.fillRect(0,0,W,H);g.strokeStyle='#d9b24c';g.lineWidth=5;g.strokeRect(3,3,W-6,H-6);
 let s=sub?22:26;g.font=s+'px '+PX;while(g.measureText(txt).width>W-34&&s>8){s--;g.font=s+'px '+PX}
 g.fillStyle=col||'#f0cf6a';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,W/2,sub?H*.38:H/2+1);
 if(sub){g.font='11px '+PX;g.fillStyle='#8fd0f0';g.fillText(sub,W/2,H*.78)}};
const sprSign=(txt,sub,x,y,z,p,sc)=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:cvTex(256,64,lbl(txt,sub)),transparent:true}));s.scale.set(2.5*(sc||1),.62*(sc||1),1);s.position.set(x,y,z);noHit(s);p.add(s);return s};
/* strip kemasan barang (piksel) untuk isi rak: seed = variasi, pal = warna kemasan */
function packTex(seed,pal,rep){return cvTex(256,64,(g,W,H)=>{let s=seed*9301+49297;const R=()=>{s=(s*9301+49297)%233280;return s/233280};
 g.fillStyle='#56667c';g.fillRect(0,0,W,H);let x=2;
 while(x<W-14){const w=14+((R()*12)|0),hh=Math.round(H*(.55+R()*.4)),c=pal[(R()*pal.length)|0];
  g.fillStyle=c;g.fillRect(x,H-hh,w,hh);g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x+3,H-hh+Math.round(hh*.3),w-6,Math.round(hh*.26));
  g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x,H-hh,2,hh);g.fillRect(x,H-3,w,3);x+=w+2}},true,rep)}

/* ======================================================================
   DATA BARANG (harga dalam rupiah) — edit bebas
   ====================================================================== */
const CATS={
 snack:{t:'snack',pal:['#e84a5f','#f2c14e','#4f8fe8','#ff9a3d','#8fd18a'],items:[['keripik kentang',11000,'🥔'],['wafer coklat',8000,'🍫'],['biskuit kelapa',9000,'🍪'],['kacang garing',10000,'🥜'],['popcorn karamel',12000,'🍿'],['rumput laut crispy',14000,'🌿']]},
 mie:{t:'mie & makanan instan',pal:['#e8453c','#f2c14e','#ffffff','#2f7a45','#ff9a3d'],items:[['mie goreng',3500,'🍜'],['mie kuah soto',3500,'🍜'],['mie cup pedas',9000,'🍜'],['bubur instan',8000,'🥣'],['sarden kaleng',16000,'🐟'],['kornet sapi',24000,'🥫']]},
 roti:{t:'roti & sereal',pal:['#d9a35f','#f4d9a0','#8b5a2b','#f4efe4','#e8836b'],items:[['roti sobek',15000,'🍞'],['roti tawar',17000,'🍞'],['sereal coklat',32000,'🥣'],['selai kacang',28000,'🥜'],['croissant',12000,'🥐'],['donat gula',9000,'🍩']]},
 rumah:{t:'kebutuhan rumah',pal:['#4f8fe8','#8fd0f0','#ffffff','#a98bd6','#2f7a45'],items:[['tisu gulung',14000,'🧻'],['sabun cair',22000,'🧴'],['pasta gigi',15000,'🧴'],['sikat gigi',12000,'🦷'],['deterjen',19000,'🧺'],['baterai AA',18000,'🔋']]},
 minum:{t:'minuman dingin',pal:['#4f8fe8','#8fd0f0','#ffffff','#2f7a45','#f2c14e'],items:[['air mineral',5000,'💧'],['teh botol',6000,'🍵'],['kopi kaleng',12000,'☕'],['teh lemon',8000,'🍋'],['minuman isotonik',9000,'🥤'],['minuman jeruk',7000,'🍊']]},
 susu:{t:'susu & yogurt',pal:['#f4efe4','#f4a6c0','#8b5a2b','#8fd0f0','#ffffff'],items:[['susu stroberi',7000,'🍓'],['susu coklat',7000,'🥛'],['susu putih',8000,'🥛'],['yogurt drink',10000,'🥛'],['yogurt cup',9000,'🍨'],['keju slice',18000,'🧀']]},
 soda:{t:'soda & jus',pal:['#e84a5f','#ff9a3d','#2f7a45','#f2c14e','#1d222c'],items:[['soda cola',9000,'🥤'],['soda jeruk',9000,'🥤'],['jus apel',11000,'🍎'],['jus jeruk',11000,'🍊'],['jus mangga',11000,'🥭'],['air kelapa',13000,'🥥']]},
 beku:{t:'es krim & makanan beku',pal:['#f4a6c0','#8fd0f0','#f2c14e','#ffffff','#a98bd6'],items:[['es krim cone',10000,'🍦'],['es krim cup',12000,'🍨'],['es krim stik',8000,'🍡'],['nugget ayam',38000,'🍗'],['sosis sapi',32000,'🌭'],['dimsum ayam',36000,'🥟']]},
 coklat:{t:'coklat & permen',pal:['#8b5a2b','#e84a5f','#f2c14e','#5a3b22','#f4a6c0'],items:[['coklat batangan',12000,'🍫'],['coklat kacang',14000,'🍫'],['permen mint',3000,'🍬'],['permen karet',4000,'🍬'],['lolipop',2000,'🍭'],['jelly cup',6000,'🍮']]}
};
const CASHIER=['selamat datang di Royal Mart!','ada yang bisa dibantu?','mau pakai kantong plastik?','struknya ikut ya','kalau ada member, tinggal sebut nomornya','semua barang dipindai di sini'];

/* ======================================================================
   STATE BELANJA
   ====================================================================== */
const BK=window.__MART_BK||(window.__MART_BK=new Map());   /* 'kategori:indeks' -> jumlah (disimpan di window supaya tidak hilang kalau skrip termuat ulang) */
const clearBK=why=>{console.log('[mart] keranjang DIKOSONGKAN karena:',why,'(isi sebelumnya:',count(),'barang)');BK.clear()};
let hasBasket=false,hasBag=false;
const itemOf=k=>{const a=k.split(':');return CATS[a[0]].items[+a[1]]};
const total=()=>{let s=0;BK.forEach((q,k)=>{s+=itemOf(k)[1]*q});return s};
const count=()=>{let s=0;BK.forEach(q=>{s+=q});return s};

/* ---------- suara kecil (ikut tombol sfx di index.html) ---------- */
let AC2=null;
function tone(f,d,type,v,w){try{if(typeof SFX!=='undefined'&&!SFX.on)return;AC2=AC2||new (window.AudioContext||window.webkitAudioContext)();AC2.resume();
 const T=AC2.currentTime+(w||0),o=AC2.createOscillator(),g=AC2.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,T);g.gain.setValueAtTime(v||.06,T);g.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(g);g.connect(AC2.destination);o.start(T);o.stop(T+d+.02)}catch(e){}}
const chime=()=>{tone(784,.25,'sine',.07);tone(988,.35,'sine',.07,.18)};
const beep=()=>tone(1500,.07,'square',.04);
const ting=()=>{tone(1318,.5,'triangle',.08);tone(1760,.6,'triangle',.06,.12)};

/* ======================================================================
   RUANG: lantai, dinding (hanya terlihat dari dalam), etalase depan, pintu
   ====================================================================== */
const MRT=new THREE.Group();MRT.position.set(MX,0,0);S.add(MRT);MRT.visible=false;
const spots=[];                                  /* untuk interact3d.js: {o, x, z, f, say, w} = tempat avatar berdiri saat benda di-tap */
const reg=(o,x,z,f,say,w)=>{spots.push({o,x,z,f,say,w});return o};
const anim=[];                                   /* benda yang membuka-menutup (pintu kulkas, tutup freezer) */
const openFx=(u,s)=>{u.w=s||3.5};

{const tile=cvTex(64,64,g=>{g.fillStyle='#eef1f6';g.fillRect(0,0,64,64);g.fillStyle='#dfe5ee';g.fillRect(0,0,32,32);g.fillRect(32,32,32,32);g.fillStyle='#c4cdda';g.fillRect(0,0,64,1);g.fillRect(0,0,1,64);g.fillRect(32,0,1,64);g.fillRect(0,32,64,1)},true,[7,4.5]);
 mesh(new THREE.PlaneGeometry(14,9),new THREE.MeshLambertMaterial({map:tile}),0,0,0,MRT).rotation.x=-Math.PI/2;
 const wt=cvTex(256,128,(g,W,H)=>{g.fillStyle='#f7f4ee';g.fillRect(0,0,W,H);for(let i=0;i<90;i++){g.fillStyle='rgba(0,0,0,.03)';g.fillRect((i*59)%W,(i*37)%(H*.7),3,2)}
  g.fillStyle='#1f2f4f';g.fillRect(0,H*.7,W,H*.3);g.fillStyle='#d9b24c';g.fillRect(0,H*.7-3,W,3);g.fillStyle='#2a406a';for(let x=0;x<W;x+=32)g.fillRect(x,H*.7+6,2,H*.3-6)});
 const WL=new THREE.MeshLambertMaterial({map:wt});
 /* dinding satu sisi (menghadap ke dalam) -> dari luar tidak menghalangi kamera */
 mesh(new THREE.PlaneGeometry(14,5),WL,0,2.5,-4.5,MRT);
 mesh(new THREE.PlaneGeometry(9,5),WL,-7,2.5,0,MRT).rotation.y=Math.PI/2;
 mesh(new THREE.PlaneGeometry(9,5),WL,7,2.5,0,MRT).rotation.y=-Math.PI/2;
 box(14.3,.12,.2,GOLD,0,5.02,-4.5,MRT);box(.2,.12,9.2,GOLD,-7,5.02,0,MRT);box(.2,.12,9.2,GOLD,7,5.02,0,MRT);
 /* etalase depan: kaki dinding + kaca bening, pintu di tengah */
 [-4.2,4.2].forEach(cx=>{box(5.6,.45,.16,NAVY,cx,.225,4.5,MRT);box(5.6,.08,.16,GOLD,cx,.47,4.5,MRT);box(5.6,.1,.12,NAVY,cx,3.05,4.5,MRT);
  mesh(new THREE.PlaneGeometry(5.6,2.55),GLASS,cx,1.75,4.5,MRT);for(let i=0;i<=4;i++)box(.05,2.55,.05,NAVY,cx-2.8+i*1.4,1.75,4.52,MRT)});
 [-7,7].forEach(x=>box(.22,3.1,.22,NAVY,x,1.55,4.5,MRT));
 /* papan nama besar di dinding belakang */
 board(6.6,.95,512,74,lbl('ROYAL MART','buka 24 jam'),0,4.2,-4.47,MRT);
 /* karpet pintu */
 {const m=board(2.4,.8,256,64,lbl('SELAMAT DATANG',null,'#f0cf6a','#1f2f4f'),0,.025,3.85,MRT);m.rotation.x=-Math.PI/2}
 /* lampu panel gantung + balok langit-langit (tanpa plafon penuh supaya kamera tetap bisa melihat ke dalam) */
 [-1.2,1.4,3.4].forEach(z=>{box(14,.12,.22,NAVY,0,5.0,z,MRT);[-4.2,0,4.2].forEach(x=>{box(.04,.7,.04,IRON,x-.9,4.65,z,MRT);box(.04,.7,.04,IRON,x+.9,4.65,z,MRT);box(2.2,.07,.5,BM('#fffdf0'),x,4.3,z,MRT)})})}

/* poster dinding */
function poster(txt,sub,bg,fg,wm,hm,x,y,z,ry){return board(wm,hm,128,160,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.strokeStyle=fg;g.lineWidth=5;g.strokeRect(4,4,W-8,H-8);
 let s=20;g.font=s+'px '+PX;while(g.measureText(txt).width>W-22&&s>8){s--;g.font=s+'px '+PX}g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';g.fillText(txt,W/2,H*.4);
 g.font='9px '+PX;g.fillText(sub,W/2,H*.68);g.fillRect(14,H*.8,W-28,4)},x,y,z,MRT,ry)}
poster('PROMO','minggu ini','#e84a5f','#ffffff',1.0,1.25,-6.96,2.7,-.9,Math.PI/2);
poster('SEGAR','tiap hari','#2f7a45','#f4efe4',1.0,1.25,-6.96,2.7,.7,Math.PI/2);
poster('MEMBER','kartu Royal','#1f2f4f','#f0cf6a',1.0,1.25,6.96,2.7,-2.2,-Math.PI/2);
poster('HEMAT','beli 2 lebih murah','#f2c14e','#1f2f4f',1.0,1.25,6.96,2.7,-.2,-Math.PI/2);
poster('ES KRIM','dingin & manis','#8fd0f0','#1f2f4f',1.1,1.3,3.4,2.9,-4.46,0);

/* jam dinding (jarum mengikuti jam asli) */
const CLK={};{const c=grp(.2,3.55,-4.46,MRT);cyl(.36,.36,.05,MARB,0,0,0,c,24).rotation.x=Math.PI/2;tor(.36,.03,GOLD,0,0,.03,c);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;box(.03,.06,.02,NAVY,Math.sin(a)*.29,Math.cos(a)*.29,.04,c).rotation.z=-a}
 CLK.h=grp(0,0,.05,c);box(.035,.17,.02,NAVY,0,.085,0,CLK.h);CLK.m=grp(0,0,.06,c);box(.025,.26,.02,NAVY,0,.13,0,CLK.m);
 lact(c,()=>{const d=new Date();say3(c,'sekarang jam '+d.getHours()+'.'+String(d.getMinutes()).padStart(2,'0'))})}
/* pintu staf (hiasan) */
{const d=grp(.2,0,-4.45,MRT);box(1.3,2.6,.08,'#8d96a3',0,1.3,0,d);box(1.4,.1,.12,NAVY,0,2.65,0,d);cyl(.04,.04,.25,GOLD,.45,1.2,.07,d,6);board(.9,.28,128,40,lbl('STAF'),0,2.2,.06,d);
 lact(d,()=>say3(d,pick(['khusus staf, ya','gudangnya penuh stok'])))}

/* ---------- PINTU KACA OTOMATIS (tap = keluar) ---------- */
const DOOR={k:0,L:null,R:null,g:null};
{const d=grp(0,0,4.45,MRT);DOOR.g=d;
 [-1.4,1.4].forEach(x=>box(.16,3.0,.16,NAVY,x,1.5,0,d));box(3.0,.26,.18,NAVY,0,3.1,0,d);box(3.0,.05,.2,GOLD,0,2.95,0,d);
 const leaf=sx=>{const l=grp(sx*.66,0,.03,d);box(1.24,.08,.06,NAVY,0,.2,0,l);box(1.24,.08,.06,NAVY,0,2.8,0,l);box(.08,2.6,.06,NAVY,sx*-.58,1.5,0,l);box(.08,2.6,.06,NAVY,sx*.58,1.5,0,l);
  mesh(new THREE.PlaneGeometry(1.2,2.6),GLASS,0,1.5,0,l);cyl(.025,.025,.7,GOLD,sx*-.5,1.4,.06,l,6);return l};
 DOOR.L=leaf(-1);DOOR.R=leaf(1);
 board(2.6,.5,256,56,lbl('KELUAR'),0,3.5,.12,d);
 sph(.09,'#8fd18a',1.25,2.6,.12,d);               /* lampu sensor */
 lact(d,()=>exitMart())}

/* ======================================================================
   GONDOLA (rak berdiri dua sisi)  — cx,cz = pusat, len = panjang
   ====================================================================== */
function gondola(cx,cz,len,ck,seed){const C=CATS[ck],g=grp(cx,0,cz,MRT);
 box(len,.22,.9,NAVY,0,.11,0,g);box(len,1.9,.08,STEEL,0,1.17,0,g);box(len+.1,.08,.96,GOLD,0,2.15,0,g);[-1,1].forEach(s=>box(.07,2.0,.92,NAVY,s*len/2,1.0,0,g));
 const tx=[0,1,2].map(i=>packTex(seed+i*7,C.pal,[len/1.6,1]));
 [.45,.9,1.35,1.8].forEach((y,r)=>[-1,1].forEach((s,si)=>{box(len-.1,.05,.44,'#e8ecf2',0,y,s*.26,g);box(len-.1,.04,.02,'#f2c14e',0,y-.01,s*.49,g);
  const m=mesh(new THREE.BoxGeometry(len-.22,.34,.3),new THREE.MeshLambertMaterial({map:tx[(r+si)%3]}),0,y+.2,s*.27,g)}));
 sprSign(C.t,null,0,3.0,0,g);
 lact(g,()=>shelfUI(ck));return g}
const G1=gondola(-3.0,-1.2,4.2,'snack',3),G2=gondola(3.0,-1.2,4.2,'mie',11),G3=gondola(-3.2,1.0,3.6,'roti',23),G4=gondola(.9,1.0,2.8,'rumah',31);
reg(G1,-3.0,-.1,[0,-1],'cari snack apa ya~',[10,16]);reg(G2,3.0,-.1,[0,-1],'mie instan dulu~',[10,16]);
reg(G3,-3.2,2.1,[0,-1],'roti-nya wangi',[10,16]);reg(G4,.9,2.1,[0,-1],'stok tisu hampir habis',[10,16]);

/* ======================================================================
   KULKAS (3 unit, pintu kaca membuka saat di-tap)
   ====================================================================== */
function fridge(cx,ck,seed){const C=CATS[ck],f=grp(cx,0,-4.07,MRT),u={w:0,k:0};
 box(1.62,3.0,.06,'#dfe7f1',0,1.65,-.4,f);[-1,1].forEach(s=>box(.06,3.0,.86,'#e9eef5',s*.78,1.65,0,f));box(1.62,.2,.9,NAVY,0,3.2,0,f);box(1.62,.3,.9,NAVY,0,.15,0,f);box(1.5,.06,.8,'#e9eef5',0,.33,0,f);
 const tx=packTex(seed,C.pal,[.9,1]),tx2=packTex(seed+5,C.pal,[.9,1]);
 [.78,1.38,1.98,2.58].forEach((y,i)=>{box(1.5,.04,.74,'#aeb9c8',0,y,0,f);mesh(new THREE.BoxGeometry(1.42,.42,.42),new THREE.MeshLambertMaterial({map:i%2?tx:tx2}),0,y+.23,-.06,f)});
 box(1.4,.04,.05,BM('#cfeaff'),0,3.08,.3,f);
 board(1.5,.34,256,56,lbl(C.t),0,3.2,.47,f);
 const dr=sx=>{const p=grp(sx*.8,0,.43,f);mesh(new THREE.PlaneGeometry(.76,2.7),GLASS,-sx*.39,1.65,0,p);
  box(.76,.05,.05,NAVY,-sx*.39,.3,0,p);box(.76,.05,.05,NAVY,-sx*.39,3.0,0,p);box(.05,2.7,.05,NAVY,0,1.65,0,p);box(.05,2.7,.05,NAVY,-sx*.78,1.65,0,p);cyl(.025,.025,.7,GOLD,-sx*.7,1.7,.05,p,6);return p};
 const L=dr(-1),R=dr(1);u.ap=k=>{L.rotation.y=-k*1.35;R.rotation.y=k*1.35};anim.push(u);
 lact(f,()=>{openFx(u);shelfUI(ck)});return f}
const F1=fridge(-5.6,'minum',41),F2=fridge(-3.9,'susu',47),F3=fridge(-2.2,'soda',53);
reg(F1,-5.6,-2.85,[0,-1],'minuman dingin nih',[10,16]);reg(F2,-3.9,-2.85,[0,-1],'susu stroberi dulu',[10,16]);reg(F3,-2.2,-2.85,[0,-1],'soda atau jus ya',[10,16]);

/* ======================================================================
   FREEZER (peti es krim, tutup kaca bergeser)
   ====================================================================== */
const FZ=(()=>{const f=grp(3.4,0,-3.35,MRT),u={w:0,k:0};
 box(3.2,.85,1.1,'#f4f7fb',0,.425,0,f);box(3.24,.2,1.14,NAVY,0,.1,0,f);box(3.24,.06,1.14,GOLD,0,.87,0,f);
 const ct=packTex(61,CATS.beku.pal,[1.8,2.2]);flat(2.95,.92,new THREE.MeshLambertMaterial({map:ct}),0,.8,0,f);
 box(3.0,.02,.04,BM('#cfeaff'),0,.9,-.5,f);
 const lid=(x,y)=>{const l=grp(x,y,0,f);box(1.5,.04,1.0,GLASS,0,0,0,l);box(1.5,.05,.05,NAVY,0,0,.5,l);box(1.5,.05,.05,NAVY,0,0,-.5,l);box(.05,.05,1.0,NAVY,-.74,0,0,l);box(.05,.05,1.0,NAVY,.74,0,0,l);return l};
 const l1=lid(-.75,.93),l2=lid(.75,.98);u.ap=k=>{l1.position.x=-.75+1.5*k};anim.push(u);
 board(2.6,.4,256,48,lbl('ES KRIM & BEKU'),0,1.55,.6,f);
 lact(f,()=>{openFx(u);shelfUI('beku')});return f})();
reg(FZ,3.4,-2.3,[0,-1],'es krim enaknya yang mana',[10,16]);

/* ======================================================================
   KASIR + rak coklat + kasir (orang)
   ====================================================================== */
const scrC=document.createElement('canvas');scrC.width=128;scrC.height=64;const scrG=scrC.getContext('2d'),scrT=new THREE.CanvasTexture(scrC);
function scr(a,b){scrG.fillStyle='#0f2a44';scrG.fillRect(0,0,128,64);scrG.textAlign='center';scrG.textBaseline='middle';
 let s=11;scrG.font=s+'px '+PX;scrG.fillStyle='#8fd0f0';scrG.fillText(a,64,18);
 s=16;scrG.font=s+'px '+PX;while(scrG.measureText(b).width>118&&s>8){s--;scrG.font=s+'px '+PX}scrG.fillStyle='#8fd18a';scrG.fillText(b,64,42);scrT.needsUpdate=true}
const beltTex=cvTex(64,32,g=>{g.fillStyle='#2a2f3a';g.fillRect(0,0,64,32);g.fillStyle='#3a4250';for(let x=0;x<64;x+=8)g.fillRect(x,0,3,32)},true,[3,1]);
const KS=grp(4.95,0,2.55,MRT);
{box(3.2,.95,.9,NAVY,0,.475,0,KS);box(3.3,.07,1.0,MARB,0,.985,0,KS);box(3.32,.03,1.02,GOLD,0,.9,0,KS);for(let i=0;i<7;i++)box(.34,.7,.04,'#2a406a',-1.4+i*.46,.45,.47,KS);
 flat(1.2,.55,new THREE.MeshLambertMaterial({map:beltTex}),-.95,1.03,.02,KS);box(1.24,.05,.04,IRON,-.95,1.05,.3,KS);box(1.24,.05,.04,IRON,-.95,1.05,-.3,KS);
 box(.22,.04,.22,IRON,-.25,1.04,.05,KS);box(.12,.01,.1,BM('#ff3b3b'),-.25,1.07,.05,KS);
 box(.56,.2,.46,'#2a3a52',.75,1.1,-.05,KS);box(.5,.03,.3,'#8d96a3',.75,1.22,.12,KS);
 const sc=mesh(new THREE.PlaneGeometry(.46,.24),new THREE.MeshBasicMaterial({map:scrT}),.75,1.38,.02,KS);sc.rotation.x=-.3;box(.5,.3,.04,'#10151f',.75,1.38,-.01,KS).rotation.x=-.3;
 box(.12,.2,.1,IRON,.25,1.12,.2,KS).rotation.x=-.3;
 /* QRIS */
 box(.3,.42,.03,MARB,1.3,1.22,.2,KS);mesh(new THREE.PlaneGeometry(.22,.22),new THREE.MeshBasicMaterial({map:cvTex(32,32,g=>{g.fillStyle='#fff';g.fillRect(0,0,32,32);g.fillStyle='#10151f';let s=7;for(let y=0;y<8;y++)for(let x=0;x<8;x++){s=(s*17+x*5+y*11)%97;if(s%2||(x<2&&y<2)||(x>5&&y<2)||(x<2&&y>5))g.fillRect(x*4,y*4,4,4)}},true)}),1.3,1.26,.22,KS);
 /* tempat kantong */
 box(.26,.12,.2,'#e8ecf2',1.1,1.06,-.28,KS);
 lact(KS,()=>checkoutUI())}
reg(KS,4.9,3.6,[0,-1],'bayar dulu ah',[8,14]);
const CASH=(()=>{const g=grp(5.5,0,1.7,MRT),sk='#f2d0a9';box(.16,.5,.18,'#2a3a52',-.1,.25,0,g);box(.16,.5,.18,'#2a3a52',.1,.25,0,g);box(.4,.5,.24,'#1f2f4f',0,.75,0,g);box(.4,.06,.25,GOLD,0,.52,0,g);box(.12,.1,.02,'#f4efe4',-.1,.85,.13,g);
 box(.3,.3,.28,sk,0,1.15,0,g);box(.32,.12,.3,'#2a1a10',0,1.32,0,g);box(.03,.05,.02,'#222',-.07,1.17,.15,g);box(.03,.05,.02,'#222',.07,1.17,.15,g);box(.12,.015,.02,'#c9506a',0,1.07,.15,g);
 const mk=s=>{const a=grp(s*.27,.95,0,g);box(.12,.42,.14,'#1f2f4f',0,-.2,0,a);box(.12,.1,.14,sk,0,-.45,0,a);return a};
 const o={g,armR:mk(1),armL:mk(-1)};lact(g,()=>say3(g,pick(CASHIER)));return o})();
reg(CASH.g,5.5,3.6,[0,-1],null,[8,14]);
/* rak coklat & permen di ujung kasir */
{const r=grp(3.0,0,2.55,MRT);box(.7,.15,.5,NAVY,0,.075,0,r);box(.06,1.5,.46,STEEL,0,.9,0,r);
 [.35,.75,1.15].forEach((y,i)=>{box(.7,.04,.46,'#e8ecf2',0,y,0,r);mesh(new THREE.BoxGeometry(.6,.22,.34),new THREE.MeshLambertMaterial({map:packTex(71+i,CATS.coklat.pal,[.4,1])}),0,y+.13,0,r)});
 sprSign('coklat & permen',null,0,2.05,0,r,.55);lact(r,()=>shelfUI('coklat'));reg(r,3.0,3.6,[0,-1],'coklat buat nanti~',[8,14])}

/* ======================================================================
   KERANJANG BELANJA: tumpukan di dekat pintu + model keranjang & kantong yang dibawa avatar
   ====================================================================== */
function makeBasket(col){const b=new THREE.Group(),c=mt(col||'#e84a5f'),d=LM('#8a1f35');
 box(.5,.04,.32,c,0,.02,0,b);[-1,1].forEach(s=>{box(.5,.2,.03,c,0,.12,s*.16,b);box(.03,.2,.32,c,s*.25,.12,0,b)});
 box(.54,.04,.36,d,0,.22,0,b);tor(.2,.015,IRON,0,.22,0,b,0,0,Math.PI);return b}
function makeBag(){const b=new THREE.Group();box(.22,.3,.1,'#f4efe4',0,.15,0,b);box(.222,.06,.102,NAVY,0,.2,0,b);box(.08,.08,.05,'#e84a5f',-.04,.32,0,b);box(.06,.1,.05,'#f2c14e',.05,.33,0,b);
 [-.055,.055].forEach(x=>tor(.05,.01,'#f4efe4',x,.31,0,b,0,0,Math.PI));return b}
const BKST=grp(-2.9,0,3.7,MRT);
{box(.8,.4,.5,NAVY,0,.2,0,BKST);box(.84,.04,.54,GOLD,0,.41,0,BKST);for(let i=0;i<4;i++){const b=makeBasket(i%2?'#4f8fe8':'#e84a5f');b.position.set(0,.43+i*.07,0);BKST.add(b)}
 sprSign('keranjang',null,0,1.35,0,BKST,.6);
 lact(BKST,()=>{if(!hasBasket){grab();say3(BKST,'ambil keranjangnya, silakan')}else cartUI()})}
reg(BKST,-2.9,2.85,[0,1],null,[6,10]);
const bkObj=makeBasket('#e84a5f'),bagObj=makeBag();
function attachGear(){const me=V.get(did),want=hasBasket?bkObj:hasBag?bagObj:null;
 [bkObj,bagObj].forEach(o=>{if(o!==want&&o.parent)o.parent.remove(o)});
 if(want&&me&&me.g&&want.parent!==me.g){me.g.add(want);want.position.set(.42,want===bkObj?.5:.43,.06)}}
function grab(){hasBasket=true;beep();hud()}
function sayMe(o,t){const me=V.get(did);say3(me&&me.tg?me.tg:o,t)}

/* ---------- sudut seduh (hiasan interaktif) ---------- */
{const d=grp(-6.62,0,2.3,MRT);box(.7,.9,2.4,'#e9e1cf',0,.45,0,d);box(.76,.06,2.46,MARB,0,.93,0,d);
 box(.3,.5,.3,'#e8f1ff',0,1.21,-.7,d);box(.06,.06,.12,'#4f8fe8',.18,1.12,-.7,d);box(.06,.06,.12,'#e84a5f',.18,1.3,-.7,d);
 box(.5,.32,.42,'#2a3a52',0,1.12,.25,d);box(.04,.24,.3,'#10151f',.24,1.12,.25,d);
 ['#e8453c','#f2c14e','#2f7a45'].forEach((c,i)=>cyl(.1,.07,.14,c,0,1.0+i*.15,.9,d,10));
 sprSign('sudut seduh',null,0,2.1,0,d,.6);
 lact(d,()=>say3(d,pick(['air panasnya ada di sini','mie cup diseduh 3 menit ya','microwave buat roti dan nugget'])));reg(d,-5.7,2.4,[-1,0],'seduh mie dulu~',[10,16])}
/* tanaman, tong sampah, CCTV (hiasan) */
{const p=grp(-5.9,0,3.95,MRT);cyl(.26,.2,.45,'#c98b52',0,.22,0,p,12);[[0,.9,0,.4],[.2,1.1,.1,.28],[-.2,1.05,-.05,.3]].forEach(([x,y,z,r])=>sph(r,'#3f9150',x,y,z,p));lact(p,()=>say3(p,'tanaman plastik? bukan, ini asli'))}
{const b=grp(1.9,0,4.0,MRT);cyl(.2,.17,.7,'#8d96a3',0,.35,0,b,12);cyl(.21,.21,.05,IRON,0,.72,0,b,12);lact(b,()=>say3(b,'buang sampah pada tempatnya'))}
{const c=grp(6.6,4.4,-4.1,MRT);sph(.14,'#1d222c',0,0,0,c);cyl(.03,.03,.3,STEEL,0,.18,0,c,6);lact(c,()=>say3(c,'CCTV aktif 24 jam'))}

/* interaksi kasir (orang) dan sprite label tombol "keluar" dikelola di bawah */

/* ======================================================================
   UI BELANJA
   ====================================================================== */
const css=document.createElement('style');
css.textContent=`.mtg{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.mtc{position:relative;border:3px solid var(--ink);background:#fff;padding:6px 4px 8px;text-align:center;cursor:pointer;font:21px/1.05 VT323,monospace;color:var(--ink)}
.mtc .e{font-size:30px;display:block;line-height:1.15}.mtc i{font-style:normal;color:#b0293f;display:block}.mtc .q{position:absolute;top:-9px;right:-7px;background:#f2c14e;border:3px solid var(--ink);min-width:28px;padding:0 4px;font:11px 'Press Start 2P',monospace;line-height:20px}
.mtc:active{transform:translate(2px,2px)}.mts{position:sticky;bottom:-18px;background:var(--cream);padding:8px 0 4px;margin-top:12px;border-top:3px solid var(--ink)}
.mtl{display:flex;gap:8px;align-items:center;margin:6px 0;font-size:23px;line-height:1}.mtl .n{flex:1}.mtl button{font:11px 'Press Start 2P',monospace;border:3px solid var(--ink);background:#fff;width:30px;height:30px;cursor:pointer;color:var(--ink)}
.mtr{display:flex;justify-content:space-between;gap:10px;font-size:23px;line-height:1.15}.mtd{border-top:2px dashed #7a8aa0;margin:8px 0}
#mth{position:fixed;top:8px;right:8px;z-index:15;font:20px/1.1 VT323,monospace;background:rgba(243,248,255,.94);border:3px solid var(--ink);padding:3px 9px;display:none;pointer-events:none;text-align:right}`;
document.head.appendChild(css);
const hudEl=document.createElement('div');hudEl.id='mth';document.body.appendChild(hudEl);
function hud(){const inM=K.cur()===3;let t='';
 if(inM&&count())t='keranjang: '+count()+' barang<br><b>'+rp(total())+'</b>';else if(inM&&hasBag)t='kantong belanja ✓';
 hudEl.innerHTML=t;hudEl.style.display=t?'block':'none'}

window.MART_DEBUG=()=>({barang:count(),total:total(),hasBasket,hasBag,isi:[...BK],lokasi:K.cur()});
function add(k,d){const q=(BK.get(k)||0)+(d||1);if(q<=0)BK.delete(k);else BK.set(k,Math.min(q,20));hud()
 console.log('[mart] add',k,'->',count(),'barang')}
function shelfUI(ck){const C=CATS[ck];
 openM(`<h2>${C.t}</h2><p class="from" style="margin:0">tap barang untuk masuk keranjang</p><div class="mtg" id="mtg"></div><div class="mts" id="mts"></div>`);
 const draw=()=>{const g=q$('#mtg'),s=q$('#mts');if(!g||!s)return;
  g.innerHTML=C.items.map((it,i)=>{const q=BK.get(ck+':'+i)||0;return `<button class="mtc" data-k="${ck}:${i}"><span class="e">${it[2]}</span>${it[0]}<i>${rp(it[1])}</i>${q?`<span class="q">x${q}</span>`:''}</button>`}).join('');
  s.innerHTML=`<div class="mtr"><span>keranjang: ${count()} barang</span><b>${rp(total())}</b></div><div class="row"><button class="btn" id="mtv">lihat keranjang</button><button class="btn alt" id="mtx">tutup</button></div><p class="from" style="margin:8px 0 0;font-size:19px">${hasBasket?'bayar di kasir ya (tap kasirnya)':'keranjang diambil otomatis saat kamu memilih barang'}</p>`;
  q$('#mtv').onclick=cartUI;q$('#mtx').onclick=closeM};
 q$('#mtg').onclick=e=>{const b=e.target&&e.target.closest&&e.target.closest('[data-k]');if(!b)return;
  if(!hasBasket){hasBasket=true;try{grab();sayMe(BKST,'ambil keranjang dulu~')}catch(err){console.warn('mart3d grab',err)}}
  try{add(b.dataset.k,1)}catch(err){console.warn('mart3d add',err)}
  try{beep()}catch(err){}
  draw()};
 draw()}

function cartUI(){
 console.log('[mart] buka keranjang:',BK.size,'jenis,',count(),'barang, instance',window.__martN);
 if(!BK.size){openM(`<h2>keranjang</h2><p>keranjangmu masih kosong. tap rak atau kulkas untuk memilih barang.</p><div class="row"><button class="btn alt" id="mtk">tutup</button></div>`);q$('#mtk').onclick=closeM;return}
 const rows=[...BK].map(([k,q])=>{const it=itemOf(k);return `<div class="mtl" data-k="${k}"><span class="n">${it[2]} ${it[0]}<br><small style="font-size:19px;opacity:.7">${rp(it[1])} x ${q}</small></span><b>${rp(it[1]*q)}</b><button data-d="-1" aria-label="kurangi">-</button><button data-d="1" aria-label="tambah">+</button></div>`}).join('');
 openM(`<h2>keranjang</h2><div id="mtc">${rows}</div><div class="mtd"></div><div class="mtr"><span>total</span><b>${rp(total())}</b></div><p class="from">bayar di kasir (tap kasirnya)</p><div class="row"><button class="btn alt" id="mtz">gak jadi beli</button><button class="btn" id="mtk">tutup</button></div>`);
 q$('#mtc').onclick=e=>{const b=e.target.closest('[data-d]');if(!b)return;add(b.parentNode.dataset.k,+b.dataset.d);beep();cartUI()};
 q$('#mtz').onclick=()=>{clearBK('tombol gak jadi beli');hud();closeM()};q$('#mtk').onclick=closeM}

/* ---------- kasir: ringkasan -> pilih cara bayar -> struk ---------- */
let beltT=0;
function checkoutUI(){
 if(!count()){say3(CASH.g,pick(['keranjangnya masih kosong ya','silakan pilih-pilih dulu']));return}
 const t=total();scr('TOTAL',rp(t));
 const rows=[...BK].map(([k,q])=>{const it=itemOf(k);return `<div class="mtr"><span>${it[0]} x${q}</span><span>${rp(it[1]*q)}</span></div>`}).join('');
 openM(`<h2>kasir</h2><div class="paper" style="min-height:0;font-size:22px">${rows}<div class="mtd"></div><div class="mtr"><b>TOTAL</b><b>${rp(t)}</b></div></div><p class="from" style="margin:12px 0 4px">bayar pakai apa?</p><div class="row"><button class="btn" id="py1">tunai</button><button class="btn" id="py2">QRIS</button><button class="btn alt" id="py3">kartu debit</button></div><div class="row"><button class="btn alt" id="pyx" style="font-size:9px">kembali belanja</button></div>`);
 q$('#py1').onclick=()=>pay('tunai');q$('#py2').onclick=()=>pay('QRIS');q$('#py3').onclick=()=>pay('kartu debit');q$('#pyx').onclick=closeM}
function pay(m){
 const t=total(),lines=[...BK].map(([k,q])=>{const it=itemOf(k);return {n:it[0],q,s:it[1]*q}}),d=new Date();
 let extra='';
 if(m==='tunai'){const notes=[5000,10000,20000,50000,100000,200000],given=notes.find(n=>n>=t)||Math.ceil(t/50000)*50000;extra=`<div class="mtr"><span>tunai</span><span>${rp(given)}</span></div><div class="mtr"><span>kembali</span><span>${rp(given-t)}</span></div>`}
 else extra=`<div class="mtr"><span>${m}</span><span>${rp(t)}</span></div>`;
 const no=String(Math.floor(Math.random()*900000)+100000);
 openM(`<h2>struk</h2><div class="paper" style="min-height:0;font-size:21px;line-height:1.1"><div style="text-align:center"><b>ROYAL MART</b><br>Royal Residence · buka 24 jam<br>${d.toLocaleDateString('id-ID')} ${d.toTimeString().slice(0,5)} · No. ${no}</div><div class="mtd"></div>${lines.map(l=>`<div class="mtr"><span>${l.n} x${l.q}</span><span>${rp(l.s)}</span></div>`).join('')}<div class="mtd"></div><div class="mtr"><b>TOTAL</b><b>${rp(t)}</b></div>${extra}<div class="mtd"></div><div style="text-align:center">terima kasih sudah belanja!</div></div><div class="row"><button class="btn" id="pyd">selesai</button></div>`);
 q$('#pyd').onclick=closeM;
 clearBK('bayar di kasir');hasBasket=false;hasBag=true;beltT=2.2;ting();scr('TERIMA KASIH','LUNAS');hud();
 setTimeout(()=>{say3(CASH.g,pick(['makasih, datang lagi ya!','kantongnya sudah ya','hati-hati di jalan']));setTimeout(()=>scr('ROYAL MART','SILAKAN'),4000)},500);
 try{window.dispatchEvent(new CustomEvent('mart3d',{detail:{k:'pay',total:t,method:m}}))}catch(e){}}
scr('ROYAL MART','SILAKAN');

/* ======================================================================
   MASUK / KELUAR
   ====================================================================== */
function putMe(room,x,z,fa){const v=V.get(did);if(!v)return;
 if(window.R3&&!(R3.BND&&R3.BND[room]))return;   /* ruangnya belum didaftarkan interact3d.js -> biarkan live3d.js yang memindahkan */
 try{place(v,room)}catch(e){console.warn('mart3d place',e)}
 v.x=x;v.z=z;v.dx=0;v.dz=fa===0?1:-1;v.mode=null;v.goal=null;v.path=null;v.xfer=null;v.seat=null;v.f=2;
 if(window.R3){try{R3.ensure(v);const R=v.R;R.wp=[];R.act=null;R.poi=-1;R.dance=false;R.wait=.4;R.fa=fa}catch(e){}}
 if(v.L)v.L(0);if(v.Ar)v.Ar(0,0);try{paintV(v)}catch(e){}}
function goMart(){K.go(MRT,MX,ZM,PW,3,()=>{K.setBack('komplek',()=>exitMart());putMe(11,ENTER.x,ENTER.z,Math.PI);chime();hud()})}
window.goMart=goMart;
function leave(){K.goKomplek(()=>{hasBasket=false;hasBag=false;clearBK('keluar dari mart');attachGear();putMe(10,OUTSIDE.x,OUTSIDE.z,0);chime();hud()})}
function exitMart(){
 if(K.cur()!==3)return;
 if(count()){openM(`<h2>belum dibayar</h2><p>keranjangmu masih berisi ${count()} barang (${rp(total())}). bayar dulu di kasir, atau taruh balik barangnya.</p><div class="row"><button class="btn" id="exk">ke kasir</button><button class="btn alt" id="exb">taruh balik & keluar</button></div>`);
  q$('#exk').onclick=closeM;q$('#exb').onclick=()=>{clearBK('taruh balik & keluar');closeM();leave()};
  if(CASH&&CASH.g)say3(CASH.g,'permisi, belum dibayar nih');return}
 leave()}

/* ======================================================================
   ANIMASI + pencahayaan interior
   ====================================================================== */
let wasIn=false;
function lightOn(on){if(typeof amb==='undefined'||typeof sun==='undefined')return;
 if(on){amb.intensity=.95;sun.intensity=.35}else{const n=typeof night!=='undefined'&&night;amb.intensity=n?.28:.75;sun.intensity=n?.15:.6}}
function step(dt){
 const inM=K.cur()===3;
 if(inM!==wasIn){wasIn=inM;lightOn(inM);hud()}
 attachGear();
 if(!inM)return;
 const t=performance.now()/1000,me=V.get(did);
 /* pintu geser: membuka kalau avatarmu dekat */
 const near=me&&me.room===11&&Math.hypot(me.x,me.z-4.0)<2.4;
 DOOR.k+=((near?1:0)-DOOR.k)*Math.min(1,dt*5);DOOR.L.position.x=-.66-DOOR.k*.8;DOOR.R.position.x=.66+DOOR.k*.8;
 anim.forEach(u=>{u.w=Math.max(0,u.w-dt);u.k+=((u.w>0?1:0)-u.k)*Math.min(1,dt*6);u.ap(u.k)});
 if(beltT>0){beltT-=dt;beltTex.offset.x=(beltTex.offset.x+dt*1.2)%1;CASH.armR.rotation.x=-.8+Math.sin(t*9)*.3}else CASH.armR.rotation.x=-.2+Math.sin(t*1.4)*.08;
 CASH.armL.rotation.x=-.15+Math.sin(t*1.1)*.06;CASH.g.position.y=Math.abs(Math.sin(t*1.2))*.015;
 const d=new Date();CLK.m.rotation.z=-(d.getMinutes()+d.getSeconds()/60)/60*Math.PI*2;CLK.h.rotation.z=-((d.getHours()%12)+d.getMinutes()/60)/12*Math.PI*2}
if(typeof winFx==='function'){const _w=winFx;winFx=function(dt){_w(dt);try{step(dt)}catch(e){console.warn('mart3d',e)}}}
setInterval(()=>{try{hud()}catch(e){}},700);

/* ======================================================================
   DATA UNTUK interact3d.js (jalan avatar) — koordinat lokal ruang, [xMin,xMax,zMin,zMax]
   ====================================================================== */
window.MART3D={X:MX,group:MRT,room:11,entry:ENTER,spots,
 obs:[[-6.6,-1.2,-4.5,-3.3],[1.6,5.2,-4.1,-2.6],[-5.35,-.65,-1.9,-.5],[.65,5.35,-1.9,-.5],[-5.25,-1.15,.3,1.7],[-.75,2.55,.3,1.7],[-3.3,-2.5,3.3,4.1],[2.6,6.75,1.3,3.2],[-7,-6.1,1.0,3.6],[-6.5,-5.5,3.4,4.3]],
 bnd:{x0:-6.3,x1:6.3,z0:-3.8,z1:3.9},
 pois:[{x:-3,z:-.1,f:[0,-1],w:[6,10],max:2},{x:3,z:-.1,f:[0,-1],w:[6,10],max:2},{x:-3.9,z:-2.85,f:[0,-1],w:[6,10],max:2},{x:3.4,z:-2.3,f:[0,-1],w:[6,10],max:1},{x:-3.2,z:2.1,f:[0,-1],w:[5,9],max:1},{x:4.9,z:3.6,f:[0,-1],w:[5,9],max:1},{x:.9,z:2.1,f:[0,-1],w:[5,9],max:1}],
 rbd:{x0:-.5,x1:.5,z0:2.8,z1:3.8}};
try{window.dispatchEvent(new Event('mart3d-ready'))}catch(e){}
})();