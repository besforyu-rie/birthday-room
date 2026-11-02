/* ui3d.js — UI 3D: popup 2D diganti interaksi 3D langsung di dalam ruangan.
   Taruh sefolder dengan index.html, muat SETELAH room3d.js:
   <script src="room3d.js"></script>
   <script src="ui3d.js"></script>
   Isi: kado (kotak terbuka + kartu melayang), radio (tombol & layar 3D), kue, telepon (layar + gagang 3D),
   kotak kunci (keypad 3D), surat (amplop terbuka, kertas berhalaman), balon, foto dinding (polaroid).
   Cara kerja: tap benda -> kamera mendekat, benda "muncul" besar & bisa ditekan. Tap area kosong / ESC / tombol kembali = keluar. */
(()=>{
if(typeof THREE==='undefined'||typeof S==='undefined'||typeof hits==='undefined')return;
const cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const ease=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const shd=(h,a)=>{const n=parseInt(h.slice(1),16),f=v=>cl(v+a,0,255);return'#'+[(n>>16)&255,(n>>8)&255,n&255].map(v=>f(v).toString(16).padStart(2,'0')).join('')};
const PXF='"Press Start 2P",monospace',VTF='VT323,monospace',now=()=>performance.now()/1000;
const FR=(typeof document!=='undefined'&&document.fonts)?document.fonts.ready:Promise.resolve();
const V3=THREE.Vector3;

/* ---------- helper tekstur kanvas & mesh ---------- */
function tex(w,h,draw,pix){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d'),t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;t.magFilter=pix?THREE.NearestFilter:THREE.LinearFilter;
 const r=()=>{g.clearRect(0,0,w,h);draw(g,w,h);t.needsUpdate=true};r();FR.then(r);return{t,r,g,c,w,h}}
function plane(w,h,T,x,y,z,p){const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:T.t,transparent:true}));m.position.set(x,y,z);p.add(m);return m}
function wrapLines(g,text,maxW){const out=[];String(text).split('\n').forEach(par=>{if(!par.trim()){out.push('');return}let line='';par.split(/\s+/).forEach(w=>{const t=line?line+' '+w:w;if(line&&g.measureText(t).width>maxW){out.push(line);line=w}else line=t});out.push(line)});return out}
const ICO={
 play:(g,w,h)=>{g.beginPath();g.moveTo(w*.36,h*.24);g.lineTo(w*.7,h*.5);g.lineTo(w*.36,h*.76);g.fill()},
 pause:(g,w,h)=>{g.fillRect(w*.3,h*.25,w*.14,h*.5);g.fillRect(w*.56,h*.25,w*.14,h*.5)},
 next:(g,w,h)=>{[.2,.46].forEach(o=>{g.beginPath();g.moveTo(w*o,h*.28);g.lineTo(w*(o+.3),h*.5);g.lineTo(w*o,h*.72);g.fill()})},
 prev:(g,w,h)=>{[.5,.76].forEach(o=>{g.beginPath();g.moveTo(w*o,h*.28);g.lineTo(w*(o-.3),h*.5);g.lineTo(w*o,h*.72);g.fill()})},
 x:(g,w,h)=>{g.lineWidth=w*.13;g.lineCap='square';g.beginPath();g.moveTo(w*.3,h*.3);g.lineTo(w*.7,h*.7);g.moveTo(w*.7,h*.3);g.lineTo(w*.3,h*.7);g.stroke()},
 ok:(g,w,h)=>{g.lineWidth=w*.13;g.lineCap='square';g.beginPath();g.moveTo(w*.26,h*.52);g.lineTo(w*.44,h*.7);g.lineTo(w*.76,h*.3);g.stroke()}
};
const LC={};
function lab(k,fg,o){o=o||{};const w=o.w||64,h=o.h||64,key=k+'|'+fg+'|'+w;if(LC[key])return LC[key];
 return LC[key]=tex(w,h,g=>{g.fillStyle=g.strokeStyle=fg;if(ICO[k])ICO[k](g,w,h);else{g.font=(o.px||30)+'px '+PXF;g.textAlign='center';g.textBaseline='middle';g.fillText(k,w/2,h/2+2)}},true)}
/* tombol 3D: kotak + label, ditekan = masuk sedikit */
function key(p,w,h,col,x,y,z,k,fg,fn,o){o=o||{};const g=new THREE.Group(),d=o.d||.02;g.position.set(x,y,z);p.add(g);
 bx(w,h,d,col,0,0,d/2,g);const l=plane(w*.86,h*.86,lab(k,fg||'#1f3a5f',o.lab),0,0,d+.002,g);
 g.userData.fx=()=>{if(typeof SFX!=='undefined')SFX.click();g.position.z=z-.012;setTimeout(()=>{g.position.z=z},110);if(fn)fn(g)};g.userData.lbl=l;return g}

