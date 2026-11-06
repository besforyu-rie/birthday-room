/* interact3d.js — avatar PEMAIN ikut berinteraksi dengan benda yang di-tap.
   Taruh sefolder dengan index.html, muat PALING AKHIR (setelah floor2.js):
   <script src="interact3d.js?v=11"></script>
   Syarat: room3d.js versi terbaru (mengekspor window.R3) dan pemain sudah punya avatar ("+ bikin ava").

   Cara kerja: tap benda -> avatarmu jalan ke sana (lewat jalur yang menghindari perabot) lalu berdiri / duduk.
   Kalau avatarmu sedang di ruangan lain, dia langsung muncul di pintu ruangan itu lalu jalan ke benda.
   Tap benda yang sama lagi saat duduk = berdiri. Duduk otomatis berdiri sendiri setelah SIT_MAX detik.
   Tanpa avatar, semua benda berperilaku seperti biasa.

   Ruangan: 0 utama, 1 lounge, 2 galeri kenangan, 3 kamar tidur (lantai 2), 4 ruang makan (lantai 2), 5 balkon (lantai 2), 6 basement, 7 teras, 8 taman.
   Basement/teras/taman butuh basement3d.js & outdoor3d.js dimuat sebelum file ini.
   v15: 12 perpustakaan rahasia (dari perpus3d.js; window.PERPUS3D). Hanya ava PEMAIN yang muncul di sana: otomatis saat masuk lewat rak, balik ke ruang utama saat keluar. Tidak ada pintu / ava lain ke ruang 12.
   v14: 11 Royal Mart (interior minimarket dari mart3d.js; dipasang otomatis lewat window.MART3D, urutan muat bebas). Rintangan, titik berdiri & pintunya ikut dikirim mart3d.js.
   v12: 9 kafe pribadi & 10 komplek (dari komplek3d.js; dipasang otomatis begitu komplek3d.js termuat, urutan muat bebas). Atur jalan/rintangan/tempat duduk di ROOMS[9] & ROOMS[10].
   Mau ubah titik berdiri / ucapan? Cari bagian "EDIT" di bawah.
   v11: kamar tidur (3) + ruang santai & ruang makan (4) + kamar mandi diperluas ke kanan (sesuai EXT=7 di floor2.js v15): rintangan, tempat duduk (sofa, beanbag, kursi baca, bangku catur) dan semua benda baru ikut interaktif. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof V==='undefined'||typeof place==='undefined'||typeof unplace==='undefined'||
   typeof lh==='undefined'||typeof say3==='undefined'||typeof did==='undefined'||typeof paintV==='undefined'||!window.R3)return;
const R3=window.R3,SIT_MAX=90;
const pick=a=>a[Math.floor(Math.random()*a.length)];
const g0=fn=>{try{return fn()}catch(e){return null}};

/* ===== EDIT: ruangan lantai 2 untuk jalan avatar (rintangan = [xMin,xMax,zMin,zMax], koordinat lokal ruangan) ===== */
/*ROOMS*/
const ROOMS={
 3:{obs:[[1.35,4.05,-3.5,-.05],[.4,1.4,-3.5,-2.7],[-4.6,-2,-3.6,-2.3],[-5,-3.6,-.7,1.3],[4.1,5,-.7,.1],[3.1,4.7,1.2,3.2],
        /* ruang santai & perabot baru (koordinat lokal, perluasan kanan sampai x=12) */
        [4.05,4.95,-3.5,-2.7],[-5,-4.2,-2.3,-.7],[5.3,6.5,-3.6,-2.8],[6.7,8.5,-3.6,-2.7],[8.75,11.65,-3.6,-2.4],[11.5,12,-3.4,-2.6],[9.4,11,-1.15,-.25],
        [6.4,7.6,-1.95,-.75],[7.6,8.8,-1.75,-.55],[5.65,6.75,.2,1.4],[5.8,6.6,1.5,2.3],[10.6,12,1.9,3.4],[7.1,10.1,1.6,2.8]],
    bnd:{x0:-4.6,x1:11.6,z0:-3,z1:3.2},
    pois:[{x:2.7,z:.5,f:[0,-1],w:[5,9],max:2},{x:.9,z:-2.4,f:[0,-1],w:[4,8],max:1},{x:-3.3,z:-2,f:[0,-1],w:[4,8],max:1},{x:-3.4,z:.3,f:[-1,0],w:[5,9],max:1},
      {x:9.6,z:.6,f:[0,-1],w:[5,9],max:2},{x:7.6,z:.2,f:[0,-1],w:[6,10],max:2},{x:5.9,z:-2.3,f:[0,-1],w:[5,9],max:1},{x:11.0,z:1.0,f:[0,1],w:[4,8],max:1}]},
 4:{obs:[[-1,2.6,0,1.8],[-.4,3.4,-3.6,-2.6],[-4.6,-3,-3.6,-2.3],
        /* buffet, sekat & isi kamar mandi */
        [-5,-4.2,-.85,.65],[5.05,5.35,-3.6,-.9],[5.05,5.35,1.1,3.5],[5.7,8.3,-3.6,-2.0],[9.0,9.9,-3.6,-2.4],[10.2,11.8,-3.6,-2.55],[5.5,6.2,2.2,2.8],[5.4,5.7,-2.1,-1.3],[10.9,11.8,2.1,2.9]],
    bnd:{x0:-4.5,x1:11.6,z0:-2.9,z1:3.2},
    pois:[{x:.2,z:-2.2,f:[0,-1],w:[4,8],max:1},{x:2.6,z:-2.2,f:[0,-1],w:[4,8],max:1},{x:-2.7,z:-2.2,f:[-1,0],w:[4,8],max:1},{x:.8,z:-1.0,f:[0,1],w:[4,8],max:2},
      {x:3.8,z:-2.3,f:[0,-1],w:[4,8],max:1},{x:-3.6,z:-.1,f:[-1,0],w:[4,8],max:1},{x:7.0,z:-1.5,f:[0,-1],w:[5,9],max:1},{x:10.5,z:-1.8,f:[0,-1],w:[5,9],max:1}]}
};
/* titik muncul saat avatar pindah ruangan: pintu / tangga masing-masing ruangan */
const ENTRY={0:{x:-5.8,z:6.8},1:{x:-4,z:1.2},2:{x:-4,z:1.3},3:{x:2.9,z:1.7},4:{x:-4,z:1.5}};
/* balkon (ruang 5 = lantai 2, ruang ke-3). obs = rintangan [xMin,xMax,zMin,zMax] */
ROOMS[5]={obs:[[.2,1.8,-.25,1.6],[-3.8,-2.6,-.7,1.4],[-2.7,-1.9,-.5,.3],[-4.5,-3.8,1.6,2.3],[3.4,4.0,1.6,2.2],[3.6,4.8,-2.9,-1.2],[-4.7,-3.7,-3.6,-2.3],[4.0,5,2.5,3.4],[-4.7,-3.9,2.7,3.4]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:-1.5,z:2.7,f:[0,1],w:[5,9],max:1},{x:2.6,z:2.7,f:[0,1],w:[5,9],max:1},{x:3.1,z:1.9,f:[1,0],w:[5,9],max:1},{x:0,z:-1.6,f:[0,-1],w:[4,8],max:1}]};
ENTRY[5]={x:-2.2,z:-2.2};
/* basement (ruang 6) — dipasang kalau basement3d.js dimuat */
ROOMS[6]={obs:[[-2.2,1.2,-1.5,.1],[1.6,4.8,-3.5,-2.2],[-4.7,-2.5,-3.5,-2.75],[-2.1,-1.1,-3.5,-2.55],[-5,-3.8,-2.05,-.05],[-5,-3.8,1.65,2.75],[2.2,4,1.55,2.25],[3.7,4.9,-1.25,.25]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:-.5,z:.9,f:[0,-1],w:[5,9],max:2},{x:-3.4,z:-1,f:[-1,0],w:[5,9],max:1},{x:-3.2,z:2.2,f:[-1,0],w:[4,8],max:1},{x:3.1,z:1.05,f:[0,1],w:[4,8],max:1}]};
ENTRY[6]={x:1.9,z:-1};
/* teras (ruang 7) & taman (ruang 8) — dipasang kalau outdoor3d.js dimuat */
ROOMS[7]={obs:[[-3.5,-.9,-3.5,-2.5],[.4,2.4,-.8,1.2],[3.8,4.8,-3.4,-2.3],[-4.7,-3.4,-3.4,-2.8],[-4.6,-3.9,2.6,3.3]],
    bnd:{x0:-4.6,x1:4.6,z0:-3,z1:3.2},
    pois:[{x:-2.2,z:-1.9,f:[0,-1],w:[5,9],max:2},{x:1.4,z:1.7,f:[0,-1],w:[5,9],max:2},{x:4.3,z:-1.8,f:[0,-1],w:[4,8],max:1}]};
