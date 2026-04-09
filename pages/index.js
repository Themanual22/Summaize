import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/eVqdR14Y1akWcyr03q9fW03";
const FREE_SUMMARY_LIMIT = 3;
const PRODUCT_PRICE = "$4.99";
const PRODUCT_CREDITS = "20 summaries";
const SITE_NAME = "SUMMAIZE";

function getUsage() {
  if (typeof window === "undefined") return { free: 0, paid: 0, unlocked: false };
  try {
    const raw = localStorage.getItem("summaize_usage");
    return raw ? JSON.parse(raw) : { free: 0, paid: 0, unlocked: false };
  } catch { return { free: 0, paid: 0, unlocked: false }; }
}

function saveUsage(u) {
  if (typeof window !== "undefined") localStorage.setItem("summaize_usage", JSON.stringify(u));
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#0a0a0a;font-family:'DM Sans',sans-serif}
  .app{--gold:#c9a84c;--gold2:#f0d080;--bg:#0a0a0a;--bg2:#111111;--bg3:#1a1a1a;--border:#2a2a2a;--text:#e8e4dc;--muted:#666;--danger:#e05252;--green:#52c984;background:var(--bg);color:var(--text);min-height:100vh}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:20px 48px;border-bottom:1px solid var(--border);position:sticky;top:0;z-index:100;background:rgba(10,10,10,0.92);backdrop-filter:blur(12px)}
  .nav-logo{font-family:'Playfair Display',serif;font-size:22px;font-weight:900;letter-spacing:2px;color:var(--gold)}
  .nav-badge{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);border:1px solid var(--border);padding:4px 10px;border-radius:20px}
  .nav-cta{background:var(--gold);color:#000;border:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s}
  .nav-cta:hover{background:var(--gold2);transform:translateY(-1px)}
  .hero{padding:100px 48px 80px;max-width:960px;margin:0 auto;animation:fadeUp .7s ease both}
  .hero-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:20px}
  .hero-title{font-family:'Playfair Display',serif;font-size:clamp(48px,7vw,88px);font-weight:900;line-height:1.0;color:var(--text);margin-bottom:24px}
  .hero-title span{color:var(--gold)}
  .hero-sub{font-size:18px;color:var(--muted);line-height:1.7;max-width:540px;margin-bottom:40px}
  .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
  .btn-primary{background:var(--gold);color:#000;border:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s}
  .btn-primary:hover{background:var(--gold2);transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,.3)}
  .btn-ghost{background:transparent;color:var(--text);border:1px solid var(--border);padding:14px 32px;border-radius:8px;font-size:15px;cursor:pointer;transition:all .2s}
  .btn-ghost:hover{border-color:var(--gold);color:var(--gold)}
  .trust{display:flex;gap:32px;padding:24px 48px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg2);justify-content:center;flex-wrap:wrap}
  .trust-item{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);display:flex;align-items:center;gap:8px}
  .trust-dot{width:6px;height:6px;border-radius:50%;background:var(--gold)}
  .section{max-width:860px;margin:0 auto;padding:80px 48px}
  .section-label{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:12px}
  .section-title{font-family:'Playfair Display',serif;font-size:36px;font-weight:700;margin-bottom:40px}
  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .step{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:28px}
  .step-num{font-family:'Playfair Display',serif;font-size:48px;font-weight:900;color:var(--border);margin-bottom:16px;line-height:1}
  .step-title{font-weight:600;font-size:16px;margin-bottom:8px}
  .step-desc{font-size:14px;color:var(--muted);line-height:1.6}
  .usage-meter{display:flex;align-items:center;gap:12px;margin-bottom:24px;padding:12px 16px;background:var(--bg2);border:1px solid var(--border);border-radius:8px}
  .meter-track{flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden}
  .meter-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .5s ease}
  .meter-label{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);white-space:nowrap}
  .meter-label.unlocked{color:var(--green)}
  .mode-tabs{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
  .mode-tab{font-family:'JetBrains Mono',monospace;font-size:12px;padding:6px 16px;border:1px solid var(--border);border-radius:20px;background:transparent;color:var(--muted);cursor:pointer;transition:all .2s}
  .mode-tab.active{border-color:var(--gold);color:var(--gold);background:rgba(201,168,76,.08)}
  .mode-tab:hover:not(.active){border-color:#444;color:var(--text)}
  .input-wrap{position:relative;margin-bottom:16px}
  .input-textarea{width:100%;min-height:200px;padding:20px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.7;resize:vertical;transition:border-color .2s;outline:none}
  .input-textarea:focus{border-color:var(--gold)}
  .input-textarea::placeholder{color:var(--muted)}
  .char-count{position:absolute;bottom:12px;right:16px;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)}
  .submit-row{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
  .submit-btn{background:var(--gold);color:#000;border:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;cursor:pointer;transition:all .2s}
  .submit-btn:hover:not(:disabled){background:var(--gold2);transform:translateY(-1px);box-shadow:0 8px 24px rgba(201,168,76,.25)}
  .submit-btn:disabled{opacity:.4;cursor:not-allowed}
  .submit-hint{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)}
  .output-wrap{margin-top:32px;padding:28px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;position:relative;overflow:hidden;animation:fadeIn .4s ease}
  .output-wrap::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),transparent)}
  .output-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
  .output-tag{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--gold);letter-spacing:2px;text-transform:uppercase}
  .copy-btn{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);background:transparent;border:1px solid var(--border);padding:4px 12px;border-radius:4px;cursor:pointer;transition:all .2s}
  .copy-btn:hover{border-color:var(--gold);color:var(--gold)}
  .output-text{font-size:15px;line-height:1.8;color:var(--text);white-space:pre-wrap}
  .loading-wrap{margin-top:32px;padding:40px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;text-align:center;animation:fadeIn .3s ease}
  .loading-dots{display:inline-flex;gap:6px;margin-bottom:16px}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--gold);animation:pulse 1.2s ease infinite}
  .dot:nth-child(2){animation-delay:.2s}
  .dot:nth-child(3){animation-delay:.4s}
  .loading-text{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted)}
  .error-text{color:var(--danger);font-family:'JetBrains Mono',monospace;font-size:12px;margin-bottom:12px}
  .pricing-card{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:40px;position:relative;overflow:hidden;display:flex;gap:40px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
  .pricing-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--gold),transparent)}
  .pricing-left{flex:1;min-width:200px}
  .pricing-name{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:3px;color:var(--gold);text-transform:uppercase;margin-bottom:8px}
  .pricing-amount{font-family:'Playfair Display',serif;font-size:52px;font-weight:900;color:var(--text)}
  .pricing-desc{font-size:14px;color:var(--muted);margin-top:8px}
  .pricing-features{flex:2;display:grid;grid-template-columns:1fr 1fr;gap:12px;min-width:280px}
  .feature-item{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--muted)}
  .feature-check{color:var(--green);font-size:16px}
  .modal-overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:24px;animation:fadeIn .25s ease}
  .modal{background:var(--bg2);border:1px solid var(--border);border-radius:16px;max-width:460px;width:100%;padding:40px;position:relative;overflow:hidden;animation:fadeUp .3s ease}
  .modal::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--gold),var(--gold2),transparent)}
  .modal-icon{font-size:40px;margin-bottom:20px}
  .modal-title{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;margin-bottom:12px}
  .modal-sub{font-size:15px;color:var(--muted);line-height:1.7;margin-bottom:28px}
  .price-amount{font-family:'Playfair Display',serif;font-size:48px;font-weight:900;color:var(--gold)}
  .price-meta{font-size:14px;color:var(--muted);margin-left:8px}
  .price-includes{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);margin-bottom:28px;margin-top:4px}
  .modal-actions{display:flex;flex-direction:column;gap:12px}
  .btn-stripe{background:linear-gradient(135deg,var(--gold),var(--gold2));color:#000;border:none;padding:16px 24px;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;transition:all .2s;width:100%}
  .btn-stripe:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 12px 32px rgba(201,168,76,.35)}
  .modal-unlock-row{display:flex;gap:8px}
  .unlock-input{flex:1;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:13px;outline:none;transition:border-color .2s}
  .unlock-input:focus{border-color:var(--gold)}
  .unlock-input::placeholder{color:var(--muted)}
  .btn-unlock{background:transparent;border:1px solid var(--border);color:var(--muted);padding:10px 16px;border-radius:8px;font-size:13px;cursor:pointer;white-space:nowrap;transition:all .2s}
  .btn-unlock:hover{border-color:var(--gold);color:var(--gold)}
  .modal-dismiss{background:transparent;border:none;color:var(--muted);font-size:13px;cursor:pointer;text-align:center;padding:4px;transition:color .2s}
  .modal-dismiss:hover{color:var(--text)}
  .unlock-error{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--danger)}
  .footer{border-top:1px solid var(--border);padding:32px 48px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}
  .footer-logo{font-family:'Playfair Display',serif;font-size:16px;font-weight:900;color:var(--gold);letter-spacing:2px}
  .footer-meta{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted)}
  @media(max-width:640px){.nav{padding:16px 20px}.hero{padding:60px 20px 40px}.section{padding-left:20px;padding-right:20px}.steps{grid-template-columns:1fr}.pricing-features{grid-template-columns:1fr}.footer{flex-direction:column;text-align:center;padding:24px 20px}}
