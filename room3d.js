/* room3d.js — taruh sefolder dengan index.html, muat SETELAH script utama (sebelum </body>):
   <script src="room3d.js"></script>
   Isi: jendela pixel (siang/malam/hujan), langit berbintang di luar, rak buku berisi buku, pintu -> ruang galeri kenangan (polaroid),
   kunang-kunang, lampu string, poster, beanbag, seikat balon, kucing bisa dielus, pengunjung & Aqsa keliling ruangan (lihat bagian KELILING di bawah). */
(()=>{
const bb=(w,h,d,c,x,y,z,p)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);(p||S).add(m);return m};
const mk=(w,h,fn)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;const d=()=>{g.clearRect(0,0,w,h);fn(g);t.needsUpdate=true};d();if(document.fonts)document.fonts.ready.then(d);return{t,d}};
const sprTex=k=>{const t=new THREE.CanvasTexture(spr(ST[k],1));t.magFilter=t.minFilter=THREE.NearestFilter;return t};
const P=(g,c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w||1,h||1)};
const pix=(g,pat,pal,x0,y0)=>pat.forEach((r,y)=>[...r].forEach((ch,x)=>{if(pal[ch])P(g,pal[ch],x0+x,y0+y)}));
const nearest=c=>{const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;return t};
let room=0;

/* ---------- bersihkan sisa objek lama ---------- */
S.children.slice().forEach(o=>{const P2=o.geometry&&o.geometry.parameters;if(o.geometry&&o.geometry.type==='BoxGeometry'&&P2&&((P2.width===1.8&&P2.height===1.8)||(P2.width===.08&&P2.height===1.5)||(P2.width===1.5&&P2.height===.08)))S.remove(o)});
drops.forEach(d=>S.remove(d));S.remove(star);

/* ---------- JENDELA (pixel art, ada pemandangan bukit) ---------- */
const WX=-4.6,WY=3.3,WZ=-5.9;
function skyTex(nt){
 const c=document.createElement('canvas');c.width=c.height=40;const g=c.getContext('2d');
 const bands=nt?['#0d1538','#121c48','#18255a','#202f6b','#2a3a7c']:['#7fc3f2','#96cff5','#add9f8','#c5e5fa','#dcf0fc'];
 bands.forEach((b,i)=>P(g,b,0,i*8,40,8));
 if(nt){
  pix(g,['..yyy...','.yy.....','yy......','yy......','yy......','yy......','.yy.....','..yyy...'],{y:'#fff6c8'},27,4);
  [[3,3],[9,9],[15,4],[21,13],[5,18],[33,17],[18,20],[12,14],[36,8],[24,3],[2,12],[38,22]].forEach(([x,y])=>P(g,'#fff',x,y));
  [[7,6],[31,13],[16,10]].forEach(([x,y])=>{P(g,'#fff',x,y);[[-1,0],[1,0],[0,-1],[0,1]].forEach(([a,b])=>P(g,'#b8c8ff',x+a,y+b))});
 }else{
  pix(g,['..yyy..','.yyyyy.','yyyyyyy','yyyyyyy','yyyyyyy','.yyyyy.','..yyy..'],{y:'#f2c14e'},29,4);
 }
 const h1=nt?'#1b2a5c':'#7cc47f',h2=nt?'#121c45':'#5aa86a';
 for(let x=0;x<40;x++){const a=Math.floor(29+3*Math.sin(x*.22)+2*Math.sin(x*.07+1)),b=Math.floor(34+2*Math.sin(x*.3+2));P(g,h1,x,a,1,40-a);P(g,h2,x,b,1,40-b)}
 if(nt)[[8,36],[9,36],[26,37],[27,37],[30,36],[14,38]].forEach(([x,y])=>P(g,'#f2c14e',x,y));
 else{[[6,35],[7,35],[22,36],[23,36],[34,35]].forEach(([x,y])=>P(g,'#f4a6c0',x,y));[[6,36],[22,37],[34,36]].forEach(([x,y])=>P(g,'#8fd18a',x,y))}
 return nearest(c);
}
const skyD=skyTex(false),skyN=skyTex(true);
sky.geometry=new THREE.BoxGeometry(2,2,.04);sky.material=new THREE.MeshBasicMaterial({map:night?skyN:skyD});sky.position.set(WX,WY,WZ+.02);
const WG=new THREE.Group();WG.position.set(WX,WY,WZ+.04);S.add(WG);
const FW='#f3f8ff',FS='#c7d9ee';
bx(2.5,.18,.3,FW,0,1.09,.14,WG);bx(2.5,.18,.3,FW,0,-1.09,.14,WG);bx(.18,2.5,.3,FW,-1.09,0,.14,WG);bx(.18,2.5,.3,FW,1.09,0,.14,WG);
bx(.06,2,.08,FS,0,0,.04,WG);bx(2,.06,.08,FS,0,0,.04,WG);
bx(2.9,.1,.55,'#dbe9fb',0,-1.22,.22,WG);
/* tanaman + lilin di ambang jendela */
bx(.22,.2,.22,'#c98b52',-.8,-1.07,.25,WG);bx(.04,.32,.04,'#4fa05a',-.8,-.85,.25,WG);bx(.24,.06,.1,'#8fd18a',-.68,-.8,.25,WG);bx(.24,.06,.1,'#8fd18a',-.92,-.7,.25,WG);bx(.14,.14,.14,'#f4a6c0',-.8,-.62,.25,WG);
cy(.07,.07,.22,'#f3f8ff',.75,-1.06,.25,WG);bb(.05,.08,.05,'#ffd24a',.75,-.9,.25,WG);
/* tirai berlipat */
[-1,1].forEach(s=>{const x=s*1.5;
 for(let i=0;i<4;i++){const c=i%2?'#ec8fb0':'#f4a6c0',xx=x+(i-1.5)*.15;bx(.15,1.45,.12,c,xx,.73,.2+(i%2)*.03,WG);bx(.15,1.1,.12,c,xx,-.65,.2+(i%2)*.03,WG)}
 bx(.62,.12,.17,'#e84a5f',x,-.05,.22,WG)});
bx(3.8,.06,.06,'#2e527f',0,1.5,.2,WG);bx(.1,.1,.1,'#f2c14e',-1.9,1.5,.2,WG);bx(.1,.1,.1,'#f2c14e',1.9,1.5,.2,WG);
const patch=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.7),new THREE.MeshBasicMaterial({color:'#fff6c8',transparent:true,opacity:.22,depthWrite:false}));patch.rotation.x=-Math.PI/2;patch.position.set(WX+.4,.015,WZ+1.5);S.add(patch);
/* awan bergerak, bintang kedip, bintang jatuh, hujan */
const cloudTex=(()=>{const c=document.createElement('canvas');c.width=14;c.height=5;pix(c.getContext('2d'),['....wwww......','..wwwwwwww.ww.','.wwwwwwwwwwwww','wwwwwwwwwwwwww','.bbbbbbbbbbbb.'],{w:'#ffffff',b:'#d4e4f4'},0,0);return nearest(c)})();
const clouds=[[-.25,.55,.9],[.3,.05,.65]].map(([x,y,s])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(.9*s,.32*s),new THREE.MeshBasicMaterial({map:cloudTex,transparent:true}));m.position.set(x,y,.015);m.userData.bx=x;WG.add(m);return m});
const wst=Array.from({length:7},()=>{const s=bb(.05,.05,.02,'#fff',Math.random()*1.7-.85,Math.random()*1-.1,.02,WG);s.userData.ph=Math.random()*6;return s});
const shoot=bb(.26,.04,.02,'#fff',0,0,.04,WG);shoot.visible=false;
const wdr=Array.from({length:16},()=>{const d=bb(.03,.13,.02,'#3b7dd8',Math.random()*1.7-.85,Math.random()*1.7-.85,.045,WG);d.visible=false;return d});
let wRain=0,wShoot=0,wAuto=6,lastRn=null,lastN=null;
act(WG,winClick2);
function winClick2(){if(night){wShoot=1;say3(sky,'make a wish~')}else{wRain=wRain>0?0:6;say3(sky,wRain?'hujan~':'cerah~')}}

/* ---------- langit luar saat malam + kunang-kunang ---------- */
const OS=new THREE.Group();S.add(OS);OS.visible=false;
const starM=new THREE.PointsMaterial({color:'#ffffff',size:.6,transparent:true});
{const N=460,pos=new Float32Array(N*3);for(let i=0;i<N;i++){const a=(Math.random()*2-1)*1.9,e=.02+Math.random()*.55,r=42;pos[i*3]=r*Math.cos(e)*Math.sin(a);pos[i*3+1]=r*Math.sin(e)+2;pos[i*3+2]=-r*Math.cos(e)*Math.cos(a)}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));OS.add(new THREE.Points(g,starM));
 const m=new THREE.Mesh(new THREE.SphereGeometry(2.4,18,14),new THREE.MeshBasicMaterial({color:'#fff6c8'}));m.position.set(-17,12,-38);OS.add(m);const c=new THREE.Mesh(new THREE.SphereGeometry(2.1,18,14),new THREE.MeshBasicMaterial({color:'#141f4a'}));c.position.set(-15.6,12.7,-37);OS.add(c)}
const FF=(()=>{const N=28,b=new Float32Array(N*3);for(let i=0;i<N;i++){b[i*3]=-7+Math.random()*15;b[i*3+1]=.8+Math.random()*3.6;b[i*3+2]=-5+Math.random()*12}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(b.slice(),3));const m=new THREE.PointsMaterial({color:'#ffe9a0',size:.22,transparent:true}),p=new THREE.Points(g,m);p.visible=false;S.add(p);return{p,m,b,N}})();
bulbs.forEach((b,i)=>{const u=i/20;b.position.set(-6.8+u*15.6,4.3-.14*Math.abs(Math.sin(u*Math.PI*5)),-5.88)});
{const cs2=S.children.filter(o=>o.geometry&&o.geometry.type==='ConeGeometry'&&o.geometry.parameters.radialSegments===3);cs2.forEach((f,i)=>{const u=i/Math.max(1,cs2.length-1);f.position.x=-6.8+u*15.6;f.position.y=4.75-.3*Math.sin(u*Math.PI*3.5)-.1})}