ROOMS[8]={obs:[[-1.1,1.7,-.9,1.9],[1.9,4.3,-3.2,-.8],[-4.1,-2.7,-3.3,-1.8],[-3.5,-1.1,2.3,3.1],[3.5,4.5,1.8,2.8],
      [.9,2.9,2.55,3.25],[5.0,10.6,2.3,3.2],[5.4,6.8,-2.7,-1.3],[10.0,10.6,-1.4,-.8],
      [7.3,7.6,-2.0,-1.7],[9.2,9.5,-2.0,-1.7],[7.3,7.6,.7,1.0],[9.2,9.5,.7,1.0],[-1.5,-.3,-3.0,-2.1]],   /* terakhir = patung Miko */   /* 4 terakhir = tiang ayunan (SWX 8.4, SWZ -.5) */
    bnd:{x0:-4.6,x1:10.6,z0:-3,z1:3.2},
    pois:[{x:.3,z:2.3,f:[0,-1],w:[6,12],max:2},{x:3.1,z:-.2,f:[0,-1],w:[6,12],max:2},{x:-3.4,z:-1.2,f:[0,-1],w:[4,8],max:1},{x:-2.3,z:1.9,f:[0,1],w:[4,8],max:1},
      {x:6.6,z:.1,f:[1,0],w:[5,9],max:1},{x:9.8,z:1.0,f:[-1,0],w:[4,8],max:1}]};
ENTRY[7]={x:0,z:-2.2};ENTRY[8]={x:-3.9,z:.5};
/* kafe pribadi (ruang 9, dari komplek3d.js; koordinat lokal kafe) — lantai x -7..7, z -4.5..4.5.
   obs: bar+rak belakang, 4 bangku bar, 4 meja bundar + kursinya, meja kopi, sofa, 4 guci, lampu lantai */
ROOMS[9]={obs:[[.3,6.8,-4.5,-2.35],
        [1.25,1.75,-2.1,-1.6],[2.45,2.95,-2.1,-1.6],[3.65,4.15,-2.1,-1.6],[4.85,5.35,-2.1,-1.6],
        [-5.62,-4.18,-1.62,-.18],[-6.22,-5.58,-1.22,-.58],[-4.22,-3.58,-1.22,-.58],
        [-2.72,-1.28,-.12,1.32],[-3.32,-2.68,.28,.92],[-1.32,-.68,.28,.92],
        [-5.42,-3.98,1.98,3.42],[-6.02,-5.38,2.38,3.02],[-4.02,-3.38,2.38,3.02],
        [.88,2.32,1.18,2.62],[.28,.92,1.58,2.22],[2.28,2.92,1.58,2.22],
        [3.2,4.4,1.6,2.4],[4.95,5.9,.45,3.55],
        [-6.5,-5.9,-3.8,-3.2],[6.0,6.6,-3.7,-3.1],[-6.4,-5.8,3.1,3.7],[5.6,6.2,3.2,3.8],[6.0,6.4,2.9,3.3]],
    bnd:{x0:-6.3,x1:6.3,z0:-3.8,z1:3.9},
    pois:[{x:2.1,z:-1.2,f:[0,-1],w:[8,14],max:2},{x:4.6,z:-1.2,f:[0,-1],w:[8,14],max:2},{x:-1.0,z:-2.4,f:[0,-1],w:[5,9],max:1},{x:-.4,z:2.8,f:[0,1],w:[5,9],max:1},{x:3.8,z:.3,f:[1,0],w:[5,9],max:1}]};
ENTRY[9]={x:-5.9,z:1.8};      /* gerbang kiri kafe */
/* komplek (ruang 10, dari komplek3d.js; koordinat lokal komplek) — jalan area x -14.3..14.3, z -3..9.9 (rumah/mart/mansion di belakang z -3 tidak bisa dimasuki).
   obs: lampu jalan, kucing, 2 mobil parkir, pos satpam + satpam, monumen, air mancur + 2 bangku, lampu taman, 4 bedeng bunga, 4 pohon */
ROOMS[10]={obs:[[-11.25,-10.75,-2.75,-2.25],[-4.65,-4.15,-2.75,-2.25],[2.95,3.45,-2.75,-2.25],[12.35,12.85,-2.75,-2.25],
        [-6.7,-6.1,-2.65,-2.15],[-8.5,-5.9,-1.6,-.3],[3.9,6.5,-1.6,-.3],
        [-6.25,-5.75,3.65,4.15],[2.15,2.65,3.65,4.15],[8.55,9.05,3.65,4.15],
        [-13.2,-10.85,4.2,6.6],[-10.75,-10.25,6.0,6.6],[-9.9,-3.7,4.95,6.5],
        [-1.85,1.85,5.05,8.75],[-3.7,-3.1,6.05,7.75],[3.1,3.7,6.05,7.75],[-3.85,-3.35,4.05,4.55],[3.35,3.85,4.05,4.55],[-3.85,-3.35,9.05,9.55],[3.35,3.85,9.05,9.55],
        [-10.5,-7.9,6.0,6.8],[8.2,10.8,6.0,6.8],[-4.1,-1.5,8.95,9.65],[1.5,4.1,8.95,9.65],
        [-12.35,-11.65,7.05,7.75],[11.65,12.35,7.15,7.85],[-5.55,-4.85,7.45,8.15],[5.05,5.75,7.25,7.95]],
    bnd:{x0:-14.3,x1:14.3,z0:-3.0,z1:9.9},
    pois:[{x:-1.6,z:-2.6,f:[0,-1],w:[8,14],max:2},{x:0,z:4.5,f:[0,1],w:[8,14],max:2},{x:-6.8,z:4.5,f:[0,1],w:[6,10],max:1},{x:9.2,z:-2.5,f:[0,-1],w:[6,10],max:1},{x:-9.6,z:-2.5,f:[0,-1],w:[6,10],max:1}]};
ENTRY[10]={x:9.2,z:-2.6};     /* depan gerbang + tangga putih "rumah Aqsa" */
/*ENDROOMS*/

/* ===== kafe (9) & komplek (10): posisi grup dunia (HARUS sama dengan KX & MX di komplek3d.js) + tempat duduk ===== */
const KAF_X=360,KOM_X=420;
const CAFT=[[-4.9,-.9,.95],[-2.0,.6,.95],[-4.7,2.7,-.95],[1.6,1.9,.95]];   /* meja bundar [x, z, jarak berdiri di z: + ke depan / - ke belakang] */
const CAFC=CAFT.map(([tx,tz,d])=>[{x:tx-1,z:tz,st:{x:tx-1,z:tz+d},f:[1,0]},{x:tx+1,z:tz,st:{x:tx+1,z:tz+d},f:[-1,0]}]);   /* 2 kursi tiap meja */
const CAFS=[{x:5.4,z:1.25,st:{x:4.5,z:1.2},f:[-1,0]},{x:5.4,z:2.75,st:{x:4.5,z:2.85},f:[-1,0]}];                            /* sofa kafe */
const CAFB=[1.5,2.7,3.9,5.1].map(x=>({x,z:-1.85,st:{x,z:-1.15},f:[0,-1]}));                                                  /* bangku bar */
const KOMB=[{x:-3.4,z:6.5,st:{x:-2.5,z:6.5},f:[1,0]},{x:-3.4,z:7.3,st:{x:-2.5,z:7.3},f:[1,0]},{x:3.4,z:6.5,st:{x:2.5,z:6.5},f:[-1,0]},{x:3.4,z:7.3,st:{x:2.5,z:7.3},f:[-1,0]}];   /* 2 bangku taman */
const SEATS9=[].concat(...CAFC,CAFS,CAFB).map(p=>({r:9,x:p.x,z:p.z,a:Math.atan2(p.f[0],p.f[1])})).concat(KOMB.map(p=>({r:10,x:p.x,z:p.z,a:Math.atan2(p.f[0],p.f[1])})));

