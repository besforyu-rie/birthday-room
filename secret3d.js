/* secret3d.js — KAMAR RAHASIA khusus Aqsa.
   Taruh sefolder dengan index.html dan muat PALING AKHIR (setelah upgrade3d.js):
   <script src="secret3d.js?v=1"></script>
   Isi: tap poster kucing siamese di dinding ruang utama -> kotak kode -> kamar rahasia 3D berisi
   Miko (kucing siamese) + anak-anaknya, surat, tali polaroid foto, kaset pesan suara, jendela malam, lampu string.
   Semua teks/foto/suara yang perlu kamu isi ada di bagian ASQ tepat di bawah ini. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof lh==='undefined'||typeof lact==='undefined')return;

/* ============ EDIT BAGIAN INI SAJA ============ */
const ASQ={
 q:"",   /* petunjuk di kotak kode (opsional). Dikosongkan: kodenya kamu kasih langsung ke orangnya */
 hashDev:"2ewvzqlx4yn",                          /* kode tester (bukan Aqsa): buka kamar rahasia tanpa dianggap Aqsa di fitur realtime */
 hash:"1kcu4hmvgj6",                              /* hash kode (bukan kodenya). Ganti kode: buka console, ketik aqsaHash('kode baru'), salin hasilnya ke sini */
 hidePublicLetter:true,   /* true = surat di meja dekat kue disembunyikan (isinya hanya ada di kamar rahasia) */
 title:"ruang kecil buat Aqsa & Miko",
 hint:"tap Miko, anak-anaknya, surat, foto, kaset di lemari, papan di dinding kiri, mainan di karpet, kotak musik, komputer, kue, dan kado",
 since:[2025,12,25],   /* mulai berteman: [tahun,bulan,tanggal] -> dipakai papan hitungan hari */
 musicbox:{src:""},   /* opsional: file lagu mp3 sefolder dengan index.html (mis. "musicbox.mp3"). Kosong = pakai melodi lullaby bawaan */
 pc:{name:"AQSA-PC",msg:"halo Aqsa! ini komputer kecil di kamar rahasiamu. tap komputernya untuk ganti layar. semoga harimu menyenangkan."},   /* name = tulisan di taskbar, msg = pesan di layar ke-2 */
 aqsa:{hair:"short",hairColor:"#2b1b2e",skin:"#f6d3b8",shirt:"#7aa7e8",pants:"#3b4a7a",shoes:"#f2f2f2",hijab:"#f4a6c0",glasses:false,catEars:false,
  say:["hai!","yey, ulang tahun!","makasih ya","elus Miko dulu~"]},   /* avatar Aqsa di kamar ini. hair: "short" | "long" | "bun" | "hijab". hijab = warna kerudung (dipakai kalau hair:"hijab"). catEars = bando kuping kucing */
 welcome:"selamat ulang tahun, Aqsa!",
 cakeMsg:"semoga semua yang kamu mau tahun ini terkabul, Aqsa.",   /* tulisan setelah lilin kue ditiup */
 gifts:[   /* kado di dekat kue (maks 3): c = warna kotak, r = warna pita, t = isi pesan */
  {c:"#f4a6c0",r:"#ffffff",art:"miko",t:"Miko bikin potret dirinya khusus buat kamu. dia pakai topi ulang tahun, tapi tetap sok keren."},
  {c:"#9fd8ff",r:"#f2c14e",art:"kittens",t:"anak-anak Miko ikut kirim kado: foto bareng mereka, lengkap pakai topi dan pita."},
  {c:"#c9a8ff",r:"#ffffff",art:"family",t:"satu keluarga kecil ini kirim salam hangat. selamat ulang tahun, Aqsa!"}
 ],
 sign:"for aqsa",
 miko:{n:"Miko",say:["meow~","mrrp?","purr purr...","*ngulet*","mau dielus lagi dong"]},
 /* anak-anak Miko: ganti nama & warna sesuai aslinya (body = warna badan, pt = warna kuping/muka/kaki, rib = pita) */
 kittens:[
  {n:"anak 1",body:"#f4e7d1",pt:"#7a5645",rib:"#8fd0f0"},
  {n:"anak 2",body:"#faf3e6",pt:"#9a7b66",rib:"#f4a6c0"},
  {n:"anak 3",body:"#f0d3a2",pt:"#b9783f",rib:"#a98bd6"}
 ],
 /* surat: kalau body dikosongkan, dipakai isi surat di meja dekat kue */
 letter:{title:"Surat khusus buat kamu",body:"",from:"- dari aku"},   /* from = tanda tangan di bawah surat (boleh dikosongkan) */
 /* foto: taruh file-nya sefolder dengan index.html (maks 6) */
 photos:[
  {src:"secret1.png",t:"foto 1",cap:"mabar zombie apocalypse"},
  {src:"secret2.png",t:"foto 2",cap:"ini di cafe seven eleven pas ultah mita"},
  {src:"secret3.png",t:"foto 3",cap:"powerpuff aja soalnya 1 nya bukan girl"}
 ],
 /* pesan suara: file mp3 sefolder dengan index.html; t = teks cadangan / transkrip (opsional) */
 voices:[
  {n:"pesan dari aku",src:"secret_voice1.mp3",t:""},
  {n:"satu lagi",src:"secret_voice2.mp3",t:""}
 ]
};
/* ============================================== */

/* ---------- hash jawaban (tidak peduli huruf besar/kecil & spasi) ---------- */
const norm=s=>String(s==null?'':s).toLowerCase().replace(/[^a-z0-9]/g,'');
function H(s){const str='aqsa-bday|'+norm(s);let h1=0xdeadbeef^7,h2=0x41c6ce57^7;
 for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
 h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
 h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
 return (4294967296*(2097151&h2)+(h1>>>0)).toString(36)}
window.aqsaHash=H;

/* ---------- sembunyikan surat di meja dekat kue (isinya pindah ke kamar rahasia) ---------- */
if(ASQ.hidePublicLetter&&typeof env!=='undefined'){env.visible=false;if(typeof hits!=='undefined'){const i=hits.indexOf(env);if(i>=0)hits.splice(i,1)}}

/* ---------- helper mesh ---------- */
const SR=new THREE.Group();SR.position.set(0,0,-150);SR.visible=false;S.add(SR);
const lam=c=>new THREE.MeshLambertMaterial({color:c}),bas=c=>new THREE.MeshBasicMaterial({color:c});
const put=(m,x,y,z,p)=>{m.position.set(x||0,y||0,z||0);(p||SR).add(m);return m};
const B=(w,h,d,c,x,y,z,p)=>put(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),lam(c)),x,y,z,p);
const SP=(r,c,x,y,z,p,sx,sy,sz,bs)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),bs?bas(c):lam(c));m.scale.set(sx||1,sy||1,sz||1);return put(m,x,y,z,p)};
const CY=(rt,rb,h,c,x,y,z,p,seg)=>put(new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,seg||20),lam(c)),x,y,z,p);
const CO=(r,h,c,x,y,z,p,seg)=>put(new THREE.Mesh(new THREE.ConeGeometry(r,h,seg||4),lam(c)),x,y,z,p);
const rnd=(a,b)=>a+Math.random()*(b-a),clp=(v,a,b)=>Math.max(a,Math.min(b,v));
function ctex(w,h,fn,rep){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
 const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;if(rep){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rep[0],rep[1])}return t}
function pixT(rows,pal,sc){return ctex(rows[0].length*sc,rows.length*sc,g=>rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch]){g.fillStyle=pal[ch];g.fillRect(x*sc,y*sc,sc,sc)}})))}
const ST=pixT(['...Y...','...Y...','..YYY..','YYYWYYY','..YYY..','...Y...','...Y...'],{Y:'#ffd95a',W:'#ffffff'},4);

/* ---------- ruangan ---------- */
const woodT=ctex(32,32,g=>{const sh=['#e6cfa6','#e0c79b','#ead5ae','#dcc296'];for(let r=0;r<4;r++){const o=(r*7)%16;for(let k=-1;k<3;k++){const x=o+k*16;g.fillStyle=sh[(r+k+4)%4];g.fillRect(x,r*8,16,8);g.fillStyle='#c9ad82';g.fillRect(x,r*8,16,1);g.fillRect(x,r*8,1,8)}}},[5,4]);
const paperT=ctex(32,32,g=>{g.fillStyle='#5b55a6';g.fillRect(0,0,32,32);g.fillStyle='#4f4a98';for(let x=0;x<32;x+=8)g.fillRect(x,0,1,32);
 [[8,8],[24,24]].forEach(([x,y])=>{g.fillStyle='#f4e3a0';g.fillRect(x,y-2,1,5);g.fillRect(x-2,y,5,1);g.fillStyle='#fff';g.fillRect(x,y,1,1)});
 [[24,8],[8,24]].forEach(([x,y])=>{g.fillStyle='#7b74c8';g.fillRect(x-1,y,3,2);g.fillRect(x-2,y-2,1,1);g.fillRect(x,y-3,1,1);g.fillRect(x+2,y-2,1,1)})},[4,2]);
const fl=new THREE.Mesh(new THREE.PlaneGeometry(10,8),new THREE.MeshLambertMaterial({map:woodT}));fl.rotation.x=-Math.PI/2;SR.add(fl);
const bw=new THREE.Mesh(new THREE.PlaneGeometry(10,5),new THREE.MeshLambertMaterial({map:paperT}));bw.position.set(0,2.5,-4);SR.add(bw);
const lw=new THREE.Mesh(new THREE.PlaneGeometry(8,5),new THREE.MeshLambertMaterial({map:paperT}));lw.rotation.y=Math.PI/2;lw.position.set(-5,2.5,0);SR.add(lw);
B(10,.9,.12,'#3d3a7a',0,.45,-3.94);B(.12,.9,8,'#3d3a7a',-4.94,.45,0);B(10,.12,.14,'#2a2860',0,.9,-3.93);B(.14,.12,8,'#2a2860',-4.93,.9,0);

/* jendela malam di dinding kiri */
const nightT=ctex(40,48,g=>{['#0d1538','#121c48','#18255a','#202f6b','#2a3a7c','#34468a'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,i*8,40,8)});
 [[5,4],[14,10],[30,6],[22,18],[8,22],[34,26],[18,34],[3,40],[28,40],[12,44],[36,14]].forEach(([x,y])=>{g.fillStyle='#fff';g.fillRect(x,y,1,1)});
 g.fillStyle='#fff6c8';g.beginPath();g.arc(28,12,6,0,7);g.fill();g.fillStyle='#2a3a7c';g.beginPath();g.arc(31,10,5,0,7);g.fill();
 g.fillStyle='#0b1130';g.fillRect(0,40,40,8);g.fillStyle='#161f52';[[2,38,10,3],[16,37,12,4],[30,39,10,2]].forEach(a=>g.fillRect(...a))});
{const wg=new THREE.Group();wg.position.set(-4.9,3.1,.4);wg.rotation.y=Math.PI/2;SR.add(wg);
 B(2.5,2.9,.12,'#a8743f',0,0,0,wg);const gl=new THREE.Mesh(new THREE.PlaneGeometry(2.1,2.5),new THREE.MeshBasicMaterial({map:nightT}));gl.position.z=.07;wg.add(gl);
 B(.08,2.5,.06,'#a8743f',0,0,.09,wg);B(2.1,.08,.06,'#a8743f',0,0,.09,wg);B(2.8,.14,.3,'#8a5e30',0,-1.5,.12,wg)}

/* neon di dinding belakang */
const neon=(()=>{const c=document.createElement('canvas');c.width=320;c.height=64;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);
 const d=()=>{g.clearRect(0,0,320,64);g.textAlign='center';g.font='20px "Press Start 2P",monospace';g.shadowColor='#7ab8ff';g.shadowBlur=14;g.fillStyle='#d6e8ff';g.fillText(ASQ.sign,160,40);g.shadowBlur=4;g.fillText(ASQ.sign,160,40);t.needsUpdate=true};
 d();if(document.fonts)document.fonts.ready.then(d);const m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.64),new THREE.MeshBasicMaterial({map:t,transparent:true}));m.position.set(0,4.2,-3.9);SR.add(m);return m})();

