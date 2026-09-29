import { useState } from "react";
import { Dialog } from "./Dialog";
// Frontend-only. Connect onSubmit to your auth provider/backend later.
export function AuthModal({ mode, onClose, setMode }: { mode: "login" | "signup" | null; onClose: () => void; setMode: (m: "login" | "signup") => void }) {
  const [sent, setSent] = useState(false);
  const login = mode === "login";
  const input = "w-full rounded-lg border border-line bg-panel px-3 py-2.5 text-sm outline-none focus:border-brand";
  return (
    <Dialog open={!!mode} onClose={() => { setSent(false); onClose(); }} title={login ? "Login" : "Sign Up"}>
      {sent ? <p className="text-sm text-muted">Authentication is not connected yet. This is a UI placeholder.</p> : (
        <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <label className="block text-sm">Email<input required type="email" autoComplete="email" className={input + " mt-1"} /></label>
          <label className="block text-sm">Password<input required type="password" autoComplete={login ? "current-password" : "new-password"} className={input + " mt-1"} /></label>
          <button className="w-full rounded-lg bg-brand py-3 font-semibold text-ink hover:bg-brand2">{login ? "Login" : "Create Account"}</button>
          <button type="button" onClick={() => setMode(login ? "signup" : "login")} className="w-full text-xs text-muted hover:text-fg">
            {login ? "New here? Create an account" : "Already have an account? Login"}
          </button>
        </form>
      )}
    </Dialog>
  );
}