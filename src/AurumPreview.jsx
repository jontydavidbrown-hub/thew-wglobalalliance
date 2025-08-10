import React, { useMemo, useRef, useState, useEffect } from "react";

const THEME = {
  bg: "#0b0c0f",
  panel: "#0e1015",
  panel2: "#12141b",
  border: "#1d2130",
  text: "#e6e7eb",
  muted: "#9aa3b2",
  gold400: "#f5d47a",
  gold500: "#f1c550",
  gold600: "#d6ab3a",
  glow: "rgba(241,197,80,0.25)",
  gradient: "linear-gradient(180deg, rgba(241,197,80,0.08), rgba(0,0,0,0))",
};

const presenceColors = { online: "#22c55e", away: "#f59e0b", offline: "#64748b" };
function initials(name){
  const p = (name||'').trim().split(/\\s+/);
  return (p[0]?.[0]||'').toUpperCase() + (p[1]?.[0]||'').toUpperCase();
}
function Avatar({ name, size=28, presence='offline', imageUrl }){
  const bg = '#1f2937';
  const style = { width:size, height:size, borderRadius:9999, background:bg, color:'#e6e7eb', display:'grid', placeItems:'center', fontSize: Math.max(10, size*0.38), position:'relative', border:`1px solid ${THEME.border}`, overflow:'hidden' };
  return (
    <div style={style}>
      {imageUrl ? <img src={imageUrl} alt={name||'avatar'} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials(name||'U')}
      <span style={{ position:'absolute', width:Math.max(6,size*0.32), height:Math.max(6,size*0.32), borderRadius:9999, background:presenceColors[presence]||presenceColors.offline, right:-2, bottom:-2, border:'2px solid #0e1015' }} />
    </div>
  );
}

function generateCodeFromPrompt(p) {
  const prompt = (p || "").toLowerCase();
  // Base: only exposes c + ctx
  const base = `const W=600,H=360;const c=document.getElementById('c');c.width=W;c.height=H;const ctx=c.getContext('2d');`;

  if (/matrix|rain|code/.test(prompt)) {
    return base +
      "const cols=Math.floor(W/10);const y=new Array(cols).fill(0);" +
      "function draw(){ctx.fillStyle='rgba(0,0,0,0.08)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#f1c550';ctx.font='14px monospace';" +
      "for(let i=0;i<cols;i++){const txt=Math.random()<.96?String.fromCharCode(0x30A0+Math.random()*96|0):'W';ctx.fillText(txt,i*10,y[i]);y[i]=(y[i]+14>H||Math.random()>0.95)?0:y[i]+14;}" +
      "requestAnimationFrame(draw);}draw();";
  }

  if (/wave|sine|audio|flow/.test(prompt)) {
    return base +
      "let t=0;function draw(){t+=0.03;ctx.fillStyle='#0b0c0f';ctx.fillRect(0,0,W,H);for(let x=0;x<W;x+=4){const y=H/2+Math.sin((x+t*60)/40)*40;ctx.fillStyle='#f1c550';ctx.fillRect(x,y,3,3);}requestAnimationFrame(draw);}draw();";
  }

  if (/particles?|stars?|galaxy|spiral/.test(prompt)) {
    return base +
      "const P=400;const ps=[];for(let i=0;i<P;i++){ps.push({a:Math.random()*Math.PI*2,r:5+Math.random()*150,s:0.002+Math.random()*0.01});}" +
      "function draw(){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.translate(W/2,H/2);for(const p of ps){p.a+=p.s;const x=Math.cos(p.a)*p.r,y=Math.sin(p.a)*p.r;ctx.fillStyle='rgba(241,197,80,0.9)';ctx.fillRect(x,y,2,2);}ctx.setTransform(1,0,0,1,0,0);requestAnimationFrame(draw);}draw();";
  }

  if (/bars?|chart|columns?/.test(prompt)) {
    return base +
      "const n=10;function draw(){ctx.fillStyle='#0b0c0f';ctx.fillRect(0,0,W,H);for(let i=0;i<n;i++){const h=(Math.sin(Date.now()/500+i)+1)*0.5*(H-60);ctx.fillStyle='#f1c550';ctx.fillRect(20+i*(W-40)/n,H-20-h,(W-60)/n,h);ctx.fillStyle='#9aa3b2';ctx.fillRect(20+i*(W-40)/n,H-20,(W-60)/n,2);}requestAnimationFrame(draw);}draw();";
  }

  if (/bounc|ball|orbs?/.test(prompt)) {
    return base +
      "const N=12,balls=[];for(let i=0;i<N;i++){balls.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()*2-1)*3,vy:(Math.random()*2-1)*3,r:6+Math.random()*8})}" +
      "function draw(){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);for(const b of balls){b.x+=b.vx;b.y+=b.vy;if(b.x<b.r||b.x>W-b.r) b.vx*=-1;if(b.y<b.r||b.y>H-b.r) b.vy*=-1;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fillStyle='#f1c550';ctx.shadowColor='#f1c55088';ctx.shadowBlur=10;ctx.fill();ctx.shadowBlur=0;}requestAnimationFrame(draw);}draw();";
  }

  // Safe default (never crashes)
  return base +
    "let t=0;function draw(){t+=0.02;ctx.fillStyle='#0b0c0f';ctx.fillRect(0,0,W,H);const r=80+Math.sin(t)*30;ctx.beginPath();ctx.arc(W/2,H/2,r,0,Math.PI*2);ctx.lineWidth=8;ctx.strokeStyle='#f1c550';ctx.shadowBlur=20;ctx.shadowColor='#f1c55088';ctx.stroke();ctx.shadowBlur=0;requestAnimationFrame(draw);}draw();";
}


