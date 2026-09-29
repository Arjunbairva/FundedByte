import { useState, type ReactNode } from "react";
import { siteConfig, evaluationPrograms, baseRules as R, comparisonRows, faqs, usd, profitSplitExample as ex, type Program } from "../config";

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const btnP = "rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-ink transition hover:bg-brand2 hover:-translate-y-px";
const btnS = "rounded-lg border border-line px-5 py-3 text-sm font-semibold transition hover:border-brand hover:-translate-y-px";
const Head = ({ id, title, sub }: { id?: string; title: string; sub?: string }) => (
  <div id={id} className="mb-10 max-w-2xl scroll-mt-24"><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>{sub && <p className="mt-3 text-muted">{sub}</p>}</div>
);
const Section = ({ children, alt }: { children: ReactNode; alt?: boolean }) => <section className={`py-20 ${alt ? "bg-panel" : ""}`}><div className={wrap + " rise"}>{children}</div></section>;
export const Logo = () => <span className="text-xl font-bold tracking-tight">Funded<span className="text-brand">Byte</span></span>;
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function Navbar({ onLogin, onStart }: { onLogin: () => void; onStart: () => void }) {
  const [open, setOpen] = useState(false);
  const links: [string, string][] = [["Programs", "programs"], ["How It Works", "how"], ["Rules", "rules"], ["FAQ", "faq"]];
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/80 backdrop-blur-md">
      <nav className={wrap + " flex h-16 items-center justify-between"} aria-label="Main">
        <a href="#" aria-label="FundedByte home"><Logo /></a>
        <ul className="hidden items-center gap-8 text-sm text-muted md:flex">
          {links.map(([l, id]) => <li key={id}><button onClick={() => go(id)} className="hover:text-fg transition">{l}</button></li>)}
        </ul>
        <div className="hidden items-center gap-3 md:flex">
          <button onClick={onLogin} className="px-3 py-2 text-sm text-muted hover:text-fg">Login</button>
          <button onClick={onStart} className={btnP}>Start Evaluation</button>
        </div>
        <button className="md:hidden p-2" aria-expanded={open} aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          <span className="block h-0.5 w-6 bg-fg mb-1.5" /><span className="block h-0.5 w-6 bg-fg mb-1.5" /><span className="block h-0.5 w-6 bg-fg" />
        </button>
      </nav>
      {open && (
        <div className="border-t border-line bg-panel px-5 py-4 md:hidden">
          {links.map(([l, id]) => <button key={id} onClick={() => { setOpen(false); go(id); }} className="block w-full py-3 text-left text-muted">{l}</button>)}
          <div className="mt-3 grid grid-cols-2 gap-3"><button onClick={() => { setOpen(false); onLogin(); }} className={btnS}>Login</button><button onClick={() => { setOpen(false); onStart(); }} className={btnP}>Start Evaluation</button></div>
        </div>
      )}
    </header>
  );
}

function DashboardPreview() {
  const stats: [string, string, boolean?][] = [["Account", "$100,000"], ["Equity", "$108,426.00"], ["Floating P&L", "+$8,426.00", true], ["Profit Target", R.profitTarget + "%"], ["Max Drawdown", R.maxDrawdown + "%"]];
  const pts = "0,150 30,140 60,148 90,120 120,128 150,100 180,108 210,80 240,90 270,60 300,68 330,40 360,48 400,20";
  return (
    <div className="relative rounded-2xl border border-line bg-gradient-to-b from-card to-panel p-5 shadow-2xl shadow-black/40" aria-label="Dashboard preview mockup">
      <div className="mb-4 flex items-center justify-between text-xs"><span className="text-muted">Dashboard Preview</span><span className="rounded-full border border-line px-2 py-0.5 text-muted">Sample data — not live</span></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map(([k, v, g]) => <div key={k} className="rounded-xl border border-line/70 bg-ink/50 p-3"><div className="text-[11px] text-muted">{k}</div><div className={`mt-1 text-sm font-semibold ${g ? "text-brand" : ""}`}>{v}</div></div>)}
      </div>
      <svg viewBox="0 0 400 170" className="mt-4 w-full" role="img" aria-label="Synthetic equity curve">
        <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#16C784" stopOpacity=".3" /><stop offset="1" stopColor="#16C784" stopOpacity="0" /></linearGradient></defs>
        {[40, 80, 120].map(y => <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#223651" strokeWidth=".5" />)}
        <polygon points={pts + " 400,170 0,170"} fill="url(#g)" />
        <polyline points={pts} fill="none" stroke="#16C784" strokeWidth="2" strokeLinejoin="round" className="draw" />
      </svg>
    </div>
  );
}

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
      <div className={wrap + " rise relative grid items-center gap-14 lg:grid-cols-2"}>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-[11px] font-semibold tracking-widest text-muted"><span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_#16C784]" />BUILT FOR TRADERS</span>
          <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">Trade. Prove.<br /><span className="bg-gradient-to-r from-brand to-brand2 bg-clip-text text-transparent">Scale.</span></h1>
          <p className="mt-6 max-w-lg text-lg text-muted">Prove your trading discipline through a transparent evaluation and unlock access to larger trading opportunities.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button onClick={onStart} className={btnP}>Start Evaluation</button><button onClick={() => go("programs")} className={btnS}>View Programs</button></div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">{["Transparent Rules", "No Hidden Conditions", "Built for Traders"].map(t => <li key={t} className="flex items-center gap-2"><span className="text-brand">✓</span>{t}</li>)}</ul>
        </div>
        <DashboardPreview />
      </div>
    </section>
  );
}