/* ===== daftarkan kamar tidur (3) & ruang makan (4) ke sistem jalan-jalan ===== */
const grpAt=x=>S.children.find(o=>o.isGroup&&o.position.x===x&&o.position.y===0&&o.position.z===0);
const BEDG=grpAt(120),DING=grpAt(160),BALG=grpAt(200),BASG=grpAt(240),TERG=grpAt(280),TAMG=grpAt(320),HAS2=!!(BEDG&&DING),RG={};
if(HAS2){
 [3,4].forEach(r=>R3.addRoom(r,ROOMS[r].obs,ROOMS[r].bnd,ROOMS[r].pois));
 DRS[3]=[{x:3.9,z:1.0,to:0,sx:7.7,sz:3.5},{x:-1,z:-2.5,to:4,sx:-4,sz:1.5}];
 DRS[4]=[{x:-4.2,z:1.5,to:3,sx:-1,sz:-2.4}];
 RBD[3]=RBD[4]={x0:-4,x1:10,z0:-2,z1:2};
 if(BALG){
  R3.addRoom(5,ROOMS[5].obs,ROOMS[5].bnd,ROOMS[5].pois);
  DRS[3].push({x:-4.2,z:2.6,to:5,sx:-2.2,sz:-2.3});          /* pintu balkon di kamar tidur */
  DRS[5]=[{x:-2.2,z:-2.5,to:3,sx:-3.8,sz:2.6}];               /* pintu balkon -> kamar tidur */
  RBD[5]={x0:-4,x1:4,z0:-2,z1:2}}
 RG[3]=BEDG;RG[4]=DING;if(BALG)RG[5]=BALG;
}
/* ===== basement (ruang 6) ===== */
if(BASG){
 R3.addRoom(6,ROOMS[6].obs,ROOMS[6].bnd,ROOMS[6].pois);
 DRS[6]=[{x:1.9,z:-1.5,to:0,sx:7.7,sz:-1.6}];
 RBD[6]={x0:-3,x1:4,z0:.8,z1:2.8};
 RG[6]=BASG}
if(TERG&&TAMG){
 [7,8].forEach(r=>R3.addRoom(r,ROOMS[r].obs,ROOMS[r].bnd,ROOMS[r].pois));
 DRS[7]=[{x:3,z:-2.5,to:0,sx:8.1,sz:-3.4},{x:-4.2,z:.5,to:8,sx:-3.9,sz:.6}];
 DRS[8]=[{x:-4.2,z:.5,to:7,sx:-3.9,sz:.6}];
 RBD[7]=RBD[8]={x0:-3,x1:4,z0:1,z1:2.8};
 RG[7]=TERG;RG[8]=TAMG}
/* ===== kafe (9) & komplek (10): dipasang begitu komplek3d.js sudah membuat grupnya (dicek ulang tiap scan) ===== */
let HASK=false;
function regKomp(){
 if(HASK)return;
 const KG=grpAt(KAF_X),MG=grpAt(KOM_X);if(!KG||!MG)return;
 [9,10].forEach(r=>R3.addRoom(r,ROOMS[r].obs,ROOMS[r].bnd,ROOMS[r].pois));
 HASK=true;RG[9]=KG;RG[10]=MG;
 g0(()=>{DRS[9]=[];DRS[10]=[]});
 g0(()=>{RBD[9]={x0:-.5,x1:.2,z0:-.5,z1:3.2};RBD[10]={x0:-10,x1:12,z0:4.3,z1:4.9}})}
try{regKomp()}catch(e){console.warn('interact3d kafe/komplek',e)}
/* ===== Royal Mart (ruang 11, dari mart3d.js): dipasang begitu window.MART3D ada (dicek ulang tiap scan + saat event 'mart3d-ready') ===== */
let HASM=false;
function regMart(){
 if(HASM)return;const M=window.MART3D;if(!M||!M.group)return;
 R3.addRoom(11,M.obs,M.bnd,M.pois);
 HASM=true;RG[11]=M.group;ENTRY[11]=M.entry;
 g0(()=>{DRS[11]=[]});g0(()=>{RBD[11]=M.rbd})}
try{regMart()}catch(e){console.warn('interact3d mart',e)}
addEventListener('mart3d-ready',()=>{try{regMart();scanMart()}catch(e){console.warn('interact3d mart',e)}});
/* ===== Perpustakaan rahasia (ruang 12, dari perpus3d.js): dipasang begitu window.PERPUS3D ada (urutan muat bebas) ===== */
let HASP=false;
function regPerpus(){
 if(HASP)return;const L=window.PERPUS3D;if(!L||!L.group)return;
 R3.addRoom(12,L.obs,L.bnd,L.pois);
 HASP=true;RG[12]=L.group;ENTRY[12]=L.entry;
 g0(()=>{DRS[12]=[]});g0(()=>{RBD[12]=L.rbd})}
try{regPerpus()}catch(e){console.warn('interact3d perpus',e)}
addEventListener('perpus3d-ready',()=>{try{regPerpus();scanPerpus()}catch(e){console.warn('interact3d perpus',e)}});
/* masuk / keluar perpustakaan: ava pemain ikut pindah (ava lain TIDAK) */
addEventListener('perpus3d-enter',()=>{try{regPerpus();const v=own();if(v&&HASP&&v.room!==12){clearV(v);warp(v,12)}}catch(e){console.warn('interact3d perpus',e)}});
addEventListener('perpus3d-exit',()=>{try{const v=own();if(v&&v.room===12){clearV(v);warp(v,0)}}catch(e){console.warn('interact3d perpus',e)}});
{
 const _place=place;
 place=function(v,r){
  if(r>=9){try{regKomp();regMart();regPerpus()}catch(e){console.warn('interact3d reg',e)}}
  const G=RG[r];if(!G)return _place(v,r);
  unplace(v);v.room=r;G.add(v.g,v.tg);lh.push(v.g);v.g.visible=v.tg.visible=true};
}

/* ===== inti: perintah ke avatar pemain ===== */
const own=()=>V.get(did);
function clearV(v){
 v.mode=null;v.goal=null;v.path=null;v.xfer=null;v.seat=null;v.f=2;
 const R=v.R;if(R){R.wp=[];R.act=null;R.dance=false;R.poi=-1;R.hold=0;R.wait=.2}
 paintV(v)}
function standUp(v){clearV(v);R3.eject(v.room,v)}
function warp(v,room){
 if(v.room===room)return;
 place(v,room);const e=ENTRY[room];v.x=e.x;v.z=e.z;v.dx=0;v.dz=1;
 R3.ensure(v);const R=v.R;R.wp=[];R.act=null;R.poi=-1;R.dance=false;R.wait=.2;R.fa=0;
 if(v.L)v.L(0);if(v.Ar)v.Ar(0,0)}

let P=null,sitT=0;
/* ===== CEK TEMPAT DUDUK: dianggap terisi kalau ada avatar lain yang duduk di situ, sedang menuju ke situ
   (goal duduk / jalan otomatis / tujuan pemain), atau sudah dipesan. ex = avatar yang diabaikan, exA = entri AUTO yang diabaikan. ===== */
function occupied(room,x,z,ex,exA){
 const nr=(a,b)=>Math.hypot(a-x,b-z)<.55;
 for(const o of V.values()){
  if(o===ex||o.room!==room)continue;
  if(o.mode==='sit'&&nr(o.x,o.z))return true;
  if(o.goal&&o.goal.mode==='sit'&&nr(o.goal.x,o.goal.z))return true}
 for(const a of AUTO.values()){
  if(a===exA||a.room!==room)continue;
  if(nr(a.sp.x,a.sp.z))return true}
 if(P&&P.v!==ex&&P.sp.kind==='sit'&&P.sp.room===room&&nr(P.sp.x,P.sp.z))return true;
 return false}
/* sp = {kind:'stand'|'sit', room, x, z, f:[hadapX,hadapZ], w:[detikMin,detikMax], say, stage:{x,z} (untuk sit)} */
function visit(sp){
 const v=own();if(!v||sp.room==null)return false;
 R3.ensure(v);
 if(sp.kind==='sit'&&v.mode==='sit'&&v.room===sp.room&&Math.hypot(v.x-sp.x,v.z-sp.z)<.7){standUp(v);say3(v.tg,'oke, berdiri dulu');P=null;return true}
 if(sp.kind==='sit'&&occupied(sp.room,sp.x,sp.z,v)){
  /* tempat sudah dipakai (termasuk avatar yang duduk acak) -> coba tempat kosong lain di benda/ruangan yang sama, kalau tidak ada ya batal */
  const alt=(SPOTS()[sp.room]||[]).find(p=>Math.hypot(p.x-sp.x,p.z-sp.z)<3.5&&!occupied(sp.room,p.x,p.z,v));
  if(alt)sp=Object.assign({},sp,{x:alt.x,z:alt.z,stage:alt.st,f:alt.f||sp.f,seat:alt.seat});
  else{say3(v.tg,'sudah ada yang duduk');P=null;return true}}
 clearV(v);warp(v,sp.room);
 const st=sp.kind==='sit'?sp.stage:sp,an=sp.kind==='sit'?{f:sp.f||[0,1],w:[.5,.5]}:{f:sp.f,w:sp.w||[22,34]};
 const ok=R3.goTo(v,st.x,st.z,an);
 if(!ok&&sp.kind!=='sit'){v.x=sp.x;v.z=sp.z;R3.eject(v.room,v);v.R.fa=Math.atan2((sp.f||[0,1])[0],(sp.f||[0,1])[1])}
 P={v,sp,t:0};return true}

