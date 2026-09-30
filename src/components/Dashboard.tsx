import { useEffect, useState } from "react";
import { instruments, usd } from "../config";
import { Logo } from "./Sections";
import { useStore, closePosition, type Position, type ClosedPosition } from "../store";

export type DashboardTab = "overview" | "open" | "closed" | "transactions";

const livePrice = (entry: number, tick: number, i: number) => entry + Math.sin(tick / (i + 3)) * entry * 0.00018;

function PositionsTable({ rows, open, onClose }: { rows: (Position | ClosedPosition)[]; open: boolean; onClose?: (id: string) => void }) {
  const headers = open ? ["Symbol","Side","Lots","Entry","Current","SL / TP","P&L",""] : ["Symbol","Side","Lots","Entry","Exit","P&L","Opened","Closed"];
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="bg-panel text-muted"><tr>{headers.map(h => <th key={h} className="p-4 text-left font-medium">{h}</th>)}</tr></thead>
        <tbody>{rows.length ? rows.map(p => {
          const digits = instruments.find(x => x.symbol === p.symbol)?.digits ?? 2;
          return <tr key={p.id} className="border-t border-line">
            <td className="p-4"><p className="font-semibold">{p.symbol}</p><p className="text-xs text-muted">{instruments.find(x => x.symbol === p.symbol)?.type}</p></td>
            <td className={`p-4 font-semibold ${p.side === "Buy" ? "text-gain" : "text-loss"}`}>{p.side}</td>
            <td className="p-4 tabular-nums">{p.lots.toFixed(2)}</td>
            <td className="p-4 tabular-nums">{p.entry.toFixed(digits)}</td>
            <td className="p-4 tabular-nums">{open ? p.current.toFixed(digits) : (p as ClosedPosition).exit.toFixed(digits)}</td>
            {open ? <>
              <td className="p-4 text-muted">{p.sl?.toFixed(digits) ?? "—"} / {p.tp?.toFixed(digits) ?? "—"}</td>
              <td className={`p-4 font-semibold tabular-nums ${p.pnl >= 0 ? "text-gain" : "text-loss"}`}>{usd(p.pnl)}</td>
              <td className="p-4"><button onClick={() => onClose?.(p.id)} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-fg">Close</button></td>
            </> : <>
              <td className={`p-4 font-semibold tabular-nums ${p.pnl >= 0 ? "text-gain" : "text-loss"}`}>{usd(p.pnl)}</td>
              <td className="p-4 text-muted">{new Date(p.openedAt).toLocaleDateString()}</td>
              <td className="p-4 text-muted">{new Date((p as ClosedPosition).closedAt).toLocaleDateString()}</td>
            </>}
          </tr>;
        }) : <tr><td colSpan={8} className="p-12 text-center text-muted">No {open ? "open" : "closed"} positions yet.</td></tr>}</tbody>
      </table>
    </div>
  );
}

