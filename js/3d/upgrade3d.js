/* upgrade3d.js — muat PALING AKHIR (setelah ui3d.js).
   Isi: poster kucing siamese, zoom jendela (pemandangan baru), zoom papan sticky + sticky note 3D,
   ruang kenangan (lantai kayu, wallpaper, lampu string, kartu polaroid 3D bisa dibalik), model lounge baru. */
(()=>{
const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ease=x=>1-Math.pow(1-x,3),V3=THREE.Vector3,FN='"Press Start 2P",monospace',VT='VT323,monospace';
const cvs=(w,h,f,px)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);if(px)t.magFilter=t.minFilter=THREE.NearestFilter;t.anisotropy=4;
 const o={t,c,g,r(){g.clearRect(0,0,w,h);f(g,w,h);t.needsUpdate=true}};o.r();if(document.fonts)document.fonts.ready.then(()=>o.r());return o};
function rbox(w,h,d,c,r,p,x,y,z){const b=Math.min(.05,d/3);r=Math.min(r==null?.08:r,w/2-b,h/2-b);const hw=w/2-r-b*.8,hh=h/2-r-b*.8,s=new THREE.Shape();
 s.absarc(hw,hh,r,0,1.5708);s.absarc(-hw,hh,r,1.5708,3.1416);s.absarc(-hw,-hh,r,3.1416,4.7124);s.absarc(hw,-hh,r,4.7124,6.2832);
 const g=new THREE.ExtrudeGeometry(s,{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b*.8,bevelSegments:3,curveSegments:8});g.translate(0,0,-(d-2*b)/2);
 const m=new THREE.Mesh(g,M(c));m.position.set(x||0,y||0,z||0);(p||S).add(m);return m}
const wrap=(g,t,mw)=>{const o=[];String(t).split('\n').forEach(p=>{let l='';p.split(/\s+/).forEach(w=>{const q=l?l+' '+w:w;if(l&&g.measureText(q).width>mw){o.push(l);l=w}else l=q});o.push(l)});return o};
const planks=()=>cvs(128,128,g=>{for(let r=0;r<8;r++)for(let k=-1;k<3;k++){const x=(r*37)%64+k*64;g.fillStyle=['#fff','#f1f1f1','#f7f7f7','#ebebeb'][(r+k+8)%4];g.fillRect(x,r*16,64,16);g.fillStyle='#cfcfcf';g.fillRect(x,r*16,64,1);g.fillRect(x,r*16,1,16)}}).t;
const stripes=()=>cvs(64,64,g=>{g.fillStyle='#fff';g.fillRect(0,0,64,64);g.fillStyle='#ececec';for(let x=0;x<64;x+=16)g.fillRect(x,0,8,64);g.fillStyle='#dcdcdc';for(let x=4;x<64;x+=16)for(let y=6;y<64;y+=16)g.fillRect(x,y,2,2)}).t;
const retex=(m,t,rx,ry,col)=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry);m.material=new THREE.MeshLambertMaterial({map:t,color:col||m.material.color.getStyle()})};
const stepF=[];
/* ===== alat bikin tanaman (dipakai lounge): tangkai melengkung + daun lebar, & tanaman lidah mertua ===== */
const _Y3=new V3(0,1,0),_Z3=new V3(0,0,1);
const pLimb=(p,A,B,r,c)=>{const d=new V3().subVectors(B,A),L=d.length(),m=cy(r*.75,r,L,c,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2,p);m.quaternion.setFromUnitVectors(_Y3,d.normalize());return m};
const pLeaf=(p,P,dir,len,w,c)=>{const d=dir.clone().normalize(),m=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),M(c));m.scale.set(w/2,.025,len/2);m.position.copy(P).addScaledVector(d,len/2);m.quaternion.setFromUnitVectors(_Z3,d);p.add(m);return m};
const pBall=(p,r,c,x,y,z)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),M(c));m.position.set(x,y,z);p.add(m);return m};
function monstera(p,x,z,s,pc,bc){const O=(dx,y,dz)=>new V3(x+dx*s,y*s,z+dz*s),GC=['#4fa05a','#6dc07a','#3f9150','#5fb86a'];
 cy(.36*s,.36*s,.04*s,'#8a5a34',x,.02*s,z,p);cy(.32*s,.26*s,.42*s,pc,x,.25*s,z,p);cy(.335*s,.335*s,.05*s,bc,x,.4*s,z,p);cy(.36*s,.36*s,.05*s,pc,x,.46*s,z,p);cy(.3*s,.3*s,.03*s,'#4a3328',x,.49*s,z,p);
 const A=O(0,.5,0);
 for(let k=0;k<9;k++){const a=k*Math.PI*2/9+.2,r=.26+(k%3)*.1,h=1.05+(k%4)*.24,M1=O(Math.cos(a)*r*.3,.5+(h-.5)*.55,Math.sin(a)*r*.3),B=O(Math.cos(a)*r,h,Math.sin(a)*r);
  pLimb(p,A,M1,.024*s,'#4a8a45');pLimb(p,M1,B,.02*s,'#4a8a45');
  pLeaf(p,B,new V3(Math.cos(a)*.8,.5,Math.sin(a)*.8),.6*s,.38*s,GC[k%4]);
  pLeaf(p,M1,new V3(Math.cos(a+1.1)*.8,.35,Math.sin(a+1.1)*.8),.42*s,.26*s,GC[(k+2)%4])}
 const T=O(0,1.55,.03);pLimb(p,A,T,.026*s,'#4a8a45');pLeaf(p,T,new V3(0,1,.2),.6*s,.34*s,'#6dc07a')}
function snake(p,x,z,s){const CC=['#3f9150','#2f7a45','#4a8a45'];
 cy(.27*s,.21*s,.45*s,'#2e527f',x,.23*s,z,p);cy(.29*s,.29*s,.05*s,'#f2c14e',x,.47*s,z,p);cy(.25*s,.25*s,.03*s,'#4a3328',x,.5*s,z,p);
 for(let i=0;i<11;i++){const a=i*2.4,r=(.03+(i%4)*.045)*s,h=(.8+((i*37)%9)/10)*s,t=.08+(i%3)*.07,d=new V3(Math.cos(a)*Math.sin(t),Math.cos(t),Math.sin(a)*Math.sin(t)),
   m=new THREE.Mesh(new THREE.ConeGeometry(.075*s,h,6),M(CC[i%3]));m.scale.z=.3;m.quaternion.setFromUnitVectors(_Y3,d);
   m.position.set(x+Math.cos(a)*r,.5*s,z+Math.sin(a)*r).addScaledVector(d,h/2);p.add(m)}}

/* ================= SISTEM ZOOM (kamera) ================= */
const Z={on:null,sv:null,ret:false,td:0,ty:0,tp:0,dn:null,mv:0,px:0,py:0,card:null,age:0};
const HUD=['#bar','#hd','#sw'].map(s=>document.querySelector(s)).filter(Boolean);
const bk=document.createElement('button');bk.className='btn alt';bk.textContent='kembali';bk.style.cssText='position:fixed;bottom:16px;left:0;right:0;margin:auto;width:max-content;z-index:12;display:none';document.body.appendChild(bk);
const hint=document.createElement('div');hint.className='px';hint.style.cssText='position:fixed;bottom:72px;left:8px;right:8px;text-align:center;font-size:9px;line-height:1.6;color:#fff;text-shadow:2px 2px 0 #1f3a5f;pointer-events:none;display:none;z-index:12;background:rgba(31,58,95,.88);border:3px solid #f2c14e;box-shadow:3px 3px 0 #0d1d33;padding:9px 12px;width:max-content;max-width:calc(100% - 16px);margin:0 auto';document.body.appendChild(hint);
const fit=(w,h)=>cl(Math.max(h/.828,w/(.828*cam.aspect))*1.12,2.5,30);
function zin(o){if(Z.on)zout(true);if(!Z.sv)Z.sv={g:goalT.clone(),d:dist,y:yaw,p:pit};Z.on=o;Z.ret=false;Z.age=0;goalT.copy(o.tgt);Z.td=fit(o.fit[0],o.fit[1]);Z.ty=o.yaw||0;Z.tp=o.pit==null?.08:o.pit;
 HUD.forEach(e=>e.style.display='none');bk.style.display='';hint.style.display='';hint.textContent=o.hint||'';sayEl.style.display='none';if(o.enter)o.enter()}
function zout(sw){const o=Z.on;if(!o)return;if(Z.card){S.remove(Z.card.g);Z.card=null}Z.on=null;if(o.exit)o.exit();if(sw)return;
 HUD.forEach(e=>e.style.display='');bk.style.display=hint.style.display='none';const s=Z.sv;Z.sv=null;if(s){goalT.copy(s.g);Z.td=s.d;Z.ty=s.y;Z.tp=s.p;Z.ret=true}}
function closeCard(){const c=Z.card;if(!c)return;Z.card=null;S.remove(c.g);if(c.onclose)c.onclose()}
bk.onclick=()=>Z.card?closeCard():zout();
function tap(e){ray(e);const L=Z.card?Z.card.ctl:(typeof Z.on.ctl==='function'?Z.on.ctl():Z.on.ctl),h=rc.intersectObjects(L||[],true)[0];let o=h&&h.object;
 while(o&&!(o.userData&&o.userData.zfx))o=o.parent;if(o){o.userData.zfx(o,h);return}Z.card?closeCard():zout()}
const _d=cv.onpointerdown,_m=cv.onpointermove,_u=cv.onpointerup,_w=cv.onwheel;
cv.onpointerdown=e=>{if(Z.on){Z.dn={x:e.clientX,y:e.clientY};Z.mv=0;return}_d(e)};
cv.onpointermove=e=>{if(Z.on){Z.px=e.clientX/innerWidth*2-1;Z.py=e.clientY/innerHeight*2-1;if(Z.dn){Z.mv+=Math.abs(e.clientX-Z.dn.x)+Math.abs(e.clientY-Z.dn.y);Z.dn={x:e.clientX,y:e.clientY}}return}_m(e)};
cv.onpointerup=e=>{if(Z.on){const ok=Z.dn&&Z.mv<8;Z.dn=null;if(ok)tap(e);return}_u(e)};
cv.onwheel=e=>{if(!Z.on)_w(e)};
addEventListener('keydown',e=>{if(e.key==='Escape'&&Z.on)bk.onclick()});
const _wf=winFx;winFx=function(dt){_wf(dt);const t=performance.now()/1000;
 if(Z.on||Z.ret){const k=Math.min(1,dt*5),sw=Z.on&&Z.on.sway?Math.sin(t*.5)*Z.on.sway:0;dist+=(Z.td-dist)*k;yaw+=(Z.ty+sw-yaw)*k;pit+=(Z.tp-pit)*k;
  if(!Z.on&&Math.abs(dist-Z.td)<.03&&Math.abs(yaw-Z.ty)<.01&&Math.abs(pit-Z.tp)<.01){dist=Z.td;yaw=Z.ty;pit=Z.tp;Z.ret=false}}
 if(Z.on)Z.age+=dt;if(Z.card)Z.card.upd(dt,t);stepF.forEach(f=>f(dt,t))};

/* ================= KARTU KERTAS 3D (tebal, miring mengikuti jari, bisa dibalik) ================= */
function kbtn(p,l,col,x,y,fn,w,h,fg,pad){w=w||.8;h=h||.34;const g=new THREE.Group();g.position.set(x,y,.05);p.add(g);
 bx(w+.07,h+.07,.04,'#1f3a5f',0,0,-.006,g);bx(w,h,.06,col,0,0,0,g);
 const t=cvs(256,96,(c,W,H)=>{c.fillStyle=fg||'#fff';c.strokeStyle='#1f3a5f';c.lineWidth=8;c.lineJoin='round';c.font='64px '+FN;c.textAlign='center';c.textBaseline='middle';c.strokeText(l,W/2,H/2+4);c.fillText(l,W/2,H/2+4)},1),ph=h*.82,m=new THREE.Mesh(new THREE.PlaneGeometry(ph*256/96,ph),new THREE.MeshBasicMaterial({map:t.t,transparent:true}));m.position.z=.04;g.add(m);
 /* area sentuh tak terlihat, lebih besar dari tombol (jempol HP) */
 const hit=new THREE.Mesh(new THREE.PlaneGeometry(w+(pad==null?.35:pad),h+(pad==null?.35:pad)),new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}));hit.position.z=.07;g.add(hit);
 g.userData.zfx=()=>{if(typeof SFX!=='undefined')SFX.click();fn()};return g}
/* swipe kiri/kanan di kartu berhalaman (o.swipe(+1 / -1)); tidak mengganggu tap karena tap hanya jalan kalau jari nyaris tidak bergeser */
{let sx=0,sy=0,on=0;
 cv.addEventListener('pointerdown',e=>{on=!!(Z.on&&Z.card&&Z.card.o&&Z.card.o.swipe);sx=e.clientX;sy=e.clientY});
 cv.addEventListener('pointerup',e=>{if(!on)return;on=0;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5&&Z.card&&Z.card.o.swipe){if(typeof SFX!=='undefined')SFX.click();Z.card.o.swipe(dx<0?1:-1)}});
 cv.addEventListener('pointercancel',()=>{on=0})}
