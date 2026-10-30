/* extras.js — taruh sefolder dengan index.html, lalu tambahkan SEBELUM </body>:
   <script src="extras.js"></script>
   Di CONFIG index.html ubah music:"" (radio menggantikan musik latar). */
(()=>{
/* ===== EDIT BAGIAN INI ===== */
const EX={
 radio:[{n:"lagu 1",src:"music.mp3"}], /* tambah {n:"nama",src:"file.mp3"} kalau sudah upload lagu lain */
 lock:{code:"2512",openAt:"2026-11-07T22:00:00+07:00",hint:"when r we meet?",msg:"Cie ultah ni yaa, selamat tambah dewasa. stop panggil aku plup meong zzz."},
 letter:{title:"Surat dari aku",body:"Halo Aqsa,\n\nTulis surat panjangmu di sini.\n\nBaris kosong = paragraf baru.\n\n— developer"},
 memories:[
  {src:"image1.png",date:"DD Bulan 2025",title:"hari itu, ultahnya mita",story:"Tulis ceritanya di sini."},
  {src:"image2.png",date:"DD Bulan 2025",title:"tiba-tiba dia foto",story:"Tulis ceritanya di sini."},
  {src:"image3.png",date:"DD Bulan 2025",title:"mendaki gunung",story:"Tulis ceritanya di sini."}
 ]
};
/* =========================== */
function init(){
const PAL={k:'#1f3a5f',w:'#8fd0f0',o:'#f0b070',y:'#f2c14e',n:'#c98b52',r:'#e84a5f',p:'#f4a6c0',g:'#8fd18a',d:'#8a5a34',b:'#4f8fe8',W:'#fff'};
function spr(m,s){const c=document.createElement('canvas');c.width=m[0].length;c.height=m.length;c.style.width=c.width*s+'px';c.style.height=c.height*s+'px';const g=c.getContext('2d');m.forEach((r,y)=>[...r].forEach((ch,x)=>PAL[ch]&&R(g,PAL[ch],x,y,1,1)));return c}
const ls=(k,v)=>{try{return v==null?localStorage.getItem(k):localStorage.setItem(k,v)}catch(e){}};
const css=document.createElement('style');css.textContent=`
#shelf{position:absolute;right:8px;top:2px;display:flex;gap:6px;z-index:3}
#shelf button{width:32px;height:32px;border:3px solid var(--wood2);background:var(--cream);padding:0;cursor:pointer;display:grid;place-items:center}
.deco{position:absolute;bottom:100%;border:0;background:none;padding:0;cursor:pointer;z-index:3}
.deco canvas{display:block;image-rendering:pixelated}
#stars{position:absolute;inset:0 0 auto;height:55%;opacity:0;transition:opacity .8s;pointer-events:none}
#stars i{position:absolute;width:3px;height:3px;background:#fff;animation:tw 2s steps(2) infinite alternate}
#stars b{position:absolute;right:12%;top:14px;width:22px;height:22px;background:#fff6c8;border-radius:50%;box-shadow:inset -6px 0 0 #141f4a}
@keyframes tw{to{opacity:.2}}
#room.night{--wall:#141f4a;--floor:#222f5c}
#room.night #stars{opacity:1}
#room.night #wall{background:rgba(0,0,30,.28)}
#room.night .sub,#room.night .hint{color:#dbe8ff}
#pg{position:fixed;inset:0;z-index:18;background:var(--wall);display:none;flex-direction:column}
#pg.on{display:flex}#pg.r2{background:#e9d9b6}
#pgh{display:flex;align-items:center;gap:12px;padding:10px;background:var(--wood);color:#fff;font:11px 'Press Start 2P'}
#pgb{flex:1;overflow:auto;padding:16px;max-width:720px;width:100%;margin:0 auto;font-size:24px}
#pgb input{font:24px 'VT323',monospace;border:3px solid var(--hot);background:#e3efff;padding:8px;color:var(--ink);min-width:0}
.paper{background:#fffdf3;border:4px solid var(--wood2);padding:20px;font-size:26px;line-height:1.2;white-space:pre-line;box-shadow:5px 5px 0 var(--ink)}
.scrap{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:30px;padding:14px}
.scrap figure{margin:0;background:#fffdf3;padding:10px 10px 14px;box-shadow:3px 3px 0 rgba(31,58,95,.3);transform:rotate(var(--r));position:relative}
.scrap img,.scrap .ph{width:100%;aspect-ratio:4/3;object-fit:cover;display:grid;place-items:center;border:3px solid var(--ink);background:#cfe0f6}
.scrap .tape{position:absolute;top:-10px;left:50%;width:60px;height:18px;margin-left:-30px;background:rgba(242,193,78,.75);transform:rotate(-3deg)}
.scrap small{font:8px 'Press Start 2P';opacity:.7;display:block;margin:8px 0 4px}
.scrap b{font:11px/1.5 'Press Start 2P'}.scrap p{font-size:22px;line-height:1.1;margin-top:6px}

#frames{display:none}
#side{position:absolute;right:10px;bottom:58px;width:88px;height:20px;background:var(--wood);border:4px solid var(--wood2);box-shadow:0 18px 0 -6px var(--wood2)}
#side:before,#side:after{content:"";position:absolute;top:16px;width:12px;height:70px;background:var(--wood2)}
#side:before{left:8px}#side:after{right:8px}
.it{position:absolute;bottom:100%;border:0;background:none;padding:0;cursor:pointer;z-index:2}
.it canvas{display:block;image-rendering:pixelated}
.it:hover,.deco:hover{filter:brightness(1.15)}
#lampBox{position:relative;height:0;z-index:4}
#lampHang{position:absolute;left:68%;top:0;width:32px;margin-left:-16px;cursor:pointer;display:flex;flex-direction:column;align-items:center}
.cord{display:block;width:2px;height:30px;background:var(--ink)}
.glow{position:absolute;left:50%;top:34px;width:120px;height:120px;margin:-20px 0 0 -60px;border-radius:50%;background:radial-gradient(rgba(255,238,150,.5),transparent 70%);pointer-events:none}
.lampc{position:relative;image-rendering:pixelated}
#room.night .glow{display:none}
#room.night .lampc{filter:grayscale(1) brightness(.55)}
@media(max-width:520px){#table{width:160px}}
`;document.head.appendChild(css);

/* ---- halaman penuh ---- */
const pg=document.createElement('div');pg.id='pg';
pg.innerHTML='<div id="pgh"><button class="btn" id="pgx">&lt; back</button><span id="pgt"></span></div><div id="pgb"></div>';document.body.appendChild(pg);
let pgClose=null;
function page(t,h,c,cls){$('#pgt').textContent=t;$('#pgb').innerHTML=h;pg.className='on '+(cls||'');pgClose=c||null;$('#pgb').scrollTop=0}
function back(){pg.className='';$('#pgb').innerHTML='';if(pgClose){pgClose();pgClose=null}}
$('#pgx').onclick=back;

/* ---- ikon & dekor ---- */
const IC={
 radio:[".....k..","....k...","kkkkkkkk","kwwwkokk","kwwwkkkk","kwwwkokk","kkkkkkkk"],
 lamp:["..kkkk..",".kyyyyk.",".kyyyyk.",".kyyyyk.","..kyyk..","..kkkk..","..kkkk..","...kk..."],
 game:["........","kkkkkkkk","kkWkkykk","kWWWkkyk","kkWkkkkk","kkkkkkkk",".kk..kk."],
 gift:[".kk..kk.","k..kk..k","kkkrrkkk","kppprppk","kppprppk","krrrrrrk","kppprppk","kkkkkkkk"]
};
const MB=[".kkkkkkkk.","kbbbbbbbbk","kbbkkkkbbk","kbbkkkkbbk","kbbbbbbbbk",".kkkkkkkk.","....nn....","....nn....","....nn....","....nn...."];
const AR=[".kkkkkkkk.","kbbbbbbbbk","kbwyywwwbk","kbwwwwwwbk","kbwwwwwwbk","kbbbbbbbbk","kbbkbbrbbk","kbbbbbbbbk","kbbbbbbbbk","kkkkkkkkkk"];
const fl=$('#floor');
const side=document.createElement('div');side.id='side';
[['radio',radioUI,'left'],['gift',gift,'right']].forEach(([k,fn,sd])=>{const b=document.createElement('button');b.className='it';b.style[sd]='6px';b.setAttribute('aria-label',k);b.appendChild(spr(IC[k],4));b.onclick=fn;side.appendChild(b)});
fl.appendChild(side);
const lb=document.createElement('div');lb.id='lampBox';lb.innerHTML='<div id="lampHang" aria-label="lampu"><i class="glow"></i><i class="cord"></i></div>';
const lc=spr(IC.lamp,4);lc.className='lampc';lb.firstChild.appendChild(lc);lb.firstChild.onclick=lamp;$('#wall').before(lb);
function deco(side,cv,fn,label,off){const b=document.createElement('button');b.className='deco';b.style[side]=(off||8)+'px';b.setAttribute('aria-label',label);b.appendChild(cv);b.onclick=fn;fl.appendChild(b)}
deco('left',spr(AR,4),game,'game',58);
deco('left',spr(MB,4),()=>page(EX.letter.title,`<div class="paper">${esc(EX.letter.body)}</div>`),'surat dari developer');
const door=document.createElement('canvas');door.width=10;door.height=16;(g=>{R(g,'#1f3a5f',0,0,10,16);R(g,'#8a5a34',1,1,8,15);R(g,'#a8743f',2,2,6,5);R(g,'#a8743f',2,9,6,5);R(g,'#f2c14e',7,8,1,1)})(door.getContext('2d'));
door.style.cssText='width:40px;height:64px';
deco('right',door,mem,'pintu kenangan');
$('#mus').style.display='none';

/* ---- lampu: siang / malam berbintang ---- */
const stars=document.createElement('div');stars.id='stars';
for(let i=0;i<45;i++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*98}%;top:${Math.random()*95}%;animation-delay:${-Math.random()*2}s`;stars.appendChild(s)}
stars.appendChild(document.createElement('b'));$('#room').prepend(stars);
function lamp(){$('#room').classList.toggle('night')}

/* ---- radio ---- */
const au=new Audio(),T=EX.radio;let ti=0,on=false;
function load(i){ti=(i+T.length)%T.length;au.src=T[ti].src}
function play(){if(!au.src)load(ti);au.play().then(()=>{on=true;ui()}).catch(()=>{on=false;ui()})}
function pause(){au.pause();on=false;ui()}
au.onended=()=>{load(ti+1);play()};au.onerror=()=>{if(T.length>1&&on){load(ti+1);play()}};
addEventListener('pointerdown',()=>{if(!au.src&&T.length)play()},{once:true});
function ui(){const n=$('#np');if(!n)return;n.textContent=(on?'> ':'')+T[ti].n;$('#pp').textContent=on?'pause':'play';
 document.querySelectorAll('.tr').forEach((b,i)=>b.style.opacity=i===ti?1:.6)}
function radioUI(){
 if(!T.length)return openM('<h2>radio</h2><p>belum ada lagu.</p>');
 openM(`<h2>radio</h2><p id="np" style="margin-bottom:10px"></p><div class="row"><button class="btn" id="pv">&lt;&lt;</button><button class="btn alt" id="pp"></button><button class="btn" id="nx">&gt;&gt;</button></div><div class="row" style="flex-direction:column">${T.map((t,i)=>`<button class="btn tr" data-i="${i}">${esc(t.n)}</button>`).join('')}</div>`);
 $('#pv').onclick=()=>{load(ti-1);play()};$('#nx').onclick=()=>{load(ti+1);play()};
 $('#pp').onclick=()=>on?pause():play();
 document.querySelectorAll('.tr').forEach(b=>b.onclick=()=>{load(+b.dataset.i);play()});ui();
}

/* ---- pesan terkunci (kode 4 angka ATAU hitung mundur) ---- */
function gift(){
 const L=EX.lock,t0=new Date(L.openAt).getTime(),show=()=>{onClose=null;openM(`<h2>pesan untukmu</h2><p>${esc(L.msg)}</p>`)};
 if(Date.now()>=t0)return show();
 openM(`<h2>pesan terkunci</h2><p>buka dengan 4 angka, atau tunggu sampai:</p><p id="cdn" class="px" style="font-size:12px;margin:10px 0;line-height:1.8"></p><input id="pin" inputmode="numeric" maxlength="4" placeholder="0000" style="width:100%"><p class="from">${esc(L.hint||'')}</p><div class="row"><button class="btn" id="pk">buka</button></div><p id="pe"></p>`);
 const tick=()=>{let s=Math.max(0,t0-Date.now())/1000|0;const d=s/86400|0;s%=86400;$('#cdn').textContent=`${d}h ${s/3600|0}j ${(s%3600)/60|0}m ${s%60}d`};
 const iv=setInterval(()=>{Date.now()>=t0?(clearInterval(iv),show()):tick()},1000);tick();onClose=()=>clearInterval(iv);
 $('#pk').onclick=()=>{if($('#pin').value===L.code){clearInterval(iv);show()}else $('#pe').textContent='kodenya salah, coba lagi'};
}

/* ---- ruangan kenangan (scrapbook) ---- */
function mem(){
 page('ruang kenangan',`<div class="scrap">${EX.memories.map((m,i)=>`<figure style="--r:${[-2,1.5,-1,2.5][i%4]}deg"><i class="tape"></i><img src="${esc(m.src)}" alt="" onerror="this.outerHTML='<div class=ph>♡</div>'"><small>${esc(m.date)}</small><b>${esc(m.title)}</b><p>${esc(m.story)}</p></figure>`).join('')}</div>`,null,'r2');
}

/* ---- mini game + papan skor ---- */
async function top(){
 let a=[];
 if(db&&fs){try{const s=await fs.getDocs(fs.query(fs.collection(db,'scores'),fs.orderBy('score','desc'),fs.limit(10)));a=s.docs.map(d=>d.data())}catch(e){console.warn(e)}}
 else{try{a=JSON.parse(ls('bday-scores')||'[]')}catch(e){}a.sort((x,y)=>y.score-x.score);a=a.slice(0,10)}
 return a;
}
async function save(name,score){
 if(db&&fs){try{await fs.addDoc(fs.collection(db,'scores'),{name,score,createdAt:fs.serverTimestamp()});return}catch(e){console.warn(e)}}
 let a=[];try{a=JSON.parse(ls('bday-scores')||'[]')}catch(e){}a.push({name,score});ls('bday-scores',JSON.stringify(a));
}
async function board(){
 const a=await top(),el=$('#lb');if(!el)return;
 el.innerHTML='<h2 class="px" style="font-size:12px;margin:14px 0 8px">papan skor</h2>'+(a.length?a.map((s,i)=>`<p>${i+1}. ${esc(s.name)} — ${s.score}</p>`).join(''):'<p>belum ada skor</p>');
}
let run=false,raf=0;
function game(){
 const W=300,H=400;run=false;cancelAnimationFrame(raf);
 page('tangkap balon',`<div style="max-width:340px;margin:0 auto"><canvas id="gc" width="${W}" height="${H}" style="width:100%;border:4px solid var(--ink);display:block;touch-action:none;image-rendering:pixelated"></canvas><div class="row" id="gr"><button class="btn" id="gs">start</button></div><div id="lb"></div></div>`,()=>{run=false;cancelAnimationFrame(raf)});
 const cv=$('#gc'),g=cv.getContext('2d'),SP=['#4f8fe8','#a98bd6','#8fd0f0','#f2c14e','#f4a6c0'].map(balloonCv);
 let bx=W/2,bl=[],sc=0,tl=30,last=0,sp=0;g.imageSmoothingEnabled=false;
 cv.onpointermove=cv.onpointerdown=e=>{const r=cv.getBoundingClientRect();bx=Math.max(30,Math.min(W-30,(e.clientX-r.left)/r.width*W))};
 function draw(msg){
  g.fillStyle='#bfe0ff';g.fillRect(0,0,W,H);bl.forEach(b=>g.drawImage(SP[b.c],b.x-14,b.y,28,44));
  R(g,'#1f3a5f',bx-30,H-30,60,26);R(g,'#c98b52',bx-26,H-26,52,18);R(g,'#8a5a34',bx-26,H-14,52,6);
  g.fillStyle='#1f3a5f';g.font='14px "Press Start 2P",monospace';g.textAlign='left';g.fillText('skor '+sc,8,22);g.fillText(Math.ceil(tl)+'s',W-56,22);
  if(msg){g.textAlign='center';g.fillText(msg,W/2,H/2);g.textAlign='left'}
 }
 function loop(t){
  if(!run)return;const dt=Math.min(.05,(t-last)/1000);last=t;tl-=dt;sp-=dt;
  if(sp<=0){bl.push({x:20+Math.random()*(W-40),y:-44,c:Math.random()*5|0,v:90+(30-tl)*5+Math.random()*50});sp=.55}
  bl=bl.filter(b=>{b.y+=b.v*dt;if(b.y+44>=H-30&&Math.abs(b.x-bx)<36){sc++;return false}return b.y<H});
  draw();if(tl<=0){run=false;end()}else raf=requestAnimationFrame(loop);
 }
 function end(){
  draw('selesai!');
  $('#gr').innerHTML=`<input id="gn" maxlength="14" placeholder="namamu" value="${esc(ls('bday-name')||'')}" style="flex:1"><button class="btn" id="gv">simpan ${sc}</button><button class="btn alt" id="ga">main lagi</button>`;
  $('#ga').onclick=game;
  $('#gv').onclick=async()=>{const n=$('#gn').value.trim()||'anon';ls('bday-name',n);$('#gv').disabled=true;await save(n,sc);board()};
 }
 $('#gs').onclick=()=>{$('#gr').innerHTML='';run=true;last=performance.now();raf=requestAnimationFrame(loop)};
 draw('siap?');board();
}

/* ---- photo booth: edit stiker pixel (hasil tetap di perangkat, tidak masuk Firebase) ---- */
const ST={
 heart:[".rr.rr.","rrrrrrr","rrrrrrr",".rrrrr.","..rrr..","...r..."],
 star:["...y...","...y...","yyyyyyy",".yyyyy.","..yyy..",".yy.yy.",".y...y."],
 crown:["y..y..y","yy.y.yy","yyyyyyy","yrybyry","yyyyyyy"],
 balloon:[".bbbb.","bWbbbb","bWbbbb","bbbbbb",".bbbb.","..bb..","...k..."],
 cat:["o.....o","ooooooo","ookoook","ooopooo",".ooooo."],
 cake:["..y.y..","..k.k..","WWWWWWW","ppppppp","bbbbbbb","WWWWWWW"]
};
function stk(g,n,cx,cy){const m=ST[n],s=6,w=m[0].length;m.forEach((r,y)=>[...r].forEach((c,x)=>PAL[c]&&R(g,PAL[c],Math.round(cx-w*s/2+x*s),Math.round(cy-m.length*s/2+y*s),s,s)))}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function booth(){
 openM(`<h2>photo booth</h2><div class="cam"><video id="v" autoplay playsinline muted></video><div id="cd"></div><div id="fl"></div></div><div class="row"><button class="btn" id="go">start (4 foto)</button></div><p id="msg" style="font-size:20px;margin-top:8px"></p>`);
 let stream;onClose=()=>{if(stream)stream.getTracks().forEach(t=>t.stop())};
 try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user',width:{ideal:960}},audio:false});$('#v').srcObject=stream}
 catch(e){$('#msg').textContent='Kamera tidak bisa dibuka. Izinkan akses kamera di browser, lalu buka ulang.';$('#go').disabled=true;return}
 $('#go').onclick=async()=>{
  $('#go').disabled=true;const v=$('#v'),shots=[];
  for(let i=0;i<4;i++){
   for(let n=3;n>0;n--){if(!$('#cd'))return;$('#cd').textContent=n;await wait(900)}
   if(!$('#cd'))return;$('#cd').textContent='';$('#fl').style.opacity=1;setTimeout(()=>{const f=$('#fl');if(f)f.style.opacity=0},120);
   const c=document.createElement('canvas');c.width=600;c.height=480;const cg=c.getContext('2d'),vw=v.videoWidth,vh=v.videoHeight,ra=5/4;let sw=vw,sht=vw/ra;if(sht>vh){sht=vh;sw=vh*ra}
   cg.translate(600,0);cg.scale(-1,1);cg.drawImage(v,(vw-sw)/2,(vh-sht)/2,sw,sht,0,0,600,480);shots.push(c);await wait(700);
  }
  const W=360,fw=312,fh=250,H=24+4*(fh+14)+80,s=document.createElement('canvas');s.width=W;s.height=H;const g=s.getContext('2d');
  R(g,'#9cc4f0',0,0,W,H);for(let y=0;y<H;y+=24)for(let x=(y/24%2)*12;x<W;x+=24)R(g,'#b9d6f6',x,y,6,6);
  shots.forEach((c,i)=>{const y=24+i*(fh+14);R(g,'#1f3a5f',20,y-4,fw+8,fh+8);g.drawImage(c,24,y,fw,fh)});
  g.fillStyle='#fff';g.strokeStyle='#3b7dd8';g.lineWidth=5;g.font='14px "Press Start 2P",monospace';g.textAlign='center';
  g.strokeText(CONFIG.boothFooter,W/2,H-38);g.fillText(CONFIG.boothFooter,W/2,H-38);
  const url=s.toDataURL('image/png');
  if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;onClose=null;
  mb.innerHTML=`<h2>your strip!</h2><img id="strip" src="${url}" alt="hasil foto"><div class="row"><a class="btn" style="text-decoration:none" download="photobooth.png" href="${url}">download</a><button class="btn" id="se">edit stiker</button><button class="btn alt" id="re">retake</button></div><p style="font-size:20px;margin-top:8px">di HP: kalau download tidak jalan, tahan lama gambarnya lalu pilih simpan.</p>`;
  $('#se').onclick=()=>edit(url);$('#re').onclick=booth;
 };
}
$('#booth').onclick=booth;
function edit(src){
 mb.innerHTML=`<h2>edit stiker</h2><div class="sw" id="sp" style="gap:6px"></div><canvas id="ec" style="max-width:100%;max-height:52vh;width:auto;height:auto;display:block;margin:0 auto;border:3px solid var(--ink);touch-action:manipulation"></canvas><p style="font-size:20px;margin-top:6px">pilih stiker, lalu tap di foto.</p><div class="row"><button class="btn alt" id="eu">undo</button><a class="btn" id="ed" style="text-decoration:none" download="photobooth-stiker.png">download</a></div>`;
 const cv=$('#ec'),g=cv.getContext('2d'),im=new Image(),P=[];let cur='heart';
 const paint=()=>{g.drawImage(im,0,0);P.forEach(p=>stk(g,p.n,p.x,p.y))};
 im.onload=()=>{cv.width=im.width;cv.height=im.height;paint()};im.src=src;
 Object.keys(ST).forEach(n=>{const b=document.createElement('button');b.style.cssText='border:3px solid var(--ink);background:#fff;padding:2px;cursor:pointer';b.appendChild(spr(ST[n],4));b.onclick=()=>cur=n;$('#sp').appendChild(b)});
 cv.onpointerdown=e=>{const r=cv.getBoundingClientRect();P.push({n:cur,x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height});paint()};
 $('#eu').onclick=()=>{P.pop();paint()};
 $('#ed').onclick=()=>{$('#ed').href=cv.toDataURL('image/png')};
}
}
const go=()=>{try{init()}catch(e){console.error(e);const d=document.createElement('div');d.textContent='extras.js error: '+e.message;d.style.cssText='position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:6px;font:12px monospace;z-index:99';document.body.appendChild(d)}};
document.readyState==='complete'?go():addEventListener('load',go);
})();