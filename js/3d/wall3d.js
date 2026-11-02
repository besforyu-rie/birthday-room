/* wall3d.js — muat PALING AKHIR (setelah interact3d.js).
   Mading ucapan v2: bingkai kayu walnut + gabus asli + lampu hias, banner pita "Happy Birthday, Aqsa!",
   note kertas besar (bayangan, lipatan sudut, pin/lakban, teks otomatis menyesuaikan ukuran),
   posisi note otomatis tidak saling numpuk, kartu baca ucapan yang rapi (satu per satu + penanda baru). */
(()=>{
const VT='VT323,monospace',FN='"Press Start 2P",monospace';
const board=S.children.find(o=>o.geometry&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===3&&o.geometry.parameters.height===3.4);
if(!board)return;
board.position.x+=.7;
const bp=board.position,PAL5=['#f2c14e','#e84a5f','#8fd0f0','#a98bd6','#8fd18a'],AVC=['#3b7dd8','#e84a5f','#2e9d6a','#8a5bd0','#e08a1e'];
const hash=n=>{let h=0;const s=(n.from||'')+'|'+(n.t||'');for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return h};
const key=n=>n.id||('l'+hash(n)),all=()=>CFG.notes.concat(cloud);
const wrap=(g,t,mw)=>{const o=[];String(t).split('\n').forEach(p=>{let l='';p.split(/\s+/).forEach(w=>{const q=l?l+' '+w:w;if(l&&g.measureText(q).width>mw){o.push(l);l=w}else l=q});o.push(l)});return o};
const W=3,H=3.4,B=.22,fz=bp.z+.07;
/* area note di dalam gabus (pusat note boleh bergerak di sini) */
const RX=2.2,RY=2.34,CY=bp.y-.07;
const P2X=p=>bp.x+(clamp(p,0,100)/100-.5)*RX,P2Y=p=>CY+(.5-clamp(p,0,100)/100)*RY;
const X2P=x=>clamp(((x-bp.x)/RX+.5)*100,0,100),Y2P=y=>clamp((.5-(y-CY)/RY)*100,0,100);

/* ---- CSS kartu baca ---- */
{const st=document.createElement('style');st.textContent=`
#md:has(.wwrap){background:none;border:0;box-shadow:none;padding:12px;max-width:480px;overflow:visible}
#md:has(.wwrap) #x{right:4px;top:-8px;z-index:3;box-shadow:3px 3px 0 var(--ink)}
.wwrap h2{color:#fff;text-shadow:3px 3px 0 var(--ink);margin:0 40px 18px 2px!important;font-size:12px!important}
.wcard{position:relative;padding:36px 22px 18px;border:4px solid var(--ink);box-shadow:7px 7px 0 var(--ink);animation:wpop .3s ease-out;transform:rotate(-.8deg)}
@keyframes wpop{from{opacity:0;transform:translateX(var(--wd,24px)) rotate(2.5deg)}}
.wtape{position:absolute;top:-17px;left:50%;width:100px;height:30px;margin-left:-50px;background:rgba(255,255,255,.62);border:2px solid rgba(31,58,95,.22);transform:rotate(-3deg)}
.wtop{display:flex;align-items:center;gap:12px;margin-bottom:14px}
.wav{width:46px;height:46px;border:3px solid var(--ink);display:grid;place-items:center;font:15px 'Press Start 2P',monospace;color:#fff;text-shadow:2px 2px 0 var(--ink);flex:none}
.wnm{font-size:11px;line-height:1.5;display:block;word-break:break-word;color:#3d2f14}
.wno{opacity:.6;font-size:21px;display:block;color:#3d2f14}
.wnew{margin-left:auto;font:9px 'Press Start 2P',monospace;background:#e84a5f;color:#fff;padding:6px 8px;transform:rotate(6deg);box-shadow:2px 2px 0 var(--ink);flex:none}
.wrt{font-size:31px;line-height:34px;color:#3d2f14;white-space:pre-wrap;word-break:break-word;max-height:min(44vh,360px);overflow:auto;padding-bottom:2px;background:repeating-linear-gradient(to bottom,transparent 0,transparent 33px,rgba(61,47,20,.16) 33px,rgba(61,47,20,.16) 34px)}
.wft{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin-top:16px;min-height:34px}
.wfrom{font-size:27px;color:#3d2f14;opacity:.85;text-align:right;margin-left:auto}
.wnav{display:flex;align-items:center;gap:12px;margin-top:22px}
.wprog{flex:1;text-align:center}
.wtrack{height:12px;border:3px solid var(--ink);background:#fff;margin-bottom:9px}
.wbar{height:100%;background:var(--hot);transition:width .25s}
.wprog .px{font-size:10px;color:#fff;text-shadow:2px 2px 0 var(--ink)}
.wnav .btn{padding:13px 17px}
`;document.head.appendChild(st)}

/* ---- papan: gabus asli + bingkai walnut ---- */
{const c=document.createElement('canvas');c.width=512;c.height=580;const g=c.getContext('2d');
 g.fillStyle='#c99a62';g.fillRect(0,0,512,580);
 let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
 const tn=['#b98750','#d8ab72','#a97a46','#e0b980','#c08f58','#8f6335'];
 for(let i=0;i<2600;i++){g.fillStyle=tn[(rnd()*tn.length)|0];g.globalAlpha=.3+rnd()*.5;const r=1+rnd()*3;g.beginPath();g.ellipse(rnd()*512,rnd()*580,r*(1+rnd()),r,rnd()*3,0,7);g.fill()}
 for(let i=0;i<320;i++){g.fillStyle='#6e4a26';g.globalAlpha=.25+rnd()*.3;g.fillRect(rnd()*512,rnd()*580,1+rnd()*2,1+rnd()*2)}
 g.globalAlpha=1;
 const v=g.createRadialGradient(256,290,160,256,290,390);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(60,30,5,.42)');g.fillStyle=v;g.fillRect(0,0,512,580);
 const t1=g.createLinearGradient(0,0,0,46);t1.addColorStop(0,'rgba(40,20,0,.4)');t1.addColorStop(1,'rgba(40,20,0,0)');g.fillStyle=t1;g.fillRect(0,0,512,46);
 const t2=g.createLinearGradient(0,0,34,0);t2.addColorStop(0,'rgba(40,20,0,.3)');t2.addColorStop(1,'rgba(40,20,0,0)');g.fillStyle=t2;g.fillRect(0,0,34,580);
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;board.material=new THREE.MeshLambertMaterial({map:t})}
const go=()=>board.userData.fn();
[[W+2*B,B,0,H/2+B/2,'#7b4a22'],[W+2*B,B,0,-H/2-B/2,'#7b4a22'],[B,H,-W/2-B/2,0,'#693d19'],[B,H,W/2+B/2,0,'#693d19']].forEach(([w,h,dx,dy,c])=>act(bx(w,h,.18,c,bp.x+dx,bp.y+dy,fz),go));
[[W,.05,0,H/2+.025],[W,.05,0,-H/2-.025],[.05,H,-W/2-.025,0],[.05,H,W/2+.025,0]].forEach(([w,h,dx,dy])=>act(bx(w,h,.2,'#b98445',bp.x+dx,bp.y+dy,fz),go));
[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sy])=>{const s=new THREE.Mesh(new THREE.SphereGeometry(.055,12,10),new THREE.MeshLambertMaterial({color:'#e2b54e'}));s.position.set(bp.x+sx*(W/2+B/2),bp.y+sy*(H/2+B/2),fz+.1);S.add(s)});
{const sh=new THREE.Mesh(new THREE.PlaneGeometry(W+.6,H+.6),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.2,depthWrite:false}));sh.position.set(bp.x+.14,bp.y-.16,bp.z-.035);S.add(sh)}
const glow=new THREE.PointLight(0xffe2a8,.8,7);glow.position.set(bp.x,5.0,bp.z+2);S.add(glow);