function slip(o){const W=512,H=Math.round(512*o.h/o.w),g=new THREE.Group(),pv=new THREE.Group(),C={g,pv,ctl:[],flip:0,fl:0,t:0,o},F=cvs(W,H,o.front),B=o.back&&cvs(W,H,o.back);C.F=F;
 const ed=new THREE.MeshLambertMaterial({color:o.edge||'#e4dcc4'}),mt=[ed,ed,ed,ed,new THREE.MeshBasicMaterial({map:F.t}),B?new THREE.MeshBasicMaterial({map:B.t}):ed];
 const m=new THREE.Mesh(new THREE.BoxGeometry(o.w,o.h,o.thick||.04),mt);pv.add(m);g.add(pv);m.userData.zfx=()=>{if(B){C.flip^=1}};C.ctl.push(m);
 if(o.tape){const tp=new THREE.Mesh(new THREE.PlaneGeometry(.7,.2),new THREE.MeshBasicMaterial({color:'#f6efb8',transparent:true,opacity:.8}));tp.position.set(0,o.h/2-.02,.03);tp.rotation.z=.05;pv.add(tp)}
 (o.keys||[]).forEach((k,i,a)=>{const own=k.x!=null,x=own?k.x:(i-(a.length-1)/2)*1.0,y=own?k.y:(o.ktop?o.h/2+.34:-o.h/2-.3),b=kbtn(o.kin?pv:g,k.l,k.c||'#f2b84b',x,y,k.fn,k.w||.85,k.h||.36,k.fg,k.pad);C.ctl.push(b)});
 C.upd=(dt,t)=>{C.t=Math.min(1,C.t+dt*2.2);const u=ease(C.t);g.scale.setScalar(.3+.7*u);g.position.lerpVectors(o.from||o.pos,o.pos,u);g.position.y+=Math.sin(t*1.5)*.015;
  C.fl+=((C.flip?Math.PI:0)-C.fl)*Math.min(1,dt*8);pv.rotation.y=C.fl+(1-u)*1.1+Z.px*.28;pv.rotation.x=Z.py*.16+(1-u)*.5;pv.rotation.z=(o.rot||0)*u};
 g.position.copy(o.from||o.pos);g.scale.setScalar(.3);S.add(g);Z.card=C;return C}

/* ================= POSTER KUCING SIAMESE ================= */
{const P=S.children.find(o=>o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===.8&&o.geometry.parameters.height===1.07);
 if(P){const E=(g,c,x,y,rx,ry,a)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,7);g.globalAlpha=a||1;g.fill();g.globalAlpha=1},Tr=(g,c,a,b,d)=>{g.fillStyle=c;g.beginPath();g.moveTo(...a);g.lineTo(...b);g.lineTo(...d);g.fill()};
  const t=cvs(96,128,(g)=>{g.save();g.scale(2,2);g.fillStyle='#bfdcff';g.fillRect(0,0,48,64);g.fillStyle='#d9ebff';g.fillRect(0,40,48,24);g.strokeStyle='#1f3a5f';g.lineWidth=2;g.strokeRect(1,1,46,62);
   [[7,8],[41,12],[39,50],[8,46]].forEach(([x,y])=>{g.fillStyle='#fff';g.fillRect(x,y,2,2);g.fillRect(x-1,y+.5,4,1)});
   g.strokeStyle='#5a3b28';g.lineWidth=3;g.beginPath();g.moveTo(36,55);g.quadraticCurveTo(46,52,43,42);g.stroke();
   E(g,'#f1e0c5',24,50,13,11);E(g,'#f1e0c5',24,30,13,11);Tr(g,'#5a3b28',[11,25],[13,9],[21,19]);Tr(g,'#5a3b28',[37,25],[35,9],[27,19]);Tr(g,'#f4a6c0',[14,20],[14.5,13],[19,18]);Tr(g,'#f4a6c0',[34,20],[33.5,13],[29,18]);
   E(g,'#8a6a50',24,33,9,8,.35);E(g,'#5a3b28',24,34,6,5.5);E(g,'#fff',18,29,3.4,2.6);E(g,'#fff',30,29,3.4,2.6);E(g,'#4fb4ff',18,29,2.8,2.3);E(g,'#4fb4ff',30,29,2.8,2.3);
   g.fillStyle='#10203d';g.fillRect(17.6,27.2,.9,3.6);g.fillRect(29.6,27.2,.9,3.6);g.fillStyle='#fff';g.fillRect(16.8,27.6,1,1);g.fillRect(28.8,27.6,1,1);
   Tr(g,'#e8808f',[22.5,33],[25.5,33],[24,35]);g.strokeStyle='#e8d8c0';g.lineWidth=.4;[[-1,0],[1,0]].forEach(([s])=>[0,2,4].forEach(k=>{g.beginPath();g.moveTo(24+s*5,35+k*.4);g.lineTo(24+s*14,33+k*1.8);g.stroke()}));
   E(g,'#5a3b28',17,58,4.2,3);E(g,'#5a3b28',31,58,4.2,3);g.fillStyle='#1f3a5f';g.font='4.5px '+FN;g.textAlign='center';g.fillText('SIAMESE',24,8);g.restore()},1);
  P.material=new THREE.MeshBasicMaterial({map:t.t});act(P,()=>say3(P,'meong~'))}}

/* ================= JENDELA: pemandangan baru + zoom ================= */
const scenery=nt=>cvs(96,96,g=>{const P=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x,y,w||1,h||1)},D=(cx,cy2,r,c)=>{for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r)P(c,cx+x,cy2+y)};
 (nt?['#0b1233','#0f1a45','#152255','#1c2d68','#26397a','#31488c','#3d5a9c','#4b6cab']:['#6bb8f0','#82c4f3','#99d0f6','#b0dcf8','#c6e7fa','#daf1fc','#eaf7fd','#f6fcfe']).forEach((c,i)=>P(c,0,i*8,96,8));
 if(nt){for(let i=0;i<46;i++)P(i%5?'#fff':'#ffe9a0',(i*53)%96,(i*29)%44);D(72,15,7,'#fff6c8');D(75,13,6,'#26397a')}else{D(70,16,12,'#e6f6ff');D(70,16,8,'#f9d45c')}
 const C=nt?['#1a2a5e','#16244f','#101c42','#0b1633']:['#a9bfe0','#7cc47f','#5aa86a','#3f8f55'];
 for(let x=0;x<96;x++){const h=Math.floor(44+13*Math.abs(Math.sin(x*.07+1))+5*Math.sin(x*.19));P(C[0],x,h,1,96-h);if(h<47)P(nt?'#8fa0d8':'#fff',x,h,1,3)}
 for(let x=0;x<96;x++){const h=Math.floor(60+5*Math.sin(x*.1)+3*Math.sin(x*.27+2));P(C[1],x,h,1,96-h)}
 P(nt?'#25408a':'#8fd0f0',20,70,34,4);P(nt?'#3a56a8':'#c8ecfa',24,71,12,1);
 for(let x=0;x<96;x++){const h=Math.floor(76+4*Math.sin(x*.08+1));P(C[2],x,h,1,96-h)}P(C[3],0,90,96,6);
 [[8,74],[14,76],[80,73],[88,76],[50,77]].forEach(([x,y])=>{for(let k=0;k<6;k++)P(nt?'#0a1a3a':'#2f7a4a',x-k/1.5|0,y-6+k,Math.max(1,k*1.3|0)+1,1);P('#5a3b22',x,y,1,2)});
 P('#f3e6c8',60,70,10,7);for(let k=0;k<6;k++)P('#e84a5f',58+k,69-k,14-2*k,1);P(nt?'#ffd24a':'#8fd0f0',64,72,3,3);
 for(let i=0;i<14;i++)P(['#f4a6c0','#f2c14e','#fff'][i%3],(i*29)%96,91+(i*7)%5)},1);
const SD=scenery(false),SN=scenery(true);
const WGp=S.children.find(o=>o.isGroup&&Math.abs(o.position.x+4.6)<.01&&Math.abs(o.position.y-3.3)<.01&&Math.abs(o.position.z+5.86)<.01);
function zoomWin(){zin({tgt:new V3(-4.6,3.3,-5.9),fit:[3.6,3],pit:.02,sway:.06,hint:'tap kaca: hujan / bintang jatuh · tap luar untuk kembali',ctl:[sky],})}
sky.userData.zfx=()=>winClick();[sky,WGp].forEach(o=>{if(o)o.userData.fn=()=>zoomWin()});if(!hits.includes(sky))hits.push(sky);
stepF.push(()=>{const w=night?SN.t:SD.t;if(sky.material.map!==w){sky.material.map=w;sky.material.needsUpdate=true}});

/* ================= PAPAN STICKY: zoom + note 3D ================= */
const board=S.children.find(o=>o.geometry&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===3&&o.geometry.parameters.height===3.4);
const occl=()=>[...balloons,S.children.find(o=>o.isGroup&&Math.abs(o.position.x-8.2)<.01&&Math.abs(o.position.z+5.3)<.01),S.children.find(o=>o.isGroup&&Math.abs(o.position.x)<.01&&Math.abs(o.position.y-4.5)<.01&&Math.abs(o.position.z-.4)<.01)].filter(Boolean);
function zoomBoard(){let hid=[];zin({tgt:board.position.clone().add(new V3(0,.3,0)),fit:[3.9,5.3],pit:.02,hint:'tap catatan untuk membaca · tap luar untuk kembali',ctl:()=>noteHits,
 enter(){hid=occl().filter(o=>o.visible);hid.forEach(o=>o.visible=false)},exit(){hid.forEach(o=>o.visible=true)}})}
if(board)act(board,zoomBoard);
function noteCard(m){const n=m.userData.n,pages=chunk(n.t||'',CFG.NOTE_PAGE||280);let pg=0,C;const bp=board.position,CW=2.5,CH=2.7,ky=-CH/2+.17;
 const nav=d=>{pg=cl(pg+d,0,pages.length-1);C.F.r()},keys=pages.length>1?[{l:'<',c:'#3b7dd8',fg:'#fff',fn:()=>nav(-1),x:-.98,y:ky,w:.34,h:.24,pad:.14},{l:'>',c:'#f2b84b',fg:'#1f3a5f',fn:()=>nav(1),x:-.38,y:ky,w:.34,h:.24,pad:.14}]:[];
 C=slip({w:CW,h:CH,thick:.05,tape:1,kin:1,swipe:nav,rot:((n.t||'').length%5-2)*.025,keys,edge:'#d9cfae',pos:new V3(bp.x,bp.y,bp.z+1.0),from:m.position.clone(),
  front:(g,W,H)=>{const col=n.color||'#f7e27a',nm=n.from||'anon',ink='#3d2f14',AV=['#3b7dd8','#e84a5f','#2e9d6a','#8a5bd0','#e08a1e'],multi=pages.length>1;
   let hh=0;for(const ch of nm)hh=(hh*31+ch.charCodeAt(0))>>>0;
   g.fillStyle=col;g.fillRect(0,0,W,H);
   const gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,'rgba(255,255,255,.3)');gr.addColorStop(1,'rgba(0,0,0,.1)');g.fillStyle=gr;g.fillRect(0,0,W,H);
   g.fillStyle='rgba(0,0,0,.08)';g.fillRect(0,0,W,104);
   g.strokeStyle='rgba(61,47,20,.4)';g.lineWidth=6;g.strokeRect(3,3,W-6,H-6);
   /* header: avatar inisial + nama pengirim + stiker */
   g.fillStyle=AV[hh%5];g.fillRect(26,22,60,60);g.strokeStyle='#1f3a5f';g.lineWidth=5;g.strokeRect(26,22,60,60);
   g.font='24px '+FN;g.textAlign='center';g.textBaseline='middle';const ini=nm.trim().charAt(0).toUpperCase()||'?';g.fillStyle='#1f3a5f';g.fillText(ini,58,56);g.fillStyle='#fff';g.fillText(ini,56,54);
   g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle=ink;{let f=15;const room=W-106-96;g.font=f+'px '+FN;while(f>9&&g.measureText(nm).width>room){f--;g.font=f+'px '+FN}g.fillText(nm,106,52)}
   g.font='28px '+VT;g.globalAlpha=.6;g.fillText('untuk Aqsa',106,84);g.globalAlpha=1;
   if(typeof stk==='function'&&typeof ST!=='undefined'&&n.s&&ST[n.s]){g.save();g.scale(2,2);stk(g,n.s,W/2-34,18);g.restore()}
   /* isi: huruf terbesar yang muat, garis buku sejajar baris */
   const top=124,avail=H-104-top;let px=52,L,lh;for(;;){g.font=px+'px '+VT;L=wrap(g,pages[pg],W-64);lh=px*1.1;if(L.length*lh<=avail||px<=22)break;px-=2}
   g.strokeStyle='rgba(61,47,20,.16)';g.lineWidth=2;for(let i=0;top+px*.85+i*lh+8<H-100;i++){const y=top+px*.85+i*lh+8;g.beginPath();g.moveTo(26,y);g.lineTo(W-26,y);g.stroke()}
   g.fillStyle=ink;g.font=px+'px '+VT;g.textAlign='left';L.forEach((l,i)=>g.fillText(l,32,top+px*.85+i*lh));
   /* footer */
   g.fillStyle='rgba(61,47,20,.3)';for(let x=26;x<W-26;x+=16)g.fillRect(x,H-92,8,3);
   {let fs=40;const t='- '+nm,room=multi?250:W-60;g.font=fs+'px '+VT;while(fs>18&&g.measureText(t).width>room){fs-=2;g.font=fs+'px '+VT}g.textAlign='right';g.fillStyle=ink;g.fillText(t,W-30,H-26)}
   if(multi){g.fillStyle='rgba(255,255,255,.55)';g.fillRect(84,H-58,66,36);g.fillStyle=ink;g.font='11px '+FN;g.textAlign='center';g.fillText((pg+1)+'/'+pages.length,117,H-34)}}});
 if(typeof SFX!=='undefined')SFX.pop();return C}
