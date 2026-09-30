import { useEffect, useRef, type ReactNode } from "react";

// Native <dialog>: built-in focus trap, Esc to close, and focus restore.
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={e => e.target === ref.current && onClose()}
      aria-labelledby="dlg-title"
      className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0 shadow-none"
    >
      <div className="rounded-2xl border border-line bg-card p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 id="dlg-title" className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-xl leading-none text-muted hover:text-fg">×</button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
