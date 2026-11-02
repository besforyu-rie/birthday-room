/* badge3d.js — muat SETELAH housemodel3d.js dan SEBELUM live3d.js:
   <script src="badge3d.js?v=1"></script>
   Isi (semua di satu file):
   1) GARASI HIDUP: tap knalpot mobil = mesin menyala (suara + getar + asap). Klakson & lampu depan sudah ada di basement3d.js, di sini hanya dicatat untuk lencana.
   2) BERBURU BENDA TERSEMBUNYI: 8 benda kecil berkilau, satu per ruangan. Tap = ditemukan (tersimpan di perangkat).
   3) LENCANA: 11 lencana (tangkap balon, baca buku, buka kado, garasi, benda tersembunyi, dll). Muncul toast saat dapat.
   4) BUKU EMAS di rak buku ruang utama: tap rak -> zoom -> tap buku emas -> jendela koleksi lencana.
   Butuh 1 baris tambahan di upgrade3d.js (window.BOOKDEFS=defs) supaya buku emas bisa ditap saat zoom rak. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof lact==='undefined'||typeof act==='undefined'||typeof say3==='undefined'||
   typeof openM==='undefined'||typeof winFx!=='function'||typeof ls==='undefined'||typeof spr==='undefined'||typeof PAL==='undefined'||typeof ST==='undefined'){console.warn('badge3d: skrip dasar belum siap');return}
console.log('badge3d.js v1 loaded');

const PXF='"Press Start 2P",monospace',pick=a=>a[Math.floor(Math.random()*a.length)];
const lsj=(k,d)=>{try{const v=JSON.parse(ls(k)||'null');return v==null?d:v}catch(e){return d}};
const sfxOff=()=>typeof SFX!=='undefined'&&SFX.on===false;
const byX=x=>S.children.find(o=>o.isGroup&&o.position.x===x&&o.position.y===0&&o.position.z===0);

/* ---------- ikon pixel (pakai palet PAL milik index.html; tambahan: book, gift, car, lamp, gear) ---------- */
const ICON=Object.assign({},ST,{
 book:['.bbbbbb.','bWWbWWWb','bWWbkkWb','bWWbWWWb','bWWbkkWb','bWWbWWWb','.bbbbbb.'],
 gift:['..p..p..','...pp...','rrrrrrrr','rrrryrrr','yyyyyyyy','rrrryrrr','rrrryrrr'],
 car:['..rrrr..','.rwwwwr.','rrrrrrrr','rkrrrrkr','.kk..kk.'],
 lamp:['..yyyy..','.yyWWyy.','.yyyyyy.','..yyyy..','...kk...'],
 gear:['..k..k..','.kkkkkk.','kk.WW.kk','.kkkkkk.','..k..k..']
});
function tex(name){const m=ICON[name],c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
 const s=Math.floor(48/Math.max(m[0].length,m.length)),w=m[0].length*s,h=m.length*s,ox=(64-w)>>1,oy=(64-h)>>1;
 const draw=(dx,dy,col)=>m.forEach((r,y)=>[...r].forEach((ch,x)=>{if(PAL[ch]){g.fillStyle=col||PAL[ch];g.fillRect(ox+x*s+dx,oy+y*s+dy,s,s)}}));
 [[-2,0],[2,0],[0,-2],[0,2]].forEach(([dx,dy])=>draw(dx,dy,'#ffffff'));draw(0,0);
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;return t}
const SPK=(()=>{const c=document.createElement('canvas');c.width=c.height=9;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(4,0,1,9);g.fillRect(0,4,9,1);
 g.fillStyle='#f2c14e';g.fillRect(3,3,3,3);g.fillStyle='#fff';g.fillRect(4,4,1,1);const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;return t})();

/* ---------- penyimpanan ---------- */
const BK='bday-badges',HK='bday-hunt';
const got=new Set(lsj(BK,[])),HUNT=new Set(lsj(HK,[])),has=id=>got.has(id);