const _rw=renderWall;const patchN=()=>noteHits.forEach(m=>{m.userData.fn=()=>zoomBoard();m.userData.zfx=()=>noteCard(m)});
renderWall=function(){_rw();patchN()};patchN();

/* ================= RUANG KENANGAN (galeri) ================= */
const GR=window.GRP;
if(GR){const[gf,gw,gl]=GR.children;retex(gf,planks(),4,3,'#c9a470');retex(gw,stripes(),5,2.5,'#f1e8d4');retex(gl,stripes(),3.5,2.5,'#e8dcc2');
 const L=new THREE.PointLight('#ffd9a0',1.1,16);L.position.set(80,3.6,.6);S.add(L);
 const pl=GR.children.filter(o=>o.isGroup&&o.position.z===-3.4),MEMS=(typeof EXTRA!=='undefined'&&EXTRA.memories)||[];
 const sh=cvs(64,64,g=>{const r=g.createRadialGradient(32,32,4,32,32,32);r.addColorStop(0,'rgba(0,0,0,.45)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}).t;
 [3.4,1.3].forEach(y=>bx(9.4,.02,.02,'#8a5a34',0,y+.9,-3.38,GR));
 const pts=[],bl=[];for(let i=0;i<=26;i++){const u=i/26,x=-4.8+u*9.6,y=4.97-.16*Math.abs(Math.sin(u*Math.PI*4));pts.push(new V3(x,y,-3.38));
  const b=new THREE.Mesh(new THREE.SphereGeometry(.07,8,6),new THREE.MeshBasicMaterial({color:['#ffd98a','#f4a6c0','#8fd0f0','#fff6c8'][i%4]}));b.position.set(x,y-.07,-3.37);GR.add(b);bl.push(b)}
 GR.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:'#5a3b22'})));
 stepF.push((dt,t)=>bl.forEach((b,i)=>b.scale.setScalar(.85+.35*Math.sin(t*2.6+i*1.7))));
 pl.forEach((g,i)=>{const mem=MEMS[i];if(!mem)return;const s=new THREE.Mesh(new THREE.PlaneGeometry(1.9,2.2),new THREE.MeshBasicMaterial({map:sh,transparent:true,depthWrite:false}));s.position.set(.07,-.12,-.03);g.add(s);
  const img=new Image();let C;img.src=mem.src;img.onload=()=>{if(C)C.F.r()};
  g.userData.fn=()=>{const p=new V3();g.getWorldPosition(p);const pos=new V3(p.x,2.4,-1.5);
   zin({tgt:pos.clone(),fit:[2.2,3.0],pit:.04,hint:'tap kartu untuk membalik · tap luar untuk kembali',ctl:[],
    enter(){C=slip({w:1.8,h:2.2,thick:.035,edge:'#d8ccb0',pos,from:new V3(p.x,p.y,p.z+.1),rot:g.rotation.z,
     front:(c,W,H)=>{c.fillStyle='#fffdf3';c.fillRect(0,0,W,H);const m=34,iw=W-m*2;c.fillStyle='#cfe0f6';c.fillRect(m,m,iw,iw);
      if(img.complete&&img.naturalWidth){const q=Math.min(img.naturalWidth,img.naturalHeight);c.drawImage(img,(img.naturalWidth-q)/2,(img.naturalHeight-q)/2,q,q,m,m,iw,iw)}
      c.strokeStyle='#1f3a5f';c.lineWidth=3;c.strokeRect(m,m,iw,iw);c.fillStyle='#1f3a5f';c.textAlign='center';c.font='34px '+VT;wrap(c,mem.title,iw).slice(0,2).forEach((l,k)=>c.fillText(l,W/2,m+iw+50+k*32));c.font='11px '+FN;c.fillText(mem.date,W/2,H-30)},
     back:(c,W,H)=>{c.fillStyle='#f1e6cf';c.fillRect(0,0,W,H);c.strokeStyle='#8a5a34';c.lineWidth=3;c.strokeRect(18,18,W-36,H-36);c.fillStyle='#1f3a5f';c.textAlign='center';c.font='12px '+FN;c.fillText(mem.date,W/2,64);
      c.textAlign='left';let px=40,Ls;for(;;){c.font=px+'px '+VT;Ls=wrap(c,mem.story,W-90);if(Ls.length*px<H-190||px<=22)break;px-=2}Ls.forEach((l,k)=>c.fillText(l,44,120+k*px));c.textAlign='center';c.font='9px '+FN;c.fillStyle='#8a5a34';c.fillText('tap untuk balik',W/2,H-34)}});
     C.onclose=()=>zout()}})}})}

/* ================= LOUNGE: model baru ================= */
{retex(lfl,planks(),4,3);retex(lbw,stripes(),5,2.5);retex(llw,stripes(),3.5,2.5);
 const rm=(w,h,d)=>LG.children.find(o=>o.geometry&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===w&&o.geometry.parameters.height===h&&o.geometry.parameters.depth===d);
 [rm(.9,.9,.9),rm(.5,.5,.5),rm(.7,.9,.1)].forEach(o=>LG.remove(o));
 const rug=[[2.6,'#f4a6c0'],[2.2,'#fff6e0'],[1.6,'#a9cdf9'],[1.0,'#f2c14e']].map(([r,c],i)=>{const m=cy(r,r,.02,c,.3,.01+i*.005,-.6,LG);m.scale.z=.65;return m});
 /* sofa */
 while(sf.children.length)sf.remove(sf.children[0]);const SO='#4f8fe8',SD2='#3b73c6';
 rbox(3.1,.42,1.05,SD2,.1,sf,0,.31,0);rbox(3.0,.85,.26,SD2,.12,sf,0,.9,-.4);[-1.45,1.45].forEach(x=>rbox(.3,.72,1.05,SD2,.13,sf,x,.57,0));
 [-.7,.7].forEach(x=>{rbox(1.34,.2,.86,SO,.08,sf,x,.62,.06);const b=rbox(1.3,.55,.2,SO,.1,sf,x,.92,-.22);b.rotation.x=-.14});
 [[-1.3,-.4],[1.3,-.4],[-1.3,.4],[1.3,.4]].forEach(([x,z])=>cy(.05,.04,.12,'#5a3b22',x,.06,z,sf));
 const pw=rbox(.42,.42,.16,'#f2c14e',.16,sf,1.0,.9,.05);pw.rotation.set(0,.2,.3);const pw2=rbox(.4,.4,.16,'#f4a6c0',.16,sf,-1.05,.88,.05);pw2.rotation.set(0,-.2,-.25);
 /* ===== tanaman dipindah ke dekat pintu teras + furnitur baru lounge ===== */
 monstera(LG,4.95,-2.75,1.1,'#f3f8ff','#2e527f');snake(LG,7.65,-2.7,1.05);
 {/* rak buku tinggi di dinding kiri (sebelah pintu ruang utama) */
  const bk=new THREE.Group();bk.position.set(-4.74,0,2.7);bk.rotation.y=Math.PI/2;LG.add(bk);
  bx(1.2,1.9,.03,'#8a5a34',0,.95,-.175,bk);[-.58,.58].forEach(x=>bx(.04,1.9,.38,'#a8743f',x,.95,0,bk));[.03,.6,1.17,1.74,1.9].forEach(y=>bx(1.2,.04,.38,'#a8743f',0,y,0,bk));
  const BC=['#e84a5f','#4f8fe8','#f2c14e','#8fd18a','#a98bd6','#f4a6c0','#fff6e0'];
  [.05,.62,1.19].forEach((y0,r)=>{let x=-.5;for(let i=0;i<9&&x<.45;i++){const w=.06+((i*7+r*3)%4)*.015,h=.28+((i*5+r*2)%5)*.045;bx(w,h,.26,BC[(i+r*2)%7],x+w/2,y0+.02+h/2,0,bk);x+=w+.008}
   if(r===0){bx(.3,.05,.24,'#4f8fe8',.28,y0+.045,.0,bk);bx(.26,.05,.22,'#f2c14e',.28,y0+.095,0,bk)}});
  rbox(.2,.26,.04,'#f2c14e',.02,bk,.35,1.33,.1);pBall(bk,.1,'#4f8fe8',-.3,1.3,0);cy(.025,.03,.1,'#cfd6e0',-.3,1.2,0,bk);
  cy(.1,.08,.14,'#c98b52',-.25,1.84,0,bk);pBall(bk,.1,'#4fa05a',-.25,1.98,0);pBall(bk,.07,'#6dc07a',-.18,2.03,.03);cy(.14,.14,.02,'#4a3328',.3,1.93,0,bk)}
 {/* meja kopi di depan sofa */
  const X=-2.6,Z=-.5;rbox(1.3,.07,.7,'#c98b52',.04,LG,X,.42,Z);rbox(1.2,.04,.6,'#a8743f',.02,LG,X,.18,Z);[[-.58,-.28],[.58,-.28],[-.58,.28],[.58,.28]].forEach(([a,b])=>cy(.035,.03,.4,'#5a3b22',X+a,.2,Z+b,LG));
  rbox(.5,.03,.3,'#2e527f',.02,LG,X-.25,.47,Z);[[-.38,-.05],[-.15,.05]].forEach(([a,b])=>cy(.06,.05,.08,'#f3f8ff',X+a,.52,Z+b,LG));
  {const mg=rbox(.35,.02,.25,'#f4a6c0',.01,LG,X+.2,.465,Z+.1);mg.rotation.y=.35;const mg2=rbox(.3,.02,.22,'#8fd0f0',.01,LG,X+.2,.485,Z+.1);mg2.rotation.y=-.1}
  cy(.07,.06,.09,'#c98b52',X+.48,.5,Z-.2,LG);pBall(LG,.08,'#4fa05a',X+.48,.6,Z-.2);
  rbox(.4,.05,.3,'#e84a5f',.02,LG,X,.24,Z)}
 {/* meja samping + lampu meja (menyala saat malam) */
  const X=-.55,Z=-2.85;cy(.3,.3,.04,'#c98b52',X,.62,Z,LG);cy(.04,.05,.6,'#5a3b22',X,.3,Z,LG);cy(.2,.22,.04,'#5a3b22',X,.02,Z,LG);
  cy(.07,.1,.06,'#2e527f',X,.67,Z,LG);cy(.015,.015,.3,'#cfd6e0',X,.85,Z,LG);
  const ls=cy(.14,.2,.22,'#fff1cf',X,1.08,Z,LG);ls.material=new THREE.MeshLambertMaterial({color:'#fff1cf',emissive:'#ffd98a',emissiveIntensity:.25,side:THREE.DoubleSide});
  rbox(.18,.04,.14,'#a98bd6',.01,LG,X+.15,.66,Z+.1);stepF.push(()=>{ls.material.emissiveIntensity=night?1:.25})}
 {/* keranjang anyaman + selimut di sudut */
  const X=-4.3,Z=-.1;cy(.3,.24,.35,'#d9b97a',X,.18,Z,LG);cy(.31,.31,.02,'#b89968',X,.2,Z,LG);cy(.32,.32,.02,'#b89968',X,.33,Z,LG);
  const bl=pBall(LG,.24,'#f4a6c0',X,.38,Z);bl.scale.set(1.2,.6,1);{const f=rbox(.36,.28,.05,'#f09ab5',.03,LG,X+.2,.28,Z+.2);f.rotation.set(.1,.6,.1)}}
 /* rintangan jalan: tanaman lama dihapus, perabot baru ditambah */
 if(window.R3&&R3.OB&&R3.OB[1]&&!R3.OB[1]._f){const o=R3.OB[1].filter(r=>!(r[0]===2.7&&r[1]===3.7&&r[2]===.6&&r[3]===1)).concat([[-4.8,-4.5,2.05,3.3],[-3.3,-1.9,-.85,-.15],[-.85,-.15,-3.2,-2.5],[-4.7,-3.95,-.45,.25]]);o._f=1;R3.addRoom(1,o,R3.BND[1],R3.POIS[1])}

 /* TV + kabinet */
 while(tg0.children.length)tg0.remove(tg0.children[0]);rbox(2.1,.14,.85,'#c98b52',.05,tg0,0,.9,0);rbox(1.9,.08,.65,'#a8743f',.03,tg0,0,.42,0);
 [[-.95,-.32],[.95,-.32],[-.95,.32],[.95,.32]].forEach(([x,z])=>cy(.05,.04,.85,'#5a3b22',x,.43,z,tg0));
 rbox(.5,.1,.32,'#f3f8ff',.04,tg0,-.5,.51,0);rbox(.35,.14,.3,'#e84a5f',.05,tg0,.45,.53,0);
 rbox(1.8,1.05,.1,'#10203d',.08,tg0,0,1.5,-.05);cy(.08,.12,.12,'#10203d',0,1.0,-.05,tg0);
 const scr=cvs(160,90,g=>{g.fillStyle='#143268';g.fillRect(0,0,160,90);['#fff','#f2c14e','#8fd0f0','#8fd18a','#f4a6c0','#e84a5f','#4f8fe8'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(i*23,0,23,64)});g.fillStyle='#1f3a5f';g.fillRect(0,64,160,26);g.fillStyle='rgba(255,255,255,.08)';for(let y=0;y<90;y+=3)g.fillRect(0,y,160,1)}),sp=new THREE.Mesh(new THREE.PlaneGeometry(1.62,.9),new THREE.MeshBasicMaterial({map:scr.t}));sp.position.set(0,1.5,.01);tg0.add(sp);
 [-1.12,1.12].forEach(x=>rbox(.2,.62,.24,'#5a3b22',.06,tg0,x,1.3,0));
 /* akuarium */
 rbox(1.0,.9,.9,'#a8743f',.06,LG,3.9,.45,-2.6);bx(1.5,.1,.7,'#e8d8b0',3.9,.97,-2.6,LG);bx(1.65,.07,.85,'#10203d',3.9,2.03,-2.6,LG);buildAquarium();
 /* tanaman, pouf, lampu, lukisan */
 
 rbox(.58,.48,.58,'#f2c14e',.22,LG,1.6,.26,.3);
 cy(.28,.3,.06,'#2e527f',-4.4,.03,-1.2,LG);cy(.035,.035,2.7,'#cfd6e0',-4.4,1.4,-1.2,LG);const sh2=cy(.3,.45,.55,'#fff1cf',-4.4,2.8,-1.2,LG);sh2.material=new THREE.MeshLambertMaterial({color:'#fff1cf',emissive:'#ffd98a',emissiveIntensity:.5});
 const LP=new THREE.PointLight('#ffd9a0',.4,12);LP.position.set(40-4.4,2.6,-1.2);S.add(LP);stepF.push(()=>{LP.intensity=night?1.6:.35;sh2.material.emissiveIntensity=night?1:.4});
 [[-3.4,2.8,1.4,.9],[-2.1,2.8,.8,.8],[3.9,3.2,1.1,.8]].forEach(([x,y,w,h],i)=>{rbox(w+.14,h+.14,.07,'#5a3b22',.03,LG,x,y,-3.43);const a=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:(i===1?SN:SD).t}));a.position.set(x,y,-3.39);LG.add(a)})}

