// src/app/esportes/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GlassContainer, GlassCard } from "@/components/ui/glass";
import NovoEsporteForm from "@/features/esportes/NovoEsporteForm";

export const metadata: Metadata = {
  title: "Adicionar entrada — Esportes",
};

export default function EsportesPage() {
  return (
    <main className="p-6 space-y-6 text-white">
      <GlassContainer className="p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Nova entrada
        </h2>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Form */}
        <GlassCard className="p-6 w-full sm:w-[90%] mx-auto">
          <NovoEsporteForm />
        </GlassCard>

        {/* Botão único (Dashboard Esportes) — mesma largura do form */}
        <div className="w-full sm:w-[90%] mx-auto mt-4">
          <Link
            href="/dashboard/esportes"
            className="block w-full rounded-2xl border border-white/12 bg-neutral-900/40 backdrop-blur-sm shadow
                       px-6 py-5 text-center hover:bg-neutral-900/60 transition"
          >
            <span className="uppercase font-extrabold tracking-wider text-lg sm:text-xl">
              Dashboard Esportes
            </span>
          </Link>
        </div>
      </GlassContainer>
    </main>
  );
}