/* tali lampu */
const bulbs=[];for(let i=0;i<15;i++){const u=i/14,b=SP(.07,['#ffe9a0','#ff9fc4','#9fd8ff','#c9a8ff'][i%4],-4.6+u*9.2,4.82-.2*Math.sin(u*Math.PI*3)*.7-.1,-3.86,SR,1,1,1,true);b.userData.p=rnd(0,6);bulbs.push(b)}

/* karpet & kasur Miko */
CY(2.4,2.4,.04,'#f4cfd9',.5,.02,.9,SR,40);CY(1.9,1.9,.05,'#fbe6ec',.5,.025,.9,SR,40);CY(1.3,1.3,.06,'#f4cfd9',.5,.03,.9,SR,40);
const bedP={x:-1.7,z:.6};CY(1.05,1.1,.3,'#c9788f',bedP.x,.15,bedP.z,SR,28);CY(.82,.82,.36,'#f9dfe5',bedP.x,.18,bedP.z,SR,28);

/* meja surat */
const dk=new THREE.Group();dk.position.set(-3.1,0,-2.7);SR.add(dk);
B(1.9,.1,1.1,'#a8743f',0,.95,0,dk);[[-.8,-.45],[.8,-.45],[-.8,.45],[.8,.45]].forEach(([x,z])=>B(.12,.9,.12,'#5a3b22',x,.45,z,dk));B(1.5,.3,.05,'#8a5e30',0,.75,.5,dk);
CY(.16,.2,.06,'#2e527f',-.65,1.03,-.25,dk);CY(.02,.02,.7,'#2e527f',-.65,1.4,-.25,dk);CO(.28,.3,'#f2c14e',-.65,1.85,-.25,dk,12);SP(.07,'#fff3b0',-.65,1.72,-.25,dk,1,1,1,true);
const lampL2=new THREE.PointLight('#ffd9a0',1.1,9);lampL2.position.set(-3.7,1.9,-2.95);SR.add(lampL2);
const roofL=new THREE.PointLight('#ffe6f2',.55,16);roofL.position.set(0,4.2,1);SR.add(roofL);
const env2=new THREE.Group();env2.position.set(.15,1.03,.05);env2.rotation.y=-.25;dk.add(env2);
B(.85,.02,.6,'#fffdf3',0,0,0,env2);B(.62,.04,.42,'#fff1dc',.05,.03,.02,env2);const seal=B(.12,.05,.12,'#4f8fe8',.05,.06,.02,env2);seal.rotation.y=Math.PI/4;
lact(env2,()=>{letterGo()});

/* lemari + kaset suara */
const cab=new THREE.Group();cab.position.set(3.4,0,-2.7);SR.add(cab);
B(1.6,.8,.9,'#4f7fb8',0,.4,0,cab);B(1.7,.06,1,'#2e527f',0,.83,0,cab);B(.6,.5,.04,'#3b6aa0',-.38,.4,.47,cab);B(.6,.5,.04,'#3b6aa0',.38,.4,.47,cab);
const rec=new THREE.Group();rec.position.set(0,.86,0);cab.add(rec);
B(.95,.34,.52,'#f2b84b',0,.17,0,rec);B(.5,.18,.02,'#cfe3ff',-.12,.2,.27,rec);B(.22,.2,.02,'#7a5a1a',.34,.17,.27,rec);
const reels=[-.27,.03].map(x=>{const r=CY(.09,.09,.04,'#1f3a5f',x,.2,.29,rec,10);r.rotation.x=Math.PI/2;return r});
const led=SP(.03,'#ff4040',.38,.3,.27,rec,1,1,1,true);
lact(rec,()=>{voiceUI()});

/* tanda "bisa ditap" */
const sparks=[];function spark(p,x,y,z){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:ST,transparent:true,depthTest:false}));s.position.set(x,y,z);s.scale.set(.32,.32,1);p.add(s);s.userData.p=rnd(0,6);sparks.push(s)}
spark(dk,.2,1.65,.05);spark(cab,0,1.55,0);

/* papan hitungan hari berteman (dinding kiri, dekat meja) */
const SINCE=ASQ.since||[2025,12,25],BLN=['jan','feb','mar','apr','mei','jun','jul','agu','sep','okt','nov','des'];
const sinceTxt=SINCE[2]+' '+BLN[SINCE[1]-1]+' '+SINCE[0],sinceD=()=>new Date(SINCE[0],SINCE[1]-1,SINCE[2]);
function dayCount(){const n=new Date(),t0=new Date(n.getFullYear(),n.getMonth(),n.getDate());return Math.max(0,Math.round((t0-sinceD())/864e5))}
function sinceParts(){const n=new Date();let m=(n.getFullYear()-SINCE[0])*12+n.getMonth()-(SINCE[1]-1),d=n.getDate()-SINCE[2];
 if(d<0){m--;d+=new Date(n.getFullYear(),n.getMonth(),0).getDate()}m=Math.max(0,m);return{y:Math.floor(m/12),m:m%12,d:Math.max(0,d)}}
function nextMile(days){const c=[];
 for(let k=1;k<=30;k++)c.push({l:k+' tahun berteman',d:Math.round((new Date(SINCE[0]+k,SINCE[1]-1,SINCE[2])-sinceD())/864e5)});
 for(let k=1;k<=100;k++)c.push({l:'hari ke-'+k*100,d:k*100});
 return c.filter(x=>x.d>days).sort((a,b)=>a.d-b.d)[0]}
const sgC=document.createElement('canvas');sgC.width=192;sgC.height=112;
const sgT=new THREE.CanvasTexture(sgC);sgT.magFilter=sgT.minFilter=THREE.NearestFilter;
function drawSign(){const g=sgC.getContext('2d'),w=192;
 g.fillStyle='#fff8e7';g.fillRect(0,0,w,112);g.fillStyle='#f4a6c0';g.fillRect(0,0,w,22);
 g.textAlign='center';g.fillStyle='#fff';g.font='10px "Press Start 2P",monospace';g.fillText('BERTEMAN',w/2,15);
 g.fillStyle='#2e527f';g.font='30px "Press Start 2P",monospace';g.fillText(String(dayCount()),w/2,62);
 g.font='10px "Press Start 2P",monospace';g.fillText('hari',w/2,80);
 g.fillStyle='#8a6a52';g.font='8px "Press Start 2P",monospace';g.fillText('sejak '+sinceTxt,w/2,100);sgT.needsUpdate=true}
drawSign();if(document.fonts)document.fonts.ready.then(drawSign);
const sg=new THREE.Group();sg.position.set(-4.9,2.7,-2.4);sg.rotation.y=Math.PI/2;SR.add(sg);
B(1.7,1.1,.1,'#a8743f',0,0,0,sg);
const sgm=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.875),new THREE.MeshBasicMaterial({map:sgT}));sgm.position.z=.06;sg.add(sgm);
function sinceUI(){const n=dayCount(),p=sinceParts(),mi=nextMile(n),ps=[];
 if(p.y)ps.push(p.y+' tahun');if(p.m)ps.push(p.m+' bulan');if(p.d||!ps.length)ps.push(p.d+' hari');
 openM(`<h2>kita sudah berteman</h2><p style="font-size:26px">${n} hari</p><p>${ps.join(' ')} sejak ${esc(sinceTxt)}</p>${mi?`<p class="from">${mi.d-n} hari lagi menuju ${esc(mi.l)}</p>`:''}`)}
lact(sg,()=>{sinceUI()});spark(sg,0,.85,.1);

/* tali polaroid */
const strY=x=>3.55+.35*Math.pow(x/3.2,2);
for(let i=0;i<=32;i++){const x=-3.4+i*.2125;B(.23,.025,.025,'#e8dcc0',x,strY(x)+.2,-3.88)}
const phG=[];
(ASQ.photos||[]).slice(0,6).forEach((p,i,arr)=>{
 const x=(i-(arr.length-1)/2)*1.1,g=new THREE.Group();g.position.set(x,strY(x)+.2-.62,-3.82);g.rotation.z=((i*37)%7-3)*.02;SR.add(g);
 B(.95,1.15,.03,'#fffdf3',0,0,0,g);B(.08,.16,.05,'#f2c14e',0,.6,.01,g);
 const mat=new THREE.MeshBasicMaterial({map:ctex(16,16,c=>{c.fillStyle='#cfe0f6';c.fillRect(0,0,16,16);c.fillStyle='#4f7fb8';c.fillRect(7,4,2,5);c.fillRect(7,11,2,2)})});
 const im=new THREE.Mesh(new THREE.PlaneGeometry(.77,.77),mat);im.position.set(0,.09,.025);g.add(im);
 new THREE.TextureLoader().load(p.src,t=>{mat.map=t;mat.needsUpdate=true},undefined,()=>{});
 lact(g,()=>photoUI(i));phG.push(g)});

/* ---------- partikel bintang kecil ---------- */
const hearts=[];
function love(n,o,tx){const v=new THREE.Vector3();o.getWorldPosition(v);SR.worldToLocal(v);
 for(let i=0;i<n;i++)setTimeout(()=>{const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tx||ST,transparent:true,depthTest:false}));s.position.set(v.x+rnd(-.3,.3),v.y+1.2+rnd(0,.3),v.z+rnd(-.2,.2));s.scale.set(.26,.26,1);SR.add(s);hearts.push({s,l:1.4,vx:rnd(-.2,.2)})},i*110)}

/* ---------- suara kucing (pakai meow.mp3 kalau ada) ---------- */
function meow(rate){try{const a=new Audio(typeof CFG!=='undefined'&&CFG.meow?CFG.meow:'meow.mp3');a.volume=.6;
  a.preservesPitch=a.mozPreservesPitch=a.webkitPreservesPitch=false;a.playbackRate=rate||1;
  a.onerror=()=>{if(typeof synth==='function')synth()};const p=a.play();if(p&&p.catch)p.catch(()=>{if(typeof synth==='function')synth()})}catch(e){}}

