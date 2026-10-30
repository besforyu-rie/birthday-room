/* visitors.js — taruh sefolder dengan index.html, tambahkan SETELAH extras.js:
   <script src="visitors.js"></script> */
(()=>{
const MAX=10,LIFE=10*60*1000;
const HC=['#2b2630','#6b4429','#e0b050','#e84a5f','#f4a6c0','#4f8fe8','#f2f5fc','#8a3fc0'];
const SC=['#e84a5f','#f2c14e','#8fd18a','#4f8fe8','#a98bd6','#f4a6c0','#ffffff','#2b2630'];
const SK=['#fbe0c8','#f0c8a0','#d9a577','#a9744a','#6e4a30'];
const HS=['pendek','poni','panjang','kuncir','cepol','keriting'];
const AH=['tanpa','topi','pita','mahkota','kuping kucing'];
const GN=['cowok','cewek','netral'];
/* ===== EDIT UCAPAN DI SINI (muncul acak saat avatar pengunjung di-klik) ===== */
const GREET=[
 'Happy birthday, Aqsa!','Wishing you the best year ever!','May all your wishes come true!','Stay happy and healthy, Aqsa!','Today is your day. Shine bright!','Hope your 26th is full of good things!',
 'アクサ、お誕生日おめでとう！','素敵な一年になりますように！','ハッピーバースデー！','いつも笑顔でいてね！','願いごとが全部叶いますように！',
 'Selamat ulang tahun, Aqsa!','Semoga sehat dan bahagia selalu!','Panjang umur ya!','Semoga semua harapanmu terwujud!','Makin dewasa, makin bahagia ya!','Jangan lupa traktir kuenya~',
 '아크사, 생일 축하해!','행복한 한 해 되길 바라!','생일 축하합니다!','항상 건강하고 행복해!','소원이 다 이루어지길!'
];
/* ================================================================= */
const store=(k,v)=>{try{return v===undefined?localStorage.getItem(k):localStorage.setItem(k,v)}catch(e){}};
const did=(()=>{let d=store('bday-did');if(!d){d=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Math.random()).slice(2)+Date.now();store('bday-did',d)}return String(d).replace(/[^\w-]/g,'')})();
const ci=(v,n)=>Number.isInteger(v)&&v>=0&&v<n?v:0;
const clean=a=>({n:String(a.n||'tamu').slice(0,12),g:ci(a.g,3),hs:ci(a.hs,6),hc:ci(a.hc,8),sc:ci(a.sc,8),sk:ci(a.sk,5),ah:ci(a.ah,5),gl:a.gl?1:0,ts:+a.ts||Date.now()});

/* ---- sprite avatar 16x24 (tampak depan). f: 0/1 jalan, 2 diam, 3 duduk ---- */
function draw(g,a,f){
 g.clearRect(0,0,16,24);
 const H=HC[a.hc],S=SK[a.sk],C=SC[a.sc],K='#1f3a5f',r=(c,x,y,w,h)=>R(g,c,x,y,w,h);
 if(a.hs===2)r(H,2,4,12,13);
 if(a.hs===5)r(H,2,2,12,8);
 if(a.hs===3){r(H,1,7,2,6);r(H,13,7,2,6)}
 if(a.hs===4)r(H,6,0,4,3);
 const sk=a.g===1,pc=a.g===0?'#2e527f':'#8793b8',top=sk?21:20;
 [[5,f===1],[9,f===0]].forEach(([x,up])=>{let n=(sk?2:3)-(up?1:0);if(f===3)n=1;r(sk?S:pc,x,top,2,n);r(K,x,top+n,2,1)});
 if(sk){ /* baju cewek: gaun segitiga (A-line) */
  r(C,4,14,8,4);r(C,3,18,10,1);r(C,2,19,12,2);
  r(C,3,14,1,2);r(C,12,14,1,2);r(S,3,16,1,2);r(S,12,16,1,2);
 }else{
  r(C,4,14,8,6);r(C,3,14,1,3);r(C,12,14,1,3);r(S,3,17,1,2);r(S,12,17,1,2);
 }
 r(S,7,13,2,1);r(S,3,5,10,8);
 r('#1c2f78',5,8,2,2);r('#1c2f78',9,8,2,2);r('#fff',5,8,1,1);r('#fff',9,8,1,1);
 r('#f4a6a6',4,10,1,1);r('#f4a6a6',11,10,1,1);r('#e07a8a',7,11,2,1);
 if(a.gl){ /* kacamata bulat: 2 lensa, jembatan di tengah */
  const F='#2b2630';
  [4,8].forEach(x=>{r(F,x+1,7,2,1);r(F,x+1,10,2,1);r(F,x,8,1,2);r(F,x+3,8,1,2)});
  r(F,7,8,2,1);
 }
 if(a.hs===5){r(H,2,3,12,3);r(H,2,6,2,4);r(H,12,6,2,4);r(H,5,6,6,1)}
 else{
  r(H,4,3,8,1);r(H,3,4,10,2);
  if(a.hs===1){r(H,3,6,10,1);r(H,3,7,1,4);r(H,12,7,1,4)}
  else if(a.hs===2){r(H,3,6,2,3);r(H,11,6,2,3);r(H,5,6,3,1)}
  else{r(H,3,6,1,2);r(H,12,6,1,2);r(H,5,6,6,1)}
 }
 if(a.ah===1){r('#e84a5f',4,2,8,3);r('#e84a5f',2,5,12,1)}
 if(a.ah===2){r('#f4a6c0',9,2,2,3);r('#f4a6c0',12,2,2,3);r('#e84a5f',11,2,1,3)}
 if(a.ah===3){r('#f2c14e',4,3,8,2);r('#f2c14e',4,1,1,2);r('#f2c14e',7,1,2,2);r('#f2c14e',11,1,1,2)}
 if(a.ah===4){r(H,3,2,3,3);r(H,10,2,3,3);r('#f4a6c0',4,3,1,1);r('#f4a6c0',11,3,1,1)}
}
function mk(a,f,s){const c=document.createElement('canvas');c.width=16;c.height=24;c.style.cssText=`width:${16*s}px;height:${24*s}px;image-rendering:pixelated;filter:drop-shadow(2px 0 0 #1f3a5f) drop-shadow(-2px 0 0 #1f3a5f) drop-shadow(0 2px 0 #1f3a5f) drop-shadow(0 -2px 0 #1f3a5f)`;draw(c.getContext('2d'),a,f);return c}

/* ---- suara 8-bit (tombol sfx di kanan bawah) ---- */
const SFX=window.SFX=(()=>{
 let ac,on=store('bday-sfx')!=='0';
 const ctx=()=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume();return ac}catch(e){return null}};
 function tone(f,d,type,vol,when){
  if(!on)return;const a=ctx();if(!a)return;
  const t=a.currentTime+(when||0),o=a.createOscillator(),g=a.createGain();
  o.type=type||'square';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(vol||.05,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+.02);
 }
 return{
  blip:()=>{tone(660,.08);tone(990,.1,'square',.05,.07)},
  pop:()=>{tone(500,.06,'sine',.08);tone(800,.05,'sine',.06,.05)},
  type:()=>tone(1200+Math.random()*300,.025,'square',.025),
  click:()=>tone(300,.05,'square',.04),
  fan:()=>[523,659,784,1047,784,1047].forEach((f,i)=>tone(f,.18,'square',.05,i*.12)),
  get on(){return on},
  set(v){on=v;store('bday-sfx',v?'1':'0')}
 };
})();