export function Dashboard({ tab, onTabChange, onHome, onDeposit, onWithdraw, onLogout }: {
  tab: DashboardTab; onTabChange: (tab: DashboardTab) => void; onHome: () => void; onDeposit: () => void; onWithdraw: () => void; onLogout: () => void;
}) {
  const { user, account, openPositions, closedPositions, deposits, withdrawals } = useStore();
  const [tick, setTick] = useState(() => Date.now());
  useEffect(() => { const id = window.setInterval(() => setTick(Date.now()), 1000); return () => window.clearInterval(id); }, []);

  const liveOpen = openPositions.map((p, i) => {
    const current = livePrice(p.entry, tick / 1000, i);
    const direction = p.side === "Buy" ? 1 : -1;
    const pnl = direction * (current - p.entry) * p.lots * 100;
    return { ...p, current, pnl };
  });
  const floating = liveOpen.reduce((sum, p) => sum + p.pnl, 0);
  const equity = account.balance + floating;
  const usedMargin = Math.min(account.balance * 0.08, Math.max(0, liveOpen.length * account.balance * 0.02));
  const freeMargin = Math.max(0, equity - usedMargin);

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-card p-5 lg:block">
        <button onClick={onHome} className="mb-8"><Logo /></button>
        <div className="space-y-1">
          {([["overview","Overview"],["open","Open Positions"],["closed","Closed Positions"],["transactions","Transactions"]] as const).map(([id,label]) =>
            <button key={id} onClick={() => onTabChange(id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${tab === id ? "bg-brand text-white" : "text-muted hover:bg-panel hover:text-fg"}`}>{label}</button>
          )}
        </div>
        <div className="mt-8 border-t border-line pt-6 space-y-2">
          <button onClick={onDeposit} className="w-full rounded-xl bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand2">Deposit</button>
          <button onClick={onWithdraw} className="w-full rounded-xl border border-line px-3 py-3 text-sm font-semibold hover:border-fg">Withdraw</button>
        </div>
        <button onClick={onLogout} className="mt-8 text-sm text-muted hover:text-fg">Log out</button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-line bg-card">
          <div className="flex h-16 items-center justify-between px-5 lg:px-8">
            <button onClick={onHome} className="lg:hidden"><Logo /></button>
            <span className="text-sm text-muted">{user}</span>
            <div className="flex gap-2 lg:hidden"><button onClick={onDeposit} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">Deposit</button><button onClick={onWithdraw} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold">Withdraw</button></div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm text-muted">Trading account</p><h1 className="mt-1 text-3xl font-semibold">Dashboard</h1></div>
            <span className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold">Account {account.id}</span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Balance", usd(account.balance), ""],
              ["Equity", usd(equity), ""],
              ["Floating P&L", usd(floating), floating >= 0 ? "text-gain" : "text-loss"],
              ["Used Margin", usd(usedMargin), ""],
              ["Free Margin", usd(freeMargin), ""],
            ].map(([label, value, cls]) => <div key={label} className="rounded-2xl border border-line bg-card p-5"><p className="text-xs text-muted">{label}</p><p className={`mt-2 font-display text-2xl font-bold ${cls}`}>{value}</p></div>)}
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-line pb-2 lg:hidden">
            {([["overview","Overview"],["open","Open Positions"],["closed","Closed Positions"],["transactions","Transactions"]] as const).map(([id,label]) =>
              <button key={id} onClick={() => onTabChange(id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${tab === id ? "bg-brand text-white" : "border border-line bg-card"}`}>{label}</button>
            )}
          </div>

          {tab === "overview" && <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
            <section>
              <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Open Positions</h2><button onClick={() => onTabChange("open")} className="text-sm font-semibold text-brand">View all</button></div>
              <PositionsTable rows={liveOpen.slice(0,4)} open onClose={closePosition} />
            </section>
            <section className="rounded-2xl border border-line bg-card p-5">
              <h2 className="text-lg font-semibold">Account snapshot</h2>
              <div className="mt-5 space-y-4 text-sm">
                {[["Open positions", String(liveOpen.length)],["Closed positions", String(closedPositions.length)],["Base currency","USD"],["Trading status","Active"]].map(([k,v]) => <div key={k} className="flex justify-between border-b border-line pb-3 last:border-0"><span className="text-muted">{k}</span><span className="font-semibold">{v}</span></div>)}
              </div>
            </section>
          </div>}

          {tab === "open" && <section className="mt-8"><h2 className="mb-4 text-lg font-semibold">Open Positions</h2><PositionsTable rows={liveOpen} open onClose={closePosition} /></section>}
          {tab === "closed" && <section className="mt-8"><h2 className="mb-4 text-lg font-semibold">Closed Positions</h2><PositionsTable rows={closedPositions} open={false} /></section>}
          {tab === "transactions" && <section className="mt-8 grid gap-6 xl:grid-cols-2">
            <TransactionTable title="Deposits" rows={deposits.map(x => ({id:x.id, method:x.method, amount:x.amount, status:x.status, date:x.createdAt}))} />
            <TransactionTable title="Withdrawals" rows={withdrawals.map(x => ({id:x.id, method:x.method, amount:x.amount, status:x.status, date:x.createdAt}))} />
          </section>}
        </main>
      </div>
    </div>
  );
}

function TransactionTable({ title, rows }: { title: string; rows: {id:string;method:string;amount:number;status:string;date:string}[] }) {
  return <div className="overflow-hidden rounded-2xl border border-line bg-card">
    <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">{title}</h2></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-panel text-muted"><tr>{["ID","Method","Amount","Status","Date"].map(x=><th key={x} className="p-4 text-left font-medium">{x}</th>)}</tr></thead><tbody>{rows.length ? rows.map(r=><tr key={r.id} className="border-t border-line"><td className="p-4 font-mono text-xs">{r.id}</td><td className="p-4">{r.method === "UPI" ? "UPI P2P" : "USDT BEP-20"}</td><td className="p-4 font-semibold">{usd(r.amount)}</td><td className="p-4">{r.status}</td><td className="p-4 text-muted">{new Date(r.date).toLocaleString()}</td></tr>) : <tr><td colSpan={5} className="p-10 text-center text-muted">No {title.toLowerCase()} yet.</td></tr>}</tbody></table></div>
  </div>;
}