function tick(dt){
 const v=own();
 if(v&&v.mode==='sit'){sitT+=dt;if(sitT>SIT_MAX){sitT=0;standUp(v);say3(v.tg,'pegel, berdiri dulu~')}}else sitT=0;
 if(!P)return;
 if(v!==P.v||v.room!==P.sp.room){P=null;return}
 P.t+=dt;const R=v.R;if(!R)return;
 if(R.wp.length&&P.t<20)return;
 const s=P.sp;P=null;
 if(s.kind==='sit'){R.wp=[];R.act=null;v.goal={x:s.x,z:s.z,mode:'sit'};v.seat=s.seat==null?null:s.seat;if(s.f)v.R.fa=Math.atan2(s.f[0],s.f[1])}
 if(s.say)say3(v.tg,s.say)}
{const _wf=winFx;winFx=function(dt){_wf(dt);try{tick(dt)}catch(e){console.warn(e)}}}

/* ===== AVATAR LAIN duduk sendiri secara acak (kursi/sofa/bangku/ayunan di beberapa ruangan) =====
   Avatar yang lagi santai (tidak sedang dikendalikan kamu) kadang jalan ke tempat duduk yang kosong, duduk 8-22 detik, lalu berdiri dan lanjut jalan-jalan.
   EDIT: AUTO_ON = false untuk mematikan; AUTO_P = peluang per cek (tiap 1,5 detik) avatar santai mau duduk; AUTO_SIT = [detikMin,detikMax] lama duduk. */
const AUTO_ON=true,AUTO_P=.12,AUTO_SIT=[8,22],AUTO_CD=25;
const SPOTS=()=>{const W=window.SWING,sp={};
 if(typeof SEAT!=='undefined'&&SEAT&&SEAT.length)sp[1]=Array.from(SEAT).map((x,i)=>({x,z:-2.35,st:{x,z:-1.4},seat:i}));
 sp[2]=[-.9,-.2,.5,1.2].map(x=>({x,z:-2.6,st:{x,z:-1.6}})).concat([{x:4.3,z:.9,st:{x:3.3,z:.9},f:[-1,0]}]);
 sp[3]=[{x:2.7,z:-.5,st:{x:2.7,z:.4}},{x:9.63,z:-2.8,st:{x:9.63,z:-1.6}},{x:10.77,z:-2.8,st:{x:10.77,z:-1.6}},{x:7.0,z:-1.35,st:{x:7.0,z:-.45},f:[0,-1]},{x:8.2,z:-1.15,st:{x:8.2,z:-.3},f:[0,-1]},{x:6.2,z:.8,st:{x:7.2,z:.8},f:[1,0]},{x:7.5,z:2.2,st:{x:7.5,z:3.0},f:[1,0]},{x:9.7,z:2.2,st:{x:9.7,z:3.0},f:[-1,0]}];
 sp[4]=[.1,1.5].map(x=>({x,z:-.2,st:{x,z:-1}})).concat([.1,1.5].map(x=>({x,z:2.0,st:{x,z:2.8},f:[0,-1]})));
 sp[5]=[{x:1.0,z:-.55,st:{x:1.0,z:-1.5}},{x:-3.2,z:.1,st:{x:-3.2,z:1.6}}];
 sp[7]=[{x:-2.6,z:-2.85,st:{x:-2.6,z:-1.9}},{x:-1.8,z:-2.85,st:{x:-1.8,z:-1.9}},{x:.4,z:.2,st:{x:-.3,z:.2},f:[1,0]},{x:2.4,z:.2,st:{x:3.1,z:.2},f:[-1,0]}];
if(HASK){sp[9]=[].concat(...CAFC,CAFS).map(p=>({x:p.x,z:p.z,st:p.st,f:p.f}));sp[10]=KOMB.map(p=>({x:p.x,z:p.z,st:p.st,f:p.f}))}
 if(W)sp[8]=W.zs.map(z=>({x:W.x,z,st:{x:W.x-1.4,z}}));
 return sp};
const AUTO=new Map();let autoAcc=0;
const rnd=(a,b)=>a+Math.random()*(b-a);
function autoStep(dt){
 if(!AUTO_ON)return;autoAcc+=dt;if(autoAcc<1.5)return;const dd=autoAcc;autoAcc=0;
 const me=own(),now=Date.now(),SP=SPOTS();
 const taken=(room,p,ex)=>occupied(room,p.x,p.z,ex);
 AUTO.forEach((a,v)=>{
  if(!V.has(v.a&&v.a.id!=null?v.a.id:null)&&![...V.values()].includes(v)){AUTO.delete(v);return}
  if(v===me||v.room!==a.room){AUTO.delete(v);return}
  const R=v.R;if(!R){AUTO.delete(v);return}
  if(a.s==='go'){a.t+=dd;
   if(v.mode&&v.mode!=='sit'){AUTO.delete(v);return}
   if(!R.wp.length||a.t>25){R.wp=[];R.act=null;
    /* cek ulang: kalau selama jalan ada yang duduk duluan di situ, batal duduk */
    if(occupied(a.room,a.sp.x,a.sp.z,v,a)){v._autoCd=now+8000;AUTO.delete(v);return}
    v.goal={x:a.sp.x,z:a.sp.z,mode:'sit'};if(a.sp.seat!=null)v.seat=a.sp.seat;if(a.sp.f)R.fa=Math.atan2(a.sp.f[0],a.sp.f[1]);a.s='sit';a.t=rnd(AUTO_SIT[0],AUTO_SIT[1])}}
  else{a.t-=dd;if(a.t<=0){standUp(v);v._autoCd=now+AUTO_CD*1000;AUTO.delete(v)}}});
 V.forEach(v=>{
  if(v===me||AUTO.has(v)||!v.R||v.mode||v.goal||v.xfer||v.path||v.R.wp.length||(v._autoCd||0)>now)return;
  const list=SP[v.room];if(!list||Math.random()>AUTO_P)return;
  const free=list.filter(p=>!taken(v.room,p,v));if(!free.length)return;
  const p=free[Math.floor(Math.random()*free.length)];
  R3.ensure(v);if(!R3.goTo(v,p.st.x,p.st.z,{f:p.f||[0,1],w:[.5,.5]})){v._autoCd=now+8000;return}
  AUTO.set(v,{s:'go',sp:p,room:v.room,t:0})})}
{const _wf2=winFx;winFx=function(dt){_wf2(dt);try{autoStep(dt)}catch(e){console.warn('auto-sit',e)}}}

/* ===== pasang ke benda: tap benda -> avatar pergi ke sana ===== */
function wrap(o,specFn,opt){
 if(!o||o._i3||!o.userData||typeof o.userData.fn!=='function')return;
 o._i3=1;const f=o.userData.fn;opt=opt||{};
 o.userData.fn=function(){
  if(own()){
   let sp=null;try{sp=specFn(o)}catch(e){console.warn(e)}
   if(sp)visit(sp);
   if(opt.replace){if(!sp&&opt.full)say3(o,opt.full);else if(opt.then)opt.then();return}}
  return f.apply(this,arguments)}}
const st=(room,x,z,f,say,w)=>()=>({kind:'stand',room,x,z,f,say:typeof say==='function'?say():say,w});
const findIn=(G,x,z,nth)=>{const a=G?G.children.filter(o=>o.userData&&typeof o.userData.fn==='function'&&Math.abs(o.position.x-x)<.02&&Math.abs(o.position.z-z)<.02):[];return a[nth||0]};
const under=(o,G)=>{for(;o;o=o.parent)if(o===G)return true;return false};

/* pilih tempat duduk kosong dari daftar (dipakai sofa, beanbag, kursi baca, bangku catur). Tap lagi saat duduk = berdiri */
const sitPick=(room,spots,say)=>()=>{const me=own(),at=(o,p)=>o.room===room&&o.mode==='sit'&&Math.hypot(o.x-p.x,o.z-p.z)<.5;
 let i=spots.findIndex(p=>me&&at(me,p));
 if(i<0){const oth=[...V.values()].filter(o=>o!==me);i=spots.findIndex(p=>!oth.some(o=>at(o,p)));if(i<0)return null}
 const p=spots[i];return {kind:'sit',room,x:p.x,z:p.z,stage:p.st,f:p.f,say}};
const SOFA3=[{x:9.63,z:-2.8,st:{x:9.63,z:-1.6}},{x:10.77,z:-2.8,st:{x:10.77,z:-1.6}}],BEAN13=[{x:7.0,z:-1.35,st:{x:7.0,z:-.45},f:[0,-1]}],BEAN23=[{x:8.2,z:-1.15,st:{x:8.2,z:-.3},f:[0,-1]}],
      ARM3=[{x:6.2,z:.8,st:{x:7.2,z:.8},f:[1,0]}],STL13=[{x:7.5,z:2.2,st:{x:7.5,z:3.0},f:[1,0]}],STL23=[{x:9.7,z:2.2,st:{x:9.7,z:3.0},f:[-1,0]}];