`;

export default function Home() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("concise");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const [usage, setUsage] = useState({ free: 0, paid: 0, unlocked: false });
  const [unlockCode, setUnlockCode] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [copied, setCopied] = useState(false);
  const toolRef = useRef(null);

  useEffect(() => { setUsage(getUsage()); }, []);

  const isUnlocked = usage.unlocked;
  const freeUsed = usage.free;
  const meterPct = isUnlocked ? 100 : Math.min((freeUsed / FREE_SUMMARY_LIMIT) * 100, 100);

  const scrollToTool = () => toolRef.current?.scrollIntoView({ behavior: "smooth" });

  async function handleSummarize() {
    if (!text.trim() || text.trim().length < 30) { setError("Please enter at least 30 characters."); return; }
    setError("");
    if (!isUnlocked && freeUsed >= FREE_SUMMARY_LIMIT) { setShowPaywall(true); return; }
    setLoading(true); setOutput("");
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOutput(data.summary);
      const next = { ...usage };
      if (!isUnlocked) next.free = freeUsed + 1;
      else next.paid = (next.paid || 0) + 1;
      setUsage(next); saveUsage(next);
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  function handleUnlock() {
    const code = unlockCode.trim();
    if (code.startsWith("pi_") || code.startsWith("cs_") || code.length > 10) {
      const next = { ...usage, unlocked: true };
      setUsage(next); saveUsage(next);
      setShowPaywall(false); setUnlockCode(""); setUnlockError("");
    } else { setUnlockError("Invalid code. Complete your Stripe payment first."); }
  }

  function handleCopy() {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  const modes = [{ id: "concise", label: "Concise Bullets" }, { id: "detailed", label: "Detailed" }, { id: "executive", label: "Executive" }];

  return (
    <div className="app">
      <Head>
        <title>SUMMAIZE — AI Document Summarizer</title>
        <meta name="description" content="Paste anything. Get the point. AI-powered document summarizer." />
      </Head>
      <style>{css}</style>
      <nav className="nav">
        <div className="nav-logo">{SITE_NAME}</div>
        <div className="nav-badge">Claude AI + Stripe</div>
        <button className="nav-cta" onClick={scrollToTool}>Try Free →</button>
      </nav>
      <div className="hero">
        <div className="hero-eyebrow">AI Document Summarizer</div>
        <h1 className="hero-title">Paste anything.<br /><span>Get the point.</span></h1>
        <p className="hero-sub">Drop any document, article, report, or wall of text. Get a razor-sharp summary in seconds. No account. No friction.</p>
        <div className="hero-actions">
          <button className="btn-primary" onClick={scrollToTool}>Summarize Free →</button>
          <button className="btn-ghost" onClick={() => document.querySelector(".pricing-section")?.scrollIntoView({ behavior: "smooth" })}>See Pricing</button>
        </div>
      </div>
      <div className="trust">
        {["Claude AI Intelligence","Stripe Secure Payments","No Account Required","Instant Output","3 Free Summaries"].map(t => (
          <div className="trust-item" key={t}><div className="trust-dot" />{t}</div>
        ))}
      </div>
      <div className="section">
        <div className="section-label">How It Works</div>
        <h2 className="section-title">Three steps to clarity</h2>
        <div className="steps">
          {[{n:"01",title:"Paste Your Text",desc:"Drop any content — articles, reports, emails, legal docs, meeting notes. Up to 10,000 characters."},{n:"02",title:"Choose Your Mode",desc:"Concise bullets, detailed breakdown, or executive one-liner. You control the output format."},{n:"03",title:"Get Your Summary",desc:"Claude processes your text instantly and returns a sharp, structured summary. Copy and go."}].map(s => (
            <div className="step" key={s.n}><div className="step-num">{s.n}</div><div className="step-title">{s.title}</div><div className="step-desc">{s.desc}</div></div>
          ))}
        </div>
      </div>
      <div className="section" ref={toolRef} style={{paddingTop:0}}>
        <div className="section-label">The Tool</div>
        <h2 className="section-title">Start summarizing</h2>
        <div className="usage-meter">
          <div className="meter-track"><div className="meter-fill" style={{width:`${meterPct}%`}} /></div>
          <div className={`meter-label ${isUnlocked ? "unlocked" : ""}`}>
            {isUnlocked ? `✓ Unlocked — ${usage.paid||0} used` : `${freeUsed} / ${FREE_SUMMARY_LIMIT} free uses`}
          </div>
        </div>
        <div className="mode-tabs">
          {modes.map(m => <button key={m.id} className={`mode-tab ${mode===m.id?"active":""}`} onClick={()=>setMode(m.id)}>{m.label}</button>)}
        </div>
        <div className="input-wrap">
          <textarea className="input-textarea" placeholder="Paste your document, article, email, or any text here…" value={text} onChange={e=>setText(e.target.value)} maxLength={10000} />
          <div className="char-count">{text.length} / 10,000</div>
        </div>
        {error && <div className="error-text">{error}</div>}
        <div className="submit-row">
          <button className="submit-btn" onClick={handleSummarize} disabled={loading}>{loading?"Summarizing…":"Summarize →"}</button>
          <div className="submit-hint">{isUnlocked?"✓ Full access active":`${FREE_SUMMARY_LIMIT-freeUsed} free ${FREE_SUMMARY_LIMIT-freeUsed===1?"summary":"summaries"} remaining`}</div>
        </div>
        {loading && <div className="loading-wrap"><div className="loading-dots"><div className="dot"/><div className="dot"/><div className="dot"/></div><div className="loading-text">Claude is reading your document…</div></div>}
        {output && !loading && (
          <div className="output-wrap">
            <div className="output-header"><div className="output-tag">Summary · {mode}</div><button className="copy-btn" onClick={handleCopy}>{copied?"Copied ✓":"Copy"}</button></div>
            <div className="output-text">{output}</div>
          </div>
        )}
      </div>
      <div className="section pricing-section" style={{paddingTop:0}}>
        <div className="section-label">Pricing</div>
        <h2 className="section-title" style={{marginBottom:"32px"}}>Simple. One-time. No subscription.</h2>
        <div className="pricing-card" style={{opacity:0.7}}>
          <div className="pricing-left"><div className="pricing-name">Free Tier</div><div className="pricing-amount">$0</div><div className="pricing-desc">No payment. No account.</div></div>
          <div className="pricing-features">{[`${FREE_SUMMARY_LIMIT} free summaries`,"All 3 modes","Instant output","No signup"].map(f=><div className="feature-item" key={f}><span className="feature-check">✓</span> {f}</div>)}</div>
        </div>
        <div className="pricing-card">
          <div className="pricing-left"><div className="pricing-name">One-Time Access</div><div className="pricing-amount">{PRODUCT_PRICE}</div><div className="pricing-desc">Pay once. Use {PRODUCT_CREDITS}.</div></div>
          <div className="pricing-features">{[`${PRODUCT_CREDITS} included`,"All 3 summary modes","No subscription","Stripe secure checkout","Instant access","No account needed"].map(f=><div className="feature-item" key={f}><span className="feature-check">✓</span> {f}</div>)}</div>
          <button className="btn-primary" onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")}>Get Access →</button>
        </div>
      </div>
      <footer className="footer">
        <div className="footer-logo">{SITE_NAME}</div>
        <div className="footer-meta">Payments secured by Stripe</div>
        <div className="footer-meta">🔒 SSL Encrypted</div>
      </footer>
      {showPaywall && (
        <div className="modal-overlay" onClick={()=>setShowPaywall(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-icon">⚡</div>
            <div className="modal-title">Free summaries used up</div>
            <div className="modal-sub">Unlock {PRODUCT_CREDITS} instantly — one payment, no subscription, no account.</div>
            <div style={{display:"flex",alignItems:"baseline"}}><div className="price-amount">{PRODUCT_PRICE}</div><span className="price-meta">one-time</span></div>
            <div className="price-includes">Includes {PRODUCT_CREDITS} · All modes · Instant access</div>
            <div className="modal-actions">
              <button className="btn-stripe" onClick={()=>window.open(STRIPE_PAYMENT_LINK,"_blank")}>Pay {PRODUCT_PRICE} via Stripe →</button>
              <div className="modal-unlock-row">
                <input className="unlock-input" placeholder="Enter payment confirmation code" value={unlockCode} onChange={e=>setUnlockCode(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleUnlock()} />
                <button className="btn-unlock" onClick={handleUnlock}>Unlock</button>
              </div>
              {unlockError && <div className="unlock-error">{unlockError}</div>}
              <button className="modal-dismiss" onClick={()=>setShowPaywall(false)}>Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
