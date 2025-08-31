import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

/**
 * Vidro padrão para CONTÊINERES (bloco pai) no dashboard.
 * - dark balanceado
 * - borda e blur consistentes
 * - raio grande
 */
export default function GlassContainer({ className = "", children }: Props) {
  const base =
    "rounded-3xl border border-white/20 bg-neutral-930/40 backdrop-blur-sm shadow-lg";
  return <div className={`${base} ${className}`}>{children}</div>;
}