/* ---------- inti: fokus kamera + interaksi 3D ---------- */
const FX={cur:null,sv:null,td:0,ty:0,tp:0,ret:false,dn:null,mv:0};
const HUD=['#bar','#hd','#sw'].map(s=>document.querySelector(s)).filter(Boolean);
const back=document.createElement('button');back.className='btn alt';back.textContent='kembali';back.setAttribute('aria-label','kembali ke ruangan');
back.style.cssText='position:fixed;bottom:16px;left:0;right:0;margin:auto;width:max-content;z-index:12;display:none';document.body.appendChild(back);
const fit=(w,h)=>cl(Math.max(h/.828,w/(.828*cam.aspect))*1.12,2.5,30);
function focusOn(c){
 if(FX.cur)leave(true);
 if(!FX.sv)FX.sv={g:goalT.clone(),d:dist,y:yaw,p:pit};
 c.age=0;c.ctl=c.ctl||[];FX.cur=c;FX.ret=false;
 goalT.copy(c.tgt);FX.td=fit(c.fit[0],c.fit[1]);FX.ty=c.yaw||0;FX.tp=c.pit==null?.15:c.pit;
 HUD.forEach(e=>e.style.display='none');back.style.display='';if(typeof sayEl!=='undefined')sayEl.style.display='none';
 if(c.enter)c.enter();
}
function leave(sw){
 const c=FX.cur;if(!c)return;FX.cur=null;if(c.exit)c.exit();
 if(sw)return;
 HUD.forEach(e=>e.style.display='');back.style.display='none';
 const s=FX.sv;FX.sv=null;if(s){goalT.copy(s.g);FX.td=s.d;FX.ty=s.y;FX.tp=s.p;FX.ret=true}
}
back.onclick=()=>leave();
addEventListener('keydown',e=>{if(e.key==='Escape'&&FX.cur)leave()});
function tap(e){const c=FX.cur;if(!c)return;ray(e);const h=rc.intersectObjects(c.ctl,true)[0];let o=h&&h.object;while(o&&!(o.userData&&o.userData.fx))o=o.parent;if(o){o.userData.fx(o);return}leave()}
const _pd=cv.onpointerdown,_pm=cv.onpointermove,_pu=cv.onpointerup,_wh=cv.onwheel;
cv.onpointerdown=e=>{if(FX.cur){FX.dn={x:e.clientX,y:e.clientY};FX.mv=0;return}_pd(e)};
cv.onpointermove=e=>{if(FX.cur){if(FX.dn){FX.mv+=Math.abs(e.clientX-FX.dn.x)+Math.abs(e.clientY-FX.dn.y);FX.dn={x:e.clientX,y:e.clientY}}return}_pm(e)};
cv.onpointerup=e=>{if(FX.cur){const ok=FX.dn&&FX.mv<8;FX.dn=null;if(ok)tap(e);return}_pu(e)};
cv.onwheel=e=>{if(!FX.cur)_wh(e)};
const AMB=[];
function fxStep(dt){
 const t=now();AMB.forEach(f=>f(dt,t));
 if(FX.cur){FX.cur.age+=dt;if(FX.cur.update)FX.cur.update(dt,FX.cur.age,t)}
 if(FX.cur||FX.ret){const k=Math.min(1,dt*5);dist+=(FX.td-dist)*k;yaw+=(FX.ty-yaw)*k;pit+=(FX.tp-pit)*k;
  if(!FX.cur&&Math.abs(dist-FX.td)<.03&&Math.abs(yaw-FX.ty)<.01&&Math.abs(pit-FX.tp)<.01){dist=FX.td;yaw=FX.ty;pit=FX.tp;FX.ret=false}}
}
const _wf=winFx;winFx=function(dt){_wf(dt);fxStep(dt)};
const wpos=o=>o.getWorldPosition(new V3());

/* ---------- kartu 3D (teks melayang) ---------- */
const BOX=(o,ch)=>[(o.title?84:14)+34,ch-((o.from||o.paged)?64:36)];
function drawCard(c,cw,ch,C){
 const o=C.o,tint=o.tint||'#3b7dd8';c.fillStyle='#fffdf3';c.fillRect(0,0,cw,ch);
 let top=14;if(o.title){c.fillStyle=tint;c.fillRect(0,0,cw,72);c.fillStyle=shd(tint,-45);c.fillRect(0,68,cw,6);c.fillStyle='#fff';c.font='18px '+PXF;c.textAlign='center';c.textBaseline='middle';c.fillText(o.title,cw/2,38);top=86}
 c.strokeStyle='#9cc4f0';c.lineWidth=4;c.setLineDash([12,9]);c.strokeRect(14,top,cw-28,ch-top-14);c.setLineDash([]);
 const txt=o.pages?o.pages[C.pg]:(o.body||''),bx2=BOX(o,ch),maxW=cw-76;let px=o.px||36,lines,lh;
 for(;;){c.font=px+'px '+VTF;lines=wrapLines(c,txt,maxW);lh=Math.round(px*1.05);if(lines.length*lh<=bx2[1]-bx2[0]||px<=20)break;px-=2}
 c.fillStyle='#1f3a5f';c.textAlign=o.center?'center':'left';c.textBaseline='alphabetic';
 let y=bx2[0]+(o.center?Math.max(0,(bx2[1]-bx2[0]-lines.length*lh)/2):0)+lh*.8;lines.forEach(l=>{c.fillText(l,o.center?cw/2:38,y);y+=lh});
 if(o.from){c.globalAlpha=.7;c.font='30px '+VTF;c.textAlign='right';c.fillText(o.from,cw-34,ch-24);c.globalAlpha=1}
 if(o.pages){c.font='12px '+PXF;c.textAlign='center';c.fillStyle=tint;c.fillText((C.pg+1)+' / '+o.pages.length,cw/2,ch-24)}
}
function makeCard(o){
 const cw=512,ch=Math.round(512*o.h/o.w),g=new THREE.Group(),C={g,o,pg:0,ctl:[]};
 bx(o.w+.07,o.h+.07,.04,shd(o.tint||'#3b7dd8',-30),0,0,-.025,g);
 C.tx=tex(cw,ch,c=>{if(o.draw)o.draw(c,cw,ch,C);else drawCard(c,cw,ch,C)});
 C.pl=plane(o.w,o.h,C.tx,0,0,.005,g);C.pl.userData.fx=()=>{if(o.tapClose)leave()};C.ctl.push(C.pl);
 C.ctl.push(key(g,.2,.2,'#e84a5f',o.w/2-.02,o.h/2+.02,.0,'x','#fff',()=>leave(),{d:.03}));
 if(o.pages&&o.pages.length>1){const pg=d=>{C.pg=cl(C.pg+d,0,o.pages.length-1);C.tx.r()};
  C.ctl.push(key(g,.26,.17,'#3b7dd8',-o.w*.2,-o.h/2-.15,.0,'prev','#fff',()=>pg(-1),{d:.03}),key(g,.26,.17,'#f2b84b',o.w*.2,-o.h/2-.15,.0,'next','#1f3a5f',()=>pg(1),{d:.03}))}
 return C}