/* EDIT: titik berdiri & ucapan tiap benda. room, x, z = tempat berdiri, f = arah hadap, say = ucapan, w = lama diam (detik) */
function scan(){
 /* --- lounge (ruang 1) --- */
 wrap(g0(()=>sf),()=>{
  const me=own(),used=[...V.values()].filter(o=>o!==me&&sitting(o)).map(o=>o.seat),i=[0,1].find(j=>!used.includes(j));
  if(i==null)return null;
  return {kind:'sit',room:1,seat:i,x:SEAT[i],z:-2.35,stage:{x:SEAT[i],z:-1.4},say:'nyaman~'}},{replace:true,full:'sofa penuh'});
 wrap(g0(()=>tg0),()=>{
  const me=own(),n=[...V.values()].filter(o=>o!==me&&watching(o)).length;
  return {kind:'stand',room:1,x:1.2+[0,-1.2,1.2][n%3],z:-1.2,f:[0,-1],w:[25,35],say:'seru nih~'}},{replace:true,then:()=>{if(window.tvNext)window.tvNext();else tv()}});
 wrap(g0(()=>tank),st(1,3.9,-1.4,[0,-1],'ikannya lucu~',[12,20]));

 /* --- furnitur & tanaman baru lounge: zona tap + avatar berdiri di dekatnya --- */
 if(typeof LG!=='undefined'&&!LG._zones&&typeof lact==='function'){
  LG._zones=1;
  const zn=(x,z,w,d,h,lines)=>{const g=new THREE.Group();g.position.set(x,0,z);
   const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));m.position.y=h/2;g.add(m);LG.add(g);
   lact(g,()=>say3(g,pick(lines)));return g};
  zn(4.95,-2.75,.9,.9,2.4,['tanamannya segar~','daunnya lebar banget','udah disiram belum ya']);
  zn(7.65,-2.7,.7,.7,1.7,['lidah mertua, awet dan kuat','tanamannya rapi~']);
  zn(-4.74,2.7,.5,1.3,2.0,['bukunya banyak banget','ada album lama di rak ini']);
  zn(-2.6,-.5,1.4,.8,.7,['ada teh hangat di meja','majalahnya seru dibaca']);
  zn(-.55,-2.85,.6,.6,1.3,['lampu mejanya hangat','cocok buat baca malam-malam']);
  zn(-4.3,-.1,.7,.7,.7,['selimutnya lembut banget','enak buat ngadem sambil nonton'])}
 if(typeof LG!=='undefined'&&LG._zones){
  wrap(findIn(LG,4.95,-2.75),st(1,4.5,-1.6,[.3,-1],'tanamannya segar~',[10,18]));
  wrap(findIn(LG,7.65,-2.7),st(1,4.5,-1.6,[1,-.5],'lidah mertua, awet banget',[10,18]));
  wrap(findIn(LG,-4.74,2.7),st(1,-3.7,2.7,[-1,0],'bukunya banyak banget',[12,20]));
  wrap(findIn(LG,-2.6,-.5),st(1,-2.6,.6,[0,-1],'ada teh hangat di meja',[10,18]));
  wrap(findIn(LG,-.55,-2.85),st(1,-.55,-1.9,[0,-1],'lampu mejanya hangat',[10,18]));
  wrap(findIn(LG,-4.3,-.1),st(1,-3.5,-.1,[-1,0],'selimutnya lembut banget',[10,18]))}

 /* --- ruang utama (ruang 0) --- */
 wrap(g0(()=>cake),st(0,0,2.9,[0,-1],'kuenya wangi~',[14,24]));
 wrap(g0(()=>tvG),st(0,0,-3.45,[0,-1],'nonton tv~',[20,30]));
 wrap(g0(()=>ar),st(0,-5,.5,[-1,0],'main dulu ah',[15,25]));
 wrap(g0(()=>bo),st(0,-5,3.4,[-1,0],'foto yuk!',[12,20]));
 wrap(g0(()=>sh),st(0,-5.5,-2.8,[-1,0],'mau baca buku apa ya',[15,25]));
 wrap(g0(()=>rd),st(0,-5.1,-1,[-1,0],'lagunya enak',[15,25]));
 wrap(g0(()=>ph),st(0,5.6,-.35,[0,-1],'halo?',[12,20]));
 wrap(g0(()=>cat),()=>({kind:'stand',room:0,x:Math.max(-5,Math.min(8,cat.position.x)),z:3,f:[0,1],w:[14,24],say:'meong~ sini kucing'}));
 wrap(S.children.find(o=>o.isGroup&&Math.abs(o.position.x-8.2)<.01&&Math.abs(o.position.z+5.3)<.01),st(0,8.1,-4.2,[0,-1],'balonnya lucu',[12,20]));
 wrap(S.children.find(o=>o.geometry&&o.geometry.type==='SphereGeometry'&&Math.abs(o.position.x+2.3)<.01&&Math.abs(o.position.z+4.6)<.01),
  ()=>({kind:'sit',room:0,x:-2.3,z:-4.6,stage:{x:-2.3,z:-3.65},say:'empuk banget~'}));

 /* --- galeri kenangan (ruang 2): berdiri di depan foto terdekat --- */
 const GRPG=window.GRP,V3=new THREE.Vector3();
 if(GRPG)lh.forEach(o=>{
  if(o._i3||!under(o,GRPG)||typeof o.userData.fn!=='function'||String(o.userData.fn).indexOf('goRoom')>=0)return;
  wrap(o,()=>{o.getWorldPosition(V3);const lx=V3.x-GRPG.position.x,X=[-3.3,0,3.3].reduce((a,b)=>Math.abs(b-lx)<Math.abs(a-lx)?b:a);
   return {kind:'stand',room:2,x:X,z:X===0?-1.7:-1.9,f:[0,-1],w:[18,30],say:pick(['kenangan ya...','lucu banget fotonya','jadi kangen~'])}})});

 /* --- dekor galeri kenangan yang tadinya tidak bisa di-tap: bangku, kursi santai, tanaman, rak, lukisan --- */
 if(GRPG&&!GRPG._zones&&typeof lact==='function'){
  GRPG._zones=1;
  /* zona tap tak terlihat (transparan) di atas benda; y0 = tinggi dasar, h = tinggi zona */
  const zone=(x,z,w,d,y0,h,lines)=>{const g=new THREE.Group();g.position.set(x,0,z);
   const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));m.position.y=y0+h/2;g.add(m);GRPG.add(g);
   lact(g,()=>say3(g,pick(lines)));return g};
  zone(0,-2.7,2.9,.75,0,.9,['bangkunya empuk','duduk santai sambil liatin foto','banyak kenangan di sini']);
  zone(4.35,.9,.95,.95,0,1.2,['kursinya nyaman banget','tempat favorit buat ngelamun']);
  zone(-4.2,-3.0,.7,.7,0,2.0,['tanamannya segar~','udah disiram belum ya']);
  zone(4.3,2.0,.8,.8,0,1.1,['ada kopi sama buku di sini','mejanya mungil tapi manis']);
  zone(4.4,-1.2,.7,1.7,0,1.4,['putar piringan hitam~']);
  zone(0,1.0,1.2,1.2,0,.9,['mejanya cantik, ada bunganya','teh hangat enaknya di sini']);
  zone(-1.35,1.35,.8,.8,0,.45,['poufnya empuk banget']);zone(1.35,1.45,.8,.8,0,.45,['poufnya empuk banget']);
  zone(-4.3,2.85,.7,.7,0,1.8,['gitarnya siap dimainin','jreng~ lagu apa ya']);
  zone(-4.85,1.3,.3,.9,3.1,.8,['jam']);
  zone(-4.75,-1.3,.4,1.7,2.0,1.4,['bukunya banyak banget','ada album lama di rak ini']);
  zone(-4.8,2.8,.3,1.0,2.5,1.0,['lukisannya bagus','siang-siang cerah ya']);
  zone(-4.8,-3.0,.3,1.0,2.5,1.0,['lukisan malamnya syahdu','bintangnya banyak']);
 }
 if(GRPG&&GRPG._zones){
  wrap(findIn(GRPG,0,-2.7),()=>{
   const me=own(),others=[...V.values()].filter(o=>o!==me&&o.room===2&&o.mode==='sit'),
         c=[-.9,-.2,.5,1.2].find(x=>!others.some(o=>Math.abs(o.x-x)<.5));
   if(c==null)return {kind:'stand',room:2,x:0,z:-1.7,f:[0,-1],w:[10,18],say:'bangkunya penuh, aku berdiri aja'};
   return {kind:'sit',room:2,x:c,z:-2.6,stage:{x:c,z:-1.6},say:'enak duduk di sini sambil liatin foto'}});
  wrap(findIn(GRPG,4.35,.9),()=>{const me=own(),at=o=>o.room===2&&o.mode==='sit'&&Math.hypot(o.x-4.3,o.z-.9)<.5;
   if(me&&at(me)||![...V.values()].some(o=>o!==me&&at(o)))return {kind:'sit',room:2,x:4.3,z:.9,stage:{x:3.3,z:.9},f:[-1,0],say:'nyaman banget~'};
   return null},{replace:true,full:'kursinya sudah ada yang duduk'});
  wrap(findIn(GRPG,-4.2,-3.0),st(2,-3.5,-2.5,[-1,0],'tanamannya segar',[10,18]));
  wrap(findIn(GRPG,4.3,2.0),st(2,3.4,2.1,[1,0],'ada kopi sama buku di sini',[10,18]));
  wrap(findIn(GRPG,4.4,-1.2),()=>{GRPG.userData.vinyl=!GRPG.userData.vinyl;return st(2,3.4,-1.2,[1,0],GRPG.userData.vinyl?'piringan hitamnya diputar~':'piringannya istirahat dulu',[10,18])()});
  wrap(findIn(GRPG,0,1.0),st(2,0,2.1,[0,-1],'mejanya cantik, ada bunganya',[10,18]));
  wrap(findIn(GRPG,-1.35,1.35),st(2,-1.35,2.3,[0,-1],'poufnya empuk banget',[10,18]));
  wrap(findIn(GRPG,1.35,1.45),st(2,1.35,2.4,[0,-1],'poufnya empuk banget',[10,18]));
  wrap(findIn(GRPG,-4.3,2.85),st(2,-3.3,2.6,[-1,0],'jreng~ gitarnya bagus',[10,18]));
  wrap(findIn(GRPG,-4.85,1.3),st(2,-3.6,1.3,[-1,0],()=>{const d=new Date();return 'sekarang jam '+d.getHours()+'.'+String(d.getMinutes()).padStart(2,'0')},[8,14]));
  wrap(findIn(GRPG,-4.75,-1.3),st(2,-4.1,-1.3,[-1,0],'bukunya banyak banget',[12,20]));
  wrap(findIn(GRPG,-4.8,2.8),st(2,-4.1,2.8,[-1,0],'lukisannya bagus',[10,18]));
  wrap(findIn(GRPG,-4.8,-3.0),st(2,-4.1,-2.0,[-1,0],'lukisan malamnya syahdu',[10,18]));
 }

 /* --- kamar tidur (ruang 3) --- */
 if(HAS2){
  wrap(findIn(BEDG,2.7,-1.8),()=>({kind:'sit',room:3,x:2.7,z:-.5,stage:{x:2.7,z:.4},say:'empuk banget kasurnya'}));
  wrap(findIn(BEDG,.9,-3.1),st(3,.9,-2.4,[0,-1],'lampu tidurnya imut',[10,18]));
  wrap(findIn(BEDG,-3.3,-3),st(3,-3.3,-2,[0,-1],'baju apa ya hari ini',[12,20]));
  wrap(findIn(BEDG,-4.35,.3),st(3,-3.4,.3,[-1,0],'kerja dulu sebentar',[15,25]));
  wrap(findIn(BEDG,4.5,-3.1),st(3,4.5,-2.4,[0,-1],'lampu tidurnya imut',[10,18]));
  wrap(findIn(BEDG,-4.55,-1.5),st(3,-3.6,-1.5,[-1,0],'laci-lacinya rapi',[10,18]));
  wrap(findIn(BEDG,4.55,-.3),st(3,5.4,-.3,[-1,0],'bunganya cantik~',[10,18]));
  /* --- ruang santai (perluasan kanan kamar tidur) --- */
  wrap(findIn(BEDG,5.9,-3.2),st(3,5.9,-2.3,[0,-1],'banyak buku~',[12,20]));
  wrap(findIn(BEDG,7.6,-3.47),st(3,8.0,-.2,[0,-1],'neonnya lucu',[10,18]));
  wrap(findIn(BEDG,7.6,-3.1),st(3,7.6,.1,[0,-1],'seru nih~',[20,30]));
  wrap(findIn(BEDG,10.2,-2.95),sitPick(3,SOFA3,'sofanya empuk~'),{replace:true,full:'sofanya penuh'});
  wrap(findIn(BEDG,10.2,-.7),st(3,10.2,.4,[0,-1],'ada teh + kue kering',[10,18]));
  wrap(findIn(BEDG,7.0,-1.35),sitPick(3,BEAN13,'empuk banget~'),{replace:true,full:'beanbag-nya sudah dipakai'});
  wrap(findIn(BEDG,8.2,-1.15),sitPick(3,BEAN23,'enak buat nonton'),{replace:true,full:'beanbag-nya sudah dipakai'});
  wrap(findIn(BEDG,6.2,.8),sitPick(3,ARM3,'kursi baca favorit'),{replace:true,full:'kursinya sudah dipakai'});
  wrap(findIn(BEDG,6.2,1.95),st(3,6.2,2.8,[0,-1],'ada teh hangat di meja',[10,18]));
  wrap(findIn(BEDG,11.8,-3.05),st(3,11.3,-1.9,[0,-1],'lampu lantainya hangat',[10,18]));
  wrap(findIn(BEDG,11.2,2.3),st(3,11.2,1.4,[0,1],'rak tanamannya cantik',[10,18]));
  wrap(findIn(BEDG,11.4,3.0),st(3,10.35,3.0,[1,0],'monsteranya subur',[10,18]));
  wrap(findIn(BEDG,8.6,2.2),sitPick(3,[STL13[0],STL23[0]],'skak yuk!'),{replace:true,full:'bangkunya penuh'});
  wrap(findIn(BEDG,7.5,2.2),sitPick(3,STL13,'giliran siapa?'),{replace:true,full:'bangkunya sudah dipakai'});
  wrap(findIn(BEDG,9.7,2.2),sitPick(3,STL23,'main catur yuk'),{replace:true,full:'bangkunya sudah dipakai'});

  /* --- ruang makan (ruang 4) --- */
  wrap(findIn(DING,.2,-3.1),st(4,.2,-2.4,[0,-1],'cuci piring dulu~',[10,18]));
  wrap(findIn(DING,2.6,-3.1),st(4,2.6,-2.4,[0,-1],'masak apa ya',[12,20]));
  wrap(findIn(DING,-3.9,-2.95),st(4,-2.7,-2.2,[-1,0],'ada sisa kue nggak?',[10,18]));
  /* --- perabotan dapur baru --- */
  wrap(findIn(DING,-2.55,-3.1),st(4,-2.55,-2.35,[0,-1],'kopi dulu ah',[10,18]));
  wrap(findIn(DING,-1.75,-3.1),st(4,-1.75,-2.35,[0,-1],'roti panggang~',[10,18]));
  wrap(findIn(DING,-1.05,-3.1),st(4,-1.05,-2.35,[0,-1],'masak air dulu',[10,18]));
  wrap(findIn(DING,1.25,-3.1),st(4,1.25,-2.35,[0,-1],'piringnya bersih',[10,18]));
  wrap(findIn(DING,3.85,-3.1),st(4,3.85,-2.35,[0,-1],'hangatin dulu',[10,18]));
  wrap(findIn(DING,4.55,-3.1),st(4,4.4,-2.3,[0,-1],'bikin smoothie~',[10,18]));
  wrap(findIn(DING,3.42,-3.3),st(4,3.42,-2.35,[0,-1],'spatulanya lengkap',[8,14]));
  wrap(findIn(DING,.2,-3.28),st(4,.2,-2.35,[0,-1],'herbalnya wangi',[10,18]));
  wrap(findIn(DING,-2.55,-3.3),st(4,-2.55,-2.35,[0,-1],'bumbunya lengkap',[8,14]));
  wrap(findIn(DING,-3.9,-3.46),()=>({kind:'stand',room:4,x:-3.9,z:-1.8,f:[0,-1],w:[8,14],say:(()=>{const d=new Date();return 'sekarang jam '+d.getHours()+'.'+String(d.getMinutes()).padStart(2,'0')})()}));
  wrap(findIn(DING,-4.55,-.1),st(4,-3.6,-.1,[-1,0],'buah segar di buffet',[10,18]));
  /* --- kamar mandi (perluasan kanan ruang makan) --- */
  wrap(findIn(DING,7.0,-2.75),st(4,7.0,-1.5,[0,-1],'berendam enak nih',[12,20]));
  wrap(findIn(DING,7.45,-2.65),st(4,7.45,-1.5,[0,-1],'bebek karetnya lucu',[10,18]));
  wrap(findIn(DING,7.8,-3.42),st(4,7.8,-1.5,[0,-1],'shower dulu ah',[10,18]));
  wrap(findIn(DING,9.4,-3.0),st(4,9.4,-1.9,[0,-1],'toilet bersih~',[8,14]));
  wrap(findIn(DING,11.0,-3.05),st(4,11.0,-2.0,[0,-1],'cuci tangan dulu',[10,18]));
  wrap(findIn(DING,11.0,-3.47),st(4,10.6,-2.0,[0,-1],'cantik banget hari ini!',[10,18]));
  wrap(findIn(DING,5.85,2.5),st(4,6.9,2.5,[-1,0],'cucian numpuk...',[10,18]));
  wrap(findIn(DING,5.6,-1.7),st(4,6.5,-1.7,[-1,0],'handuknya empuk',[10,18]));
  wrap(findIn(DING,8.3,-.9),st(4,8.3,-.2,[0,-1],'timbangan rahasia~',[10,18]));
  wrap(findIn(DING,11.35,2.5),st(4,10.4,2.5,[1,0],'pakisnya rimbun',[10,18]));
  /* --- balkon (ruang 5) --- */
  if(BALG){
   wrap(findIn(BALG,1.0,.3),()=>{
    const me=own(),taken=[...V.values()].some(o=>o!==me&&o.room===5&&o.mode==='sit'&&Math.abs(o.x-1.0)<.5&&Math.abs(o.z+.55)<.5);
    if(taken)return {kind:'stand',room:5,x:-.2,z:-1.2,f:[1,0],w:[10,18],say:'kursinya udah dipakai, aku berdiri aja'};
    return {kind:'sit',room:5,x:1.0,z:-.55,stage:{x:1.0,z:-1.5},say:'kuenya kelihatan enak!'}});
   wrap(findIn(BALG,-3.2,.4),()=>{
    const me=own(),taken=[...V.values()].some(o=>o!==me&&o.room===5&&o.mode==='sit'&&o.x<-2.5);
    if(taken)return {kind:'stand',room:5,x:-2.3,z:1.5,f:[-1,0],w:[8,14],say:'kursi santainya lagi dipakai'};
    return {kind:'sit',room:5,x:-3.2,z:.1,stage:{x:-3.2,z:1.6},say:'enak banget rebahan di sini~'}});
   wrap(findIn(BALG,-2.3,-.1),st(5,-1.6,-.1,[-1,0],'es lemonnya seger',[10,18]));
   wrap(findIn(BALG,-4.1,1.9),st(5,-3.5,2.4,[-1,0],'banyak banget kadonya!',[12,20]));
   wrap(findIn(BALG,3.7,1.9),st(5,3.1,1.9,[1,0],'wah bintangnya kelihatan jelas',[15,25]));
   wrap(findIn(BALG,-4.2,-2.9),st(5,-3.4,-2.3,[-1,0],'palemnya segar banget',[10,18]));
   wrap(findIn(BALG,4.1,-2.0),st(5,3.3,-1.6,[1,0],'lemonnya belum matang',[10,18]));
   wrap(findIn(BALG,-4.3,3.0),st(5,-3.3,3.0,[-1,0],'bunganya cantik~',[10,18]));
   wrap(findIn(BALG,4.55,3.0),st(5,3.6,2.8,[1,0],'balonnya lucu',[12,20]));
  }

  /* meja makan: 4 kursi bisa diduduki (2 sisi belakang menghadap depan, 2 sisi depan menghadap belakang) */
  const DCH=[{x:.1,z:-.2,st:{x:.1,z:-1}},{x:1.5,z:-.2,st:{x:1.5,z:-1}},{x:.1,z:2.0,st:{x:.1,z:2.8},f:[0,-1]},{x:1.5,z:2.0,st:{x:1.5,z:2.8},f:[0,-1]}];
  wrap(findIn(DING,.8,.9,0),sitPick(4,DCH,'makan bareng yuk!'),{replace:true,full:'kursinya penuh'});
  DCH.forEach(p=>wrap(findIn(DING,p.x,p.z),sitPick(4,[p],'kursinya nyaman'),{replace:true,full:'kursinya sudah dipakai'}));
 }

 /* --- basement (ruang 6) --- */
 if(BASG){
  wrap(findIn(BASG,-.5,-.7),st(6,-.5,.9,[0,-1],'mobilnya imut ya!',[12,20]));
  wrap(findIn(BASG,-4.35,-1.0),st(6,-3.4,-1,[-1,0],'lagi benerin apa nih?',[12,20]));
  wrap(findIn(BASG,-4.93,.9),st(6,-3.3,.95,[-1,0],'ayo main dart!',[10,18]));
  wrap(findIn(BASG,-4.3,2.2),st(6,-3.2,2.2,[-1,0],'cuci baju dulu~',[10,18]));
  wrap(findIn(BASG,-3.6,-3.05),st(6,-3.6,-2.35,[0,-1],'banyak barang lama di sini',[12,20]));
  wrap(findIn(BASG,3.1,1.9),st(6,3.1,1.05,[0,1],'sepedanya masih bagus',[10,18]));
  wrap(findIn(BASG,4.2,-.5),st(6,3.2,-.5,[1,0],'sisa dekor ultah~',[10,18]));
 }

 /* --- teras (ruang 7) & taman (ruang 8) --- */
 if(TERG&&TAMG){
  /* duduk di teras: bangku beludru (2 tempat) & 2 kursi emas di meja teh. Tap kursi tertentu = kursi itu; tap meja / bangku = tempat yang kosong */
  const sitAt=(room,spots,say)=>()=>{const me=own(),at=(o,p)=>o.room===room&&o.mode==='sit'&&Math.hypot(o.x-p.x,o.z-p.z)<.5;
   let i=spots.findIndex(p=>me&&at(me,p));
   if(i<0){const oth=[...V.values()].filter(o=>o!==me);i=spots.findIndex(p=>!oth.some(o=>at(o,p)));if(i<0)return null}
   const p=spots[i];return {kind:'sit',room,x:p.x,z:p.z,stage:p.st,f:p.f,say}};
  const BEN=[{x:-2.6,z:-2.85,st:{x:-2.6,z:-1.9}},{x:-1.8,z:-2.85,st:{x:-1.8,z:-1.9}}],CHL={x:.4,z:.2,st:{x:-.3,z:.2},f:[1,0]},CHR={x:2.4,z:.2,st:{x:3.1,z:.2},f:[-1,0]};
  wrap(findIn(TERG,-2.2,-3.0),sitAt(7,BEN,'enak buat ngopi sore'),{replace:true,full:'bangkunya penuh'});
  const TBL=findIn(TERG,1.4,.2);
  if(TBL){wrap(findIn(TBL,-1,0),sitAt(7,[CHL],'kursinya empuk~'),{replace:true,full:'kursinya sudah ada yang duduk'});
   wrap(findIn(TBL,1,0),sitAt(7,[CHR],'teh hangat + kue, mantap'),{replace:true,full:'kursinya sudah ada yang duduk'});
   wrap(TBL,sitAt(7,[CHL,CHR],'teh hangat + kue, mantap'),{replace:true,full:'kursinya penuh'})}
  wrap(findIn(TERG,4.3,-2.8),st(7,4.3,-1.8,[0,-1],'tanamannya subur',[10,18]));
  wrap(findIn(TAMG,.3,.5),st(8,.3,2.3,[0,-1],'make a wish~',[14,24]));
  wrap(findIn(TAMG,3.1,-2.0),st(8,3.1,-.2,[0,-1],'gazebonya adem banget',[14,24]));
  wrap(findIn(TAMG,-3.4,-2.5),st(8,-3.4,-1.2,[0,-1],'pohonnya rindang',[10,18]));
  wrap(findIn(TAMG,-2.3,2.7),st(8,-2.3,1.9,[0,1],'bunganya warna-warni~',[10,18]));
  wrap(findIn(TAMG,4.0,2.3),st(8,3.1,2.3,[1,0],'pohonnya cantik',[10,18]));
  wrap(findIn(TAMG,-.9,-2.55),st(8,-.9,-1.4,[0,-1],'Miko gagah banget!',[10,18]));
  wrap(findIn(TAMG,6.4,2.75),st(8,6.4,1.9,[0,1],'mawarnya harum banget',[10,18]));
  wrap(findIn(TAMG,9.2,2.75),st(8,9.2,1.9,[0,1],'tulipnya rapi~',[10,18]));
  wrap(findIn(TAMG,6.1,-2.0),st(8,6.1,-.9,[0,-1],'lilinya anggun~',[10,18]));
  wrap(findIn(TAMG,10.3,-1.1),st(8,9.8,-1.1,[1,0],'teduh banget di sini',[10,18]));
  /* ayunan: tap = avatarmu jalan ke kursi yang kosong lalu duduk & berayun; tap lagi = berdiri (posisi dari window.SWING di outdoor3d.js) */
  {const W=window.SWING;if(W)wrap(findIn(TAMG,W.x,(W.zs[0]+W.zs[1])/2),()=>{
    const me=own(),at=(o,z)=>o.room===8&&o.mode==='sit'&&Math.abs(o.x-W.x)<.55&&Math.abs(o.z-z)<.45;
    let i=W.zs.findIndex(z=>me&&at(me,z));
    if(i<0){const used=[...V.values()].filter(o=>o!==me).map(o=>W.zs.findIndex(z=>at(o,z)));i=[0,1].find(j=>!used.includes(j));if(i==null)return null}
    return {kind:'sit',room:8,x:W.x,z:W.zs[i],stage:{x:W.x-1.4,z:W.zs[i]},say:'wuuss~ seru!'}},{replace:true,full:'ayunannya penuh'})}
 }
}

