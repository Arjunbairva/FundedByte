import { useSyncExternalStore } from "react";
import { supabase } from "./supabase";
import type { ClosedPosition, DepositMethod, Position, WithdrawalMethod } from "./config";

export type { ClosedPosition, Position } from "./config";

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

interface PersistedState {
  account: Account;
  openPositions: Position[];
  closedPositions: ClosedPosition[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
}

interface State extends PersistedState {
  user: string | null;
  ready: boolean;
}

const blankState: PersistedState = {
  account: { id: "FB-100248", balance: 10000 },
  openPositions: [],
  closedPositions: [],
  deposits: [],
  withdrawals: [],
};

let state: State = { ...blankState, user: null, ready: false };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(fn => fn());
const storageKey = (email: string) => `fundedbytes:paper:${email.toLowerCase()}`;

function loadPersisted(email: string): PersistedState {
  try {
    const raw = localStorage.getItem(storageKey(email));
    if (!raw) return { ...blankState, account: { ...blankState.account } };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      account: parsed.account ?? { ...blankState.account },
      openPositions: Array.isArray(parsed.openPositions) ? parsed.openPositions : [],
      closedPositions: Array.isArray(parsed.closedPositions) ? parsed.closedPositions : [],
      deposits: Array.isArray(parsed.deposits) ? parsed.deposits : [],
      withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [],
    };
  } catch {
    return { ...blankState, account: { ...blankState.account } };
  }
}

function persist() {
  if (!state.user) return;
  const data: PersistedState = {
    account: state.account,
    openPositions: state.openPositions,
    closedPositions: state.closedPositions,
    deposits: state.deposits,
    withdrawals: state.withdrawals,
  };
  try { localStorage.setItem(storageKey(state.user), JSON.stringify(data)); } catch {}
}

export const useStore = () => useSyncExternalStore(
  cb => { listeners.add(cb); return () => listeners.delete(cb); },
  () => state,
  () => state
);

supabase.auth.getSession().then(({ data: { session } }) => {
  const user = session?.user.email ?? null;
  state = { ...(user ? loadPersisted(user) : blankState), user, ready: true };
  emit();
});

supabase.auth.onAuthStateChange((_event, session) => {
  const user = session?.user.email ?? null;
  state = { ...(user ? loadPersisted(user) : blankState), user, ready: true };
  emit();
});

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message, confirm: false };
}

export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message, confirm: !error && !data.session };
}

export const signOut = () => supabase.auth.signOut();

export function createPosition(input: Omit<Position, "id" | "pnl">) {
  const position: Position = {
    ...input,
    id: `POS-${Date.now()}`,
    pnl: 0,
  };
  state = { ...state, openPositions: [position, ...state.openPositions] };
  persist();
  emit();
  return position;
}

export function closePosition(id: string, exit: number, pnl: number) {
  const position = state.openPositions.find(x => x.id === id);
  if (!position) return null;
  const closed: ClosedPosition = {
    ...position,
    current: exit,
    exit,
    pnl,
    closedAt: new Date().toISOString(),
  };
  state = {
    ...state,
    openPositions: state.openPositions.filter(x => x.id !== id),
    closedPositions: [closed, ...state.closedPositions],
    account: { ...state.account, balance: state.account.balance + pnl },
  };
  persist();
  emit();
  return closed;
}

export async function createDeposit(input: { method: DepositMethod; amount: number; utr?: string }) {
  const row: Deposit = { id: `DEP-${Date.now()}`, ...input, status: "Pending", createdAt: new Date().toISOString() };
  state = { ...state, deposits: [row, ...state.deposits] };
  persist();
  emit();
  return row;
}

export async function createWithdrawal(input: { method: WithdrawalMethod; amount: number; destination: string }) {
  const row: Withdrawal = { id: `WD-${Date.now()}`, ...input, status: "Pending", createdAt: new Date().toISOString() };
  state = { ...state, withdrawals: [row, ...state.withdrawals] };
  persist();
  emit();
  return row;
}
