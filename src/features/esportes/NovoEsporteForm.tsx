// src/features/esportes/NovoEsporteForm.tsx
'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MoneyInput from "@/components/ui/inputs/MoneyInput";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { createEntradaEsporte } from "@/app/dashboard/esportes/actions";

export default function NovoEsporteForm() {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [descricao, setDescricao] = useState("");
  const [mercado, setMercado] = useState("");
  const [odd, setOdd] = useState("");            // ← inicia vazio
  const [valorBRL, setValorBRL] = useState("0,00");

  const [errDesc, setErrDesc] = useState<string | null>(null);
  const [errMercado, setErrMercado] = useState<string | null>(null);
  const [errOdd, setErrOdd] = useState<string | null>(null);
  const [errValor, setErrValor] = useState<string | null>(null);

  const reset = () => {
    setDescricao("");
    setMercado("");
    setOdd("");                                   // ← vazio
    setValorBRL("0,00");
    setErrDesc(null); setErrMercado(null); setErrOdd(null); setErrValor(null);
  };

  const brlToCents = (input: string) => {
    const s = String(input).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(s);
    return Math.round((isNaN(n) ? 0 : n) * 100);
  };

  const parseOdd = (s: string) => {
    const n = parseFloat(String(s).replace(",", "."));
    return isNaN(n) ? NaN : n;
  };

  const validate = () => {
    let ok = true;
    if (!descricao.trim()) { setErrDesc("Informe a descrição."); ok = false; } else setErrDesc(null);
    if (!mercado.trim())   { setErrMercado("Informe o mercado."); ok = false; } else setErrMercado(null);

    const oddN = parseOdd(odd);
    if (!Number.isFinite(oddN) || oddN < 1.01) { setErrOdd("Odd mínima 1,01."); ok = false; } else setErrOdd(null);

    if (brlToCents(valorBRL) <= 0) { setErrValor("Valor precisa ser maior que zero."); ok = false; } else setErrValor(null);
    return ok;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    startTransition(async () => {
      try {
        await createEntradaEsporte({ descricao, mercado, odd, stakeBRL: valorBRL });
        success("Entrada de esportes adicionada (pendente).");
        reset();
        router.refresh();
      } catch (e: any) {
        error(e?.message ?? "Erro ao adicionar entrada.");
      }
    });
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-neutral-800/70 border border-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-[#db001b]/60 focus:border-[#db001b]/40 transition " +
    "text-[1.2rem]";

  const errorText = "text-[1rem] text-[#db001b]";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input
        value={descricao}
        onChange={(e) => { setDescricao(e.target.value); if (errDesc) setErrDesc(null); }}
        placeholder="DESCRIÇÃO"
        className={inputBase}
      />
      {errDesc && <p className={errorText}>{errDesc}</p>}

      <input
        value={mercado}
        onChange={(e) => { setMercado(e.target.value.toUpperCase()); if (errMercado) setErrMercado(null); }}
        placeholder="MERCADO"
        className={inputBase}
      />
      {errMercado && <p className={errorText}>{errMercado}</p>}

      {/* ODD alinhado à ESQUERDA e com placeholder */}
      <input
        value={odd}
        onChange={(e) => { setOdd(e.target.value); if (errOdd) setErrOdd(null); }}
        inputMode="decimal"
        placeholder="ODD"
        className={inputBase}                         // ← sem text-right
      />
      {errOdd && <p className={errorText}>{errOdd}</p>}

      <MoneyInput
        value={valorBRL}
        onChange={(v) => { setValorBRL(v); if (errValor) setErrValor(null); }}
        prefix="R$"
        align="left"
        className={inputBase}
      />
      {errValor && <p className={errorText}>{errValor}</p>}

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