function init(){
const room=$('#room');
const css=document.createElement('style');css.textContent=`
#room{overflow-x:hidden;overflow-y:auto;scrollbar-width:thin}
#main{flex:none;min-height:100%;display:flex;flex-direction:column;position:relative}
#wall{flex:1 1 110px;min-height:110px}
#lounge{flex:none;position:relative;height:250px;background:var(--floor);background-image:repeating-linear-gradient(90deg,transparent 0 38px,rgba(46,82,127,.18) 38px 40px);border-top:6px solid var(--wood2);overflow:hidden}
#lounge .lw{position:absolute;top:0;left:0;right:0;height:34px;background:#dbe9fb;border-bottom:4px solid var(--wood)}
#lounge .lt{position:absolute;left:10px;top:12px;font-size:9px;color:var(--ink)}
#vbtn{position:absolute;right:10px;top:44px;z-index:5;font-size:9px;padding:9px 10px}
.tb{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);width:150px;height:16px;background:var(--wood);border:4px solid var(--wood2)}
.ltv{position:absolute;left:50%;bottom:74px;transform:translateX(-50%);cursor:pointer}
#lsofa{position:absolute;left:8px;bottom:46px;cursor:pointer}
#lsofa .sofac{display:block;image-rendering:pixelated;width:150px;height:65px}
.ltv:hover,#lsofa:hover{filter:brightness(1.12)}
#lounge .chair{right:150px;left:auto}
#vz{position:absolute;inset:0;pointer-events:none}
.v{position:absolute;bottom:6px;width:64px;z-index:3}
.v canvas{pointer-events:auto;cursor:pointer;display:block;width:64px;height:96px;image-rendering:pixelated;filter:drop-shadow(2px 0 0 #1f3a5f) drop-shadow(-2px 0 0 #1f3a5f) drop-shadow(0 2px 0 #1f3a5f) drop-shadow(0 -2px 0 #1f3a5f)}
.v .tag{position:absolute;left:50%;top:-18px;transform:translateX(-50%);font-size:8px;background:var(--cream);border:3px solid var(--wood);padding:3px 4px;white-space:nowrap}
.v .say{position:absolute;left:50%;bottom:100%;margin-bottom:22px;transform:translateX(-50%);display:none;width:max-content;max-width:130px;text-align:center;background:#fff;color:var(--ink);border:3px solid var(--ink);padding:4px 6px;font:600 12px/1.3 'Noto Sans JP','Noto Sans KR',system-ui,sans-serif;z-index:2}
.v .say.on{display:block}
.chip{border:3px solid var(--ink);background:#fff;width:34px;height:34px;padding:0;cursor:pointer}
.chip.t{width:auto;padding:2px 9px;font:20px 'VT323',monospace;color:var(--ink)}
.chip.on{outline:4px solid #f2c14e;outline-offset:1px}
@media(max-width:520px){#lsofa .sofac{width:90px;height:39px}#aqt{width:92px}#aq canvas{width:88px;height:60px}#aq{right:10px}}
#aqt{left:auto;right:6px;transform:none;width:108px}
#aq{position:absolute;right:14px;bottom:74px;cursor:pointer}
#aq canvas{display:block;width:104px;height:72px;image-rendering:pixelated;border:4px solid var(--ink);background:#6aa6ee}
#slp{position:absolute;left:30%;bottom:48%;width:40%;display:none;cursor:pointer;z-index:2}
#slp canvas{display:block;width:100%;image-rendering:pixelated;filter:drop-shadow(2px 0 0 #1f3a5f) drop-shadow(-2px 0 0 #1f3a5f) drop-shadow(0 2px 0 #1f3a5f) drop-shadow(0 -2px 0 #1f3a5f)}
.zz{position:absolute;left:70%;top:-16px;font-size:9px;color:var(--ink);font-style:normal;animation:zzf 2s ease-in infinite}
@keyframes zzf{from{transform:translate(0,0);opacity:1}to{transform:translate(8px,-14px);opacity:0}}
`;document.head.appendChild(css);


/* ---- lounge ---- */
const L=document.createElement('section');L.id='lounge';
L.innerHTML='<div class="lw"></div><p class="lt px">lounge (10 menit)</p><button class="btn alt" id="vbtn"></button><div class="chair"></div><div class="tb"></div><div class="ltv"></div><div id="lsofa"></div><div class="tb" id="aqt"></div><div id="aq"></div><div id="vz"></div>';
const mn=document.createElement('div');mn.id='main';
[...room.children].forEach(c=>mn.appendChild(c));
room.appendChild(mn);
room.appendChild(L);
const vb=$('#vbtn'),vz=$('#vz');
const tvc=document.createElement('canvas');tvc.width=20;tvc.height=14;tvc.style.cssText='width:120px;height:84px;image-rendering:pixelated;display:block';
L.querySelector('.ltv').appendChild(tvc);
const BARS=['#fff','#f2c14e','#8fd0f0','#8fd18a','#f4a6c0','#e84a5f','#4f8fe8'];let tk=0;
function tv(){const g=tvc.getContext('2d');R(g,'#1f3a5f',0,0,20,14);R(g,'#143268',1,1,18,10);for(let i=0;i<5;i++)R(g,BARS[(i+tk)%7],2+i*3,2,3,8);R(g,'#4f7fb8',1,11,18,2);R(g,'#f2c14e',16,12,1,1)}
tv();setInterval(()=>{tk++;tv()},800);
const sc=document.createElement('canvas');sc.width=30;sc.height=13;(g=>{const K='#1f3a5f';R(g,K,2,0,26,7);R(g,'#6aa6ee',3,1,24,5);R(g,K,0,3,5,9);R(g,'#4f8fe8',1,4,3,7);R(g,K,25,3,5,9);R(g,'#4f8fe8',26,4,3,7);R(g,K,4,6,22,6);R(g,'#8dbdf7',5,7,20,4);R(g,K,2,12,2,1);R(g,K,26,12,2,1)})(sc.getContext('2d'));
sc.className='sofac';$('#lsofa').appendChild(sc);

/* ---- data ---- */
let own=null,remote=[];
try{const o=JSON.parse(store('bday-av')||'null');if(o)own=clean(o)}catch(e){}
const V=new Map();
const paint=v=>draw(v.cv.getContext('2d'),v.a,v.f);
function render(){
 const now=Date.now(),all=new Map();
 remote.forEach(a=>all.set(a.id,a));
 if(own&&own.ts>now-LIFE)all.set(did,{...own,id:did});
 const list=[...all.values()].filter(a=>a.ts>now-LIFE).sort((a,b)=>b.ts-a.ts).slice(0,MAX);
 const ids=new Set(list.map(a=>a.id));
 V.forEach((v,id)=>{if(!ids.has(id)){v.el.remove();V.delete(id)}});
 list.forEach(a=>{
  let v=V.get(a.id);const k=JSON.stringify([a.n,a.g,a.hs,a.hc,a.sc,a.sk,a.ah,a.gl]);
  if(!v){const el=document.createElement('div');el.className='v';el.innerHTML='<span class="say"></span><span class="tag px"></span><canvas width="16" height="24"></canvas>';vz.appendChild(el);
   v={el,cv:el.querySelector('canvas'),say:el.querySelector('.say'),x:20+Math.random()*Math.max(10,L.clientWidth-100),dir:Math.random()<.5?1:-1,pause:Math.random()*2,t:Math.random(),f:2,k:'',sayT:0,last:'',mode:null,goal:null,seat:null,watch:false};v.cv.onclick=()=>talk(v);V.set(a.id,v)}
  v.a=a;if(v.k!==k){v.k=k;v.el.querySelector('.tag').textContent=a.n;paint(v)}
 });
 btn();
}
function btn(){const age=own?Date.now()-own.ts:LIFE;vb.textContent=own&&age<LIFE?'avaku · '+Math.ceil((LIFE-age)/60000)+'m':'+ bikin ava'}

/* ---- sofa & TV ---- */
const seats=()=>$('#lsofa').clientWidth>=140?[16,86]:[21];
const sitting=o=>o.mode==='sit'||(o.goal&&o.goal.mode==='sit');
const watching=o=>o.mode==='watch'||(o.goal&&o.goal.mode==='watch');
function who(){const m=V.get(did);if(m)return m;const f=[...V.values()].filter(v=>!v.mode&&!v.goal);return f[Math.random()*f.length|0]}
function nudge(){const t=vb.textContent;vb.textContent='bikin ava dulu!';setTimeout(btn,1500)}
function stand(v){v.goal=null;v.mode=null;v.seat=null;v.watch=false;v.f=2;v.pause=.8;paint(v)}
function say(v,t,ms){clearTimeout(v.sayT);v.say.textContent=t;v.say.classList.add('on');v.sayT=setTimeout(()=>v.say.classList.remove('on'),ms||3000)}
function talk(v){let t;do{t=GREET[Math.random()*GREET.length|0]}while(t===v.last);v.last=t;say(v,t,4500)}
$('#lsofa').onclick=()=>{
 const v=who();if(!v)return nudge();
 if(sitting(v))return stand(v);
 const S=seats(),used=[...V.values()].filter(o=>o!==v&&sitting(o)).map(o=>o.seat);
 const i=S.findIndex((_,j)=>!used.includes(j));
 if(i<0)return say(v,'sofa penuh');
 v.mode=null;v.watch=false;v.seat=i;v.goal={x:S[i],mode:'sit'};
};
tvc.onclick=()=>{
 const v=who();
 if(v){
  if(v.mode==='sit')v.watch=true;
  else if(!watching(v)){const n=[...V.values()].filter(watching).length;v.mode=null;v.goal={x:L.clientWidth/2-32+[0,-64,64][n%3],mode:'watch'}}
  v.watchT=25;
 }
 slideshow();
};

/* ---- tombol sfx + suara klik ---- */
const sfb=document.createElement('button');sfb.id='sfx';sfb.className='btn alt';sfb.style.cssText='position:fixed;bottom:8px;right:8px;z-index:15;font-size:10px;padding:9px 10px';
const sfl=()=>sfb.textContent=SFX.on?'sfx on':'sfx off';sfl();
sfb.onclick=()=>{SFX.set(!SFX.on);sfl();SFX.click()};document.body.appendChild(sfb);
document.addEventListener('click',e=>{
 const t=e.target;if(!t||!t.closest)return;
 if(t.closest('.balloon'))SFX.blip();
 else if(t.closest('#cakeWrap')){if(!document.querySelector('.flame.off'))SFX.fan();else SFX.click()}
 else if(t.closest('#put')||t.closest('.frame')||t.closest('#lampHang'))SFX.click();
},true);

function tipAt(x,y,t){const b=document.createElement('div');b.className='tip';b.textContent=t;b.style.cssText=`left:${x}px;top:${y}px;z-index:7`;L.appendChild(b);setTimeout(()=>b.remove(),1200)}

/* ---- akuarium ---- */
const aqc=document.createElement('canvas');aqc.width=24;aqc.height=16;$('#aq').appendChild(aqc);
const ag=aqc.getContext('2d'),FC=['#f2c14e','#e84a5f','#ffffff','#f4a6c0'];
let fish=[0,1,2].map(i=>({x:4+i*6,y:3+i*3,d:i%2?1:-1,c:FC[i],s:.15+Math.random()*.1,ph:Math.random()*6})),flk=[],bub=[];
function aqDraw(){
 const n=room.classList.contains('night');
 R(ag,n?'#24478f':'#6aa6ee',0,0,24,16);R(ag,n?'#2d58aa':'#8dbdf7',0,0,24,2);
 R(ag,'#e0c080',0,14,24,2);R(ag,'#c9a15f',3,15,2,1);R(ag,'#c9a15f',14,14,3,1);
 R(ag,'#4fa05a',2,10,1,4);R(ag,'#4fa05a',3,11,1,3);R(ag,'#4fa05a',20,9,1,5);R(ag,'#8fd18a',19,10,1,3);R(ag,'#4fa05a',21,11,1,3);
 bub.forEach(b=>R(ag,'#d8ecff',Math.round(b.x),Math.round(b.y),1,1));
 flk.forEach(f=>R(ag,'#f2c14e',Math.round(f.x),Math.round(f.y),1,1));
 fish.forEach(f=>{const x=Math.round(f.x),y=Math.round(f.y),tx=f.d>0?x-1:x+3,ex=f.d>0?x+2:x;R(ag,f.c,x,y,3,2);R(ag,f.c,tx,y,1,2);R(ag,'#1f3a5f',ex,y,1,1)});
}
function aqStep(){
 const t=Date.now()/1000;
 fish.forEach(f=>{
  let tg=null;
  if(flk.length)tg=flk.reduce((a,b)=>Math.abs(b.x-f.x)+Math.abs(b.y-f.y)<Math.abs(a.x-f.x)+Math.abs(a.y-f.y)?b:a);
  if(tg){
   const dx=tg.x-f.x,dy=tg.y-f.y;f.d=dx>=0?1:-1;
   f.x+=Math.sign(dx)*Math.min(.5,Math.abs(dx));f.y+=Math.sign(dy)*Math.min(.3,Math.abs(dy));
   if(Math.abs(dx)<1.5&&Math.abs(dy)<1.5){flk.splice(flk.indexOf(tg),1);bub.push({x:f.x+1,y:f.y})}
  }else{f.x+=f.d*f.s;f.y+=Math.sin(t+f.ph)*.04;if(f.x>20)f.d=-1;else if(f.x<2)f.d=1}
  f.y=Math.max(2,Math.min(12,f.y));
 });
 flk.forEach(f=>{f.y=Math.min(13,f.y+.25)});
 bub.forEach(b=>b.y-=.3);bub=bub.filter(b=>b.y>1);
 if(Math.random()<.03)bub.push({x:3+Math.random()*18,y:13});
 aqDraw();
}
aqDraw();setInterval(aqStep,100);
$('#aq').onclick=()=>{
 for(let i=0;i<4;i++)flk.push({x:3+Math.random()*18,y:1+Math.random()});
 SFX.pop();tipAt(L.clientWidth-120,L.clientHeight-74-72-28,'nyam~');
};

/* ---- kucing tidur di sofa saat malam ---- */
const SLP=['..d.d.......','.ccccc..dd..','.ckkccccddd.','cccccccccdd.','.cccccccccc.','..dddddddd..'];
const AWK=['..d.d.......','.ccccc..dd..','.cbbccccddd.','cccccccccdd.','.cccccccccc.','..dddddddd..'];
const slc=document.createElement('canvas');slc.width=12;slc.height=6;
const slg=slc.getContext('2d'),CP={c:'#f0dcc0',d:'#4a3328',k:'#1f3a5f',b:'#4fb4ff'};
const slPaint=rows=>{slg.clearRect(0,0,12,6);rows.forEach((r,y)=>[...r].forEach((ch,x)=>CP[ch]&&R(slg,CP[ch],x,y,1,1)))};
slPaint(SLP);
const slp=document.createElement('div');slp.id='slp';slp.innerHTML='<i class="zz px">z</i>';slp.appendChild(slc);$('#lsofa').appendChild(slp);
function nightCheck(){
 const n=room.classList.contains('night');slp.style.display=n?'block':'none';
 const c=$('#cat');if(c)c.style.display=n?'none':'';
}
new MutationObserver(nightCheck).observe(room,{attributes:true,attributeFilter:['class']});nightCheck();
let awake=false;
slp.onclick=e=>{
 e.stopPropagation();if(awake)return;awake=true;
 slPaint(AWK);slp.querySelector('.zz').style.display='none';
 try{$('#cat').click()}catch(err){}
 tipAt($('#lsofa').offsetLeft+20,L.clientHeight-46-$('#lsofa').clientHeight-30,'meow!!');
 setTimeout(()=>{awake=false;slPaint(SLP);slp.querySelector('.zz').style.display=''},3000);
};

/* ---- TV: slideshow kenangan (efek pixel) ---- */
function cover(g,im,W,H){const r=Math.max(W/im.width,H/im.height),w=im.width*r,h=im.height*r;g.drawImage(im,(W-w)/2,(H-h)/2,w,h)}
function slideshow(){
 const raw=(window.EX_MEMORIES&&window.EX_MEMORIES.length)?window.EX_MEMORIES:(CONFIG.photos||[]).map(p=>({src:p.src,title:p.cap,date:'',story:''}));
 const items=raw.filter(m=>m&&m.src);
 if(!items.length)return openM('<h2>tv kenangan</h2><p>belum ada foto.</p>');
 openM(`<h2>tv kenangan</h2><canvas id="tvc2" width="320" height="256" style="width:100%;border:4px solid var(--ink);image-rendering:pixelated;display:block;background:#143268"></canvas><p id="tvd" class="px" style="font-size:8px;opacity:.7;margin-top:10px"></p><p id="tvt" class="px" style="font-size:11px;line-height:1.6;margin-top:4px"></p><p id="tvs" style="font-size:22px;line-height:1.1;margin-top:4px"></p><div class="row"><button class="btn" id="tvp">&lt;</button><button class="btn alt" id="tvn">&gt;</button></div>`);
 let i=0,timer=0;
 const cv=$('#tvc2');
 function show(k){
  i=(k+items.length)%items.length;const m=items[i];
  $('#tvd').textContent=m.date||'';$('#tvt').textContent=m.title||'';$('#tvs').textContent=m.story||'';
  const g=cv.getContext('2d'),im=new Image();
  im.onload=()=>{const sizes=[8,16,32,64,0];let s=0;(function step(){
   if(!cv.isConnected||items[i]!==m)return;const w=sizes[s];
   if(!w){g.imageSmoothingEnabled=true;cover(g,im,cv.width,cv.height)}
   else{const t=document.createElement('canvas');t.width=w;t.height=Math.round(w*cv.height/cv.width);cover(t.getContext('2d'),im,t.width,t.height);g.imageSmoothingEnabled=false;g.drawImage(t,0,0,cv.width,cv.height)}
   if(++s<sizes.length)setTimeout(step,110);
  })()};
  im.onerror=()=>{g.fillStyle='#143268';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#fff';g.font='48px "Press Start 2P",monospace';g.textAlign='center';g.fillText('♡',cv.width/2,cv.height/2+16)};
  im.src=m.src;
  clearInterval(timer);timer=setInterval(()=>show(i+1),4500);
 }
 $('#tvp').onclick=()=>show(i-1);$('#tvn').onclick=()=>show(i+1);
 onClose=()=>clearInterval(timer);
 show(0);
}

/* ---- loop ---- */
let last=performance.now();
(function tick(now){
 const dt=Math.min(.1,(now-last)/1000||0);last=now;const W=L.clientWidth-64;
 V.forEach(v=>{
  if(v.mode){if(v.mode==='watch'){v.watchT-=dt;if(v.watchT<=0)stand(v)}}
  else if(v.goal){
   const dx=v.goal.x-v.x,stp=70*dt;
   if(Math.abs(dx)<=stp){v.x=v.goal.x;v.mode=v.goal.mode;v.goal=null;v.dir=1;v.watchT=25;v.f=v.mode==='sit'?3:2;paint(v)}
   else{v.dir=dx>0?1:-1;v.x+=v.dir*70*dt;v.t+=dt;const f=Math.floor(v.t*6)%2;if(f!==v.f){v.f=f;paint(v)}}
  }else if(v.pause>0){v.pause-=dt;if(v.f!==2){v.f=2;paint(v)}}
  else{
   v.x+=v.dir*30*dt;v.t+=dt;const f=Math.floor(v.t*4)%2;if(f!==v.f){v.f=f;paint(v)}
   if(v.x>=W){v.x=W;v.dir=-1;v.pause=1}else if(v.x<=0){v.x=0;v.dir=1;v.pause=1}
   else if(Math.random()<dt*.15)v.pause=1+Math.random()*2;
  }
  v.el.style.left=v.x+'px';v.el.style.bottom=v.mode==='sit'?'54px':'6px';
  v.cv.style.transform=(!v.mode&&v.dir<0)?'scaleX(-1)':'';
 });
 requestAnimationFrame(tick);
})(performance.now());
setInterval(render,10000);render();

/* sinkron realtime */
(function w(n){
 if(db&&fs){try{
  const q=fs.query(fs.collection(db,'visitors'),fs.where('ts','>',Date.now()-LIFE),fs.orderBy('ts','desc'),fs.limit(MAX));
  fs.onSnapshot(q,s=>{remote=s.docs.map(d=>({...clean(d.data()),id:d.id}));render()},e=>console.warn(e));
 }catch(e){console.warn(e)}}
 else if(n<25)setTimeout(()=>w(n+1),400);
})(0);

async function save(a){
 own=a;store('bday-av',JSON.stringify(a));render();
 if(db&&fs){try{await fs.setDoc(fs.doc(db,'visitors',did),a)}catch(e){console.warn(e)}}
}

/* ---- editor ---- */
const chips=(k,arr,sw)=>`<div class="sw">${arr.map((v,i)=>`<button class="chip${sw?'':' t'}" data-k="${k}" data-v="${i}"${sw?` style="background:${v}" aria-label="${k} ${i+1}"`:''}>${sw?'':v}</button>`).join('')}</div>`;
const lab=t=>`<p class="from" style="margin:8px 0 4px">${t}</p>`;
vb.onclick=()=>{
 const alive=own&&Date.now()-own.ts<LIFE;
 const a=alive?{...own}:{n:store('bday-vn')||'',g:2,hs:0,hc:1,sc:3,sk:0,ah:0,gl:0};
 openM(`<h2>bikin avamu</h2><div id="pvw" style="text-align:center;margin-bottom:8px"></div>
 <input id="vn" maxlength="12" placeholder="nama (maks 12)" value="${esc(a.n==='tamu'?'':a.n)}">
 ${lab('gender')}${chips('g',GN)}${lab('model rambut')}${chips('hs',HS)}${lab('warna rambut')}${chips('hc',HC,1)}
 ${lab('warna kulit')}${chips('sk',SK,1)}${lab('warna baju')}${chips('sc',SC,1)}
 ${lab('aksesoris')}${chips('ah',AH)}${chips('gl',['tanpa kacamata','kacamata'])}
 <p class="from" style="font-size:18px">${alive?'avatar aktif, timer 10 menit tidak di-reset.':'1 device = 1 avatar, tampil 10 menit.'}</p>
 <div class="row"><button class="btn" id="vs">${alive?'simpan':'masuk lounge'}</button></div>`);
 const pc=mk(a,2,6);$('#pvw').appendChild(pc);
 const mark=()=>mb.querySelectorAll('.chip').forEach(b=>b.classList.toggle('on',a[b.dataset.k]===+b.dataset.v));
 mb.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{a[b.dataset.k]=+b.dataset.v;mark();draw(pc.getContext('2d'),a,2)});
  mark();draw(pc.getContext('2d'),a,2);
 $('#vs').onclick=()=>{
  const n=($('#vn').value.trim()||'tamu').slice(0,12);store('bday-vn',n);
  const out=clean({...a,n,ts:alive?own.ts:Date.now()});
  $('#vs').disabled=true;closeM();save(out);
 };
};
}
const go=()=>{try{init()}catch(e){console.error(e);const d=document.createElement('div');d.textContent='visitors.js error: '+e.message;d.style.cssText='position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:6px;font:12px monospace;z-index:99';document.body.appendChild(d)}};
document.readyState==='complete'?setTimeout(go,0):addEventListener('load',()=>setTimeout(go,0));
})();