function paginate(text,o,ch){const c=document.createElement('canvas').getContext('2d'),px=o.px||30,lh=Math.round(px*1.05),b=BOX(o,ch);c.font=px+'px '+VTF;
 const lines=wrapLines(c,text,512-76),per=Math.max(1,Math.floor((b[1]-b[0])/lh)),out=[];for(let i=0;i<lines.length;i+=per)out.push(lines.slice(i,i+per).join('\n'));return out.length?out:['']}
/* buka kartu melayang di posisi s.pos; s.keys = tombol 3D tambahan di bawah kartu */
function openCard(s){
 const C=makeCard(s.card),extra=[],k0=s.keys||[];C.g.position.copy(s.pos);
 k0.forEach((k,i)=>extra.push(key(C.g,.95,.2,k.col||'#f2b84b',(i-(k0.length-1)/2)*1.05,-s.card.h/2-.2,0,k.label,'#1f3a5f',()=>k.fn(),{d:.03,lab:{w:320,h:64,px:15}})));
 focusOn({tgt:s.tgt,fit:s.fit,yaw:0,pit:s.pit,ctl:C.ctl.concat(extra),
  enter(){C.g.scale.setScalar(.01);C.g.visible=false;S.add(C.g);if(s.enter)s.enter()},
  update(dt,age,t){const u=cl((age-(s.delay||0))/.45,0,1);C.g.visible=u>0;C.g.scale.setScalar(.2+.8*ease(u));
   const y0=s.rise!=null?s.rise+(s.pos.y-s.rise)*ease(u):s.pos.y;C.g.position.y=y0+Math.sin(age*1.6)*.02;C.g.rotation.y=Math.sin(age*.9)*.05;if(s.update)s.update(dt,age,t)},
  exit(){S.remove(C.g);if(s.exit)s.exit()}});
 return C}

/* ---------- KADO ---------- */
const gifts=hits.filter(o=>o.isGroup&&o.position.y===0&&Math.abs(o.position.z-1.7)<.001&&o.userData.fn).sort((a,b)=>a.position.x-b.position.x);
gifts.forEach((o,i)=>{const g=CFG.gifts[i];if(!g)return;
 o.children.slice().forEach(c=>o.remove(c));
 bx(.56,.4,.56,g.c,0,.2,0,o);bx(.58,.41,.11,g.r,0,.205,0,o);bx(.11,.41,.58,g.r,0,.205,0,o);
 const lid=new THREE.Group();lid.position.set(0,.4,0);o.add(lid);
 bx(.62,.12,.62,shd(g.c,-18),0,.06,0,lid);bx(.64,.125,.11,g.r,0,.062,0,lid);bx(.11,.125,.64,g.r,0,.062,0,lid);
 const b1=bx(.2,.06,.08,g.r,-.1,.15,0,lid);b1.rotation.z=.5;const b2=bx(.2,.06,.08,g.r,.1,.15,0,lid);b2.rotation.z=-.5;bx(.08,.08,.09,shd(g.r,-40),0,.14,0,lid);
 o.userData.fn=()=>{
  const p=wpos(o),first=!(ls('bday-gifts')||'').includes('|'+i),sp=[];if(first){ls('bday-gifts',(ls('bday-gifts')||'')+'|'+i);confetti()}
  openCard({pos:new V3(p.x,p.y+1.85,p.z+.05),tgt:new V3(p.x,p.y+1.2,p.z),fit:[2.2,3.1],pit:.12,delay:.35,
   card:{w:1.9,h:1.3,title:'kado '+(i+1),tint:g.c,body:g.t,tapClose:true},
   enter(){if(typeof SFX!=='undefined')SFX.pop();for(let k=0;k<12;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(.05,.05,.05),new THREE.MeshBasicMaterial({color:['#f2c14e','#ffffff','#f4a6c0','#8fd0f0'][k%4],transparent:true}));
     m.position.set(p.x,p.y+.45,p.z);m.userData.v=new V3((Math.random()-.5)*1.8,1.4+Math.random()*1.4,(Math.random()-.5)*1.8);S.add(m);sp.push(m)}},
   update(dt,age){const u=ease(cl(age/.5,0,1));lid.position.set(.55*u,.4+.45*u,0);lid.rotation.z=-.9*u;
    sp.forEach(m=>{const v=m.userData.v;v.y-=3*dt;m.position.addScaledVector(v,dt);m.material.opacity=cl(1.3-age*.8,0,1);m.rotation.x+=dt*5})},
   exit(){lid.position.set(0,.4,0);lid.rotation.set(0,0,0);sp.forEach(m=>S.remove(m))}});
 }});

