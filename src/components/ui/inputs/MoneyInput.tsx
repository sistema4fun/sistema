'use client';

import React from "react";

type MoneyInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  value: string;                 // ex.: "1.234,56"
  onChange: (v: string) => void; // devolve SEMPRE formatado pt-BR
  prefix?: string;               // ex.: "R$" — aparece dentro do input
  align?: "left" | "right";      // alinhamento do texto (default: left)
};

export default function MoneyInput({
  value,
  onChange,
  className = "",
  prefix,
  align = "left",
  ...rest
}: MoneyInputProps) {
  const format = (raw: string) => {
    // mantém só dígitos e formata como moeda pt-BR com 2 casas
    const onlyDigits = raw.replace(/[^\d]/g, "");
    if (!onlyDigits) return "0,00";
    const cents = parseInt(onlyDigits, 10);
    const num = isNaN(cents) ? 0 : cents / 100;
    return num.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(format(e.target.value));
  };

  return (
    <div className="relative inline-block w-full">
      {prefix && (
        <span
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300 text-sm"
          aria-hidden="true"
        >
          {prefix}
        </span>
      )}
      <input
        {...rest}
        value={value}
        onChange={handleChange}
        inputMode="numeric"
        className={[
          "px-3 py-3 rounded-xl bg-neutral-800/70 border border-white/10",
          "text-base sm:text-lg",
          // alinhamento controlado pelo prop
          align === "right" ? "text-right" : "text-left",
          // largura default; pode sobrescrever com className (ex.: w-full)
          "w-36",
          // espaço para o prefixo
          prefix ? "pl-10" : "",
          className,
        ].join(" ")}
      />
    </div>
  );
}