/* ================= ISI AKUARIUM: rumput laut pita, tanaman daun lebar, tanaman merah, batu, kerang, kerikil, gelembung ================= */
function buildAquarium(){
 const AG=new THREE.Group();AG.position.set(3.9,1.02,-2.6);LG.add(AG);const sw=[],GC=['#2f9a52','#4fb866','#7fd17a','#3f9150'];
 const grp=(x,z,sp,a,ph)=>{const g=new THREE.Group();g.position.set(x,0,z);AG.add(g);sw.push({g,sp,a,ph});return g};
 /* rumput laut pita: ruas-ruas pipih yang melengkung, melambai pelan */
 const ribbon=(x,z,h,c,ph,w)=>{const g=grp(x,z,1.1+ph*.1,.06,ph),n=6,sl=h/n,px=k=>Math.sin(k*.8+ph)*.05*k/(n-1)*2;g.rotation.y=ph;
  for(let k=0;k<n;k++){const m=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),M(k%2?tint2(c,.05):c));m.scale.set(w*(1-k*.1),sl*.62,.012);
   m.position.set(px(k),(k+.5)*sl,0);m.rotation.z=-Math.atan2(px(k+1)-px(k),sl);g.add(m)}};
 const tint2=(c,k)=>{const q=new THREE.Color(c);q.offsetHSL(0,0,k);return '#'+q.getHexString()};
 [[-.62,-.22,.78,0,0,.055],[-.5,-.17,.6,1,1.3,.05],[-.4,-.24,.85,2,2.1,.055],[.55,-.24,.72,0,.7,.055],[.66,-.17,.55,3,2.6,.05],[.4,-.27,.82,1,3.3,.055],[.05,-.3,.7,2,4.1,.05]]
  .forEach(([x,z,h,ci,ph,w])=>ribbon(x,z,h,GC[ci],ph,w));
 /* tanaman daun lebar (sword) di kiri depan */
 {const g=grp(-.5,.18,.9,.04,.5);
  for(let k=0;k<9;k++){const a=k*Math.PI*2/9+.3,up=.7+(k%3)*.18;pLeaf(g,new V3(0,.02,0),new V3(Math.cos(a)*.7,up,Math.sin(a)*.7),.38+(k%3)*.07,.15,GC[k%4])}}
 {const g=grp(-.28,.24,1.2,.05,2.2);
  for(let k=0;k<6;k++){const a=k*Math.PI*2/6+1,up=.9+(k%2)*.2;pLeaf(g,new V3(0,.02,0),new V3(Math.cos(a)*.55,up,Math.sin(a)*.55),.3+(k%3)*.05,.12,GC[(k+1)%4])}}
 /* tanaman merah bercabang (cabomba) di kanan depan */
 {const g=grp(.45,.2,1.3,.05,1.1),RC=['#d9506a','#e8708a','#c23e5a'];
  for(let s=0;s<6;s++){const a=s*1.05,sx=Math.cos(a)*.12,sz=Math.sin(a)*.12,A=new V3(0,0,0),M1=new V3(sx*.6,.22,sz*.6),B=new V3(sx*1.4,.45+(s%3)*.07,sz*1.4);
   pLimb(g,A,M1,.01,'#a13a4f');pLimb(g,M1,B,.008,'#a13a4f');
   [[M1,.5],[M1,.8],[B,.4],[B,.8],[B,1.2]].forEach(([P0,u],q)=>{const d=new V3(Math.cos(a+u*2),.5,Math.sin(a+u*2)).normalize();pLeaf(g,P0.clone().addScaledVector(d,.01),d,.1,.045,RC[(s+q)%3])});
   pBall(g,.035,RC[s%3],B.x,B.y+.03,B.z)}}
 /* batu, kerang, kerikil */
 const rock=(x,z,sx,sy,sz,c,r)=>{const m=new THREE.Mesh(new THREE.IcosahedronGeometry(1,1),M(c));m.scale.set(sx,sy,sz);m.position.set(x,sy*.55,z);m.rotation.set(0,r,.2);AG.add(m)};
 rock(.02,-.14,.2,.12,.15,'#8d97a8',.4);rock(.2,-.06,.12,.08,.1,'#a6afbf',1.2);rock(.3,.1,.09,.06,.08,'#7d8799',2.1);rock(-.08,-.2,.1,.07,.09,'#b4bccb',.8);
 {const sh=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),M('#f4a6c0'));sh.scale.set(.07,.035,.06);sh.position.set(-.12,.03,.2);sh.rotation.y=.6;AG.add(sh);
  for(let r=-2;r<=2;r++){const rb=new THREE.Mesh(new THREE.SphereGeometry(1,6,4),M('#e8809f'));rb.scale.set(.05,.02,.006);rb.position.set(-.12+Math.sin(.6)*0,.06,.2);rb.rotation.set(0,.6+r*.35,0);rb.position.x+=Math.sin(.6+r*.35)*.0;AG.add(rb)}
  pBall(AG,.025,'#fff6e8',-.1,.065,.2)}
 for(let i=0;i<16;i++){const r=.018+(i%3)*.007;pBall(AG,r,['#f2c14e','#f4a6c0','#8fd0f0','#fff6e0','#a98bd6'][i%5],-.68+((i*37)%136)/100,r*.6,-.28+((i*53)%56)/100)}
 /* gelembung dari batu udara */
 cy(.03,.035,.03,'#7d8799',.68,.015,-.24,AG);
 const bub=[0,1,2,3,4,5].map(i=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,8,6),new THREE.MeshBasicMaterial({color:'#dff3ff',transparent:true,opacity:.6,depthWrite:false}));AG.add(m);return{m,ph:i/6,r:.018+(i%3)*.008}});
 stepF.push((dt,t)=>{if(!LG.visible)return;sw.forEach(s=>{s.g.rotation.z=Math.sin(t*s.sp+s.ph)*s.a;s.g.rotation.x=Math.cos(t*s.sp*.8+s.ph)*s.a*.6});
  bub.forEach(b=>{const u=(t*.16+b.ph)%1;b.m.position.set(.68+Math.sin(t*3+b.ph*20)*.02*u,.06+u*.85,-.24);b.m.scale.setScalar(b.r*(.7+u*.6));b.m.visible=u<.97})})}

/* ================= IKAN AKUARIUM: ganti model kotak jadi ikan bulat (badan lonjong, ekor, sirip, mata) + ekor bergoyang ================= */
if(typeof fish!=='undefined'&&Array.isArray(fish)&&!fish._round){fish._round=1;
 const LM=c=>new THREE.MeshLambertMaterial({color:c}),ell=(p,c,rx,ry,rz,x,y,z)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),LM(c));m.scale.set(rx,ry,rz);m.position.set(x,y,z);p.add(m);return m};
 const tint=(c,k)=>{const q=new THREE.Color(c);q.offsetHSL(0,0,k);return '#'+q.getHexString()};
 fish.forEach((f,i)=>{const old=f.m;if(!old)return;
  /* ambil warna & panjang dari ikan lama supaya ikannya tetap beda-beda */
  let col=null;old.traverse(o=>{if(!col&&o.material&&o.material.color)col=o.material.color.getStyle()});col=col||['#f2a33f','#e84a5f','#4f8fe8','#f2c14e'][i%4];
  const bb=new THREE.Box3().setFromObject(old),L=cl((bb.max.x-bb.min.x)||.3,.2,.5),h=new THREE.Group(),pv=new THREE.Group();
  ell(h,col,L*.5,L*.27,L*.19,0,0,0);                                  /* badan */
  ell(h,tint(col,.22),L*.4,L*.14,L*.17,.02*L,-.1*L,0);                /* perut lebih terang */
  [[1],[-1]].forEach(([s])=>{ell(h,'#ffffff',L*.065,L*.065,L*.05,L*.3,L*.06,s*L*.13);ell(h,'#10203d',L*.035,L*.035,L*.03,L*.33,L*.06,s*L*.155);
   const fn=ell(h,tint(col,-.08),L*.12,L*.045,L*.07,.02*L,-.06*L,s*L*.19);fn.rotation.z=.5});   /* sirip samping */
  const dr=new THREE.Mesh(new THREE.ConeGeometry(L*.1,L*.2,10),LM(tint(col,-.08)));dr.scale.z=.25;dr.position.set(-.04*L,L*.3,0);dr.rotation.z=.35;h.add(dr); /* sirip punggung */
  pv.position.x=-L*.42;h.add(pv);                                      /* engsel ekor */
  const tl=new THREE.Mesh(new THREE.ConeGeometry(L*.24,L*.34,12),LM(tint(col,-.05)));tl.scale.z=.22;tl.rotation.z=-Math.PI/2;tl.position.x=-L*.17;pv.add(tl); /* ujung lancip ke badan, lebar di belakang */
  h.position.copy(old.position);const par=old.parent||LG;par.remove(old);par.add(h);f.m=h;f.pv=pv;f.ph=(f.s||.2)*9+i*1.3});
 stepF.push((dt,t)=>fish.forEach(f=>{if(f.pv)f.pv.rotation.y=Math.sin(t*9+f.ph)*.55}))}

/* ================= TV utama: tidak lagi membuka galeri, sekarang menyalakan pong (sama seperti konsol) ================= */
{const cons=hits.find(o=>o.isGroup&&Math.abs(o.position.x+.5)<.01&&Math.abs(o.position.z+4.92)<.01);tvG.userData.fn=()=>{if(cons)cons.userData.fn()}}