/* ===== EDIT: kafe (ruang 9) & komplek (ruang 10) — titik berdiri / duduk tiap benda =====
   findW(grup, x, z) = cari benda yang bisa di-tap di koordinat lokal (x,z) (termasuk yang bersarang di dalam grup lain).
   Tombol/gerbang pindah ruangan (goKafe / goKomplek / toTerrace) sengaja tidak dipasang: tap = pindah ruangan seperti biasa. */
const findW=(G,x,z,tol)=>{let r=null;tol=tol||.06;G.updateMatrixWorld(true);const w=new THREE.Vector3();
 G.traverse(o=>{if(r||o._i3||!o.userData||typeof o.userData.fn!=='function')return;o.getWorldPosition(w);if(Math.abs(w.x-G.position.x-x)<tol&&Math.abs(w.z-G.position.z-z)<tol)r=o});return r};
function scanKomp(){
 regKomp();if(!HASK)return;
 const KG=RG[9],MG=RG[10];
 /* --- kafe (9): tempat duduk dulu (supaya tidak didahului pembungkus lain) --- */
 const TS=['ngobrol santai di sini~','teh hangat + kue, mantap','meja favorit nih','enak buat baca buku'];
 CAFT.forEach((t,i)=>wrap(findW(KG,t[0],t[1]),sitPick(9,CAFC[i],TS[i]),{replace:true,full:'mejanya penuh'}));
 wrap(findW(KG,5.4,2.0),sitPick(9,CAFS,'sofanya empuk banget~'),{replace:true,full:'sofanya penuh'});
 CAFB.forEach(p=>wrap(findW(KG,p.x,p.z),sitPick(9,[p],'lihat barista bikin kopi'),{replace:true,full:'bangkunya sudah dipakai'}));
 /* --- kafe (9): berdiri di depan bar --- */
 wrap(findW(KG,3.6,-4.42),st(9,3.6,-1.2,[0,-1],'mau pesan apa ya...',[10,16]));
 wrap(findW(KG,5.5,-4.15),st(9,5.6,-1.2,[0,-1],'wangi kopi~',[10,16]));
 wrap(findW(KG,1.5,-2.9),st(9,1.5,-1.2,[0,-1],'pilih yang mana ya...',[10,16]));
 wrap(findW(KG,4.1,-2.85),st(9,4.1,-1.2,[0,-1],'bayar dulu ah',[8,14]));
 wrap(findW(KG,5.75,-2.75),st(9,5.75,-1.2,[0,-1],'make a wish~',[10,16]));
 wrap(findW(KG,3.4,-2.9),st(9,3.4,-1.2,[0,-1],'mau pesan apa?',[10,16]));
 wrap(findW(KG,3.2,-3.55),st(9,3.2,-1.2,[0,-1],'halo kak barista~',[10,16]));
 wrap(findW(KG,-6.2,-4.35),st(9,-5.3,-3.2,[-.5,-1],'lucu banget piringnya',[8,14]));
 /* --- komplek (10) --- */
 /* minimarket (-1.6,-4.6): tap = langsung masuk Royal Mart (goMart di komplek3d.js), tidak dibungkus */
 wrap(findW(MG,-10.5,6.3),st(10,-10.4,4.6,[0,1],'permisi pak~',[10,16]));
 wrap(findW(MG,-12.0,5.4),st(10,-12.0,3.8,[0,1],'pos satpam rapi ya',[8,14]));
 wrap(findW(MG,-6.8,5.3),st(10,-6.8,4.5,[0,1],'komplek paling cantik~',[10,16]));
 wrap(findW(MG,0,6.9),st(10,0,4.4,[0,1],'airnya bening banget',[10,18]));
 wrap(findW(MG,-6.4,-2.4),st(10,-5.7,-2.4,[-1,0],'meong~ halo kucing',[8,14]));
 /* bangku taman di air mancur: zona tap tak terlihat -> duduk */
 if(!MG._zones&&typeof lact==='function'){MG._zones=1;
  [-3.4,3.4].forEach(x=>{const g=new THREE.Group();g.position.set(x,0,6.9);
   const m=new THREE.Mesh(new THREE.BoxGeometry(.8,1.0,1.8),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));m.position.y=.5;g.add(m);MG.add(g);
   lact(g,()=>say3(g,'bangkunya adem'))})}
 wrap(findW(MG,-3.4,6.9),sitPick(10,KOMB.slice(0,2),'angin sore enak banget~'),{replace:true,full:'bangkunya penuh'});
 wrap(findW(MG,3.4,6.9),sitPick(10,KOMB.slice(2),'santai dulu ah~'),{replace:true,full:'bangkunya penuh'})}
