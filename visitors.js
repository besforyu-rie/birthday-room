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
const store=(k,v)=>{try{return v===undefined?localStorage.getItem(k):localStorage.setItem(k,v)}catch(e){}};
const did=(()=>{let d=store('bday-did');if(!d){d=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Math.random()).slice(2)+Date.now();store('bday-did',d)}return String(d).replace(/[^\w-]/g,'')})();
const ci=(v,n)=>Number.isInteger(v)&&v>=0&&v<n?v:0;
const clean=a=>({n:String(a.n||'tamu').slice(0,12),g:ci(a.g,3),hs:ci(a.hs,6),hc:ci(a.hc,8),sc:ci(a.sc,8),sk:ci(a.sk,5),ah:ci(a.ah,5),gl:a.gl?1:0,ts:+a.ts||Date.now()});

/* ---- sprite avatar 16x24 (tampak depan) ---- */
function draw(g,a,f){
 g.clearRect(0,0,16,24);
 const H=HC[a.hc],S=SK[a.sk],C=SC[a.sc],K='#1f3a5f',r=(c,x,y,w,h)=>R(g,c,x,y,w,h);
 if(a.hs===2)r(H,2,4,12,13);
 if(a.hs===5)r(H,2,2,12,8);
 if(a.hs===3){r(H,1,7,2,6);r(H,13,7,2,6)}
 if(a.hs===4)r(H,6,0,4,3);
 const skirt=a.g===1,pc=a.g===0?'#2e527f':'#8793b8';
 [[5,f===1],[9,f===0]].forEach(([x,up])=>{const n=up?2:3;r(skirt?S:pc,x,20,2,n);r(K,x,20+n,2,1)});
 r(C,4,14,8,6);r(C,3,14,1,3);r(C,12,14,1,3);r(S,3,17,1,2);r(S,12,17,1,2);
 if(skirt)r(C,3,19,10,2);
 r(S,7,13,2,1);r(S,3,5,10,8);
 r('#1c2f78',5,8,2,2);r('#1c2f78',9,8,2,2);r('#fff',5,8,1,1);r('#fff',9,8,1,1);
 r('#f4a6a6',4,10,1,1);r('#f4a6a6',11,10,1,1);r('#e07a8a',7,11,2,1);
 if(a.gl){[4,8].forEach(x=>{r(K,x,7,4,1);r(K,x,10,4,1);r(K,x,8,1,2);r(K,x+3,8,1,2)})}
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

function init(){
const room=$('#room'),fl=$('#floor');
const css=document.createElement('style');css.textContent=`
#room{overflow-x:hidden;overflow-y:auto;scrollbar-width:thin}
#wall{flex:1 0 150px}
#lounge{flex:none;position:relative;height:250px;background:var(--floor);background-image:repeating-linear-gradient(90deg,transparent 0 38px,rgba(46,82,127,.18) 38px 40px);border-top:6px solid var(--wood2);overflow:hidden}
#lounge .lw{position:absolute;top:0;left:0;right:0;height:34px;background:#dbe9fb;border-bottom:4px solid var(--wood)}
#lounge .lt{position:absolute;left:10px;top:12px;font-size:9px;color:var(--ink)}
#vbtn{position:absolute;right:10px;top:44px;z-index:5;font-size:9px;padding:9px 10px}
.tb{position:absolute;left:50%;bottom:58px;transform:translateX(-50%);width:150px;height:16px;background:var(--wood);border:4px solid var(--wood2)}
.ltv{position:absolute;left:50%;bottom:74px;transform:translateX(-50%)}
#lsofa{position:absolute;left:8px;bottom:46px}
#lsofa canvas{display:block;image-rendering:pixelated;width:150px;height:65px}
#lounge .chair{right:30px;left:auto}
#vz{position:absolute;inset:0;pointer-events:none}
.v{position:absolute;bottom:6px;width:64px;z-index:3}
.v canvas{display:block;width:64px;height:96px;image-rendering:pixelated;filter:drop-shadow(2px 0 0 #1f3a5f) drop-shadow(-2px 0 0 #1f3a5f) drop-shadow(0 2px 0 #1f3a5f) drop-shadow(0 -2px 0 #1f3a5f)}
.v .tag{position:absolute;left:50%;top:-18px;transform:translateX(-50%);font-size:8px;background:var(--cream);border:3px solid var(--wood);padding:3px 4px;white-space:nowrap}
.chip{border:3px solid var(--ink);background:#fff;width:34px;height:34px;padding:0;cursor:pointer}
.chip.t{width:auto;padding:2px 9px;font:20px 'VT323',monospace;color:var(--ink)}
.chip.on{outline:4px solid #f2c14e;outline-offset:1px}
`;document.head.appendChild(css);
$('#hint').textContent+=' · scroll ke bawah';

/* ---- lounge ---- */
const L=document.createElement('section');L.id='lounge';
L.innerHTML='<div class="lw"></div><p class="lt px">lounge (10 menit)</p><button class="btn alt" id="vbtn"></button><div class="chair"></div><div class="tb"></div><div class="ltv"></div><div id="lsofa"></div><div id="vz"></div>';
room.appendChild(L);
const vb=$('#vbtn'),vz=$('#vz');
/* TV */
const tvc=document.createElement('canvas');tvc.width=20;tvc.height=14;tvc.style.cssText='width:120px;height:84px;image-rendering:pixelated;display:block';
L.querySelector('.ltv').appendChild(tvc);
const BARS=['#fff','#f2c14e','#8fd0f0','#8fd18a','#f4a6c0','#e84a5f','#4f8fe8'];let tk=0;
function tv(){const g=tvc.getContext('2d');R(g,'#1f3a5f',0,0,20,14);R(g,'#143268',1,1,18,10);for(let i=0;i<5;i++)R(g,BARS[(i+tk)%7],2,2,0,0),R(g,BARS[(i+tk)%7],2+i*3,2,3,8);R(g,'#4f7fb8',1,11,18,2);R(g,'#f2c14e',16,12,1,1)}
tv();setInterval(()=>{tk++;tv()},800);
/* sofa */
const sc=document.createElement('canvas');sc.width=30;sc.height=13;(g=>{const K='#1f3a5f';R(g,K,2,0,26,7);R(g,'#6aa6ee',3,1,24,5);R(g,K,0,3,5,9);R(g,'#4f8fe8',1,4,3,7);R(g,K,25,3,5,9);R(g,'#4f8fe8',26,4,3,7);R(g,K,4,6,22,6);R(g,'#8dbdf7',5,7,20,4);R(g,K,2,12,2,1);R(g,K,26,12,2,1)})(sc.getContext('2d'));
$('#lsofa').appendChild(sc);
const mq=document.createElement('style');mq.textContent='@media(max-width:520px){#lsofa canvas{width:90px;height:39px}}';document.head.appendChild(mq);

/* ---- data ---- */
let own=null,remote=[];
try{const o=JSON.parse(store('bday-av')||'null');if(o)own=clean(o)}catch(e){}
const V=new Map();
function paint(v){draw(v.cv.getContext('2d'),v.a,v.f)}
function render(){
 const now=Date.now(),all=new Map();
 remote.forEach(a=>all.set(a.id,a));
 if(own&&own.ts>now-LIFE)all.set(did,{...own,id:did});
 const list=[...all.values()].filter(a=>a.ts>now-LIFE).sort((a,b)=>b.ts-a.ts).slice(0,MAX);
 const ids=new Set(list.map(a=>a.id));
 V.forEach((v,id)=>{if(!ids.has(id)){v.el.remove();V.delete(id)}});
 list.forEach(a=>{
  let v=V.get(a.id);const k=JSON.stringify([a.n,a.g,a.hs,a.hc,a.sc,a.sk,a.ah,a.gl]);
  if(!v){const el=document.createElement('div');el.className='v';el.innerHTML='<span class="tag px"></span><canvas width="16" height="24"></canvas>';vz.appendChild(el);
   v={el,cv:el.querySelector('canvas'),x:20+Math.random()*Math.max(10,L.clientWidth-100),dir:Math.random()<.5?1:-1,pause:Math.random()*2,t:Math.random(),f:2,k:''};V.set(a.id,v)}
  v.a=a;if(v.k!==k){v.k=k;v.el.querySelector('.tag').textContent=a.n;paint(v)}
 });
 btn();
}
function btn(){const age=own?Date.now()-own.ts:LIFE;vb.textContent=own&&age<LIFE?'avaku · '+Math.ceil((LIFE-age)/60000)+'m':'+ bikin ava'}
let last=performance.now();
(function tick(now){
 const dt=Math.min(.1,(now-last)/1000||0);last=now;const W=L.clientWidth-64;
 V.forEach(v=>{
  if(v.pause>0){v.pause-=dt;if(v.f!==2){v.f=2;paint(v)}}
  else{
   v.x+=v.dir*30*dt;v.t+=dt;const f=Math.floor(v.t*4)%2;if(f!==v.f){v.f=f;paint(v)}
   if(v.x>=W){v.x=W;v.dir=-1;v.pause=1}else if(v.x<=0){v.x=0;v.dir=1;v.pause=1}
   else if(Math.random()<dt*.15)v.pause=1+Math.random()*2;
  }
  v.el.style.left=v.x+'px';v.cv.style.transform=v.dir<0?'scaleX(-1)':'';
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
/* extras.js memakai event load; jalankan setelahnya */
document.readyState==='complete'?setTimeout(go,0):addEventListener('load',()=>setTimeout(go,0));
})();