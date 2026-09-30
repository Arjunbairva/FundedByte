import { useSyncExternalStore } from "react";
import { baseRules as R, type Program } from "./config";
import { supabase } from "./supabase";

export interface Trade { id: number; symbol: string; side: "Buy" | "Sell"; lots: number; pnl: number; day: number }
export interface Account { id: string; label: string; balance: number; fee: number; createdAt: string; trades: Trade[] }
interface State { user: string | null; accounts: Account[]; ready: boolean }

let s: State = { user: null, accounts: [], ready: false };
const subs = new Set<() => void>();
const set = (n: Partial<State>) => { s = { ...s, ...n }; subs.forEach(f => f()); };
export const useStore = () => useSyncExternalStore(f => { subs.add(f); return () => subs.delete(f); }, () => s);

async function loadAccounts() {
  const { data } = await supabase.from("accounts").select("id,label,balance,fee,created_at,trades(id,symbol,side,lots,pnl,day)").order("created_at", { ascending: false });
  set({ accounts: (data ?? []).map((a: any) => ({ id: a.id, label: a.label, balance: +a.balance, fee: +a.fee, createdAt: a.created_at,
    trades: [...a.trades].sort((x: any, y: any) => x.id - y.id).map((t: any) => ({ ...t, lots: +t.lots, pnl: +t.pnl })) })) });
}
supabase.auth.onAuthStateChange((_e, session) => {
  set({ user: session?.user.email ?? null, ready: true, ...(session ? {} : { accounts: [] }) });
  if (session) setTimeout(loadAccounts, 0); // avoid awaiting supabase calls inside the auth callback
});

type AuthResult = { error?: string; confirm?: boolean };
export async function signIn(email: string, password: string): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message };
}
export async function signUp(email: string, password: string): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message, confirm: !error && !data.session };
}
export const signOut = () => supabase.auth.signOut();

// DEMO: creates an account with simulated trades, no payment. Swap for a server-side call after real payment.
export async function addAccount(p: Program): Promise<string | undefined> {
  const { error } = await supabase.rpc("create_demo_account", { p_label: p.label, p_balance: p.balance, p_fee: p.fee });
  if (!error) await loadAccounts();
  return error?.message;
}

export function metrics(a: Account) {
  const eq = a.balance + a.trades.reduce((t, x) => t + x.pnl, 0);
  const lastDay = Math.max(...a.trades.map(t => t.day), 0);
  const daily = a.trades.filter(t => t.day === lastDay).reduce((t, x) => t + x.pnl, 0);
  const curve = a.trades.reduce<number[]>((c, t) => [...c, c[c.length - 1] + t.pnl], [a.balance]);
  const target = a.balance * (1 + R.profitTarget / 100), floor = a.balance * (1 - R.maxDrawdown / 100), dailyFloor = -a.balance * R.dailyDrawdown / 100;
  const status = eq <= floor || daily <= dailyFloor ? "Failed" : eq >= target ? "Passed" : "Active";
  return { eq, daily, curve, target, floor, dailyFloor, status, profit: eq - a.balance };
}