/* ---------- daftar benda tersembunyi (satu per ruangan) ---------- */
const ITEMS=[
 {id:'garasi',ic:'star',nm:'bintang emas',rm:'garasi'},
 {id:'utama',ic:'heart',nm:'hati merah',rm:'ruang utama',main:1},
 {id:'lounge',ic:'cat',nm:'kucing mini',rm:'lounge'},
 {id:'galeri',ic:'crown',nm:'mahkota kecil',rm:'ruang kenangan'},
 {id:'kamar',ic:'moon',nm:'bulan sabit',rm:'kamar tidur'},
 {id:'balkon',ic:'balloon',nm:'balon kecil',rm:'balkon'},
 {id:'teras',ic:'fish',nm:'ikan kecil',rm:'teras'},
 {id:'taman',ic:'cake',nm:'kue mini',rm:'taman'}
];

/* ---------- daftar lencana ---------- */
const nh=n=>{let h=0;const s=(n.from||'')+'|'+(n.t||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
const nkey=n=>n.id||('l'+nh(n));
const booksRead=()=>CFG.books.filter(b=>ls('bday-read-'+b.id)==='1').length;
const giftsOpened=()=>new Set((ls('bday-gifts')||'').split('|').filter(Boolean)).size;
const BADGES=[
 {id:'balon',ic:'balloon',nm:'Pemburu Balon',ds:'main tangkap balon'},
 {id:'juara',ic:'crown',nm:'Juara Balon',ds:'skor 40+ di tangkap balon',chk:()=>!!ls('bday-unlock')},
 {id:'buku',ic:'book',nm:'Kutu Buku',ds:'baca semua buku di rak',pr:()=>booksRead()+'/'+CFG.books.length,chk:()=>CFG.books.length>0&&booksRead()>=CFG.books.length},
 {id:'kado',ic:'gift',nm:'Pembuka Kado',ds:'buka semua kado',pr:()=>Math.min(giftsOpened(),CFG.gifts.length)+'/'+CFG.gifts.length,chk:()=>CFG.gifts.length>0&&giftsOpened()>=CFG.gifts.length},
 {id:'klakson',ic:'car',nm:'Tukang Klakson',ds:'klakson mobil di garasi'},
 {id:'lampu',ic:'lamp',nm:'Pembalap Malam',ds:'nyalakan lampu depan mobil'},
 {id:'mesin',ic:'gear',nm:'Montir Handal',ds:'nyalakan mesin mobil'},
 {id:'detektif',ic:'star',nm:'Detektif Cilik',ds:'temukan semua benda tersembunyi',pr:()=>HUNT.size+'/'+ITEMS.length},
 {id:'rahasia',ic:'ghost',nm:'Penjelajah Rahasia',ds:'masuk kamar rahasia',chk:()=>ls('bday-aqsa')==='1'},
 {id:'sahabat',ic:'heart',nm:'Sahabat Setia',ds:'baca semua ucapan',chk:()=>{if(ls('bday-aqsa')!=='1')return false;
  const L=CFG.notes.concat(typeof cloud!=='undefined'&&cloud?cloud:[]);if(!L.length)return false;const s=new Set(lsj('bday-read-notes',[]));return L.every(n=>s.has(nkey(n)))}},
 {id:'kolektor',ic:'cake',nm:'Kolektor Sejati',ds:'kumpulkan semua lencana lain',chk:()=>BADGES.every(b=>b.id==='kolektor'||has(b.id))}
];

/* ---------- toast lencana ---------- */
const tel=document.createElement('div');
tel.style.cssText='position:fixed;top:58px;left:50%;transform:translate(-50%,-24px);opacity:0;transition:opacity .3s,transform .3s;z-index:35;pointer-events:none;background:#fff8dc;border:4px solid #f2c14e;box-shadow:4px 4px 0 var(--ink);padding:8px 12px;display:flex;gap:10px;align-items:center;max-width:92vw';
document.body.appendChild(tel);
const tq=[];let tbusy=false;
function nextToast(){const f=tq.shift();if(!f){tbusy=false;return}tbusy=true;tel.replaceChildren();f(tel);tel.style.opacity=1;tel.style.transform='translate(-50%,0)';
 setTimeout(()=>{tel.style.opacity=0;tel.style.transform='translate(-50%,-24px)';setTimeout(nextToast,350)},2600)}
function toast(f){tq.push(f);if(!tbusy)nextToast()}
function toastBadge(b){toast(el=>{const ic=spr(ICON[b.ic],4);const t=document.createElement('div');
 t.innerHTML='<div class="px" style="font-size:9px;color:#e84a5f;margin-bottom:4px">lencana baru!</div><div style="font-size:24px;line-height:1"></div>';t.lastChild.textContent=b.nm;el.append(ic,t)})}
function toastText(txt,ic){toast(el=>{if(ic)el.append(spr(ICON[ic],4));const t=document.createElement('div');t.style.cssText='font-size:24px;line-height:1';t.textContent=txt;el.append(t)})}

function award(id){if(has(id))return;const b=BADGES.find(x=>x.id===id);if(!b)return;got.add(id);ls(BK,JSON.stringify([...got]));toastBadge(b);
 try{if(typeof SFX!=='undefined'&&SFX.pop)SFX.pop()}catch(e){}}
function sync(){BADGES.forEach(b=>{if(b.chk&&!has(b.id)){try{if(b.chk())award(b.id)}catch(e){}}})}

/* tangkap balon: lencana "Pemburu Balon" saat tombol start ditekan (modal game dibuat ulang tiap dibuka, jadi dipantau) */
try{new MutationObserver(()=>{const s=mb.querySelector('#gs');if(s&&!s.dataset.bdg){s.dataset.bdg='1';s.addEventListener('click',()=>award('balon'))}}).observe(mb,{childList:true,subtree:true})}catch(e){console.warn('badge3d observer',e)}

/* ======================================================================
   GARASI HIDUP (basement)
   ====================================================================== */
const BASE=byX(240);let car=null,eng=0;const ENG_T=4.5,puffs=[];
if(BASE)car=BASE.children.find(o=>o.isGroup&&o.userData.fn&&Math.abs(o.position.x+.5)<.01&&Math.abs(o.position.z+.7)<.01);
if(car){
 /* catat tap mobil: klakson + lampu (perilakunya sudah ada di basement3d.js) */
 const f0=car.userData.fn;let taps=0;
 car.userData.fn=function(){const r=f0.apply(this,arguments);taps++;award('klakson');if(taps%2===1)award('lampu');return r};

 /* knalpot = tombol starter */
 const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,.5,12),M('#8a97ab'));pipe.rotation.z=Math.PI/2;pipe.position.set(-1.95,.27,-.45);car.add(pipe);
 const tip=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.08,12),M('#2a2f3a'));tip.rotation.z=Math.PI/2;tip.position.set(-2.2,.27,-.45);car.add(tip);
 const hit=new THREE.Mesh(new THREE.SphereGeometry(.3,8,6),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.set(-2.0,.3,-.45);car.add(hit);
 lact(pipe,startEngine);lact(hit,startEngine);
 /* papan kecil penunjuk */
 const lc=document.createElement('canvas');lc.width=256;lc.height=64;const lg=lc.getContext('2d'),lt=new THREE.CanvasTexture(lc);lt.magFilter=lt.minFilter=THREE.NearestFilter;
 const drawL=()=>{lg.clearRect(0,0,256,64);lg.fillStyle='#f2c14e';lg.fillRect(0,0,256,64);lg.strokeStyle='#1f3a5f';lg.lineWidth=6;lg.strokeRect(3,3,250,58);
  lg.fillStyle='#1f3a5f';lg.font='14px '+PXF;lg.textAlign='center';lg.textBaseline='middle';lg.fillText('TAP: MESIN',128,34);lt.needsUpdate=true};
 drawL();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(drawL);
 const lab=new THREE.Sprite(new THREE.SpriteMaterial({map:lt,transparent:true}));lab.scale.set(1.0,.25,1);lab.position.set(-2.05,.95,-.45);car.add(lab);car.userData.lab=lab;
 /* asap knalpot */
 for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),new THREE.MeshBasicMaterial({color:'#d7dde6',transparent:true,opacity:0,depthWrite:false}));m.visible=false;BASE.add(m);puffs.push({m,t:0})}
}else console.warn('badge3d: mobil di basement tidak ditemukan');