/* ---------- RAK BUKU: kerangka terbuka, buku kelihatan ---------- */
while(sh.children.length)sh.remove(sh.children[0]);
{const rnd=(()=>{let s=7;return()=>(s=(s*16807)%2147483647)/2147483647})(),WD='#a8743f',WD2='#5a3b22',BC=['#e84a5f','#4f8fe8','#8fd18a','#f2c14e','#a98bd6','#f4a6c0','#8fd0f0','#e8844a'];
 bx(.06,3.75,2.5,WD2,-.27,1.87,0,sh);bx(.6,3.75,.1,WD,0,1.87,-1.2,sh);bx(.6,3.75,.1,WD,0,1.87,1.2,sh);
 [.05,.95,1.85,2.75,3.7].forEach(y=>bx(.6,.1,2.5,WD,0,y,0,sh));
 [.1,1.0,1.9,2.8].forEach((y,r)=>{let z=-1.12;const end=1.1-(r===3?.55:0);
  if(r===2)CFG.books.forEach(b=>{const w=.17,h=.8;bx(.4,h,w,b.c,0,y+h/2,z+w/2,sh);bx(.02,.12,w*.9,'#f2c14e',.2,y+h*.7,z+w/2,sh);bx(.02,.06,w*.9,'#fff6e0',.2,y+h*.45,z+w/2,sh);z+=w+.015});
  while(z<end-.15){if(rnd()<.07){z+=.2;continue}const w=.1+rnd()*.12,h=.5+rnd()*.28,d=.34+rnd()*.08;bx(d,h,w,BC[(rnd()*8)|0],0,y+h/2,z+w/2,sh);bx(.015,.05,w*.85,'#f3f8ff',d/2,y+h*.62,z+w/2,sh);z+=w+.012}
  if(r===3){bx(.42,.09,.55,'#e84a5f',0,y+.045,.85,sh);bx(.4,.09,.5,'#4f8fe8',0,y+.135,.85,sh);bx(.38,.09,.48,'#f2c14e',0,y+.225,.85,sh);bx(.14,.14,.14,'#c98b52',.05,y+.37,.85,sh)}
  if(r===1){const lb=bx(.36,.7,.12,'#a98bd6',0,y+.36,1.05,sh);lb.rotation.x=-.28}});
}

/* ---------- hati melayang (elus kucing) ---------- */
const HT=sprTex('heart'),fl3=[];
function float3(tex,pos,sz){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));s.scale.set(sz,sz*.85,1);s.position.copy(pos);S.add(s);fl3.push({s,t:1.4,vx:(Math.random()-.5)*.5})}
function hearts(n,o){const p=new THREE.Vector3();o.getWorldPosition(p);p.y+=.9;for(let i=0;i<n;i++){const q=p.clone();q.x+=(Math.random()-.5)*.5;q.y+=Math.random()*.3;setTimeout(()=>float3(HT,q,.32),i*90)}}

/* ---------- poster, beanbag, balon ---------- */
{const p=mk(96,128,g=>{g.fillStyle='#8dbdf7';g.fillRect(0,0,96,128);g.strokeStyle='#1f3a5f';g.lineWidth=4;g.strokeRect(2,2,92,124);stk(g,'star',24,24);stk(g,'star',72,24);stk(g,'cake',48,62);stk(g,'heart',48,98);g.fillStyle='#1f3a5f';g.font='12px "Press Start 2P",monospace';g.textAlign='center';g.fillText('HBD 26',48,121)}),m=new THREE.Mesh(new THREE.PlaneGeometry(.8,1.07),new THREE.MeshBasicMaterial({map:p.t}));m.position.set(-2.3,3.5,-5.87);S.add(m);bx(.9,1.17,.04,'#4f7fb8',-2.3,3.5,-5.9)}
const bean=new THREE.Mesh(new THREE.SphereGeometry(.55,14,10),M('#a98bd6'));bean.scale.y=.6;bean.position.set(-2.3,.33,-4.6);S.add(bean);
act(bean,()=>{bean.scale.y=.4;setTimeout(()=>bean.scale.y=.6,250);say3(bean,'plop~')});
const bunch=new THREE.Group();bunch.position.set(8.2,0,-5.3);S.add(bunch);cy(.2,.25,.15,'#4f7fb8',0,.08,0,bunch);bunch.userData.pop=0;
const bbs=['#e84a5f','#f2c14e','#4f8fe8'].map((c,i)=>{const o=new THREE.Group();o.position.set((i-1)*.35,2.1+i*.15,0);bunch.add(o);const s=new THREE.Mesh(new THREE.SphereGeometry(.34,12,10),M(c));s.scale.y=1.2;o.add(s);bx(.02,1.7,.02,'#1f3a5f',0,-1,0,o);return o});
act(bunch,()=>{if(bunch.userData.pop>0)return;bunch.userData.pop=3;bbs.forEach(b=>b.visible=false);confetti();say3(bunch,'pop!')});

/* ---------- PINTU di dinding utama ---------- */
pot.position.set(1.65,0,-5.3);
const DR=new THREE.Group();DR.position.set(3.2,0,-5.88);S.add(DR);
bx(1.5,2.85,.14,'#5a3b22',0,1.42,0,DR);bx(1.2,2.65,.1,'#c98b52',0,1.32,.06,DR);
bx(.85,.95,.04,'#a8743f',0,1.95,.12,DR);bx(.85,.95,.04,'#a8743f',0,.7,.12,DR);
bb(.05,2.5,.02,'#ffe9a0',-.62,1.3,.1,DR);
const knob=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),M('#f2c14e'));knob.position.set(.45,1.25,.16);DR.add(knob);
const dm=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.55),M('#e84a5f'));dm.rotation.x=-Math.PI/2;dm.position.set(0,.015,.55);DR.add(dm);
{const t=mk(220,36,g=>{g.fillStyle='#1f3a5f';g.font='14px "Press Start 2P",monospace';g.textAlign='center';g.fillText('kenangan',110,24)}),m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.2),new THREE.MeshBasicMaterial({map:t.t,transparent:true}));m.position.set(0,3.08,.09);DR.add(m)}
act(DR,()=>goRoom(2));

/* ---------- RUANG GALERI (scrapbook polaroid) ---------- */
const GR=new THREE.Group();GR.position.set(80,0,0);S.add(GR);GR.visible=false;window.GRP=GR;
const gfl=new THREE.Mesh(new THREE.PlaneGeometry(10,7),M('#dcc7a1'));gfl.rotation.x=-Math.PI/2;GR.add(gfl);
const gbw=new THREE.Mesh(new THREE.PlaneGeometry(10,5),M('#f1e8d4'));gbw.position.set(0,2.5,-3.5);GR.add(gbw);
const glw=new THREE.Mesh(new THREE.PlaneGeometry(7,5),M('#e8dcc2'));glw.rotation.y=Math.PI/2;glw.position.set(-5,2.5,0);GR.add(glw);
bx(10,.4,.1,'#b89968',0,.2,-3.45,GR);bx(.1,.4,7,'#b89968',-4.95,.2,0,GR);
{const t=mk(300,44,g=>{g.fillStyle='#1f3a5f';g.font='16px "Press Start 2P",monospace';g.textAlign='center';g.fillText('ruang kenangan',150,30)}),m=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.47),new THREE.MeshBasicMaterial({map:t.t,transparent:true}));m.position.set(0,4.62,-3.44);GR.add(m)}
const MEM=(typeof EXTRA!=='undefined'&&EXTRA.memories)||[],COLS=[-3.3,0,3.3],ROWS=[3.4,1.3];
MEM.slice(0,6).forEach((m,i)=>{
 const g=new THREE.Group();g.position.set(COLS[i%3],ROWS[(i/3)|0],-3.4);g.rotation.z=[-.04,.03,-.02,.035,-.03,.025][i];GR.add(g);
 bx(1.4,1.7,.01,'#c9b995',.05,-.05,-.02,g);bx(1.4,1.7,.04,'#fffdf3',0,0,0,g);
 const pm=new THREE.MeshBasicMaterial({color:'#cfe0f6'}),ph=new THREE.Mesh(new THREE.PlaneGeometry(1.2,1.2),pm);ph.position.set(0,.17,.025);g.add(ph);
 new THREE.TextureLoader().load(m.src,t=>{pm.map=t;pm.color.set('#ffffff');pm.needsUpdate=true},undefined,()=>{});
 const cp=mk(128,24,gg=>{gg.fillStyle='#1f3a5f';gg.font='8px "Press Start 2P",monospace';gg.textAlign='center';gg.fillText(m.date,64,16)}),cm=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.225),new THREE.MeshBasicMaterial({map:cp.t,transparent:true}));cm.position.set(0,-.65,.025);g.add(cm);
 bb(.5,.14,.02,['#f4a6c0','#f2c14e','#8fd0f0'][i%3],0,.86,.03,g).rotation.z=[.12,-.1,.08,-.14,.1,-.08][i];
 lact(g,()=>openM(`<h2>${esc(m.title)}</h2><img class="big" src="${esc(m.src)}" alt="" onerror="this.remove()"><p class="from" style="margin-top:8px">${esc(m.date)}</p><p style="font-size:22px">${esc(m.story)}</p>`));
});
/* perabot galeri */
{const r=cy(2.2,2.2,.02,'#f4a6c0',0,.01,.7,GR);r.scale.z=.6;const r2=cy(1.8,1.8,.02,'#fff6e0',0,.02,.7,GR);r2.scale.z=.6;
 bx(2.8,.4,.7,'#c98b52',0,.2,-2.7,GR);bx(.7,.14,.55,'#4f8fe8',-.8,.47,-2.7,GR);bx(.7,.14,.55,'#f2c14e',.1,.47,-2.7,GR);bx(.7,.14,.55,'#a98bd6',.9,.47,-2.7,GR);
 cy(.3,.22,.4,'#c98b52',-4.2,.2,-3,GR);bx(.05,.9,.05,'#4fa05a',-4.2,.8,-3,GR);bx(.45,.07,.2,'#8fd18a',-4.0,.7,-3,GR);bx(.45,.07,.2,'#8fd18a',-4.4,1,-3,GR);
 cy(.05,.05,3,'#1f3a5f',4.3,1.5,-3,GR);cy(.35,.2,.5,'#f2c14e',4.3,3.2,-3,GR);cy(.3,.3,.08,'#1f3a5f',4.3,.04,-3,GR)}
const gd=new THREE.Group();gd.position.set(-4.88,0,1.3);GR.add(gd);
bx(.14,2.8,1.5,'#5a3b22',0,1.4,0,gd);bx(.1,2.6,1.2,'#c98b52',.04,1.3,0,gd);bx(.04,.95,.85,'#a8743f',.1,1.95,0,gd);bx(.04,.95,.85,'#a8743f',.1,.7,0,gd);
{const k=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),M('#f2c14e'));k.position.set(.14,1.25,.45);gd.add(k);
 const t=mk(220,36,g=>{g.fillStyle='#1f3a5f';g.font='12px "Press Start 2P",monospace';g.textAlign='center';g.fillText('ruang utama',110,24)}),m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.2),new THREE.MeshBasicMaterial({map:t.t,transparent:true}));m.rotation.y=Math.PI/2;m.position.set(.14,3.08,0);gd.add(m)}
