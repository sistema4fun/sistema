// src/app/metodos/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { GlassContainer, GlassCard } from "@/components/ui/glass";
import NovoMetodoForm from "@/features/metodos/NovoMetodoForm";

export const metadata: Metadata = {
  title: "Adicionar entrada — Métodos",
};

export default function MetodosPage() {
  return (
    <main className="p-6 space-y-6 text-white">
      <GlassContainer className="p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Nova entrada
        </h2>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Form */}
        <GlassCard className="p-6 w-full sm:w-[90%] mx-auto">
          <NovoMetodoForm />
        </GlassCard>

        {/* Botão único (Dashboard Métodos) — mesma largura do form */}
        <div className="w-full sm:w-[90%] mx-auto mt-4">
          <Link
            href="/dashboard/metodos"
            className="block w-full rounded-2xl border border-white/12 bg-neutral-900/40 backdrop-blur-sm shadow
                       px-6 py-5 text-center hover:bg-neutral-900/60 transition"
          >
            <span className="uppercase font-extrabold tracking-wider text-lg sm:text-xl">
              Dashboard Métodos
            </span>
          </Link>
        </div>
      </GlassContainer>
    </main>
  );
}