/* ---- lampu hias di atas gabus ---- */
const gx=u=>bp.x+u*1.38,gy=u=>bp.y+1.62-.09*(1-u*u),bulbs=[];
{const pts=[];for(let k=0;k<=12;k++){const u=-1+k/6;pts.push(new THREE.Vector3(gx(u),gy(u),bp.z+.05))}
 S.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,.007,4,false),new THREE.MeshBasicMaterial({color:'#2d4a3e'})));
 for(let k=0;k<=10;k++){const u=-1+k/5,m=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),new THREE.MeshBasicMaterial({color:PAL5[k%5]}));m.position.set(gx(u),gy(u)-.04,bp.z+.055);S.add(m);bulbs.push(m.material)}}

/* ---- plakat kuningan di bingkai bawah ---- */
const pc=document.createElement('canvas');pc.width=640;pc.height=84;const pg=pc.getContext('2d'),pt=new THREE.CanvasTexture(pc);pt.anisotropy=4;
const plq=new THREE.Mesh(new THREE.PlaneGeometry(.96,.126),new THREE.MeshBasicMaterial({map:pt,transparent:true}));
plq.position.set(bp.x,bp.y-H/2-B/2,bp.z+.172);S.add(plq);
function drawP(){const g=pg;g.clearRect(0,0,640,84);const gr=g.createLinearGradient(0,0,0,84);gr.addColorStop(0,'#f1d27a');gr.addColorStop(.5,'#d9a93f');gr.addColorStop(1,'#b98a2c');
 g.fillStyle='#6b4a14';g.fillRect(0,0,640,84);g.fillStyle=gr;g.fillRect(5,5,630,74);g.strokeStyle='rgba(107,74,20,.55)';g.lineWidth=2;g.strokeRect(14,13,612,58);
 g.font='54px '+VT;g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(255,243,200,.65)';g.fillText('ucapan untuk Aqsa',321,44);g.fillStyle='#4a3210';g.fillText('ucapan untuk Aqsa',320,42);pt.needsUpdate=true}

/* ---- header: banner pita ---- */
const hc=document.createElement('canvas');hc.width=1184;hc.height=216;const hg=hc.getContext('2d'),ht=new THREE.CanvasTexture(hc);ht.anisotropy=4;
const hdr=new THREE.Mesh(new THREE.PlaneGeometry(3.7,.675),new THREE.MeshBasicMaterial({map:ht,transparent:true}));
hdr.position.set(bp.x,5.15,bp.z+.2);S.add(hdr);
let ph=0;
const HEART=['0110110','1111111','1111111','0111110','0011100','0001000'];
function drawH(){const g=hg,T='Happy Birthday, Aqsa!',CW=1184;g.clearRect(0,0,CW,216);
 /* ekor pita */
 g.fillStyle='#14284a';
 g.beginPath();g.moveTo(0,46);g.lineTo(80,46);g.lineTo(80,196);g.lineTo(0,196);g.lineTo(34,121);g.closePath();g.fill();
 g.beginPath();g.moveTo(CW,46);g.lineTo(CW-80,46);g.lineTo(CW-80,196);g.lineTo(CW,196);g.lineTo(CW-34,121);g.closePath();g.fill();
 g.fillStyle='#0c1930';g.fillRect(50,160,30,36);g.fillRect(CW-80,160,30,36);
 /* badan pita */
 g.save();g.shadowColor='rgba(0,0,0,.4)';g.shadowBlur=12;g.shadowOffsetY=6;g.fillStyle='#1f3a5f';g.fillRect(50,12,CW-100,160);g.restore();
 g.strokeStyle='#f2c14e';g.lineWidth=6;g.strokeRect(58,20,CW-116,144);
 g.strokeStyle='#7fa6d6';g.lineWidth=2;g.strokeRect(72,34,CW-144,116);
 const star=(x,y,s,c)=>{g.fillStyle=c;g.fillRect(x-s,y-s*3,s*2,s*6);g.fillRect(x-s*3,y-s,s*6,s*2);g.fillRect(x-s*2,y-s*2,s*4,s*4)};
 star(122,92,5,PAL5[ph%5]);star(CW-122,92,5,PAL5[(ph+2)%5]);
 /* judul */
 g.font='46px '+FN;g.textBaseline='alphabetic';g.textAlign='left';let x=(CW-g.measureText(T).width)/2;
 [...T].forEach((ch,i)=>{g.fillStyle='#0d1d33';g.fillText(ch,x+3,92);g.fillStyle=PAL5[(i+ph)%5];g.fillText(ch,x,89);x+=g.measureText(ch).width});
 /* sub: hati + jumlah ucapan */
 const n=all().length,tx=n+' ucapan dari teman-temanmu';g.font='40px '+VT;const tw=g.measureText(tx).width,hw=7*5,sx=(CW-(hw+14+tw))/2;
 g.fillStyle='#e84a5f';HEART.forEach((r,j)=>[...r].forEach((b,k)=>{if(b==='1')g.fillRect(sx+k*5,118+j*5,5,5)}));
 g.textAlign='left';g.fillStyle='#cfe3ff';g.fillText(tx,sx+hw+14,148);ht.needsUpdate=true;
 bulbs.forEach((m,i)=>m.color.set((i+ph)%4===0?'#fff6d0':PAL5[(i+ph)%5]))}
act(hdr,()=>{if(canRead())reader()});

/* ---- thumbnail note: kertas dengan bayangan, lipatan, teks menyesuaikan ---- */
const fit=(g,t,mw,mh,sizes,lh)=>{for(const s of sizes){g.font=s+'px '+VT;const L=wrap(g,t,mw);if(L.length*s*lh<=mh)return{s,L}}
 const s=sizes[sizes.length-1];g.font=s+'px '+VT;const L=wrap(g,t,mw),mx=Math.max(1,Math.floor(mh/(s*lh))),o=L.slice(0,mx);
 if(L.length>mx)o[mx-1]=o[mx-1].replace(/\s*\S{0,3}$/,'')+'...';return{s,L:o}};
noteTex=function(n){const R=all().length>20?384:512,c=document.createElement('canvas');c.width=c.height=R;const g=c.getContext('2d');g.scale(R/512,R/512);
 const M=22,E=512-M,col=n.color||'#f7e27a',F=58;
 g.save();g.shadowColor='rgba(40,25,5,.4)';g.shadowBlur=16;g.shadowOffsetX=4;g.shadowOffsetY=9;g.fillStyle=col;g.fillRect(M,M,E-M,E-M);g.restore();
 const gr=g.createLinearGradient(M,M,E,E);gr.addColorStop(0,'rgba(255,255,255,.28)');gr.addColorStop(1,'rgba(0,0,0,.12)');g.fillStyle=gr;g.fillRect(M,M,E-M,E-M);
 g.fillStyle='rgba(0,0,0,.06)';g.fillRect(M,M,E-M,50);
 /* sudut terlipat */
 g.globalCompositeOperation='destination-out';g.beginPath();g.moveTo(E-F,E);g.lineTo(E,E);g.lineTo(E,E-F);g.closePath();g.fill();g.globalCompositeOperation='source-over';
 g.save();g.shadowColor='rgba(40,25,5,.35)';g.shadowBlur=8;g.shadowOffsetX=-2;g.shadowOffsetY=-2;g.fillStyle=col;g.beginPath();g.moveTo(E-F,E);g.lineTo(E,E-F);g.lineTo(E-F,E-F);g.closePath();g.fill();g.restore();
 g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(E-F,E);g.lineTo(E,E-F);g.lineTo(E-F,E-F);g.closePath();g.fill();
 /* teks */
 g.fillStyle='#3d2f14';g.textBaseline='alphabetic';g.textAlign='left';
 const top=M+78,r=fit(g,n.t||'',408,292,[68,58,50,44,38,34,30],1.06);
 g.font=r.s+'px '+VT;r.L.forEach((l,i)=>g.fillText(l,M+30,top+r.s*.78+i*r.s*1.06));
 g.fillStyle='rgba(61,47,20,.22)';for(let x=M+28;x<E-28;x+=16)g.fillRect(x,E-84,8,2);
 g.fillStyle='#3d2f14';g.font='46px '+VT;g.textAlign='right';g.fillText('- '+(n.from||'anon').slice(0,14),E-F-4,E-30);
 if(n.s&&ST[n.s]){g.save();g.scale(2,2);stk(g,n.s,32,211);g.restore()}
 const t=new THREE.CanvasTexture(c);t.anisotropy=4;return t};

/* ---- penataan note: tidak numpuk, ukuran menyesuaikan jumlah ---- */
const pinned=new Set();
const autoPos=(i,N,h)=>{const cols=N<=2?Math.max(N,1):N<=6?2:N<=12?3:N<=20?4:5,rows=Math.ceil(N/cols),c=i%cols,r=Math.floor(i/cols);
 return{x:(c+.5)/cols*100+((h%9)-4)*.9,y:(r+.5)/rows*100+(((h>>4)%9)-4)*.9}};
const relax=p=>{for(let it=0;it<60;it++){let mv=0;
  for(let a=0;a<p.length;a++)for(let b=a+1;b<p.length;b++){const A=p[a],Bq=p[b],lim=(A.w+Bq.w)/2*.8,dx=Bq.x-A.x,dy=Bq.y-A.y,ox=lim-Math.abs(dx),oy=lim-Math.abs(dy);
   if(ox>0&&oy>0){mv=1;const wa=A.pin?0:Bq.pin?1:.5,wb=A.pin?1:Bq.pin?0:.5;if(A.pin&&Bq.pin)continue;
    if(ox<oy){const d=(dx<0?-1:1)*ox;A.x-=d*wa;Bq.x+=d*wb}else{const d=(dy<0?-1:1)*oy;A.y-=d*wa;Bq.y+=d*wb}}}
  p.forEach(o=>{o.x=clamp(o.x,bp.x-RX/2,bp.x+RX/2);o.y=clamp(o.y,CY-RY/2,CY+RY/2)});if(!mv)break}};
const post=()=>{const N=noteHits.length,sz=N<=6?.8:N<=9?.7:N<=16?.58:N<=28?.48:.4,base=sz/.58,P=[];
 noteHits.forEach((m,i)=>{const n=m.userData.n,h=hash(n),s=[.96,1.04,1.1,1,1.06][h%5],q=n.x==null?autoPos(i,N,h):{x:n.x,y:n.y};
  P.push({m,n,h,s,x:P2X(q.x),y:P2Y(q.y),w:sz*s,pin:pinned.has(key(n))})});
 relax(P);
 P.forEach(({m,n,h,s,x,y},i)=>{const ro=10+i*4;
  m.position.x=x;m.position.y=y;m.position.z=bp.z+.05+i*.002;
  m.scale.set(base*s,base*s,1);m.rotation.z=((h>>3)%9-4)*.03;
  const om=m.material;m.material=new THREE.MeshBasicMaterial({map:om.map,transparent:true,depthWrite:false});om.dispose();m.renderOrder=ro;
  const add=(g,mt,px,py,pz,rz,o)=>{const k=new THREE.Mesh(g,mt);k.position.set(px,py,pz);k.rotation.z=rz||0;k.renderOrder=ro+o;m.add(k);return k};
  if(h%3===0){add(new THREE.PlaneGeometry(.23,.09),new THREE.MeshBasicMaterial({color:'#f3e9c6',transparent:true,opacity:.78,depthWrite:false}),0,.265,.01,((h>>6)%5-2)*.08,1)}
  else{const c=PAL5[(h>>5)%5];
   add(new THREE.CircleGeometry(.042,14),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28,depthWrite:false}),.014,.236,.01,0,1);
   add(new THREE.SphereGeometry(.042,12,10),new THREE.MeshBasicMaterial({color:c,transparent:true,depthWrite:false}),0,.255,.04,0,2);
   add(new THREE.CircleGeometry(.012,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false}),-.013,.268,.085,0,3)}});
 drawH();drawP();label()};
