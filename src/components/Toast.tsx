import { useEffect, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, X } from 'lucide-react';

type Toast = { id: number; message: string };

let toastId = 0;
const listeners = new Set<(t: Toast) => void>();

export function showToast(message: string) {
  const t = { id: ++toastId, message };
  listeners.forEach((fn) => fn(t));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    const listener = (t: Toast) => {
      setToasts((prev) => [...prev, t]);
      setTimeout(() => remove(t.id), 3000);
    };
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, [remove]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-success-200 bg-white px-4 py-3 shadow-elevated animate-scale-in">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success-50">
        <CheckCircle2 className="h-5 w-5 text-success-600" />
      </div>
      <span className="text-sm font-semibold text-slate-700">{toast.message}</span>
      <button onClick={onClose} className="ml-2 rounded p-0.5 text-slate-400 transition hover:text-slate-600">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
