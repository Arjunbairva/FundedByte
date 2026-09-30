import { useState, type ReactNode } from "react";
import { siteConfig, evaluationPrograms, baseRules as R, comparisonRows, faqs, usd, profitSplitExample as ex, type Program } from "../config";

const wrap = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const btn = "inline-flex min-h-11 items-center justify-center rounded-lg px-5 text-[0.9375rem] font-semibold transition-colors";
const btnP = `${btn} bg-brand text-white hover:bg-brand2`;
const btnS = `${btn} border border-line bg-card text-fg hover:border-fg`;
const btnN = `${btn} bg-white text-night hover:bg-night-fg`;
const btnNS = `${btn} border border-white/40 text-white hover:border-white`;
const lead = "max-w-[62ch] text-muted";

const Section = ({ id, tone, children }: { id?: string; tone?: "alt" | "night"; children: ReactNode }) => (
  <section id={id} className={`scroll-mt-16 py-20 sm:py-24 ${tone === "alt" ? "bg-panel" : tone === "night" ? "on-night bg-night text-night-fg" : ""}`}><div className={wrap}>{children}</div></section>
);
const Head = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="mb-12 max-w-2xl"><h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">{title}</h2>{sub && <p className={lead + " mt-4"}>{sub}</p>}</div>
);
const Check = () => <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="mt-1 shrink-0"><path d="M4 9.5l3.2 3.2L14 5.8" fill="none" stroke="#3DDC97" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>;

export const Logo = ({ dark }: { dark?: boolean }) => (
  <span className={`inline-flex items-center gap-2 font-display text-xl font-bold tracking-tight ${dark ? "text-white" : "text-fg"}`}>
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#2348D9" /><path d="M6 16l4-4 3 3 5-6" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    {siteConfig.brandName}
  </span>
);