lact(gd,()=>goRoom(0));

/* ---------- pindah ruangan: 0 utama, 1 lounge, 2 galeri ---------- */
function goRoom(r){room=r;curRoom=r;mode=r?1:0;goalT.set([1,40,80][r],2.2,[1,0,0][r]);
 S.children.forEach(o=>{if(o.isLight)return;o.visible=r===0?(o!==LG&&o!==GR):r===1?o===LG:o===GR});
 if(r===0){bedC.visible=csleep>0;cat.visible=!(csleep>0)}
 lgb.textContent=r===0?'lounge':'ruang utama';vb.style.display='';$('#sticky').style.display=r===0?'':'none';sayEl.style.display='none'}
lgb.onclick=()=>goRoom(room?0:1);

/* ---------- animasi tiap frame ---------- */
function winFx2(dt,t){
 const nt=night,rn=wRain>0&&!nt;if(wRain>0)wRain-=dt;
 if(nt!==lastN){lastN=nt;sky.material.map=nt?skyN:skyD;sky.material.needsUpdate=true;patch.material.color.set(nt?'#8fb0ff':'#fff6c8');patch.material.opacity=nt?.16:.22}
 sky.material.color.set(rn?'#b8c4d6':'#ffffff');
 if(rn!==lastRn){lastRn=rn;clouds.forEach(m=>m.material.color.set(rn?'#9fb0c8':'#ffffff'))}
 clouds.forEach((m,i)=>{m.visible=!nt;m.position.x=m.userData.bx+Math.sin(t*.25+i*2)*.3});
 wst.forEach(s=>{s.visible=nt;s.scale.setScalar(.6+.8*Math.abs(Math.sin(t*2+s.userData.ph)))});
 wdr.forEach(d=>{d.visible=rn;if(rn){d.position.y-=1.8*dt;if(d.position.y<-.9){d.position.y=.9;d.position.x=Math.random()*1.7-.85}}});
 if(nt){wAuto-=dt;if(wAuto<=0&&wShoot<=0){wShoot=1;wAuto=9+Math.random()*9}}
 if(wShoot>0){wShoot-=dt;const u=1-Math.max(0,wShoot);shoot.visible=nt;shoot.position.set(.9-1.8*u,.8-u,.04);shoot.rotation.z=.5;if(wShoot<=0)shoot.visible=false}
 const vis=nt&&room===0;OS.visible=vis;FF.p.visible=vis;starM.opacity=.65+.35*Math.sin(t*2.5);
 if(vis){const a=FF.p.geometry.attributes.position.array;for(let i=0;i<FF.N;i++){a[i*3]=FF.b[i*3]+Math.cos(t*.5+i*1.3)*.4;a[i*3+1]=FF.b[i*3+1]+Math.sin(t*.8+i)*.3}FF.p.geometry.attributes.position.needsUpdate=true;FF.m.opacity=.6+.4*Math.sin(t*3)}
 for(let i=fl3.length-1;i>=0;i--){const f=fl3[i];f.t-=dt;f.s.position.y+=.8*dt;f.s.position.x+=f.vx*dt;f.s.material.opacity=Math.min(1,f.t*1.5);if(f.t<=0){S.remove(f.s);fl3.splice(i,1)}}
 bbs.forEach((b,i)=>b.rotation.z=Math.sin(t*1.3+i*2)*.07);
 if(bunch.userData.pop>0){bunch.userData.pop-=dt;if(bunch.userData.pop<=0)bbs.forEach(b=>b.visible=true)}
 if(room===0){bedC.visible=csleep>0}
}

/* ---------- font digit pixel 3x5 ---------- */
const FONT={'0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],'3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],'6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],'9':['111','101','111','001','111'],'+':['000','010','111','010','000']};
const txt=(g,s,x,y,c)=>{[...s].forEach((ch,i)=>{const f=FONT[ch];if(f)f.forEach((r,yy)=>[...r].forEach((v,xx)=>{if(v==='1')P(g,c,x+i*4+xx,y+yy)}))})};
const shade=(h,a)=>{const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.min(255,v+a));return'#'+[(n>>16)&255,(n>>8)&255,n&255].map(v=>f(v).toString(16).padStart(2,'0')).join('')};

/* ---------- MINI GAME TANGKAP BALON (tampilan pixel baru) ---------- */
const BPAT=['..bbbbb..','.bWWbbbb.','bbWbbbbbb','bWbbbbbbb','bbbbbbbbb','bbbbbbbbd','bbbbbbbdd','.bbbbbdd.','..bbbdd..','...bbd...','....d....','....k....','...k.....','....k....'];
const CPAT=['....wwww......','..wwwwwwww.ww.','.wwwwwwwwwwwww','wwwwwwwwwwwwww','.bbbbbbbbbbbb.'];
function game2(){
 const W=150,H=200,DUR=30,COLS=['#4f8fe8','#a98bd6','#e84a5f','#f4a6c0','#8fd18a'];
 openM(`<h2>tangkap balon</h2><div class="px" style="display:flex;justify-content:space-between;font-size:11px"><span id="gsc">SKOR 0</span><span id="gtm">${DUR}s</span></div><div style="height:10px;border:3px solid var(--ink);background:#e3efff;margin:6px 0 8px"><i id="gbi" style="display:block;height:100%;width:100%;background:var(--hot)"></i></div><div style="position:relative;max-width:340px;margin:0 auto"><canvas id="gc" width="${W}" height="${H}" style="width:100%;display:block;image-rendering:pixelated;border:4px solid var(--ink);touch-action:none"></canvas><div id="gov" style="position:absolute;inset:4px;background:rgba(31,58,95,.72);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:12px;color:#fff"></div></div><div id="lb"></div>`);
 const c=$('#gc'),g=c.getContext('2d'),gm=new Audio('game.mp3');g.imageSmoothingEnabled=false;gm.loop=true;gm.volume=.4;
 const mkB=col=>{const cv=document.createElement('canvas');cv.width=9;cv.height=14;pix(cv.getContext('2d'),BPAT,{b:col,d:shade(col,-55),W:'#ffffff',k:'#1f3a5f'},0,0);return cv},SP=COLS.map(mkB),SG=mkB('#f2c14e');
 let px=W/2,tx=W/2,bl=[],pt=[],ft=[],sc=0,tl=DUR,last=0,sp=0,run=false,raf=0,tt=0;const cl=[{x:20,y:24,v:4},{x:96,y:48,v:6}];
 const kd=e=>{if(e.key==='ArrowLeft')tx=clamp(tx-10,14,W-14);else if(e.key==='ArrowRight')tx=clamp(tx+10,14,W-14)};document.addEventListener('keydown',kd);
 onClose=()=>{run=false;cancelAnimationFrame(raf);gm.pause();document.removeEventListener('keydown',kd)};
 c.onpointermove=c.onpointerdown=e=>{const r=c.getBoundingClientRect();tx=clamp((e.clientX-r.left)/r.width*W,14,W-14)};
 const basket=(x,y)=>{x=Math.round(x);P(g,'#8a5a34',x-12,y-5,25,1);P(g,'#8a5a34',x-12,y-5,1,5);P(g,'#8a5a34',x+12,y-5,1,5);P(g,'#8a5a34',x-13,y,27,2);for(let r=0;r<10;r++){const w=26-(r>>1)*2,x0=x-(w>>1);P(g,'#c98b52',x0,y+2+r,w,1);for(let k=(r%2)*2;k<w;k+=4)P(g,'#a8743f',x0+k,y+2+r,1,1)}};
 function draw(){
  ['#7fc3f2','#96cff5','#add9f8','#c5e5fa','#dcf0fc'].forEach((b,i)=>P(g,b,0,i*38,W,40));
  cl.forEach(o=>pix(g,CPAT,{w:'#fff',b:'#d4e4f4'},o.x|0,o.y|0));
  P(g,'#7cc47f',0,H-10,W,10);P(g,'#5aa86a',0,H-10,W,2);for(let x=3;x<W;x+=11)P(g,x%22<11?'#f4a6c0':'#f2c14e',x,H-6,1,1);
  bl.forEach(b=>{g.drawImage(b.gold?SG:SP[b.c],Math.round(b.x)-4,Math.round(b.y));if(b.gold&&Math.floor(tt*8)%2)P(g,'#fff',Math.round(b.x)+6,Math.round(b.y)+2,1,1)});
  basket(px,H-24);
  pt.forEach(p=>P(g,p.c,p.x|0,p.y|0,2,2));
  ft.forEach(o=>{txt(g,o.s,(o.x|0)+1,(o.y|0)+1,'#1f3a5f');txt(g,o.s,o.x|0,o.y|0,o.c)});
 }
 const hud=()=>{$('#gsc').textContent='SKOR '+sc;$('#gtm').textContent=Math.max(0,Math.ceil(tl))+'s';const b=$('#gbi');b.style.width=Math.max(0,tl/DUR*100)+'%';b.style.background=tl<=8?'#e84a5f':'var(--hot)'};
 function loop(ts){if(!run)return;const dt=Math.min(.05,(ts-last)/1000);last=ts;tl-=dt;sp-=dt;tt+=dt;
  px+=(tx-px)*Math.min(1,dt*14);cl.forEach(o=>{o.x+=o.v*dt;if(o.x>W)o.x=-16});
  if(sp<=0){const gold=Math.random()<.12;bl.push({x:10+Math.random()*(W-20),y:-16,c:Math.random()*5|0,gold,v:(42+(DUR-tl)*2.2+Math.random()*24)*(gold?1.35:1)});sp=Math.max(.35,.55-(DUR-tl)*.006)}
  bl=bl.filter(b=>{b.y+=b.v*dt;const bot=b.y+12;
   if(bot>=H-26&&bot<=H-10&&Math.abs(b.x-px)<12){const s=b.gold?3:1;sc+=s;const col=b.gold?'#f2c14e':COLS[b.c];for(let i=0;i<8;i++)pt.push({x:b.x,y:H-26,vx:(Math.random()-.5)*60,vy:-30-Math.random()*40,c:col,t:.5});ft.push({s:'+'+s,x:b.x-4,y:H-40,t:.7,c:b.gold?'#f2c14e':'#ffffff'});return false}
   if(b.y+14>=H-10){for(let i=0;i<4;i++)pt.push({x:b.x,y:H-12,vx:(Math.random()-.5)*40,vy:-20-Math.random()*20,c:'#b9c4cf',t:.35});return false}return true});
  pt.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=160*dt;p.t-=dt});pt=pt.filter(p=>p.t>0);ft.forEach(o=>{o.y-=18*dt;o.t-=dt});ft=ft.filter(o=>o.t>0);
  hud();draw();if(tl<=0){run=false;end()}else raf=requestAnimationFrame(loop)}
 const ov=$('#gov');
 async function board(){const a=await topS(),el=$('#lb');if(!el)return;const bc=['#f2c14e','#cfd6e0','#c98b52'];el.innerHTML='<h2 style="margin:14px 0 8px">papan skor</h2>'+(a.length?a.map((s,i)=>`<div style="display:flex;justify-content:space-between;padding:4px 8px;background:${i%2?'#e3efff':'#fff'};border:2px solid var(--ink);border-left:10px solid ${bc[i]||'#9cc4f0'};margin-top:-2px;font-size:24px"><span>${i+1}. ${esc(s.name)}</span><b>${s.score}</b></div>`).join(''):'<p style="font-size:22px">belum ada skor</p>')}
 function end(){gm.pause();const win=sc>=40;if(win){ls('bday-unlock','1');confetti();refreshT()}
  ov.style.display='flex';ov.innerHTML=`<div class="px" style="font-size:13px;color:#f2c14e">SELESAI!</div><div class="px" style="font-size:24px">${sc}</div><div style="font-size:22px;line-height:1.1">${win?'keren! stiker bonus &amp; trofi terbuka':sc>=30?'dikit lagi 40 buat buka bonus!':sc>=15?'lumayan, coba lagi!':'pemanasan dulu ya'}</div><input id="gn" maxlength="14" placeholder="namamu" value="${esc(ls('bday-name')||'')}" style="max-width:220px;text-align:center"><div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><button class="btn" id="gv">simpan</button><button class="btn alt" id="ga">main lagi</button></div>`;
  $('#ga').onclick=game2;$('#gv').onclick=async()=>{const n=$('#gn').value.trim()||'anon';ls('bday-name',n);$('#gv').disabled=true;$('#gv').textContent='tersimpan';await saveS(n,sc);board()}}
 ov.innerHTML=`<div class="px" style="font-size:13px;line-height:1.6;color:#f2c14e;text-shadow:2px 2px 0 var(--ink)">TANGKAP BALON</div><div style="font-size:22px;line-height:1.1">geser untuk menggerakkan keranjang.<br>balon emas = +3</div><button class="btn" id="gs">start</button>`;
 $('#gs').onclick=()=>{ov.style.display='none';run=true;last=performance.now();raf=requestAnimationFrame(loop);gm.currentTime=0;gm.play().catch(()=>{})};
 draw();board();
}

