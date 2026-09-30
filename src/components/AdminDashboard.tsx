import { useCallback, useEffect, useMemo, useState } from "react";
import { Logo } from "./Sections";
import { supabase } from "../supabase";
import { usd } from "../config";

type AdminData = { accounts: any[]; transactions: any[]; positions: any[]; users: number; generatedAt: string };

function statusClass(status: string) {
  if (status === "Approved" || status === "Completed") return "bg-green-50 text-green-700";
  if (status === "Rejected") return "bg-red-50 text-red-700";
  return "bg-amber-50 text-amber-700";
}

async function adminRequest(path: string, init?: RequestInit) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please sign in first.");
  const response = await fetch(path, {
    ...init,
    headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const contentType = response.headers.get("content-type") || "";
  const raw = await response.text();
  let payload: any = null;

  if (raw) {
    if (contentType.includes("application/json")) {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = null;
      }
    } else {
      try {
        payload = JSON.parse(raw);
      } catch {
        payload = { error: raw };
      }
    }
  }

  if (!response.ok) {
    throw new Error(payload?.error || "Admin request failed.");
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Admin API returned an invalid response.");
  }

  return payload;
}

export function AdminDashboard({ onHome, onLogout }: { onHome: () => void; onLogout: () => void }) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [signedInEmail, setSignedInEmail] = useState("");

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setSignedInEmail(
        String(user?.user_metadata?.verified_email || user?.email || "").trim()
      );
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try { setData(await adminRequest("/api/admin")); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to load admin data."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const pending = useMemo(() => data?.transactions.filter(row => row.status === "Pending") ?? [], [data]);
  const stats = useMemo(() => ({
    users: data?.users ?? 0,
    accounts: data?.accounts.length ?? 0,
    pending: pending.length,
    balance: (data?.accounts ?? []).reduce((sum, account) => sum + Number(account.balance || 0), 0),
  }), [data, pending.length]);

  const review = async (transactionId: string, action: "approve" | "reject") => {
    setWorking(transactionId);
    setError("");
    try {
      await adminRequest("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, transactionId }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update transaction.");
    } finally { setWorking(null); }
  };

  return (
    <div className="min-h-screen bg-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button onClick={onHome}><Logo /></button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="rounded-full bg-panel px-3 py-1.5 text-xs font-semibold">Admin Console</span>
              {signedInEmail && <p className="mt-1 text-[11px] text-muted">{signedInEmail}</p>}
            </div>
            <button onClick={onLogout} className="text-sm text-muted hover:text-fg">Log out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-muted">Operations</p><h1 className="mt-1 text-3xl font-semibold">Admin Dashboard</h1></div>
          <button onClick={() => void load()} className="rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-semibold hover:border-fg">Refresh</button>
        </div>

        {error && <div className="mt-6 rounded-xl border border-loss/30 bg-red-50 px-4 py-3 text-sm text-loss">{error}</div>}

        {loading ? <div className="mt-8 rounded-2xl border border-line bg-card p-10 text-center text-muted">Loading admin data…</div> : data ? (
          <>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ["Users", String(stats.users)],
                ["Trading accounts", String(stats.accounts)],
                ["Pending reviews", String(stats.pending)],
                ["Total account balance", usd(stats.balance)],
              ].map(([label, value]) => <div key={label} className="rounded-2xl border border-line bg-card p-5"><p className="text-xs text-muted">{label}</p><p className="mt-2 font-display text-2xl font-bold">{value}</p></div>)}
            </div>

            <section className="mt-8 overflow-hidden rounded-2xl border border-line bg-card">
              <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Pending funding requests</h2><p className="mt-1 text-xs text-muted">Approve or reject deposits and withdrawals.</p></div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-panel text-muted"><tr>{["ID","Type","User","Method","Amount","Reference","Date","Action"].map(label => <th key={label} className="p-4 text-left font-medium">{label}</th>)}</tr></thead>
                  <tbody>{pending.length ? pending.map(row => {
                    const account = data.accounts.find(item => item.user_id === row.user_id);
                    const user = account?.user;
                    const displayUser = user?.verifiedEmail || user?.email || user?.phone || row.user_id;
                    return <tr key={row.id} className="border-t border-line">
                      <td className="p-4 font-mono text-xs">{row.id}</td>
                      <td className="p-4 font-semibold">{row.kind === "deposit" ? "Deposit" : "Withdrawal"}</td>
                      <td className="p-4"><p>{displayUser}</p>{(user?.firstName || user?.lastName) && <p className="text-xs text-muted">{[user.firstName,user.lastName].filter(Boolean).join(" ")}</p>}</td>
                      <td className="p-4">{row.method}</td><td className="p-4 font-semibold">{usd(Number(row.amount))}</td>
                      <td className="p-4 font-mono text-xs text-muted">{row.reference || row.destination || "—"}</td>
                      <td className="p-4 text-muted">{new Date(row.created_at).toLocaleString()}</td>
                      <td className="p-4"><div className="flex gap-2"><button disabled={working === row.id} onClick={() => void review(row.id,"approve")} className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Approve</button><button disabled={working === row.id} onClick={() => void review(row.id,"reject")} className="rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-loss hover:text-loss disabled:opacity-50">Reject</button></div></td>
                    </tr>;
                  }) : <tr><td colSpan={8} className="p-12 text-center text-muted">No pending funding requests.</td></tr>}</tbody>
                </table>
              </div>
            </section>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <section className="overflow-hidden rounded-2xl border border-line bg-card">
                <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Trading accounts</h2></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-panel text-muted"><tr>{["Account","User","Balance","Created"].map(x => <th key={x} className="p-4 text-left font-medium">{x}</th>)}</tr></thead><tbody>{data.accounts.map(account => <tr key={account.id} className="border-t border-line"><td className="p-4 font-mono text-xs">{account.account_number}</td><td className="p-4">{account.user?.verifiedEmail || account.user?.email || account.user?.phone || account.user_id}</td><td className="p-4 font-semibold">{usd(Number(account.balance))}</td><td className="p-4 text-muted">{new Date(account.created_at).toLocaleString()}</td></tr>)}</tbody></table></div>
              </section>
              <section className="overflow-hidden rounded-2xl border border-line bg-card">
                <div className="border-b border-line px-5 py-4"><h2 className="font-semibold">Recent positions</h2></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-sm"><thead className="bg-panel text-muted"><tr>{["Symbol","Side","Lots","Entry","Status","P&L"].map(x => <th key={x} className="p-4 text-left font-medium">{x}</th>)}</tr></thead><tbody>{data.positions.slice(0,20).map(position => <tr key={position.id} className="border-t border-line"><td className="p-4 font-semibold">{position.symbol}</td><td className={`p-4 font-semibold ${position.side === "Buy" ? "text-gain" : "text-loss"}`}>{position.side}</td><td className="p-4">{Number(position.lots).toFixed(2)}</td><td className="p-4">{position.entry}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(position.status)}`}>{position.status}</span></td><td className="p-4 font-semibold">{usd(Number(position.pnl || 0))}</td></tr>)}</tbody></table></div>
              </section>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