/* ================= RUANG KENANGAN: perbaikan model + dekorasi ================= */
if(GR){
 const gp=(t,f)=>GR.children.filter(o=>o.geometry&&o.geometry.type===t&&f(o.geometry.parameters)),Bx=(w,h,d)=>gp('BoxGeometry',p=>p.width===w&&p.height===h&&p.depth===d);
 [...Bx(2.8,.4,.7),...Bx(.7,.14,.55),...Bx(.05,.9,.05),...Bx(.45,.07,.2),...gp('CylinderGeometry',p=>p.radiusTop===.3&&p.radiusBottom===.22)].forEach(o=>GR.remove(o));
 gp('CylinderGeometry',p=>p.radiusTop===.35&&p.radiusBottom===.2).forEach(o=>{o.material=new THREE.MeshLambertMaterial({color:'#fff1cf',emissive:'#ffd98a',emissiveIntensity:.6})});
 /* karpet lebih berlapis */
 [[1.3,'#a9cdf9',.03],[.8,'#f2c14e',.035]].forEach(([r,c,y])=>{const m=cy(r,r,.02,c,0,y,.7,GR);m.scale.z=.6});
 /* bangku kayu + bantal, album, kamera */
 rbox(2.9,.12,.75,'#c98b52',.05,GR,0,.4,-2.7);[[-1.3,-.28],[1.3,-.28],[-1.3,.28],[1.3,.28]].forEach(([x,z])=>cy(.05,.04,.36,'#5a3b22',x,.18,-2.7+z,GR));
 [[-.35,'#4f8fe8'],[.55,'#f4a6c0']].forEach(([x,c])=>rbox(.8,.18,.62,c,.08,GR,x,.55,-2.68));const tp=rbox(.4,.4,.14,'#f2c14e',.15,GR,-.55,.82,-2.95);tp.rotation.set(-.3,.2,.25);
 ['#e84a5f','#8fd18a','#a98bd6'].forEach((c,i)=>rbox(.46,.07,.34,c,.03,GR,-1.12,.5+i*.07,-2.7));
 rbox(.42,.24,.2,'#2e527f',.05,GR,1.12,.58,-2.7);rbox(.4,.08,.2,'#cfd6e0',.03,GR,1.12,.74,-2.7);const ln=cy(.08,.09,.12,'#10203d',1.12,.58,-2.57,GR);ln.rotation.x=Math.PI/2;
 /* tanaman besar: pot + tatakan, tangkai melengkung dengan daun lebar */
 const Zv=new V3(0,0,1),Yv=new V3(0,1,0);
 const limb2=(A,B,r,c)=>{const d=new V3().subVectors(B,A),L=d.length(),m=cy(r*.75,r,L,c,(A.x+B.x)/2,(A.y+B.y)/2,(A.z+B.z)/2,GR);m.quaternion.setFromUnitVectors(Yv,d.normalize());return m};
 const leaf2=(P,dir,len,w,c)=>{const d=dir.clone().normalize(),m=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),M(c));m.scale.set(w/2,.025,len/2);m.position.copy(P).addScaledVector(d,len/2);m.quaternion.setFromUnitVectors(Zv,d);GR.add(m);return m};
 const ball=(r,c,x,y,z,p)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),M(c));m.position.set(x,y,z);(p||GR).add(m);return m};
 {cy(.36,.36,.04,'#8a5a34',-4.2,.02,-3,GR);cy(.33,.26,.38,'#c98b52',-4.2,.23,-3,GR);cy(.37,.37,.06,'#a8743f',-4.2,.43,-3,GR);cy(.31,.31,.03,'#4a3328',-4.2,.46,-3,GR);
  const A=new V3(-4.2,.46,-3),GC=['#4fa05a','#6dc07a','#3f9150','#5fb86a'];
  for(let k=0;k<8;k++){const a=k*Math.PI*2/8+.3,r=.28+(k%3)*.1,h=1.0+(k%4)*.22,M1=new V3(-4.2+Math.cos(a)*r*.3,.46+(h-.46)*.55,-3+Math.sin(a)*r*.3),B=new V3(-4.2+Math.cos(a)*r,h,-3+Math.sin(a)*r);
   limb2(A,M1,.024,'#4a8a45');limb2(M1,B,.02,'#4a8a45');
   leaf2(B,new V3(Math.cos(a)*.8,.5,Math.sin(a)*.8),.55,.34,GC[k%4]);
   leaf2(M1,new V3(Math.cos(a+1.1)*.8,.35,Math.sin(a+1.1)*.8),.4,.24,GC[(k+2)%4])}
  const T=new V3(-4.2,1.45,-2.97);limb2(A,T,.026,'#4a8a45');leaf2(T,new V3(0,1,.2),.55,.3,'#6dc07a')}
 /* kursi santai (bisa diduduki: lihat interact3d.js) */
 const ch=new THREE.Group();ch.position.set(4.35,0,.9);ch.rotation.y=-Math.PI/2;GR.add(ch);
 rbox(.95,.3,.9,'#a98bd6',.1,ch,0,.3,0);rbox(.95,.85,.22,'#a98bd6',.12,ch,0,.75,-.34);[-.42,.42].forEach(x=>rbox(.18,.55,.9,'#8d6fc0',.08,ch,x,.55,0));rbox(.66,.09,.62,'#c8b2ee',.07,ch,0,.49,.06);
 {const pw=rbox(.34,.32,.1,'#f4a6c0',.08,ch,.2,.8,-.18);pw.rotation.set(-.25,0,.18)}
 [[-.35,-.3],[.35,-.3],[-.35,.3],[.35,.3]].forEach(([x,z])=>cy(.04,.03,.16,'#5a3b22',x,.08,z,ch));
 /* ===== furnitur tambahan: meja samping, kabinet + pemutar piringan hitam, meja kopi + pouf, gitar, jam dinding ===== */
 {/* meja samping di sebelah kursi santai */
  cy(.34,.34,.05,'#c98b52',4.3,.62,2.0,GR);cy(.04,.05,.58,'#5a3b22',4.3,.3,2.0,GR);cy(.22,.24,.04,'#5a3b22',4.3,.02,2.0,GR);
  cy(.06,.055,.1,'#f3f8ff',4.2,.72,1.9,GR);cy(.05,.05,.01,'#6b4423',4.2,.775,1.9,GR);
  rbox(.3,.05,.22,'#e84a5f',.02,GR,4.4,.68,2.1);rbox(.28,.05,.2,'#4f8fe8',.02,GR,4.4,.73,2.1);cy(.06,.05,.1,'#c98b52',4.45,.8,2.1,GR);ball(.08,'#4fa05a',4.45,.9,2.1);ball(.06,'#6dc07a',4.5,.95,2.14)}
 {/* kabinet + pemutar piringan hitam (tap = putar / berhenti) */
  rbox(.5,.75,1.5,'#a8743f',.05,GR,4.4,.375,-1.2);rbox(.56,.05,1.6,'#c98b52',.03,GR,4.4,.775,-1.2);
  [-1.5,-.9].forEach(z=>{bx(.02,.55,.62,'#8a5a34',4.14,.4,z,GR);ball(.03,'#f2c14e',4.13,.42,z+(z<-1.2?.2:-.2))});
  rbox(.4,.06,.46,'#2a3a52',.02,GR,4.4,.83,-1.5);
  const vin=cy(.17,.17,.02,'#10203d',4.4,.87,-1.5,GR);const lab=cy(.05,.05,.025,'#e84a5f',4.4,.875,-1.5,GR);
  limb2(new V3(4.52,.9,-1.65),new V3(4.42,.9,-1.54),.012,'#cfd6e0');ball(.03,'#cfd6e0',4.52,.9,-1.65);
  rbox(.3,.5,.3,'#5a3b22',.04,GR,4.4,1.05,-.8);[[.95,.1],[1.2,.05]].forEach(([y,r])=>{const c=cy(r,r,.02,'#10203d',4.24,y,-.8,GR);c.rotation.z=Math.PI/2});
  rbox(.05,.3,.22,'#f2c14e',.02,GR,4.5,.97,-1.05);
  stepF.push((dt)=>{if(!GR.visible)return;if(GR.userData.vinyl){vin.rotation.y+=dt*3.2;lab.rotation.y=vin.rotation.y}})}
 {/* meja kopi bulat + vas bunga, 2 pouf di karpet */
  cy(.55,.55,.06,'#c98b52',0,.4,1.0,GR);[0,2.1,4.2].forEach(a=>cy(.04,.03,.4,'#5a3b22',Math.cos(a)*.38,.2,1.0+Math.sin(a)*.38,GR));
  rbox(.4,.05,.3,'#4f8fe8',.02,GR,-.15,.46,.95);{const b=rbox(.36,.05,.28,'#f4a6c0',.02,GR,-.14,.51,.96);b.rotation.y=.3}
  cy(.07,.06,.2,'#8fd0f0',.25,.53,1.05,GR);[['#f4a6c0',.25,.7,1.05],['#f2c14e',.3,.68,1.1],['#ffffff',.2,.68,1.0]].forEach(([c,x,y,z])=>{limb2(new V3(.25,.55,1.05),new V3(x,y,z),.01,'#3f9150');ball(.06,c,x,y,z)});
  cy(.07,.06,.09,'#fff1cf',-.35,.47,1.2,GR);
  [[-1.35,1.35,'#e84a5f','#f07a8a'],[1.35,1.45,'#2e527f','#4a76b0']].forEach(([x,z,c,c2])=>{cy(.34,.36,.3,c,x,.15,z,GR);cy(.3,.3,.04,c2,x,.32,z,GR)})}
 {/* gitar di stand, kiri depan */
  const gt=new THREE.Group();gt.position.set(-4.3,0,2.85);gt.rotation.y=-.6;GR.add(gt);
  const rz=(m)=>{m.rotation.z=Math.PI/2;return m};
  bx(.3,.03,.04,'#2a3a52',0,.015,0,gt);bx(.04,.03,.4,'#2a3a52',0,.015,0,gt);
  rz(cy(.27,.27,.1,'#d98b52',0,.33,0,gt));rz(cy(.21,.21,.1,'#d98b52',0,.66,0,gt));rz(cy(.08,.08,.012,'#1a1a1a',.052,.42,0,gt));
  bx(.04,.75,.06,'#5a3b22',0,1.15,0,gt);bx(.04,.16,.09,'#3a2a1a',0,1.6,0,gt);bx(.02,.04,.14,'#3a2a1a',.03,.26,0,gt);
  [-.015,0,.015].forEach(z=>bx(.006,.78,.006,'#e8e8e8',.03,.9,z,gt));
  bx(.14,.03,.12,'#2a3a52',-.07,1.0,0,gt);{const A=new V3(-.15,.03,0),B=new V3(-.13,1.0,0),d=new V3().subVectors(B,A),m=cy(.012,.016,d.length(),'#2a3a52',(A.x+B.x)/2,(A.y+B.y)/2,0,gt);m.quaternion.setFromUnitVectors(Yv,d.normalize())}}
 {/* jam dinding (jarum jalan sesuai jam sebenarnya), di atas pintu */
  const ck=new THREE.Group();ck.position.set(-4.9,3.5,1.3);GR.add(ck);
  const rzc=(m)=>{m.rotation.z=Math.PI/2;return m};
  rzc(cy(.36,.36,.06,'#5a3b22',.03,0,0,ck));rzc(cy(.3,.3,.02,'#fffdf3',.065,0,0,ck));
  [0,1,2,3].forEach(i=>{const a=i*Math.PI/2;bx(.01,.05,.025,'#1f3a5f',.08,Math.cos(a)*.25,Math.sin(a)*.25,ck).rotation.x=a});
  const hh=new THREE.Group(),mh=new THREE.Group();hh.position.x=mh.position.x=.085;ck.add(hh,mh);bx(.012,.15,.03,'#1f3a5f',0,.075,0,hh);bx(.01,.23,.02,'#e84a5f',0,.115,0,mh);ball(.02,'#1f3a5f',.085,0,0,ck);
  stepF.push(()=>{if(!GR.visible)return;const d=new Date(),m=d.getMinutes()+d.getSeconds()/60;mh.rotation.x=-m/60*Math.PI*2;hh.rotation.x=-(((d.getHours()%12)+m/60)/12)*Math.PI*2})}
 /* rintangan baru supaya avatar tidak menembus perabot */
 if(window.R3&&R3.OB&&R3.OB[2]&&!R3.OB[2]._f){const o=R3.OB[2].concat([[3.85,4.8,.4,1.4],[3.95,4.65,1.65,2.35],[4.0,4.7,-1.95,-.45],[-.6,.6,.4,1.6],[-1.75,-.95,.95,1.75],[.95,1.75,1.05,1.85],[-4.7,-3.9,2.55,3.2]]);o._f=1;R3.addRoom(2,o,R3.BND[2],R3.POIS[2])}
 /* rak melayang di dinding kiri */
 const LW=new THREE.Group();LW.position.set(-4.9,0,-1.3);GR.add(LW);
 [2.1,3.0].forEach(y=>{rbox(.34,.07,1.7,'#a8743f',.03,LW,.17,y,0);[-.7,.7].forEach(z=>rbox(.1,.25,.06,'#5a3b22',.02,LW,.05,y-.15,z))});
 ['#e84a5f','#4f8fe8','#f2c14e','#8fd18a','#a98bd6','#f4a6c0'].forEach((c,i)=>bx(.2,.4+(i%3)*.06,.12,c,.15,2.34+(i%3)*.03,-.7+i*.14,LW));
 cy(.08,.06,.12,'#c98b52',.15,2.2,.55,LW);{const s=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),M('#6dc07a'));s.position.set(.15,2.32,.55);LW.add(s)}
 cy(.07,.07,.2,'#f3f8ff',.15,2.24,.2,LW);bx(.03,.05,.03,'#ffd24a',.15,2.38,.2,LW);
 {const r=rbox(.04,.5,.4,'#5a3b22',.02,LW,.1,3.3,-.5),a=new THREE.Mesh(new THREE.PlaneGeometry(.33,.43),new THREE.MeshBasicMaterial({map:SD.t}));a.rotation.y=Math.PI/2;a.position.set(.125,3.3,-.5);LW.add(a)}
 {const gb=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),M('#4f8fe8'));gb.position.set(.15,3.23,.4);LW.add(gb);cy(.02,.02,.1,'#cfd6e0',.15,3.1,.4,LW);cy(.07,.07,.02,'#cfd6e0',.15,3.05,.4,LW)}
 /* lukisan dinding kiri + neon */
 [[2.8,3.0,.8,.8],[-3.0,3.0,.8,.8]].forEach(([z,y,w,h],i)=>{rbox(.06,h+.14,w+.14,'#5a3b22',.02,GR,-4.94,y,z);const a=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:(i?SN:SD).t}));a.rotation.y=Math.PI/2;a.position.set(-4.9,y,z);GR.add(a)});
 {const nt=cvs(256,64,(g,W,H)=>{g.textAlign='center';g.textBaseline='middle';g.font='26px '+FN;g.shadowColor='#ff6fae';g.shadowBlur=18;g.fillStyle='#ffd0e6';g.fillText('memories',W/2,H/2);g.shadowBlur=6;g.fillText('memories',W/2,H/2)}),m=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.45),new THREE.MeshBasicMaterial({map:nt.t,transparent:true,depthWrite:false}));m.rotation.y=Math.PI/2;m.position.set(-4.92,3.85,-1.3);GR.add(m)}
 /* cahaya lampu + debu melayang */
 {const gt=cvs(64,64,g=>{const r=g.createRadialGradient(32,32,2,32,32,32);r.addColorStop(0,'rgba(255,225,150,.9)');r.addColorStop(1,'rgba(255,225,150,0)');g.fillStyle=r;g.fillRect(0,0,64,64)}).t,sp=new THREE.Sprite(new THREE.SpriteMaterial({map:gt,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending}));sp.scale.set(2.4,2.4,1);sp.position.set(4.3,3.2,-2.9);GR.add(sp);
  const N=50,pa=new Float32Array(N*3);for(let i=0;i<N;i++){pa[i*3]=-4.5+Math.random()*9;pa[i*3+1]=.5+Math.random()*4;pa[i*3+2]=-3+Math.random()*6}
  const pg2=new THREE.BufferGeometry();pg2.setAttribute('position',new THREE.BufferAttribute(pa.slice(),3));GR.add(new THREE.Points(pg2,new THREE.PointsMaterial({color:'#fff3c0',size:.07,transparent:true,opacity:.7})));
  stepF.push((dt,t)=>{if(!GR.visible)return;const a=pg2.attributes.position.array;for(let i=0;i<N;i++){a[i*3]=pa[i*3]+Math.sin(t*.3+i)*.3;a[i*3+1]=pa[i*3+1]+Math.sin(t*.5+i*2)*.25}pg2.attributes.position.needsUpdate=true;sp.material.opacity=.55+.12*Math.sin(t*2)})}
}