/* ---------- LEMARI TROFI (terbuka kalau skor game >= 40) ---------- */
const TC=new THREE.Group();TC.position.set(8.2,0,1.0);TC.rotation.y=-Math.PI/2;S.add(TC);
bx(1.4,2.7,.05,'#5a3b22',0,1.35,-.27,TC);bx(.1,2.7,.6,'#a8743f',-.65,1.35,0,TC);bx(.1,2.7,.6,'#a8743f',.65,1.35,0,TC);bx(1.4,.12,.6,'#a8743f',0,2.7,0,TC);bx(1.4,.12,.6,'#5a3b22',0,.06,0,TC);
[.95,1.75].forEach(y=>bx(1.2,.06,.5,'#c98b52',0,y,0,TC));
const tm=[];const tpart=(geo,gold,x,y,z)=>{const mat=M(gold);mat.userData={gold};tm.push(mat);const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);TC.add(m);return m};
tpart(new THREE.BoxGeometry(.34,.08,.22),'#c98b52',-.3,1.02,0);tpart(new THREE.CylinderGeometry(.04,.04,.2,8),'#f2c14e',-.3,1.16,0);tpart(new THREE.CylinderGeometry(.18,.09,.28,10),'#f2c14e',-.3,1.4,0);
tpart(new THREE.TorusGeometry(.1,.02,6,10),'#f2c14e',-.5,1.4,0);tpart(new THREE.TorusGeometry(.1,.02,6,10),'#f2c14e',-.1,1.4,0);
tpart(new THREE.BoxGeometry(.3,.08,.2),'#c98b52',.3,1.02,0);tpart(new THREE.CylinderGeometry(.02,.02,.3,6),'#cfd6e0',.3,1.2,0);tpart(new THREE.SphereGeometry(.17,10,8),'#e84a5f',.3,1.5,0).scale.y=1.2;
tpart(new THREE.BoxGeometry(.4,.08,.22),'#c98b52',-.3,1.82,0);tpart(new THREE.BoxGeometry(.28,.28,.06),'#f2c14e',-.3,2.1,0).rotation.z=Math.PI/4;
tpart(new THREE.CylinderGeometry(.16,.16,.04,14),'#f2c14e',.3,2.0,0).rotation.x=Math.PI/2;
{const t=mk(160,32,g=>{g.fillStyle='#f2c14e';g.font='12px "Press Start 2P",monospace';g.textAlign='center';g.fillText('TROFI',80,22)}),m=new THREE.Mesh(new THREE.PlaneGeometry(.8,.16),new THREE.MeshBasicMaterial({map:t.t,transparent:true}));m.position.set(0,2.4,-.23);TC.add(m)}
const lockG=new THREE.Group();lockG.position.set(0,1.4,.33);TC.add(lockG);bx(.26,.22,.06,'#f2c14e',0,0,0,lockG);{const sh2=new THREE.Mesh(new THREE.TorusGeometry(.08,.025,6,10,Math.PI),M('#cfd6e0'));sh2.position.y=.11;lockG.add(sh2)}
const glass=new THREE.Mesh(new THREE.BoxGeometry(1.2,2.5,.03),new THREE.MeshBasicMaterial({color:'#cfe8ff',transparent:true,opacity:.16,depthWrite:false}));glass.position.set(0,1.4,.29);TC.add(glass);
function refreshT(){const u=!!ls('bday-unlock');tm.forEach(m=>m.color.set(u?m.userData.gold:'#3d4f6b'));lockG.visible=!u}
refreshT();setInterval(refreshT,1500);
act(TC,()=>say3(TC,ls('bday-unlock')?'trofi pemburu balon!':'terkunci: main balon, skor 40+'));

/* ---------- KONSOL + PONG DI TV ---------- */
const scr=document.createElement('canvas');scr.width=44;scr.height=28;const sg=scr.getContext('2d'),scrT=nearest(scr);
const tvP=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.7),new THREE.MeshBasicMaterial({map:scrT}));tvP.position.set(0,1.05,.112);tvG.add(tvP);tvP.visible=false;
let tvOn=false;const pgm={x:22,y:14,vx:20,vy:11,l:12,r:12,sl:0,sr:0};
const consG=new THREE.Group();consG.position.set(-.5,.64,-4.92);S.add(consG);bx(.42,.07,.24,'#f3f8ff',0,0,0,consG);const ledM=bb(.05,.05,.02,'#e84a5f',.14,.01,.13,consG);
const ctrl=new THREE.Group();ctrl.position.set(.5,.04,-4.1);S.add(ctrl);bx(.34,.07,.2,'#2e527f',0,0,0,ctrl);bx(.1,.07,.2,'#2e527f',-.2,0,.02,ctrl);bx(.1,.07,.2,'#2e527f',.2,0,.02,ctrl);bx(.07,.02,.07,'#f3f8ff',-.1,.045,0,ctrl);bx(.04,.02,.04,'#e84a5f',.1,.045,.03,ctrl);bx(.04,.02,.04,'#f2c14e',.15,.045,-.02,ctrl);
function tvToggle(){tvOn=!tvOn;SFX.pop();say3(consG,tvOn?'p1 ready!':'bye~')}
act(consG,tvToggle);act(ctrl,tvToggle);
function pongReset(){const p=pgm;p.x=22;p.y=6+Math.random()*16;p.vx=(Math.random()<.5?-1:1)*20;p.vy=(Math.random()<.5?-1:1)*(8+Math.random()*6)}
function pongStep(dt){const p=pgm;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y<2){p.y=2;p.vy=Math.abs(p.vy)}if(p.y>26){p.y=26;p.vy=-Math.abs(p.vy)}
 p.l+=clamp(p.y-p.l,-16*dt,16*dt);p.r+=clamp(p.y-p.r,-9*dt,9*dt);
 if(p.x<5){if(Math.abs(p.y-p.l)<5.5){p.x=5;p.vx=Math.min(45,Math.abs(p.vx)*1.04)}else{p.sr=(p.sr+1)%10;pongReset()}}
 else if(p.x>39){if(Math.abs(p.y-p.r)<5.5){p.x=39;p.vx=-Math.min(45,Math.abs(p.vx)*1.04)}else{p.sl=(p.sl+1)%10;pongReset()}}
 sg.fillStyle='#0b1130';sg.fillRect(0,0,44,28);for(let y=0;y<28;y+=4)P(sg,'#2a3a78',21,y,2,2);P(sg,'#8fd0f0',2,Math.round(p.l-4),2,8);P(sg,'#f4a6c0',40,Math.round(p.r-4),2,8);P(sg,'#fff',Math.round(p.x)-1,Math.round(p.y)-1,2,2);txt(sg,String(p.sl),14,2,'#8fd0f0');txt(sg,String(p.sr),27,2,'#f4a6c0');scrT.needsUpdate=true}

/* ---------- TELEPON BARU (model retro merah) ---------- */
while(ph.children.length)ph.remove(ph.children[0]);
const phRed='#e84a5f',phDk='#b0293f';
bx(.52,.14,.42,phRed,0,-.055,0,ph);bx(.42,.1,.32,phRed,0,.065,.02,ph);
cy(.11,.11,.02,'#f3f8ff',0,.125,.05,ph);cy(.04,.04,.03,'#1f3a5f',0,.135,.05,ph);
for(let i=0;i<9;i++){const a=-2.4+i*.55;bx(.03,.012,.03,'#1f3a5f',Math.cos(a)*.08,.138,.05+Math.sin(a)*.08,ph)}
bx(.05,.08,.05,phDk,-.2,.16,-.1,ph);bx(.05,.08,.05,phDk,.2,.16,-.1,ph);
bx(.5,.06,.1,phDk,0,.22,-.1,ph);cy(.07,.07,.1,phDk,-.26,.19,-.1,ph);cy(.07,.07,.1,phDk,.26,.19,-.1,ph);
const phLed=bb(.04,.04,.04,'#8fd18a',.2,.12,.15,ph);