function engSound(){if(sfxOff())return;
 try{const AC=window.AudioContext||window.webkitAudioContext,ac=window._bsAc=window._bsAc||new AC();ac.resume();const T=ac.currentTime,D=ENG_T;
  const o1=ac.createOscillator(),o2=ac.createOscillator(),lf=ac.createOscillator(),fl=ac.createBiquadFilter(),g=ac.createGain(),lg=ac.createGain(),g2=ac.createGain(),mix=ac.createGain();
  o1.type='sawtooth';o2.type='square';lf.type='sine';fl.type='lowpass';fl.Q.value=3;
  const ramp=(p,pts,k)=>{p.setValueAtTime(pts[0][1]*k,T+pts[0][0]);pts.slice(1).forEach(([t,v])=>p.linearRampToValueAtTime(v*k,T+t))};
  const F=[[0,50],[.18,85],[.3,58],[.48,95],[.62,65],[.8,105],[1.0,92],[1.6,210],[2.2,120],[3.4,95],[D,60]];
  ramp(o1.frequency,F,1);ramp(o2.frequency,F,.5);
  ramp(fl.frequency,[[0,500],[1.0,800],[1.6,1800],[2.4,800],[D,400]],1);
  g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(.12,T+.12);g.gain.setValueAtTime(.12,T+D-.7);g.gain.exponentialRampToValueAtTime(.0001,T+D);
  lf.frequency.value=13;lg.gain.value=.045;g2.gain.value=.6;
  o1.connect(mix);o2.connect(g2);g2.connect(mix);mix.connect(fl);fl.connect(g);g.connect(ac.destination);lf.connect(lg);lg.connect(g.gain);
  [o1,o2,lf].forEach(o=>{o.start(T);o.stop(T+D+.1)})}catch(e){}}
