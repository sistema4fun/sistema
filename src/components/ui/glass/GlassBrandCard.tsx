import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

/**
 * Card com TINT da marca (#db001b).
 * Bom para KPIs como “Saldo atual”.
 */
export default function GlassBrandCard({ className = "", children }: Props) {
  const base =
    "rounded-2xl border border-[#db001b]/40 bg-[#db001b]/100 backdrop-blur-sm shadow text-white";
  return <div className={`${base} ${className}`}>{children}</div>;
}
