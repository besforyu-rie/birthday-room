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

/* ================= SISTEM ZOOM (kamera) ================= */
const Z={on:null,sv:null,ret:false,td:0,ty:0,tp:0,dn:null,mv:0,px:0,py:0,card:null,age:0};
const HUD=['#bar','#hd','#sw'].map(s=>document.querySelector(s)).filter(Boolean);
const bk=document.createElement('button');bk.className='btn alt';bk.textContent='kembali';bk.style.cssText='position:fixed;bottom:16px;left:0;right:0;margin:auto;width:max-content;z-index:12;display:none';document.body.appendChild(bk);
const hint=document.createElement('div');hint.className='px';hint.style.cssText='position:fixed;bottom:72px;left:8px;right:8px;text-align:center;font-size:9px;line-height:1.6;color:#fff;text-shadow:2px 2px 0 #1f3a5f;pointer-events:none;display:none;z-index:12';document.body.appendChild(hint);
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
function zoomBoard(){let hid=[];zin({tgt:board.position.clone().add(new V3(0,.3,0)),fit:[3.9,4.5],pit:.02,hint:'tap catatan untuk membaca · tap luar untuk kembali',ctl:()=>noteHits,
 enter(){hid=occl().filter(o=>o.visible);hid.forEach(o=>o.visible=false)},exit(){hid.forEach(o=>o.visible=true)}})}