/* ================= TV LOUNGE: 9 channel (tap untuk ganti), tidak lagi membuka galeri ================= */

/* suara TV: disintesis lewat WebAudio (tanpa file). Mulai setelah TV pertama kali di-tap (aturan autoplay browser),
   berhenti kalau keluar lounge / tombol sfx off / radio menyala. CH1 (musik) memakai radio, jadi tidak ada suara tambahan. */
const TVA=(()=>{let ac=null,out=null,nz=null,cur=-1,nodes=[],tok=0,armed=false;
 const ctx=()=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();if(!out){out=ac.createGain();out.gain.value=.55;out.connect(ac.destination)}return ac}catch(e){return null}};
 const noise=()=>{if(nz)return nz;const b=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return nz=b};
 const gn=v=>{const g=ac.createGain();g.gain.value=v;g.connect(out);nodes.push(g);return g};
 const nsrc=(g,type,f,q)=>{const s=ac.createBufferSource();s.buffer=noise();s.loop=true;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;if(q)fl.Q.value=q;s.connect(fl);fl.connect(g);s.start();nodes.push(s,fl)};
 const osc=(g,type,f)=>{const o=ac.createOscillator();o.type=type;o.frequency.value=f;o.connect(g);o.start();nodes.push(o);return o};
 const blip=(f,d,type,v,w,f2)=>{const T=ac.currentTime+(w||0),o=ac.createOscillator(),g=ac.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,T);if(f2)o.frequency.exponentialRampToValueAtTime(f2,T+d);g.gain.setValueAtTime(v||.1,T);g.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(g);g.connect(out);o.start(T);o.stop(T+d+.02)};
 const nb=(d,f,v,type)=>{const T=ac.currentTime,s=ac.createBufferSource();s.buffer=noise();const fl=ac.createBiquadFilter();fl.type=type||'highpass';fl.frequency.value=f;const g=ac.createGain();g.gain.setValueAtTime(v,T);g.gain.exponentialRampToValueAtTime(.0001,T+d);s.connect(fl);fl.connect(g);g.connect(out);s.start(T,Math.random());s.stop(T+d+.02)};
 const whoosh=(f0,f1,d,v)=>{const T=ac.currentTime,s=ac.createBufferSource();s.buffer=noise();const fl=ac.createBiquadFilter();fl.type='bandpass';fl.Q.value=1.2;fl.frequency.setValueAtTime(f0,T);fl.frequency.exponentialRampToValueAtTime(f1,T+d);const g=ac.createGain();g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(v,T+d*.5);g.gain.exponentialRampToValueAtTime(.0001,T+d);s.connect(fl);fl.connect(g);g.connect(out);s.start(T,Math.random());s.stop(T+d+.05)};
 const loop=(fn,a,b)=>{const k=tok,go=()=>{if(k!==tok)return;try{fn()}catch(e){}setTimeout(go,(a+Math.random()*(b-a))*1000)};setTimeout(go,a*500)};
 const stop=()=>{tok++;nodes.forEach(n=>{try{n.stop&&n.stop()}catch(e){}try{n.disconnect()}catch(e){}});nodes=[]};
 /* Happy Birthday (lagu domain publik) */
 const MEL=[[392,.75],[392,.25],[440,1],[392,1],[523,1],[494,2],[392,.75],[392,.25],[440,1],[392,1],[587,1],[523,2],[392,.75],[392,.25],[784,1],[659,1],[523,1],[494,1],[440,2],[698,.75],[698,.25],[659,1],[523,1],[587,1],[523,2]];
 const note=(f,T,d)=>[['square',.045,1],['triangle',.12,1],['sine',.06,2]].forEach(([ty,v,m])=>{const o=ac.createOscillator(),g=ac.createGain();o.type=ty;o.frequency.value=f*m;g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(v,T+.02);g.gain.setValueAtTime(v,T+d*.7);g.gain.exponentialRampToValueAtTime(.0001,T+d);o.connect(g);g.connect(out);o.start(T);o.stop(T+d+.02)});
 const start=c=>{
  if(c===1){nsrc(gn(.07),'lowpass',600);loop(()=>blip(450+Math.random()*350,.14,'sine',.12,0,900+Math.random()*500),.25,1.2)}
  else if(c===2){nsrc(gn(.09),'lowpass',220);loop(()=>nb(.02+Math.random()*.05,1800+Math.random()*2500,.12+Math.random()*.2),.06,.5);loop(()=>nb(.08,900,.3),1.5,4)}
  else if(c===3){let i=0,nx=ac.currentTime+.1;const k=tok,sch=()=>{if(k!==tok)return;while(nx<ac.currentTime+.5){const d=MEL[i][1]*.4;note(MEL[i][0],nx,d*.95);nx+=d;i++;if(i>=MEL.length){i=0;nx+=1.6}}setTimeout(sch,150)};sch()}
  else if(c===4){const d=osc(gn(.08),'sine',55);osc(gn(.05),'sine',82.6);osc(gn(.02),'triangle',110.4);loop(()=>d.frequency.setTargetAtTime(50+Math.random()*10,ac.currentTime,2),2,4);loop(()=>blip(1200+Math.random()*1800,.3,'sine',.05),.5,2);loop(()=>whoosh(250,1400,2,.12),8,12)}
  else if(c===5){nsrc(gn(.1),'bandpass',3500,.5);nsrc(gn(.05),'highpass',7000);osc(gn(.03),'sine',60);loop(()=>whoosh(900,200,1.6,.1),5,8);loop(()=>nb(2.4,160,.55,'lowpass'),10,22)}
  else if(c===7){const g=gn(.08),fl=ac.createBiquadFilter();fl.type='lowpass';fl.frequency.value=220;fl.connect(g);nodes.push(fl);osc(fl,'sawtooth',27)}
  else if(c===8){nsrc(gn(.06),'highpass',300)}};
 return{arm(){armed=true;ctx()},
  sync(c,ok){const w=armed&&ok&&c>0?c:-1;if(w===cur)return;stop();cur=w;if(w>0&&ctx())start(w)},
  get cur(){return cur},
  hit(k){if(cur!==6||!ac)return;if(k==='p')blip(520,.07,'square',.1);else if(k==='w')blip(330,.06,'square',.08);else blip(880,.14,'square',.08,0,1320)},
  meow(){if(cur!==7||!ac)return;const T=ac.currentTime,o=ac.createOscillator(),fl=ac.createBiquadFilter(),g=ac.createGain();o.type='sawtooth';o.frequency.setValueAtTime(520,T);o.frequency.linearRampToValueAtTime(880,T+.18);o.frequency.linearRampToValueAtTime(470,T+.6);fl.type='lowpass';fl.frequency.value=1700;g.gain.setValueAtTime(.0001,T);g.gain.exponentialRampToValueAtTime(.14,T+.06);g.gain.exponentialRampToValueAtTime(.0001,T+.65);o.connect(fl);fl.connect(g);g.connect(out);o.start(T);o.stop(T+.7)}}})();
{const scr=tg0.children.find(o=>o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===1.62);
 if(scr){const tc=cvs(160,90,()=>{},1),g=tc.g;scr.material=new THREE.MeshBasicMaterial({map:tc.t});let ch=0,lt=0,lk1=-1,lk2=-1,lk3=-1,lm=-1;const NM=['MUSIK','AKUARIUM','PERAPIAN','ULTAH','ANGKASA','KOTA MALAM','PONG','KUCING','NO SIGNAL'],P=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w||1,h||1)};
  stepF.push((dt,t)=>{TVA.sync(LG.visible?ch:0,typeof SFX==='undefined'||(SFX.on&&!on));if(!LG.visible||t-lt<.08)return;lt=t;g.textBaseline='top';g.textAlign='left';
   if(ch===0){P('#0b1130',0,0,160,90);P('#2a3a78',0,0,160,10);g.fillStyle='#f2c14e';g.font='7px '+FN;g.fillText('NOW PLAYING',6,22);g.fillStyle=on?'#8fd18a':'#6f89b0';g.font='9px '+FN;g.fillText(on?String(T[ti].n).slice(0,14):'radio mati',6,36);
    for(let i=0;i<20;i++){const h=on?6+Math.abs(Math.sin(t*5+i*1.1)*Math.sin(t*2.3+i))*34:3;P(i>15?'#f2c14e':i>9?'#8fd0f0':'#8fd18a',8+i*7,78-h,5,h)}}
   else if(ch===1){for(let i=0;i<9;i++)P(['#3b7dd8','#4a8ae4','#5b9bee','#6cacf5','#7dbcfa','#6cacf5','#5b9bee','#4a8ae4','#3b7dd8'][i],0,i*9,160,10);P('#e8d8b0',0,80,160,10);
    for(let i=0;i<7;i++){const x=(i*23)%150,h=10+(i%3)*6;P('#4fa05a',x,80-h-Math.sin(t*2+i)*2,3,h)}
    for(let i=0;i<5;i++){const x=((t*(14+i*5)+i*47)%190)-15,y=14+i*11+Math.sin(t*2+i)*3,c=['#f2c14e','#e84a5f','#fff','#f4a6c0','#8fd18a'][i];g.fillStyle=c;g.beginPath();g.ellipse(x+4.5,y+2.5,5,3,0,0,7);g.fill();g.beginPath();g.moveTo(x-1,y+2.5);g.lineTo(x-6,y-.5);g.lineTo(x-6,y+5.5);g.fill();P('#fff',x+6,y+1,2,2);P('#10203d',x+7,y+1,1,1)}
    for(let i=0;i<8;i++)P('#cfe8ff',(i*31+t*3)%160,(90-(t*14+i*19)%90)%90,2,2)}
   else if(ch===2){P('#1a0f0a',0,0,160,90);P('#6b3a24',34,26,92,64);for(let y=26;y<90;y+=8)for(let x=34+((y/8)%2)*6;x<126;x+=12)P('#4a2616',x,y,11,1);P('#120805',52,40,56,50);P('#3a2412',44,22,72,6);
    for(let x=0;x<56;x+=2){const h=8+(Math.sin(t*9+x*.6)*.5+.5)*26*(1-Math.abs(x-28)/38);P('#e8532f',52+x,90-h,2,h);P('#f2a33f',52+x,90-h*.7,2,h*.7);P('#ffe27a',52+x,90-h*.4,2,h*.4)}P('#6b4429',58,86,44,4)}
   else if(ch===3){P('#2b1650',0,0,160,90);
    for(let i=0;i<30;i++)P(['#f2c14e','#e84a5f','#8fd0f0','#a98bd6','#8fd18a'][i%5],(i*37+Math.sin(t+i)*6)%160,((t*18+i*23)%100)-6,3,3);
    P('#c98b52',20,70,120,6);P('#8a5a2c',24,76,6,10);P('#8a5a2c',130,76,6,10);
    P('#fff',58,56,44,14);P('#5b9bee',62,46,36,12);P('#8dbdf7',62,44,36,3);P('#e84a5f',68,42,3,3);P('#f2c14e',78,42,3,3);P('#8fd18a',88,42,3,3);
    [68,78,88].forEach((x,i)=>{P(['#8fd0f0','#f2c14e','#a98bd6'][i],x,34,3,10);P(Math.sin(t*10+i*2)>0?'#ffd24a':'#ff9a2e',x,29+(i%2),3,5)});
    g.textAlign='center';g.fillStyle=Math.floor(t*2)%2?'#fff':'#f2c14e';g.font='8px '+FN;g.fillText('HAPPY BIRTHDAY',80,5);g.fillText('AQSA!',80,16);g.textAlign='left'}
   else if(ch===4){P('#050a1f',0,0,160,90);
    for(let i=0;i<40;i++){if(Math.sin(t*3+i)>-.4)P(i%7?'#fff':'#f2c14e',(i*53)%160,(i*29)%78,1,1)}
    g.fillStyle='#e8a05a';g.beginPath();g.arc(118,48,17,0,7);g.fill();g.fillStyle='#c27a3a';g.fillRect(104,46,28,4);g.fillRect(108,54,22,3);
    g.strokeStyle='#f2d9a0';g.lineWidth=2;g.beginPath();g.ellipse(118,48,28,6,-.3,0,7);g.stroke();
    {const rx=((t*20)%200)-20,ry=64-Math.sin(t*2)*6;P('#fff',rx,ry,12,5);P('#e84a5f',rx+12,ry,4,5);P('#8fd0f0',rx+4,ry+1,3,3);P('#f2c14e',rx-5,ry+1,5,3);P('#e84a5f',rx-8,ry+2,3,1)}
    {const k=(t*40)%120;P('#fff',150-k,k*.5,2,2);P('rgba(255,255,255,.5)',153-k,k*.5,7,1)}}
   else if(ch===5){P('#0a1030',0,0,160,90);P('#f4f0c8',128,8,10,10);P('#0a1030',132,7,8,9);
    [[0,34,20],[20,22,18],[38,40,22],[60,28,16],[76,46,24],[100,30,20],[120,38,18],[138,24,22]].forEach(([x,h,w])=>{P('#141c3d',x,90-h,w,h);
     for(let wy=90-h+4;wy<84;wy+=7)for(let wx=x+3;wx<x+w-3;wx+=6)P(Math.sin(wx*7.1+wy*3.3+Math.floor(t*.7))>0?'#f2c14e':'#26325e',wx,wy,3,3)});
    P('#e84a5f',((t*30)%180)-10,86,8,3);P('#8fd0f0',160-((t*22)%180),84,8,3);
    for(let i=0;i<40;i++)P('rgba(180,210,255,.6)',(i*47+t*20)%160,(t*90+i*31)%90,1,4)}
   else if(ch===6){P('#0a0a12',0,0,160,90);{const k1=Math.floor(t*.55),k2=Math.floor((t*2.4-1.5708)/3.1416),k3=Math.floor(t/4);if(k1!==lk1)TVA.hit('p');if(k2!==lk2)TVA.hit('w');if(k3!==lk3)TVA.hit('s');lk1=k1;lk2=k2;lk3=k3}for(let y=0;y<80;y+=8)P('#3b4570',79,y,2,4);
    {const u=Math.abs(((t*.55)%2)-1)*2-1,bxp=80+u*68,byp=45+Math.sin(t*2.4)*30,ly=cl(45+Math.sin((t-.25)*2.4)*30-8,2,70);
     P('#fff',6,ly,3,16);P('#fff',151,cl(byp-8,2,70),3,16);P('#f2c14e',bxp-2,byp-2,4,4);
     g.fillStyle='#8fd0f0';g.font='9px '+FN;g.fillText(String(Math.floor(t/4)%10),58,6);g.fillText(String(Math.floor(t/5)%10),96,6)}}
   else if(ch===7){P('#f7d9e6',0,0,160,90);{const k=Math.floor(t/6);if(k!==lm){lm=k;TVA.meow()}}P('#d9a9c0',0,72,160,18);
    {const tw=Math.sin(t*4)*5;P('#f0dcc0',100,58,8,6);P('#f0dcc0',106,52+tw*.3,7,8);P('#f0dcc0',110+tw*.4,44,6,10);P('#c9a97a',110+tw*.4,44,6,3)}
    P('#f0dcc0',56,44,46,30);P('#f0dcc0',62,22,36,26);P('#f0dcc0',62,16,7,9);P('#f0dcc0',91,16,7,9);P('#f4a6c0',64,19,3,5);P('#f4a6c0',93,19,3,5);
    P('#c9a97a',76,22,8,4);P('#c9a97a',68,52,6,3);P('#c9a97a',88,52,6,3);
    if(t%3<.2){P('#4a3328',68,32,7,1);P('#4a3328',85,32,7,1)}else{P('#4a3328',69,29,5,6);P('#4a3328',86,29,5,6);P('#fff',70,30,1,1);P('#fff',87,30,1,1)}
    P('#e8808f',78,38,4,2);P('#bfa98a',54,38,10,1);P('#bfa98a',96,38,10,1);P('#bfa98a',54,41,9,1);P('#bfa98a',97,41,9,1);
    P('#fff',60,70,12,6);P('#fff',86,70,12,6);
    if(t%6<1.6){P('#fff',104,8,40,16);P('#fff',104,22,4,4);g.fillStyle='#4a3328';g.font='7px '+FN;g.fillText('MEONG~',107,13)}}
   else{P('#222',0,0,160,90);for(let i=0;i<280;i++){const v=(Math.random()*255)|0;P('rgb('+v+','+v+','+v+')',(Math.random()*160)|0,(Math.random()*90)|0,4,2)}
    P('rgba(0,0,0,.6)',30,30,100,24);g.fillStyle='#fff';g.font='9px '+FN;g.fillText('NO SIGNAL',45,38)}
   P('rgba(0,0,0,.6)',0,80,160,10);g.fillStyle='#f2c14e';g.font='7px '+FN;g.fillText('CH'+(ch+1)+' '+NM[ch],5,83);{const sn=ch===0?on:TVA.cur>0,c=sn?'#f2c14e':'#6f89b0';P(c,144,84,3,3);P(c,147,82,2,7);P(c,149,81,1,9);if(sn){P(c,152,84,1,3);P(c,154,82,1,7)}else{['152,83','154,83','153,84','152,85','154,85'].forEach(q=>{const[x,y]=q.split(',');P('#e84a5f',+x,+y,1,1)})}}g.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<90;y+=3)g.fillRect(0,y,160,1);tc.t.needsUpdate=true});
  tg0.userData.fn=()=>{TVA.arm();const v=who();if(v){if(v.mode!=='sit'&&!watching(v)){const n=[...V.values()].filter(watching).length;v.mode=null;v.path=null;v.xfer=null;v.goal={x:1.2+[0,-1.2,1.2][n%3],z:-1.2,mode:'watch'}}v.watchT=25}
   ch=(ch+1)%NM.length;lt=0;if(typeof SFX!=='undefined')SFX.click();say3(tg0,'CH'+(ch+1)+' · '+NM[ch].toLowerCase())};window.tvNext=()=>{TVA.arm();ch=(ch+1)%NM.length;lt=0;if(typeof SFX!=='undefined')SFX.click();say3(tg0,'CH'+(ch+1)+' · '+NM[ch].toLowerCase())}}}

