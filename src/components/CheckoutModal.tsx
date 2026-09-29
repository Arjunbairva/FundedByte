import { useState } from "react";
import { Dialog } from "./Dialog";
import { usd, type Program } from "../config";

// Replace `startPayment` with Stripe Checkout / Razorpay order creation later.
async function startPayment(_program: Program): Promise<{ ok: boolean }> {
  await new Promise(r => setTimeout(r, 600));
  return { ok: true };
}

export function CheckoutModal({ program, onClose, onDone }: { program: Program | null; onClose: () => void; onDone: (p: Program) => void }) {
  const [stage, setStage] = useState<"review" | "pending" | "next">("review");
  const close = () => { setStage("review"); onClose(); };
  return (
    <Dialog open={!!program} onClose={close} title="Checkout">
      {program && (stage === "next" ? (
        <div className="text-center">
          <p className="text-brand font-semibold">Payment Integration Coming Next</p>
          <p className="text-sm text-muted mt-2">This is a frontend demo. No payment has been taken.</p>
          <button onClick={() => { const p = program; close(); onDone(p); }} className="mt-6 w-full rounded-lg bg-brand py-3 font-semibold text-ink hover:bg-brand2">Continue</button>
        </div>
      ) : (
        <>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Selected Account</dt><dd className="font-medium">{usd(program.balance)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Evaluation Fee</dt><dd className="font-medium">{usd(program.fee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base"><dt>Total</dt><dd className="font-semibold">{usd(program.fee)}</dd></div>
          </dl>
          <button disabled={stage === "pending"} onClick={async () => { setStage("pending"); await startPayment(program); setStage("next"); }}
            className="mt-6 w-full rounded-lg bg-brand py-3 font-semibold text-ink hover:bg-brand2 disabled:opacity-60 transition">
            {stage === "pending" ? "Processing…" : "Continue to Payment"}
          </button>
          <p className="mt-3 text-xs text-muted text-center">Frontend demo — no real payment is processed.</p>
        </>
      ))}
    </Dialog>
  );
}