function CanvasLab(){
  const iframeRef = React.useRef(null);
  const [prompt, setPrompt] = React.useState("");
  const [code, setCode] = React.useState(generateCodeFromPrompt("gold ring"));
  const [showEditor, setShowEditor] = React.useState(false);
 const run = (src) => {
  // Escape </script> so it doesn't prematurely close the tag
  const safeCode = (src || code).replace(/<\//g, '<\\/');

  const html = `<!doctype html><meta charset="utf-8">
<style>body{margin:0;background:#000;color:#f1c550;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial}</style>
<canvas id="c"></canvas>
<script>
window.onerror = function(msg,src,ln,col,err){
  var pre=document.createElement('pre');
  pre.textContent='CanvasLab error: ' + (err&&err.stack?err.stack:msg);
  pre.style.cssText='position:fixed;left:8px;top:8px;right:8px;background:#0b0c0f;padding:8px;border:1px solid #333;white-space:pre-wrap;';
  document.body.appendChild(pre);
};
try { ${safeCode} } catch(e){
  var pre=document.createElement('pre');
  pre.textContent='CanvasLab error: ' + e.message;
  pre.style.cssText='position:fixed;left:8px;top:8px;right:8px;background:#0b0c0f;padding:8px;border:1px solid #333;white-space:pre-wrap;';
  document.body.appendChild(pre);
}
<\/script>`;

  if (iframeRef.current){
    // Use srcdoc (more reliable than blob URLs under strict CSP)
    iframeRef.current.removeAttribute('src');
    iframeRef.current.srcdoc = html;
  }
};

  React.useEffect(()=>{ run(code); }, []);
  const generate = () => { const next = generateCodeFromPrompt(prompt); setCode(next); run(next); };
  return (
    <div className="grid" style={{ gridTemplateRows: showEditor?"auto 1fr 1fr":"auto 1fr", height: "100%" }}>
      <div className="flex gap-2 p-3" style={{ borderBottom:`1px solid ${THEME.border}`, background: THEME.panel }}>
        <input value={prompt} onChange={e=>setPrompt(e.target.value)} className="flex-1 rounded px-3 py-2" placeholder="Describe what you want (e.g., gold wave, matrix rain, bouncing balls)" style={{ background: THEME.panel2, color: THEME.text, border:`1px solid ${THEME.border}` }} />
        <button onClick={generate} className="rounded px-3 py-2 font-semibold" style={{ background: THEME.gold600, color: '#000' }}>Generate</button>
        <button onClick={()=>setShowEditor(v=>!v)} className="rounded px-3 py-2" style={{ background: THEME.panel2, color: THEME.text, border:`1px solid ${THEME.border}` }}>{showEditor? 'Hide code' : 'Edit code'}</button>
      </div>
      {showEditor && (
        <textarea className="w-full h-full p-3 text-sm" style={{ background: THEME.panel2, color: THEME.text, border: `1px solid ${THEME.border}` }} value={code} onChange={(e) => setCode(e.target.value)} />
      )}
      <div className="relative" style={{ borderTop: `1px solid ${THEME.border}` }}>
        <iframe ref={iframeRef} className="w-full h-full" sandbox="allow-scripts" />
        <div className="absolute right-3 top-3 flex gap-2">
          <button onClick={()=>run()} className="rounded px-4 py-2 font-semibold" style={{ background: THEME.gold600, color: '#000' }}>Run</button>
        </div>
      </div>
    </div>
  );
}

function Message({ m }){
  return (
    <div className="space-y-1 rounded-md p-3" style={{ background: "#0e1015cc", border: `1px solid ${THEME.border}`, boxShadow: `0 8px 24px -12px ${THEME.glow}` }}>
      <div className="text-xs flex items-center gap-2" style={{ color: THEME.muted }}>
        <Avatar name={m.author} presence={'online'} />
        <span>{m.author}</span>
      </div>
      {m.content && <div className="text-sm" style={{ color: THEME.text }}>{m.content}</div>}
    </div>
  )
}

export default function AurumPreview(){
  const [messages, setMessages] = React.useState([{id:1, author:'admin@you', content:'Welcome to W&W — Gold & Black.'}]);
  return (
    <div style={{ background: THEME.bg, minHeight:'100vh', color: THEME.text }}>
      <div style={{ padding: 16, borderBottom:`1px solid ${THEME.border}`, background: THEME.panel }}>
        <div style={{ fontWeight: 700, color: THEME.gold500 }}>Aurum Chat</div>
      </div>
      <div style={{ display:'grid', gridTemplateRows:'1fr auto', height:'calc(100vh - 56px)' }}>
        <div className="p-4 space-y-3" style={{ overflow:'auto', background: THEME.panel2 }}>
          {messages.map(m => <Message key={m.id} m={m} />)}
        </div>
        <div style={{ borderTop:`1px solid ${THEME.border}`, padding:12 }}>
          <button onClick={()=> setMessages(ms=>[...ms,{id:Date.now(), author:'you', content:'Hello!'}])} style={{ background: THEME.gold600, color:'#000', padding: '8px 12px', borderRadius:8, fontWeight:600 }}>Send sample</button>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div className="rounded-lg" style={{ border:`1px solid ${THEME.border}` }}>
          <CanvasLab />
        </div>
      </div>
    </div>
  )
}