/* ---------- RADIO ---------- */
const VOLS=[.15,.35,.6,.9],volIdx=()=>Math.max(0,VOLS.findIndex(v=>v>=au.volume-.01));
function drawRadio(c,w,h){const t=now();c.fillStyle='#0b1a30';c.fillRect(0,0,w,h);
 c.fillStyle=on?'#8fd18a':'#5f7a9c';c.font='14px '+PXF;c.textAlign='left';c.textBaseline='top';c.fillText(String((T[ti]&&T[ti].n)||'-').slice(0,11),8,8);
 c.font='10px '+PXF;c.fillStyle='#8fd0f0';c.fillText(on?'PLAY':'PAUSE',8,34);c.textAlign='right';c.fillText((ti+1)+'/'+T.length,w-8,34);
 for(let i=0;i<12;i++){const bh=on?6+Math.abs(Math.sin(t*5+i*1.3)*Math.sin(t*2.1+i))*22:3;c.fillStyle=on?(i>8?'#f2c14e':'#8fd18a'):'#2a3a5c';c.fillRect(8+i*10,h-10-bh,7,bh)}
 const d=au.duration;if(on&&d>0){c.fillStyle='#f2c14e';c.fillRect(8,h-5,(w-16)*(au.currentTime/d),3)}}
function buildRadio(){
 const g=new THREE.Group(),R={g,pk:[],ctl:[],lt:0,k:'',lo:null},BL='#8fd0f0',BD='#4f7fb8',DK='#10203d';
 bx(.56,.34,.26,BL,0,0,0,g);bx(.56,.035,.27,'#6bb3dc',0,.1875,0,g);bx(.57,.03,.27,BD,0,-.185,0,g);
 [-.22,.22].forEach(x=>bx(.03,.09,.04,BD,x,.235,0,g));bx(.47,.03,.045,BD,0,.285,0,g);
 const an=cy(.006,.006,.4,'#cfd6e0',.278,.374,-.06,g);an.rotation.z=-.4;{const b=new THREE.Mesh(new THREE.SphereGeometry(.016,8,6),M('#e84a5f'));b.position.set(.356,.558,-.06);g.add(b)}
 bx(.5,.28,.02,DK,0,-.005,.135,g);
 const spk=new THREE.Group();spk.position.set(-.14,-.005,.145);g.add(spk);R.spk=spk;
 {const c=cy(.088,.05,.025,'#2e527f',0,0,.012,spk);c.rotation.x=Math.PI/2;spk.add(new THREE.Mesh(new THREE.TorusGeometry(.095,.008,6,24),M('#cfd6e0')));const dm=new THREE.Mesh(new THREE.SphereGeometry(.03,10,8),M('#10203d'));dm.position.z=.03;dm.scale.z=.5;spk.add(dm)}
 bx(.27,.105,.012,'#1f3a5f',.13,.075,.145,g);R.disp=tex(200,80,drawRadio,true);plane(.25,.085,R.disp,.13,.075,.1515,g);
 for(let i=0;i<4;i++){const k=key(g,.05,.034,'#f3f8ff',.035+i*.065,0,.145,String(i+1),'#1f3a5f',()=>{ld(i);pl()},{d:.016});R.pk.push(k);R.ctl.push(k)}
 R.ctl.push(key(g,.055,.04,'#3b7dd8',.035,-.06,.145,'prev','#ffffff',()=>{ld(ti-1);pl()},{d:.018}));
 R.pp=key(g,.055,.04,'#f2b84b',.1,-.06,.145,'play','#1f3a5f',()=>{if(on)pa();else pl()},{d:.018});R.ctl.push(R.pp);
 R.ctl.push(key(g,.055,.04,'#3b7dd8',.165,-.06,.145,'next','#ffffff',()=>{ld(ti+1);pl()},{d:.018}));
 const kn=new THREE.Group();kn.position.set(.225,-.06,.15);g.add(kn);R.kn=kn;{const c=cy(.028,.03,.03,'#e84a5f',0,0,0,kn);c.rotation.x=Math.PI/2;bx(.006,.02,.006,'#ffffff',0,.016,.016,kn)}
 kn.userData.fx=()=>{if(typeof SFX!=='undefined')SFX.click();au.volume=VOLS[(volIdx()+1)%VOLS.length]};R.ctl.push(kn);
 R.upd=t=>{const k=on+'|'+ti;if(R.k!==k||(on&&t-R.lt>.07)||t-R.lt>1){R.lt=t;R.k=k;R.disp.r()}
  R.spk.scale.z=on?1+.5*Math.abs(Math.sin(t*9)*Math.sin(t*2.3)):1;
  R.pk.forEach((k,i)=>k.children[0].material.color.set(i===ti?'#f2c14e':'#f3f8ff'));
  if(R.lo!==on){R.lo=on;R.pp.userData.lbl.material.map=lab(on?'pause':'play','#1f3a5f').t;R.pp.userData.lbl.material.needsUpdate=true}
  R.kn.rotation.z=-(-1.1+volIdx()/3*2.2)};
 return R}
