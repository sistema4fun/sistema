// src/app/dashboard/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  GlassContainer,
  GlassCard,
  GlassBrandCard,
} from "@/components/ui/glass";
import EvolucaoDiariaChart from "@/features/dashboard/EvolucaoDiariaChartSimple";
import LucroMensalChart from "@/features/dashboard/LucroMensalChart";
import SaldoInicialForm from "@/features/dashboard/SaldoInicialForm";

// ----------------- Helpers -----------------
function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Gera "YYYY-MM-DD" usando a data LOCAL (evita o bug das 21h)
function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Label curto de mês "ago/25"
function monthLabel(d: Date) {
  const monthShort = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  const year2 = String(d.getFullYear()).slice(2);
  return `${monthShort}/${year2}`;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: { range?: string; modo?: "diario" | "acumulado" };
}) {
  // ====== CONTROLES (default 7 dias) ======
  const activeRange = (["7", "30", "90"].includes(String(searchParams?.range))
    ? Number(searchParams?.range)
    : 7) as 7 | 30 | 90;
  const modo = searchParams?.modo === "acumulado" ? "acumulado" : "diario";

  // 1) Saldos por banca
  const { data: saldos, error: saldoErr } = await supabase
    .from("vw_banca_saldo")
    .select("*");
  if (saldoErr) {
    return <main className="p-6 text-red-400">Erro ao carregar saldos: {saldoErr.message}</main>;
  }
  if (!saldos?.length) {
    return (
      <main className="p-6">
        Sem bancas ainda. Crie uma banca na tabela <b>banca</b>.
      </main>
    );
  }
  const banca = saldos[0];

  // 2) Datas locais úteis
  const hojeStr = ymdLocal();                  // YYYY-MM-DD local
  const d90 = new Date();                      // 90 dias atrás (contínuo)
  d90.setDate(d90.getDate() - 89);
  d90.setHours(0, 0, 0, 0);
  const d90Str = ymdLocal(d90);

  // 3) Lucro do dia (agora via view, 1 linha do dia local)
  const { data: pnlHojeRows, error: pnlHojeErr } = await supabase
    .from("vw_pnl_diario")
    .select("pnl")
    .eq("banca_id", banca.id)
    .eq("dia", hojeStr) // 'dia' é DATE na view
    .limit(1);
  if (pnlHojeErr) {
    return <main className="p-6 text-red-400">Erro ao calcular lucro do dia: {pnlHojeErr.message}</main>;
  }
  const lucroDoDia = (pnlHojeRows?.[0]?.pnl ?? 0) / 100;
  const lucroPositivo = lucroDoDia >= 0;

  // 4) Evolução diária (últimos 90 dias) — view vw_pnl_diario
  const { data: pnlRows, error: pnlErr } = await supabase
    .from("vw_pnl_diario")
    .select("dia,pnl")
    .eq("banca_id", banca.id)
    .gte("dia", d90Str) // comparar DATE com string YYYY-MM-DD
    .order("dia", { ascending: true });
  if (pnlErr) {
    return <main className="p-6 text-red-400">Erro ao carregar gráfico: {pnlErr.message}</main>;
  }

  // Monta série contínua em R$ (centavos -> reais), dias sem movimento = 0
  const map = new Map<string, number>(); // YYYY-MM-DD -> valor em reais
  (pnlRows || []).forEach((r: any) => {
    const key = String(r.dia).slice(0, 10); // NÃO usar new Date() (evita UTC)
    map.set(key, (r.pnl || 0) / 100);
  });

  const allDays: { label: string; valor: number }[] = [];
  const cursor = new Date(d90);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  while (cursor <= today) {
    const key = ymdLocal(cursor);
    const label = cursor.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    allDays.push({ label, valor: map.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  const base = allDays.slice(-activeRange);
  const chartData = (modo === "diario")
    ? base
    : (() => {
        let acc = 0;
        return base.map(p => ({ ...p, valor: (acc += p.valor) }));
      })();

  // 5) Lucro mensal (últimos 12 meses)
  const firstMonth = new Date();
  firstMonth.setDate(1);
  firstMonth.setHours(0, 0, 0, 0);
  firstMonth.setMonth(firstMonth.getMonth() - 11);
  const firstMonthStr = ymdLocal(firstMonth); // YYYY-MM-01

  // Tenta usar vw_pnl_mensal; se não existir, faz fallback somando o diário
  const { data: mensalRows, error: mensalErr } = await supabase
    .from("vw_pnl_mensal")
    .select("mes,pnl")
    .eq("banca_id", banca.id)
    .gte("mes", firstMonthStr)
    .order("mes", { ascending: true });

  const monthMap = new Map<string, number>(); // YYYY-MM -> R$
  if (!mensalErr && mensalRows) {
    mensalRows.forEach((r: any) => {
      const key = String(r.mes).slice(0, 7); // YYYY-MM
      monthMap.set(key, (r.pnl || 0) / 100);
    });
  } else {
    // Fallback: agrega a partir do diário (em caso de ausência da view)
    const { data: pnlRows12, error: pnl12Err } = await supabase
      .from("vw_pnl_diario")
      .select("dia,pnl")
      .eq("banca_id", banca.id)
      .gte("dia", firstMonthStr)
      .order("dia", { ascending: true });
    if (pnl12Err) {
      return <main className="p-6 text-red-400">Erro ao carregar lucro mensal: {pnl12Err.message}</main>;
    }
    (pnlRows12 || []).forEach((r: any) => {
      const key = String(r.dia).slice(0, 7); // YYYY-MM
      const v = (r.pnl || 0) / 100;
      monthMap.set(key, (monthMap.get(key) || 0) + v);
    });
  }

  const monthlyData: { label: string; valor: number }[] = [];
  const mCursor = new Date(firstMonth);
  const endMonth = new Date();
  endMonth.setDate(1);
  endMonth.setHours(0, 0, 0, 0);
  while (mCursor <= endMonth) {
    const key = `${mCursor.getFullYear()}-${String(mCursor.getMonth() + 1).padStart(2, "0")}`;
    monthlyData.push({ label: monthLabel(mCursor), valor: monthMap.get(key) ?? 0 });
    mCursor.setMonth(mCursor.getMonth() + 1);
  }

  // 6) Entradas de hoje (separadas) — mantém seu método atual (funciona bem)
  //    Observação: você já usa um range local -> toISOString(), que representa corretamente o dia local em UTC.
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now);   end.setHours(23, 59, 59, 999);

  const { data: entradasHoje, error: entradasErr } = await supabase
    .from("entradas")
    .select("tipo")
    .eq("banca_id", banca.id)
    .gte("data", start.toISOString())
    .lte("data", end.toISOString());
  if (entradasErr) {
    return <main className="p-6 text-red-400">Erro ao carregar entradas do dia: {entradasErr.message}</main>;
  }
  const totalMetodosHoje = (entradasHoje || []).filter((e: any) => e.tipo === "metodo").length;
  const totalEsportesHoje = (entradasHoje || []).filter((e: any) => e.tipo === "esporte").length;

  // ---------- RENDER ----------
  return (
    <main className="p-6 space-y-6 text-white">
      {/* ====== RESUMO DIÁRIO ====== */}
      <GlassContainer className="p-6">
        <h2 className="text-center text-5xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Resumo diário
        </h2>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <section className="grid gap-3 sm:grid-cols-3">
          {/* Saldo inicial */}
          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className="font-extrabold leading-tight text-[2.85rem] sm:text-[3.56rem]">
              {formatBRL(banca.saldo_inicial)}
            </div>
            <div className="mt-2 uppercase tracking-wide text-[1.1875rem]">Banca</div>
          </GlassCard>

          {/* Lucro do dia */}
          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className={`font-extrabold leading-tight text-[2.85rem] sm:text-[3.56rem] ${lucroPositivo ? "text-[#11ee00]" : "text-[#db001b]"}`}>
              {formatBRL(Math.round(lucroDoDia * 100))}
            </div>
            <div className="mt-2 uppercase tracking-wide text-[1.1875rem]">Lucro</div>
          </GlassCard>

          {/* Saldo atual */}
          <GlassBrandCard className="p-6 text-center flex flex-col items-center">
            <div className="font-extrabold leading-tight text-[2.85rem] sm:text-[3.56rem]">
              {formatBRL(banca.saldo_atual)}
            </div>
            <div className="mt-2 uppercase tracking-wide text-[1.1875rem]">Total</div>
          </GlassBrandCard>
        </section>
      </GlassContainer>

      {/* ====== BANCA: SALDO INICIAL ====== */}
      <GlassContainer className="p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Banca
        </h2>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <GlassCard className="p-6">
          <SaldoInicialForm bancaId={banca.id} saldoInicialCents={banca.saldo_inicial} />
        </GlassCard>
      </GlassContainer>

      {/* ====== EVOLUÇÃO DIÁRIA ====== */}
      <GlassContainer className="p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Evolução diária
        </h2>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* Controles */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Range */}
          <div className="inline-flex overflow-hidden rounded-lg border border-white/12 bg-neutral-900/60">
            {[7, 30, 90].map((d) => (
              <Link
                key={d}
                href={{ pathname: "/dashboard", query: { range: String(d), modo } }}
                className={`px-4 py-2 text-base font-semibold transition ${
                  activeRange === d ? "bg-[#db001b] text-white" : "text-neutral-200 hover:bg-neutral-900/80"
                }`}
              >
                {d}d
              </Link>
            ))}
          </div>
          {/* Modo */}
          <div className="inline-flex overflow-hidden rounded-lg border border-white/12 bg-neutral-900/60">
            {(["diario","acumulado"] as const).map(m => (
              <Link
                key={m}
                href={{ pathname: "/dashboard", query: { range: String(activeRange), modo: m } }}
                className={`px-4 py-2 text-base font-semibold transition ${
                  modo === m ? "bg-neutral-800 text-white" : "text-neutral-200 hover:bg-neutral-900/80"
                }`}
              >
                {m === "diario" ? "Diário" : "Acumulado"}
              </Link>
            ))}
          </div>
        </div>

        <GlassCard className="p-4 rounded-xl">
          <EvolucaoDiariaChart data={chartData} cor="#db001b" heightClass="h-[420px]" />
        </GlassCard>
      </GlassContainer>

      {/* ====== TOTAL DE ENTRADAS (HOJE) ====== */}
      <GlassContainer className="p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Total de entradas
        </h2>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <section className="grid gap-3 sm:grid-cols-2">
          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className="font-extrabold leading-tight text-6xl sm:text-7xl">
              {totalMetodosHoje.toLocaleString("pt-BR")}
            </div>
            <div className="mt-2 uppercase tracking-wide text-lg">Métodos</div>
          </GlassCard>

          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className="font-extrabold leading-tight text-6xl sm:text-7xl">
              {totalEsportesHoje.toLocaleString("pt-BR")}
            </div>
            <div className="mt-2 uppercase tracking-wide text-lg">Esportes</div>
          </GlassCard>
        </section>
      </GlassContainer>

      {/* ====== LUCRO MENSAL (12 meses) ====== */}
      <GlassContainer className="p-6">
        <h2 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Lucro mensal
        </h2>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <GlassCard className="p-4 rounded-xl">
          <LucroMensalChart data={monthlyData} heightClass="h-[420px]" />
        </GlassCard>
      </GlassContainer>
    </main>
  );
}
