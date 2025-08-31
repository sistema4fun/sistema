import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

/**
 * Card com TINT negativo (vermelho) para perdas.
 */
export default function GlassDangerCard({ className = "", children }: Props) {
  const base =
    "rounded-2xl border border-red-500/40 bg-red-600/40 backdrop-blur-md shadow text-white";
  return <div className={`${base} ${className}`}>{children}</div>;
}
