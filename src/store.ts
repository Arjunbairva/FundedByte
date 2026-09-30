import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import type { ClosedPosition, DepositMethod, Position, WithdrawalMethod } from "./config";

interface Deposit {
  id: string;
  method: DepositMethod;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  utr?: string;
}

interface Withdrawal {
  id: string;
  method: WithdrawalMethod;
  amount: number;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  createdAt: string;
  destination: string;
}

interface Account {
  id: string;
  balance: number;
}

interface State {
  user: string | null;
  account: Account;
  openPositions: Position[];
  closedPositions: ClosedPosition[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  ready: boolean;
}

let state: State = {
  user: null,
  account: { id: "FB-100248", balance: 10000 },
  openPositions: [
    { id: "POS-1001", symbol: "XAU/USD", side: "Buy", lots: 0.10, entry: 3861.20, current: 3865.42, pnl: 42.20, openedAt: "2026-10-01T00:10:00Z" },
    { id: "POS-1002", symbol: "EUR/USD", side: "Sell", lots: 0.20, entry: 1.17572, current: 1.17482, pnl: 18.00, openedAt: "2026-10-01T00:25:00Z" },
  ],
  closedPositions: [
    { id: "POS-0996", symbol: "GBP/USD", side: "Buy", lots: 0.10, entry: 1.33840, current: 1.34120, exit: 1.34120, pnl: 28.00, openedAt: "2026-09-30T07:21:00Z", closedAt: "2026-09-30T10:14:00Z" },
    { id: "POS-0988", symbol: "USD/JPY", side: "Sell", lots: 0.10, entry: 147.620, current: 147.220, exit: 147.220, pnl: 27.15, openedAt: "2026-09-29T09:05:00Z", closedAt: "2026-09-29T12:42:00Z" },
    { id: "POS-0978", symbol: "XAG/USD", side: "Buy", lots: 0.05, entry: 45.610, current: 46.020, exit: 46.020, pnl: 20.50, openedAt: "2026-09-28T06:11:00Z", closedAt: "2026-09-28T09:43:00Z" },
  ],
  deposits: [],
  withdrawals: [],
  ready: false,
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());
export const useStore = () => useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb); }, () => state);

supabase.auth.getSession().then(({ data: { session } }) => {
  state = { ...state, user: session?.user.email ?? null, ready: true };
  emit();
});
supabase.auth.onAuthStateChange((_event, session) => {
  state = { ...state, user: session?.user.email ?? null, ready: true };
  emit();
});

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message, confirm: !error && !data.session };
}

export const signOut = () => supabase.auth.signOut();

export async function createDeposit(input: { method: DepositMethod; amount: number; utr?: string }) {
  const row: Deposit = { id: `DEP-${Date.now()}`, ...input, status: "Pending", createdAt: new Date().toISOString() };
  state = { ...state, deposits: [row, ...state.deposits] };
  emit();
  return row;
}

export async function createWithdrawal(input: { method: WithdrawalMethod; amount: number; destination: string }) {
  const row: Withdrawal = { id: `WD-${Date.now()}`, ...input, status: "Pending", createdAt: new Date().toISOString() };
  state = { ...state, withdrawals: [row, ...state.withdrawals] };
  emit();
  return row;
}

export function closePosition(id: string) {
  const position = state.openPositions.find(x => x.id === id);
  if (!position) return;
  const closed: ClosedPosition = {
    ...position,
    exit: position.current,
    closedAt: new Date().toISOString(),
  };
  state = {
    ...state,
    openPositions: state.openPositions.filter(x => x.id !== id),
    closedPositions: [closed, ...state.closedPositions],
  };
  emit();
}
