import { useState } from "react";
import { usd, type Program } from "../config";
import { Logo } from "./Sections";

export function CheckoutPage({ program, onBack }: { program: Program; onBack: () => void }) {
  const [promo, setPromo] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const total = program.fee;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <button onClick={onBack} aria-label="Back to FundedByte home"><Logo /></button>
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="hidden sm:inline">Checkout</span>
            <span aria-hidden="true">•</span>
            <span>Step 1 of 2</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <button onClick={onBack} className="mb-7 text-sm font-medium text-muted hover:text-fg">← Back to programs</button>

        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.85fr] lg:items-start">
          <section>
            <div className="mb-8">
              <p className="text-sm font-semibold text-brand">CHECKOUT</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Complete your evaluation</h1>
              <p className="mt-3 max-w-xl text-muted">Review your account and confirm the terms before continuing to payment.</p>
            </div>

            {submitted ? (
              <div className="rounded-2xl border border-line bg-card p-6 sm:p-8">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-panel text-brand" aria-hidden="true">✓</div>
                <h2 className="mt-5 text-2xl font-semibold">Checkout is ready</h2>
                <p className="mt-3 text-muted">The payment provider is not connected yet, so no payment has been taken and no paid evaluation has been created.</p>
                <button onClick={onBack} className="mt-6 rounded-lg bg-brand px-5 py-3 font-semibold text-white hover:bg-brand2">Back to programs</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Selected evaluation</p>
                      <h2 className="mt-1 text-xl font-semibold">{usd(program.balance)} account</h2>
                    </div>
                    <button type="button" onClick={onBack} className="text-sm font-semibold text-brand hover:text-brand2">Change</button>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      ["Profit target", `${program.rules.profitTarget}%`],
                      ["Max drawdown", `${program.rules.maxDrawdown}%`],
                      ["Daily drawdown", `${program.rules.dailyDrawdown}%`],
                      ["Profit split", `${program.rules.profitSplit}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-panel p-3">
                        <p className="text-xs text-muted">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-semibold">Account information</h2>
                  <p className="mt-1 text-sm text-muted">Use the email associated with your FundedByte account.</p>
                  <label className="mt-5 block text-sm font-medium">
                    Email
                    <input type="email" required autoComplete="email" placeholder="you@example.com"
                      className="mt-2 w-full rounded-lg border border-line bg-panel px-3 py-3 outline-none focus:border-brand" />
                  </label>
                </section>

                <section className="rounded-2xl border border-line bg-card p-5 sm:p-6">
                  <h2 className="text-lg font-semibold">Promo code</h2>
                  <div className="mt-3 flex gap-2">
                    <input value={promo} onChange={e => { setPromo(e.target.value); setPromoMsg(null); }} placeholder="Enter code"
                      className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3 py-3 text-sm outline-none focus:border-brand" />
                    <button type="button" onClick={() => setPromoMsg(promo.trim() ? "No promotional codes are active right now." : "Enter a code first.")}
                      className="rounded-lg border border-line bg-card px-4 py-3 text-sm font-semibold hover:border-fg">Apply</button>
                  </div>
                  {promoMsg && <p role="status" className="mt-2 text-xs text-muted">{promoMsg}</p>}
                </section>

                <label className="flex gap-3 rounded-2xl border border-line bg-card p-5 text-sm">
                  <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-brand" />
                  <span>I have reviewed the evaluation rules and understand that trading/evaluation involves risk. I agree to the applicable terms and conditions.</span>
                </label>

                <button type="submit" disabled={!accepted}
                  className="w-full rounded-xl bg-brand px-5 py-3.5 font-semibold text-white transition hover:bg-brand2 disabled:cursor-not-allowed disabled:opacity-50">
                  Continue to secure payment
                </button>
                <p className="text-center text-xs text-muted">You will be redirected to the payment provider when payment integration is enabled.</p>
              </form>
            )}
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold">Order summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted">{usd(program.balance)} evaluation</span><span>{usd(program.fee)}</span></div>
              </div>
              <div className="my-5 border-t border-line" />
              <div className="flex items-end justify-between gap-4">
                <span className="font-semibold">Total</span>
                <span className="font-display text-3xl font-bold">{usd(total)}</span>
              </div>
              <div className="mt-6 rounded-xl bg-panel p-4 text-sm">
                <p className="font-semibold">What happens next?</p>
                <ol className="mt-3 space-y-3 text-muted">
                  <li className="flex gap-3"><span className="font-semibold text-brand">1</span>Complete secure payment.</li>
                  <li className="flex gap-3"><span className="font-semibold text-brand">2</span>Your evaluation account is provisioned.</li>
                  <li className="flex gap-3"><span className="font-semibold text-brand">3</span>Start trading within the published rules.</li>
                </ol>
              </div>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted">
                <span aria-hidden="true" className="text-brand">●</span>
                When payment is enabled, payment details will be handled by the payment provider.
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-line bg-card p-4 text-xs text-muted">
              <p className="font-semibold text-fg">Development mode</p>
              <p className="mt-1">This checkout is currently a frontend preview. No payment is processed and no paid account is created from this page.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
