/* greet3d.js — sesama pengunjung saling sapa kalau papasan.
   Muat PALING AKHIR (setelah live3d.js):
   <script src="greet3d.js?v=1"></script>

   Cara kerja: tiap frame, kalau dua avatar ada di ruangan yang sama (dan terlihat di layar), jaraknya dekat,
   dan minimal satu sedang berjalan -> yang satu menyapa, yang lain membalas sebentar kemudian.
   Balon ucapan dibuat sendiri per avatar (bisa muncul dua sekaligus), tidak memakai balon tunggal bawaan.
   Mau ubah kalimat / jarak / jeda? Cari bagian "EDIT" di bawah. */
(()=>{
if(typeof THREE==='undefined'||typeof V==='undefined'||typeof winFx==='undefined'||typeof cam==='undefined')return;

/* ===== EDIT ===== */
const NEAR=1.4;          /* jarak (satuan dunia) yang dianggap papasan */
const PAIR_CD=45;        /* detik: jeda sebelum pasangan yang sama saling sapa lagi */
const SELF_CD=7;         /* detik: jeda minimal sebelum satu avatar menyapa lagi (siapa pun) */
const SHOW=2.6;          /* lama balon tampil (detik) */
const REPLY_AFTER=[.9,1.5];
const FIRST=['hai!','halo~','hi hi!','eh, ketemu~','hai hai!','halo halo','yo!','やあ！','こんにちは！','hai, selamat datang!'];
const REPLY=['hai juga!','halo juga~','hehe hai','yo!','hai hai~','oh hai!','selamat ya buat Aqsa!','udah kasih ucapan belum?','kuenya enak lho~','ayo lihat mading!','またね！'];
const NAMED=['hai {n}!','halo {n}~','eh {n}!'];
const NAMED_REPLY=['hai juga {n}!','halo {n}~','oh, {n}! hai!'];
/* ===== akhir EDIT ===== */

const pick=a=>a[Math.floor(Math.random()*a.length)];
const rr=(a,b)=>a+Math.random()*(b-a);
{const st=document.createElement('style');st.textContent=`
.vsay{position:fixed;z-index:5;background:#fff;border:3px solid var(--ink,#1f3a5f);padding:2px 9px 3px;font:22px 'VT323',monospace;color:var(--ink,#1f3a5f);pointer-events:none;white-space:nowrap;transform:translate(-50%,-100%);animation:vsp .18s ease-out}
.vsay::after{content:'';position:absolute;left:50%;bottom:-9px;margin-left:-6px;border:6px solid transparent;border-top:6px solid var(--ink,#1f3a5f);border-bottom:0}
@keyframes vsp{from{opacity:0;transform:translate(-50%,-80%) scale(.8)}}`;document.head.appendChild(st)}

const P=new THREE.Vector3(),last=new Map(),pairT=new Map(),selfT=new Map(),bubbles=[],queue=[];
let T=0;

const shown=v=>{for(let o=v.g;o;o=o.parent)if(o.visible===false)return false;return true};
const nm=v=>(v.a&&v.a.n&&v.a.n!=='tamu')?String(v.a.n):'';
const line=(pool,named,v)=>{const n=nm(v);return n&&Math.random()<.35?pick(named).replace('{n}',n):pick(pool)};

function bubble(v,text){
 for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].v===v){bubbles[i].el.remove();bubbles.splice(i,1)}
 const el=document.createElement('div');el.className='vsay';el.textContent=text;document.body.appendChild(el);
 bubbles.push({v,el,until:T+SHOW});selfT.set(v,T)}

function greet(a,b){
 /* yang menyapa = yang sedang berjalan (kalau dua-duanya jalan, acak) */
 const ma=a._mv,mb=b._mv,first=ma&&!mb?a:mb&&!ma?b:(Math.random()<.5?a:b),second=first===a?b:a;
 bubble(first,line(FIRST,NAMED,second));
 queue.push({at:T+rr(REPLY_AFTER[0],REPLY_AFTER[1]),v:second,to:first})}

function tick(dt){
 if(!dt||dt>.5){return}
 T+=dt;
 const vs=[...V.values()];
 /* kecepatan: bandingkan posisi dengan frame sebelumnya */
 vs.forEach(v=>{const p=last.get(v);v._mv=!!p&&Math.hypot(v.x-p.x,v.z-p.z)/dt>.25;last.set(v,{x:v.x,z:v.z})});
 {const alive=new Set(vs);for(const k of [...last.keys()])if(!alive.has(k))last.delete(k)}
 /* deteksi papasan */
 for(let i=0;i<vs.length;i++)for(let j=i+1;j<vs.length;j++){
  const a=vs[i],b=vs[j];
  if(a.room!==b.room||a.xfer||b.xfer||(!a._mv&&!b._mv))continue;
  if(Math.hypot(a.x-b.x,a.z-b.z)>NEAR)continue;
  if(T-(selfT.get(a)||-99)<SELF_CD||T-(selfT.get(b)||-99)<SELF_CD)continue;
  const key=(a.a&&a.a.id||i)+'|'+(b.a&&b.a.id||j),key2=(b.a&&b.a.id||j)+'|'+(a.a&&a.a.id||i),pk=key<key2?key:key2;
  if(T-(pairT.get(pk)||-999)<PAIR_CD)continue;
  if(!shown(a)||!shown(b))continue;
  pairT.set(pk,T);greet(a,b)}
 /* balasan tertunda */
 for(let i=queue.length-1;i>=0;i--){const q=queue[i];if(T<q.at)continue;queue.splice(i,1);if([...V.values()].includes(q.v))bubble(q.v,line(REPLY,NAMED_REPLY,q.to))}
 /* posisi & umur balon */
 for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i],v=b.v;
  if(T>b.until||![...V.values()].includes(v)||!shown(v)){b.el.remove();bubbles.splice(i,1);continue}
  v.tg.getWorldPosition(P);P.y+=.75;P.project(cam);
  if(P.z>1||P.z<-1){b.el.style.display='none';continue}
  b.el.style.display='';b.el.style.left=(P.x*.5+.5)*innerWidth+'px';b.el.style.top=(-P.y*.5+.5)*innerHeight+'px';
  const rem=b.until-T;b.el.style.opacity=rem<.35?Math.max(0,rem/.35):1}}

{const _wf=winFx;winFx=function(dt){_wf(dt);try{tick(dt)}catch(e){console.warn('greet3d',e)}}}
})();