const disp=m=>{if(m.material){if(m.material.map)m.material.map.dispose();m.material.dispose()}};
const _r=renderWall;renderWall=function(){if(dr){_r();return}noteHits.forEach(disp);_r();post()};
/* seret note: batas = area gabus; simpan persen relatif terhadap papan */
const _pm=cv.onpointermove;cv.onpointermove=e=>{_pm(e);if(dr&&dr.userData.n){dr.position.x=clamp(dr.position.x,bp.x-RX/2,bp.x+RX/2);dr.position.y=clamp(dr.position.y,CY-RY/2,CY+RY/2)}};
saveMove=async function(m){const n=m.userData.n,x=Math.round(X2P(m.position.x)*10)/10,y=Math.round(Y2P(m.position.y)*10)/10;n.x=x;n.y=y;pinned.add(key(n));
 if(n.id&&db){try{await fs.updateDoc(fs.doc(db,'notes',n.id),{x,y})}catch(e){console.warn(e)}}else if(!n.id)ls('bday-notes',JSON.stringify(cloud))};

/* ---- note baru: ditaruh di bagian gabus yang paling kosong ---- */
const freeSpot=()=>{const pts=noteHits.map(m=>({x:X2P(m.position.x),y:Y2P(m.position.y)}));let best={x:50,y:50},bd=-1;
 for(let k=0;k<90;k++){const c={x:8+Math.random()*84,y:8+Math.random()*84};let d=1e9;pts.forEach(p=>{d=Math.min(d,Math.hypot((p.x-c.x)*RX,(p.y-c.y)*RY))});if(d>bd){bd=d;best=c}}
 return{x:Math.round(best.x*10)/10,y:Math.round(best.y*10)/10}};