function startEngine(){
 if(eng>0){say3(car,'mesinnya masih nyala~');return}
 eng=ENG_T;award('mesin');say3(car,pick(['brrrm!','mesinnya halus~','brrmm brrmm!','siap jalan!']));engSound()}

/* ======================================================================
   BERBURU BENDA TERSEMBUNYI
   ====================================================================== */
const PLACED=[];
try{
 /* kumpulkan kotak-kotak perabot supaya benda tidak nyangkut di dalam meja/lemari */
 S.updateMatrixWorld(true);const OB=[];
 S.traverse(o=>{if(!o.isMesh||!o.geometry)return;const gt=o.geometry.type;if(gt==='PlaneGeometry'||gt==='CircleGeometry'||gt==='RingGeometry')return;
  const mt=o.material;if(mt&&!Array.isArray(mt)&&mt.transparent&&mt.opacity<.35)return;
  const b=new THREE.Box3().setFromObject(o),sx=b.max.x-b.min.x,sy=b.max.y-b.min.y,sz=b.max.z-b.min.z;if(sx>8||sz>6||sy<.04)return;OB.push(b)});
 const score=(x,z)=>{const x0=x-.4,x1=x+.4,z0=z-.4,z1=z+.4;let n=0;for(const b of OB)if(b.max.x>x0&&b.min.x<x1&&b.max.z>z0&&b.min.z<z1&&b.min.y<3.2&&b.max.y>.03)n++;return n};
 const CAN=[[-4.3,-2.8],[4.3,-2.8],[-4.3,2.8],[4.3,2.8],[-2.3,-2.9],[2.3,-2.9],[-4.4,.3],[4.4,.3],[-1.2,2.9],[1.2,2.9],[0,-2.9],[-3.2,1.4],[3.2,1.4]];
 const rooms={garasi:BASE,utama:S,lounge:typeof LG!=='undefined'?LG:byX(40),galeri:window.GRP||byX(80),kamar:byX(120),balkon:byX(200),teras:byX(280),taman:byX(320)};
 ITEMS.forEach((it,ri)=>{
  const room=rooms[it.id];if(!room||HUNT.has(it.id))return;
  let best=CAN[0],bs=1e9;const ox=room.position.x,oz=room.position.z;
  for(let k=0;k<CAN.length;k++){const c=CAN[(k+ri*3)%CAN.length],s=score(ox+c[0],oz+c[1]);if(s<bs){bs=s;best=c;if(s===0)break}}
  const cont=new THREE.Group();cont.position.set(best[0],0,best[1]);room.add(cont);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(it.ic),transparent:true}));sp.scale.set(.62,.62,1);sp.position.y=.34;cont.add(sp);
  const sk=new THREE.Sprite(new THREE.SpriteMaterial({map:SPK,transparent:true,depthWrite:false}));sk.scale.set(.2,.2,1);sk.position.set(.28,.62,.02);cont.add(sk);
  const ht=new THREE.Sprite(new THREE.SpriteMaterial({transparent:true,opacity:0,depthWrite:false}));ht.scale.set(1.2,1.2,1);ht.position.y=.4;cont.add(ht);
  Object.assign(it,{cont,sp,sk,ht,done:false});PLACED.push(it);
  (it.main?act:lact)(cont,()=>foundItem(it))})
}catch(e){console.warn('badge3d: gagal menaruh benda tersembunyi',e)}

