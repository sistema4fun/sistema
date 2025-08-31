'use client';

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { liquidarEntradaEsporte } from "@/app/dashboard/esportes/actions";

type Row = {
  id: string;
  data: string;
  descricao: string | null;
  mercado: string | null;
  odd: number | null;
  stake: number; // centavos
  resultado: "pendente";
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function EntradaEsportePendenteItem({ row }: { row: Row }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const dt = new Date(row.data);
  const dataFmt = dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const oddNum = typeof row.odd === "number" ? row.odd : parseFloat(String(row.odd ?? 0));

  const acao = (tipo: "lucro" | "perda") => {
    startTransition(async () => {
      try {
        await liquidarEntradaEsporte(row.id, tipo);
        router.refresh();
      } catch (e:any) {
        alert(e?.message ?? "Erro ao liquidar");
      }
    });
  };

  // Texto ~26/31px para combinar com a lista padrão
  const textUnified = "text-[26px] sm:text-[31px]";

  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl px-6 py-5 bg-neutral-900/40 border border-white/12 backdrop-blur-sm shadow">
      {/* Info */}
      <div className="flex flex-wrap items-center gap-x-10 sm:gap-x-12 gap-y-2">
        <span className={`font-extrabold tracking-wide min-w-[160px] ${textUnified} text-neutral-300`}>{dataFmt}</span>
        <span className={`${textUnified}`}>{row.descricao || "-"}</span>
        <span className={`uppercase ${textUnified}`}>{row.mercado || "-"}</span>
        <span className={`${textUnified}`}>{oddNum ? oddNum.toFixed(2) : "1.00"}</span>
        <span className={`${textUnified} text-neutral-200`}>{formatBRL(row.stake)}</span>
      </div>

      {/* Ações: Lucro / Perda (só imagem, ~29/33px) */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={pending}
          onClick={() => acao("lucro")}
          title="Marcar como lucro"
          className="inline-flex items-center justify-center bg-transparent hover:opacity-80 cursor-pointer disabled:opacity-60"
          aria-label="Lucro"
        >
          <Image src="/btn/lucro.svg" alt="Lucro" width={40} height={40} className="w-[29px] h-[29px] sm:w-[33px] sm:h-[33px]" />
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() => acao("perda")}
          title="Marcar como perda"
          className="inline-flex items-center justify-center bg-transparent hover:opacity-80 cursor-pointer disabled:opacity-60"
          aria-label="Perda"
        >
          <Image src="/btn/perda.svg" alt="Perda" width={40} height={40} className="w-[29px] h-[29px] sm:w-[33px] sm:h-[33px]" />
        </button>
      </div>
    </div>
  );
}
