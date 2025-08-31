import React from "react";

type Props = React.PropsWithChildren<{ className?: string }>;

/**
 * Container com TINT da marca (#db001b).
 * Ideal para seções em destaque.
 */
export default function GlassBrandContainer({ className = "", children }: Props) {
  const base =
    "rounded-3xl border border-[#db001b]/35 bg-[#db001b]/35 backdrop-blur-xl shadow-lg text-white";
  return <div className={`${base} ${className}`}>{children}</div>;
}