/* --- Royal Mart (11): tiap benda mart3d.js membawa titik berdiri sendiri (M.spots). Pintu keluar tidak dibungkus: tap = keluar --- */
function scanMart(){
 regMart();if(!HASM)return;
 window.MART3D.spots.forEach(s=>{if(s.o&&!s._w){s._w=1;wrap(s.o,st(11,s.x,s.z,s.f,s.say,s.w))}})}

/* --- Perpustakaan (12): tiap benda perpus3d.js membawa titik berdiri / duduk sendiri (PERPUS3D.spots). Pintu keluar tidak dibungkus: tap = keluar --- */
function scanPerpus(){
 regPerpus();if(!HASP)return;
 (window.PERPUS3D.spots||[]).forEach(s=>{if(!s.o||s._w)return;s._w=1;
  if(s.sit){const p={x:s.x,z:s.z,st:s.sit,f:s.f};wrap(s.o,sitPick(12,[p],s.say),{replace:true,full:'kursinya sudah dipakai'})}
  else wrap(s.o,st(12,s.x,s.z,s.f,s.say,s.w))})}

/* ===== KUNCI ARAH HADAP saat duduk di kursi meja teh (teras) =====
   Engine avatar menimpa arah hadap saat duduk, jadi diatur ulang TEPAT SEBELUM render (sama seperti postAv ayunan).
   Kursi kiri (x=.4) menghadap kanan (+x) ke meja, kursi kanan (x=2.4) menghadap kiri (-x). */
