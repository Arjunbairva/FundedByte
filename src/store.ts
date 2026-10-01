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
let remoteReady = false;

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

async function ensureRemoteAccount() {
  const { data, error } = await supabase.rpc("ensure_paper_account");
  if (error || !data) return null;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    account: { id: String(row.account_number), balance: Number(row.balance) },
  };
}

async function loadRemote(email: string): Promise<PersistedState | null> {
  const remote = await ensureRemoteAccount();
  if (!remote) return null;

  const { data: account } = await supabase
    .from("accounts")
    .select("account_number,balance")
    .eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "")
    .maybeSingle();

  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) return null;

  const [{ data: positions }, { data: transactions }] = await Promise.all([
    supabase.from("positions").select("*").eq("user_id", userId).order("opened_at", { ascending: false }),
    supabase.from("transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (!account) return null;

  const openPositions: Position[] = (positions ?? []).filter((p: any) => p.status === "open").map((p: any) => ({
    id: String(p.id), symbol: p.symbol, side: p.side, lots: Number(p.lots), entry: Number(p.entry),
    current: Number(p.current), sl: p.sl == null ? undefined : Number(p.sl),
    tp: p.tp == null ? undefined : Number(p.tp), pnl: Number(p.pnl ?? 0), openedAt: p.opened_at,
  }));

  const closedPositions: ClosedPosition[] = (positions ?? []).filter((p: any) => p.status === "closed").map((p: any) => ({
    id: String(p.id), symbol: p.symbol, side: p.side, lots: Number(p.lots), entry: Number(p.entry),
    current: Number(p.current), sl: p.sl == null ? undefined : Number(p.sl),
    tp: p.tp == null ? undefined : Number(p.tp), pnl: Number(p.pnl ?? 0),
    openedAt: p.opened_at, exit: Number(p.exit), closedAt: p.closed_at,
  }));

  const deposits: Deposit[] = (transactions ?? []).filter((t: any) => t.kind === "deposit").map((t: any) => ({
    id: String(t.id), method: t.method, amount: Number(t.amount), status: t.status,
    createdAt: t.created_at, utr: t.reference ?? undefined,
  }));

  const withdrawals: Withdrawal[] = (transactions ?? []).filter((t: any) => t.kind === "withdrawal").map((t: any) => ({
    id: String(t.id), method: t.method, amount: Number(t.amount), status: t.status,
    createdAt: t.created_at, destination: t.destination ?? "",
  }));

  return {
    account: { id: String(account.account_number), balance: Number(account.balance) },
    openPositions, closedPositions, deposits, withdrawals,
  };
}

export const useStore = () => useSyncExternalStore(
  cb => { listeners.add(cb); return () => listeners.delete(cb); },
  () => state,
  () => state
);

supabase.auth.getSession().then(async ({ data: { session } }) => {
  const user = session?.user.email ?? null;
  const remote = user ? await loadRemote(user) : null;
  remoteReady = Boolean(remote);
  state = { ...(remote ?? (user ? loadPersisted(user) : blankState)), user, ready: true };
  emit();
});

supabase.auth.onAuthStateChange(async (_event, session) => {
  const user = session?.user.email ?? null;
  const remote = user ? await loadRemote(user) : null;
  remoteReady = Boolean(remote);
  state = { ...(remote ?? (user ? loadPersisted(user) : blankState)), user, ready: true };
  emit();
});

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message, confirm: false };
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://funded-bytes.vercel.app/#/deposit",
    },
  });
  return { error: error?.message };
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
  if (remoteReady) {
    const { data, error } = await supabase.rpc("create_deposit_request", {
      p_method: input.method, p_amount: input.amount, p_reference: input.utr ?? null,
    });
    if (error) throw new Error(error.message);
    if (data) {
      const row: any = Array.isArray(data) ? data[0] : data;
      const deposit: Deposit = {
        id: String(row.id), method: row.method, amount: Number(row.amount),
        status: row.status, createdAt: row.created_at, utr: row.reference ?? undefined,
      };
      state = { ...state, deposits: [deposit, ...state.deposits] };
      emit();
      return deposit;
    }
  }

  const row: Deposit = { id: `DEP-${Date.now()}`, ...input, status: "Pending", createdAt: new Date().toISOString() };
  state = { ...state, deposits: [row, ...state.deposits] };
  persist(); emit();
  return row;
}

export async function createWithdrawal(input: { method: WithdrawalMethod; amount: number; destination: string }) {
  if (remoteReady) {
    const { data, error } = await supabase.rpc("create_withdrawal_request", {
      p_method: input.method, p_amount: input.amount, p_destination: input.destination,
    });
    if (error) throw new Error(error.message);
    if (data) {
      const row: any = Array.isArray(data) ? data[0] : data;
      const withdrawal: Withdrawal = {
        id: String(row.id), method: row.method, amount: Number(row.amount),
        status: row.status, createdAt: row.created_at, destination: row.destination ?? "",
      };
      state = { ...state, withdrawals: [withdrawal, ...state.withdrawals] };
      emit();
      return withdrawal;
    }
  }

  const row: Withdrawal = { id: `WD-${Date.now()}`, ...input, status: "Pending", createdAt: new Date().toISOString() };
  state = { ...state, withdrawals: [row, ...state.withdrawals] };
  persist(); emit();
  return row;
}
