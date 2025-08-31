// src/features/dashboard/SaldoInicialForm.tsx
'use client';

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import MoneyInput from "@/components/ui/inputs/MoneyInput";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { atualizarSaldoInicial } from "@/app/dashboard/actions";

type Props = {
  bancaId: string;
  saldoInicialCents: number; // em centavos
};

export default function SaldoInicialForm({ bancaId, saldoInicialCents }: Props) {
  const router = useRouter();
  const { success, error } = useToast();
  const [pending, startTransition] = useTransition();

  const [valorBRL, setValorBRL] = useState(
    (saldoInicialCents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  const reset = () => setValorBRL("0,00");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await atualizarSaldoInicial(bancaId, valorBRL);
        success("Saldo inicial atualizado.");
        router.refresh();
      } catch (e: any) {
        error(e?.message ?? "Erro ao atualizar saldo.");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {/* Campo de valor com o mesmo tamanho do form de métodos */}
      <MoneyInput
        value={valorBRL}
        onChange={setValorBRL}
        prefix="R$"
        align="left"
        className="w-full px-4 py-3 rounded-xl bg-neutral-800/70 border border-white/10
                   focus:outline-none focus:ring-2 focus:ring-[#db001b]/60 focus:border-[#db001b]/40
                   text-[1.2rem]"
      />

      {/* Ações — 2 botões, cada um 50% da largura */}
      <div className="grid grid-cols-2 gap-3 w-full pt-1">
        <button
          type="submit"
          disabled={pending}
          className="w-full px-5 py-3 rounded-xl bg-[#db001b] text-white font-semibold
                     hover:opacity-90 disabled:opacity-60 text-[1.2rem]"
          title="Salvar saldo inicial"
        >
          {pending ? "Salvando..." : "Salvar"}
        </button>

        <button
          type="button"
          onClick={reset}
          className="w-full px-5 py-3 rounded-xl border border-white/12 bg-neutral-900/60
                     hover:bg-neutral-900/80 text-[1.2rem]"
          title="Limpar"
        >
          Limpar
        </button>
      </div>
    </form>
  );
}