/* ---------- model kucing siamese chibi ---------- */
function mkCat(o){
 const g=new THREE.Group(),sc=o.scale||1,hs=o.head||1;
 const sh=new THREE.Mesh(new THREE.CircleGeometry(.85*sc,18),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.2,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.012;g.add(sh);
 const mdl=new THREE.Group();mdl.scale.setScalar(sc);g.add(mdl);
 const body=SP(.5,o.body,0,.52,0,mdl,1,1.1,.92);SP(.34,o.belly||'#fff7e6',0,.46,.3,mdl,1,1.1,.45);
 SP(.3,o.body,-.34,.26,-.05,mdl,1,.9,1.1);SP(.3,o.body,.34,.26,-.05,mdl,1,.9,1.1);
 SP(.13,o.pt,-.3,.08,.18,mdl,1,.7,1.5);SP(.13,o.pt,.3,.08,.18,mdl,1,.7,1.5);
 [-.16,.16].forEach(x=>{CY(.1,.105,.3,o.body,x,.42,.36,mdl,10);CY(.105,.115,.28,o.pt,x,.17,.37,mdl,10);SP(.12,o.pt,x,.06,.42,mdl,1,.75,1.3)});
 const head=new THREE.Group();head.position.set(0,1.22,.1);head.scale.setScalar(hs);mdl.add(head);
 SP(.46,o.body,0,0,0,head,1.12,.95,1);SP(.3,o.pt,0,-.08,.3,head,1.05,.8,.62);SP(.14,o.belly||'#fff7e6',0,-.15,.48,head,1.3,.6,.4);SP(.045,'#f29aab',0,-.05,.56,head,1.3,.8,.8);
 const eyes=new THREE.Group();eyes.position.set(0,.05,.42);head.add(eyes);
 [-1,1].forEach(s=>{SP(.1,'#5ab8ff',s*.2,0,0,eyes,1,1.2,.5,true);SP(.055,'#1a1a3a',s*.2,0,.04,eyes,.9,1.3,.4,true);SP(.022,'#fff',s*.17,.05,.07,eyes,1,1,1,true);
  const bl=new THREE.Mesh(new THREE.CircleGeometry(.07,10),new THREE.MeshBasicMaterial({color:'#ff9bb3',transparent:true,opacity:.55}));bl.position.set(s*.33,-.08,.38);bl.rotation.y=s*.8;head.add(bl);
  for(let k=0;k<3;k++){const w=B(.28,.012,.012,'#ffffff',s*.43,-.12+k*.04,.46,head);w.rotation.z=s*(.18-k*.14)}});
 const ears=[-1,1].map(s=>{const e=CO(.17,.36,o.pt,s*.3,.5,-.02,head,3);e.rotation.z=-s*.28;CO(.09,.22,'#f6a9b6',s*.3,.47,.06,head,3).rotation.z=-s*.28;return e});
 if(o.hat){const h=CO(.15,.34,o.hat,0,.55,0,head,12);h.rotation.z=-.18;SP(.045,'#ffffff',.03,.72,0,head)}
 if(o.collar){const tr=new THREE.Mesh(new THREE.TorusGeometry(.3,.05,8,18),lam(o.collar));tr.rotation.x=Math.PI/2;put(tr,0,.98,.14,mdl);
  if(o.bell)SP(.07,'#f2c14e',0,.9,.42,mdl,1,1,1)}
 const N=20,tail=[];for(let j=0;j<N;j++){const u=j/(N-1),k=1-.42*u;tail.push(SP(.1,j<6?o.body:o.pt,0,0,0,mdl,k,k,k))}
 let bt=rnd(2,5),bd=0,et=rnd(3,7),ed=0,look=0,lookT=0,slp=0,slpT=0;
 function upd(t,dt){
  body.scale.y=1.1+Math.sin(t*2.1)*.02;head.position.y=1.22+Math.sin(t*2.1)*.012;head.rotation.z=Math.sin(t*1.3)*.04;
  head.rotation.y+=(look-head.rotation.y)*Math.min(1,dt*4);
  bt-=dt;if(bt<=0&&!bd){bd=.13;bt=rnd(2.5,6)}if(bd>0){bd-=dt;eyes.scale.y=.12}else eyes.scale.y=1;
  slp+=(slpT-slp)*Math.min(1,dt*2.5);eyes.scale.y=Math.max(.08,eyes.scale.y*(1-slp));head.rotation.x=slp*.5;head.position.y-=slp*.28;mdl.scale.y=sc*(1-.15*slp);
  et-=dt;if(et<=0&&!ed){ed=.25;et=rnd(3,8)}if(ed>0){ed-=dt;ears[0].rotation.z=.28+Math.sin(ed*50)*.12}else ears[0].rotation.z=.28;
  for(let j=0;j<N;j++){const u=j/(N-1);tail[j].position.set(-.3-.38*Math.sin(u*2.4)+Math.sin(t*2.2+u*3)*.13*u,.2+.9*u-.2*u*u,-.38-.1*Math.sin(u*3))}}
 return{g,mdl,head,upd,setLook:a=>{look=clp(a,-.8,.8)},setSleep:v=>{slpT=v?1:0}}}

/* ---------- Miko + anak-anaknya ---------- */
const miko=mkCat({body:'#f3e6cf',pt:'#6b4a3a',belly:'#fff7e6',scale:.8,collar:'#e84a5f',bell:true,hat:'#f4a6c0'});
miko.g.position.set(bedP.x,.34,bedP.z);miko.g.rotation.y=.45;SR.add(miko.g);
let mkHop=0,mkTap=0,mkT=0,mkSay=0;
miko.g.userData.fn=()=>{if(mbOn){say3(miko.g,'zzz...');love(1,miko.g,ZT);return}const nw=Date.now();mkTap=nw-mkT<2000?mkTap+1:1;mkT=nw;mkHop=.5;meow(1);
 if(mkTap>=3){mkTap=0;love(6,miko.g);say3(miko.g,'purr~');return}love(2,miko.g);say3(miko.g,ASQ.miko.say[mkSay++%ASQ.miko.say.length])};
lact(miko.g,miko.g.userData.fn);
spark(miko.g,0,2.5,0);

const KR={x0:.5,x1:3.2,z0:-.9,z1:2.5};
const kits=(ASQ.kittens||[]).slice(0,5).map((k,i)=>{
 const c=mkCat({body:k.body,pt:k.pt,belly:'#fff7e6',scale:.4,head:1.18,collar:k.rib,hat:k.rib}),o={i,n:k.n,m:c,g:c.g,x:rnd(KR.x0,KR.x1),z:rnd(KR.z0,KR.z1),tx:0,tz:0,st:'idle',t:rnd(0,2),fy:rnd(-3,3),y:0,hv:0};
 SR.add(o.g);lact(o.g,()=>{o.hv=3.2;meow(1.7);love(1,o.g);say3(o.g,o.n+': mrew!')});return o});

/* bola benang: tap untuk menggelindingkan, anak-anak Miko mengejarnya */
const yarn=new THREE.Group();SR.add(yarn);const yb=SP(.2,'#f4a6c0',0,.2,0,yarn);
[[0,0],[Math.PI/2,0],[0,Math.PI/2]].forEach(([a,b])=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.2,.012,6,16),lam('#e57a9f'));r.rotation.set(a,b,0);r.position.y=.2;r.scale.setScalar(1.02);yarn.add(r)});
const yS=new THREE.Mesh(new THREE.CircleGeometry(.26,12),new THREE.MeshBasicMaterial({color:'#000',transparent:true,opacity:.2,depthWrite:false}));yS.rotation.x=-Math.PI/2;yS.position.y=.012;yarn.add(yS);
const Y={x:2.0,z:1.9,vx:0,vz:0,v:0};yarn.position.set(Y.x,0,Y.z);
lact(yarn,()=>{const a=rnd(0,6.28);Y.vx=Math.cos(a)*2.8;Y.vz=Math.sin(a)*2.8;meow(1.9)});

/* mainan: ikan kain & tikus. tap -> kabur zig-zag ~5 detik, anak-anak Miko mengejar */
const toys=[];
function mkToy(x,z,sp,build){const g=new THREE.Group();SR.add(g);build(g);
 const T={g,x,z,sp,t:0,tx:x,tz:z,w:0,h:0,ph:rnd(0,6)};g.position.set(x,0,z);
 lact(g,()=>{T.t=5;T.w=0;meow(sp>1.8?2:1.5);love(1,g)});spark(g,0,.85,0);toys.push(T);return T}
mkToy(1.0,2.0,1.7,b=>{SP(.2,'#ff9f5a',0,.16,0,b,1.5,.8,.7);const t=CO(.14,.26,'#ff7a3d',-.34,.16,0,b,3);t.rotation.z=-Math.PI/2;
 [-1,1].forEach(s=>SP(.035,'#1a1a3a',.2,.22,s*.11,b));SP(.05,'#ffd0a0',.05,.27,0,b,1.4,.5,.5)});
mkToy(2.9,.1,2.1,b=>{SP(.16,'#b9b9c9',0,.14,0,b,1.4,.9,.9);SP(.07,'#b9b9c9',.2,.15,0,b,1,.9,.9);
 [-1,1].forEach(s=>{SP(.06,'#f6a9b6',.17,.26,s*.09,b,.5,1,1);SP(.025,'#1a1a3a',.26,.18,s*.04,b)});SP(.03,'#f29aab',.29,.15,0,b);
 for(let j=0;j<5;j++)SP(.025,'#f6a9b6',-.24-j*.08,.05+.02*Math.sin(j),0,b)});

/* ---------- kotak musik (meja kecil dekat jendela) ---------- */
const mbx=new THREE.Group();mbx.position.set(-3.8,0,1.9);SR.add(mbx);
CY(.28,.3,.05,'#5a3b22',0,.03,0,mbx,16);CY(.06,.06,.58,'#5a3b22',0,.3,0,mbx,8);CY(.4,.4,.06,'#8a5e30',0,.63,0,mbx,20);
B(.62,.26,.46,'#f4a6c0',0,.79,0,mbx);B(.66,.04,.5,'#e57a9f',0,.93,0,mbx);B(.54,.01,.38,'#7a3b52',0,.955,0,mbx);
const mbLid=new THREE.Group();mbLid.position.set(0,.95,-.23);mbLid.rotation.x=-1.8;mbx.add(mbLid);
B(.64,.04,.48,'#f9dfe5',0,0,.24,mbLid);SP(.05,'#e84a5f',0,.03,.24,mbLid,1.2,.5,1.2);
const mbDancer=new THREE.Group();mbDancer.position.set(0,.96,.02);mbx.add(mbDancer);
CY(.06,.06,.02,'#f2c14e',0,0,0,mbDancer,12);CO(.1,.15,'#ffffff',0,.09,0,mbDancer,12);
SP(.06,'#f3e6cf',0,.2,0,mbDancer);SP(.04,'#6b4a3a',0,.2,.035,mbDancer,1,.8,.8);
[-1,1].forEach(sd=>CO(.025,.06,'#6b4a3a',sd*.04,.27,0,mbDancer,3));SP(.025,'#e84a5f',.05,.13,.05,mbDancer);B(.14,.02,.02,'#f3e6cf',0,.14,0,mbDancer);
const mbCrank=new THREE.Group();mbCrank.position.set(.37,.79,0);mbx.add(mbCrank);
CY(.015,.015,.14,'#f2c14e',0,0,0,mbCrank,8).rotation.z=Math.PI/2;CY(.012,.012,.1,'#f2c14e',.07,.05,0,mbCrank,8);SP(.03,'#f2c14e',.07,.1,0,mbCrank);
spark(mbx,0,1.55,0);

const MEL=[[76,1],[79,1],[81,2],[79,1],[76,1],[74,2],[72,1],[74,1],[76,2],[74,1],[72,1],[69,2],[67,1],[69,1],[72,2],[74,1],[76,1],[74,2],[72,4],[0,2]];
let mbOn=false,mbT=0,mbStep=0,mbTimer=0,mbAudio=null,mbAC=null;
function mbNote(m){if(!m||!mbAC)return;const t=mbAC.currentTime,f=440*Math.pow(2,(m-69)/12);
 [[1,.16,1.6],[2.76,.05,.5],[5.4,.02,.25]].forEach(([r,v,d])=>{const o=mbAC.createOscillator(),g=mbAC.createGain();o.type='sine';o.frequency.value=f*r;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(mbAC.destination);o.start(t);o.stop(t+d+.1)})}
function mbSynth(){try{mbAC=mbAC||new(window.AudioContext||window.webkitAudioContext)();if(mbAC.state==='suspended')mbAC.resume()}catch(e){return}
 mbStep=0;(function nx(){if(!mbOn)return;const n=MEL[mbStep++%MEL.length];mbNote(n[0]);mbTimer=setTimeout(nx,n[1]*420)})()}
function mbStart(){if(mbOn)return;mbOn=true;mbT=0;radioPause();
 const src=ASQ.musicbox&&ASQ.musicbox.src,fb=()=>{mbAudio=null;if(mbOn)mbSynth()};
 if(src){const a=new Audio(src);a.loop=true;a.volume=.7;mbAudio=a;a.onerror=fb;const p=a.play();if(p&&p.catch)p.catch(fb)}else mbSynth()}
function mbStop(){if(!mbOn)return;mbOn=false;clearTimeout(mbTimer);if(mbAudio){mbAudio.pause();mbAudio=null}radioBack()}
lact(mbx,()=>{if(mbOn)mbStop();else{mbStart();meow(1.3)}});

