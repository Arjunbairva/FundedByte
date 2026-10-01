import { useEffect, useRef, useState } from "react";
import { siteConfig } from "../config";

const wrap = "mx-auto w-full max-w-7xl px-5 sm:px-8";
const btn = "inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition";
const primary = `${btn} bg-brand text-white hover:bg-brand2`;
const secondary = `${btn} border border-line bg-card text-fg hover:border-fg`;

function LiveMarketsWidget() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";

    const widget = document.createElement("tv-market-data");
    widget.setAttribute("symbol-sectors", JSON.stringify([
      {
        sectionName: "Forex",
        symbols: ["FX:EURUSD", "FX:GBPUSD", "FX:USDJPY", "FX:USDCHF", "FX:AUDUSD", "FX:USDCAD"],
      },
      {
        sectionName: "Commodities",
        symbols: ["OANDA:XAUUSD", "OANDA:XAGUSD", "TVC:USOIL"],
      },
    ]));
    host.appendChild(widget);

    const src = "https://widgets.tradingview-widget.com/w/en/tv-market-data.js";
    if (!document.querySelector(`script[src="${src}"]`)) {
      const script = document.createElement("script");
      script.type = "module";
      script.src = src;
      document.head.appendChild(script);
    }

    return () => {
      host.innerHTML = "";
    };
  }, []);

  return <div ref={ref} className="min-h-[430px] w-full overflow-hidden rounded-2xl border border-line bg-card" />;
}

export const Logo = ({ dark=false }: { dark?: boolean }) => (
  <span className={`inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight ${dark ? "text-white" : "text-fg"}`}>
    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
      <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="M5 15.5 9.1 11l3.1 2.8L19 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </span>
    {siteConfig.brandName}
  </span>
);

export function Navbar({ user, onLogin, onSignup, onDashboard, onLogout }: { user?: string|null; onLogin:()=>void; onSignup:()=>void; onDashboard:()=>void; onLogout:()=>void }) {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur"><nav className={wrap+" flex h-16 items-center justify-between"}>
    <a href="#" aria-label="FundedBytes home"><Logo /></a>
    <div className="hidden items-center gap-7 text-sm font-medium md:flex"><a href="#markets" className="text-muted hover:text-fg">Markets</a><a href="#platform" className="text-muted hover:text-fg">Platform</a><a href="#faq" className="text-muted hover:text-fg">FAQ</a></div>
    <div className="hidden items-center gap-2 md:flex">{user ? <><button onClick={onDashboard} className={secondary}>Dashboard</button><button onClick={onLogout} className="px-3 py-2 text-sm text-muted hover:text-fg">Log out</button></> : <><button onClick={onLogin} className="px-3 py-2 text-sm font-semibold text-muted">Log in</button><button onClick={onSignup} className={primary}>Open account</button></>}</div>
    <button className="grid h-10 w-10 place-items-center rounded-lg border border-line md:hidden" aria-label="Menu" onClick={()=>setOpen(!open)}>{open?"×":"☰"}</button>
  </nav>{open && <div className="border-t border-line bg-card p-4 md:hidden"><div className="space-y-1"><a className="block rounded-lg px-3 py-2.5" href="#markets">Markets</a><a className="block rounded-lg px-3 py-2.5" href="#platform">Platform</a><a className="block rounded-lg px-3 py-2.5" href="#faq">FAQ</a></div><div className="mt-3 grid grid-cols-2 gap-2">{user ? <><button onClick={onDashboard} className={secondary}>Dashboard</button><button onClick={onLogout} className={secondary}>Log out</button></> : <><button onClick={onLogin} className={secondary}>Log in</button><button onClick={onSignup} className={primary}>Open account</button></>}</div></div>}</header>;
}

function MarketHero() {
  return <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs text-night-muted">Market workspace</p><p className="mt-1 text-xl font-semibold">XAU/USD</p></div><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-night-muted">STREAM-READY</span></div><div className="mt-6 rounded-2xl border border-white/10 bg-night p-4"><svg viewBox="0 0 560 220" className="w-full" aria-hidden="true"><path d="M15 175 C65 158 80 170 120 146 S190 155 225 118 S295 134 335 95 S410 104 450 72 S505 83 545 32" fill="none" stroke="#9DB8FF" strokeWidth="3" strokeLinecap="round"/>{[40,90,140,190].map(y=><line key={y} x1="10" x2="550" y1={y} y2={y} stroke="#2A3B57"/>)}</svg></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-night-muted">Bid</p><p className="mt-1 text-2xl font-semibold">3,865.31</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="text-xs text-night-muted">Ask</p><p className="mt-1 text-2xl font-semibold">3,865.53</p></div></div></div>;
}