function foundItem(it){
 if(it.done)return;it.done=true;HUNT.add(it.id);ls(HK,JSON.stringify([...HUNT]));
 const arr=it.main?hits:lh,i=arr.indexOf(it.cont);if(i>=0)arr.splice(i,1);
 say3(it.cont,'ketemu! '+it.nm+' ('+HUNT.size+'/'+ITEMS.length+')');
 [it.sp,it.sk,it.ht].forEach(o=>o.visible=false);
 try{if(typeof SFX!=='undefined'&&SFX.pop)SFX.pop()}catch(e){}
 toastText('ketemu: '+it.nm+' ('+HUNT.size+'/'+ITEMS.length+')',it.ic);
 if(HUNT.size>=ITEMS.length){award('detektif');if(typeof confetti==='function')confetti()}}

/* ======================================================================
   BUKU EMAS DI RAK + JENDELA KOLEKSI LENCANA
   ====================================================================== */
function openBadges(){
 const n=BADGES.filter(b=>has(b.id)).length;
 openM('<h2>koleksi lencana</h2><div class="px" style="font-size:10px;margin:0 0 12px">'+n+' / '+BADGES.length+' lencana</div><div id="bgd" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>'+
  '<h2 style="margin:18px 36px 8px 0;font-size:11px">benda tersembunyi '+HUNT.size+'/'+ITEMS.length+'</h2><div id="hgd" style="display:flex;flex-wrap:wrap;gap:8px"></div>'+
  '<p style="font-size:20px;margin-top:10px;opacity:.75">petunjuk: ada benda kecil berkilau yang bersembunyi di tiap ruangan. tap untuk mengambilnya.</p>');
 const grid=$('#bgd'),hg=$('#hgd');
 BADGES.forEach(b=>{const o=has(b.id),d=document.createElement('div');
  d.style.cssText='border:3px solid '+(o?'#f2c14e':'var(--wood2)')+';background:'+(o?'#fff8dc':'#e3efff')+';padding:8px 6px;text-align:center;box-shadow:3px 3px 0 var(--ink)';
  const ic=spr(ICON[b.ic],5);ic.style.margin='0 auto 6px';if(!o){ic.style.filter='grayscale(1) brightness(.4)';ic.style.opacity='.6'}
  const nm=document.createElement('div');nm.style.cssText='font-size:22px;line-height:1';nm.textContent=o?b.nm:'???';
  const ds=document.createElement('div');ds.style.cssText='font-size:18px;line-height:1.05;opacity:.75;margin-top:3px';ds.textContent=b.ds+(!o&&b.pr?' ('+b.pr()+')':'');
  d.append(ic,nm,ds);grid.append(d)});
 ITEMS.forEach(it=>{const f=HUNT.has(it.id),d=document.createElement('div');d.style.cssText='width:76px;text-align:center;font-size:17px;line-height:1.05';
  const ic=spr(ICON[it.ic],4);ic.style.margin='0 auto 4px';if(!f){ic.style.filter='grayscale(1) brightness(.35)';ic.style.opacity='.55'}
  const t=document.createElement('div');t.textContent=f?it.nm:'? '+it.rm;d.append(ic,t);hg.append(d)})}