const radioReal=buildRadio();while(rd.children.length)rd.remove(rd.children[0]);rd.add(radioReal.g);AMB.push((dt,t)=>{if(!FX.cur||FX.cur.id!=='radio')radioReal.upd(t)});
const noteT=tex(64,64,c=>{c.fillStyle='#fff';c.font='48px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('\u266A',32,34)});
let radioHero=null;
rd.userData.fn=()=>{
 const base=wpos(rd),H=radioHero||(radioHero=buildRadio()),S0=3,nt=[];let nx=0;
 focusOn({id:'radio',tgt:new V3(base.x,base.y+.35,base.z+.25),fit:[2.2,2.2],yaw:0,pit:.12,ctl:H.ctl,
  enter(){H.g.position.set(base.x,base.y+.2,base.z+.25);H.g.scale.setScalar(.01);S.add(H.g);rd.visible=false;if(typeof SFX!=='undefined')SFX.pop()},
  update(dt,age,t){H.g.scale.setScalar(S0*(.3+.7*ease(cl(age/.4,0,1))));H.upd(t);
   nx-=dt;if(on&&nx<=0){nx=.45;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:noteT.t,transparent:true,color:['#f4a6c0','#f2c14e','#8fd0f0','#a98bd6'][nt.length%4]}));s.scale.set(.32,.32,1);
    s.position.set(base.x+(Math.random()-.5)*1.6,base.y+1.5,base.z+.5);s.userData.life=1.8;S.add(s);nt.push(s)}
   for(let i=nt.length-1;i>=0;i--){const s=nt[i];s.userData.life-=dt;s.position.y+=.55*dt;s.position.x+=Math.sin(t*3+i)*.003;s.material.opacity=cl(s.userData.life,0,1);if(s.userData.life<=0){S.remove(s);nt.splice(i,1)}}},
  exit(){S.remove(H.g);rd.visible=true;nt.forEach(s=>S.remove(s));nt.length=0}});
};

/* ---------- KUE ---------- */
cake.userData.fn=()=>{
 if(!lit){lit=true;flames.forEach(f=>f.visible=true);return}
 lit=false;flames.forEach(f=>f.visible=false);confetti();const p=wpos(cake);
 openCard({pos:new V3(p.x,p.y+2.25,p.z+.5),tgt:new V3(p.x,p.y+1.55,p.z+.3),fit:[2.6,3.7],pit:.14,delay:.5,
  card:{w:2.3,h:1.5,title:'make a wish!',tint:'#a98bd6',body:CFG.cakeMessage,from:CFG.cakeFrom},
  keys:[{label:'nyalakan lagi',fn:()=>{lit=true;flames.forEach(f=>f.visible=true);leave()}}]});
};

/* ---------- BALON ---------- */
balloons.forEach((b,i)=>{const d=CFG.balloons[i];if(!d)return;
 b.userData.fn=()=>{const p=wpos(b),bs=[];
  openCard({pos:p.clone(),tgt:new V3(p.x,p.y-.2,p.z),fit:[2.4,2.0],pit:.05,delay:.25,
   card:{w:2.1,h:1.3,title:'a message for you',tint:d.c,body:d.t,tapClose:true},
   enter(){b.visible=false;confetti();if(typeof SFX!=='undefined')SFX.pop();for(let k=0;k<14;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.06),new THREE.MeshBasicMaterial({color:d.c,transparent:true}));
     m.position.set(p.x,p.y,p.z);m.userData.v=new V3((Math.random()-.5)*2.4,(Math.random()-.5)*2.4,(Math.random()-.5)*2.4);S.add(m);bs.push(m)}},
   update(dt,age){bs.forEach(m=>{m.position.addScaledVector(m.userData.v,dt);m.material.opacity=cl(1-age*1.4,0,1)})},
   exit(){b.visible=true;bs.forEach(m=>S.remove(m))}});
 }});

