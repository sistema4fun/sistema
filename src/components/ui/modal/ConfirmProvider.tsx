'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type ConfirmOptions = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
};

type Ctx = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<Ctx | null>(null);

export function useConfirm(): Ctx["confirm"] {
  const ctx = useContext(ConfirmContext);
  if (!ctx) return async () => true; // fallback seguro
  return ctx.confirm;
}

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const resolverRef = useRef<(v: boolean) => void>();

  const confirm = useCallback((o: ConfirmOptions) => {
    setOpts(o);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const handle = (val: boolean) => {
    setOpen(false);
    resolverRef.current?.(val);
  };

  const api = useMemo<Ctx>(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      {typeof window !== "undefined" && open &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/60" onClick={() => handle(false)} />
            {/* modal */}
            <div className="relative w-[95%] max-w-md rounded-2xl border border-white/12 bg-neutral-900/60 backdrop-blur-md shadow-lg p-5">
              <h4 className="text-xl font-extrabold text-white mb-2 uppercase tracking-wide">
                {opts.title ?? "Confirmar ação"}
              </h4>
              <div className="text-neutral-200 mb-4">
                {opts.message ?? "Tem certeza que deseja prosseguir?"}
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handle(false)}
                  className="px-4 py-2 rounded-lg border border-white/12 bg-neutral-800/70 hover:bg-neutral-800 text-white"
                >
                  {opts.cancelText ?? "Cancelar"}
                </button>
                <button
                  onClick={() => handle(true)}
                  className="px-4 py-2 rounded-lg bg-[#db001b] text-white font-semibold hover:opacity-90"
                >
                  {opts.confirmText ?? "Confirmar"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </ConfirmContext.Provider>
  );
}
