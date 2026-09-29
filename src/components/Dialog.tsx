import { useEffect, useRef, type ReactNode } from "react";
// Native <dialog>: built-in focus trap, Esc to close, focus restore.
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} onClose={onClose} onClick={e => e.target === ref.current && onClose()} aria-labelledby="dlg-title" className="w-full sm:w-[440px] p-4">
      <div className="rounded-2xl border border-line bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 id="dlg-title" className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-fg text-xl leading-none">×</button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}