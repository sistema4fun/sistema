'use client';

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { updateEntradaMetodo, deleteEntradaMetodo } from "@/app/dashboard/metodos/actions";
import MoneyInput from "@/components/ui/inputs/MoneyInput";
import { useToast } from "@/components/ui/toast/ToastProvider";
import { useConfirm } from "@/components/ui/modal/ConfirmProvider";

/* helpers */
function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function toNum(v: unknown): number {
  if (v === null || v === undefined) return NaN;
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
}
function isoToLocalInput(iso?: string): string {
  if (!iso) return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}
function localInputToISO(localValue: string): string | undefined {
  if (!localValue) return undefined;
  const d = new Date(localValue);
  return d.toISOString();
}

/* types */
type Row = {
  id: string;
  data: string; // ISO
  metodo: string | null;
  plataforma: string | null;
  stake: number | string;
  valor_liquidado: number | string;
  resultado?: "lucro" | "perda";
};

export default function EntradaMetodoItem({ row }: { row: Row }) {
  const router = useRouter();
  const { success, error } = useToast();
  const confirm = useConfirm();

  const dt = new Date(row.data);
  const dataFmt = dt.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const stakeCents = toNum(row.stake);
  const liquidCents = toNum(row.valor_liquidado);
  const valor = Number.isFinite(liquidCents) ? liquidCents : (Number.isFinite(stakeCents) ? stakeCents : 0);
  const positivo = valor >= 0;

  const initialRes: "lucro" | "perda" =
    row.resultado === "lucro" || row.resultado === "perda"
      ? row.resultado
      : (Number.isFinite(liquidCents) && liquidCents < 0 ? "perda" : "lucro");

  const [isEditing, setEditing] = useState(false);
  const [metodo, setMetodo] = useState(row.metodo ?? "");
  const [plataforma, setPlataforma] = useState(row.plataforma ?? "");
  const [valorBRL, setValorBRL] = useState(
    ((Number.isFinite(stakeCents) ? stakeCents : 0) / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2, maximumFractionDigits: 2
    })
  );
  const [resultado, setResultado] = useState<"lucro" | "perda">(initialRes);
  const [dataLocal, setDataLocal] = useState(isoToLocalInput(row.data));
  const [pending, startTransition] = useTransition();

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await updateEntradaMetodo(row.id, {
          metodo,
          plataforma,
          stakeBRL: valorBRL,
          dataISO: localInputToISO(dataLocal),
          resultado,
        });
        setEditing(false);
        success("Entrada atualizada.");
        router.refresh();
      } catch (err: any) {
        error(err?.message ?? "Erro ao salvar");
      }
    });
  };

  const onDelete = async () => {
    const ok = await confirm({
      title: "Apagar entrada",
      message: "Essa ação não pode ser desfeita. Deseja apagar esta entrada?",
      confirmText: "Apagar",
      cancelText: "Cancelar",
    });
    if (!ok) return;

    startTransition(async () => {
      try {
        await deleteEntradaMetodo(row.id);
        success("Entrada apagada.");
        router.refresh();
      } catch (err: any) {
        error(err?.message ?? "Erro ao apagar");
      }
    });
  };

  const textUnified = "text-[26px] sm:text-[31px]";
  const inputBase =
    "w-full px-4 py-3 rounded-xl bg-neutral-800/70 border border-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-[#db001b]/60 focus:border-[#db001b]/40 transition " +
    "text-[1.2rem]";

  return (
    <div className="flex items-center justify-between gap-6 rounded-2xl px-6 py-5 bg-neutral-900/40 border border-white/12 backdrop-blur-sm shadow">
      {!isEditing ? (
        <>
          <div className="flex flex-wrap items-center gap-x-12 sm:gap-x-14 gap-y-2">
            <span className={`font-extrabold tracking-wide min-w-[160px] ${textUnified} text-neutral-300`}>{dataFmt}</span>
            <span className={`uppercase ${textUnified}`}>{row?.metodo ?? "-"}</span>
            <span className={`uppercase ${textUnified}`}>{row?.plataforma ?? "-"}</span>
            <span className={`font-extrabold ${textUnified} ${positivo ? "text-[#11ee00]" : "text-[#db001b]"}`}>
              {formatBRL(valor)}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setEditing(true)} title="Editar"
              className="inline-flex items-center justify-center bg-transparent hover:opacity-80 cursor-pointer" aria-label="Editar">
              <Image src="/btn/editar.svg" alt="Editar" width={40} height={40} className="w-[29px] h-[29px] sm:w-[33px] sm:h-[33px]" />
            </button>
            <button type="button" onClick={onDelete} title="Apagar"
              className="inline-flex items-center justify-center bg-transparent hover:opacity-80 cursor-pointer" aria-label="Apagar">
              <Image src="/btn/apagar.svg" alt="Apagar" width={40} height={40} className="w-[29px] h-[29px] sm:w-[33px] sm:h-[33px]" />
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={onSave} className="w-full">
          <div className="rounded-2xl border border-white/12 bg-neutral-900/40 backdrop-blur-sm p-4 flex flex-col gap-4">
            {/* Método */}
            <input
              value={metodo}
              onChange={(e) => setMetodo(e.target.value)}
              placeholder="MÉTODO"
              className={inputBase}
            />

            {/* Plataforma */}
            <input
              value={plataforma}
              onChange={(e) => setPlataforma(e.target.value)}
              placeholder="PLATAFORMA"
              className={inputBase}
            />

            {/* Valor */}
            <MoneyInput
              value={valorBRL}
              onChange={setValorBRL}
              prefix="R$"
              align="left"
              className={inputBase}
            />

            {/* Data/Hora (sem label) */}
            <input
              type="datetime-local"
              value={dataLocal}
              onChange={(e) => setDataLocal(e.target.value)}
              className={inputBase}
            />

            {/* Resultado (abaixo da data) */}
            <div className="flex items-center gap-8">
              {/* Lucro */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name={`res-${row.id}`}
                  className="sr-only"
                  checked={resultado === "lucro"}
                  onChange={() => setResultado("lucro")}
                />
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full border ${
                    resultado === "lucro" ? "bg-[#11ee00] border-[#11ee00]" : "border-neutral-400"
                  }`}
                />
                <span className="font-extrabold tracking-wide text-[1.35rem] text-[#11ee00]">LUCRO</span>
              </label>

              {/* Perda */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="radio"
                  name={`res-${row.id}`}
                  className="sr-only"
                  checked={resultado === "perda"}
                  onChange={() => setResultado("perda")}
                />
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full border ${
                    resultado === "perda" ? "bg-[#db001b] border-[#db001b]" : "border-neutral-400"
                  }`}
                />
                <span className="font-extrabold tracking-wide text-[1.35rem] text-[#db001b]">PERDA</span>
              </label>
            </div>

            {/* Ações */}
            <div className="grid grid-cols-2 gap-3 w-full pt-1">
              <button
                type="submit"
                disabled={pending}
                className="w-full px-5 py-3 rounded-xl bg-[#11ee00] text-white font-semibold hover:opacity-90 disabled:opacity-60 text-[1.2rem]"
                title="Salvar"
              >
                {pending ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="w-full px-5 py-3 rounded-xl border border-white/12 bg-neutral-900/60 hover:bg-neutral-900/80 text-[1.2rem]"
                title="Cancelar"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