if(typeof REN!=='undefined'&&REN&&typeof REN.render==='function'&&!REN._chairFace){REN._chairFace=true;const _rc=REN.render;
 const CH=[{r:7,x:.4,z:.2,a:Math.PI/2},{r:7,x:2.4,z:.2,a:-Math.PI/2},{r:2,x:4.3,z:.9,a:-Math.PI/2},
  /* ruang santai (kamar tidur): sofa & beanbag menghadap TV, kursi baca & bangku catur saling berhadapan */
  {r:3,x:9.63,z:-2.8,a:0},{r:3,x:10.77,z:-2.8,a:0},{r:3,x:7.0,z:-1.35,a:Math.PI},{r:3,x:8.2,z:-1.15,a:Math.PI},{r:3,x:6.2,z:.8,a:Math.PI/2},{r:3,x:7.5,z:2.2,a:Math.PI/2},{r:3,x:9.7,z:2.2,a:-Math.PI/2},
  /* kursi meja makan (ruang 4) */
  {r:4,x:.1,z:-.2,a:0},{r:4,x:1.5,z:-.2,a:0},{r:4,x:.1,z:2.0,a:Math.PI},{r:4,x:1.5,z:2.0,a:Math.PI},
  /* kursi tangan perpustakaan (12): menghadap meja bulat */
  {r:12,x:-2.45,z:.2,a:Math.PI/2},{r:12,x:2.45,z:.2,a:-Math.PI/2}].concat(SEATS9);   /* + kursi/sofa/bangku bar kafe (9) & bangku taman komplek (10) */
 REN.render=function(a,b){try{V.forEach(v=>{if(v.mode!=='sit'||!v.g)return;
   const c=CH.find(c=>c.r===v.room&&Math.hypot(v.x-c.x,v.z-c.z)<.5);if(c){v.g.rotation.y=c.a;if(v.R)v.R.fa=c.a}})}catch(e){}
  return _rc.call(this,a,b)}}
try{scan()}catch(e){console.warn('interact3d',e)}
try{scanKomp()}catch(e){console.warn('interact3d kafe/komplek',e)}
try{scanMart()}catch(e){console.warn('interact3d mart',e)}
try{scanPerpus()}catch(e){console.warn('interact3d perpus',e)}
setInterval(()=>{try{scan()}catch(e){}try{scanKomp()}catch(e){}try{scanMart()}catch(e){}try{scanPerpus()}catch(e){}},4000);
})();