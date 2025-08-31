import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

/**
 * Vidro padrão para CARDS internos no dashboard.
 * - neutro escuro
 * - blur médio
 * - raio médio
 */
export default function GlassCard({ className = "", children }: Props) {
  const base =
    "rounded-2xl border border-white/8 bg-neutral-950/55 backdrop-blur-md shadow";
  return <div className={`${base} ${className}`}>{children}</div>;
}
