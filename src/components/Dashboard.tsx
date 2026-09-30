import { useState } from "react";
import { baseRules as R, usd } from "../config";
import { metrics, signOut, useStore } from "../store";
import { Logo } from "./Sections";

const Bar = ({ label, value, max, tone, note }: { label: string; value: number; max: number; tone: string; note: string }) => (
  <div><div className="mb-1 flex justify-between text-xs"><span className="text-muted">{label}</span><span>{note}</span></div>
    <div className="h-2 rounded-full bg-ink" role="progressbar" aria-label={label} aria-valuenow={Math.round(Math.max(0, Math.min(1, value / max)) * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%` }} /></div></div>
);

export function Dashboard({ onHome }: { onHome: () => void }) {
  const { user, accounts } = useStore();
  const [sel, setSel] = useState(0);
  const a = accounts[Math.min(sel, accounts.length - 1)];
  const m = a && metrics(a);
  const lo = m ? Math.min(...m.curve) : 0, hi = m ? Math.max(...m.curve) : 1;
  const pts = m ? m.curve.map((v, i) => `${(i / (m.curve.length - 1)) * 400},${160 - ((v - lo) / (hi - lo || 1)) * 140}`).join(" ") : "";
  const tone = m?.status === "Failed" ? "text-red-400" : "text-brand";
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-panel"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <button onClick={onHome} aria-label="Home"><Logo /></button>
        <div className="flex items-center gap-4 text-sm text-muted"><span className="hidden sm:inline">{user}</span><button onClick={() => { signOut(); onHome(); }} className="hover:text-fg">Logout</button></div></div></header>
      <main className="rise mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-2xl font-semibold">Trader Dashboard</h1>
        {!a || !m ? (
          <div className="mt-8 rounded-2xl border border-line bg-card p-10 text-center"><p className="text-muted">You have no evaluation accounts yet.</p>
            <button onClick={onHome} className="mt-5 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand2">Choose an Evaluation</button></div>
        ) : (<>
          <div className="mt-5 flex flex-wrap gap-2">{accounts.map((x, i) => <button key={x.id} onClick={() => setSel(i)} aria-pressed={a.id === x.id} className={`rounded-lg border px-3 py-2 text-xs ${a.id === x.id ? "border-brand text-brand" : "border-line text-muted"}`}>{x.id} · {x.label}</button>)}</div>
          <p className="mt-4 rounded-lg border border-line bg-card px-4 py-2 text-xs text-muted">Demo account: trades shown are simulated and no real payment or trading occurred.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {([["Status", m.status, tone], ["Balance", usd(a.balance), ""], ["Equity", usd(m.eq), ""], ["Profit", usd(m.profit), m.profit >= 0 ? "text-brand" : "text-red-400"], ["Today", usd(m.daily), m.daily >= 0 ? "text-brand" : "text-red-400"]] as const).map(([k, v, c]) =>
              <div key={k} className="rounded-xl border border-line bg-card p-4"><div className="text-[11px] text-muted">{k}</div><div className={`mt-1 font-semibold ${c}`}>{v}</div></div>)}
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            <section className="rounded-2xl border border-line bg-card p-5 lg:col-span-2"><h2 className="mb-3 text-sm font-semibold">Equity Curve</h2>
              <svg viewBox="0 0 400 170" className="w-full" role="img" aria-label="Equity curve"><polyline points={pts} fill="none" stroke="#16C784" strokeWidth="2" strokeLinejoin="round" /></svg></section>
            <section className="space-y-5 rounded-2xl border border-line bg-card p-5"><h2 className="text-sm font-semibold">Objectives</h2>
              <Bar label={`Profit target ${R.profitTarget}%`} value={m.profit} max={m.target - a.balance} tone="bg-brand" note={`${usd(Math.max(m.profit, 0))} / ${usd(m.target - a.balance)}`} />
              <Bar label={`Max drawdown ${R.maxDrawdown}%`} value={Math.max(0, a.balance - m.eq)} max={a.balance - m.floor} tone="bg-amber-400" note={`Floor ${usd(m.floor)}`} />
              <Bar label={`Daily drawdown ${R.dailyDrawdown}%`} value={Math.max(0, -m.daily)} max={-m.dailyFloor} tone="bg-amber-400" note={`Limit ${usd(m.dailyFloor)}`} /></section>
          </div>
          <section className="mt-6 overflow-x-auto rounded-2xl border border-line" tabIndex={0} aria-label="Trade history">
            <table className="w-full min-w-[520px] text-sm"><thead className="bg-card text-muted"><tr>{["#", "Symbol", "Side", "Lots", "P&L"].map(h => <th key={h} className="p-3 text-left font-medium">{h}</th>)}</tr></thead>
              <tbody>{[...a.trades].reverse().map(t => <tr key={t.id} className="border-t border-line/60"><td className="p-3 text-muted">{t.id}</td><td className="p-3">{t.symbol}</td><td className="p-3">{t.side}</td><td className="p-3">{t.lots}</td><td className={`p-3 ${t.pnl >= 0 ? "text-brand" : "text-red-400"}`}>{usd(t.pnl)}</td></tr>)}</tbody></table></section>
        </>)}
      </main>
    </div>
  );
}
