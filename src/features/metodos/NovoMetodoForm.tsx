// src/features/metodos/NovoMetodoForm.tsx
'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MoneyInput from "@/components/ui/inputs/MoneyInput";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { createEntradaMetodo } from "@/app/dashboard/metodos/actions";

export default function NovoMetodoForm() {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [metodo, setMetodo] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [valorBRL, setValorBRL] = useState("0,00");
  const [resultado, setResultado] = useState<"lucro" | "perda">("lucro");

  // validação simples
  const [errMetodo, setErrMetodo] = useState<string | null>(null);
  const [errPlataforma, setErrPlataforma] = useState<string | null>(null);
  const [errValor, setErrValor] = useState<string | null>(null);

  const reset = () => {
    setMetodo("");
    setPlataforma("");
    setValorBRL("0,00");
    setResultado("lucro");
    setErrMetodo(null); setErrPlataforma(null); setErrValor(null);
  };

  const brlToCents = (input: string) => {
    const s = String(input).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(s);
    return Math.round((isNaN(n) ? 0 : n) * 100);
  };

  const validate = () => {
    let ok = true;
    if (!metodo.trim()) { setErrMetodo("Informe o método."); ok = false; } else setErrMetodo(null);
    if (!plataforma.trim()) { setErrPlataforma("Informe a plataforma."); ok = false; } else setErrPlataforma(null);
    if (brlToCents(valorBRL) <= 0) { setErrValor("Valor precisa ser maior que zero."); ok = false; } else setErrValor(null);
    return ok;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    startTransition(async () => {
      try {
        await createEntradaMetodo({ metodo, plataforma, stakeBRL: valorBRL, resultado });
        success("Entrada de método adicionada.");
        reset();
        router.refresh();
      } catch (e: any) {
        error(e?.message ?? "Erro ao adicionar entrada.");
      }
    });
  };

  // ~20% maior que text-base
  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-neutral-800/70 border border-white/10 uppercase " +
    "focus:outline-none focus:ring-2 focus:ring-[#db001b]/60 focus:border-[#db001b]/40 transition " +
    "text-[1.2rem]"; // ↑ tamanho do texto

  const errorText = "text-[1rem] text-[#db001b]"; // levemente maior que text-sm

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Método */}
      <input
        value={metodo}
        onChange={(e) => { setMetodo(e.target.value.toUpperCase()); if (errMetodo) setErrMetodo(null); }}
        placeholder="METODO"
        className={`${inputBase} ${errMetodo ? "border-[#db001b]/60" : ""}`}
        aria-invalid={!!errMetodo}
      />
      {errMetodo && <p className={errorText}>{errMetodo}</p>}

      {/* Plataforma */}
      <input
        value={plataforma}
        onChange={(e) => { setPlataforma(e.target.value.toUpperCase()); if (errPlataforma) setErrPlataforma(null); }}
        placeholder="PLATAFORMA"
        className={`${inputBase} ${errPlataforma ? "border-[#db001b]/60" : ""}`}
        aria-invalid={!!errPlataforma}
      />
      {errPlataforma && <p className={errorText}>{errPlataforma}</p>}

      {/* Valor (R$) — alinhado à esquerda, com prefixo interno */}
      <MoneyInput
        value={valorBRL}
        onChange={(v) => { setValorBRL(v); if (errValor) setErrValor(null); }}
        prefix="R$"
        align="left"
        className={`w-full px-4 py-3 rounded-xl bg-neutral-800/70 border border-white/10 
                    focus:outline-none focus:ring-2 focus:ring-[#db001b]/60 focus:border-[#db001b]/40 
                    text-[1.2rem] ${errValor ? "border-[#db001b]/60" : ""}`}
        aria-invalid={!!errValor}
      />
      {errValor && <p className={errorText}>{errValor}</p>}

      {/* Resultado — radios customizados */}
      <div className="flex items-center gap-8 pt-1">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="resultado"
            value="lucro"
            checked={resultado === "lucro"}
            onChange={() => setResultado("lucro")}
            className="sr-only"
          />
          <span className={`h-3 w-3 rounded-full border ${resultado === "lucro" ? "bg-[#11ee00] border-[#11ee00]" : "border-white/60 bg-transparent"}`} />
          <span className="uppercase font-extrabold tracking-wide text-[#11ee00] text-[1.2rem]">Lucro</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="radio"
            name="resultado"
            value="perda"
            checked={resultado === "perda"}
            onChange={() => setResultado("perda")}
            className="sr-only"
          />
          <span className={`h-3 w-3 rounded-full border ${resultado === "perda" ? "bg-[#db001b] border-[#db001b]" : "border-white/60 bg-transparent"}`} />
          <span className="uppercase font-extrabold tracking-wide text-[#db001b] text-[1.2rem]">Perda</span>
        </label>
      </div>

      {/* Ações — lado a lado, cada um 50% da largura */}
      <div className="grid grid-cols-2 gap-3 w-full pt-1">
        <button
          type="submit"
          disabled={pending}
          className="w-full px-5 py-3 rounded-xl bg-[#db001b] text-white font-semibold hover:opacity-90 disabled:opacity-60 text-[1.2rem]"
          title="Adicionar"
        >
          {pending ? "Salvando..." : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="w-full px-5 py-3 rounded-xl border border-white/12 bg-neutral-900/60 hover:bg-neutral-900/80 text-[1.2rem]"
          title="Limpar"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