/* ---------- MESIN ARCADE BARU ---------- */
while(ar.children.length)ar.remove(ar.children[0]);
const arcC=document.createElement('canvas');arcC.width=48;arcC.height=36;const ag=arcC.getContext('2d'),arcT=nearest(arcC);
const ARB=['.bbb.','bWbbb','bbbbb','bbbbb','.bbb.','..d..','..k..'],arcCols=['#4f8fe8','#a98bd6','#e84a5f','#f4a6c0','#8fd18a','#f2c14e'];
{const BD='#3b7dd8',BD2='#2557a8',DK='#10203d',YL='#f2c14e';
 bx(.94,.1,1.0,DK,0,.05,0,ar);
 [-1,1].forEach(sg2=>{bx(.1,2.3,.95,BD,sg2*.42,1.15,0,ar);bx(.11,2.3,.08,YL,sg2*.42,1.15,.44,ar);bx(.11,.06,.95,YL,sg2*.42,.8,0,ar)});
 bx(.74,2.2,.08,BD2,0,1.15,-.44,ar);bx(.74,.85,.06,BD2,0,.55,.45,ar);
 bx(.26,.3,.02,DK,0,.58,.49,ar);bb(.04,.1,.02,YL,-.05,.6,.5,ar);bb(.04,.1,.02,'#e84a5f',.05,.6,.5,ar);bx(.12,.06,.02,'#1f3a5f',0,.45,.49,ar);
 bx(.76,.12,.62,DK,0,1.05,.28,ar);bx(.7,.03,.52,'#2e527f',0,1.125,.3,ar);
 cy(.05,.05,.03,'#cfd6e0',-.2,1.155,.3,ar);cy(.012,.012,.16,'#cfd6e0',-.2,1.24,.3,ar);
 const ball=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),M('#e84a5f'));ball.position.set(-.2,1.34,.3);ar.add(ball);
 ['#e84a5f','#f2c14e','#8fd18a'].forEach((c,i)=>cy(.04,.04,.03,c,.02+i*.12,1.155,.34,ar));
 bx(.74,.7,.5,DK,0,1.55,-.05,ar);bx(.74,.1,.5,BD2,0,1.94,-.05,ar);bx(.7,.62,.04,'#1b2a5c',0,1.57,.22,ar);
 const scrA=new THREE.Mesh(new THREE.PlaneGeometry(.58,.44),new THREE.MeshBasicMaterial({map:arcT}));scrA.position.set(0,1.58,.245);ar.add(scrA);
 bx(.82,.32,.42,DK,0,2.15,.02,ar);
 const mqt=mk(160,56,g=>{g.fillStyle='#10203d';g.fillRect(0,0,160,56);g.fillStyle='#f2c14e';g.fillRect(0,0,160,4);g.fillRect(0,52,160,4);g.fillStyle='#ffd24a';g.shadowColor='#ffd24a';g.shadowBlur=8;g.font='20px "Press Start 2P",monospace';g.textAlign='center';g.fillText('ARCADE',80,36)});
 const mq=new THREE.Mesh(new THREE.PlaneGeometry(.72,.26),new THREE.MeshBasicMaterial({map:mqt.t}));mq.position.set(0,2.15,.232);ar.add(mq);
 bx(.94,.08,.95,BD2,0,2.34,0,ar)}
function arcStep(t){
 ag.fillStyle='#0b1130';ag.fillRect(0,0,48,36);
 for(let i=0;i<10;i++)P(ag,i%3?'#2a3a78':'#8fd0f0',(i*17)%48,(i*11+Math.floor(t*6))%32);
 for(let i=0;i<5;i++){const y=((t*9+i*13)%40)-8;pix(ag,ARB,{b:arcCols[i%6],W:'#ffffff',d:'#1f3a5f',k:'#1f3a5f'},4+i*9,Math.floor(y))}
 const bxx=Math.floor(24+Math.sin(t*1.7)*16);P(ag,'#c98b52',bxx-5,31,11,4);P(ag,'#8a5a34',bxx-5,31,11,1);
 txt(ag,String(Math.floor(t*3)%100).padStart(2,'0'),2,1,'#f2c14e');arcT.needsUpdate=true}

/* ---------- PINTU LOUNGE (ruang utama <-> lounge) ---------- */
function mkDoor(par,x,z,ry,label,col,fn){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry;par.add(g);
 bx(1.5,2.85,.14,'#5a3b22',0,1.42,0,g);bx(1.2,2.65,.1,col,0,1.32,.06,g);bx(.85,.95,.04,shade(col,-30),0,1.95,.12,g);bx(.85,.95,.04,shade(col,-30),0,.7,.12,g);
 const k=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),M('#f2c14e'));k.position.set(.45,1.25,.16);g.add(k);
 const t=mk(220,36,gg=>{gg.fillStyle='#1f3a5f';gg.font='14px "Press Start 2P",monospace';gg.textAlign='center';gg.fillText(label,110,24)}),m=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.2),new THREE.MeshBasicMaterial({map:t.t,transparent:true}));m.position.set(0,3.08,.09);g.add(m);
 const mat=new THREE.Mesh(new THREE.PlaneGeometry(1.1,.55),M('#e84a5f'));mat.rotation.x=-Math.PI/2;mat.position.set(0,.015,.55);g.add(mat);
 (par===S?act:lact)(g,fn);return g}
mkDoor(S,-6.93,6.9,Math.PI/2,'lounge','#4f8fe8',()=>goRoom(1));
mkDoor(LG,-4.93,1.2,Math.PI/2,'ruang utama','#c98b52',()=>goRoom(0));

/* ---------- BOLA DISKO BARU (bola cermin + sinar warna) ---------- */
const dmt=(()=>{const c=document.createElement('canvas');c.width=64;c.height=32;const g=c.getContext('2d');for(let y=0;y<8;y++)for(let x=0;x<16;x++){g.fillStyle=['#ffffff','#cfe3ff','#9fc5f5','#e8f1ff','#b7d4ff'][(x*7+y*13)%5];g.fillRect(x*4,y*4,3,3);g.fillStyle='#4a6a9a';g.fillRect(x*4+3,y*4,1,4);g.fillRect(x*4,y*4+3,4,1)}const t=new THREE.CanvasTexture(c);t.magFilter=t.minFilter=THREE.NearestFilter;return t})();
const DM=new THREE.Group();DM.position.set(0,4.5,.4);S.add(DM);
cy(.28,.28,.07,'#2e527f',0,.95,0,DM);cy(.012,.012,.7,'#1f3a5f',0,.6,0,DM);cy(.1,.1,.08,'#f2c14e',0,.52,0,DM);
const disco=new THREE.Mesh(new THREE.SphereGeometry(.5,16,12),new THREE.MeshLambertMaterial({map:dmt}));DM.add(disco);act(disco,()=>$('#rdo').click());
const beams=new THREE.Group();DM.add(beams);beams.visible=false;
const bmM=['#e84a5f','#f2c14e','#8fd0f0','#a98bd6','#8fd18a','#f4a6c0'].map((c,i)=>{const g=new THREE.ConeGeometry(.35,4.6,10,1,true);g.translate(0,-2.3,0);const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:c,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending}));m.rotation.z=(i%2?1:-1)*(.5+(i>>1)*.18);m.rotation.y=i*1.05;beams.add(m);return m});
const dots=Array.from({length:14},(_,i)=>{const m=new THREE.Mesh(new THREE.CircleGeometry(.13,8),new THREE.MeshBasicMaterial({color:['#e84a5f','#f2c14e','#8fd0f0','#a98bd6','#8fd18a'][i%5],transparent:true,opacity:.7,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=.03;m.visible=false;S.add(m);return m});

/* ---------- GELAS BOBA di meja kue ---------- */
const boba=new THREE.Group();boba.position.set(1.05,1.29,.15);S.add(boba);
{const cup=new THREE.Mesh(new THREE.CylinderGeometry(.14,.1,.34,12),new THREE.MeshLambertMaterial({color:'#f3f8ff',transparent:true,opacity:.4,depthWrite:false}));cup.position.y=.17;boba.add(cup)}
const teaL=cy(.125,.095,.26,'#d9b98a',0,.14,0,boba);teaL.material.transparent=true;teaL.material.opacity=.85;
for(let i=0;i<8;i++){const pe=new THREE.Mesh(new THREE.SphereGeometry(.03,6,6),M('#2b2630'));pe.position.set(-.07+(i%4)*.045,.04+(i>3?.045:0),((i*37)%5-2)*.02);boba.add(pe)}
cy(.145,.145,.03,'#f3f8ff',0,.35,0,boba);bx(.025,.5,.025,'#e84a5f',.03,.5,0,boba).rotation.z=-.1;
let sips=0;act(boba,()=>{sips++;if(sips>=4){sips=0;say3(boba,'habis! refill~')}else say3(boba,'slurp~');teaL.scale.y=1-sips*.22;teaL.position.y=.01+.13*teaL.scale.y});

/* ---------- PETA GUNUNG + RANSEL HIKING ---------- */
{const mp2=mk(120,150,g=>{g.fillStyle='#f1e6cf';g.fillRect(0,0,120,150);g.strokeStyle='#8a5a34';g.lineWidth=4;g.strokeRect(2,2,116,146);g.fillStyle='#1f3a5f';g.font='10px "Press Start 2P",monospace';g.textAlign='center';g.fillText('PETA',60,22);
 g.fillStyle='#8fd18a';g.beginPath();g.moveTo(10,110);g.lineTo(45,55);g.lineTo(80,110);g.fill();g.fillStyle='#5aa86a';g.beginPath();g.moveTo(45,110);g.lineTo(85,38);g.lineTo(115,110);g.fill();g.fillStyle='#fff';g.beginPath();g.moveTo(75,54);g.lineTo(85,38);g.lineTo(95,54);g.fill();
 g.strokeStyle='#e84a5f';g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.moveTo(20,132);g.quadraticCurveTo(70,120,60,90);g.quadraticCurveTo(52,70,85,44);g.stroke();g.setLineDash([]);g.fillStyle='#e84a5f';g.font='12px "Press Start 2P",monospace';g.fillText('X',85,38);g.fillStyle='#1f3a5f';g.font='7px "Press Start 2P",monospace';g.fillText('PUNCAK',60,140)}),
 m=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.4),new THREE.MeshBasicMaterial({map:mp2.t}));m.rotation.y=Math.PI/2;m.position.set(-6.94,2.6,5.0);S.add(m);bx(.04,1.5,1.2,'#5a3b22',-6.97,2.6,5.0);
 const PK=MEM.find(x=>/puncak/i.test(x.title))||MEM[0];
 if(PK){act(m,()=>openM(`<h2>${esc(PK.title)}</h2><img class="big" src="${esc(PK.src)}" alt="" onerror="this.remove()"><p class="from" style="margin-top:8px">${esc(PK.date)}</p><p style="font-size:22px">${esc(PK.story)}</p>`))}}
const bpk=new THREE.Group();bpk.position.set(-6.35,0,5.1);S.add(bpk);bx(.4,.75,.55,'#e8844a',0,.375,0,bpk);bx(.12,.35,.4,'#c46a32',.26,.25,0,bpk);bx(.42,.12,.57,'#c46a32',0,.78,0,bpk);bx(.04,.5,.08,'#5a3b22',.21,.4,-.18,bpk);bx(.04,.5,.08,'#5a3b22',.21,.4,.18,bpk);
const stick=bx(.04,1.4,.04,'#8a5a34',-6.6,.7,4.45);stick.rotation.z=-.12;act(bpk,()=>say3(bpk,'siap mendaki!'));

/* ---------- BONEKA PLUP (penguin biru) di beanbag ---------- */
const plush=new THREE.Group();plush.position.set(-2.3,.62,-4.6);S.add(plush);
{const BL='#4f8fe8',mm=(r,c,x,y,z,sz)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),M(c));m.position.set(x,y,z);if(sz)m.scale.z=sz;plush.add(m);return m};
 mm(.27,BL,0,.27,0);mm(.22,'#ffffff',0,.25,.15,.5);mm(.2,BL,0,.62,0);
 bx(.05,.06,.03,'#1f3a5f',-.08,.66,.18,plush);bx(.05,.06,.03,'#1f3a5f',.08,.66,.18,plush);
 const bk2=new THREE.Mesh(new THREE.ConeGeometry(.05,.12,6),M('#f2c14e'));bk2.rotation.x=Math.PI/2;bk2.position.set(0,.6,.22);plush.add(bk2);
 bx(.06,.22,.12,'#2e527f',-.3,.3,0,plush).rotation.z=.25;bx(.06,.22,.12,'#2e527f',.3,.3,0,plush).rotation.z=-.25;bx(.1,.04,.14,'#e8844a',-.1,.02,.08,plush);bx(.1,.04,.14,'#e8844a',.1,.02,.08,plush)}
