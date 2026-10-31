/* wall3d.js — muat PALING AKHIR (setelah interact3d.js).
   Papan ucapan: bingkai kayu + gabus, header "Happy Birthday, Aqsa!", note berisi teks asli (miring, ukuran bervariasi, pin/pita),
   stiker di form, dan tombol "baca semua ucapan" (kartu satu per satu + penanda baru). */
(()=>{
const VT='VT323,monospace',FN='"Press Start 2P",monospace',STK=['star','balloon','heart','cat','crown'];
const board=S.children.find(o=>o.geometry&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===3&&o.geometry.parameters.height===3.4);
if(!board)return;
board.position.x+=.7;
const bp=board.position,PAL5=['#f2c14e','#e84a5f','#8fd0f0','#a98bd6','#8fd18a'];
const hash=n=>{let h=0;const s=(n.from||'')+'|'+(n.t||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
const key=n=>n.id||('l'+hash(n)),all=()=>CFG.notes.concat(cloud);
const wrap=(g,t,mw)=>{const o=[];String(t).split('\n').forEach(p=>{let l='';p.split(/\s+/).forEach(w=>{const q=l?l+' '+w:w;if(l&&g.measureText(q).width>mw){o.push(l);l=w}else l=q});o.push(l)});return o};

/* ---- papan: gabus + bingkai kayu ---- */
{const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle='#c8955a';g.fillRect(0,0,128,128);
 for(let i=0;i<500;i++){g.fillStyle=['#b37f47','#d9a96f','#a8733d'][i%3];g.fillRect((i*53)%128,(i*89)%127,2+i%3,2)}
 const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;board.material=new THREE.MeshLambertMaterial({map:t})}
const W=3,H=3.4,B=.22,fz=bp.z+.07;
[[W+2*B,B,0,H/2+B/2,'#a8703a'],[W+2*B,B,0,-H/2-B/2,'#a8703a'],[B,H,-W/2-B/2,0,'#8a5a2c'],[B,H,W/2+B/2,0,'#8a5a2c']].forEach(([w,h,dx,dy,c])=>{
 const f=bx(w,h,.18,c,bp.x+dx,bp.y+dy,fz);act(f,()=>board.userData.fn())});
const glow=new THREE.PointLight(0xffe2a8,.8,7);glow.position.set(bp.x,5.0,bp.z+2);S.add(glow);

/* ---- header ---- */
const hc=document.createElement('canvas');hc.width=1160;hc.height=200;const hg=hc.getContext('2d'),ht=new THREE.CanvasTexture(hc);ht.anisotropy=4;
const hdr=new THREE.Mesh(new THREE.PlaneGeometry(3.6,.62),new THREE.MeshBasicMaterial({map:ht,transparent:true}));
hdr.position.set(bp.x,5.17,bp.z+.14);S.add(hdr);
let ph=0;
function drawH(){const g=hg,T='Happy Birthday, Aqsa!';g.clearRect(0,0,1160,200);
 g.fillStyle='#1f3a5f';g.fillRect(0,0,1160,200);g.fillStyle='#f2c14e';g.fillRect(0,0,1160,10);g.fillRect(0,190,1160,10);g.fillRect(0,0,10,200);g.fillRect(1150,0,10,200);
 g.font='42px '+FN;g.textBaseline='alphabetic';g.textAlign='left';let x=(1160-g.measureText(T).width)/2;
 [...T].forEach((ch,i)=>{g.fillStyle='#0d1d33';g.fillText(ch,x+3,93);g.fillStyle=PAL5[(i+ph)%5];g.fillText(ch,x,90);x+=g.measureText(ch).width});
 g.font='40px '+VT;g.textAlign='center';g.fillStyle='#cfe3ff';const n=all().length;g.fillText(n+' ucapan dari teman-temanmu',580,155);ht.needsUpdate=true}
act(hdr,()=>{if(canRead())reader()});

/* ---- thumbnail note: teks asli ---- */
noteTex=function(n){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
 g.fillStyle=n.color||'#f7e27a';g.fillRect(0,0,256,256);g.fillStyle='rgba(0,0,0,.07)';g.fillRect(0,0,256,24);
 g.fillStyle='#4a3a1a';g.font='30px '+VT;g.textBaseline='alphabetic';g.textAlign='left';
 const L=wrap(g,n.t||'',224),mx=5;L.slice(0,mx).forEach((l,i)=>g.fillText(i===mx-1&&L.length>mx?l.slice(0,-3)+'...':l,16,54+i*30));
 g.font='26px '+VT;g.textAlign='right';g.fillText('- '+(n.from||'anon').slice(0,14),242,246);
 if(n.s&&ST[n.s])stk(g,n.s,38,214);
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};
/* posisi note dihitung dari papan yang asli (bp), bukan koordinat tetap, supaya selalu di dalam gabus */
const RX=2.12,RY=2.52,P2X=p=>bp.x+(clamp(p,0,100)/100-.5)*RX,P2Y=p=>bp.y+(.5-clamp(p,0,100)/100)*RY;
const post=()=>{noteHits.forEach((m,i)=>{const n=m.userData.n,h=hash(n),s=[.95,1.1,1.25,1,1.18][h%5],q=n.x==null?gridP(i):{x:n.x,y:n.y};
  m.position.x=P2X(q.x);m.position.y=P2Y(q.y);
  m.scale.set(s,s,1);m.rotation.z=((h>>3)%9-4)*.03;
  if(h%3===0){const t=new THREE.Mesh(new THREE.PlaneGeometry(.22,.09),new THREE.MeshBasicMaterial({color:'#f3e9c6',transparent:true,opacity:.8}));t.position.set(0,.28,.01);t.rotation.z=.15;m.add(t)}
  else{const p=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),new THREE.MeshBasicMaterial({color:PAL5[(h>>5)%5]}));p.position.set(0,.25,.04);m.add(p)}});
 drawH();label()};
const _r=renderWall;renderWall=function(){if(dr){_r();return}_r();post()};
/* seret note: batas = papan; simpan persen relatif terhadap papan */
const _pm=cv.onpointermove;cv.onpointermove=e=>{_pm(e);if(dr&&dr.userData.n){dr.position.x=clamp(dr.position.x,bp.x-RX/2,bp.x+RX/2);dr.position.y=clamp(dr.position.y,bp.y-RY/2,bp.y+RY/2)}};
saveMove=async function(m){const n=m.userData.n,x=Math.round(clamp(((m.position.x-bp.x)/RX+.5)*100,0,100)*10)/10,y=Math.round(clamp((.5-(m.position.y-bp.y)/RY)*100,0,100)*10)/10;n.x=x;n.y=y;
 if(n.id&&db){try{await fs.updateDoc(fs.doc(db,'notes',n.id),{x,y})}catch(e){console.warn(e)}}else if(!n.id)ls('bday-notes',JSON.stringify(cloud))};

/* ---- posisi note baru: tersebar, bukan grid kaku ---- */
const spot=i=>{const k=(i*7)%25,j=(i*37)%13-6;return{x:clamp((k%5)*25+j,0,100),y:clamp(Math.floor(k/5)*25-j,0,100)}};
saveNote=async function(n){n={...n,...spot(CFG.notes.length+cloud.length)};
 if(db){try{await fs.addDoc(fs.collection(db,'notes'),{from:n.from,t:n.t,color:n.color,x:n.x,y:n.y,createdAt:fs.serverTimestamp()});return}catch(e){console.warn(e)}}
 cloud.push(n);ls('bday-notes',JSON.stringify(cloud));renderWall()};

/* ---- mode baca semua ucapan ---- */
const canRead=()=>ls('bday-aqsa')==='1'; /* flag yang diset secret3d.js saat kode kamar rahasia benar */
const RK='bday-read-notes',rs=()=>{try{return new Set(JSON.parse(ls(RK)||'[]'))}catch(e){return new Set()}};
const unread=()=>{const s=rs();return all().filter(n=>!s.has(key(n))).length};
const rbtn=document.createElement('button');rbtn.className='btn';rbtn.style.cssText='background:#e84a5f;box-shadow:inset -4px -4px 0 #a82a3d,4px 4px 0 var(--ink)';
$('#sticky').after(rbtn);rbtn.onclick=()=>reader();
function label(){const u=unread();rbtn.textContent='baca semua ucapan'+(u?' ('+u+' baru)':'')}
function reader(){
 if(!canRead())return;
 const L=all().slice().reverse(),seen=rs();
 if(!L.length){openM('<h2>ucapan buat Aqsa</h2><p>belum ada ucapan.</p>');return}
 let i=0,tx=0;
 openM('<h2>ucapan buat Aqsa</h2><div id="rc"></div><div class="row" style="justify-content:center;align-items:center"><button class="btn" id="rb">&lt;</button><span class="px" id="rn" style="font-size:10px"></span><button class="btn alt" id="rf">&gt;</button></div>');
 const show=k=>{i=clamp(k,0,L.length-1);const n=L[i],kk=key(n),fresh=!seen.has(kk);
  if(!rs().has(kk)){const s=rs();s.add(kk);ls(RK,JSON.stringify([...s]))}
  const p=document.createElement('div');p.className='paper';p.style.background=n.color||'#f7e27a';
  p.innerHTML=(fresh?'<span class="px" style="font-size:9px;background:#e84a5f;color:#fff;padding:4px 6px;display:inline-block;margin-bottom:8px">baru</span>':'')+'<div class="rt"></div><p class="from"></p>';
  p.querySelector('.rt').textContent=n.t||'';p.querySelector('.from').textContent='- '+(n.from||'anon');
  if(n.s&&ST[n.s])p.appendChild(spr(ST[n.s],4));
  $('#rc').replaceChildren(p);$('#rn').textContent=(i+1)+' / '+L.length};
 $('#rb').onclick=()=>show(i-1);$('#rf').onclick=()=>show(i+1);
 const rc=$('#rc');rc.ontouchstart=e=>tx=e.touches[0].clientX;rc.ontouchend=e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)show(i+(d<0?1:-1))};
 const kd=e=>{if(e.key==='ArrowLeft')show(i-1);if(e.key==='ArrowRight')show(i+1)};addEventListener('keydown',kd);
 onClose=()=>{removeEventListener('keydown',kd);label()};show(0)}

/* ---- loop kecil: header berkedip + tombol ikut tampil/hilang seperti tombol sticky ---- */
let lt=0;(function loop(t){requestAnimationFrame(loop);rbtn.style.display=canRead()?$('#sticky').style.display:'none';if(t-lt>500){lt=t;ph++;drawH()}})(0);
if(document.fonts){document.fonts.load('42px "Press Start 2P"').then(drawH);document.fonts.load('30px VT323').then(()=>renderWall())}
renderWall();
})();