if(board)act(board,zoomBoard);
function noteCard(m){const n=m.userData.n,pages=chunk(n.t||'',CFG.NOTE_PAGE||280);let pg=0,C;const bp=board.position;
 const nav=d=>{pg=cl(pg+d,0,pages.length-1);C.F.r()},keys=pages.length>1?[{l:'<',c:'#3b7dd8',fg:'#fff',fn:()=>nav(-1),x:-.9,y:-.98,w:.34,h:.24,pad:.14},{l:'>',c:'#f2b84b',fg:'#1f3a5f',fn:()=>nav(1),x:-.308,y:-.98,w:.34,h:.24,pad:.14}]:[];
 C=slip({w:2.3,h:2.3,thick:.05,tape:1,kin:1,swipe:nav,rot:((n.t||'').length%5-2)*.025,keys,pos:new V3(bp.x,bp.y,bp.z+1.0),from:m.position.clone(),
  front:(g,W,H)=>{g.fillStyle=n.color||'#f7e27a';g.fillRect(0,0,W,H);g.fillStyle='rgba(0,0,0,.07)';g.fillRect(0,0,W,46);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,H-70,W,70);
   g.strokeStyle='rgba(90,74,42,.18)';g.lineWidth=2;for(let y=96;y<H-60;y+=44){g.beginPath();g.moveTo(24,y);g.lineTo(W-24,y);g.stroke()}
   g.fillStyle='#4a3a1a';g.textBaseline='alphabetic';let px=46,L;for(;;){g.font=px+'px '+VT;L=wrap(g,pages[pg],W-60);if(L.length*px*.95<H-170||px<=22)break;px-=2}
   g.textAlign='left';L.forEach((l,i)=>g.fillText(l,30,92+i*px*.95));{let fs=34;const nm='- '+(n.from||'anon'),room=pages.length>1?230:W-60;g.font=fs+'px '+VT;while(fs>18&&g.measureText(nm).width>room){fs-=2;g.font=fs+'px '+VT}g.textAlign='right';g.fillText(nm,W-30,H-24)}
   if(pages.length>1){g.font='11px '+FN;g.textAlign='center';g.fillText((pg+1)+'/'+pages.length,120,H-26)}}});
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
 /* TV + kabinet */
 while(tg0.children.length)tg0.remove(tg0.children[0]);rbox(2.1,.14,.85,'#c98b52',.05,tg0,0,.9,0);rbox(1.9,.08,.65,'#a8743f',.03,tg0,0,.42,0);
 [[-.95,-.32],[.95,-.32],[-.95,.32],[.95,.32]].forEach(([x,z])=>cy(.05,.04,.85,'#5a3b22',x,.43,z,tg0));
 rbox(.5,.1,.32,'#f3f8ff',.04,tg0,-.5,.51,0);rbox(.35,.14,.3,'#e84a5f',.05,tg0,.45,.53,0);
 rbox(1.8,1.05,.1,'#10203d',.08,tg0,0,1.5,-.05);cy(.08,.12,.12,'#10203d',0,1.0,-.05,tg0);
 const scr=cvs(160,90,g=>{g.fillStyle='#143268';g.fillRect(0,0,160,90);['#fff','#f2c14e','#8fd0f0','#8fd18a','#f4a6c0','#e84a5f','#4f8fe8'].forEach((c,i)=>{g.fillStyle=c;g.fillRect(i*23,0,23,64)});g.fillStyle='#1f3a5f';g.fillRect(0,64,160,26);g.fillStyle='rgba(255,255,255,.08)';for(let y=0;y<90;y+=3)g.fillRect(0,y,160,1)}),sp=new THREE.Mesh(new THREE.PlaneGeometry(1.62,.9),new THREE.MeshBasicMaterial({map:scr.t}));sp.position.set(0,1.5,.01);tg0.add(sp);
 [-1.12,1.12].forEach(x=>rbox(.2,.62,.24,'#5a3b22',.06,tg0,x,1.3,0));
 /* akuarium */
 rbox(1.0,.9,.9,'#a8743f',.06,LG,3.9,.45,-2.6);bx(1.5,.1,.7,'#e8d8b0',3.9,.97,-2.6,LG);bx(1.65,.07,.85,'#10203d',3.9,2.03,-2.6,LG);[-.5,.2,.55].forEach((x,i)=>bx(.05,.4+i*.1,.05,'#4fa05a',3.9+x,1.2+i*.05,-2.6+(i-1)*.1,LG));
 /* tanaman, pouf, lampu, lukisan */
 cy(.25,.2,.35,'#c98b52',3.2,.18,.8,LG);for(let i=0;i<6;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),M(i%2?'#4fa05a':'#6dc07a'));l.scale.set(.5,1.5,.15);l.position.set(3.2+Math.cos(i)*.15,.75,.8+Math.sin(i)*.15);l.rotation.set(Math.sin(i)*.5,i,Math.cos(i)*.5);LG.add(l)}
 rbox(.58,.48,.58,'#f2c14e',.22,LG,1.6,.26,.3);
 cy(.28,.3,.06,'#2e527f',-4.4,.03,-1.2,LG);cy(.035,.035,2.7,'#cfd6e0',-4.4,1.4,-1.2,LG);const sh2=cy(.3,.45,.55,'#fff1cf',-4.4,2.8,-1.2,LG);sh2.material=new THREE.MeshLambertMaterial({color:'#fff1cf',emissive:'#ffd98a',emissiveIntensity:.5});
 const LP=new THREE.PointLight('#ffd9a0',.4,12);LP.position.set(40-4.4,2.6,-1.2);S.add(LP);stepF.push(()=>{LP.intensity=night?1.6:.35;sh2.material.emissiveIntensity=night?1:.4});
 [[-3.4,2.8,1.4,.9],[-2.1,2.8,.8,.8],[3.9,3.2,1.1,.8]].forEach(([x,y,w,h],i)=>{rbox(w+.14,h+.14,.07,'#5a3b22',.03,LG,x,y,-3.43);const a=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:(i===1?SN:SD).t}));a.position.set(x,y,-3.39);LG.add(a)})}

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
 /* tanaman besar */
 cy(.32,.25,.42,'#c98b52',-4.2,.21,-3,GR);cy(.3,.3,.04,'#4a3328',-4.2,.41,-3,GR);
 for(let i=0;i<9;i++){const l=new THREE.Mesh(new THREE.SphereGeometry(.26,8,6),M(i%2?'#4fa05a':'#6dc07a')),a=i*.7;l.scale.set(.55,1.5,.15);l.position.set(-4.2+Math.cos(a)*.22,.95+(i%3)*.25,-3+Math.sin(a)*.22);l.rotation.set(Math.sin(a)*.6,a,Math.cos(a)*.6);GR.add(l)}
 /* kursi santai */
 const ch=new THREE.Group();ch.position.set(4.35,0,.9);ch.rotation.y=-Math.PI/2;GR.add(ch);
 rbox(.95,.35,.9,'#a98bd6',.1,ch,0,.32,0);rbox(.95,.85,.22,'#a98bd6',.12,ch,0,.75,-.34);[-.42,.42].forEach(x=>rbox(.18,.55,.9,'#8d6fc0',.08,ch,x,.55,0));rbox(.66,.16,.62,'#c8b2ee',.07,ch,0,.58,.06);
 [[-.35,-.3],[.35,-.3],[-.35,.3],[.35,.3]].forEach(([x,z])=>cy(.04,.03,.16,'#5a3b22',x,.08,z,ch));
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