/* ---------- FOTO DINDING (polaroid) ---------- */
const bxp=(w,h)=>o=>o.geometry&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters&&o.geometry.parameters.width===w&&o.geometry.parameters.height===h;
const byx=(a,b)=>a.position.x-b.position.x,pf=hits.filter(bxp(1.05,1.3)).sort(byx),pm=hits.filter(bxp(.85,1.1)).sort(byx);
CFG.photos.slice(0,3).forEach((ph0,i)=>{if(!pf[i])return;
 const fn=()=>{const p=wpos(pf[i]),img=new Image();img.src=ph0.src;let C=null;
  C=openCard({pos:new V3(p.x,p.y-.2,p.z+1.7),tgt:new V3(p.x,p.y-.2,p.z+1.7),fit:[2.1,2.6],pit:.04,delay:.1,
   card:{w:1.8,h:2.2,tint:'#4f7fb8',tapClose:true,draw:(c,cw,ch)=>{c.fillStyle='#fffdf3';c.fillRect(0,0,cw,ch);const m=34,iw=cw-m*2;c.fillStyle='#cfe0f6';c.fillRect(m,m,iw,iw);
     if(img.complete&&img.naturalWidth){const s=Math.max(iw/img.naturalWidth,iw/img.naturalHeight),sw=iw/s,sh=iw/s;c.drawImage(img,(img.naturalWidth-sw)/2,(img.naturalHeight-sh)/2,sw,sh,m,m,iw,iw)}
     c.strokeStyle='#1f3a5f';c.lineWidth=4;c.strokeRect(m,m,iw,iw);c.fillStyle='#1f3a5f';c.textAlign='center';c.textBaseline='alphabetic';
     let px=40,ls2;for(;;){c.font=px+'px '+VTF;ls2=wrapLines(c,ph0.cap||'',iw);if(ls2.length*px<=ch-m-iw-m-24||px<=22)break;px-=2}let y=m+iw+44;ls2.forEach(l=>{c.fillText(l,cw/2,y);y+=px})}}});
  img.onload=()=>{if(C)C.tx.r()}};
 pf[i].userData.fn=fn;if(pm[i])pm[i].userData.fn=fn;
});

/* ---------- TELEPON ---------- */
/* ---------- SUARA DERING TELEPON (kring) ---------- */
const RING=(()=>{let a=null,ac=null,os=[];
 const synth=()=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();const T=ac.currentTime;
  [0,.5].forEach(b=>{const o=ac.createOscillator(),g=ac.createGain();o.type='square';
   for(let k=0;k<14;k++)o.frequency.setValueAtTime(k%2?1500:1100,T+b+k*.028);
   g.gain.setValueAtTime(.0001,T+b);g.gain.exponentialRampToValueAtTime(.05,T+b+.01);g.gain.setValueAtTime(.05,T+b+.38);g.gain.exponentialRampToValueAtTime(.0001,T+b+.42);
   o.connect(g);g.connect(ac.destination);o.start(T+b);o.stop(T+b+.43);os.push(o)})}catch(e){}};
 return{start(){this.stop();if(typeof SFX!=='undefined'&&!SFX.on)return;
   if(typeof CFG!=='undefined'&&CFG.ring){let fb=false;const f=()=>{if(!fb){fb=true;synth()}};a=new Audio(CFG.ring);a.onerror=f;a.play().catch(f)}else synth()},
  stop(){if(a){a.pause();a=null}os.forEach(o=>{try{o.stop()}catch(e){}});os=[]}}})();

const PLUPP=['..bbbbbb..','.bbbbbbbb.','bbkbbbbkbb','bbbbyybbbb','.bWWWWWWb.','.bWWWWWWb.','..bWWWWb..'],PAL2={b:'#4f8fe8',k:'#1f3a5f',y:'#f2c14e',W:'#ffffff'};
function drawPhone(c,w,h,P){const t=now(),V=CFG.voice,N=V.length;c.fillStyle='#0f1d3d';c.fillRect(0,0,w,h);
 c.fillStyle='#f2c14e';c.font='9px '+PXF;c.textAlign='left';c.textBaseline='top';c.fillText('PLUP-NET',10,10);c.textAlign='right';c.fillText(new Date().toTimeString().slice(0,5),w-10,10);
 PLUPP.forEach((r,y)=>[...r].forEach((ch,x)=>{if(PAL2[ch]){c.fillStyle=PAL2[ch];c.fillRect(14+x*6,40+y*6,6,6)}}));
 c.fillStyle='#fff';c.font='32px '+VTF;c.textAlign='left';c.textBaseline='alphabetic';c.fillText('plup',90,66);c.fillStyle='#8fd0f0';c.font='22px '+VTF;c.fillText('pesan '+(P.i+1)+' / '+N,90,90);
 const on2=P.st==='play';for(let k=0;k<22;k++){const bh=on2?6+Math.abs(Math.sin(t*7+k*.9))*30:4;c.fillStyle=on2?'#8fd18a':'#2a3a5c';c.fillRect(12+k*15.5,138-bh,10,bh)}
 const txt=V[P.i]||'';let s=P.st==='idle'?'tekan > untuk mendengar pesan.':P.st==='ring'?'memanggil...':txt.slice(0,P.st==='done'?txt.length:P.n);
 c.fillStyle=P.st==='idle'?'#6f89b0':'#fff';c.font='25px '+VTF;let y=170;wrapLines(c,s,w-28).slice(-5).forEach(l=>{c.fillText(l,14,y);y+=27})}
