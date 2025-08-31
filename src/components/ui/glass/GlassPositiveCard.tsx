import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

/**
 * Card com TINT positivo (verde) para lucros.
 */
export default function GlassPositiveCard({ className = "", children }: Props) {
  const base =
    "rounded-2xl border border-emerald-500/40 bg-emerald-600/40 backdrop-blur-md shadow text-white";
  return <div className={`${base} ${className}`}>{children}</div>;
}
