import { useState } from "react";
import { Dialog } from "./Dialog";
import { signIn, signInWithGoogle, signUp } from "../store";

export function AuthModal({ mode, onClose, setMode }: { mode: "login" | "signup" | null; onClose: () => void; setMode: (m: "login" | "signup") => void }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const login = mode === "login";
  const input = "w-full rounded-xl border border-line bg-panel px-3.5 py-3 text-sm outline-none focus:border-brand";

  const googleLogin = async () => {
    setBusy(true);
    setMessage(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setBusy(false);
      setMessage(result.error);
    }
  };

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
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-line" /></div>
            <div className="relative flex justify-center"><span className="bg-panel px-3 text-xs text-muted">or</span></div>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={googleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M21.35 12.23c0-.79-.07-1.55-.2-2.29H12v4.33h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"/>
              <path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.29v2.52A9.75 9.75 0 0 0 12 21.75Z"/>
              <path fill="#FBBC05" d="M6.53 13.85A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.85V7.63H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.37l3.24-2.52Z"/>
              <path fill="#EA4335" d="M12 6.12c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.84 3.11 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.38l3.24 2.52C7.3 7.84 9.46 6.12 12 6.12Z"/>
            </svg>
            Continue with Google
          </button>
          <button type="button" className="w-full text-xs text-muted hover:text-fg" onClick={() => { setMessage(null); setConfirmed(false); setMode(login ? "signup" : "login"); }}>{login ? "Create a new account" : "Already have an account? Log in"}</button>
        </form>
      )}
    </Dialog>
  );
}
