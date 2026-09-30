import { useState } from "react";
import { Dialog } from "./Dialog";
import { signIn, signUp } from "../store";

export function AuthModal({ mode, onClose, setMode }: { mode: "login" | "signup" | null; onClose: () => void; setMode: (m: "login" | "signup") => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const login = mode === "login";
  const input = "w-full rounded-xl border border-line bg-panel px-3.5 py-3 text-sm outline-none focus:border-brand";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setMessage(null);

    const result = login
      ? await signIn(String(f.get("email")), String(f.get("password")))
      : await signUp(String(f.get("email")), String(f.get("password")));

    setBusy(false);
    if (result.error) return setMessage(result.error);
    if (result.confirm) return setConfirmed(true);

    onClose();
    // New sessions always enter the funding flow first. The app will only
    // expose the trading dashboard after a deposit has been submitted.
    location.hash = "#/deposit";
  };

  return (
    <Dialog open={!!mode} onClose={onClose} title={login ? "Welcome back" : "Create your FundedBytes account"}>
      {confirmed ? (
        <div className="space-y-3 text-sm">
          <p className="font-semibold">Check your email to confirm your account.</p>
          <p className="text-muted">After confirmation, return here and log in.</p>
          <button className="w-full rounded-xl border border-line px-4 py-3 font-semibold" onClick={() => { setConfirmed(false); setMode("login"); }}>Back to login</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-medium">Email<input required name="email" type="email" autoComplete="email" className={input + " mt-2"} /></label>
          <label className="block text-sm font-medium">Password<input required minLength={6} name="password" type="password" autoComplete={login ? "current-password" : "new-password"} className={input + " mt-2"} /></label>
          {message && <p className="text-sm text-loss" role="alert">{message}</p>}
          <button disabled={busy} className="w-full rounded-xl bg-brand py-3.5 font-semibold text-white hover:bg-brand2 disabled:opacity-60">{busy ? "Please wait…" : login ? "Log in" : "Create account"}</button>
          <button type="button" className="w-full text-xs text-muted hover:text-fg" onClick={() => { setMessage(null); setConfirmed(false); setMode(login ? "signup" : "login"); }}>{login ? "Create a new account" : "Already have an account? Log in"}</button>
        </form>
      )}
    </Dialog>
  );
}
