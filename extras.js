/* extras.js — taruh sefolder dengan index.html, lalu tambahkan SEBELUM </body>:
   <script src="extras.js"></script>
   Di CONFIG index.html ubah music:"" (radio menggantikan musik latar). */
(()=>{
/* ===== EDIT BAGIAN INI ===== */
const EX={
 radio:[{n:"lagu 1",src:"music.mp3"}, {n:"lagu 2",src:"music2.mp3"}, {n:"lagu 3",src:"music3.mp3"}, {n:"lagu 4",src:"music4.mp3"}], /* tambah {n:"nama",src:"file.mp3"} kalau sudah upload lagu lain */
 lock:{code:"2512",hint:"when r we meet?",msg:"Cie ultah ni yaa, selamat tambah dewasa. stop panggil aku plup meong zzz."},
bday:{d:7,m:11}, /* GANTI ke tanggal & bulan ultah Aqsa (contoh {d:25,m:12}). 0 = nonaktif. Dipakai kalender dinding: tanggal dilingkari hati + hitung mundur */
 gifts:[ /* kado di bawah meja, maksimal 3. c = warna kotak, r = warna pita, t = isi pesan */
  {c:"#e84a5f",r:"#f2c14e",t:"Kupon traktir boba. Berlaku seumur hidup, tagih langsung ya! (kamu yg traktir bukan aku)"},
  {c:"#4f8fe8",r:"#ffffff",t:"Kupon satu kali ketik yes kalau mau mabar, wkwkwk call me."},
  {c:"#a98bd6",r:"#f2c14e",t:"Kupon satu kali 'kamu yg ultah tp aku yg minta kado boleh ga? wkwk bercanda'."}
 ],
letter: {
  title: "Surat dari aku",
  body: "Halo Aqsa,\n\nSelamat ulang tahun yaa. Semoga di umur yang sekarang kamu selalu diberi kesehatan, kebahagiaan, dan kemudahan dalam segala hal. Semoga apa pun yang sedang kamu usahakan sekarang bisa berjalan dengan baik dan mendapatkan hasil yang kamu harapkan.\n\nSebenarnya aku agak bingung mau nulis apa, karena aku bukan orang yang pandai menyampaikan sesuatu lewat kata-kata. Tapi rasanya sayang kalau hari spesial seperti ini dilewatkan begitu saja tanpa ucapan. Jadi, aku mau menyempatkan diri buat menulis sedikit pesan ini untuk kamu.\n\nSemoga ke depannya banyak hal baik yang datang. Semoga kamu bisa ketemu banyak kesempatan baru, punya pengalaman menyenangkan, dan bisa mencapai hal-hal yang selama ini kamu inginkan. Kalau ternyata ada hari-hari yang tidak berjalan sesuai rencana, semoga kamu tetap bisa melewatinya dengan baik. Tidak semua hal harus selesai dalam satu waktu, jadi jangan terlalu membebani diri sendiri.\n\nAku juga berharap kamu selalu dikelilingi orang-orang yang baik dan bisa membuat hari-hari kamu jadi lebih menyenangkan. Tetap jadi diri sendiri, tetap lakukan hal-hal yang kamu suka, dan jangan lupa menikmati waktu yang kamu punya sekarang. Kadang kita terlalu sibuk memikirkan banyak hal sampai lupa kalau hal sederhana juga bisa jadi sesuatu yang menyenangkan.\n\nTerima kasih sudah jadi teman selama ini. Mungkin aku tidak selalu bisa mengungkapkan banyak hal secara langsung, tapi aku tetap menghargai pertemanan yang ada. Semoga ke depannya kita masih bisa berteman baik, berbagi cerita, dan punya lebih banyak kenangan menyenangkan.\n\nTerakhir, semoga semua doa baik yang kamu panjatkan bisa terkabul, satu per satu. Semoga tahun ini membawa lebih banyak hal yang bisa kamu syukuri dan lebih banyak alasan untuk tersenyum.\n\nSekali lagi, happy birthday, Aqsa. Semoga hari ini menyenangkan dan kamu bisa menikmati hari spesialmu dengan baik.\n\nHave a great year ahead! ♡\n\n— plup"
},
 memories:[
  {src:"image1.png",date:"April 2025",title:"hari itu, ultahnya mita",story:"Ramenya parah. Temen-temen Mita dateng banyak banget sampai susah ngitung, lampu-lampunya juga cakep. Plup seperti biasa cuma ngamatin dari pojok."},
  {src:"image5.png",date:"April 2025",title:"foto bareng, ultahnya mita",story:"Semua baris rapi di depan tembok, pose masing-masing. Ada yang kalem, ada yang tangannya naik, ada yang pura-pura kalem. Ramenya masih kerasa walau cuma satu barisan."},
  {src:"image6.png",date:"April 2025",title:"yang fotoin aqsa",story:"Kali ini Aqsa yang pegang kamera, jadi dia nggak ikut kefoto. Yang difoto malah kompak: ada yang tidur pake sleep mask, ada yang matanya muter-muter saking ngantuknya."},
  {src:"image2.png",date:"September 2025",title:"tiba-tiba dia foto",story:"Mereka lagi santai, nggak ada yang sadar. Tau-tau Aqsa udah motret diam-diam. Hasilnya malah bagus, jadi ya udah, dimaafin."},
  {src:"image3.png",date:"Agustus 2025",title:"belum naik, udah foto-foto",story:"Maca, Plup, Mita, sama Aqsa baru nyampe di bawah. Belum juga mulai mendaki, tapi udah sibuk foto duluan. Prioritasnya jelas."},
  {src:"image4.png",date:"Agustus 2025",title:"akhirnya sampai puncak",story:"Capek, tapi kelar juga. Berempat sampai di puncak, terus ada orang random yang tiba-tiba ikutan masuk foto. Nggak kenal, nggak ada yang ngundang, tapi ya udah, sekalian aja jadi bagian dari kenangan."}
 ]
};
/* =========================== */
window.EX_MEMORIES=EX.memories;
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
#lampBox #stickyBtn{left:auto;right:22px;bottom:auto;top:8px;transform:none;font-size:9px;padding:8px 9px}
#lampBox #stickyBtn:active{transform:translate(2px,2px)}
.hrt{position:absolute;pointer-events:none;animation:fup 1s ease-out forwards;z-index:6;image-rendering:pixelated}
@keyframes fup{to{transform:translateY(-42px);opacity:0}}
.bowl{position:absolute;left:96px;bottom:6px;border:0;background:none;padding:0;cursor:pointer;z-index:2}
.bowl canvas{display:block;image-rendering:pixelated}
#win{position:relative;width:66px;height:66px;border:5px solid var(--wood);box-shadow:3px 3px 0 var(--wood2);cursor:pointer;background:var(--wood)}
#win .sky{position:absolute;inset:0;overflow:hidden}
#win canvas{width:100%;height:100%;image-rendering:pixelated;display:block}
#win:before,#win:after{content:"";position:absolute;background:var(--wood);z-index:2}
#win:before{left:50%;top:0;bottom:0;width:4px;margin-left:-2px}
#win:after{top:50%;left:0;right:0;height:4px;margin-top:-2px}
#win .rain{position:absolute;inset:0;display:none;background:repeating-linear-gradient(100deg,transparent 0 6px,rgba(70,120,210,.85) 6px 7px);background-size:14px 14px;animation:rn .3s linear infinite}
#win .rain.on{display:block}
@keyframes rn{to{background-position:0 14px}}
#win .shoot{position:absolute;left:-10px;top:4px;width:8px;height:3px;background:#fff;opacity:0;box-shadow:-8px -3px 0 -1px rgba(255,255,255,.5)}
#win .shoot.go{animation:sht .9s linear}
@keyframes sht{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(70px,40px)}}
.nt{position:absolute;pointer-events:none;z-index:6;image-rendering:pixelated;animation:ntf 1.8s ease-out forwards}
@keyframes ntf{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}100%{opacity:0;transform:translate(var(--dx),-56px)}}
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
const sb=$('#stickyBtn');sb.textContent='+ sticky';lb.appendChild(sb);
function deco(side,cv,fn,label,off){const b=document.createElement('button');b.className='deco';b.style[side]=(off||8)+'px';b.setAttribute('aria-label',label);b.appendChild(cv);b.onclick=fn;fl.appendChild(b)}
deco('left',spr(AR,4),game,'game',58);
deco('left',spr(MB,4),letter,'surat dari developer');
const door=document.createElement('canvas');door.width=10;door.height=16;(g=>{R(g,'#1f3a5f',0,0,10,16);R(g,'#8a5a34',1,1,8,15);R(g,'#a8743f',2,2,6,5);R(g,'#a8743f',2,9,6,5);R(g,'#f2c14e',7,8,1,1)})(door.getContext('2d'));
door.style.cssText='width:40px;height:64px';
deco('right',door,mem,'pintu kenangan');
$('#mus').style.display='none';