/* ---------- set PC (dinding belakang, tengah): tap komputer = ganti layar, tap kursi = berputar ---------- */
const PCF=ASQ.pc||{};
const pcG=new THREE.Group();pcG.position.set(.2,0,-3.3);SR.add(pcG);
const monG=new THREE.Group();pcG.add(monG);const kbG=new THREE.Group();pcG.add(kbG);
const BX=(w,h,d,c,x,y,z,p)=>put(new THREE.Mesh(new THREE.BoxGeometry(w,h,d),bas(c)),x,y,z,p);
const pcRGB=[],pcFans=[],rgbM=(m,o)=>{m.userData.o=o;pcRGB.push(m);return m};
/* meja */
B(2.4,.08,.9,'#2b2f4a',0,.95,0,pcG);[[-1.1,-.38],[1.1,-.38],[-1.1,.38],[1.1,.38]].forEach(([x,z])=>B(.1,.9,.1,'#1c1f33',x,.45,z,pcG));
B(2.2,.4,.03,'#1c1f33',0,.72,-.42,pcG);
rgbM(BX(2.2,.025,.03,'#ff6bd6',0,.9,.43,pcG),0);rgbM(BX(2.2,.025,.03,'#ff6bd6',0,.9,-.43,pcG),.3);
/* monitor */
CY(.28,.3,.03,'#1c1f33',0,1.005,-.08,monG,16);B(.1,.35,.06,'#1c1f33',0,1.2,-.15,monG);
B(1.3,.78,.06,'#12141f',0,1.65,-.18,monG);
const pcC=document.createElement('canvas');pcC.width=192;pcC.height=108;
const pcT=new THREE.CanvasTexture(pcC);pcT.magFilter=pcT.minFilter=THREE.NearestFilter;
put(new THREE.Mesh(new THREE.PlaneGeometry(1.2,.675),new THREE.MeshBasicMaterial({map:pcT})),0,1.65,-.145,monG);
SP(.015,'#6bff9b',.55,1.3,-.145,monG,1,1,1,true);
const pcL=new THREE.PointLight('#8fb4ff',.7,5);pcL.position.set(.2,1.75,-2.6);SR.add(pcL);
/* plush Miko di atas monitor */
SP(.1,'#f3e6cf',.5,2.1,-.18,pcG,1,.9,.9);SP(.08,'#6b4a3a',.5,2.23,-.16,pcG);[-1,1].forEach(sd=>CO(.03,.07,'#6b4a3a',.5+sd*.05,2.31,-.18,pcG,3));
/* keyboard, mouse, mousepad */
B(1.7,.01,.5,'#3b2a6e',.05,.995,.2,kbG);
B(.8,.03,.28,'#1c1f33',-.1,1.015,.2,kbG);B(.74,.012,.22,'#3a3f66',-.1,1.036,.2,kbG);rgbM(BX(.76,.006,.012,'#ff6bd6',-.1,1.034,.315,kbG),.6);
B(.1,.035,.16,'#1c1f33',.75,1.018,.2,kbG);rgbM(BX(.02,.005,.1,'#6bd6ff',.75,1.038,.2,kbG),.8);
/* headset & mug */
{const hb=new THREE.Mesh(new THREE.TorusGeometry(.13,.02,8,16,Math.PI),lam('#e84a5f'));put(hb,-.95,1.0,.1,pcG);
 [-1,1].forEach(sd=>{const c=CY(.06,.06,.05,'#e84a5f',-.95+sd*.13,1.02,.1,pcG,12);c.rotation.z=Math.PI/2})}
CY(.06,.055,.1,'#f9dfe5',.95,1.04,-.12,pcG,12);
/* tower PC di samping meja */
B(.5,1.0,.85,'#1c1f33',1.55,.5,0,pcG);B(.46,.92,.02,'#0e1020',1.55,.5,.43,pcG);
[.78,.5,.22].forEach((y,i)=>{const fg=new THREE.Group();fg.position.set(1.55,y,.445);pcG.add(fg);
 rgbM(new THREE.Mesh(new THREE.TorusGeometry(.1,.018,6,16),new THREE.MeshBasicMaterial({color:'#6bd6ff'})),i*.18);fg.add(pcRGB[pcRGB.length-1]);
 [0,1,2].forEach(k=>{const b=B(.17,.025,.01,'#8fa0d0',0,0,0,fg);b.rotation.z=k*Math.PI/3});pcFans.push(fg)});
spark(pcG,0,2.55,-.1);

/* layar */
const CATP={rows:['.DD........DD.','DDDD......DDDD','DDDDCCCCCCDDDD','.DCCCCCCCCCCD.','.CCBBCCCCBBCC.','.CCBBCCCCBBCC.','.CCCCCDDCCCCC.','.CCCCDDDDCCCC.','..CCCCDDCCCC..','...CCCCCCCC...','....CCCCCC....'],pal:{D:'#6b4a3a',C:'#f3e6cf',B:'#5ab8ff'}};
let pcS=0,pcMin=-1,chSpin=0;
function pcWrap(g,txt,mw){const out=[];let ln='';String(txt||'').split(/\s+/).forEach(w=>{const t=ln?ln+' '+w:w;if(g.measureText(t).width>mw&&ln){out.push(ln);ln=w}else ln=t});if(ln)out.push(ln);return out}
function pcDraw(){const g=pcC.getContext('2d'),w=192,h=108,d=new Date(),pad=n=>String(n).padStart(2,'0');
 if(pcS===3){g.fillStyle='#05060c';g.fillRect(0,0,w,h);pcT.needsUpdate=true;pcL.intensity=0;return}
 pcL.intensity=.7;g.textBaseline='alphabetic';
 if(pcS===2){gDraw();pcT.needsUpdate=true;return}
 if(pcS===0){['#2a2860','#322f72','#3b3784','#4a449a','#5b55a6'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,i*19,w,19)});
  g.fillStyle='#fff';[[10,8],[40,20],[150,10],[170,30],[24,60],[160,70],[100,6],[130,52]].forEach(([x,y])=>g.fillRect(x,y,2,2));
  CATP.rows.forEach((r,y)=>[...r].forEach((ch,x)=>{if(CATP.pal[ch]){g.fillStyle=CATP.pal[ch];g.fillRect(61+x*5,16+y*5,5,5)}}));
  g.fillStyle='#1c1f33';g.fillRect(0,96,w,12);g.fillStyle='#f4a6c0';g.fillRect(2,98,14,8);
  g.font='7px "Press Start 2P",monospace';g.textAlign='left';g.fillStyle='#fff';g.fillText(String(PCF.name||'AQSA-PC').slice(0,12),21,105);
  g.textAlign='right';g.fillText(pad(d.getHours())+':'+pad(d.getMinutes()),188,105)}
 else{g.fillStyle='#0d1538';g.fillRect(0,0,w,h);g.fillStyle='#fff8e7';g.fillRect(8,8,176,92,'#fff8e7');g.fillStyle='#f4a6c0';g.fillRect(8,8,176,12);
  g.font='7px "Press Start 2P",monospace';g.textAlign='left';g.fillStyle='#fff';g.fillText('pesan',13,17);g.fillStyle='#2e527f';
  pcWrap(g,PCF.msg||'halo Aqsa!',164).slice(0,7).forEach((l,i)=>g.fillText(l,14,34+i*11))}
 pcT.needsUpdate=true}
pcDraw();if(document.fonts)document.fonts.ready.then(pcDraw);

/* kursi gaming (tap = berputar) */
const chG=new THREE.Group();chG.position.set(.2,0,-2.3);SR.add(chG);
CY(.38,.38,.04,'#1c1f33',0,.1,0,chG,5);CY(.04,.04,.4,'#4a4f78',0,.3,0,chG,8);
for(let k=0;k<5;k++){const a=k*Math.PI*2/5;SP(.05,'#0e1020',Math.sin(a)*.36,.05,Math.cos(a)*.36,chG)}
B(.72,.1,.7,'#e84a5f',0,.52,0,chG);B(.72,.9,.12,'#e84a5f',0,1.02,.32,chG);B(.5,.25,.1,'#1c1f33',0,1.62,.34,chG);
[-1,1].forEach(sd=>{B(.08,.06,.45,'#1c1f33',sd*.4,.78,0,chG);B(.06,.25,.06,'#1c1f33',sd*.4,.65,.1,chG);B(.1,.7,.14,'#1c1f33',sd*.31,1.02,.32,chG)});
lact(chG,()=>{chSpin=Math.PI*2;meow(1.4)});

/* ---------- Aqsa (avatar khusus kamar rahasia): berdiri & jalan-jalan keliling kamar; tap = melambai ---------- */
const AQ=Object.assign({hair:'short',hairColor:'#2b1b2e',skin:'#f6d3b8',shirt:'#7aa7e8',pants:'#3b4a7a',shoes:'#f2f2f2',hijab:'#f4a6c0',glasses:false,catEars:false,say:['hai!','yey, ulang tahun!']},ASQ.aqsa||{});
CY(.5,.5,.1,'#f4a6c0',-3.05,.05,-.2,SR,18);CY(.14,.14,.12,'#e57a9f',-3.05,.05,-.2,SR,10);
const av=new THREE.Group();av.position.set(-2.9,0,.1);av.scale.setScalar(.95);SR.add(av);
const dkc=(c,k)=>new THREE.Color(c).multiplyScalar(k);
/* badan kotak-kotak: gaya & proporsi sama dengan Aqsa/pengunjung di ruang utama */
const aqTor=B(.5,.55,.32,AQ.shirt,0,.78,0,av);
const mkLeg=sd=>{const g=new THREE.Group();g.position.set(sd*.14,.5,0);av.add(g);B(.2,.5,.2,AQ.pants,0,-.25,0,g);B(.22,.1,.28,AQ.shoes,0,-.45,.03,g);return g};
const legL=mkLeg(-1),legR=mkLeg(1);
const mkArm=sd=>{const g=new THREE.Group();g.position.set(sd*.345,1.03,0);av.add(g);B(.15,.28,.15,AQ.shirt,0,-.14,0,g);B(.13,.26,.13,AQ.skin,0,-.41,0,g);return g};
const armL=mkArm(-1),armR=mkArm(1);
/* kepala */
const head=new THREE.Group();head.position.set(0,1.31,0);av.add(head);
B(.5,.5,.46,AQ.skin,0,0,0,head);
const aqEyes=new THREE.Group();aqEyes.position.set(0,.03,.235);head.add(aqEyes);
[-1,1].forEach(sd=>{B(.07,.1,.02,'#1c2f78',sd*.12,0,0,aqEyes);B(.09,.05,.015,'#f6a3b3',sd*.17,-.1,0,aqEyes)});
B(.1,.04,.02,'#e07a8a',0,-.12,.235,head);
const hc=AQ.hairColor;
if(AQ.hair==='hijab'){const hj=AQ.hijab;
 B(.6,.12,.56,hj,0,.3,0,head);B(.6,.62,.14,hj,0,-.04,-.27,head);[-1,1].forEach(sd=>B(.08,.55,.5,hj,sd*.29,-.02,-.01,head));
 B(.52,.1,.06,hj,0,.25,.24,head);B(.62,.3,.4,hj,0,-.3,0,head)}
else{B(.56,.14,.52,hc,0,.29,0,head);B(.54,.3,.1,hc,0,.15,-.24,head);B(.56,.14,.06,hc,0,.19,.24,head);
 [-1,1].forEach(sd=>B(.06,.34,.46,hc,sd*.27,.12,-.02,head));   /* rambut samping (temple) supaya tidak terlihat botak */
 if(AQ.hair==='long'){B(.58,.6,.12,hc,0,-.05,-.26,head);[-1,1].forEach(sd=>B(.06,.45,.4,hc,sd*.29,-.02,-.03,head))}
 if(AQ.hair==='bun')B(.2,.2,.2,hc,0,.44,-.05,head)}