/* ================= TV LOUNGE: 3 channel (tap untuk ganti), tidak lagi membuka galeri ================= */
{const scr=tg0.children.find(o=>o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===1.62);
 if(scr){const tc=cvs(160,90,()=>{},1),g=tc.g;scr.material=new THREE.MeshBasicMaterial({map:tc.t});let ch=0,lt=0;const NM=['MUSIK','AKUARIUM','PERAPIAN'],P=(c,x,y,w,h)=>{g.fillStyle=c;g.fillRect(x|0,y|0,w||1,h||1)};
  stepF.push((dt,t)=>{if(!LG.visible||t-lt<.08)return;lt=t;g.textBaseline='top';g.textAlign='left';
   if(ch===0){P('#0b1130',0,0,160,90);P('#2a3a78',0,0,160,10);g.fillStyle='#f2c14e';g.font='7px '+FN;g.fillText('NOW PLAYING',6,22);g.fillStyle=on?'#8fd18a':'#6f89b0';g.font='9px '+FN;g.fillText(on?String(T[ti].n).slice(0,14):'radio mati',6,36);
    for(let i=0;i<20;i++){const h=on?6+Math.abs(Math.sin(t*5+i*1.1)*Math.sin(t*2.3+i))*34:3;P(i>15?'#f2c14e':i>9?'#8fd0f0':'#8fd18a',8+i*7,78-h,5,h)}}
   else if(ch===1){for(let i=0;i<9;i++)P(['#3b7dd8','#4a8ae4','#5b9bee','#6cacf5','#7dbcfa','#6cacf5','#5b9bee','#4a8ae4','#3b7dd8'][i],0,i*9,160,10);P('#e8d8b0',0,80,160,10);
    for(let i=0;i<7;i++){const x=(i*23)%150,h=10+(i%3)*6;P('#4fa05a',x,80-h-Math.sin(t*2+i)*2,3,h)}
    for(let i=0;i<5;i++){const x=((t*(14+i*5)+i*47)%190)-15,y=14+i*11+Math.sin(t*2+i)*3,c=['#f2c14e','#e84a5f','#fff','#f4a6c0','#8fd18a'][i];P(c,x,y,9,5);P(c,x-4,y+1,4,3);P('#10203d',x+7,y+1,1,1)}
    for(let i=0;i<8;i++)P('#cfe8ff',(i*31+t*3)%160,(90-(t*14+i*19)%90)%90,2,2)}
   else{P('#1a0f0a',0,0,160,90);P('#6b3a24',34,26,92,64);for(let y=26;y<90;y+=8)for(let x=34+((y/8)%2)*6;x<126;x+=12)P('#4a2616',x,y,11,1);P('#120805',52,40,56,50);P('#3a2412',44,22,72,6);
    for(let x=0;x<56;x+=2){const h=8+(Math.sin(t*9+x*.6)*.5+.5)*26*(1-Math.abs(x-28)/38);P('#e8532f',52+x,90-h,2,h);P('#f2a33f',52+x,90-h*.7,2,h*.7);P('#ffe27a',52+x,90-h*.4,2,h*.4)}P('#6b4429',58,86,44,4)}
   P('rgba(0,0,0,.6)',0,80,160,10);g.fillStyle='#f2c14e';g.font='7px '+FN;g.fillText('CH'+(ch+1)+' '+NM[ch],5,83);g.fillStyle='rgba(255,255,255,.06)';for(let y=0;y<90;y+=3)g.fillRect(0,y,160,1);tc.t.needsUpdate=true});
  tg0.userData.fn=()=>{const v=who();if(v){if(v.mode!=='sit'&&!watching(v)){const n=[...V.values()].filter(watching).length;v.mode=null;v.path=null;v.xfer=null;v.goal={x:1.2+[0,-1.2,1.2][n%3],z:-1.2,mode:'watch'}}v.watchT=25}
   ch=(ch+1)%3;lt=0;if(typeof SFX!=='undefined')SFX.click();say3(tg0,'CH'+(ch+1)+' · '+NM[ch].toLowerCase())}}}

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
 let hid=[];const openShelf=()=>{const sp=new V3();sh.getWorldPosition(sp);zin({tgt:new V3(sp.x,1.9,sp.z),fit:[2.7,3.9],yaw:Math.PI/2,pit:.05,hint:'tap buku untuk membaca · buku ungu = jurnal harian · buku emas = lencana',ctl:()=>defs.map(d=>d.m).filter(m=>m&&m.visible),
  enter(){hid=[...occl(),lp].filter(o=>o.visible);hid.forEach(o=>o.visible=false)},exit(){hid.forEach(o=>o.visible=true)}})};
 sh.userData.fn=openShelf}

/* ================= GESER LAYAR: 2 jari (HP) / shift+seret atau klik kanan (PC), cubit untuk zoom ================= */
{const Pt=new Map();let pan=false,lx=0,ly=0,ld=0,mouseP=false;
 const _d2=cv.onpointerdown,_m2=cv.onpointermove,_u2=cv.onpointerup,mid=()=>{const a=[...Pt.values()],p=a[0],q=a[1]||p;return{x:(p.x+q.x)/2,y:(p.y+q.y)/2,d:Math.hypot(p.x-q.x,p.y-q.y)}};
 const move=(dx,dy)=>{const k=.828*dist/innerHeight,s=Math.sin(yaw),c=Math.cos(yaw),f2=window.F2&&window.F2.on,cx=f2?window.F2.cx:[1,40,80][curRoom]||1,w=(f2||curRoom)?3:8;
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