/* ================= RAK BUKU 3D + BUKU TERBUKA (halaman bisa dibalik) ================= */
{const isB=(o,w,h,d)=>o.geometry&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===w&&o.geometry.parameters.height===h&&(d==null||Math.abs(o.geometry.parameters.depth-d)<.001);
 const sb=sh.children.filter(o=>isB(o,.4,.8,.17)).sort((a,b)=>a.position.z-b.position.z),jb=sh.children.find(o=>isB(o,.36,.7,.12));
 const defs=CFG.books.map((b,i)=>({...b,m:sb[i]})).concat([{id:'jurnal',title:'Jurnal Harian',by:'plup',c:'#a98bd6',m:jb,j:1}]);
 const journalPages=()=>{const J=EXTRA.journal,n=J.length,t0=new Date();t0.setHours(0,0,0,0);const end=new Date(t0.getFullYear(),EXTRA.bday.m-1,EXTRA.bday.d);
  return J.map((t,i)=>{const d=new Date(end);d.setDate(end.getDate()-(n-1-i));const lab=d.getDate()+' '+MN[d.getMonth()].slice(0,3);return lab+(d.getTime()===t0.getTime()?' · hari ini':'')+'\n\n'+(d<=t0?t:'[terkunci]\ndibuka tanggal '+lab)})};
 const split=txt=>{const g=document.createElement('canvas').getContext('2d');g.font='26px '+VT;const MAX=13,out=[];let cur=[];const flush=()=>{if(cur.length)out.push(cur.join('\n'));cur=[]};
  txt.replace(/\r/g,'').replace(/_/g,'').split(/\n\s*\n/).map(p=>p.replace(/\s*\n\s*/g,' ').trim()).filter(Boolean).forEach(p=>{const L=wrap(g,p,295);
   if(L.length>MAX){flush();for(let i=0;i<L.length;i+=MAX)out.push(L.slice(i,i+MAX).join('\n'));return}
   if(cur.length&&cur.length+1+L.length>MAX)flush();if(cur.length)cur.push('');cur.push(...L)});flush();return out};
 function openBook(d){
  const hg=new THREE.Group(),C={g:hg,ctl:[],t:0},sp=new V3(),from=new V3();sh.getWorldPosition(sp);d.m.getWorldPosition(from);const to=new V3(sp.x+1.4,2.0,sp.z);
  let PG=[{t:d.title,by:d.by},d.j?'':'membuka buku...'],s=0,anim=null;
  if(d.j)PG=[PG[0]].concat(journalPages());
  const sk='bday3d-b-'+d.id,draw=(i)=>(g,W,H)=>{g.fillStyle='#fffdf3';g.fillRect(0,0,W,H);g.fillStyle='rgba(120,90,40,.07)';g.fillRect(i%2?W-16:0,0,16,H);const p=PG[i];if(i<0||p==null)return;g.fillStyle='#1f3a5f';g.textBaseline='alphabetic';
   if(typeof p==='object'){g.textAlign='center';g.font='18px '+FN;const L=wrap(g,p.t,W-80);L.forEach((l,k)=>g.fillText(l,W/2,170+k*34));g.font='34px '+VT;g.fillStyle='#8a5a34';g.fillText('- '+p.by,W/2,200+L.length*34);g.fillStyle=d.c;g.fillRect(W/2-40,120,80,6)}
   else{g.textAlign='left';g.font='26px '+VT;wrap(g,p,W-70).forEach((l,k)=>g.fillText(l,35,60+k*27));g.font='9px '+FN;g.textAlign='center';g.fillStyle='#8a5a34';g.fillText(String(i),W/2,H-22)}};
  const ix={a:0,f:1,k:2,b:3},T={};Object.keys(ix).forEach(k=>T[k]=cvs(380,520,(g,W,H)=>draw(2*s+ix[k])(g,W,H)));
  const setP=()=>Object.values(T).forEach(x=>x.r()),pm=k=>new THREE.MeshBasicMaterial({map:T[k].t});
  const cv2=d.c;bx(1.42,1.95,.06,cv2,-.71,0,-.03,hg);bx(1.42,1.95,.06,cv2,.71,0,-.03,hg);bx(.1,1.95,.07,cv2,0,0,-.03,hg);bx(1.32,1.84,.1,'#efe6cf',-.66,0,.03,hg);bx(1.32,1.84,.1,'#efe6cf',.66,0,.03,hg);
  [['a',-.66],['b',.66]].forEach(([k,x])=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(1.3,1.8),pm(k));m.position.set(x,0,.081);hg.add(m)});
  const lf=new THREE.Group();lf.position.set(0,0,.09);hg.add(lf);const lg=new THREE.BoxGeometry(1.3,1.8,.012);lg.translate(.65,0,0);const pp=new THREE.MeshLambertMaterial({color:'#efe6cf'});lf.add(new THREE.Mesh(lg,[pp,pp,pp,pp,pm('f'),pm('k')]));
  const smax=()=>Math.floor((PG.length-1)/2),save=()=>{ls(sk,String(s));if(2*s+1>=PG.length-1&&!d.j&&ls('bday-read-'+d.id)!=='1'){ls('bday-read-'+d.id,'1');confetti()}};
  const go=q=>{if(anim)return;if(q>0&&s<smax()){anim={d:1,u:0}}else if(q<0&&s>0){s--;setP();anim={d:-1,u:0}}};
  C.ctl.push(kbtn(hg,'<','#3b7dd8',.85,1.2,()=>go(-1),.55),kbtn(hg,'>','#f2b84b',1.45,1.2,()=>go(1),.55));
  s=cl(+ls(sk)||0,0,smax());setP();
  if(!d.j&&d.src)fetch(d.src).then(r=>{if(!r.ok)throw 0;return r.text()}).then(tx=>{PG=[PG[0]].concat(split(tx));s=cl(+ls(sk)||0,0,smax());setP()}).catch(()=>{PG[1]='teksnya belum bisa dibuka. pastikan file '+d.src+' ada di folder yang sama dan web dijalankan lewat server.';setP()});
  hg.position.copy(from);hg.scale.setScalar(.2);hg.rotation.y=Math.PI/2;S.add(hg);d.m.visible=false;
  const pt=goalT.clone(),pd=Z.td;goalT.copy(to);Z.td=fit(3.0,2.9);
  C.onclose=()=>{d.m.visible=true;goalT.copy(pt);Z.td=pd};
  C.upd=(dt,t)=>{C.t=Math.min(1,C.t+dt*2);const u=ease(C.t);hg.scale.setScalar(.2+.8*u);hg.position.lerpVectors(from,to,u);hg.position.y+=Math.sin(t*1.4)*.012;hg.rotation.y=Math.PI/2+Z.px*.2+(1-u)*.8;hg.rotation.x=Z.py*.12+(1-u)*.3;
   if(anim){anim.u=Math.min(1,anim.u+dt*2.2);const e=ease(anim.u);lf.rotation.y=-Math.PI*(anim.d>0?e:1-e);if(anim.u>=1){if(anim.d>0){s++;setP()}lf.rotation.y=0;anim=null;save()}}};
  if(typeof SFX!=='undefined')SFX.pop();Z.card=C}
 window.BOOKDEFS=defs;defs.forEach(d=>{if(d.m)d.m.userData.zfx=()=>openBook(d)});
 /* ---------- ZOOM RAK: bersihkan penghalang + nomori buku + daftar judul ---------- */
 const SHL={on:false,hid:new Map(),leg:null,css:null};
 /* plakat nomor kecil di punggung buku (menghadap kamera zoom rak) */
 const numLabel=(n,sz)=>{const t=cvs(64,64,(g,W,H)=>{g.fillStyle='#1f3a5f';g.fillRect(0,0,W,H);g.fillStyle='#fff8dc';g.fillRect(4,4,W-8,H-8);g.fillStyle='#1f3a5f';g.textAlign='center';g.textBaseline='middle';g.font=(String(n).length>1?26:34)+'px '+FN;g.fillText(String(n),W/2,H/2+2)},1);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(sz,sz),new THREE.MeshBasicMaterial({map:t.t}));m.rotation.y=Math.PI/2;return m};
 /* urutan: buku biasa dari KIRI ke KANAN layar (kamera di sisi +x melihat ke -x, jadi kiri layar = z besar), lalu jurnal, lalu buku emas */
 function shelfOrder(){const all=window.BOOKDEFS||defs,reg=all.filter(d=>d.m&&!d.j&&d.id!=='lencana').sort((a,b)=>b.m.position.z-a.m.position.z);
  const o=reg.concat(all.filter(d=>d.m&&d.j),all.filter(d=>d.m&&d.id==='lencana'));o.forEach((d,i)=>d.no=i+1);return o}
 function shelfLabels(order){order.forEach(d=>{if(d.lab&&d.labN===d.no)return;if(d.lab)d.m.remove(d.lab);
   let sz,x,y;const gp=d.m.geometry&&d.m.geometry.parameters;
   if(gp){sz=Math.min(.15,gp.depth*.9);x=gp.width/2+.012;y=-gp.height/2+Math.max(.16,sz/2+.03)}else{sz=.15;x=.312;y=.25} /* grup buku emas */
   const m=numLabel(d.no,sz);m.position.set(x,y,0);d.m.add(m);d.lab=m;d.labN=d.no})}
 function shelfLegend(order){
  if(!SHL.leg){const e=document.createElement('div');e.style.cssText='position:fixed;top:calc(env(safe-area-inset-top,0px) + 8px);left:8px;right:8px;z-index:12;display:none;flex-wrap:wrap;gap:5px;justify-content:center;max-height:34vh;overflow:auto;pointer-events:none';document.body.appendChild(e);SHL.leg=e}
  const e=SHL.leg;e.innerHTML='';
  order.forEach(d=>{const b=document.createElement('button');b.type='button';b.style.cssText='pointer-events:auto;display:flex;align-items:center;gap:6px;background:rgba(31,58,95,.92);color:#fff;border:3px solid #f2c14e;box-shadow:2px 2px 0 #0d1d33;padding:3px 8px 3px 4px;font:20px/1 VT323,monospace;cursor:pointer';
   const n=document.createElement('span');n.textContent=d.no;n.style.cssText='font:9px/1 "Press Start 2P",monospace;background:#f2c14e;color:#1f3a5f;padding:5px 5px;min-width:18px;text-align:center';
   b.append(n,document.createTextNode(d.title||('buku '+d.no)));
   b.onclick=ev=>{ev.stopPropagation();if(Z.card||!d.m||!d.m.visible)return;if(typeof SFX!=='undefined'&&SFX.click)SFX.click();d.m.userData.zfx()};e.append(b)})}
 /* semua yang bisa menghalangi: avatar (punyamu, Aqsa, pengunjung) + label namanya, kucing, dan perabot yang berdiri di depan rak */
 function shelfBlockers(sp,limit){const L=[],add=o=>{if(o&&o.visible!==undefined&&!L.includes(o))L.push(o)};
  if(typeof V!=='undefined')V.forEach(v=>{add(v.g);add(v.tg)});
  if(typeof av!=='undefined')add(av);if(typeof avHead!=='undefined')add(avHead);if(typeof cat!=='undefined')add(cat);
  add(lp);occl().forEach(add);
  const B=new THREE.Box3();
  S.children.forEach(c=>{if(c===sh||c.isLight||c.isCamera||!c.visible||L.includes(c))return;let inside=false;c.traverse(o=>{if(o===sh)inside=true});if(inside)return;
   B.setFromObject(c);if(B.isEmpty())return;const w=B.max.x-B.min.x,d=B.max.z-B.min.z;
   if(w<4&&d<4&&B.min.x>sp.x+.3&&B.min.x<limit&&B.max.z>sp.z-1.4&&B.min.z<sp.z+1.4&&B.max.y>.35&&B.min.y<3.9)L.push(c)});
  return L}
 const shelfHide=o=>{if(!SHL.hid.has(o))SHL.hid.set(o,o.visible);o.visible=false};
 stepF.push(()=>{if(!SHL.on)return;
  SHL.hid.forEach((v,o)=>{o.visible=false}); /* kalau ada yang dimunculkan lagi oleh skrip lain, sembunyikan lagi */
  if(typeof V!=='undefined')V.forEach(v=>{if(v.g&&!SHL.hid.has(v.g))shelfHide(v.g);if(v.tg&&!SHL.hid.has(v.tg))shelfHide(v.tg)}); /* pengunjung baru yang muncul saat zoom */
  if(typeof av!=='undefined'&&!SHL.hid.has(av))shelfHide(av);
  if(typeof sayEl!=='undefined'&&sayEl)sayEl.style.display='none';
  if(SHL.leg)SHL.leg.style.display=Z.card?'none':'flex'});
 const openShelf=()=>{const sp=new V3();sh.getWorldPosition(sp);zin({tgt:new V3(sp.x,1.9,sp.z),fit:[2.7,3.9],yaw:Math.PI/2,pit:.05,hint:'tap buku (atau nomor di atas) untuk membaca · ungu = jurnal harian · emas = lencana',ctl:()=>defs.map(d=>d.m).concat((window.BOOKDEFS||[]).map(d=>d.m)).filter((m,i,a)=>m&&m.visible&&a.indexOf(m)===i),
  enter(){const order=shelfOrder();shelfLabels(order);order.forEach(d=>{if(d.lab)d.lab.visible=true});shelfLegend(order);
   if(!SHL.css){const st=document.createElement('style'),se=typeof sayEl!=='undefined'&&sayEl?(sayEl.id?'#'+sayEl.id:(sayEl.classList&&sayEl.classList[0]?'.'+sayEl.classList[0]:'')):'';st.textContent=se?'body.shelfzoom '+se+'{display:none!important}':'';document.head.appendChild(st);SHL.css=st}
   document.body.classList.add('shelfzoom');
   shelfBlockers(sp,sp.x+Z.td*.95+.5).forEach(o=>{if(o.visible)shelfHide(o)});
   SHL.on=true;SHL.leg.style.display='flex'},
  exit(){SHL.on=false;document.body.classList.remove('shelfzoom');if(SHL.leg)SHL.leg.style.display='none';
   (window.BOOKDEFS||defs).forEach(d=>{if(d.lab)d.lab.visible=false});
   SHL.hid.forEach((v,o)=>{o.visible=v});SHL.hid.clear()}})};
 sh.userData.fn=openShelf}