saveNote=async function(n){n={...n,...freeSpot()};
 if(db){try{await fs.addDoc(fs.collection(db,'notes'),{from:n.from,t:n.t,color:n.color,x:n.x,y:n.y,createdAt:fs.serverTimestamp()});return}catch(e){console.warn(e)}}
 cloud.push(n);ls('bday-notes',JSON.stringify(cloud));renderWall()};

/* ---- kartu baca ucapan (dipakai tap satu note & mode baca semua) ---- */
const canRead=()=>ls('bday-aqsa')==='1'; /* flag yang diset secret3d.js saat kode kamar rahasia benar */
const RK='bday-read-notes',rs=()=>{try{return new Set(JSON.parse(ls(RK)||'[]'))}catch(e){return new Set()}};
const unread=()=>{const s=rs();return all().filter(n=>!s.has(key(n))).length};
const rbtn=document.createElement('button');rbtn.className='btn';rbtn.style.cssText='background:#e84a5f;box-shadow:inset -4px -4px 0 #a82a3d,4px 4px 0 var(--ink)';
$('#sticky').after(rbtn);rbtn.onclick=()=>reader();
function label(){const u=unread();rbtn.textContent='baca semua ucapan'+(u?' ('+u+' baru)':'')}
function openCards(L,start,nav){
 const seen=rs();let i=start,tx=0,dirn=1;
 openM('<div class="wwrap"><h2>ucapan buat Aqsa</h2><div id="rc"></div>'+(nav?'<div class="wnav"><button class="btn" id="rb" aria-label="sebelumnya">&lt;</button><div class="wprog"><div class="wtrack"><div class="wbar" id="rbar"></div></div><span class="px" id="rn"></span></div><button class="btn alt" id="rf" aria-label="berikutnya">&gt;</button></div>':'')+'</div>');
 const show=k=>{i=clamp(k,0,L.length-1);const n=L[i],kk=key(n),fresh=nav&&!seen.has(kk),nm=(n.from||'anon');
  if(nav&&!rs().has(kk)){const s=rs();s.add(kk);ls(RK,JSON.stringify([...s]))}
  const p=document.createElement('div');p.className='wcard';p.style.background=n.color||'#f7e27a';p.style.setProperty('--wd',dirn*28+'px');
  p.innerHTML='<i class="wtape"></i><div class="wtop"><div class="wav"></div><div><b class="px wnm"></b><small class="wno">untuk Aqsa</small></div>'+(fresh?'<span class="wnew">baru</span>':'')+'</div><div class="wrt"></div><div class="wft"><span class="wst"></span><span class="wfrom"></span></div>';
  const av=p.querySelector('.wav');av.textContent=nm.trim().charAt(0).toUpperCase()||'?';av.style.background=AVC[hash(n)%5];
  p.querySelector('.wnm').textContent=nm;p.querySelector('.wrt').textContent=n.t||'';p.querySelector('.wfrom').textContent='- '+nm;
  if(n.s&&ST[n.s])p.querySelector('.wst').appendChild(spr(ST[n.s],4));
  $('#rc').replaceChildren(p);
  if(nav){$('#rn').textContent=(i+1)+' / '+L.length;$('#rbar').style.width=((i+1)/L.length*100)+'%'}};
 if(!nav){onClose=()=>label();show(start);return}
 $('#rb').onclick=()=>{dirn=-1;show(i-1)};$('#rf').onclick=()=>{dirn=1;show(i+1)};
 const rc=$('#rc');rc.ontouchstart=e=>tx=e.touches[0].clientX;rc.ontouchend=e=>{const d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50){dirn=d<0?1:-1;show(i+dirn)}};
 const kd=e=>{if(e.key==='ArrowLeft'){dirn=-1;show(i-1)}if(e.key==='ArrowRight'){dirn=1;show(i+1)}};addEventListener('keydown',kd);
 onClose=()=>{removeEventListener('keydown',kd);label()};show(start)}
function reader(){
 if(!canRead())return;
 const L=all().slice().reverse();
 if(!L.length){openM('<h2>ucapan buat Aqsa</h2><p>belum ada ucapan.</p>');return}
 openCards(L,0,true)}

/* ---- loop kecil: header berkedip + tombol ikut tampil/hilang seperti tombol sticky ---- */
let lt=0;(function loop(t){requestAnimationFrame(loop);rbtn.style.display=canRead()?$('#sticky').style.display:'none';if(t-lt>500){lt=t;ph++;drawH()}})(0);
if(document.fonts){document.fonts.load('46px "Press Start 2P"').then(drawH);document.fonts.load('54px VT323').then(()=>{drawP();renderWall()})}
renderWall();
})();