if(AQ.catEars)[-1,1].forEach(sd=>{B(.12,.16,.08,'#f4a6c0',sd*.17,.46,0,head)});
if(AQ.glasses){[-1,1].forEach(sd=>{const r=new THREE.Mesh(new THREE.TorusGeometry(.09,.015,6,12),lam('#2a2a3a'));put(r,sd*.12,.03,.245,head)});B(.06,.015,.015,'#2a2a3a',0,.04,.245,head)}
/* topi ulang tahun (piramida kotak) */
{const hat=CO(.17,.42,'#f2c14e',0,.55,0,head,4);hat.rotation.y=Math.PI/4;B(.06,.06,.06,'#ffffff',0,.78,0,head)}
let aqW=0,aqS=0,aqBl=2;
/* ---------- Aqsa jalan-jalan: pilih titik tujuan yang jalurnya bebas, jalan ke sana, berhenti & menghadap sesuatu ---------- */
const aqBlk=(x,z)=>x<-4.3||x>4.3||z<-3.5||z>3.3||Math.hypot(x+1.7,z-.6)<1.25||Math.hypot(x+3.8,z-1.9)<.65||(x<-1.9&&z<-1.95)||(x>2.4&&z<-1.95)||(x>-1.2&&x<2.2&&z<-1.7)||Math.hypot(x-3.95,z-.9)<.9||Math.hypot(x-4,z-2.7)<.85;
const aqClear=(x0,z0,x1,z1)=>{const d=Math.hypot(x1-x0,z1-z0),n=Math.ceil(d/.12);for(let i=0;i<=n;i++){const u=i/n;if(aqBlk(x0+(x1-x0)*u,z0+(z1-z0)*u))return false}return true};
/* [x, z, menghadap x, menghadap z]: tepi kasur Miko, area anak kucing, depan foto, lemari, meja surat, kotak musik, papan hari, karpet */
const AP=[[-2.9,0,-1.7,.6],[0,1.3,1.8,.8],[0,-1.2,0,-3.3],[3.4,-1.4,3.4,-2.7],[-3.1,-1.4,-3.1,-2.7],[-3.3,1.2,-3.8,1.9],[-3.9,-.6,-4.9,-.6],[2.2,.2,2.2,1.5]];
const AW={x:-2.9,z:.1,tx:-2.9,tz:.1,st:'idle',t:2,ph:0,a:0,h:Math.atan2(1.2,.5),poi:0,face:[AP[0][2],AP[0][3]]};
av.rotation.y=AW.h;
function aqPick(){for(let n=0;n<12;n++){const i=(Math.random()*AP.length)|0;if(i===AW.poi)continue;const p=AP[i];
  if(aqClear(AW.x,AW.z,p[0],p[1])){AW.poi=i;AW.tx=p[0];AW.tz=p[1];AW.face=[p[2],p[3]];AW.st='walk';return}}AW.t=1}
function aqUpd(t,dt){
 aqW=Math.max(0,aqW-dt);aqBl-=dt;let e=1;if(aqBl<0){e=.1;if(aqBl<-.13)aqBl=rnd(2,5)}if(mbOn)e=.1;aqEyes.scale.y=e;
 let wk=0,dh=null;
 if(aqW>0)dh=0;                       /* melambai: menghadap penonton */
 else if(mbOn){}                      /* kotak musik main: diam & bergoyang pelan */
 else if(AW.st==='walk'){const dx=AW.tx-AW.x,dz=AW.tz-AW.z,d=Math.hypot(dx,dz);
  if(d<.06){AW.st='idle';AW.t=rnd(2.5,5.5)}
  else{const s=Math.min(d,.85*dt);AW.x+=dx/d*s;AW.z+=dz/d*s;dh=Math.atan2(dx,dz);wk=1}}
 else{AW.t-=dt;dh=Math.atan2(AW.face[0]-AW.x,AW.face[1]-AW.z);if(AW.t<=0)aqPick()}
 if(dh!==null){let da=dh-AW.h;da=Math.atan2(Math.sin(da),Math.cos(da));AW.h+=da*Math.min(1,dt*6)}
 AW.ph+=dt*7*wk;AW.a+=(wk-AW.a)*Math.min(1,dt*8);
 const sw=Math.sin(AW.ph)*.6*AW.a;legL.rotation.x=sw;legR.rotation.x=-sw;
 armL.rotation.x=-sw*.8+Math.sin(t*1.6)*.03;armL.rotation.z=-.08;
 if(aqW>0){armR.rotation.x=0;armR.rotation.z=2.5+Math.sin(t*9)*.3}
 else{armR.rotation.x=sw*.8+Math.sin(t*1.6+1)*.03;armR.rotation.z=.08}
 aqTor.scale.y=1+Math.sin(t*2)*.012;
 av.position.set(AW.x,Math.abs(Math.sin(AW.ph))*.05*AW.a,AW.z);
 av.rotation.y=AW.h;av.rotation.z=mbOn?Math.sin(t*1.5)*.06:0}

/* ============ DEKORASI ULANG TAHUN ============ */
const BDf=[],BDb=[],BDfl=[];
const rope=(g,x0,y0,z0,x1,y1,z1)=>{const d=new THREE.Vector3(x1-x0,y1-y0,z1-z0),l=d.length(),m=new THREE.Mesh(new THREE.CylinderGeometry(.009,.009,l,4),bas('#d9dff0'));
 m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(m)};
/* bendera HAPPY BIRTHDAY di tali lampu belakang */
{const W='HAPPYBIRTHDAY',cl=['#f4a6c0','#9fd8ff','#ffd95a','#c9a8ff','#a8e6b0'],lineY=x=>4.82-.2*Math.sin(((x+4.6)/9.2)*Math.PI*3)*.7-.1;
 for(let i=0;i<=40;i++){const x=-4.6+i*.23;B(.25,.016,.016,'#e8dcc0',x,lineY(x)-.03,-3.86)}
 for(let i=0;i<13;i++){const x=-4.0+i*.58+(i>=5?.5:0),c=cl[i%5],ch=W[i];
  const tx=ctex(32,36,g=>{g.fillStyle=c;g.beginPath();g.moveTo(1,1);g.lineTo(31,1);g.lineTo(16,35);g.closePath();g.fill();g.fillStyle='#ffffff';g.textAlign='center';g.font='bold 16px monospace';g.fillText(ch,16,16)});
  const gm=new THREE.PlaneGeometry(.5,.56);gm.translate(0,-.28,0);
  const f=new THREE.Mesh(gm,new THREE.MeshBasicMaterial({map:tx,transparent:true,side:THREE.DoubleSide}));f.position.set(x,lineY(x)-.04,-3.84);SR.add(f);f.userData.p=i*.7;BDf.push(f)}}
/* seikat balon di sudut ruangan */
function mkBalloons(x,z,cols){const g=new THREE.Group();g.position.set(x,0,z);SR.add(g);B(.2,.1,.2,'#8a5e30',0,.05,0,g);
 cols.forEach((c,i)=>{const a=i*2.4+.5,r=.2+.06*(i%2),h=2.35+((i*37)%5)*.15,bx=Math.cos(a)*r,bz=Math.sin(a)*r;
  SP(.27,c,bx,h,bz,g,1,1.2,1);const hl=SP(.055,'#ffffff',bx-.1,h+.1,bz+.17,g,1,1.5,.5,true);hl.material.transparent=true;hl.material.opacity=.7;
  rope(g,0,.1,0,bx,h-.33,bz)});
 g.userData.p=x+z;BDb.push(g)}
mkBalloons(-4.5,2.8,['#f4a6c0','#9fd8ff','#ffd95a','#c9a8ff','#a8e6b0']);
mkBalloons(4.5,-1.4,['#ffd95a','#f4a6c0','#9fd8ff','#c9a8ff']);
mkBalloons(-4.5,-3.3,['#9fd8ff','#c9a8ff','#f4a6c0','#ffd95a']);
/* meja kue + kue + lilin (tap = tiup lilin) */
const ckG=new THREE.Group();ckG.position.set(3.95,0,.9);SR.add(ckG);
CY(.34,.36,.05,'#5a3b22',0,.03,0,ckG,16);CY(.07,.07,.9,'#8a5e30',0,.48,0,ckG,8);CY(.64,.64,.06,'#a8743f',0,.93,0,ckG,24);CY(.66,.66,.025,'#f4a6c0',0,.965,0,ckG,24);
const cake2=new THREE.Group();cake2.position.set(0,.98,0);ckG.add(cake2);
CY(.5,.52,.05,'#ffffff',0,.025,0,cake2,24);CY(.43,.43,.22,'#5b9bee',0,.16,0,cake2,24);CY(.45,.45,.05,'#8dbdf7',0,.3,0,cake2,24);
CY(.3,.3,.2,'#a9cdf9',0,.42,0,cake2,24);CY(.32,.32,.045,'#ffffff',0,.55,0,cake2,24);
const flm=[];[['#8fd0f0',-.12,.03],['#f2c14e',.12,.06],['#a98bd6',0,-.14]].forEach(([c,x,z])=>{CY(.022,.022,.2,c,x,.67,z,cake2,8);
 const f=new THREE.Mesh(new THREE.ConeGeometry(.04,.12,6),bas('#ffd24a'));f.position.set(x,.84,z);cake2.add(f);flm.push(f)});
let cakeLit=true;
lact(ckG,()=>{
 if(cakeLit){cakeLit=false;flm.forEach(f=>f.visible=false);if(typeof confetti==='function')confetti();love(5,ckG);meow(1.2);say3(ckG,'make a wish!');
  setTimeout(()=>{openM(`<h2>make a wish!</h2><p>${esc(ASQ.cakeMsg||'')}</p><div class="row"><button class="btn alt" id="sqagain">nyalakan lagi</button></div>`);
   const b=$('#sqagain');if(b)b.onclick=()=>{cakeLit=true;flm.forEach(f=>f.visible=true);closeM()}},500)}
 else{cakeLit=true;flm.forEach(f=>f.visible=true);say3(ckG,'lilinnya nyala lagi~')}});
spark(ckG,0,1.95,0);
/* gambar pixel untuk isi kado: Miko, anak-anaknya, dan foto keluarga (digambar lewat kode, tanpa file) */
const CPX=['PP........PP','PPP......PPP','PPBBBBBBBBPP','.BBBBBBBBBB.','.BBEKBBKEBB.','.BBPPWWPPBB.','.BPPPNNPPPB.','..BPPPPPPB..','...BBBBBB...','..RRRRRRRR..','.BBBWWWWBBB.','.BBBWWWWBBB.','.BBBWWWWBBB.','.PBBWWWWBBP.','.PPBBWWBBPP.','.PPP....PPP.'];
function pxCat(g,x,y,s,c){const pal={B:c.body,P:c.pt,W:'#fff7e6',E:'#5ab8ff',K:'#1a1a3a',N:'#f29aab',R:c.rib};
 [[12,14],[12,13],[13,12],[13,11],[13,10]].forEach(([i,j])=>{g.fillStyle=c.pt;g.fillRect(x+i*s,y+j*s,s,s)});
 CPX.forEach((r,j)=>[...r].forEach((ch,i)=>{if(pal[ch]){g.fillStyle=pal[ch];g.fillRect(x+i*s,y+j*s,s,s)}}));
 if(c.hat){for(let k=0;k<4;k++){g.fillStyle=k%2?'#ffffff':c.hat;g.fillRect(x+(5-k)*s,y+(k-4)*s,(2+2*k)*s,s)}g.fillStyle='#ffffff';g.fillRect(x+5*s,y-5*s,2*s,s)}}