plush.userData.hop=0;let plI=0;const PL=['halo, aku piplup mini','jangan lupa makan','selamat ulang tahun, Aqsa!','*laper*','mabar nanti?'];
act(plush,()=>{plush.userData.hop=.5;hearts(2,plush);say3(plush,PL[(plI++)%PL.length])});

/* ---------- tick tambahan ---------- */
function tickExtra(dt,t){
 if(room!==0)return;
 tvP.visible=tvOn;ledM.material.color.set(tvOn?'#8fd18a':'#e84a5f');if(tvOn)pongStep(dt);
 disco.rotation.y+=dt*(on?1.8:.3);beams.visible=on;beams.rotation.y+=dt*1.2;bmM.forEach((m,i)=>m.material.opacity=.1+.07*Math.sin(t*5+i*1.1));if(on)disco.material.emissive.setHSL((t*.25)%1,.6,.22);else disco.material.emissive.setHex(0);
 arcStep(t);phLed.material.color.set(Math.floor(t*1.5)%2?'#8fd18a':'#2e527f');lp.children[1].material.emissive.set(night?'#ffcf66':'#000000');
 dots.forEach((d,i)=>{d.visible=on;if(on){const a=t*.7+i*.45,r=1+(i%4)*.75;d.position.x=Math.cos(a)*r;d.position.z=.5+Math.sin(a)*r*.6;d.material.opacity=.35+.35*Math.sin(t*4+i)}});
 if(plush.userData.hop>0){plush.userData.hop-=dt;plush.position.y=.62+Math.sin((1-Math.max(0,plush.userData.hop)/.5)*Math.PI)*.25}else plush.position.y=.62;
}

/* ---------- sambungkan ke kode lama ---------- */
winClick=winClick2;
winFx=function(dt){const tt=performance.now()/1000;steam.forEach((q,i)=>{const u=(tt*.4+i*.33)%1;q.position.y=.3+u*.35;q.position.x=(i-1)*.05+Math.sin(tt*3+i)*.02;q.material.opacity=1-u});disc.rotation.y+=on?dt*3.5:0;winFx2(dt,tt);tickExtra(dt,tt)};
ar.userData.fn=game2;
let pc3=0,pt3=0;
cat.userData.fn=()=>{const nw=Date.now();pc3=nw-pt3<2000?pc3+1:1;pt3=nw;hearts(1,cat);if(pc3>=3){pc3=0;hearts(6,cat);say3(cat,'purr~');SFX.pop();return}hop=.72;say3(cat,'meow~');if(CFG.meow){const a=new Audio(CFG.meow);a.onerror=synth;a.play().catch(synth)}else synth()};
bowl.userData.fn=()=>{hop=.72;fed++;hearts(fed>=5?6:2,cat);if(fed>=5){fed=0;say3(bowl,'kenyang zzz')}else say3(bowl,'nyam~')};

/* ======================================================================
   KELILING: pengunjung & Aqsa berjalan bebas keliling ruangan (menghindari perabot),
   berhenti di benda-benda, joget kalau radio nyala, pindah ruangan lewat pintu.
   Mau ubah perilaku? Cari bagian "EDIT" di bawah.
   ====================================================================== */
/*GEO*/
/* kotak rintangan per ruangan: [xMin,xMax,zMin,zMax] (sudah termasuk jarak aman). 0 utama, 1 lounge, 2 galeri */
const OB=[
 [[-1.9,1.9,-.8,2.3],[-1.2,1.2,-6,-3.8],[1.3,2.05,-6,-4.9],[4.4,6.8,-2.1,-.7],[-7.2,-6,-4.4,-1.6],[-6.9,-5.5,-1.7,-.3],[-6.9,-5.4,-.2,1.2],[-6.9,-5.4,2.7,4.1],[7.6,9,.1,1.9],[-3.1,-1.5,-5.4,-3.9],[7.6,8.9,-5.8,-4.8],[-7,-5.8,4.2,5.7],[-3.8,-3,-2.8,-2],[4.5,5.9,4,4.8],[3.1,3.7,4.2,4.8]],
 [[-4.6,-1,-3.4,-1.8],[0,2.4,-3.4,-2.2],[3,4.8,-3.4,-2],[1.2,2,-.1,.7],[2.7,3.7,.6,1]],
 [[-1.7,1.7,-3.4,-2.1],[-4.6,-3.8,-3.4,-2.6],[4,4.6,-3.4,-2.7]]
];
/* batas lantai yang boleh dijelajahi */
const BND=[{x0:-6.4,x1:8.2,z0:-5.2,z1:7.4},{x0:-4.5,x1:4.7,z0:-3,z1:3.2},{x0:-4.4,x1:4.6,z0:-2.9,z1:3.2}];
/* EDIT: titik tujuan favorit. x,z = tempat berdiri, f = arah hadap, w = lama berhenti (detik), s = ucapan Aqsa, max = maks orang */
const POIS=[
 [{x:-1.1,z:2.9,f:[.3,-1],w:[5,10],s:'kuenya wangi banget',max:3},{x:0,z:2.9,f:[0,-1],w:[5,10],s:'makasih ya udah dateng',max:3},{x:1.1,z:2.9,f:[-.3,-1],w:[5,10],s:'lilinnya lucu banget',max:3},
  {x:-2.4,z:.4,f:[1,0],w:[4,8],max:2},{x:2.4,z:.4,f:[-1,0],w:[4,8],max:2},
  {x:0,z:-3.45,f:[0,-1],w:[6,12],s:'ada yang mau main pong?',max:3},{x:-4.6,z:-4.8,f:[0,-1],w:[5,9],s:'pemandangannya bagus',max:2},
  {x:-5,z:.5,f:[-1,0],w:[6,12],s:'ayo main tangkap balon!',max:1},{x:-5,z:3.4,f:[-1,0],w:[4,8],s:'foto bareng yuk',max:1},
  {x:-5.5,z:-2.8,f:[-1,0],w:[5,10],s:'mau baca buku apa ya',max:2},{x:-5.1,z:-1,f:[-1,0],w:[4,8],s:'lagunya enak',max:1},
  {x:5.6,z:-.35,f:[0,-1],w:[4,8],s:'ada telepon masuk?',max:2},{x:7.1,z:1,f:[1,0],w:[4,7],s:'trofinya keren',max:1},
  {x:8.1,z:-4.2,f:[0,-1],w:[3,6],s:'balonnya lucu',max:2},{x:-2.3,z:-3.5,f:[0,-1],w:[3,6],s:'posternya lucu',max:2},
  {x:-5.3,z:5,f:[-1,0],w:[3,6],s:'ayo mendaki lagi',max:1},{cat:1,w:[4,8],s:'meong~',max:2}],
 [{x:3.9,z:-1.4,f:[0,-1],w:[5,9],max:2},{x:1.2,z:-1,f:[0,-1],w:[6,12],max:3},{x:-2.8,z:-1.1,f:[0,-1],w:[6,10],max:2}],
 [{x:-3.3,z:-1.9,f:[0,-1],w:[5,9],max:2},{x:0,z:-1.7,f:[0,-1],w:[5,9],max:2},{x:3.3,z:-1.9,f:[0,-1],w:[5,9],max:2}]
];
const PADN=.12;
const rin=(r,x,z)=>x>r[0]&&x<r[1]&&z>r[2]&&z<r[3];
const inObs=(rm,x,z)=>OB[rm].some(r=>rin(r,x,z));
function segHit(r,ax,az,cx,cz){
 let t0=0,t1=1;const d=[cx-ax,cz-az],p=[ax,az],lo=[r[0],r[2]],hi=[r[1],r[3]];
 for(let i=0;i<2;i++){
  if(Math.abs(d[i])<1e-9){if(p[i]<=lo[i]||p[i]>=hi[i])return false}
  else{let a=(lo[i]-p[i])/d[i],b=(hi[i]-p[i])/d[i];if(a>b){const s=a;a=b;b=s}if(a>t0)t0=a;if(b<t1)t1=b;if(t0>=t1-1e-6)return false}
 }
 return true;
}
const clearSeg=(rm,ax,az,cx,cz)=>!OB[rm].some(r=>segHit(r,ax,az,cx,cz));
/* graf sudut-sudut perabot, dibuat sekali di awal */
const mkGN=rm=>{const rects=OB[rm],B=BND[rm],ns=[];
 rects.forEach(r=>[[r[0]-PADN,r[2]-PADN],[r[0]-PADN,r[3]+PADN],[r[1]+PADN,r[2]-PADN],[r[1]+PADN,r[3]+PADN]].forEach(([x,z])=>{if(x>=B.x0&&x<=B.x1&&z>=B.z0&&z<=B.z1&&!inObs(rm,x,z))ns.push({x,z,e:[]})}));
 ns.forEach((a,i)=>ns.forEach((b,j)=>{if(j>i&&clearSeg(rm,a.x,a.z,b.x,b.z)){const d=Math.hypot(a.x-b.x,a.z-b.z);a.e.push([j,d]);b.e.push([i,d])}}));
 return ns};
