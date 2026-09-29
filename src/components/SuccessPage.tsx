import { usd, type Program } from "../config";
export function SuccessPage({ program, onHome }: { program: Program; onHome: () => void }) {
  const rows: [string, string][] = [["Account Size", usd(program.balance)], ["Evaluation", program.rules.evaluation], ["Status", "Preparing Account"]];
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <div className="rise w-full max-w-md rounded-2xl border border-line bg-card p-8 text-center">
        <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-full bg-brand/15 text-brand text-xl">✓</div>
        <h1 className="text-2xl font-semibold">You're All Set</h1>
        <p className="mt-2 text-sm text-muted">Your evaluation purchase has been received.</p>
        <dl className="my-6 space-y-3 rounded-xl bg-panel p-4 text-sm">
          {rows.map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>)}
        </dl>
        <p className="text-xs text-muted">Your trading account will appear here once account provisioning is connected.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={() => alert("Dashboard coming soon")} className="flex-1 rounded-lg bg-brand py-3 font-semibold text-ink hover:bg-brand2">Go to Dashboard</button>
          <button onClick={onHome} className="flex-1 rounded-lg border border-line py-3 font-semibold hover:border-brand">View Trading Rules</button>
        </div>
      </div>
    </main>
  );
}