function buildPhone(){
 const g=new THREE.Group(),P={g,ctl:[],st:'idle',i:0,n:0,acc:0,rt:0,lift:0,lt:0,dirty:true},RD='#e84a5f',DR='#b0293f';
 bx(.5,.14,.42,RD,0,-.055,0,g);bx(.42,.1,.32,RD,0,.065,.02,g);cy(.11,.11,.02,'#f3f8ff',0,.125,.05,g);cy(.04,.04,.03,'#1f3a5f',0,.135,.05,g);
 for(let i=0;i<9;i++){const a=-2.4+i*.55;bx(.03,.014,.03,'#1f3a5f',Math.cos(a)*.08,.14,.05+Math.sin(a)*.08,g)}
 bx(.05,.08,.05,DR,-.2,.16,-.1,g);bx(.05,.08,.05,DR,.2,.16,-.1,g);
 const hs=new THREE.Group();hs.position.set(0,.22,-.1);g.add(hs);P.hs=hs;bx(.5,.06,.1,DR,0,0,0,hs);cy(.07,.07,.1,DR,-.26,-.03,0,hs);cy(.07,.07,.1,DR,.26,-.03,0,hs);
 const sc=new THREE.Group();sc.position.set(0,.66,-.02);g.add(sc);bx(.74,.58,.03,'#4f7fb8',0,0,-.02,sc);bx(.7,.54,.04,'#10203d',0,0,0,sc);
 P.sc=tex(360,300,c=>drawPhone(c,360,300,P),true);plane(.66,.5,P.sc,0,0,.022,sc);
 const N=()=>CFG.voice.length,sv=()=>ls('bday-vm',String(P.i+1)),go=d=>{P.i=(P.i+d+N())%N();P.st='idle';RING.stop();P.dirty=true;sv()};
 P.ctl.push(key(g,.1,.07,'#3b7dd8',-.13,-.055,.21,'prev','#ffffff',()=>go(-1),{d:.02}));
 P.ctl.push(key(g,.1,.07,'#f2b84b',0,-.055,.21,'play','#1f3a5f',()=>{if(P.st==='ring'||P.st==='play'){P.st='idle';RING.stop()}else{P.st='ring';P.rt=1.1;RING.start()}P.dirty=true},{d:.02}));
 P.ctl.push(key(g,.1,.07,'#3b7dd8',.13,-.055,.21,'next','#ffffff',()=>go(1),{d:.02}));
 P.open=()=>{P.i=(+ls('bday-vm')||0)%N();P.st='idle';P.dirty=true;sv()};
 P.upd=(dt,t)=>{
  if(P.st==='ring'){P.rt-=dt;g.rotation.z=Math.sin(t*50)*.03;if(P.rt<=0){P.st='play';P.n=0;P.acc=0;g.rotation.z=0;RING.stop()}}else g.rotation.z*=.8;
  if(P.st==='play'){const L=(CFG.voice[P.i]||'').length||1,step=Math.max(.018,Math.min(.045,2.6/L));P.acc+=dt;while(P.acc>=step&&P.n<L){P.acc-=step;P.n++}if(P.n>=L)P.st='done'}
  const want=(P.st==='play'||P.st==='done')?.2:0;P.lift+=(want-P.lift)*Math.min(1,dt*8);hs.position.y=.22+P.lift;hs.rotation.z=P.lift*.9;
  if(P.dirty||(P.st!=='idle'&&t-P.lt>.05)){P.lt=t;P.dirty=false;P.sc.r()}};
 return P}
let phoneHero=null;
ph.userData.fn=()=>{
 const base=wpos(ph),H=phoneHero||(phoneHero=buildPhone()),S0=2.6;H.open();
 focusOn({id:'phone',tgt:new V3(base.x,base.y+1.05,base.z+.2),fit:[2.1,3.1],yaw:0,pit:.1,ctl:H.ctl,
  enter(){H.g.position.set(base.x,base.y+.1,base.z+.2);H.g.scale.setScalar(.01);S.add(H.g);ph.visible=false;if(typeof SFX!=='undefined')SFX.pop()},
  update(dt,age,t){H.g.scale.setScalar(S0*(.3+.7*ease(cl(age/.4,0,1))));H.upd(dt,t)},
  exit(){S.remove(H.g);ph.visible=true;H.st='idle';H.g.rotation.z=0;RING.stop()}});
};

/* ---------- KOTAK KUNCI ---------- */
function drawLock(c,w,h,L){c.fillStyle='#0b1a30';c.fillRect(0,0,w,h);c.textBaseline='alphabetic';
 if(L.st==='open'){c.fillStyle='#8fd18a';c.font='22px '+PXF;c.textAlign='center';c.fillText('TERBUKA',w/2,52)}
 else if(L.st==='bad'){c.fillStyle=Math.floor(now()*8)%2?'#e84a5f':'#7a2434';c.font='22px '+PXF;c.textAlign='center';c.fillText('SALAH',w/2,52)}
 else{c.fillStyle='#8fd0f0';c.font='22px '+VTF;c.textAlign='center';c.fillText(CFG.lock.hint||'',w/2,24);c.font='24px '+PXF;c.fillStyle='#8fd18a';for(let k=0;k<4;k++)c.fillText(L.buf[k]||'_',w/2-66+k*44,64)}}
