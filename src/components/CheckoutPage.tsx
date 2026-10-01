import { useState } from "react";
import { depositBonus, depositLimits, inr, paymentDetails, usd, type DepositMethod, type WithdrawalMethod } from "../config";
import { useStore, createDeposit, createWithdrawal } from "../store";
import { Logo } from "./Sections";

type Mode = "deposit" | "withdraw";

export function CheckoutPage({ mode, onBack, onComplete }: { mode: Mode; onBack: () => void; onComplete: () => void }) {
  const { account } = useStore();
  const [method, setMethod] = useState<DepositMethod | WithdrawalMethod>("UPI");
  const [amount, setAmount] = useState(mode === "deposit" ? "950" : "");
  const [utr, setUtr] = useState("");
  const [upi, setUpi] = useState("");
  const [wallet, setWallet] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isUpi = method === "UPI";
  const minimum = isUpi ? depositLimits.UPI.minimum : depositLimits.USDT_BEP20.minimum;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value < minimum) {
      setError(`Minimum amount is ${isUpi ? inr(minimum) : "$" + minimum}`);
      return;
    }

    if (mode === "deposit") {
      const depositUsd = isUpi ? value / depositBonus.upiExchangeRate : value;
      await createDeposit({ method: method as DepositMethod, amount: Number(depositUsd.toFixed(2)), utr: utr.trim() || undefined });
      setSubmitted(true);
      return;
    }

    if (value > account.balance) {
      setError("Withdrawal amount exceeds your available balance.");
      return;
    }

    if (isUpi && !upi.trim()) return setError("Enter your UPI ID.");
    if (!isUpi && !wallet.trim()) return setError("Enter your USDT BEP-20 wallet address.");

    await createWithdrawal({ method: method as WithdrawalMethod, amount: value, destination: isUpi ? upi.trim() : wallet.trim() });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-ink">
        <header className="border-b border-line bg-card">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
            <button onClick={onBack}><Logo /></button>
            <span className="text-sm text-muted">{mode === "deposit" ? "Deposit submitted" : "Withdrawal submitted"}</span>
          </div>
        </header>
        <main className="mx-auto max-w-xl px-5 py-16">
          <div className="rounded-3xl border border-line bg-card p-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-panel text-brand text-2xl">✓</div>
            <h1 className="mt-5 text-2xl font-semibold">{mode === "deposit" ? "Payment submitted" : "Withdrawal request submitted"}</h1>
            <p className="mt-3 text-muted">{mode === "deposit" ? "Your deposit is pending manual verification by the FundedBytes payment team." : "Your withdrawal request is pending review by the FundedBytes payment team."}</p>
            <button onClick={onComplete} className="mt-7 rounded-xl bg-brand px-5 py-3 font-semibold text-white">Back to dashboard</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <button onClick={onBack}><Logo /></button>
          <span className="text-sm text-muted">{mode === "deposit" ? "Deposit" : "Withdraw"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <button onClick={onBack} className="mb-7 text-sm text-muted hover:text-fg">← Back</button>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <section>
            <p className="text-sm font-semibold text-brand">{mode === "deposit" ? "FUND ACCOUNT" : "WITHDRAW FUNDS"}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{mode === "deposit" ? "Choose how to deposit" : "Choose where to receive funds"}</h1>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {["UPI", "USDT_BEP20"].map(x => (
                <button key={x} onClick={() => setMethod(x as DepositMethod | WithdrawalMethod)} className={`rounded-2xl border p-5 text-left ${method === x ? "border-brand ring-2 ring-brand/10" : "border-line bg-card"}`}>
                  <p className="font-semibold">{x === "UPI" ? "UPI P2P QR" : "USDT · BSC / BEP-20"}</p>
                  <p className="mt-1 text-xs text-muted">{x === "UPI" ? "Minimum ₹950 ($10)" : "Minimum $20"}</p>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-5">
              <label className="block text-sm font-medium">
                {mode === "deposit" ? (isUpi ? "Amount (INR)" : "Amount (USDT)") : "Amount (USD)"}
                <input inputMode="decimal" value={amount} onChange={e => setAmount(e.target.value)} className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 text-xl font-semibold outline-none focus:border-brand" />
              </label>

              {mode === "deposit" && isUpi && (
                <label className="block text-sm font-medium">
                  UTR / UPI reference
                  <input value={utr} onChange={e => setUtr(e.target.value)} placeholder="Enter after payment" className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 outline-none focus:border-brand" />
                </label>
              )}

              {mode === "withdraw" && isUpi && (
                <label className="block text-sm font-medium">
                  UPI ID
                  <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="name@bank" className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 outline-none focus:border-brand" />
                </label>
              )}

              {mode === "withdraw" && !isUpi && (
                <label className="block text-sm font-medium">
                  USDT BEP-20 wallet address
                  <input value={wallet} onChange={e => setWallet(e.target.value)} placeholder="0x..." className="mt-2 w-full rounded-xl border border-line bg-card px-4 py-3 outline-none focus:border-brand" />
                </label>
              )}

              {mode === "deposit" && isUpi && (
                <div className="rounded-2xl border border-line bg-card p-5">
                  <p className="font-semibold">P2P UPI checkout</p>
                  <p className="mt-1 text-sm text-muted">Scan the payment QR supplied by the payment team, complete the transfer in your UPI app, then submit your UTR for verification.</p>
                  <div className="mt-4 grid place-items-center rounded-xl bg-panel p-8">
                    <img src="/upi-fundbytes.svg" alt="FundedBytes UPI QR" className="h-48 w-48" />
                  </div>
                  <p className="mt-4 text-center font-mono text-sm">{paymentDetails.upiId}</p>
                  <p className="mt-2 text-center text-xs text-muted">Pay the INR amount shown above. ₹950 = $10 account funding before the 100% bonus.</p>
                  </div>
                </div>
              )}

              {mode === "deposit" && !isUpi && (
                <div className="rounded-2xl border border-line bg-card p-5">
                  <p className="font-semibold">USDT deposit</p>
                  <p className="mt-1 text-sm text-muted">Network: BSC / BEP-20</p>
                  <div className="mt-4 grid place-items-center rounded-xl bg-panel p-5">
                    <img src="/usdt-bep20-fundbytes.svg" alt="FundedBytes USDT BEP-20 QR" className="h-48 w-48" />
                  </div>
                  <p className="mt-3 rounded-xl bg-panel p-4 text-sm font-mono break-all">{paymentDetails.usdtBep20Address}</p>
                  <p className="mt-3 text-xs text-muted">Send USDT only on BSC / BEP-20 and retain the transaction hash for verification.</p>
                </div>
              )}

              {error && <p className="text-sm text-loss" role="alert">{error}</p>}
              <button className="w-full rounded-xl bg-brand px-5 py-3.5 font-semibold text-white hover:bg-brand2">{mode === "deposit" ? "Submit deposit" : "Submit withdrawal"}</button>
            </form>
          </section>

          <aside className="lg:sticky lg:top-24">
            <div className="rounded-3xl border border-line bg-card p-6">
              <h2 className="text-lg font-semibold">Transaction summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted">Method</span><span className="font-semibold">{isUpi ? "UPI P2P" : "USDT BEP-20"}</span></div>
                <div className="flex justify-between"><span className="text-muted">Minimum</span><span className="font-semibold">{isUpi ? inr(depositLimits.UPI.minimum) : "$20"}</span></div>
                <div className="flex justify-between"><span className="text-muted">Amount</span><span className="font-semibold">{isUpi ? inr(Number(amount) || 0) : usd(Number(amount) || 0)}</span></div>
                {mode === "withdraw" && <div className="flex justify-between"><span className="text-muted">Available</span><span className="font-semibold">{usd(account.balance)}</span></div>}
              </div>
              <div className="my-5 border-t border-line" />
              <div className="rounded-2xl bg-panel p-4 text-sm">
                <p className="font-semibold">Verification</p>
                <p className="mt-1 text-muted">{mode === "deposit" ? "Deposits remain pending until the payment team verifies the transaction." : "Withdrawals remain pending until the payment team reviews the request."}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