const GN=OB.map((_,rm)=>mkGN(rm));
function findPath(rm,sx,sz,gx,gz){
 if(clearSeg(rm,sx,sz,gx,gz))return[{x:gx,z:gz}];
 const N=GN[rm],n=N.length,dist=new Array(n+2).fill(Infinity),prev=new Array(n+2).fill(-1),done=new Array(n+2).fill(false);
 const pt=i=>i<n?N[i]:i===n?{x:sx,z:sz}:{x:gx,z:gz};dist[n]=0;
 for(let it=0;it<n+2;it++){
  let u=-1,b=Infinity;for(let i=0;i<n+2;i++)if(!done[i]&&dist[i]<b){b=dist[i];u=i}
  if(u<0||u===n+1)break;done[u]=true;
  const rl=(v,d)=>{if(dist[u]+d<dist[v]){dist[v]=dist[u]+d;prev[v]=u}};
  if(u===n){for(let i=0;i<n;i++)if(clearSeg(rm,sx,sz,N[i].x,N[i].z))rl(i,Math.hypot(N[i].x-sx,N[i].z-sz))}
  else{N[u].e.forEach(([v,d])=>rl(v,d));if(clearSeg(rm,N[u].x,N[u].z,gx,gz))rl(n+1,Math.hypot(gx-N[u].x,gz-N[u].z))}
 }
 if(dist[n+1]===Infinity)return null;
 const out=[];for(let i=n+1;i>=0&&i!==n;i=prev[i])out.unshift(pt(i));return out;
}
function eject(rm,p){const B=BND[rm];p.x=Math.max(B.x0,Math.min(B.x1,p.x));p.z=Math.max(B.z0,Math.min(B.z1,p.z));
 for(let k=0;k<4;k++){const r=OB[rm].find(r=>rin(r,p.x,p.z));if(!r)break;
  const c=[[p.x-r[0],'x',r[0]-.02],[r[1]-p.x,'x',r[1]+.02],[p.z-r[2],'z',r[2]-.02],[r[3]-p.z,'z',r[3]+.02]].sort((a,b)=>a[0]-b[0])[0];p[c[1]]=c[2]}}
function rndPt(rm,B){B=B||BND[rm];for(let i=0;i<30;i++){const x=B.x0+Math.random()*(B.x1-B.x0),z=B.z0+Math.random()*(B.z1-B.z0);if(!inObs(rm,x,z))return{x,z}}return{x:(B.x0+B.x1)/2,z:B.z1}}
/*ENDGEO*/

/* ---------- tangan bisa berayun (pivot di bahu) ---------- */
const _b3=build3;
build3=function(v){_b3(v);const c=v.g.children;v.arms=[c[3],c[4]].filter(Boolean);v.arms.forEach(a=>{a.geometry.translate(0,-.25,0);a.position.y=1.28})};
V.forEach(v=>{if(v.legs)build3(v)});
/* area spawn pengunjung di ruang utama: sisi depan, lalu menyebar */
Object.assign(RBD[0],{x0:-5.2,x1:7.6,z0:4.95,z1:7.4});

/* ---------- pelaku: pengunjung (V) & Aqsa (A) ---------- */
function ensure(v){if(v.R)return v.R;
 v.R={wp:[],wait:Math.random()*3,sp:1.1+Math.random()*.5,ph:Math.random()*6,fa:v.g.rotation.y,act:null,dance:false,y:0,poi:-1,hold:0};
 v.L=a=>{if(v.legs){v.legs[0].rotation.x=a;v.legs[1].rotation.x=-a}};
 v.Ar=(a,b)=>{if(v.arms&&v.arms[0]){v.arms[0].rotation.x=a;v.arms[1].rotation.x=b}};
 return v.R}
/* tangan Aqsa (pivot di bahu, ikut berayun saat jalan & joget) */
const avArms=[-1,1].map(q=>{const g=new THREE.Group();g.position.set(q*.34,1.38,0);av.add(g);bx(.15,.28,.15,'#1f78f0',0,-.14,0,g);bx(.13,.26,.13,'#fbe0c8',0,-.41,0,g);return g});
const avHead=new THREE.Object3D();avHead.position.y=1.6;av.add(avHead);
/* papan nama Aqsa di atas kepala, sama seperti pengunjung */
{const tg=new THREE.Sprite(new THREE.SpriteMaterial({map:tagTex('Aqsa'),transparent:true}));tg.scale.set(1.5,.32,1);tg.position.y=2.35;av.add(tg)}
const A={g:av,room:0,isA:true,R:{wp:[],wait:1,sp:1.25,ph:0,fa:av.rotation.y,act:null,dance:false,y:0,poi:-1,hold:0},
 get x(){return av.position.x},set x(q){av.position.x=q},get z(){return av.position.z},set z(q){av.position.z=q},
 L(a){legs[0].rotation.x=a;legs[1].rotation.x=-a},Ar(l,r){avArms[0].rotation.x=l;avArms[1].rotation.x=r}};
{const p={x:av.position.x,z:av.position.z};eject(0,p);av.position.x=p.x;av.position.z=p.z}

function goTo(e,x,z,an){const R=e.R,p={x:e.x,z:e.z};eject(e.room,p);e.x=p.x;e.z=p.z;
 const path=findPath(e.room,e.x,e.z,x,z);
 if(!path){R.wp=[];R.act=null;R.poi=-1;R.wait=1;return false}
 R.wp=path;R.act=an||null;return true}
const occ=(rm,i,e)=>{let n=0;V.forEach(o=>{if(o!==e&&o.room===rm&&o.R&&o.R.poi===i)n++});if(e!==A&&rm===0&&A.R.poi===i)n++;return n};
function pickPoi(e){const rm=e.room,ok=[];(POIS[rm]||[]).forEach((p,i)=>{if(occ(rm,i,e)<(p.max||2))ok.push(i)});return ok.length?ok[Math.random()*ok.length|0]:-1}
function goPoi(e,i){const p=POIS[e.room][i];let x=p.x,z=p.z;
 if(p.cat){if(!cat.visible)return false;x=clamp(cat.position.x,-5,8);z=3}
 else{const jx=x+(Math.random()-.5)*.5,jz=z+(Math.random()-.5)*.5;if(!inObs(e.room,jx,jz)){x=jx;z=jz}}
 if(inObs(e.room,x,z))return false;
 const ok=goTo(e,x,z,{f:p.cat?[0,1]:p.f,w:p.w,s:p.s,cat:!!p.cat});if(ok)e.R.poi=i;return ok}
const dancePt=()=>rndPt(0,{x0:-3.8,x1:3.8,z0:-1.4,z1:4});
function xfer3(v,d){place(v,d.to);v.x=d.sx;v.z=d.sz;const R=v.R;R.wp=[];R.act=null;R.poi=-1;R.dance=false;R.wait=.4+Math.random()*1.2;R.fa=d.to===0&&d.sz<0?0:Math.PI/2;v.L(0);v.Ar(0,0)}
function decide(e){
 const R=e.R,rm=e.room,r=Math.random();R.dance=false;R.poi=-1;
 if(e.isA){
  if(on&&r<.3){const q=dancePt();if(q&&goTo(e,q.x,q.z,{dance:1,w:[6,12],s:'ayo joget!'}))return}
  if(r<.55){const vs=[];V.forEach(v=>{if(v.room===0&&!v.mode&&!v.goal&&!v.xfer)vs.push(v)});
   if(vs.length){const v=vs[Math.random()*vs.length|0],dx=e.x-v.x,dz=e.z-v.z,d=Math.hypot(dx,dz)||1,tx=v.x+dx/d*.95,tz=v.z+dz/d*.95;
    if(!inObs(0,tx,tz)&&goTo(e,tx,tz,{faceTo:v,w:[3,6],s:'hai '+((v.a&&v.a.n)||'tamu')+'!'}))return}}
  if(r<.85){const i=pickPoi(e);if(i>=0&&goPoi(e,i))return}
  const q=rndPt(0);if(!goTo(e,q.x,q.z,null))R.wait=1;return}
 const ds=DRS[rm];
 if(rm?r<.28:r<.05){const d=rm?ds[0]:ds[Math.random()*ds.length|0];e.xfer=d;if(goTo(e,d.x,d.z,null))return;e.xfer=null}
 if(rm===0&&on&&r<.5){const q=dancePt();if(q&&goTo(e,q.x,q.z,{dance:1,w:[7,15]}))return}
 if(r<.82){const i=pickPoi(e);if(i>=0&&goPoi(e,i))return}
 const q=rndPt(rm);if(!goTo(e,q.x,q.z,null))R.wait=1}
function arrive(e){
 const R=e.R,an=R.act;R.act=null;
 if(!e.isA&&e.xfer){const d=e.xfer;e.xfer=null;xfer3(e,d);return}
 if(!an){R.wait=.4+Math.random()*1.6;return}
 if(an.f)R.fa=Math.atan2(an.f[0],an.f[1]);
 if(an.faceTo)R.fa=Math.atan2(an.faceTo.x-e.x,an.faceTo.z-e.z);
 R.dance=!!an.dance;R.wait=an.w[0]+Math.random()*(an.w[1]-an.w[0]);
 if(an.cat&&cat.visible)hearts(1,cat);
 if(e.isA&&an.s&&sayT<=0&&Math.random()<.75){say3(avHead,an.s);sayT=2.6}}
function roam(e,dt){
 const R=e.R;let a=0,al=0,ar=0,y=0,sw=0;
 if(R.hold>0)R.hold-=dt;
 else if(R.wp.length){
  const w=R.wp[0],dx=w.x-e.x,dz=w.z-e.z,d=Math.hypot(dx,dz),stp=R.sp*dt;
  if(d<=stp){e.x=w.x;e.z=w.z;R.wp.shift();if(!R.wp.length)arrive(e)}
  else{e.x+=dx/d*stp;e.z+=dz/d*stp;R.fa=Math.atan2(dx,dz)}
  R.ph+=dt*R.sp*5;a=Math.sin(R.ph)*.6;al=-a*.8;ar=a*.8;
 }else if(R.wait>0){
  R.wait-=dt;
  if(R.dance){R.ph+=dt*9;const s=Math.sin(R.ph),c=Math.cos(R.ph);a=s*.5;al=-2.5+c*.5;ar=-2.5-c*.5;y=Math.abs(s)*.1;sw=Math.sin(R.ph*.5)*.6}
 }else decide(e);
 e.L(a);e.Ar(al,ar);R.y=y;
 const g=e.g;let da=R.fa+sw-g.rotation.y;da=Math.atan2(Math.sin(da),Math.cos(da));g.rotation.y+=da*Math.min(1,dt*9)}