const GSZ={miko:[240,270],kittens:[300,190],family:[360,230]};
function giftArt(kind,cv){const g=cv.getContext('2d'),W=cv.width,H=cv.height,K=ASQ.kittens||[],fl=H-30;g.imageSmoothingEnabled=false;
 g.fillStyle='#4f4a98';g.fillRect(0,0,W,H);
 for(let i=0;i<26;i++){const x=(i*67+13)%W,y=(i*41+7)%(fl-10);g.fillStyle=i%3?'#f4e3a0':'#ffffff';g.fillRect(x,y,2,2);if(i%4===0){g.fillRect(x-2,y,6,2);g.fillRect(x,y-2,2,6)}}
 g.fillStyle='#e6cfa6';g.fillRect(0,fl,W,30);g.fillStyle='#c9ad82';g.fillRect(0,fl,W,3);
 g.textAlign='center';g.textBaseline='alphabetic';
 const kc=k=>({body:k.body,pt:k.pt,rib:k.rib,hat:k.rib}),mk={body:'#f3e6cf',pt:'#6b4a3a',rib:'#e84a5f',hat:'#f4a6c0'};
 const tx=(t,x,y,sz,c)=>{g.font=sz+'px "Press Start 2P",monospace';g.fillStyle='#1f3a5f';g.fillText(t,x+1,y+1);g.fillStyle=c;g.fillText(t,x,y)};
 if(kind==='miko'){pxCat(g,(W-144)/2,fl-192+4,12,mk);tx('Miko',W/2,H-10,10,'#1f3a5f')}
 else if(kind==='kittens'){const n=Math.min(K.length,5)||1,w=n*72+(n-1)*8,x0=(W-w)/2;
  K.slice(0,5).forEach((k,i)=>{pxCat(g,x0+i*80,fl-96+2,6,kc(k));tx(String(k.n||'').slice(0,8),x0+i*80+36,H-10,8,'#1f3a5f')})}
 else{const L=Math.ceil(Math.min(K.length,4)/2);
  K.slice(0,4).forEach((k,i)=>{const left=i<L,j=left?i:i-L,x=left?132-(j+1)*54:234+j*54;pxCat(g,x,fl-64+2,4,kc(k))});
  pxCat(g,(W-96)/2,fl-128+3,8,mk);tx('happy birthday, Aqsa!',W/2,24,11,'#ffd95a')}
 g.fillStyle='#e84a5f';[[12,12],[W-24,40],[20,fl-40],[W-18,fl-22]].forEach(([x,y])=>{g.fillRect(x,y,4,4);g.fillRect(x+6,y,4,4);g.fillRect(x+1,y+4,8,3);g.fillRect(x+3,y+7,4,2)})}
/* kado */
(ASQ.gifts||[]).slice(0,3).forEach((gf,i)=>{const o=new THREE.Group(),P=[[3.7,2.9],[4.3,2.5],[4.05,3.05]][i];o.position.set(P[0],0,P[1]);o.rotation.y=(i-1)*.4;SR.add(o);
 const sz=[.55,.45,.38][i];B(sz,sz*.8,sz,gf.c,0,sz*.4,0,o);B(sz+.02,sz*.8+.01,.1,gf.r,0,sz*.4,0,o);B(.1,sz*.8+.01,sz+.02,gf.r,0,sz*.4,0,o);
 B(.2,.1,.1,gf.r,-.07,sz*.8+.05,0,o).rotation.z=.4;B(.2,.1,.1,gf.r,.07,sz*.8+.05,0,o).rotation.z=-.4;
 lact(o,()=>{love(2,o);meow(1.6);const z=GSZ[gf.art];
  openM(`<h2>kado ${i+1}</h2>${z?`<canvas id="sqgc" width="${z[0]}" height="${z[1]}" style="max-width:100%;height:auto;display:block;margin:0 auto 8px;border:3px solid #1f3a5f;image-rendering:pixelated"></canvas>`:''}<p>${esc(gf.t||'')}</p>${z?'<a class="btn alt" id="sqdl" download="kado-aqsa.png" style="text-decoration:none">simpan gambar</a>':''}`);
  if(z){const cv=$('#sqgc');if(cv){giftArt(gf.art,cv);const a=$('#sqdl');if(a)a.href=cv.toDataURL('image/png')}}});if(i===0)spark(o,0,1,0)});
/* konfeti di lantai */
{const cc=['#f4a6c0','#9fd8ff','#ffd95a','#c9a8ff','#a8e6b0','#ff9f5a'];let k=0;
 for(let n=0;n<400&&k<70;n++){const x=rnd(-4.6,4.6),z=rnd(-3.4,3.6);if(aqBlk(x,z)||Math.hypot(x-3.95,z-.9)<.8)continue;
  const m=B(.13,.008,.07,cc[k%6],x,.075,z);m.rotation.y=rnd(0,6.28);k++}}
function bdUpd(t){BDf.forEach(f=>f.rotation.z=Math.sin(t*1.6+f.userData.p)*.06);BDb.forEach(g=>{g.rotation.z=Math.sin(t*.9+g.userData.p)*.03;g.rotation.x=Math.cos(t*.8+g.userData.p)*.025});
 flm.forEach((f,i)=>{f.scale.set(1+Math.sin(t*14+i*2)*.12,1+Math.sin(t*11+i)*.18,1)})}
lact(av,()=>{if(mbOn){say3(av,'zzz...');love(1,av,ZT);return}aqW=2.4;mkHop=.5;love(3,av);say3(av,AQ.say[aqS++%AQ.say.length])});

/* ---------- game mini di layar PC: tangkap monster (karakter orisinal) ----------
   tap layar = lempar bola (waktunya pas saat monster lewat tengah), tap keyboard = ganti layar/keluar */
const GSPR=[
 {n:'Bolu',sp:48,pal:{b:'#f7a8c8',k:'#2b1b3a',a:'#ff6f9c'},rows:['....bbbb....','..bbbbbbbb..','.bbbbbbbbbb.','.bbkbbbbkbb.','.bbkbbbbkbb.','.baabbbbaab.','.bbbbkkbbbb.','.bbbbbbbbbb.','..bbbbbbbb..','...bb..bb...']},
 {n:'Kuki',sp:70,pal:{b:'#e8c07a',k:'#5a3b22',a:'#d96a4a'},rows:['.bb......bb.','.bbb....bbb.','.bbbbbbbbbb.','.bbkbbbbkbb.','.bbkbbbbkbb.','.bbbbaabbbb.','.bbbbbbbbbb.','..bkbbbkbb..','..bbbbbbbb..','..bb....bb..']},
 {n:'Bintang',sp:95,pal:{b:'#ffd95a',k:'#5a3b22',a:'#ff9f3d'},rows:['.....bb.....','....bbbb....','bbbbbbbbbbbb','.bbkbbbbkbb.','..bkbbbbkb..','...bbaabb...','..bbbbbbbb..','.bbb....bbb.','bb........bb']}];
const GBALL={pal:{b:'#4f7fb8',g:'#f2c14e',w:'#ffffff',c:'#fff8e7'},rows:['..bbbb..','.bbbbbb.','bbbbbbbb','gggwwggg','cccwwccc','cccccccc','.cccccc.','..cccc..']};
const ZT=pixT(['zzzzz','...z.','..z..','.z...','zzzzz'],{z:'#cfe0ff'},4);
let mbZ=0,zc=0;
const G={st:'title',idx:0,balls:3,caught:0,cx:40,cy:44,dir:1,bx:96,by:82,ct:0,msg:'',mt:0,tt:0};
function gReset(){G.st='title';G.idx=0;G.balls=3;G.caught=0;G.cx=40;G.cy=44;G.dir=1;G.mt=0;G.msg=''}
function gTap(){
 if(G.st==='title'){G.st='play';G.idx=0;G.balls=3;G.caught=0;G.cx=40;G.dir=1;G.msg='';G.mt=0}
 else if(G.st==='play'){G.st='throw';G.bx=96;G.by=82}
 else if(G.st==='lose'){G.st='play';G.balls=3;G.cx=40;G.cy=44;G.dir=1;G.msg='';G.mt=0}
 else if(G.st==='win'){gReset();pcS=(pcS+1)%4;pcMin=-1;pcDraw()}}
function gStep(dt){G.tt+=dt;if(G.mt>0)G.mt-=dt;const sp=GSPR[Math.min(G.idx,2)].sp,st=G.st;
 if(st==='play'||st==='throw'){G.cx+=G.dir*sp*dt;if(G.cx>166){G.cx=166;G.dir=-1}if(G.cx<26){G.cx=26;G.dir=1}G.cy=44+Math.sin(G.tt*3)*3}
 if(st==='throw'){G.by-=110*dt;if(G.by<=G.cy+10){if(Math.abs(96-G.cx)<12){G.st='catch';G.ct=0}else{G.balls--;G.msg='meleset!';G.mt=.7;G.st=G.balls<=0?'lose':'play'}}}
 else if(st==='catch'){G.ct+=dt;if(G.ct>1.8){G.caught++;G.idx++;if(G.idx>=3)G.st='win';else{G.st='play';G.balls=3;G.cx=40;G.dir=1;G.msg='monster baru!';G.mt=.9}}}
 else if(st==='lose'){G.cx+=G.dir*200*dt}}
function gSpr(g,sp,x,y,sc){sp.rows.forEach((r,j)=>[...r].forEach((ch,i)=>{const c=sp.pal[ch];if(c){g.fillStyle=c;g.fillRect(Math.round(x+i*sc),Math.round(y+j*sc),sc,sc)}}))}
const gTx=(g,t,x,y,c,al)=>{g.textAlign=al||'left';g.fillStyle='#1f3a5f';g.fillText(t,x+1,y+1);g.fillStyle=c||'#fff';g.fillText(t,x,y)};
function gDraw(){const g=pcC.getContext('2d'),w=192,st=G.st,S0=GSPR[Math.min(G.idx,2)];
 g.globalAlpha=1;g.textBaseline='alphabetic';g.font='7px "Press Start 2P",monospace';
 ['#9fd8ff','#aee0ff','#bfe8ff','#d3f0ff'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(0,i*17,w,17)});
 g.fillStyle='#fff';[[20,10,22],[120,18,26],[70,34,18]].forEach(([x,y,l])=>{g.fillRect(x,y,l,5);g.fillRect(x+4,y-3,l-10,3)});
 g.fillStyle='#5fbf6a';g.fillRect(0,68,w,40);g.fillStyle='#4fa85a';g.fillRect(0,68,w,3);
 g.fillStyle='#3f9a4c';[[10,80],[44,92],[90,86],[132,96],[170,82],[28,100],[150,74]].forEach(([x,y])=>{g.fillRect(x,y,1,3);g.fillRect(x+2,y+1,1,2)});
 gSpr(g,CATP,82,84,2);
 if(st==='play'||st==='throw'||st==='lose'||(st==='catch'&&G.ct<.5)){if(st==='catch')g.globalAlpha=1-G.ct/.5;gSpr(g,S0,G.cx-12,G.cy-10,2);g.globalAlpha=1}
 if(st==='throw')gSpr(g,GBALL,G.bx-8,G.by-8,2);
 if(st==='catch'){const sh=G.ct>.5&&G.ct<1.3?Math.round(Math.sin(G.ct*16)*3):0;gSpr(g,GBALL,G.cx-8+sh,G.cy-4,2);
  if(G.ct>1.3){g.fillStyle='#ffd95a';[[-14,-6],[14,-8],[0,-14],[-10,12],[11,11]].forEach(([dx,dy])=>g.fillRect(G.cx+dx,G.cy+4+dy,2,2));gTx(g,'tertangkap!',96,26,'#ffd95a','center')}}
 if(st==='play'||st==='throw'||st==='lose'){for(let i=0;i<G.balls;i++)gSpr(g,GBALL,4+i*10,4,1);gTx(g,'tertangkap '+G.caught+'/3',188,11,'#fff','right');
  gTx(g,G.mt>0?G.msg:(st==='lose'?'kabur! tap = coba lagi':S0.n+' liar muncul!'),96,26,'#fff','center');
  if(st!=='lose')gTx(g,'tap = lempar',3,104,'#fff','left')}
 if(st==='title'||st==='win'){g.fillStyle='rgba(13,21,56,.86)';g.fillRect(0,0,w,108);
  if(st==='title'){gTx(g,'TANGKAP',96,22,'#ffd95a','center');gTx(g,'MONSTER',96,34,'#f4a6c0','center')}else{gTx(g,'SEMUA',96,22,'#ffd95a','center');gTx(g,'TERTANGKAP!',96,34,'#f4a6c0','center')}
  GSPR.forEach((p,i)=>gSpr(g,st==='title'?{rows:p.rows,pal:{b:'#6b7aa8',k:'#6b7aa8',a:'#6b7aa8'}}:p,24+i*60,46,2));
  gTx(g,st==='title'?'tap layar = mulai':'tap layar = selesai',96,82,'#fff','center');
  if(st==='title')gTx(g,'keyboard = keluar',96,94,'#9fd8ff','center')}
 g.textAlign='left'}
