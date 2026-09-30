import { useEffect, useState } from "react";
import { Dialog } from "./Dialog";
import { signInWithGoogle } from "../store";

const PHONE_EMAIL_CLIENT_ID = "11551551168649638491";

export function AuthModal({
  mode,
  onClose,
  setMode,
}: {
  mode: "login" | "signup" | null;
  onClose: () => void;
  setMode: (m: "login" | "signup") => void;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [phoneMode, setPhoneMode] = useState(false);
  const [emailMode, setEmailMode] = useState(false);
  const login = mode === "login";

  useEffect(() => {
    if (!phoneMode && !emailMode) return;

    const container = document.querySelector(
      emailMode ? ".pe_verify_email" : ".pe_signin_button",
    );
    if (!container) return;

    const handleVerified = async (userObj: { user_json_url?: string }) => {
      if (!userObj.user_json_url) {
        setMessage(
          emailMode
            ? "Email verification did not return a user reference."
            : "Phone verification did not return a user reference.",
        );
        return;
      }

      setBusy(true);
      setMessage(null);

      try {
        const response = await fetch(
          emailMode ? "/api/email-login" : "/api/phone-login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_json_url: userObj.user_json_url }),
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(
            result.error ||
              (emailMode ? "Email login failed." : "Phone login failed."),
          );
        }

        const { supabase } = await import("../supabase");
        const { error } = await supabase.auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        if (error) throw error;

        onClose();
        location.hash = "#/deposit";
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : emailMode
              ? "Email login failed."
              : "Phone login failed.",
        );
      } finally {
        setBusy(false);
      }
    };

    const win = window as Window & {
      phoneEmailListener?: (userObj: { user_json_url?: string }) => void;
      phoneEmailReceiver?: (userObj: { user_json_url?: string }) => void;
    };

    if (emailMode) {
      win.phoneEmailReceiver = handleVerified;
    } else {
      win.phoneEmailListener = handleVerified;
    }

    const script = document.createElement("script");
    script.src = emailMode
      ? "https://www.phone.email/verify_email_v1.js"
      : "https://www.phone.email/sign_in_button_v1.js";
    script.async = true;
    container.appendChild(script);

    return () => {
      if (win.phoneEmailListener === handleVerified) {
        delete win.phoneEmailListener;
      }
      if (win.phoneEmailReceiver === handleVerified) {
        delete win.phoneEmailReceiver;
      }
      script.remove();
      container.innerHTML = "";
    };
  }, [phoneMode, emailMode, onClose]);

  const googleLogin = async () => {
    setBusy(true);
    setMessage(null);
    const result = await signInWithGoogle();
    if (result.error) {
      setBusy(false);
      setMessage(result.error);
    }
  };

  const openEmail = () => {
    setPhoneMode(false);
    setEmailMode(true);
    setMessage(null);
  };

  const openPhone = () => {
    setEmailMode(false);
    setPhoneMode(true);
    setMessage(null);
  };

  const backToOptions = () => {
    setEmailMode(false);
    setPhoneMode(false);
    setMessage(null);
  };

  return (
    <Dialog
      open={!!mode}
      onClose={onClose}
      title={login ? "Welcome back" : "Create your FundedBytes account"}
    >
      {emailMode ? (
        <div className="space-y-4">
          <div className="pe_verify_email min-h-12" data-client-id={PHONE_EMAIL_CLIENT_ID}></div>
          {message && (
            <p className="text-sm text-loss" role="alert">
              {message}
            </p>
          )}
          <div className="rounded-xl border border-line bg-panel px-4 py-4 text-sm">
            <p className="font-semibold">Continue with Email</p>
            <p className="mt-1 text-muted">
              Verify your email with a one-time code using Phone.Email. No
              Supabase email/password form is used.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            className="w-full text-xs text-muted hover:text-fg disabled:opacity-60"
            onClick={backToOptions}
          >
            Back to sign-in options
          </button>
        </div>
      ) : phoneMode ? (
        <div className="space-y-4">
          <div className="pe_signin_button min-h-12" data-client-id={PHONE_EMAIL_CLIENT_ID}></div>
          {message && (
            <p className="text-sm text-loss" role="alert">
              {message}
            </p>
          )}
          <div className="rounded-xl border border-line bg-panel px-4 py-4 text-sm">
            <p className="font-semibold">Continue with Phone</p>
            <p className="mt-1 text-muted">
              Verify your mobile number securely with Phone.Email.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            className="w-full text-xs text-muted hover:text-fg disabled:opacity-60"
            onClick={backToOptions}
          >
            Back to sign-in options
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            type="button"
            disabled={busy}
            onClick={openEmail}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
          >
            Continue with Email
          </button>

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

          <button
            type="button"
            disabled={busy}
            onClick={openPhone}
            className="w-full rounded-xl border border-line px-4 py-3 font-semibold hover:bg-slate-50 disabled:opacity-60"
          >
            Continue with Phone
          </button>

          <p className="text-center text-xs text-muted">
            Email and phone verification are handled by Phone.Email.
          </p>

          <button
            type="button"
            className="w-full text-xs text-muted hover:text-fg"
            onClick={() => setMode(login ? "signup" : "login")}
          >
            {login
              ? "Create a new account"
              : "Already have an account? Log in"}
          </button>
        </div>
      )}
    </Dialog>
  );
}