let bookG=null;
try{
 if(typeof sh==='undefined')throw new Error('rak (sh) tidak ditemukan');
 const g=new THREE.Group();g.position.set(0,2.8,-.38);sh.add(g);bookG=g;
 bx(.46,.86,.2,'#f2c14e',.07,.43,0,g);bx(.47,.06,.205,'#c98b52',.07,.1,0,g);bx(.47,.06,.205,'#c98b52',.07,.76,0,g);
 const c=document.createElement('canvas');c.width=c.height=64;const cg=c.getContext('2d');cg.imageSmoothingEnabled=false;
 cg.fillStyle='#1f3a5f';cg.fillRect(8,8,48,48);cg.fillStyle='#f2c14e';cg.fillRect(11,11,42,42);stk(cg,'star',32,32);
 const ct=new THREE.CanvasTexture(c);ct.magFilter=ct.minFilter=THREE.NearestFilter;
 const face=new THREE.Mesh(new THREE.PlaneGeometry(.17,.17),new THREE.MeshBasicMaterial({map:ct,transparent:true}));face.rotation.y=Math.PI/2;face.position.set(.305,.43,0);g.add(face);
 const sk=new THREE.Sprite(new THREE.SpriteMaterial({map:SPK,transparent:true,depthWrite:false}));sk.scale.set(.22,.22,1);sk.position.set(.36,.72,.1);g.add(sk);g.userData.sk=sk;
 g.userData.zfx=()=>{try{if(typeof SFX!=='undefined'&&SFX.click)SFX.click()}catch(e){}openBadges()};
 if(window.BOOKDEFS)window.BOOKDEFS.push({id:'lencana',title:'Lencana',m:g});
 else console.warn('badge3d: window.BOOKDEFS belum ada. Pastikan upgrade3d.js versi baru (ada baris window.BOOKDEFS=defs).')
}catch(e){console.warn('badge3d: buku lencana gagal dibuat',e)}

/* ======================================================================
   LOOP
   ====================================================================== */
let wasEng=false,smokeT=0;
function tick(dt){
 const t=performance.now()/1000;
 PLACED.forEach((it,i)=>{if(it.done)return;it.sp.position.y=.34+Math.sin(t*2.2+i)*.04;const k=.62+Math.sin(t*3+i)*.03;it.sp.scale.set(k,k,1);
  it.sk.material.opacity=.55+.45*Math.sin(t*5+i*2);const q=.16+.06*Math.sin(t*5+i*2);it.sk.scale.set(q,q,1)});
 if(bookG&&bookG.userData.sk){const s=bookG.userData.sk,q=.2+.05*Math.sin(t*4);s.scale.set(q,q,1);s.material.opacity=.6+.4*Math.sin(t*4)}
 if(car){
  if(eng>0){eng-=dt;wasEng=true;const rev=eng>ENG_T-3.4&&eng<ENG_T-.9?1.8:1;
   car.position.z=-.7+Math.sin(t*75)*.007*rev;car.rotation.z=Math.sin(t*61)*.003*rev;
   smokeT-=dt;if(smokeT<=0){smokeT=rev>1?.07:.14;const p=puffs.find(q=>q.t<=0);if(p){p.t=1.1;p.m.visible=true;p.m.position.set(car.position.x-2.35+(Math.random()-.5)*.1,.3,car.position.z-.45+(Math.random()-.5)*.1)}}
  }else if(wasEng){wasEng=false;car.position.z=-.7;car.rotation.z=0}
  puffs.forEach(p=>{if(p.t<=0)return;p.t-=dt;if(p.t<=0){p.m.visible=false;return}const u=1-p.t/1.1;p.m.position.x-=.7*dt;p.m.position.y+=.45*dt;p.m.scale.setScalar(1+u*1.8);p.m.material.opacity=.55*(1-u)})
 }}
{const _w=winFx;let warned=false;winFx=function(dt){_w(dt);try{tick(dt)}catch(e){if(!warned){warned=true;console.warn('badge3d',e)}}}}

setInterval(sync,1500);sync();
})();