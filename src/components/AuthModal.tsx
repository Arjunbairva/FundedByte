import { useState } from "react";
import { Dialog } from "./Dialog";
import { signIn, signUp } from "../store";

export function AuthModal({ mode, onClose, setMode, onAuthed }: { mode: "login" | "signup" | null; onClose: () => void; setMode: (m: "login" | "signup") => void; onAuthed: () => void }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const login = mode === "login";
  const input = "w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-brand";
  const close = () => { setMsg(null); setConfirm(false); onClose(); };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget), email = String(f.get("email")), pw = String(f.get("password"));
    setBusy(true); setMsg(null);
    const r = await (login ? signIn : signUp)(email, pw);
    setBusy(false);
    if (r.error) return setMsg(r.error);
    if (r.confirm) return setConfirm(true);
    close(); onAuthed();
  };
  return (
    <Dialog open={!!mode} onClose={close} title={login ? "Login" : "Sign Up"}>
      {confirm ? <p className="text-sm text-muted">Check your email to confirm your account, then log in.</p> : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm">Email<input required name="email" type="email" autoComplete="email" className={input + " mt-1"} /></label>
          <label className="block text-sm">Password<input required name="password" type="password" minLength={6} autoComplete={login ? "current-password" : "new-password"} className={input + " mt-1"} /></label>
          {msg && <p role="alert" className="text-sm text-red-400">{msg}</p>}
          <button disabled={busy} className="w-full rounded-lg bg-brand py-3 font-semibold text-ink hover:bg-brand2 disabled:opacity-60">{busy ? "Please wait…" : login ? "Login" : "Create Account"}</button>
          <button type="button" onClick={() => { setMsg(null); setMode(login ? "signup" : "login"); }} className="w-full text-xs text-muted hover:text-fg">
            {login ? "New here? Create an account" : "Already have an account? Login"}
          </button>
        </form>
      )}
    </Dialog>
  );
}
