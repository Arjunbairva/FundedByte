import { useEffect, useMemo, useState } from "react";
import { instruments, usd, type Position, type ClosedPosition } from "../config";
import { Logo } from "./Sections";
import { useStore, closePosition, createPosition } from "../store";

export type DashboardTab = "overview" | "open" | "closed" | "transactions";
type MarketStatus = "loading" | "live" | "error";
type MarketPrice = { symbol: string; price: number | null; error?: string };

const contractSize = (symbol: string) => {
  if (symbol === "XAU/USD") return 100;
  if (symbol === "XAG/USD") return 5000;
  if (symbol === "USOIL") return 1000;
  return 100000;
};

function positionPnl(position: Position, current: number) {
  const move = (position.side === "Buy" ? 1 : -1) * (current - position.entry);
  const raw = move * position.lots * contractSize(position.symbol);
  return position.symbol === "USD/JPY" ? raw / current : raw;
}

function positionMargin(position: Position, current: number) {
  const notional = position.symbol === "USD/JPY"
    ? position.lots * contractSize(position.symbol)
    : position.lots * contractSize(position.symbol) * current;
  return notional / 100;
}

function priceDigits(symbol: string) {
  return instruments.find(x => x.symbol === symbol)?.digits ?? 2;
}

function PositionsTable({
  rows, open, onClose, prices
}: {
  rows: (Position | ClosedPosition)[];
  open: boolean;
  onClose?: (id: string) => void;
  prices: Record<string, number>;
}) {
  const headers = open
    ? ["Symbol", "Side", "Lots", "Entry", "Current", "SL / TP", "P&L", ""]
    : ["Symbol", "Side", "Lots", "Entry", "Exit", "P&L", "Opened", "Closed"];

  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-card">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-panel text-muted"><tr>{headers.map(h => <th key={h} className="p-4 text-left font-medium">{h}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map(p => {
            const digits = priceDigits(p.symbol);
            const live = open ? prices[p.symbol] : undefined;
            const current = open ? live ?? null : (p as ClosedPosition).exit;
            const pnl = open && current !== null ? positionPnl(p, current) : p.pnl;

            return (
              <tr key={p.id} className="border-t border-line">
                <td className="p-4"><p className="font-semibold">{p.symbol}</p><p className="text-xs text-muted">{instruments.find(x => x.symbol === p.symbol)?.type}</p></td>
                <td className={`p-4 font-semibold ${p.side === "Buy" ? "text-gain" : "text-loss"}`}>{p.side}</td>
                <td className="p-4 tabular-nums">{p.lots.toFixed(2)}</td>
                <td className="p-4 tabular-nums">{p.entry.toFixed(digits)}</td>
                <td className="p-4 tabular-nums">{current === null ? "—" : current.toFixed(digits)}</td>
                {open ? (
                  <>
                    <td className="p-4 text-muted">{p.sl?.toFixed(digits) ?? "—"} / {p.tp?.toFixed(digits) ?? "—"}</td>
                    <td className={`p-4 font-semibold tabular-nums ${pnl >= 0 ? "text-gain" : "text-loss"}`}>{current === null ? "—" : usd(pnl)}</td>
                    <td className="p-4"><button disabled={current === null} onClick={() => current !== null && onClose?.(p.id)} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-fg disabled:cursor-not-allowed disabled:opacity-40">Close</button></td>
                  </>
                ) : (
                  <>
                    <td className={`p-4 font-semibold tabular-nums ${p.pnl >= 0 ? "text-gain" : "text-loss"}`}>{usd(p.pnl)}</td>
                    <td className="p-4 text-muted">{new Date(p.openedAt).toLocaleString()}</td>
                    <td className="p-4 text-muted">{new Date((p as ClosedPosition).closedAt).toLocaleString()}</td>
                  </>
                )}
              </tr>
            );
          }) : <tr><td colSpan={8} className="p-12 text-center text-muted">No {open ? "open" : "closed"} positions yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function TradingViewChart({ symbol }: { symbol: string }) {
  const tvSymbol = symbol === "USOIL" ? "TVC:USOIL" : `OANDA:${symbol.replace("/", "")}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="font-semibold">{symbol} chart</h2>
          <p className="mt-1 text-xs text-muted">TradingView interactive chart</p>
        </div>
        <span className="rounded-full bg-panel px-2.5 py-1 text-xs font-semibold text-muted">TradingView</span>
      </div>
      <div className="h-[520px]">
        <iframe
          title={`TradingView ${symbol} chart`}
          src={`https://www.tradingview.com/widgetembed/?frameElementId=tv_${symbol.replace(/[^a-zA-Z0-9]/g, "")}&symbol=${encodeURIComponent(tvSymbol)}&interval=15&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=f4f7fb&theme=light&style=1&timezone=Asia%2FKolkata&withdateranges=1&hideideas=1`}
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function MarketWatch({ prices, status, onTrade }: {
  prices: Record<string, number>;
  status: MarketStatus;
  onTrade: (symbol: string) => void;
}) {
  return (
    <section className="rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div><h2 className="font-semibold">Market watch</h2><p className="mt-1 text-xs text-muted">Twelve Data prices · refreshed every 60 seconds</p></div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "live" ? "bg-green-50 text-green-700" : "bg-panel text-muted"}`}>{status === "live" ? "LIVE" : status === "loading" ? "CONNECTING" : "UNAVAILABLE"}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-sm">
          <thead className="bg-panel text-muted"><tr>{["Instrument","Type","Price","Action"].map(h => <th key={h} className="p-4 text-left font-medium">{h}</th>)}</tr></thead>
          <tbody>{instruments.map(item => {
            const price = prices[item.symbol];
            return <tr key={item.symbol} className="border-t border-line">
              <td className="p-4 font-semibold">{item.symbol}<span className="ml-2 text-xs font-normal text-muted">{item.name}</span></td>
              <td className="p-4 text-muted">{item.type}</td>
              <td className="p-4 font-display font-semibold tabular-nums">{price === undefined ? "—" : price.toFixed(item.digits)}</td>
              <td className="p-4"><button disabled={price === undefined} onClick={() => onTrade(item.symbol)} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand2 disabled:cursor-not-allowed disabled:opacity-40">Trade</button></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </section>
  );
}

function TradeModal({
  symbol, price, freeMargin, onClose, onSubmit
}: {
  symbol: string | null;
  price?: number;
  freeMargin: number;
  onClose: () => void;
  onSubmit: (side: "Buy" | "Sell", lots: number, sl?: number, tp?: number) => void;
}) {
  const [side, setSide] = useState<"Buy" | "Sell">("Buy");
  const [lots, setLots] = useState("0.10");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setSide("Buy"); setLots("0.10"); setSl(""); setTp(""); setError("");
  }, [symbol]);

  if (!symbol || price === undefined) return null;

  const digits = priceDigits(symbol);
  const margin = positionMargin({ symbol, side, lots: Number(lots) || 0, entry: price, current: price, pnl: 0, openedAt: "" } as Position, price);
  const invalid = !Number.isFinite(Number(lots)) || Number(lots) < 0.01 || Number(lots) > 100;

  const submit = () => {
    const lotValue = Number(lots);
    const slValue = sl ? Number(sl) : undefined;
    const tpValue = tp ? Number(tp) : undefined;
    if (invalid) return setError("Lots must be between 0.01 and 100.");
    if (margin > freeMargin) return setError(`Not enough free margin. Required ${usd(margin)}.`);
    if (slValue !== undefined && (!Number.isFinite(slValue) || (side === "Buy" ? slValue >= price : slValue <= price))) return setError("Stop loss must be below the entry for Buy and above it for Sell.");
    if (tpValue !== undefined && (!Number.isFinite(tpValue) || (side === "Buy" ? tpValue <= price : tpValue >= price))) return setError("Take profit must be above the entry for Buy and below it for Sell.");
    onSubmit(side, lotValue, slValue, tpValue);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-line bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between"><div><p className="text-xs text-muted">Paper order</p><h2 className="mt-1 text-xl font-semibold">{symbol}</h2></div><button onClick={onClose} className="text-xl text-muted">×</button></div>
        <div className="mt-5 rounded-xl bg-panel p-4"><p className="text-xs text-muted">Current price</p><p className="mt-1 font-display text-2xl font-bold">{price.toFixed(digits)}</p></div>
        <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setSide("Buy")} className={`rounded-xl py-3 font-semibold ${side === "Buy" ? "bg-gain text-white" : "border border-line"}`}>Buy</button><button onClick={() => setSide("Sell")} className={`rounded-xl py-3 font-semibold ${side === "Sell" ? "bg-loss text-white" : "border border-line"}`}>Sell</button></div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">Lots<input value={lots} onChange={e => setLots(e.target.value)} type="number" min="0.01" max="100" step="0.01" className="mt-2 w-full rounded-xl border border-line bg-panel px-3 py-3 outline-none focus:border-brand" /></label>
          <div className="rounded-xl border border-line p-3"><p className="text-xs text-muted">Margin required</p><p className="mt-1 font-semibold">{usd(margin)}</p></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-sm font-medium">Stop loss<input value={sl} onChange={e => setSl(e.target.value)} placeholder="Optional" type="number" step="any" className="mt-2 w-full rounded-xl border border-line bg-panel px-3 py-3 outline-none focus:border-brand" /></label>
          <label className="text-sm font-medium">Take profit<input value={tp} onChange={e => setTp(e.target.value)} placeholder="Optional" type="number" step="any" className="mt-2 w-full rounded-xl border border-line bg-panel px-3 py-3 outline-none focus:border-brand" /></label>
        </div>
        {error && <p className="mt-3 text-sm text-loss">{error}</p>}
        <button onClick={submit} className={`mt-5 w-full rounded-xl py-3.5 font-semibold text-white ${side === "Buy" ? "bg-gain" : "bg-loss"}`}>{side} {symbol}</button>
        <p className="mt-3 text-center text-xs text-muted">This is a paper trade using the latest Twelve Data price. No broker order is sent.</p>
      </div>
    </div>
  );
}

export function Dashboard({ tab, onTabChange, onHome, onDeposit, onWithdraw, onLogout }: {
  tab: DashboardTab; onTabChange: (tab: DashboardTab) => void; onHome: () => void; onDeposit: () => void; onWithdraw: () => void; onLogout: () => void;
}) {
  const { user, account, openPositions, closedPositions, deposits, withdrawals } = useStore();
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [marketStatus, setMarketStatus] = useState<MarketStatus>("loading");
  const [tradeSymbol, setTradeSymbol] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const symbols = instruments.map(x => x.symbol);

    const load = async () => {
      try {
        const response = await fetch(`/api/market?symbols=${symbols.map(encodeURIComponent).join(",")}`, { cache: "no-store" });
        const payload: { data?: MarketPrice[] } = await response.json();
        if (!response.ok || !payload.data) throw new Error("Market data unavailable");
        if (!active) return;
        const next: Record<string, number> = {};
        payload.data.forEach(row => { if (row.price !== null) next[row.symbol] = row.price; });
        setPrices(next);
        setMarketStatus(Object.keys(next).length ? "live" : "error");
      } catch {
        if (active) setMarketStatus("error");
      }
    };

    load();
    const id = window.setInterval(load, 60000);
    return () => { active = false; window.clearInterval(id); };
  }, []);

  const liveOpen = openPositions.map(p => ({ ...p, current: prices[p.symbol] ?? p.current }));
  const floating = liveOpen.reduce((sum, p) => {
    const price = prices[p.symbol];
    return price === undefined ? sum : sum + positionPnl(p, price);
  }, 0);
  const equity = account.balance + floating;
  const usedMargin = liveOpen.reduce((sum, p) => {
    const price = prices[p.symbol] ?? p.current;
    return sum + positionMargin(p, price);
  }, 0);
  const freeMargin = Math.max(0, equity - usedMargin);

  const closeLivePosition = (id: string) => {
    const position = openPositions.find(p => p.id === id);
    if (!position) return;
    const exit = prices[position.symbol];
    if (exit === undefined) return;
    closePosition(id, exit, positionPnl(position, exit));
  };

  const submitTrade = (side: "Buy" | "Sell", lots: number, sl?: number, tp?: number) => {
    if (!tradeSymbol) return;
    const entry = prices[tradeSymbol];
    if (entry === undefined) return;
    createPosition({ symbol: tradeSymbol, side, lots, entry, current: entry, sl, tp, openedAt: new Date().toISOString() });
    setTradeSymbol(null);
  };

  const selectedPrice = tradeSymbol ? prices[tradeSymbol] : undefined;

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-line bg-card p-5 lg:block">
        <button onClick={onHome} className="mb-8"><Logo /></button>
        <div className="space-y-1">{([["overview","Overview"],["open","Open Positions"],["closed","Closed Positions"],["transactions","Transactions"]] as const).map(([id,label]) =>
          <button key={id} onClick={() => onTabChange(id)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium ${tab === id ? "bg-brand text-white" : "text-muted hover:bg-panel hover:text-fg"}`}>{label}</button>)}</div>
        <div className="mt-8 space-y-2 border-t border-line pt-6"><button onClick={onDeposit} className="w-full rounded-xl bg-brand px-3 py-3 text-sm font-semibold text-white hover:bg-brand2">Deposit</button><button onClick={onWithdraw} className="w-full rounded-xl border border-line px-3 py-3 text-sm font-semibold hover:border-fg">Withdraw</button></div>
        <button onClick={onLogout} className="mt-8 text-sm text-muted hover:text-fg">Log out</button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-line bg-card"><div className="flex h-16 items-center justify-between px-5 lg:px-8"><button onClick={onHome} className="lg:hidden"><Logo /></button><span className="truncate text-sm text-muted">{user}</span><div className="flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${marketStatus === "live" ? "bg-green-50 text-green-700" : "bg-panel text-muted"}`}>{marketStatus === "live" ? "Live market data" : marketStatus === "loading" ? "Connecting…" : "Market data unavailable"}</span><div className="flex gap-2 lg:hidden"><button onClick={onDeposit} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white">Deposit</button><button onClick={onWithdraw} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold">Withdraw</button></div></div></div></header>

        <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted">Trading account</p><h1 className="mt-1 text-3xl font-semibold">Dashboard</h1></div><span className="rounded-full border border-line bg-card px-3 py-1.5 text-xs font-semibold">Paper account · {account.id}</span></div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[["Balance",usd(account.balance),""],["Equity",usd(equity),""],["Floating P&L",marketStatus === "live" ? usd(floating) : "—",floating >= 0 ? "text-gain" : "text-loss"],["Used Margin",usd(usedMargin),""],["Free Margin",marketStatus === "live" ? usd(freeMargin) : "—",""]].map(([label,value,cls]) => <div key={label} className="rounded-2xl border border-line bg-card p-5"><p className="text-xs text-muted">{label}</p><p className={`mt-2 font-display text-2xl font-bold ${cls}`}>{value}</p></div>)}</div>

          <div className="mt-8 flex gap-2 overflow-x-auto border-b border-line pb-2 lg:hidden">{([["overview","Overview"],["open","Open Positions"],["closed","Closed Positions"],["transactions","Transactions"]] as const).map(([id,label]) => <button key={id} onClick={() => onTabChange(id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${tab === id ? "bg-brand text-white" : "border border-line bg-card"}`}>{label}</button>)}</div>

          {tab === "overview" && <div className="mt-8 space-y-6"><MarketWatch prices={prices} status={marketStatus} onTrade={setTradeSymbol} /><TradingViewChart symbol={tradeSymbol ?? "XAU/USD"} /><div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]"><section><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">Open Positions</h2><button onClick={() => onTabChange("open")} className="text-sm font-semibold text-brand">View all</button></div><PositionsTable rows={liveOpen.slice(0,4)} open onClose={closeLivePosition} prices={prices} /></section><section className="rounded-2xl border border-line bg-card p-5"><h2 className="text-lg font-semibold">Account snapshot</h2><div className="mt-5 space-y-4 text-sm">{[["Open positions",String(liveOpen.length)],["Closed positions",String(closedPositions.length)],["Base currency","USD"],["Trading status","Paper"]].map(([k,v]) => <div key={k} className="flex justify-between border-b border-line pb-3 last:border-0"><span className="text-muted">{k}</span><span className="font-semibold">{v}</span></div>)}</div></section></div></div>}

          {tab === "open" && <section className="mt-8 space-y-6"><MarketWatch prices={prices} status={marketStatus} onTrade={setTradeSymbol} /><div><h2 className="mb-4 text-lg font-semibold">Open Positions</h2><PositionsTable rows={liveOpen} open onClose={closeLivePosition} prices={prices} /></div></section>}
          {tab === "closed" && <section className="mt-8"><h2 className="mb-4 text-lg font-semibold">Closed Positions</h2><PositionsTable rows={closedPositions} open={false} prices={prices} /></section>}
          {tab === "transactions" && <section className="mt-8 grid gap-6 xl:grid-cols-2"><TransactionTable title="Deposits" rows={deposits.map(x => ({id:x.id,method:x.method,amount:x.amount,status:x.status,date:x.createdAt}))} /><TransactionTable title="Withdrawals" rows={withdrawals.map(x => ({id:x.id,method:x.method,amount:x.amount,status:x.status,date:x.createdAt}))} /></section>}
        </main>
      </div>

      <TradeModal symbol={tradeSymbol} price={selectedPrice} freeMargin={freeMargin} onClose={() => setTradeSymbol(null)} onSubmit={submitTrade} />
    </div>
  );
}

function TransactionTable({ title, rows }: { title: string; rows: {id:string;method:string;amount:number;status:string;date:string}[] }) {
  return <div className="overflow-hidden rounded-2xl border border-line bg-card"><div className="border-b border-line px-5 py-4"><h2 className="font-semibold">{title}</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="bg-panel text-muted"><tr>{["ID","Method","Amount","Status","Date"].map(x=><th key={x} className="p-4 text-left font-medium">{x}</th>)}</tr></thead><tbody>{rows.length ? rows.map(r=><tr key={r.id} className="border-t border-line"><td className="p-4 font-mono text-xs">{r.id}</td><td className="p-4">{r.method === "UPI" ? "UPI P2P" : "USDT BEP-20"}</td><td className="p-4 font-semibold">{usd(r.amount)}</td><td className="p-4">{r.status}</td><td className="p-4 text-muted">{new Date(r.date).toLocaleString()}</td></tr>) : <tr><td colSpan={5} className="p-10 text-center text-muted">No {title.toLowerCase()} yet.</td></tr>}</tbody></table></div></div>;
}