function ProgramCard({ p, onBuy }: { p: Program; onBuy: (p: Program) => void }) {
  const rows: [string, string][] = [["Account", usd(p.balance)], ["Profit Target", p.rules.profitTarget + "%"], ["Maximum Drawdown", p.rules.maxDrawdown + "%"], ["Daily Drawdown", p.rules.dailyDrawdown + "%"], ["Minimum Trading Days", p.rules.minTradingDays], ["Time Limit", p.rules.timeLimit], ["Profit Split", p.rules.profitSplit + "%"]];
  return (
    <article className={`relative flex flex-col rounded-2xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30 ${p.popular ? "border-brand" : "border-line"}`}>
      {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-0.5 text-[10px] font-bold tracking-wider text-ink">MOST POPULAR</span>}
      <h3 className="text-sm font-semibold text-muted">{p.label}</h3>
      <div className="mt-2 text-4xl font-bold">{usd(p.fee)}</div>
      <dl className="my-6 flex-1 space-y-3 text-sm">{rows.map(([k, v]) => <div key={k} className="flex justify-between gap-3 border-b border-line/50 pb-2"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
      <button onClick={() => onBuy(p)} className={p.popular ? btnP : btnS}>Buy Challenge</button>
    </article>
  );
}

export function Programs({ onBuy }: { onBuy: (p: Program) => void }) {
  return (
    <Section>
      <Head id="programs" title="Choose Your Evaluation" sub="Current evaluation configuration. Parameters may change before launch." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{evaluationPrograms.map(p => <ProgramCard key={p.id} p={p} onBuy={onBuy} />)}</div>
      <div className="mt-16 overflow-x-auto rounded-2xl border border-line" tabIndex={0} aria-label="Program comparison table">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-card"><tr><th className="sticky left-0 bg-card p-4 text-left font-medium text-muted">Feature</th>{evaluationPrograms.map(p => <th key={p.id} className="p-4 text-right font-semibold">{p.label}</th>)}</tr></thead>
          <tbody>{comparisonRows.map(r => <tr key={r.label} className="border-t border-line/60"><th scope="row" className="sticky left-0 bg-ink p-4 text-left font-normal text-muted">{r.label}</th>{evaluationPrograms.map(p => <td key={p.id} className="p-4 text-right">{r.get(p)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </Section>
  );
}

export function HowItWorks() {
  const steps = [["01", "Choose Your Evaluation", "Pick the account size that fits your strategy and review the rules."], ["02", "Trade Your Strategy", "Trade within the defined profit target and drawdown limits."], ["03", "Complete The Evaluation", "Meet the objectives while respecting every rule to complete the evaluation."]];
  return (
    <Section alt>
      <Head id="how" title="How It Works" />
      <ol className="relative grid gap-6 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-line to-transparent md:block" aria-hidden />
        {steps.map(([n, t, d]) => <li key={n} className="relative"><div className="relative z-10 grid h-12 w-12 place-items-center rounded-full border border-line bg-card font-semibold text-brand">{n}</div><h3 className="mt-5 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></li>)}
      </ol>
    </Section>
  );
}

export function Features() {
  const f = [["Transparent Rules", "Know the evaluation conditions before you purchase."], ["Simple Risk Parameters", "Clear profit targets and drawdown limits without unnecessary complexity."], ["Trader-Focused Experience", "Designed around the information traders actually need."], ["Built to Scale", "A platform architecture designed to grow with traders."]];
  return (
    <Section>
      <Head title={`Why ${siteConfig.brandName}`} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{f.map(([t, d]) => <div key={t} className="rounded-2xl border border-line bg-card p-6 transition hover:border-brand/60"><div className="mb-4 h-1 w-8 rounded bg-brand" /><h3 className="font-semibold">{t}</h3><p className="mt-2 text-sm text-muted">{d}</p></div>)}</div>
    </Section>
  );
}

export function Rules({ onViewRules }: { onViewRules: () => void }) {
  const items: [string, string][] = [["Profit Target", R.profitTarget + "%"], ["Daily Drawdown", R.dailyDrawdown + "%"], ["Maximum Drawdown", R.maxDrawdown + "%"], ["Minimum Trading Days", R.minTradingDays], ["Maximum Trading Period", R.timeLimit], ["Profit Split", R.profitSplit + "%"]];
  return (
    <Section alt>
      <Head id="rules" title="Know The Rules Before You Trade" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{items.map(([k, v]) => <div key={k} className="rounded-2xl border border-line bg-card p-6"><div className="text-3xl font-bold text-brand">{v}</div><div className="mt-1 text-sm text-muted">{k}</div></div>)}</div>
      <details className="group mt-6 rounded-2xl border border-line bg-card p-5">
        <summary className="cursor-pointer list-none font-semibold flex justify-between">What is Daily Drawdown?<span className="text-brand transition group-open:rotate-45">+</span></summary>
        <div className="mt-3 space-y-2 text-sm text-muted">
          <p>Daily drawdown is the maximum loss permitted within a single trading day. For the current configuration, the limit is {R.dailyDrawdown}% of the account's starting balance. Both realized and unrealized P&L should be considered according to the final program rules.</p>
          <p>Daily drawdown resets at {R.dailyResetUtc}.</p>
          <p className="text-fg">The exact calculation methodology will be defined in the official trading rules.</p>
        </div>
      </details>
      <p className="mt-6 text-sm text-muted">Trading rules should always be reviewed in full before purchasing an evaluation.</p>
      <button onClick={onViewRules} className={btnS + " mt-4"}>View Full Rules</button>
    </Section>
  );
}

export function ProfitSplit() {
  return (
    <Section>
      <Head title="Your Performance Matters" />
      <div className="grid items-center gap-8 rounded-2xl border border-line bg-gradient-to-br from-card to-panel p-8 md:grid-cols-2">
        <div><div className="text-7xl font-bold text-brand">{R.profitSplit}%</div><div className="mt-2 text-muted">Trader Profit Share</div></div>
        <div className="rounded-xl bg-ink/60 p-5 text-sm">
          <div className="mb-3 text-xs font-semibold tracking-widest text-muted">EXAMPLE ONLY</div>
          <p className="text-muted">If eligible trading profit is {usd(ex.profit)}:</p>
          <div className="mt-3 flex justify-between"><span>Trader</span><b className="text-brand">{usd(ex.trader)}</b></div>
          <div className="mt-2 flex justify-between"><span>{siteConfig.brandName}</span><b>{usd(ex.firm)}</b></div>
          <p className="mt-4 text-xs text-muted">Illustrative only. Does not imply any trader will be profitable.</p>
        </div>
      </div>
    </Section>
  );
}

export function FAQ() {
  const [o, setO] = useState<number | null>(0);
  return (
    <Section alt>
      <Head id="faq" title="Frequently Asked Questions" />
      <div className="max-w-3xl divide-y divide-line rounded-2xl border border-line bg-card">
        {faqs.map(([q, a], i) => (
          <div key={q}>
            <h3><button aria-expanded={o === i} aria-controls={`faq-${i}`} onClick={() => setO(o === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium">{q}<span className={`text-brand transition ${o === i ? "rotate-45" : ""}`}>+</span></button></h3>
            {o === i && <p id={`faq-${i}`} className="px-5 pb-5 text-sm text-muted">{a}</p>}
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted">Customer testimonials will be added after launch.</p>
    </Section>
  );
}

export function CTA({ onStart }: { onStart: () => void }) {
  return <Section><div className="rounded-2xl border border-line bg-gradient-to-br from-card to-panel p-10 text-center"><h2 className="text-3xl font-semibold">Ready to prove your discipline?</h2><button onClick={onStart} className={btnP + " mt-6"}>Start Evaluation</button></div></Section>;
}

export function Footer({ onStart }: { onStart: () => void }) {
  const cols: [string, string[]][] = [["Company", ["About", "Contact", "FAQ"]], ["Programs", evaluationPrograms.map(p => p.label)], ["Legal", ["Terms & Conditions", "Privacy Policy", "Refund Policy", "Risk Disclosure"]], ["Support", ["Contact Support"]]];
  return (
    <footer className="border-t border-line bg-panel pt-16 pb-10">
      <div className={wrap}>
        <div className="grid gap-10 md:grid-cols-5">
          <div className="md:col-span-1"><Logo /><p className="mt-3 text-sm text-muted">{siteConfig.tagline}</p></div>
          {cols.map(([h, ls]) => <div key={h}><h4 className="text-sm font-semibold">{h}</h4><ul className="mt-4 space-y-2 text-sm text-muted">{ls.map(l => <li key={l}><a href={h === "Programs" ? "#programs" : "#"} onClick={h === "Programs" ? (e) => { e.preventDefault(); onStart(); } : undefined} className="hover:text-fg">{l}</a></li>)}</ul></div>)}
        </div>
        <p className="mt-12 border-t border-line pt-6 text-xs text-muted">Trading involves substantial risk. Evaluation programs are subject to the applicable terms and conditions. © {new Date().getFullYear()} {siteConfig.brandName}.</p>
      </div>
    </footer>
  );
}