export function HomePage({ onOpenDashboard, onDeposit }: { onOpenDashboard:()=>void; onDeposit:()=>void }) {
  return <main>
    <section className="on-night bg-night py-20 text-white sm:py-28"><div className={wrap+" grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]"}><div><div className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold tracking-wide text-night-muted">GLOBAL FX & COMMODITIES</div><h1 className="mt-6 max-w-3xl text-5xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-7xl">Trade forex and commodities from one account.</h1><p className="mt-6 max-w-2xl text-lg text-night-muted">A focused trading experience for major currency pairs, precious metals and energy markets.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={onOpenDashboard} className={`${btn} bg-white text-night hover:bg-night-fg`}>Open dashboard</button><button onClick={onDeposit} className={`${btn} border border-white/30 text-white hover:border-white`}>Deposit funds</button></div><div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm"><span className="font-semibold text-white">No KYC required</span><span className="text-night-muted">•</span><span className="text-night-muted">Open an account and start trading</span></div><div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-night-muted"><span><b className="text-white">Forex</b> majors & crosses</span><span><b className="text-white">Metals</b> gold & silver</span><span><b className="text-white">Energy</b> crude oil</span></div></div><MarketHero/></div></section>
    <section id="how-it-works" className="bg-panel py-20 sm:py-24"><div className={wrap}><p className="text-sm font-semibold text-brand">HOW IT WORKS</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Get started in three simple steps.</h2><p className="mt-3 max-w-2xl text-muted">Open your account, fund it, then request withdrawals directly from your dashboard.</p><div className="mt-10 grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-line bg-card p-6"><div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">1</div><h3 className="mt-5 text-lg font-semibold">Open an account</h3><p className="mt-2 text-sm leading-6 text-muted">Click <span className="font-semibold text-fg">Open account</span>, complete the sign-up verification, and access your FundedBytes account.</p></article><article className="rounded-2xl border border-line bg-card p-6"><div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">2</div><h3 className="mt-5 text-lg font-semibold">Deposit funds</h3><p className="mt-2 text-sm leading-6 text-muted">Open <span className="font-semibold text-fg">Deposit</span>, choose UPI or USDT, confirm your amount, make the payment, and submit the UTR or transaction details for verification.</p></article><article className="rounded-2xl border border-line bg-card p-6"><div className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-white">3</div><h3 className="mt-5 text-lg font-semibold">Withdraw funds</h3><p className="mt-2 text-sm leading-6 text-muted">From your dashboard, select <span className="font-semibold text-fg">Withdraw</span>, enter the amount and your UPI ID or USDT BEP-20 wallet, then submit the request for review.</p></article></div></div></section>
    <section id="markets" className="py-20 sm:py-24"><div className={wrap}><p className="text-sm font-semibold text-brand">MARKETS</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Initial instrument set</h2><p className="mt-3 max-w-2xl text-muted">Major forex pairs and selected commodities for the first release.</p><div className="mt-10"><LiveMarketsWidget /></div><div className="mt-4 flex justify-center"><button onClick={onOpenDashboard} className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand2">Open Trading Dashboard</button></div></div></section>
    <section id="platform" className="bg-panel py-20 sm:py-24"><div className={wrap}><p className="text-sm font-semibold text-brand">PLATFORM</p><h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Focused v1. Built to extend.</h2><div className="mt-10 grid gap-4 md:grid-cols-2"><article className="rounded-2xl border border-line bg-card p-6"><h3 className="text-lg font-semibold">Trading dashboard</h3><p className="mt-2 text-muted">Balance, equity, margin, floating P&L, open positions and closed positions.</p></article><article className="rounded-2xl border border-line bg-card p-6"><h3 className="text-lg font-semibold">UPI P2P funding</h3><p className="mt-2 text-muted">Scan the configured QR, transfer the amount and submit the UTR for manual verification.</p></article><article className="rounded-2xl border border-line bg-card p-6"><h3 className="text-lg font-semibold">USDT funding</h3><p className="mt-2 text-muted">Deposit and withdrawal flow using BSC / BEP-20.</p></article><article className="rounded-2xl border border-line bg-card p-6"><h3 className="text-lg font-semibold">Provider-ready</h3><p className="mt-2 text-muted">Market data, payment and execution adapters can be connected without redesigning the client UI.</p></article></div></div></section>
    <section id="faq" className="py-20 sm:py-24"><div className={wrap+" max-w-4xl"}><p className="text-sm font-semibold text-brand">FAQ</p><h2 className="mt-2 text-3xl font-semibold">Funding & account basics</h2><div className="mt-8 divide-y divide-line border-y border-line">{[["Minimum UPI deposit","₹1,000."],["Minimum USDT deposit","$20 on BSC / BEP-20."],["How are UPI deposits verified?","Deposits remain pending until the payment team verifies the submitted UTR."],["Can I view closed positions?","Yes. Open and closed positions have separate dashboard views."]].map(([q,a])=><div key={q} className="py-5"><h3 className="font-semibold">{q}</h3><p className="mt-1 text-muted">{a}</p></div>)}</div></div></section>
  </main>;
}

export function Footer(){ return <footer className="on-night bg-night py-12 text-night-muted"><div className={wrap+" flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"}><div><Logo dark/><p className="mt-2 text-sm">{siteConfig.tagline}</p></div><p className="max-w-2xl text-sm">Trading, funding and product availability depend on applicable jurisdiction and provider arrangements.</p></div></footer>; }