/* ---- lampu: siang / malam berbintang ---- */
const stars=document.createElement('div');stars.id='stars';
for(let i=0;i<45;i++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*98}%;top:${Math.random()*95}%;animation-delay:${-Math.random()*2}s`;stars.appendChild(s)}
stars.appendChild(document.createElement('b'));$('#room').prepend(stars);
function lamp(){$('#room').classList.toggle('night');sky()}

/* ---- surat: efek ketik ---- */
let typ=0;
function letter(){
 const t=EX.letter.body;clearInterval(typ);
 page(EX.letter.title,'<div class="paper" id="lt"></div><p style="font-size:18px;opacity:.6;margin-top:8px">tap kertas untuk lewati</p>',()=>clearInterval(typ));
 const el=$('#lt');let i=0;
 el.onclick=()=>{clearInterval(typ);el.textContent=t};
 typ=setInterval(()=>{
  i++;el.textContent=t.slice(0,i)+(i<t.length?'\u258c':'');
  const ch=t[i-1];if(window.SFX&&ch!==' '&&ch!=='\n'&&i%2===0)SFX.type();
  if(i>=t.length)clearInterval(typ);
 },32);
}

/* ---- radio ---- */
const au=new Audio(),T=EX.radio;let ti=0,on=false;au.volume=.35;
function load(i){ti=(i+T.length)%T.length;au.src=T[ti].src}
function play(){if(!au.src)load(ti);au.play().then(()=>{on=true;ui()}).catch(()=>{on=false;ui()})}
function pause(){au.pause();on=false;ui()}
au.onended=()=>{load(ti+1);play()};au.onerror=()=>{if(T.length>1&&on){load(ti+1);play()}};
const rf=e=>{if(e.target.closest&&e.target.closest('#rdo'))return;removeEventListener('pointerdown',rf);if(!au.src&&T.length&&ls('bday-radio')!=='0')play()};addEventListener('pointerdown',rf);
const NT=[["...kk","...kk","...k.","...k.","kkk..","kkk..",".k..."],[".kkkkkk",".kkkkkk",".k...k.",".k...k.","kk..kk.","kk..kk."]];
let ntT=0;
function note(){
 const c='bryp'[Math.random()*4|0],m=NT[Math.random()*2|0].map(r=>r.replace(/k/g,c)),e=spr(m,3);
 e.className='nt';e.style.left=(6+Math.random()*22)+'px';e.style.bottom='calc(100% + 26px)';e.style.setProperty('--dx',(Math.random()*30-15)+'px');
 side.appendChild(e);setTimeout(()=>e.remove(),1900);
}
function ui(){if(on&&!ntT){note();ntT=setInterval(note,650)}else if(!on&&ntT){clearInterval(ntT);ntT=0}
 const rb=$('#rdo');if(rb)rb.textContent=on?'radio on':'radio off';const n=$('#np');if(!n)return;n.textContent=(on?'> ':'')+T[ti].n;$('#pp').textContent=on?'pause':'play';
 document.querySelectorAll('.tr').forEach((b,i)=>b.style.opacity=i===ti?1:.6)}
function radioUI(){
 if(!T.length)return openM('<h2>radio</h2><p>belum ada lagu.</p>');
 openM(`<h2>radio</h2><p id="np" style="margin-bottom:10px"></p><div class="row"><button class="btn" id="pv">&lt;&lt;</button><button class="btn alt" id="pp"></button><button class="btn" id="nx">&gt;&gt;</button></div><div class="row" style="flex-direction:column">${T.map((t,i)=>`<button class="btn tr" data-i="${i}">${esc(t.n)}</button>`).join('')}</div>`);
 $('#pv').onclick=()=>{load(ti-1);play()};$('#nx').onclick=()=>{load(ti+1);play()};
 $('#pp').onclick=()=>on?pause():play();
 document.querySelectorAll('.tr').forEach(b=>b.onclick=()=>{load(+b.dataset.i);play()});ui();
}

/* ---- tombol radio on/off (kiri dari tombol sfx) ---- */
const rdo=document.createElement('button');rdo.id='rdo';rdo.className='btn alt';rdo.textContent='radio off';
rdo.style.cssText='position:fixed;bottom:8px;right:108px;z-index:15;font-size:10px;padding:9px 10px';
rdo.onclick=()=>{if(!T.length)return;if(on){pause();ls('bday-radio','0')}else{ls('bday-radio','1');play()}};
document.body.appendChild(rdo);

/* ---- pesan terkunci (khusus yang tahu kode 4 angka) ---- */
function gift(){
 const L=EX.lock;
 openM(`<h2>pesan terkunci</h2><p>masukkan 4 angka untuk membuka.</p><input id="pin" inputmode="numeric" maxlength="4" placeholder="0000" style="width:100%"><p class="from">${esc(L.hint||'')}</p><div class="row"><button class="btn" id="pk">buka</button></div><p id="pe"></p>`);
 const check=()=>{if($('#pin').value===L.code)openM(`<h2>pesan untukmu</h2><p>${esc(L.msg)}</p>`);else $('#pe').textContent='kodenya salah, coba lagi'};
 $('#pk').onclick=check;$('#pin').onkeydown=e=>{if(e.key==='Enter')check()};
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
const gm=new Audio('game.mp3');gm.loop=true;gm.volume=.4;let resume=false;
function gStop(){gm.pause();gm.currentTime=0}
let run=false,raf=0;
function game(){
 const W=300,H=400;run=false;cancelAnimationFrame(raf);
 gStop();if(on){resume=true;pause()}
 page('tangkap balon',`<div style="max-width:340px;margin:0 auto"><canvas id="gc" width="${W}" height="${H}" style="width:100%;border:4px solid var(--ink);display:block;touch-action:none;image-rendering:pixelated"></canvas><div class="row" id="gr"><button class="btn" id="gs">start</button></div><p style="font-size:20px;margin-top:8px">skor 40+ = buka stiker baru di photo booth</p><div id="lb"></div></div>`,()=>{run=false;cancelAnimationFrame(raf);gStop();if(resume){resume=false;play()}});
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
  gStop();draw('selesai!');const nu=sc>=40&&!ls('bday-unlock');if(sc>=40)ls('bday-unlock','1');
  $('#gr').innerHTML=`<input id="gn" maxlength="14" placeholder="namamu" value="${esc(ls('bday-name')||'')}" style="flex:1"><button class="btn" id="gv">simpan ${sc}</button><button class="btn alt" id="ga">main lagi</button>`;
  $('#ga').onclick=game;if(nu)$('#gr').insertAdjacentHTML('beforeend','<p style="width:100%;font-size:20px">stiker baru terbuka! cek photo booth</p>');
  $('#gv').onclick=async()=>{const n=$('#gn').value.trim()||'anon';ls('bday-name',n);$('#gv').disabled=true;await save(n,sc);board()};
 }
 $('#gs').onclick=()=>{$('#gr').innerHTML='';run=true;last=performance.now();raf=requestAnimationFrame(loop);gm.currentTime=0;gm.play().catch(()=>{})};
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
Object.assign(ST,{moon:['..yyy','.yy..','yy...','.yy..','..yyy'],fish:['..bbbb..b','.bbbbbbbb','bbkbbbbbb','.bbbbbbbb','..bbbb..b'],ghost:['.ppppp.','ppppppp','pkpppkp','ppppppp','ppppppp','ppppppp','p.p.p.p']});
const BONUS=['moon','fish','ghost'];
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
 Object.keys(ST).forEach(n=>{const lk=BONUS.includes(n)&&!ls('bday-unlock'),b=document.createElement('button');b.style.cssText='border:3px solid var(--ink);background:#fff;padding:2px;cursor:pointer';lk?(b.textContent='?',b.style.cssText+=';opacity:.5;font:14px "Press Start 2P";width:40px;height:40px',b.title='main game, skor 40+'):(b.appendChild(spr(ST[n],4)),b.onclick=()=>cur=n);$('#sp').appendChild(b)});
 cv.onpointerdown=e=>{const r=cv.getBoundingClientRect();P.push({n:cur,x:(e.clientX-r.left)*cv.width/r.width,y:(e.clientY-r.top)*cv.height/r.height});paint()};
 $('#eu').onclick=()=>{P.pop();paint()};
 $('#ed').onclick=()=>{$('#ed').href=cv.toDataURL('image/png')};
}
/* ---- avatar Aqsa gaya chibi: tampak depan saat diam, tampak samping saat jalan ---- */
(function(){
 const old=$('#aqsa');if(!old)return;
 const FR=["....HHHHHHHH....", "..HHHHhhhHHHHH..", ".HHHhhHHHHHhHHH.", ".HHHHHHHHHHHHHH.", ".HHHHHHHHHHHHHH.", ".HHHkHHHHHHkHHH.", ".HHkkkHHHHkkkHH.", ".HHkkkkkkkkkkHH.", ".HkEEEkkkkEEEkH.", ".HkEeEkkkkEeEkH.", "..HrkkkkkkkkrH..", "...HkkkppkkkH...", "....HHkkkkHH....", ".....bbbbbb.....", "...bbbbbbbbbb...", "...bbWbWWbWbb...", "...bbbWWWWbbb...", "...kbbbbbbbbk...", "....BBBBBBBB....", "....wwwwwwww....", "....wwwwwwww....", "....www..www....", "....www..www....", "...gggg..gggg..."],TP=["....HHHHHHHH....", "..HHHHhhhHHHH...", ".HHHhhHHHHHHHH..", ".HHHHHHHHHHHHHH.", ".HHHHHHHHHHHHHH.", ".HHHHHHHHHHHkkH.", ".HHHHHHHHkkkkkH.", ".HHHHHHHkkkkkkH.", ".HHHHHHHkkkEEkk.", ".HHHHHHHkkkEekk.", ".HHHHHHHkkrkkkk.", "..HHHHHHkkkkpkk.", "...HHHHHHkkkkk..", "......bbbb......", ".....bbbbbb.....", ".....bbbWbb.....", ".....bbbbbb.....", null, ".....BBBBBB....."],HD=[".....bbbkbb.....", ".....bbbbbbk....", ".....bbbkbb.....", "....kbbbbbb....."],LG=[[".....wwwwww.....", ".....wwwwww.....", "......wwww......", "......wwww......", ".....gggggg....."], [".....wwwwww.....", ".....wwwwww.....", "....www..www....", "...www....www...", "..ggg.....gggg.."], [".....wwwwww.....", ".....wwwwww.....", "......wwww......", "......wwww......", ".....gggggg....."], [".....wwwwww.....", ".....wwwwww.....", "....www..www....", "...www....www...", "..gggg.....ggg.."]];
 const SD=LG.map((l,i)=>TP.slice(0,17).concat([HD[i],TP[18]],l));
 const HAIR={black:{H:'#2b2630',h:'#4d4660'},brown:{H:'#6b4429',h:'#8d5f3b'},white:{H:'#f2f5fc',h:'#c5cde3'}};
 const P=Object.assign({k:'#fbe0c8',E:'#1c2f78',e:'#4a86f0',W:'#ffffff',p:'#e07a8a',r:'#f4a6a6',b:'#1f78f0',B:'#1253c0',w:'#fcfcff',g:'#cdd5e8'},HAIR[CONFIG.hairColor]||HAIR.brown);
 const el=document.createElement('div');el.id='aqsa';el.setAttribute('role','img');el.setAttribute('aria-label','avatar Aqsa');
 el.innerHTML='<span class="tag px" id="tag">Aqsa</span><canvas id="avCv" width="16" height="24"></canvas>';
 old.replaceWith(el);
 const cv=$('#avCv'),g=cv.getContext('2d'),tag=$('#tag');
 const draw=f=>{g.clearRect(0,0,16,24);f.forEach((row,y)=>[...row].forEach((c,x)=>P[c]&&R(g,P[c],x,y,1,1)))};
 draw(FR);let say;
 el.onclick=()=>{tag.textContent=CONFIG.avatarSay||'hai!';clearTimeout(say);say=setTimeout(()=>tag.textContent='Aqsa',2200)};
 let x=70,dir=1,pause=0,t=0,fi=-1,last=performance.now();
 (function tick(){
  const now=performance.now();let dt=(now-last)/1000;if(!(dt>0))dt=0;if(dt>.1)dt=.1;last=now;const W=fl.clientWidth-80;
  if(pause>0){pause-=dt;if(fi!==-1){fi=-1;draw(FR)}}
  else{
   x+=dir*44*dt;t+=dt;const n=Math.floor(t*6)%4;if(n!==fi){fi=n;draw(SD[n])}
   if(x>=W){x=W;dir=-1;pause=1.2}else if(x<=0){x=0;dir=1;pause=1.2}
   else if(Math.random()<dt*.12)pause=1.4;
  }
  el.style.left=x+'px';cv.style.transform=(fi!==-1&&dir<0)?'scaleX(-1)':'';
  requestAnimationFrame(tick);
 })();
})();

/* ---- 1. kucing: dielus (klik beruntun) + mangkuk makan ---- */
(function(){
 const cat=$('#cat');if(!cat)return;
 const pos=()=>{const r=cat.getBoundingClientRect(),f=fl.getBoundingClientRect();return[r.left-f.left,r.top-f.top]};
 function tip(t){const[x,y]=pos(),b=document.createElement('div');b.className='tip';b.textContent=t;b.style.cssText=`left:${x}px;top:${y-60}px;z-index:7`;fl.appendChild(b);setTimeout(()=>b.remove(),1100)}
 function hearts(n){const[x,y]=pos();for(let i=0;i<n;i++){const h=spr(ST.heart,2);h.className='hrt';h.style.left=(x+8+Math.random()*34)+'px';h.style.top=(y-6-Math.random()*12)+'px';h.style.animationDelay=(i*.1)+'s';fl.appendChild(h);setTimeout(()=>h.remove(),1500)}}
 let cc=0,ct=0;
 cat.addEventListener('click',()=>{const n=Date.now();cc=n-ct<2000?cc+1:1;ct=n;hearts(1);if(cc>=3){cc=0;hearts(5);setTimeout(()=>tip('purr~'),120)}});
 const BW=["..nnnnn..",".nnnnnnn.","kkkkkkkkk",".kbbbbbk.","..kkkkk.."];
 const bw=document.createElement('button');bw.className='bowl';bw.setAttribute('aria-label','beri makan kucing');bw.appendChild(spr(BW,4));fl.appendChild(bw);
 let fed=0;
 bw.onclick=()=>{
  const c=cat.querySelector('canvas');c.classList.add('hop');setTimeout(()=>c.classList.remove('hop'),740);
  fed++;if(fed>=5){fed=0;tip('kenyang zzz');hearts(6)}else{tip('nyam~');hearts(3)}
 };
})();

/* ---- 6. jendela cuaca: siang = klik untuk hujan, malam = klik untuk bintang jatuh ---- */
const fr=$('#frames');fr.innerHTML='';
const win=document.createElement('div');win.id='win';win.setAttribute('aria-label','jendela');
win.innerHTML='<div class="sky"><canvas width="14" height="14"></canvas><i class="rain"></i><i class="shoot"></i></div>';fr.appendChild(win);
const wg=win.querySelector('canvas').getContext('2d');
function sky(){
 const n=$('#room').classList.contains('night');R(wg,n?'#141f4a':'#8fd0f0',0,0,14,14);
 if(n){R(wg,'#fff6c8',9,2,3,4);R(wg,'#141f4a',10,2,2,3);[[2,2],[5,6],[3,10],[11,9],[7,12],[6,1]].forEach(([x,y])=>R(wg,'#fff',x,y,1,1))}
 else{R(wg,'#f2c14e',10,2,2,2);R(wg,'#fff',2,5,6,2);R(wg,'#fff',3,4,3,1);R(wg,'#fff',8,9,4,2)}
}
sky();
let rnT=0;
win.onclick=()=>{
 if($('#room').classList.contains('night')){
  const s=win.querySelector('.shoot');s.classList.remove('go');void s.offsetWidth;s.classList.add('go');
  const t=document.createElement('div');t.className='tip';t.textContent='make a wish~';t.style.cssText='left:50%;top:-26px;transform:translateX(-50%);z-index:7';win.appendChild(t);setTimeout(()=>t.remove(),1500);
 }else{const r=win.querySelector('.rain');r.classList.add('on');clearTimeout(rnT);rnT=setTimeout(()=>r.classList.remove('on'),4000)}
};

/* ============ DEKOR TAMBAHAN ============ */
const css2=document.createElement('style');css2.textContent=`
.frames{align-items:center}
.fw{flex:none;position:relative;z-index:1;border:0;background:none;padding:0;cursor:pointer}
.fw canvas{display:block;image-rendering:pixelated}
.fw:hover{filter:brightness(1.12)}
#garland{position:absolute;left:0;top:100%;margin-top:-6px;width:100%;height:auto;image-rendering:pixelated;pointer-events:none}
#lights{position:absolute;inset:0;pointer-events:none;display:none}
#room.night #lights{display:block}
#lights b{position:absolute;width:3px;height:3px;background:#0b1130}
#lights i{position:absolute;width:6px;height:8px;margin-left:-2px;animation:lbk 1.2s steps(1) infinite}
@keyframes lbk{0%{opacity:1}50%{opacity:.35}}
#rug{position:absolute;left:50%;bottom:10px;width:min(290px,78%);height:auto;transform:translateX(-50%);image-rendering:pixelated;pointer-events:none}
.gf{position:absolute;bottom:14px;border:0;background:none;padding:0;cursor:pointer;z-index:1}
.gf canvas{display:block;image-rendering:pixelated}
.gf:hover{filter:brightness(1.15)}
.gf.pop canvas{animation:gpp .4s steps(4)}
@keyframes gpp{50%{transform:translateY(-10px)}}
.yarn{position:absolute;left:calc(50% - 125px);bottom:10px;border:0;background:none;padding:0;cursor:pointer;z-index:1}
.yarn canvas{display:block;image-rendering:pixelated}
.yarn.hp canvas{animation:yhp .8s steps(8)}
@keyframes yhp{40%{transform:translateY(-26px) rotate(180deg)}100%{transform:translateY(0) rotate(360deg)}}
.bed{position:absolute;right:14px;bottom:8px;border:0;background:none;padding:0;cursor:pointer;z-index:1}
.bed canvas{display:block;image-rendering:pixelated}
.bed .sl,.bed .zb{display:none;position:absolute}
.bed .sl{left:10px;bottom:8px}
.bed .zb{right:2px;top:-18px;font:8px 'Press Start 2P',monospace;font-style:normal;color:var(--ink);animation:zbb 2s ease-in infinite}
@keyframes zbb{from{transform:translate(0,0);opacity:1}to{transform:translate(8px,-12px);opacity:0}}
.bed.zz .sl,.bed.zz .zb{display:block}
.mug{position:absolute;left:calc(50% - 92px);bottom:80px;border:0;background:none;padding:0;cursor:pointer;z-index:2}
.mug canvas{display:block;image-rendering:pixelated}
.mug i{position:absolute;bottom:100%;width:3px;height:3px;background:#f3f8ff;box-shadow:0 0 0 1px rgba(31,58,95,.35);opacity:0;animation:stmm 2s linear infinite;pointer-events:none}
@keyframes stmm{0%{opacity:0;transform:translate(0,0)}25%{opacity:.95}100%{opacity:0;transform:translate(var(--sx),-24px)}}
@media(max-width:520px){.mug{left:calc(50% - 80px)}.mug canvas{width:18px!important;height:14px!important}}
.deco.plant canvas{transform-origin:50% 100%;animation:swy 3.2s ease-in-out infinite alternate}
@keyframes swy{from{transform:skewX(-2deg)}to{transform:skewX(2deg)}}
.dr{position:absolute;top:-22px;width:3px;height:6px;background:#4f8fe8;animation:drp .8s ease-in forwards;pointer-events:none}
@keyframes drp{to{transform:translateY(34px);opacity:0}}
.cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;font-size:22px}
.cal em{font:8px 'Press Start 2P',monospace;font-style:normal;opacity:.7;padding:4px 0}
.cal b{font-weight:400;padding:6px 0;border:3px solid transparent;position:relative;isolation:isolate}
.cal b.td{border-color:var(--hot);background:#e3efff}
.cal b.bd{color:#e84a5f}
.cal b.bd:before{content:'\\2661';position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:40px;opacity:.35;z-index:-1}
#main{flex:none;min-height:100%;display:flex;flex-direction:column;position:relative}
#main #wall{flex:1 1 110px;min-height:110px}
`;document.head.appendChild(css2);
const sfx=n=>{try{window.SFX&&SFX[n]&&SFX[n]()}catch(e){}};
const ft=(t,x,y)=>{const b=document.createElement('div');b.className='tip';b.textContent=t;b.style.cssText=`left:${x}px;top:${y}px;z-index:7`;fl.appendChild(b);setTimeout(()=>b.remove(),1300)};
const wtip=(el,t)=>{const rm=$('#room'),r=el.getBoundingClientRect(),q=rm.getBoundingClientRect(),b=document.createElement('div');b.className='tip';b.textContent=t;b.style.cssText=`left:${r.left-q.left}px;top:${r.bottom-q.top+rm.scrollTop+4}px;z-index:7`;rm.appendChild(b);setTimeout(()=>b.remove(),1500)};

/* ---- garland bendera di dinding ---- */
(function(){
 const c=document.createElement('canvas');c.id='garland';c.width=192;c.height=14;const g=c.getContext('2d');
 const FC=['#e84a5f','#f2c14e','#8fd0f0','#a98bd6','#8fd18a','#f4a6c0'];
 const ry=x=>Math.round(1+5*Math.sin(Math.PI*((x/192*6)%1)));
 for(let x=0;x<192;x++)R(g,'#1f3a5f',x,ry(x),1,1);
 for(let k=0,x=3;x<188;x+=8,k++){const y=ry(x+3)+1,col=FC[k%6];R(g,col,x,y,7,1);R(g,col,x+1,y+1,5,1);R(g,col,x+2,y+2,3,1);R(g,col,x+3,y+3,1,1)}
 $('#top').appendChild(c);
})();

/* ---- lampu string (hanya menyala saat malam) ---- */
(function(){
 const w=$('#wain'),L=document.createElement('div');L.id='lights';
 const CL=['#f2c14e','#e84a5f','#8fd0f0','#f4a6c0','#8fd18a'];
 for(let k=0;k<=96;k++){const u=k/96,y=2+10*Math.sin(Math.PI*((u*6)%1)),b=document.createElement('b');b.style.cssText=`left:${u*100}%;top:${y}px`;L.appendChild(b)}
 let n=0;
 for(let j=0;j<6;j++)[.2,.5,.8].forEach(f=>{
  const u=(j+f)/6,y=2+10*Math.sin(Math.PI*f),col=CL[n%5],i=document.createElement('i');
  i.style.cssText=`left:${u*100}%;top:${y+2}px;background:${col};box-shadow:0 0 8px 2px ${col};animation-delay:${n%2?-.6:0}s`;L.appendChild(i);n++;
 });
 w.appendChild(L);
})();

/* ---- karpet bulat ---- */
(function(){
 const c=document.createElement('canvas');c.id='rug';c.width=48;c.height=10;const g=c.getContext('2d');
 for(let y=0;y<10;y++)for(let x=0;x<48;x++){
  const d=Math.pow((x-23.5)/24,2)+Math.pow((y-4.5)/5,2);if(d>1)continue;
  R(g,d>.86?'#1f3a5f':d>.7?'#4f8fe8':d>.52?'#f3f8ff':d>.3?'#a98bd6':'#f2c14e',x,y,1,1);
 }
 fl.insertBefore(c,$('#booth'));
})();

/* ---- jam dinding + kalender (di samping jendela) ---- */
const clk=document.createElement('button');clk.className='fw';clk.setAttribute('aria-label','jam dinding');
const cc2=document.createElement('canvas');cc2.width=17;cc2.height=17;cc2.style.cssText='width:51px;height:51px';clk.appendChild(cc2);
const cg2=cc2.getContext('2d');
function clockDraw(){
 cg2.clearRect(0,0,17,17);const c=8,d=new Date(),m=d.getMinutes(),h=(d.getHours()%12)+m/60;
 for(let y=0;y<17;y++)for(let x=0;x<17;x++){const r=Math.hypot(x-c,y-c);if(r<=8.3)R(cg2,r>7.1?'#1f3a5f':'#f3f8ff',x,y,1,1)}
 [[8,2],[8,14],[2,8],[14,8]].forEach(([x,y])=>R(cg2,'#4f7fb8',x,y,1,1));
 const hand=(a,l,col)=>{for(let t=0;t<=l;t+=.5)R(cg2,col,Math.round(c+Math.sin(a)*t),Math.round(c-Math.cos(a)*t),1,1)};
 hand(m/60*2*Math.PI,5.5,'#1f3a5f');hand(h/12*2*Math.PI,3.5,'#e84a5f');R(cg2,'#1f3a5f',c,c,1,1);
}
clockDraw();setInterval(clockDraw,15000);
clk.onclick=()=>{const d=new Date(),t=d.toTimeString().slice(0,5);sfx('click');wtip(clk,(d.getHours()>=22||d.getHours()<5)?t+' udah malam, tidur~':t)};
const DG={0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111'],4:['101','101','111','001','001'],5:['111','100','111','001','111'],6:['111','100','111','101','111'],7:['111','001','001','010','010'],8:['111','101','111','101','111'],9:['111','101','111','001','111']};
const cal=document.createElement('button');cal.className='fw';cal.setAttribute('aria-label','kalender');
const kc=document.createElement('canvas');kc.width=14;kc.height=17;kc.style.cssText='width:42px;height:51px';cal.appendChild(kc);
const isBday=d=>{const B=EX.bday||{};return B.d>0&&B.m>0&&B.d===d.getDate()&&B.m===d.getMonth()+1};
function calDraw(){
 const g=kc.getContext('2d'),d=new Date();g.clearRect(0,0,14,17);
 R(g,'#1f3a5f',0,1,14,16);R(g,'#f3f8ff',1,5,12,11);R(g,'#e84a5f',1,2,12,3);R(g,'#1f3a5f',3,0,1,3);R(g,'#1f3a5f',10,0,1,3);
 const col=isBday(d)?'#e84a5f':'#1f3a5f';
 [...String(d.getDate()).padStart(2,'0')].forEach((ch,i)=>DG[+ch].forEach((row,y)=>[...row].forEach((v,x)=>v==='1'&&R(g,col,3+i*4+x,8+y,1,1))));
}
calDraw();setInterval(calDraw,60000);
function calOpen(){
 const d=new Date(),y=d.getFullYear(),m=d.getMonth(),B=EX.bday||{},hasB=B.d>0&&B.m>0;
 const MN=['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
 const fd=new Date(y,m,1).getDay(),nd=new Date(y,m+1,0).getDate();
 let h=['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(x=>`<em>${x}</em>`).join('')+'<i></i>'.repeat(fd);
 for(let k=1;k<=nd;k++)h+=`<b class="${hasB&&B.m===m+1&&B.d===k?'bd':''} ${k===d.getDate()?'td':''}">${k}</b>`;
 let note='';
 if(hasB){const t0=new Date(y,m,d.getDate());let nx=new Date(y,B.m-1,B.d);if(nx<t0)nx=new Date(y+1,B.m-1,B.d);const n=Math.round((nx-t0)/864e5);
  note=n===0?'hari ini ulang tahunmu! \u2661':`ulang tahun ${B.d} ${MN[B.m-1]}: ${n} hari lagi \u2661`}
 openM(`<h2>${MN[m]} ${y}</h2><div class="cal">${h}</div><p class="from">${note}</p>`);
 if(hasB&&isBday(d))confetti();
}
cal.onclick=()=>{sfx('click');calOpen()};
fr.insertBefore(clk,win);fr.appendChild(cal);

/* ---- kado di bawah meja ---- */
function giftCv(c,r,open){
 const k=document.createElement('canvas');k.width=11;k.height=11;const g=k.getContext('2d'),K='#1f3a5f';
 R(g,K,1,6,9,5);R(g,c,2,7,7,3);R(g,r,5,7,1,3);
 if(!open){R(g,K,0,3,11,3);R(g,c,1,4,9,1);R(g,r,5,3,1,3);R(g,r,3,1,2,2);R(g,r,6,1,2,2)}
 else{R(g,K,5,0,6,2);R(g,c,6,1,4,1);R(g,'#f2c14e',1,2,1,1);R(g,'#fff',3,1,1,1);R(g,'#8fd0f0',2,4,1,1);R(g,K,2,6,7,1)}
 k.style.cssText='width:33px;height:33px';return k;
}
let gdone=[];try{gdone=JSON.parse(ls('bday-gifts')||'[]')}catch(e){}
(EX.gifts||[]).slice(0,3).forEach((G,i)=>{
 const b=document.createElement('button');b.className='gf';b.style.left=`calc(50% + ${[-70,-30,10][i]}px)`;b.setAttribute('aria-label','kado '+(i+1));
 const paint=o=>{b.innerHTML='';b.appendChild(giftCv(G.c,G.r,!!o))};paint(false);
 b.onclick=()=>{
  const first=!gdone.includes(i);
  if(first){gdone.push(i);ls('bday-gifts',JSON.stringify(gdone));confetti()}
  paint(true);
  b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');sfx('pop');
  openM(`<h2>kado ${i+1}</h2><p>${esc(G.t)}</p>`);onClose=()=>paint(false);
 };
 fl.appendChild(b);
});

/* ---- piringan hitam (muter saat radio on, klik = radio on/off) ---- */
const rc=document.createElement('canvas');rc.width=14;rc.height=11;rc.style.cssText='width:56px;height:44px';
const rg=rc.getContext('2d'),ORB=[[4,2],[9,2],[9,4],[4,4]];let rf2=0;
function recDraw(){
 const K='#1f3a5f';rg.clearRect(0,0,14,11);
 R(rg,K,0,6,14,5);R(rg,'#4f7fb8',1,7,12,3);R(rg,'#f2c14e',10,8,2,1);R(rg,'#8fd0f0',2,8,4,1);
 R(rg,K,3,1,8,1);R(rg,K,2,2,10,3);R(rg,K,3,5,8,1);R(rg,'#3b3446',3,2,8,3);R(rg,'#e84a5f',6,3,2,1);
 const o=ORB[rf2];R(rg,'#8fd0f0',o[0],o[1],1,1);
 if(on){R(rg,'#fff',12,0,1,1);R(rg,'#fff',11,1,1,1);R(rg,'#fff',10,2,1,1)}else R(rg,'#fff',13,0,1,4);
}
recDraw();setInterval(()=>{if(on)rf2=(rf2+1)%4;recDraw()},220);
deco('left',rc,()=>rdo.click(),'piringan hitam',108);

/* ---- tanaman pot (siram 3x = berbunga) ---- */
let wat=+(ls('bday-plant')||0)||0;
const pc=document.createElement('canvas');pc.width=11;pc.height=15;pc.style.cssText='width:44px;height:60px';
const pg2=pc.getContext('2d');
function plantDraw(){
 const K='#1f3a5f';pg2.clearRect(0,0,11,15);
 R(pg2,'#4fa05a',5,5,1,5);R(pg2,'#8fd18a',2,6,3,2);R(pg2,'#8fd18a',1,5,2,1);R(pg2,'#8fd18a',6,4,3,2);R(pg2,'#8fd18a',8,3,2,1);R(pg2,'#8fd18a',4,3,3,2);
 if(wat>=3){R(pg2,'#f4a6c0',4,0,3,3);R(pg2,'#f2c14e',5,1,1,1)}else R(pg2,'#8fd18a',5,2,1,1);
 R(pg2,'#4a3328',1,9,9,1);R(pg2,K,0,10,11,2);R(pg2,'#c98b52',1,10,9,1);R(pg2,K,1,12,9,3);R(pg2,'#c98b52',2,12,7,2);R(pg2,'#a8743f',2,13,7,1);
}
plantDraw();
deco('right',pc,()=>{
 const pb=pc.parentNode;
 for(let i=0;i<4;i++){const d=document.createElement('i');d.className='dr';d.style.left=(6+Math.random()*30)+'px';d.style.animationDelay=(i*.12)+'s';pb.appendChild(d);setTimeout(()=>d.remove(),1100)}
 const was=wat<3;wat=Math.min(3,wat+1);ls('bday-plant',String(wat));plantDraw();sfx('pop');
 const x=pb.getBoundingClientRect().left-fl.getBoundingClientRect().left;
 ft(was&&wat===3?'mekar~':'glug~',x-4,-86);
},'tanaman',56);
pc.parentNode.classList.add('plant');

/* ---- cangkir kopi/teh dengan uap (klik = ganti isi) ---- */
(function(){
 const MG=['kkkkkk..','knnnnk..','kWWWWkkk','kWWWWk.k','kWWWWkkk','kkkkkk..'];
 const b=document.createElement('button');b.className='mug';b.setAttribute('aria-label','cangkir');
 let tea=false;
 const paint=()=>{b.innerHTML='';b.appendChild(spr(MG.map(r=>r.replace(/n/g,tea?'g':'d')),3));[3,9,15].forEach((x,i)=>{const s=document.createElement('i');s.style.cssText=`left:${x}px;--sx:${[-3,0,3][i]}px;animation-delay:${-i*.65}s`;b.appendChild(s)})};
 paint();
 b.onclick=()=>{tea=!tea;paint();sfx('pop');ft(tea?'teh~':'kopi~',b.offsetLeft-6,b.offsetTop-30)};
 fl.appendChild(b);
})();

/* ---- kucing: bola benang (dikejar) + bantal (tidur siang) ---- */
const catEl=$('#cat');let busy=false,sleepT=0;
const catVisible=()=>!!catEl&&getComputedStyle(catEl).display!=='none';
function catRun(tx,done){
 const cur=catEl.getBoundingClientRect().left-fl.getBoundingClientRect().left;
 tx=Math.max(0,Math.min(fl.clientWidth-60,tx));
 catEl.style.animation='none';catEl.style.left=cur+'px';catEl.style.transform=tx<cur?'scaleX(-1)':'scaleX(1)';
 void catEl.offsetWidth;
 const d=Math.max(.3,Math.abs(tx-cur)/160);
 catEl.style.transition='left '+d+'s linear';catEl.style.left=tx+'px';
 setTimeout(done,d*1000+60);
}
function catResume(x){
 const p=Math.max(2,Math.min(82,x/fl.clientWidth*100)),t=(p-2)/80*.49*18;
 catEl.style.transition='';catEl.style.left='';catEl.style.transform='';catEl.style.animation='';catEl.style.animationDelay='-'+t.toFixed(2)+'s';
 busy=false;
}
const YB=['..kkkk..','.kppppk.','kpkppkpk','kppkpkpk','kpkppkpk','.kppppk.','..kkkk..'];
const yarn=document.createElement('button');yarn.className='yarn';yarn.setAttribute('aria-label','bola benang');yarn.appendChild(spr(YB,4));fl.appendChild(yarn);
yarn.onclick=()=>{
 yarn.classList.remove('hp');void yarn.offsetWidth;yarn.classList.add('hp');sfx('pop');
 const yx=yarn.offsetLeft,ty=fl.clientHeight-80;
 if(busy)return ft('shh, kucing tidur',yx-10,ty);
 if(!catVisible())return ft('kucing lagi tidur',yx-10,ty);
 busy=true;
 catRun(yx-34,()=>{catEl.click();setTimeout(()=>catResume(yx-34),2200)});
};
const BD=['.kkkkkkkkkkkk.','kbbbbbbbbbbbbk','kbWbbbbbbbbWbk','kbbbbbbbbbbbbk','.kkkkkkkkkkkk.'];
const bed=document.createElement('button');bed.className='bed';bed.setAttribute('aria-label','bantal kucing');bed.appendChild(spr(BD,4));
const slc=document.createElement('canvas');slc.width=12;slc.height=6;slc.className='sl';slc.style.cssText='width:36px;height:18px';
(g=>{const CP={c:'#f0dcc0',d:'#4a3328',k:'#1f3a5f'};['..d.d.......','.ccccc..dd..','.ckkccccddd.','cccccccccdd.','.cccccccccc.','..dddddddd..'].forEach((r,y)=>[...r].forEach((ch,x)=>CP[ch]&&R(g,CP[ch],x,y,1,1)))})(slc.getContext('2d'));
bed.appendChild(slc);bed.insertAdjacentHTML('beforeend','<i class="zb">z</i>');fl.appendChild(bed);
function wake(){clearTimeout(sleepT);if(!bed.classList.contains('zz'))return;bed.classList.remove('zz');catEl.style.visibility='';catResume(bed.offsetLeft+8)}
function goBed(auto){
 if(busy)return;
 if(!catVisible()){if(!auto)ft('kucing lagi tidur di sofa',bed.offsetLeft-40,fl.clientHeight-70);return}
 busy=true;
 catRun(bed.offsetLeft+8,()=>{catEl.style.visibility='hidden';bed.classList.add('zz');sleepT=setTimeout(wake,10000+Math.random()*6000)});
}
bed.onclick=()=>{if(bed.classList.contains('zz')){wake();catEl.click()}else goBed(false)};
setInterval(()=>{if(!document.hidden&&Math.random()<.5)goBed(true)},30000);

/* ---- ruang utama pas 1 layar; lounge ada di bawahnya (scroll cuma untuk ke lounge) ---- */
(function(){
 const rm=$('#room');if($('#main'))return;
 const mn=document.createElement('div');mn.id='main';
 [...rm.children].filter(c=>c.id!=='lounge').forEach(c=>mn.appendChild(c));
 rm.insertBefore(mn,$('#lounge'));
})();

}
const go=()=>{try{init()}catch(e){console.error(e);const d=document.createElement('div');d.textContent='extras.js error: '+e.message;d.style.cssText='position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:6px;font:12px monospace;z-index:99';document.body.appendChild(d)}};
document.readyState==='complete'?go():addEventListener('load',go);
})();