/* ================= GESER LAYAR: 2 jari (HP) / shift+seret atau klik kanan (PC), cubit untuk zoom ================= */
{const Pt=new Map();let pan=false,lx=0,ly=0,ld=0,mouseP=false;
 const _d2=cv.onpointerdown,_m2=cv.onpointermove,_u2=cv.onpointerup,mid=()=>{const a=[...Pt.values()],p=a[0],q=a[1]||p;return{x:(p.x+q.x)/2,y:(p.y+q.y)/2,d:Math.hypot(p.x-q.x,p.y-q.y)}};
 const move=(dx,dy)=>{const k=.828*dist/innerHeight,s=Math.sin(yaw),c=Math.cos(yaw),f2=window.F2&&window.F2.on,cx=f2?window.F2.cx+(window.F2.pc||0):[1,40,80][curRoom]||1,w=(f2||curRoom)?((f2&&window.F2.pw)||3):8;
  goalT.x=cl(goalT.x-dx*k*c+dy*k*-s,cx-w,cx+w);goalT.z=cl(goalT.z+dx*k*s+dy*k*-c,(f2||curRoom)?-3:-2,(f2||curRoom)?3:6)};
 cv.oncontextmenu=e=>e.preventDefault();
 cv.onpointerdown=e=>{if(Z.on)return _d2(e);
  if(e.pointerType==='mouse'&&(e.shiftKey||e.button===2)){mouseP=true;lx=e.clientX;ly=e.clientY;cv.setPointerCapture(e.pointerId);return}
  if(e.pointerType!=='mouse'){Pt.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(Pt.size===2){mv=100;_u2(e);pan=true;const m=mid();lx=m.x;ly=m.y;ld=m.d;return}if(Pt.size>2)return}
  _d2(e)};
 cv.onpointermove=e=>{if(Z.on)return _m2(e);
  if(mouseP){move(e.clientX-lx,e.clientY-ly);lx=e.clientX;ly=e.clientY;return}
  if(Pt.has(e.pointerId)){Pt.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pan&&Pt.size>=2){const m=mid();move(m.x-lx,m.y-ly);if(ld>0&&m.d>0)dist=cl(dist*ld/m.d,9,40);lx=m.x;ly=m.y;ld=m.d;return}}
  _m2(e)};
 const up=e=>{if(Z.on){Pt.clear();pan=mouseP=false;return _u2(e)}
  if(mouseP){mouseP=false;return}
  const was=pan;Pt.delete(e.pointerId);if(Pt.size<2)pan=false;if(was)return;_u2(e)};
 cv.onpointerup=up;cv.onpointercancel=up;
 const hn=document.querySelector('#hint');if(hn)hn.textContent='*** seret: putar · dua jari: geser & zoom · tap benda ***'}
})();