/* ---------- Aqsa: dipanggil dari loop utama (index.html) ---------- */
window.avStep=function(dt){roam(A,dt);av.position.y=A.R.y};
av.userData.fn=()=>{const R=A.R;R.hold=2.4;R.wp=[];R.act=null;R.wait=Math.max(R.wait,.5);R.fa=Math.atan2(cam.position.x-av.position.x,cam.position.z-av.position.z);say3(avHead,CFG.avatarSay)};

/* ---------- loop pengunjung (menggantikan loungeTick lama) ---------- */
loungeTick=function(dt,t){
 if(night!==ln){ln=night;lbw.material.color.set(night?'#2a3a78':'#86b3e6');llw.material.color.set(night?'#34468a':'#9cc4f0');lfl.material.color.set(night?'#4a5a8c':'#c9dbf1');slc.visible=night}
 V.forEach(v=>{
  const R=ensure(v);
  if(v.mode){if(v.mode==='watch'){v.watchT-=dt;if(v.watchT<=0)stand(v)}R.wp=[];R.act=null;R.dance=false;R.wait=.6;R.y=0;v.g.rotation.y=0;v.Ar(0,0)}
  else if(v.goal){R.wp=[];R.act=null;R.dance=false;R.wait=.6;R.y=0;v.Ar(0,0);
   const w=v.goal,sp=2*dt,ex=w.x-v.x,ez=w.z-v.z;
   if(Math.abs(ex)>.001){const q=Math.min(Math.abs(ex),sp);v.x+=Math.sign(ex)*q;v.dx=Math.sign(ex);v.dz=0}else if(Math.abs(ez)>.001){const q=Math.min(Math.abs(ez),sp);v.z+=Math.sign(ez)*q;v.dz=Math.sign(ez);v.dx=0}
   v.t+=dt;const f=Math.floor(v.t*6)%2;if(f!==v.f){v.f=f;paintV(v)}
   v.g.rotation.y=v.dz?(v.dz>0?0:Math.PI):(v.dx>0?Math.PI/2:-Math.PI/2);
   if(Math.abs(w.x-v.x)<.001&&Math.abs(w.z-v.z)<.001){const gm=v.goal.mode;v.x=v.goal.x;v.z=v.goal.z;v.mode=gm;v.goal=null;v.dx=0;v.dz=1;v.watchT=25;v.f=gm==='sit'?3:2;paintV(v)}}
  else roam(v,dt);
 });
 /* saling menjauh kalau terlalu dekat */
 const L=[...V.values()].filter(v=>!v.mode&&!v.goal);
 for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(a.room!==b.room)continue;const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);
  if(d<.5&&d>.001){const k=(.5-d)*.5*Math.min(1,dt*6)/d;a.x-=dx*k;a.z-=dz*k;b.x+=dx*k;b.z+=dz*k}}
 V.forEach(v=>{v.g.position.set(v.x,v.R.y||0,v.z);v.tg.position.set(v.x,2.35,v.z)});
 fish.forEach(f=>{let tg=food.length?food.reduce((a,b)=>Math.abs(b.position.x-(3.9+f.x))+Math.abs(b.position.y-(1.4+f.y))<Math.abs(a.position.x-(3.9+f.x))+Math.abs(a.position.y-(1.4+f.y))?b:a):null;
  if(tg){const dx=tg.position.x-3.9-f.x,dy=tg.position.y-1.4-f.y;f.d=dx>=0?1:-1;f.x+=Math.sign(dx)*Math.min(.9*dt,Math.abs(dx));f.y+=Math.sign(dy)*Math.min(.6*dt,Math.abs(dy));if(Math.abs(dx)<.15&&Math.abs(dy)<.15){LG.remove(tg);food.splice(food.indexOf(tg),1)}}
  else{f.x+=f.d*f.s*dt;f.y+=Math.sin(t+f.s*9)*.1*dt;if(f.x>.55)f.d=-1;else if(f.x<-.55)f.d=1}
  f.y=clamp(f.y,-.35,.4);f.m.position.set(3.9+f.x,1.4+f.y,-2.6);f.m.rotation.y=f.d>0?0:Math.PI});
 food.forEach(m=>{if(m.position.y>1.05)m.position.y-=.5*dt});
};

/* ---------- KALENDER & JAM DINDING (model baru, di dinding kiri, menghadap ke dalam ruangan) ---------- */
/*DRAW*/
function drawCal(g){
 const d=new Date(),y=d.getFullYear(),m=d.getMonth(),B=EXTRA.bday,fd=new Date(y,m,1).getDay(),nd=new Date(y,m+1,0).getDate();
 g.fillStyle='#fffdf3';g.fillRect(0,0,256,300);
 g.fillStyle='#e84a5f';g.fillRect(0,0,256,64);g.fillStyle='#b0293f';g.fillRect(0,60,256,4);
 g.fillStyle='#ffffff';g.textAlign='center';g.textBaseline='alphabetic';
 g.font='15px "Press Start 2P",monospace';g.fillText(MN[m].toUpperCase(),128,32);
 g.font='10px "Press Start 2P",monospace';g.fillText(String(y),128,53);
 g.font='24px VT323,monospace';g.fillStyle='#1f3a5f';
 ['M','S','S','R','K','J','S'].forEach((c,i)=>{g.fillStyle=i===0?'#e84a5f':'#1f3a5f';g.fillText(c,20+i*36,86)});
 g.fillStyle='rgba(31,58,95,.25)';g.fillRect(4,92,248,2);
 for(let k=1;k<=nd;k++){const idx=fd+k-1,c=idx%7,r=(idx/7)|0,cx=20+c*36,top=98+r*33,td=k===d.getDate(),bd=B.m===m+1&&B.d===k;
  if(bd){g.fillStyle='#f4a6c0';g.fillRect(cx-16,top,32,29)}
  if(td){g.strokeStyle='#3b7dd8';g.lineWidth=4;g.strokeRect(cx-15,top+2,30,26)}
  g.fillStyle=bd?'#b0293f':c===0?'#e84a5f':'#1f3a5f';g.font='26px VT323,monospace';g.fillText(String(k),cx,top+23)}
}
function drawClock(g){
 g.fillStyle='#f3f8ff';g.fillRect(0,0,128,128);
 g.strokeStyle='#4f7fb8';g.lineWidth=6;g.beginPath();g.arc(64,64,60,0,Math.PI*2);g.stroke();
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2,big=i%3===0,r1=big?47:52,r2=57;g.strokeStyle='#1f3a5f';g.lineWidth=big?4:2;g.beginPath();g.moveTo(64+Math.sin(a)*r1,64-Math.cos(a)*r1);g.lineTo(64+Math.sin(a)*r2,64-Math.cos(a)*r2);g.stroke()}
 g.fillStyle='#1f3a5f';g.font='20px VT323,monospace';g.textAlign='center';g.textBaseline='middle';
 [['12',64,31],['3',97,64],['6',64,97],['9',31,64]].forEach(([t,x,y])=>g.fillText(t,x,y));
}
/*ENDDRAW*/
S.remove(cl);S.remove(ck);[cl,ck].forEach(o=>{const i=hits.indexOf(o);if(i>=0)hits.splice(i,1)});
S.children.slice().forEach(o=>{const q=o.geometry&&o.geometry.parameters;if(q&&q.width===.14&&q.height===.25&&q.depth===.8)S.remove(o)});
const calG=new THREE.Group();calG.position.set(-6.9,3.2,2.2);calG.rotation.y=Math.PI/2;S.add(calG);
bx(.95,1.2,.05,'#5a3b22',0,0,0,calG);bx(.89,1.14,.05,'#f3f8ff',0,0,.02,calG);
const calT=mk(256,300,drawCal);
const calP=new THREE.Mesh(new THREE.PlaneGeometry(.83,.97),new THREE.MeshBasicMaterial({map:calT.t}));calP.position.set(0,0,.047);calG.add(calP);
[-.25,.25].forEach(x=>bx(.05,.1,.05,'#1f3a5f',x,.6,.03,calG));
act(calG,calOpen);
const clkG=new THREE.Group();clkG.position.set(-6.9,3.2,3.3);clkG.rotation.y=Math.PI/2;S.add(clkG);
{const rim=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.08,20),M('#5a3b22'));rim.rotation.x=Math.PI/2;clkG.add(rim)}
const clkT=mk(128,128,drawClock);
{const fc=new THREE.Mesh(new THREE.CircleGeometry(.34,28),new THREE.MeshBasicMaterial({map:clkT.t}));fc.position.z=.042;clkG.add(fc)}
const hand=(w,h,c,z)=>{const g=new THREE.Group();g.position.z=z;clkG.add(g);bx(w,h,.012,c,0,h*.4,0,g);return g};
const hhG=hand(.05,.2,'#1f3a5f',.056),mhG=hand(.035,.3,'#1f3a5f',.064),shG=hand(.012,.33,'#e84a5f',.072);
{const cap=new THREE.Mesh(new THREE.SphereGeometry(.03,8,6),M('#e84a5f'));cap.position.z=.078;clkG.add(cap)}
act(clkG,()=>{const d=new Date(),t=d.toTimeString().slice(0,5);say3(clkG,(d.getHours()>=22||d.getHours()<5)?t+' udah malam, tidur~':t)});
let calKey='';
function clockStep(){
 if(room!==0)return;
 const d=new Date(),s=d.getSeconds(),m=d.getMinutes()+s/60,h=(d.getHours()%12)+m/60;
 shG.rotation.z=-s/60*Math.PI*2;mhG.rotation.z=-m/60*Math.PI*2;hhG.rotation.z=-h/12*Math.PI*2;
 const k=d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();if(k!==calKey){calKey=k;calT.d()}
}
const _wf=winFx;winFx=function(dt){_wf(dt);clockStep()};

/* ---------- dipakai interact3d.js: avatar pemain berjalan ke benda yang di-tap ---------- */
window.R3={goTo,findPath,eject,inObs,ensure,xfer3,OB,BND,POIS,
 addRoom(rm,obs,bnd,pois){OB[rm]=obs;BND[rm]=bnd;POIS[rm]=pois||[];GN[rm]=mkGN(rm)}};

})();