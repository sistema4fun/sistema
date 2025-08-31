'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: string; title?: string; message: string; variant: ToastVariant; duration: number };

type Ctx = {
  push: (t: Omit<Toast, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { push: () => {}, success: () => {}, error: () => {}, info: () => {} };
  }
  return ctx;
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, any>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
      timers.current = {};
    };
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((curr) => curr.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((curr) => {
      const next = [...curr, { ...t, id }];
      return next.length > 3 ? next.slice(next.length - 3) : next;
    });
    timers.current[id] = setTimeout(() => remove(id), t.duration);
  }, [remove]);

  const api = useMemo<Ctx>(() => ({
    push,
    success: (message, title) => push({ message, title, variant: "success", duration: 3000 }),
    error:   (message, title) => push({ message, title, variant: "error",   duration: 4000 }),
    info:    (message, title) => push({ message, title, variant: "info",    duration: 3000 }),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}

      {mounted && toasts.length > 0 && createPortal(
        <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[min(100%,24rem)] flex-col gap-3 sm:right-6 sm:top-6">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const base = [
    "pointer-events-auto w-full border shadow-lg backdrop-blur-md px-4 py-3",
    "flex items-center gap-3 bg-neutral-900/70 border-white/12",
    "rounded-none", // ← bordas retas
    "relative before:absolute before:left-0 before:top-0 before:h-full before:w-1",
  ].join(" ");

  const color =
    toast.variant === "success"
      ? "before:bg-[#11ee00]"
      : toast.variant === "error"
      ? "before:bg-[#db001b]"
      : "before:bg-neutral-400";

  return (
    <div role="status" className={[base, color].join(" ")}>
      <div className="min-w-0 flex-1 text-neutral-200">
        {toast.title && <div className="text-white font-semibold leading-none mb-1">{toast.title}</div>}
        <div className="leading-none">{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        className="ml-2 shrink-0 px-2 py-1 text-neutral-300 hover:text-white bg-transparent"
        aria-label="Fechar"
        title="Fechar"
      >
        ×
      </button>
    </div>
  );
}