export function Navbar({ onLogin, onStart, user, onDash, onLogout }: { onLogin: () => void; onStart: () => void; user?: string | null; onDash?: () => void; onLogout?: () => void }) {
  const [open, setOpen] = useState(false);
  const links: [string, string][] = [["Programs", "programs"], ["How it works", "how"], ["Rules", "rules"], ["FAQ", "faq"]];
  const auth = (close: boolean) => user
    ? <><button onClick={() => { close && setOpen(false); onLogout?.(); }} className={btnS}>Log out</button><button onClick={() => { close && setOpen(false); onDash?.(); }} className={btnP}>Dashboard</button></>
    : <><button onClick={() => { close && setOpen(false); onLogin(); }} className={btnS}>Log in</button><button onClick={() => { close && setOpen(false); onStart(); }} className={btnP}>Start evaluation</button></>;
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-card/95 backdrop-blur">
      <a href="#main" className="sr-only rounded-lg bg-brand px-4 py-2 font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-3">Skip to content</a>
      <nav className={wrap + " flex h-16 items-center justify-between"} aria-label="Main">
        <a href="#" aria-label={`${siteConfig.brandName} home`}><Logo /></a>
        <ul className="hidden items-center gap-1 md:flex">{links.map(([l, id]) => <li key={id}><a href={`#${id}`} className="rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-muted hover:text-fg">{l}</a></li>)}</ul>
        <div className="hidden items-center gap-3 md:flex">{auth(false)}</div>
        <button className="grid h-11 w-11 place-items-center rounded-lg border border-line md:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label="Menu" onClick={() => setOpen(!open)}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d={open ? "M4 4l12 12M16 4L4 16" : "M3 6h14M3 10h14M3 14h14"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>
      </nav>
      {open && <div id="mobile-menu" className="border-t border-line bg-card px-5 pb-5 md:hidden">
        {links.map(([l, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block border-b border-line py-3.5 font-medium">{l}</a>)}
        <div className="mt-4 grid grid-cols-2 gap-3">{auth(true)}</div>
      </div>}
    </header>
  );
}

// Hero visual: the three rules drawn as a chart. Illustrative path, not real results.
function RulesChart() {
  const pct = [0, 1.2, 0.4, 2.5, 1.4, 3.8, 2.2, 4.6, 3.1, 5.9, 4.4, 7.2, 6.1, 8.4, 7.3, 9.6, 10.4];
  const top = R.profitTarget + 2, bot = -R.maxDrawdown - 2, y = (v: number) => 20 + ((top - v) / (top - bot)) * 280;
  const x = (i: number) => 24 + (i / (pct.length - 1)) * 472;
  const pts = pct.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const last = pct.length - 1;
  return (
    <figure className="rounded-2xl border border-night-line bg-white/5 p-5 sm:p-6">
      <svg viewBox="0 0 520 320" className="w-full" role="img" aria-label={`Illustrative equity curve rising inside a range between a minus ${R.maxDrawdown} percent maximum drawdown floor and a ${R.profitTarget} percent profit target`}>
        <rect x="24" y={y(R.profitTarget)} width="472" height={y(-R.maxDrawdown) - y(R.profitTarget)} fill="#fff" opacity=".05" />
        <line x1="24" x2="496" y1={y(0)} y2={y(0)} stroke="#2A3B57" strokeWidth="1" />
        <line x1="24" x2="496" y1={y(R.profitTarget)} y2={y(R.profitTarget)} stroke="#3DDC97" strokeWidth="2" strokeDasharray="6 6" />
        <line x1="24" x2="496" y1={y(-R.maxDrawdown)} y2={y(-R.maxDrawdown)} stroke="#FF8A8A" strokeWidth="2" strokeDasharray="6 6" />
        <polyline points={pts} fill="none" stroke="#9DB8FF" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" className="draw" />
        <circle cx={x(last)} cy={y(pct[last])} r="6" fill="#3DDC97" />
      </svg>
      <figcaption className="mt-4 space-y-2 text-[0.9375rem] text-night-muted">
        <div className="flex items-center gap-3"><svg width="28" height="8" aria-hidden="true"><line x1="0" x2="28" y1="4" y2="4" stroke="#3DDC97" strokeWidth="2" strokeDasharray="5 4" /></svg>Profit target: +{R.profitTarget}%</div>
        <div className="flex items-center gap-3"><svg width="28" height="8" aria-hidden="true"><line x1="0" x2="28" y1="4" y2="4" stroke="#FF8A8A" strokeWidth="2" strokeDasharray="5 4" /></svg>Maximum drawdown: −{R.maxDrawdown}%</div>
        <p className="pt-1 text-sm">Illustrative path only. Not real trading results.</p>
      </figcaption>
    </figure>
  );
}

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="on-night bg-night py-16 text-night-fg sm:py-24">
      <div className={wrap + " grid items-center gap-14 lg:grid-cols-[1.1fr_1fr]"}>
        <div>
          <h1 className="text-[2.5rem] font-bold leading-[1.05] tracking-[-0.03em] text-white sm:text-6xl">One evaluation. Three rules. No time limit.</h1>
          <p className="mt-6 max-w-[52ch] text-lg text-night-muted">Reach a {R.profitTarget}% profit target without breaching a {R.dailyDrawdown}% daily or {R.maxDrawdown}% maximum drawdown. No minimum trading days and no deadline.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><button onClick={onStart} className={btnN}>Start evaluation</button><a href="#programs" className={btnNS}>Compare account sizes</a></div>
          <ul className="mt-10 space-y-3 text-[0.9375rem]">
            {[`${R.profitSplit}% of eligible profit goes to you`, "News, weekend and EA trading allowed", "Every rule is published before you buy"].map(t => <li key={t} className="flex gap-3"><Check />{t}</li>)}
          </ul>
        </div>
        <RulesChart />
      </div>
    </section>
  );
}

function ProgramCard({ p, onBuy }: { p: Program; onBuy: (p: Program) => void }) {
  const rows: [string, string][] = [["Profit target", p.rules.profitTarget + "%"], ["Maximum drawdown", p.rules.maxDrawdown + "%"], ["Daily drawdown", p.rules.dailyDrawdown + "%"], ["Profit split", p.rules.profitSplit + "%"]];
  const d = p.popular;
  return (
    <article className={`flex flex-col rounded-2xl p-6 ${d ? "on-night bg-night text-night-fg" : "border border-line bg-card"}`}>
      <div className="flex items-center justify-between"><h3 className="text-xl font-semibold">{usd(p.balance)} account</h3>{d && <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold text-night">Most popular</span>}</div>
      <p className="mt-5 font-display text-4xl font-bold tracking-tight tabular-nums">{usd(p.fee)}</p>
      <p className={`text-sm ${d ? "text-night-muted" : "text-muted"}`}>Evaluation fee</p>
      <dl className="my-6 flex-1 text-[0.9375rem]">{rows.map(([k, v]) => <div key={k} className={`flex justify-between gap-3 border-t py-2.5 ${d ? "border-night-line" : "border-line"}`}><dt className={d ? "text-night-muted" : "text-muted"}>{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>)}</dl>
      <button onClick={() => onBuy(p)} className={d ? btnN : btnP}>Start {p.label} evaluation</button>
    </article>
  );
}

export function Programs({ onBuy }: { onBuy: (p: Program) => void }) {
  return (
    <Section id="programs">
      <Head title="Choose your account size" sub="The same rules apply to every size. Only the balance and fee change." />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{evaluationPrograms.map(p => <ProgramCard key={p.id} p={p} onBuy={onBuy} />)}</div>
      <h3 className="mb-4 mt-16 text-xl font-semibold">Compare every rule</h3>
      <div className="overflow-x-auto rounded-2xl border border-line bg-card" tabIndex={0} role="region" aria-label="Program comparison table">
        <table className="w-full min-w-[640px] text-[0.9375rem] tabular-nums">
          <caption className="sr-only">Evaluation rules by account size</caption>
          <thead><tr className="border-b border-line"><th scope="col" className="sticky left-0 bg-card p-4 text-left font-semibold">Rule</th>{evaluationPrograms.map(p => <th scope="col" key={p.id} className="p-4 text-right font-semibold">{p.label}</th>)}</tr></thead>
          <tbody>{comparisonRows.map(r => <tr key={r.label} className="border-t border-line first:border-0"><th scope="row" className="sticky left-0 bg-card p-4 text-left font-normal text-muted">{r.label}</th>{evaluationPrograms.map(p => <td key={p.id} className="p-4 text-right">{r.get(p)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </Section>
  );
}

export function HowItWorks() {
  const steps = [["Choose an account size", "Pick the balance that fits your strategy and read the rules before you pay."], ["Trade your strategy", "Stay inside the drawdown limits while you work toward the profit target."], ["Complete the evaluation", "Hit the target without breaking a rule and the evaluation is complete."]];
  return (
    <Section id="how" tone="alt">
      <Head title="How it works" />
      <ol className="grid gap-10 md:grid-cols-3">{steps.map(([t, d], i) => <li key={t} className="border-t-2 border-fg pt-5"><span className="font-display text-4xl font-bold text-brand">{i + 1}</span><h3 className="mt-3 text-xl font-semibold">{t}</h3><p className="mt-2 text-muted">{d}</p></li>)}</ol>
    </Section>
  );
}

export function Features() {
  const f = [["Rules you can read first", "Every condition is published before you purchase."], ["Two risk limits", "One profit target and two drawdown limits, without extra conditions."], ["Information traders need", "Balance, equity, limits and trade history on one screen."], ["Room to grow", "Account sizes from $5K to $100K under identical rules."]];
  return (
    <Section>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
        <div><h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">Why {siteConfig.brandName}</h2><p className={lead + " mt-4"}>A trading evaluation should be easy to understand before it is hard to pass.</p></div>
        <dl className="divide-y divide-line border-y border-line">{f.map(([t, d]) => <div key={t} className="grid gap-1 py-5 sm:grid-cols-[14rem_1fr] sm:gap-6"><dt className="font-display text-lg font-semibold">{t}</dt><dd className="text-muted">{d}</dd></div>)}</dl>
      </div>
    </Section>
  );
}

export function Rules() {
  const items: [string, string][] = [["Profit target", R.profitTarget + "%"], ["Daily drawdown", R.dailyDrawdown + "%"], ["Maximum drawdown", R.maxDrawdown + "%"], ["Time limit", R.timeLimit]];
  return (
    <Section id="rules" tone="alt">
      <Head title="Know the rules before you trade" sub="These are the conditions that decide whether an evaluation is completed." />
      <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-line py-8 lg:grid-cols-4">{items.map(([k, v]) => <div key={k}><dd className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{v}</dd><dt className="mt-1 text-muted">{k}</dt></div>)}</dl>
      <details className="group mt-8 max-w-3xl rounded-xl border border-line bg-card">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 font-semibold">What is daily drawdown?<span aria-hidden="true" className="text-xl text-brand transition-transform group-open:rotate-45">+</span></summary>
        <div className="space-y-3 px-5 pb-5 text-muted">
          <p>Daily drawdown is the most you can lose in a single trading day: {R.dailyDrawdown}% of the starting balance. It resets at {R.dailyResetUtc}.</p>
          <p>The exact calculation will be set out in the official trading rules. Read them in full before you buy an evaluation.</p>
        </div>
      </details>
    </Section>
  );
}

export function ProfitSplit() {
  return (
    <Section>
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div><h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">Your performance matters</h2><p className="mt-6 font-display text-7xl font-bold tracking-tight text-brand sm:text-8xl">{R.profitSplit}%</p><p className={lead + " mt-2"}>of eligible trading profit goes to the trader.</p></div>
        <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
          <h3 className="text-lg font-semibold">Example</h3>
          <p className="mt-1 text-muted">If eligible trading profit is {usd(ex.profit)}:</p>
          <dl className="mt-5 divide-y divide-line border-y border-line tabular-nums">
            <div className="flex justify-between py-3"><dt>Trader</dt><dd className="font-semibold text-gain">{usd(ex.trader)}</dd></div>
            <div className="flex justify-between py-3"><dt>{siteConfig.brandName}</dt><dd className="font-semibold">{usd(ex.firm)}</dd></div>
          </dl>
          <p className="mt-4 text-sm text-muted">Illustrative only. It does not imply that any trader will be profitable.</p>
        </div>
      </div>
    </Section>
  );
}

export function FAQ() {
  const [o, setO] = useState<number | null>(0);
  return (
    <Section id="faq" tone="alt">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.8fr]">
        <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] sm:text-4xl">Frequently asked questions</h2>
        <div className="divide-y divide-line border-y border-line">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <h3><button id={`faq-q-${i}`} aria-expanded={o === i} aria-controls={`faq-${i}`} onClick={() => setO(o === i ? null : i)} className="flex min-h-14 w-full items-center justify-between gap-4 py-4 text-left text-[1.0625rem] font-semibold">{q}<span aria-hidden="true" className={`text-xl text-brand transition-transform ${o === i ? "rotate-45" : ""}`}>+</span></button></h3>
              {o === i && <div id={`faq-${i}`} role="region" aria-labelledby={`faq-q-${i}`}><p className="max-w-[62ch] pb-5 text-muted">{a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

export function CTA({ onStart }: { onStart: () => void }) {
  return (
    <Section tone="night">
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div><h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.02em] text-white sm:text-4xl">Read the rules, then pick your account size.</h2><p className="mt-3 text-night-muted">You can see every condition before you pay.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row"><button onClick={onStart} className={btnN}>Start evaluation</button><a href="#rules" className={btnNS}>Review the rules</a></div>
      </div>
    </Section>
  );
}

export function Footer() {
  const links: [string, string][] = [["Programs", "programs"], ["How it works", "how"], ["Rules", "rules"], ["FAQ", "faq"]];
  return (
    <footer className="on-night bg-night py-14 text-night-muted">
      <div className={wrap}>
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div><Logo dark /><p className="mt-3 max-w-xs">{siteConfig.tagline}</p></div>
          <nav aria-label="Footer"><h2 className="text-base font-semibold text-white">Explore</h2><ul className="mt-4 space-y-2">{links.map(([l, id]) => <li key={id}><a href={`#${id}`} className="hover:text-white">{l}</a></li>)}</ul></nav>
          <div><h2 className="text-base font-semibold text-white">Legal</h2><p className="mt-4 text-[0.9375rem]">Terms, privacy, refund and risk documents will be published before launch.</p></div>
        </div>
        <p className="mt-12 border-t border-night-line pt-6 text-sm">Trading involves substantial risk of loss. Evaluation programs are subject to the applicable terms and conditions. © {new Date().getFullYear()} {siteConfig.brandName}.</p>
      </div>
    </footer>
  );
}