lact(monG,()=>{if(pcS===2)gTap();else{pcS=(pcS+1)%4;pcMin=-1;pcDraw()}});
lact(kbG,()=>{pcS=(pcS+1)%4;gReset();pcMin=-1;pcDraw()});

/* ---------- animasi surat: segel pecah -> kertas naik keluar amplop -> layar surat ---------- */
const lpG=new THREE.Group();lpG.position.set(.05,.04,.02);lpG.visible=false;env2.add(lpG);
const lpT=ctex(24,16,g=>{g.fillStyle='#fffdf3';g.fillRect(0,0,24,16);g.fillStyle='#f0c9d6';[3,6,9,12].forEach(y=>g.fillRect(2,y,20,1));
 g.fillStyle='#e84a5f';g.fillRect(11,1,2,1);g.fillRect(10,0,1,1);g.fillRect(13,0,1,1)});
const lpM=new THREE.Mesh(new THREE.PlaneGeometry(.5,.34),new THREE.MeshBasicMaterial({map:lpT,side:THREE.DoubleSide}));lpM.rotation.x=-Math.PI/2;lpG.add(lpM);
const LA={t:-1,opened:false,back:0};
function letterGo(){if(LA.t>=0||LO)return;LA.t=0;LA.back=0;LA.opened=false;lpG.visible=false;love(3,env2)}
function letterReset(){letterClose(true);LA.t=-1;LA.back=0;lpG.visible=false;lpG.scale.setScalar(1);lpG.position.set(.05,.04,.02);lpG.rotation.x=0;seal.scale.setScalar(1);seal.position.y=.06}

/* ---------- tampilan surat (overlay sendiri) ---------- */
const lcss=document.createElement('style');
lcss.textContent=`.sq-lt{position:fixed;inset:0;z-index:60;display:flex;align-items:center;justify-content:center;padding:18px;opacity:0;transition:opacity .35s}
.sq-lt.on{opacity:1}
.sq-ltbg{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(60,48,140,.55),rgba(10,8,30,.9));backdrop-filter:blur(3px)}
.sq-ltp{position:relative;width:min(440px,100%);max-height:84vh;display:flex;flex-direction:column;background:#fffaf0;border:4px solid #1f3a5f;box-shadow:6px 6px 0 rgba(0,0,0,.4);padding:32px 20px 16px;transform-origin:50% 0;animation:sqUnf .85s cubic-bezier(.2,.9,.3,1.05) both}
.sq-ltt{font:10px/1.8 'Press Start 2P',monospace;color:#c9506b;text-align:center;margin:0 0 12px;letter-spacing:.5px}
.sq-ltb{flex:1;min-height:90px;overflow-y:auto;font-size:22px;line-height:28px;white-space:pre-wrap;word-break:break-word;color:#3a2f4b;padding:0 4px;background:repeating-linear-gradient(to bottom,transparent 0 27px,#f0d3dc 27px 28px);background-attachment:local;cursor:pointer}
.sq-ltf{text-align:right;margin-top:10px;font-size:22px;color:#c9506b;opacity:0;transition:opacity 1.2s;min-height:24px}.sq-ltf.on{opacity:1}
.sq-ltx{display:flex;gap:10px;justify-content:center;margin-top:12px;opacity:0;animation:sqFi .5s 1.1s forwards}
.sq-seal{position:absolute;top:-22px;left:50%;margin-left:-20px;width:40px;height:40px;border-radius:50%;background:#e84a5f;border:3px solid #a8283c;color:#fff;font-size:18px;line-height:34px;text-align:center;box-shadow:2px 2px 0 rgba(0,0,0,.35);animation:sqSeal .5s .8s both}
.sq-cur{display:inline-block;width:.5em;height:1em;background:#c9506b;vertical-align:-.12em;animation:sqBl .8s steps(2) infinite}
.sq-sp{position:absolute;bottom:-20px;width:8px;height:8px;opacity:0;animation:sqRise 5s linear infinite;pointer-events:none}
@keyframes sqUnf{0%{transform:perspective(900px) rotateX(-85deg) scale(.55);opacity:0}45%{opacity:1}100%{transform:none;opacity:1}}
@keyframes sqSeal{0%{transform:scale(1);opacity:1}100%{transform:translateY(-26px) scale(1.7) rotate(25deg);opacity:0}}
@keyframes sqFi{to{opacity:1}}@keyframes sqBl{50%{opacity:0}}
@keyframes sqRise{0%{transform:translateY(0) rotate(0);opacity:0}15%{opacity:.9}100%{transform:translateY(-110vh) rotate(180deg);opacity:0}}
@media (prefers-reduced-motion:reduce){.sq-sp{display:none}.sq-ltp{animation:none}.sq-seal{animation:none;opacity:0}}`;
document.head.appendChild(lcss);
let LO=null,ltTimer=0;
function letterClose(now){if(!LO)return;clearTimeout(ltTimer);document.removeEventListener('keydown',LO.key);const el=LO.el;LO=null;LA.back=.4;
 if(now)el.remove();else{el.classList.remove('on');setTimeout(()=>el.remove(),380)}}
function letterOpen(){
 if(LO)return;
 const L=ASQ.letter||{},ex=(typeof EXTRA!=='undefined'&&EXTRA.letter)||{},
  title=L.title||ex.title||'Surat',body=L.body||ex.body||'(isi suratnya belum ditulis)',from=L.from||ex.from||'';
 const el=document.createElement('div');el.className='sq-lt';
 el.innerHTML='<div class="sq-ltbg"></div>'+Array.from({length:12},(_,i)=>'<i class="sq-sp" style="left:'+(i*8.3+rnd(0,5)).toFixed(1)+'%;animation-delay:'+(i*.55).toFixed(2)+'s;animation-duration:'+(4+rnd(0,3)).toFixed(1)+'s;background:'+['#ffd95a','#f4a6c0','#9fd8ff','#c9a8ff'][i%4]+'"></i>').join('')
  +'<div class="sq-ltp"><div class="sq-seal">&hearts;</div><h3 class="sq-ltt">'+esc(title)+'</h3><div class="sq-ltb"></div><div class="sq-ltf">'+esc(from)+'</div>'
  +'<div class="sq-ltx"><button class="btn alt" data-a="again" style="visibility:hidden">baca lagi</button><button class="btn" data-a="close">tutup</button></div></div>';
 document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('on'));
 const bd=el.querySelector('.sq-ltb'),fo=el.querySelector('.sq-ltf'),rb=el.querySelector('[data-a=again]'),cb=el.querySelector('[data-a=close]'),st={skip:false};
 const key=e=>{if(e.key==='Escape')letterClose()};document.addEventListener('keydown',key);LO={el,key};
 const fin=()=>{clearTimeout(ltTimer);bd.textContent=body;fo.classList.add('on');rb.style.visibility='visible'};
 const run=()=>{clearTimeout(ltTimer);fo.classList.remove('on');rb.style.visibility='hidden';bd.textContent='';
  const cur=document.createElement('span');cur.className='sq-cur';let i=0;
  const step=()=>{if(!LO||LO.el!==el||st.skip)return;if(i>=body.length){fin();return}
   const ch=body[i++];bd.textContent=body.slice(0,i);bd.appendChild(cur);bd.scrollTop=bd.scrollHeight;
   ltTimer=setTimeout(step,/[.!?]/.test(ch)?240:/[,;:]/.test(ch)?120:ch==='\n'?200:26)};step()};
 bd.onclick=()=>{st.skip=true;fin()};
 rb.onclick=()=>{st.skip=false;run()};cb.onclick=()=>letterClose();el.querySelector('.sq-ltbg').onclick=()=>letterClose();
 setTimeout(()=>{if(LO&&LO.el===el&&!st.skip)run()},850)}

/* ---------- UI: surat, foto, suara, kode ---------- */
let typ=0;
function letterUI(){
 const L=ASQ.letter||{},ex=(typeof EXTRA!=='undefined'&&EXTRA.letter)||{},title=L.title||ex.title||'Surat',body=L.body||ex.body||'';
 openM(`<h2>${esc(title)}</h2><div class="paper" id="sqlt"></div><p class="from" style="font-size:18px">tap kertas untuk lewati</p>`);
 const el=$('#sqlt');let i=0;clearInterval(typ);
 typ=setInterval(()=>{if(!$('#sqlt')){clearInterval(typ);return}i+=2;el.textContent=body.slice(0,i);if(i>=body.length)clearInterval(typ)},28);
 el.onclick=()=>{clearInterval(typ);el.textContent=body};onClose=()=>clearInterval(typ)}

function photoUI(i){
 const P=ASQ.photos||[],n=P.length;if(!n)return;i=(i+n)%n;const p=P[i];
 openM(`<h2>${esc(p.t||'kenangan')}</h2><img class="big" src="${esc(p.src)}" alt="" onerror="this.outerHTML='<p>fotonya belum dipasang.</p>'"><p style="margin-top:10px">${esc(p.cap||'')}</p>${n>1?`<div class="row" style="justify-content:center;align-items:center"><button class="btn" id="sqpb">&lt;</button><span class="px" style="font-size:10px">${i+1} / ${n}</span><button class="btn alt" id="sqpf">&gt;</button></div>`:''}`);
 if(n>1){$('#sqpb').onclick=()=>photoUI(i-1);$('#sqpf').onclick=()=>photoUI(i+1)}}

let radioWas=false,vcur=null;
const radioPause=()=>{try{if(typeof on!=='undefined'&&on&&typeof pa==='function'){radioWas=true;pa()}}catch(e){}};
const radioBack=()=>{try{if(radioWas&&typeof pl==='function')pl()}catch(e){}radioWas=false};
function voiceStop(){if(vcur){vcur.pause();vcur=null}}
function voiceUI(){
 const V=ASQ.voices||[];
 openM(`<h2>kaset pesan suara</h2>${V.map((v,i)=>`<div class="sq-v"><button class="btn" data-i="${i}" style="min-width:64px">play</button><div style="flex:1"><b>${esc(v.n||'pesan '+(i+1))}</b><small id="sqm${i}">${esc(v.t||'')}</small><div class="sq-bar"><i id="sqp${i}"></i></div></div></div>`).join('')||'<p>belum ada pesan suara.</p>'}`);
 onClose=()=>{voiceStop();radioBack()};
 mb.querySelectorAll('button[data-i]').forEach(b=>{const i=+b.dataset.i,v=V[i];b.onclick=()=>{
  if(vcur&&vcur._i===i){voiceStop();b.textContent='play';return}
  voiceStop();mb.querySelectorAll('button[data-i]').forEach(x=>x.textContent='play');
  radioPause();const a=new Audio(v.src);a._i=i;vcur=a;b.textContent='stop';
  a.ontimeupdate=()=>{const bar=$('#sqp'+i);if(bar&&a.duration)bar.style.width=(a.currentTime/a.duration*100)+'%'};
  a.onended=()=>{b.textContent='play';vcur=null;const bar=$('#sqp'+i);if(bar)bar.style.width='0'};
  a.onerror=()=>{b.textContent='play';vcur=null;const m=$('#sqm'+i);if(m&&!v.t)m.textContent='file suaranya belum dipasang.'};
  const p=a.play();if(p&&p.catch)p.catch(()=>{b.textContent='play';vcur=null})}})}

function gate(){
 if(ls('bday-aqsa')==='1'){enter();return}
 openM(`<h2>pintu rahasia</h2><p>${esc(ASQ.q||'masukkan kode rahasia.')}</p><input id="sqk" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="kode...">
 <p class="from" id="sqe" style="margin:0;min-height:26px"></p><div class="row"><button class="btn" id="sqo">buka</button></div>`);
 setTimeout(()=>{const i=$('#sqk');if(i)i.focus()},60);
 const go=()=>{const i=$('#sqk');if(!i)return;if(H(i.value)===ASQ.hash){ls('bday-aqsa','1');try{localStorage.removeItem('bday-dev')}catch(e){}closeM();enter()}
  else if(ASQ.hashDev&&H(i.value)===ASQ.hashDev){ls('bday-aqsa','1');ls('bday-dev','1');closeM();enter()}
  else{$('#sqe').textContent='kodenya belum tepat. coba lagi';i.classList.remove('sq-shake');void i.offsetWidth;i.classList.add('sq-shake')}};
 $('#sqo').onclick=go;$('#sqk').onkeydown=e=>{if(e.key==='Enter')go()}}

