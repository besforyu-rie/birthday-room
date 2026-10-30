/* shelf.js — taruh sefolder dengan index.html, tambahkan SETELAH visitors.js:
   <script src="shelf.js"></script>
   Isi: rak buku (pembaca berhalaman), jurnal harian, telepon jadul (voice note).
   Teks buku diambil dari file .txt di folder yang sama (lihat BOOKS). */
(()=>{
/* ===== EDIT BAGIAN INI ===== */
const BDAY={d:7,m:11}; /* samakan dengan EX.bday di extras.js */
const BOOKS=[
 {id:'holmes',title:'The Blue Carbuncle',by:'A. Conan Doyle',src:'holmes.txt',c:'#e84a5f'},
 {id:'prince',title:'The Happy Prince',by:'Oscar Wilde',src:'prince.txt',c:'#4f8fe8'},
 {id:'kita',title:'4 Manusia Ini Ketemu dari Mana Sih?',by:'plup',src:'kita.txt',c:'#a98bd6'}
];
/* jurnal: urut dari paling awal sampai hari H. Entri terakhir = tanggal BDAY, sebelumnya mundur 1 hari per entri */
const JOURNAL=[
 "H-7. Seminggu lagi. Mulai sekarang boleh deg-degan, tapi sedikit saja ya.",
 "H-6. Sudah lihat kalender hari ini? Tanggalnya makin dekat tuh.",
 "H-5. Fakta random: kucing di ruangan ini diam-diam tahu kapan kamu ultah. Dia cuma pura-pura cuek.",
 "H-4. Kalau hari ini capek, istirahat dulu. Boleh berhenti sebentar, nanti lanjut lagi.",
 "H-3. Tiga hari lagi. Tanaman di pojok minta disiram, jangan lupa ya.",
 "H-2. Lusa. Kupon kadonya sudah kusimpan baik-baik, jangan kabur.",
 "H-1. Besok kamu bertambah umur. Malam ini tidur cukup, jangan begadang main game.",
 "Hari H! Selamat ulang tahun, Aqsa. Jangan lupa buka kado di bawah meja ya."
];
/* voice note telepon: dibacakan berurutan, ulang dari awal kalau habis */
const VOICE=[
 "Halo? Ini plup. Aku cuma mau bilang: kuenya di ruangan ini tetap tidak bisa dimakan. Bye.",
 "Pesan otomatis: nomor yang Anda tuju sedang sibuk berulang tahun. Silakan ucapkan selamat setelah nada ini. Tuut.",
 "Psst. Ada yang bilang kamu makin tua. Itu bohong. Kamu cuma naik level.",
 "Reminder dari aku: minum air putih, bukan cuma boba.",
 "Mabar nanti ya? Aku siap. Tidak janji menang.",
 "Maaf, salah sambung. Eh, ternyata benar. Halo Aqsa."
];
/* =========================== */
const ls=(k,v)=>{try{return v==null?localStorage.getItem(k):localStorage.setItem(k,v)}catch(e){}};
const sfx=n=>{try{window.SFX&&SFX[n]&&SFX[n]()}catch(e){}};
const MN=['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const PAL={k:'#1f3a5f',d:'#a8743f',m:'#5a3b22',r:'#e84a5f',b:'#4f8fe8',g:'#8fd18a',y:'#f2c14e',v:'#a98bd6',p:'#f4a6c0',W:'#fff'};
function spr(m,s){const c=document.createElement('canvas');c.width=m[0].length;c.height=m.length;c.style.width=c.width*s+'px';c.style.height=c.height*s+'px';const g=c.getContext('2d');m.forEach((r,y)=>[...r].forEach((ch,x)=>PAL[ch]&&R(g,PAL[ch],x,y,1,1)));return c}

const SHELF=["kkkkkkkkkkkk","kmbmymvmrmbk","krbgyvvrbpgk","krbgyvvrbpgk","kddddddddddk","kmmvmrmgmbmk","kyvrbgyvrbpk","kyvrbgyvrbpk","kddddddddddk","kmymmbmmrmgk","kgrvyrbgypbk","kgrvyrbgypbk","kddddddddddk","kkkkkkkkkkkk","kdk......kdk","kdk......kdk"];
const PHONE=["kkkkkkkkkkkk","krrrrrrrrrrk","kk........kk",".kkkkkkkkkk.","krrrWWWWrrrk","krrWkkkkWrrk","krrWkkkkWrrk","krrrWWWWrrrk","kkkkkkkkkkkk","kkkkkkkkkkkk"];

function init(){
const fl=$('#floor');if(!fl)return;
const css=document.createElement('style');css.textContent=`
.deco.ring canvas{animation:rng .12s steps(2) 6}
@keyframes rng{to{transform:translate(2px,-2px) rotate(3deg)}}
.bkp{min-height:50vh}
#bkn{font:10px 'Press Start 2P',monospace}
`;document.head.appendChild(css);
function deco(side,cv,fn,label,off){const b=document.createElement('button');b.className='deco';b.style[side]=off+'px';b.setAttribute('aria-label',label);b.appendChild(cv);b.onclick=fn;fl.appendChild(b);return b}

/* ---- rak buku ---- */
deco('left',spr(SHELF,4),shelf,'rak buku',170);
function shelf(){
 sfx('click');
 openM(`<h2>rak buku</h2><p class="from">pilih buku</p><div class="row" style="flex-direction:column">${BOOKS.map((b,i)=>{
  const p=+ls('bday-book-'+b.id)||0,dn=ls('bday-read-'+b.id)==='1';
  return `<button class="btn bk" data-i="${i}" style="border-left:12px solid ${b.c};text-align:left">${esc(b.title)}<br><small style="font-size:18px;opacity:.7">${esc(b.by)}${dn?' · tamat':p?' · lanjut hal '+(p+1):''}</small></button>`}).join('')}<button class="btn alt" id="jr">jurnal harian</button></div>`);
 mb.querySelectorAll('.bk').forEach(b=>b.onclick=()=>read(BOOKS[+b.dataset.i]));
 $('#jr').onclick=journal;
}

/* ---- pembaca berhalaman (pakai overlay #pg milik extras.js) ---- */
const cache={};
function paginate(raw){
 const ps=raw.replace(/\r/g,'').replace(/_/g,'').split(/\n\s*\n/).map(p=>p.replace(/\s*\n\s*/g,' ').trim()).filter(Boolean);
 const out=[];let cur='';const push=()=>{if(cur){out.push(cur);cur=''}};
 ps.forEach(p=>{
  if(p.length>1200){push();(p.match(/[^.!?]+[.!?”"]*\s*/g)||[p]).forEach(s=>{if(cur.length+s.length>900)push();cur+=s});push();return}
  if(cur&&cur.length+p.length>900)push();
  cur+=(cur?'\n\n':'')+p;
 });
 push();return out;
}
async function load(b){
 if(cache[b.id])return cache[b.id];
 let raw=b.text;
 if(raw==null){const r=await fetch(b.src);if(!r.ok)throw new Error(r.status);raw=await r.text()}
 return cache[b.id]=paginate(raw);
}
let cur=null;
async function read(b){
 const pg=$('#pg');if(!pg){closeM();return}
 closeM();
 $('#pgt').textContent=b.title;$('#pgb').innerHTML='<p>membuka buku...</p>';pg.className='on r2';
 let pages;
 try{pages=await load(b)}
 catch(e){$('#pgb').innerHTML='<p>teksnya belum bisa dibuka. pastikan file '+esc(b.src||'')+' ada di folder yang sama dan web dijalankan lewat server (bukan file://).</p>';return}
 let i=Math.min(Math.max(0,+ls('bday-book-'+b.id)||0),pages.length-1);
 $('#pgb').innerHTML='<div class="paper bkp" id="bkp"></div><div class="row" style="margin-top:12px;align-items:center;justify-content:center"><button class="btn" id="bp">&lt;</button><span id="bkn"></span><button class="btn alt" id="bx">&gt;</button></div>';
 const show=k=>{
  i=Math.max(0,Math.min(pages.length-1,k));
  $('#bkp').textContent=pages[i];$('#bkn').textContent=(i+1)+' / '+pages.length;
  $('#pgb').scrollTop=0;ls('bday-book-'+b.id,String(i));
  if(i===pages.length-1&&ls('bday-read-'+b.id)!=='1'){ls('bday-read-'+b.id,'1');try{confetti()}catch(e){}}
 };
 const go=d=>{if(i+d<0||i+d>=pages.length)return;sfx('click');show(i+d)};
 $('#bp').onclick=()=>go(-1);$('#bx').onclick=()=>go(1);
 let tx=0;const pp=$('#bkp');
 pp.ontouchstart=e=>{tx=e.touches[0].clientX};
 pp.ontouchend=e=>{const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>50)go(dx<0?1:-1)};
 cur={go};show(i);
}
addEventListener('keydown',e=>{const pg=$('#pg');if(!cur||!pg||!pg.classList.contains('on')||!$('#bkp'))return;if(e.key==='ArrowRight')cur.go(1);else if(e.key==='ArrowLeft')cur.go(-1)});

/* ---- jurnal harian ---- */
function journal(){
 const now=new Date(),t0=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(t0.getFullYear(),BDAY.m-1,BDAY.d),n=JOURNAL.length;
 const rows=JOURNAL.map((t,i)=>{const d=new Date(end.getTime());d.setDate(end.getDate()-(n-1-i));
  const lab=d.getDate()+' '+MN[d.getMonth()],open=d<=t0,today=d.getTime()===t0.getTime();
  return `<div style="margin-bottom:12px;${today?'outline:3px solid var(--hot);padding:4px':''}"><p class="from" style="margin:0">${lab}${today?' · hari ini':''}</p><p style="margin:2px 0">${open?esc(t):'[terkunci] dibuka tanggal '+lab}</p></div>`}).join('');
 openM(`<h2>jurnal harian</h2>${rows}<div class="row"><button class="btn" id="jb">kembali ke rak</button></div>`);
 $('#jb').onclick=shelf;
}

/* ---- telepon jadul ---- */
const pc=spr(PHONE,4);
const pb=deco('right',pc,phone,'telepon',106);
function phone(){
 pb.classList.remove('ring');void pb.offsetWidth;pb.classList.add('ring');
 sfx('blip');setTimeout(()=>sfx('blip'),250);
 setTimeout(()=>{pb.classList.remove('ring');voice()},800);
}
function voice(){
 const k=(+ls('bday-vm')||0)%VOICE.length;ls('bday-vm',String(k+1));
 const t=VOICE[k],dur=String(4+t.length%7).padStart(2,'0');
 openM(`<h2>pesan suara</h2><p class="from">pesan baru · 0:${dur}</p><div id="wv" style="display:flex;gap:3px;align-items:flex-end;height:36px;margin:10px 0"></div><div class="row"><button class="btn" id="pl">putar</button></div><p id="vt" style="margin-top:8px"></p>`);
 const wv=$('#wv'),bars=[];
 for(let j=0;j<24;j++){const s=document.createElement('i');s.style.cssText='width:6px;background:var(--ink);height:'+(6+Math.random()*24)+'px';wv.appendChild(s);bars.push(s)}
 let wt=0;onClose=()=>clearInterval(wt);
 $('#pl').onclick=()=>{
  $('#pl').disabled=true;sfx('pop');
  wt=setInterval(()=>bars.forEach(s=>s.style.height=(6+Math.random()*28)+'px'),120);
  setTimeout(()=>{clearInterval(wt);const v=$('#vt');if(v)v.textContent=t},2200);
 };
}
}
const go=()=>{try{init()}catch(e){console.error(e);const d=document.createElement('div');d.textContent='shelf.js error: '+e.message;d.style.cssText='position:fixed;top:0;left:0;right:0;background:#c00;color:#fff;padding:6px;font:12px monospace;z-index:99';document.body.appendChild(d)}};
document.readyState==='complete'?setTimeout(go,100):addEventListener('load',()=>setTimeout(go,100));
})();