function buildLock(){
 const g=new THREE.Group(),L={g,ctl:[],buf:'',st:'idle',k:''};
 bx(.5,.58,.3,'#a98bd6',0,0,0,g);bx(.54,.04,.32,'#8d6fc0',0,.31,0,g);bx(.54,.04,.32,'#8d6fc0',0,-.31,0,g);L.plate=bx(.44,.52,.02,'#6a4fa3',0,0,.155,g);
 bx(.38,.11,.012,'#10203d',0,.2,.17,g);L.disp=tex(240,80,(c,w,h)=>drawLock(c,w,h,L),true);plane(.36,.09,L.disp,0,.2,.1775,g);
 const chk=()=>{if(L.buf===CFG.lock.code){L.st='open';if(L.onOpen)L.onOpen()}else if(L.buf.length){L.st='bad';setTimeout(()=>{if(L.st==='bad'){L.st='idle';L.buf=''}},900)}};
 L.press=d=>{if(L.st!=='idle')return;if(d==='C'){L.buf='';return}if(d==='OK'){chk();return}if(L.buf.length<4){L.buf+=d;if(L.buf.length===4)setTimeout(chk,250)}};
 [['1','2','3'],['4','5','6'],['7','8','9'],['C','0','OK']].forEach((row,r)=>row.forEach((k,c)=>{
  const col=k==='C'?'#e84a5f':k==='OK'?'#8fd18a':'#f3f8ff',fg=k==='C'?'#ffffff':'#1f3a5f';
  L.ctl.push(key(g,.1,.07,col,(c-1)*.125,.07-r*.085,.165,k==='OK'?'ok':k,fg,()=>L.press(k),{d:.018,lab:{px:28}}))}));
 L.upd=t=>{const k=L.st+'|'+L.buf+(L.st==='bad'?Math.floor(t*8)%2:'');if(k!==L.k){L.k=k;L.disp.r()}
  g.position.x=L.bx+(L.st==='bad'?Math.sin(t*60)*.01:0);L.plate.material.color.set(L.st==='open'?'#4fa05a':'#6a4fa3')};
 return L}
const lockReal=buildLock();while(lk.children.length)lk.remove(lk.children[0]);lockReal.g.scale.setScalar(.6);lockReal.g.position.y=.03;lk.add(lockReal.g);
let lockHero=null;
lk.userData.fn=()=>{
 const base=wpos(lk),L=lockHero||(lockHero=buildLock()),S0=2.4;let C=null;L.buf='';L.st='idle';L.k='';
 const kh=e=>{if(/^[0-9]$/.test(e.key))L.press(e.key);else if(e.key==='Backspace'&&L.st==='idle')L.buf=L.buf.slice(0,-1);else if(e.key==='Enter')L.press('OK')};
 const cfg={id:'lock',tgt:new V3(base.x,base.y+1.0,base.z+.2),fit:[2.2,3.7],yaw:0,pit:.1,ctl:L.ctl.slice(),
  enter(){L.bx=base.x;L.g.position.set(base.x,base.y+.55,base.z+.25);L.g.scale.setScalar(.01);S.add(L.g);lk.visible=false;addEventListener('keydown',kh);if(typeof SFX!=='undefined')SFX.pop();
   L.onOpen=()=>{if(typeof confetti==='function')confetti();C=makeCard({w:1.9,h:1.15,title:'pesan untukmu',tint:'#a98bd6',body:CFG.lock.msg});C.g.position.set(base.x,base.y+2.5,base.z+.25);S.add(C.g);C.g.scale.setScalar(.01);cfg.t0=cfg.age;cfg.ctl.push(...C.ctl)}},
  update(dt,age,t){L.g.scale.setScalar(S0*(.3+.7*ease(cl(age/.4,0,1))));L.upd(t);
   if(C){const u=cl((age-cfg.t0)/.45,0,1);C.g.scale.setScalar(.2+.8*ease(u));C.g.position.y=base.y+2.5+Math.sin(age*1.6)*.02}},
  exit(){removeEventListener('keydown',kh);S.remove(L.g);if(C)S.remove(C.g);C=null;lk.visible=true;L.onOpen=null;L.st='idle';L.buf=''}};
 focusOn(cfg);
};

/* ---------- SURAT ---------- */
function buildEnv(){
 const g=new THREE.Group(),E={g};bx(.55,.04,.38,'#fffdf3',0,0,0,g);bx(.5,.012,.34,'#f3e8c8',0,.026,0,g);
 const fl=new THREE.Group();fl.position.set(0,.03,-.19);g.add(fl);bx(.55,.012,.26,'#efe0b4',0,0,.13,fl);bx(.08,.025,.08,'#e84a5f',0,.012,.24,fl);E.fl=fl;return E}
const envReal=buildEnv();while(env.children.length)env.remove(env.children[0]);env.add(envReal.g);
let envHero=null;
env.userData.fn=()=>{
 const p=wpos(env),H=envHero||(envHero=buildEnv()),S0=2.4,o={w:1.9,h:2.6,title:EXTRA.letter.title,tint:'#e84a5f',paged:true,px:30},ch=Math.round(512*o.h/o.w);
 o.pages=paginate(EXTRA.letter.body,o,ch);
 openCard({pos:new V3(p.x,p.y+2.3,p.z+.1),rise:p.y+.4,tgt:new V3(p.x,p.y+1.7,p.z),fit:[2.3,3.9],pit:.1,delay:.45,card:o,
  enter(){H.g.position.set(p.x,p.y+.05,p.z+.1);H.g.scale.setScalar(.01);H.fl.rotation.x=0;S.add(H.g);env.visible=false;if(typeof SFX!=='undefined')SFX.pop()},
  update(dt,age){H.g.scale.setScalar(S0*(.3+.7*ease(cl(age/.35,0,1))));H.fl.rotation.x=-ease(cl((age-.1)/.4,0,1))*Math.PI*.92},
  exit(){S.remove(H.g);env.visible=true}});
};
})();