/* ---------- masuk / keluar kamar ---------- */
const css=document.createElement('style');
css.textContent=`.sq-fade{position:fixed;inset:0;background:#0f0b2a;opacity:0;pointer-events:none;transition:opacity .45s;z-index:40}.sq-fade.on{opacity:1;pointer-events:auto}
.sq-cap{position:fixed;left:8px;right:8px;bottom:84px;text-align:center;font:10px/1.9 'Press Start 2P',monospace;color:#fff;text-shadow:2px 2px 0 #1f3a5f;pointer-events:none;opacity:0;transition:opacity .6s;z-index:12}.sq-cap.on{opacity:1}
.sq-v{display:flex;gap:10px;align-items:center;margin:12px 0}.sq-v b{font-size:26px}.sq-v small{display:block;font-size:20px;opacity:.75;line-height:1.1}
.sq-bar{height:6px;background:#cfe0f6;margin-top:4px}.sq-bar i{display:block;height:100%;width:0;background:var(--hot)}
.sq-shake{animation:sqs .35s}@keyframes sqs{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}`;
document.head.appendChild(css);
const fd=document.createElement('div');fd.className='sq-fade';document.body.appendChild(fd);
const cap=document.createElement('div');cap.className='sq-cap';cap.innerHTML=ASQ.title+'<br><span style="font-size:8px;opacity:.85">'+ASQ.hint+'</span>';document.body.appendChild(cap);
const bar=$('#bar'),xb=document.createElement('button');
xb.className='btn';xb.textContent='keluar';xb.style.display='none';bar.appendChild(xb);xb.onclick=()=>leave();

/* pintu masuk = poster kucing siamese di dinding ruang utama (tap -> kotak kode) */
{const P=S.children.find(o=>o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===.8&&o.geometry.parameters.height===1.07);
 if(P){P.userData.fn=()=>{say3(P,'meong~');gate()};if(typeof hits!=='undefined'&&hits.indexOf(P)<0)hits.push(P)}else console.warn('secret3d: poster pintu rahasia tidak ditemukan')}

let IN=false,sv=null,hid=[];
function fade(mid){fd.classList.add('on');setTimeout(()=>{mid();setTimeout(()=>fd.classList.remove('on'),200)},480)}
function enter(){if(IN)return;fade(()=>{
 sv={bg:S.background&&S.background.clone?S.background.clone():null,amb:amb.intensity,sun:sun.intensity,lamp:lampL.intensity};
 hid=[];S.children.forEach(o=>{if(o.isLight||o===SR)return;if(o.visible){hid.push(o);o.visible=false}});
 if(S.background&&S.background.set)S.background.set('#1a1646');amb.intensity=.72;sun.intensity=.4;lampL.intensity=0;
 Array.from(bar.children).forEach(e=>{if(e===xb||e.id==='rdo')return;e.dataset.sqd=e.style.display;e.style.display='none'});xb.style.display='';
 IN=true;mode=1;drawSign();dist=innerWidth<innerHeight?27:15;goalT.set(0,1.7,-149.6);if(typeof tgt!=='undefined')tgt.copy(goalT);
 setTimeout(()=>{cap.classList.add('on');if(typeof confetti==='function')confetti();love(4,miko.g);meow(1);say3(miko.g,ASQ.welcome)},700);
 setTimeout(()=>cap.classList.remove('on'),7500)})}
function leave(){if(!IN)return;fade(()=>{
 try{closeM()}catch(e){}voiceStop();mbStop();letterReset();clearInterval(typ);
 IN=false;mode=0;cap.classList.remove('on');sayEl.style.display='none';
 if(sv){if(sv.bg&&S.background&&S.background.copy)S.background.copy(sv.bg);amb.intensity=sv.amb;sun.intensity=sv.sun;lampL.intensity=sv.lamp}
 hid.forEach(o=>o.visible=true);hid=[];
 Array.from(bar.children).forEach(e=>{if(e===xb||e.id==='rdo')return;e.style.display=e.dataset.sqd||''});xb.style.display='none';
 dist=innerWidth<innerHeight?30:22;goalT.set(1,2.2,1);if(typeof tgt!=='undefined')tgt.copy(goalT)})}

/* ---------- animasi (hanya jalan saat di dalam kamar) ---------- */
let last=performance.now();
function loop(now){requestAnimationFrame(loop);
 const dt=Math.min(.1,(now-last)/1000||0),t=now/1000;last=now;
 SR.visible=IN;if(!IN)return;
 neon.material.opacity=.85+.15*Math.sin(t*3+Math.sin(t*17)*.4);
 bulbs.forEach(b=>b.scale.setScalar(.8+.35*Math.sin(t*2.4+b.userData.p)));bdUpd(t);
 sparks.forEach(s=>{const k=1+.25*Math.sin(t*4+s.userData.p);s.scale.set(.32*k,.32*k,1)});
 reels.forEach((r,i)=>r.rotation.y+=dt*(i?3:2));led.visible=Math.sin(t*5)>-.3;
 phG.forEach((g,i)=>g.rotation.z+=(((i*37)%7-3)*.02+Math.sin(t*.9+i)*.015-g.rotation.z)*Math.min(1,dt*3));
 /* yarn */
 Y.x+=Y.vx*dt;Y.z+=Y.vz*dt;const f=Math.exp(-1.5*dt);Y.vx*=f;Y.vz*=f;
 if(Y.x<KR.x0-.3||Y.x>KR.x1){Y.vx*=-.8;Y.x=clp(Y.x,KR.x0-.3,KR.x1)}if(Y.z<KR.z0||Y.z>KR.z1+.2){Y.vz*=-.8;Y.z=clp(Y.z,KR.z0,KR.z1+.2)}
 Y.v=Math.hypot(Y.vx,Y.vz);yarn.position.x=Y.x;yarn.position.z=Y.z;yb.rotation.z-=Y.vx*dt/.2;yb.rotation.x+=Y.vz*dt/.2;
 /* animasi surat */
 if(LA.t>=0){LA.t+=dt;const p=LA.t,s1=clp(p/.35,0,1);seal.scale.setScalar(Math.max(.001,1-s1));seal.position.y=.06+s1*.25;
  if(p>.25){const u=clp((p-.25)/1,0,1),e=1-Math.pow(1-u,3);lpG.visible=true;lpG.position.set(.05,.04+e*1.15,.02+e*.35);lpG.rotation.x=e*1.15;lpG.scale.setScalar(1+e*1.3)}
  if(p>1.3&&!LA.opened){LA.opened=true;letterOpen()}
  if(p>1.45){LA.t=-1;lpG.visible=false;lpG.scale.setScalar(1);lpG.position.set(.05,.04,.02);lpG.rotation.x=0}}
 if(LA.back>0){LA.back=Math.max(0,LA.back-dt);seal.position.y=.06;seal.scale.setScalar(LA.back===0?1:Math.max(.001,1-LA.back/.4))}
 /* set pc */
 pcRGB.forEach(m=>m.material.color.setHSL((t*.12+m.userData.o)%1,.85,.62));pcFans.forEach(f=>f.rotation.z-=dt*4);
 if(pcS===0){const d=new Date(),k=d.getHours()*60+d.getMinutes();if(k!==pcMin){pcMin=k;pcDraw()}}
 if(pcS===2){gStep(dt);gDraw();pcT.needsUpdate=true}
 if(chSpin>0){const dd=Math.min(chSpin,dt*7);chG.rotation.y+=dd;chSpin-=dd}
 /* Aqsa */
 aqUpd(t,dt);
 /* tidur saat kotak musik main */
 miko.setSleep(mbOn);kits.forEach(k=>k.m.setSleep(mbOn));
 if(mbOn){mbZ-=dt;if(mbZ<=0){mbZ=1.2;love(1,[miko.g,kits[zc%kits.length].g,av][zc%3],ZT);zc++}}
 /* kotak musik */
 if(mbOn){mbDancer.rotation.y+=dt*1.6;mbCrank.rotation.x+=dt*2.2;mbT-=dt;if(mbT<=0){love(1,mbDancer);mbT=.8}}
 /* mainan */
 let tf=null;
 toys.forEach(T=>{let hop=0;
  if(T.t>0){T.t-=dt;T.w-=dt;const dx=T.tx-T.x,dz=T.tz-T.z,d=Math.hypot(dx,dz);
   if(T.w<=0||d<.1){T.tx=rnd(KR.x0,KR.x1);T.tz=rnd(KR.z0,KR.z1);T.w=rnd(.5,1.1)}
   else{const st=Math.min(d,T.sp*dt);T.x+=dx/d*st;T.z+=dz/d*st;let da=Math.atan2(-dz,dx)-T.h;da=Math.atan2(Math.sin(da),Math.cos(da));T.h+=da*Math.min(1,dt*10)}
   hop=Math.abs(Math.sin(t*10+T.ph))*.1;T.g.rotation.y=T.h+Math.sin(t*18+T.ph)*.25;
   if(T.t<=0){T.t=0;hop=0;T.g.rotation.y=T.h;love(3,T.g)}else if(!tf)tf=T}
  T.g.position.set(T.x,hop,T.z)});
 /* anak kucing */
 let nk=null,nd=1e9;
 kits.forEach(k=>{
  const ch=Y.v>.35||!!tf,cx=tf?tf.x:Y.x,cz=tf?tf.z:Y.z;k.t-=dt;
  if(mbOn){k.tx=-.15;k.tz=bedP.z+(k.i-1)*.65;k.st='go'}
  else if(ch){k.tx=cx+(k.i-1)*.4;k.tz=cz+.4;k.st='go'}
  else if(k.t<=0){if(Math.random()<.55){k.tx=rnd(KR.x0,KR.x1);k.tz=rnd(KR.z0,KR.z1);k.st='go'}else k.st='idle';k.t=rnd(1.5,4)}
  let mv=false;
  if(k.st==='go'){const dx=k.tx-k.x,dz=k.tz-k.z,d=Math.hypot(dx,dz);if(d<.1)k.st='idle';else{const st=Math.min(d,(ch?2.3:.75)*dt);k.x+=dx/d*st;k.z+=dz/d*st;k.fy=Math.atan2(dx,dz);mv=true}}
  let da=k.fy-k.g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));k.g.rotation.y+=da*Math.min(1,dt*8);
  k.hv-=14*dt;k.y=Math.max(0,k.y+k.hv*dt);if(k.y===0&&k.hv<0)k.hv=0;
  k.g.position.set(k.x,k.y+(mv?Math.abs(Math.sin(t*11+k.i*2))*.07:0),k.z);k.m.mdl.rotation.x=mv?.08:0;k.m.upd(t+k.i*3,dt);
  const dd=Math.hypot(k.x-miko.g.position.x,k.z-miko.g.position.z);if(dd<nd){nd=dd;nk=k}});
 /* Miko */
 mkHop=Math.max(0,mkHop-dt);miko.g.position.y=.34+(mkHop>0?Math.sin((1-mkHop/.5)*Math.PI)*.35:0);
 if(mbOn)miko.setLook(0);else if(nk){const a=Math.atan2(nk.x-miko.g.position.x,nk.z-miko.g.position.z)-miko.g.rotation.y;miko.setLook(Math.atan2(Math.sin(a),Math.cos(a)))}
 miko.upd(t,dt);
 /* bintang kecil */
 for(let i=hearts.length-1;i>=0;i--){const h=hearts[i];h.l-=dt;h.s.position.y+=dt*.9;h.s.position.x+=h.vx*dt;h.s.material.opacity=clp(h.l/.6,0,1);if(h.l<=0){SR.remove(h.s);h.s.material.dispose();hearts.splice(i,1)}}
}
requestAnimationFrame(loop);
})();