// src/app/dashboard/esportes/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabaseClient";
import { GlassContainer, GlassCard, GlassBrandCard } from "@/components/ui/glass";
import EvolucaoDiariaChart from "@/features/dashboard/EvolucaoDiariaChartSimple";
import LucroMensalChart from "@/features/dashboard/LucroMensalChart";
import EntradaEsporteItem from "@/features/esportes/EntradaEsporteItem";
import EntradaEsportePendenteItem from "@/features/esportes/EntradaEsportePendenteItem";

export const metadata: Metadata = { title: "Dashboard Esportes" };

// Helpers
function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function ymdLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function monthLabel(d: Date) {
  const monthShort = d.toLocaleString("pt-BR", { month: "short" }).replace(".", "");
  const year2 = String(d.getFullYear()).slice(2);
  return `${monthShort}/${year2}`;
}
function startDiaIso(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x.toISOString(); }
function endDiaIso(d: Date)   { const x = new Date(d); x.setHours(23,59,59,999); return x.toISOString(); }

export default async function EsportesDashboardPage({
  searchParams,
}: { searchParams?: { range?: string; modo?: "diario" | "acumulado" } }) {
  const activeRange = (["7","30","90"].includes(String(searchParams?.range)) ? Number(searchParams?.range) : 7) as 7|30|90;
  const modo = searchParams?.modo === "acumulado" ? "acumulado" : "diario";

  // Banca
  const { data: saldos, error: saldoErr } = await supabase.from("vw_banca_saldo").select("*");
  if (saldoErr) return <main className="p-6 text-red-400">Erro ao carregar saldos: {saldoErr.message}</main>;
  if (!saldos?.length) return <main className="p-6">Sem bancas ainda. Crie uma banca na tabela <b>banca</b>.</main>;
  const banca = saldos[0];

  // Datas
  const hoje = new Date();
  const d90 = new Date(); d90.setDate(d90.getDate() - 89); d90.setHours(0,0,0,0);
  const d90IsoStart = startDiaIso(d90);
  const mesInicio = new Date(); mesInicio.setDate(1); mesInicio.setHours(0,0,0,0);
  const dozeMesesAntes = new Date(mesInicio); dozeMesesAntes.setMonth(dozeMesesAntes.getMonth() - 11);

  // KPIs (esportes)
  const { data: espHoje, error: espHojeErr } = await supabase
    .from("entradas").select("valor_liquidado, stake, resultado")
    .eq("banca_id", banca.id).eq("tipo", "esporte")
    .gte("data", startDiaIso(hoje)).lte("data", endDiaIso(hoje));
  if (espHojeErr) return <main className="p-6 text-red-400">Erro ao carregar entradas de hoje: {espHojeErr.message}</main>;
  const liquidadasHoje = (espHoje || []).filter((r: any) => r.resultado !== "pendente");
  const lucroDoDia = liquidadasHoje.reduce((a:number, r:any)=> a + (r?.valor_liquidado ?? 0), 0);
  const entradasDoDia = liquidadasHoje.length;
  const lucroPositivo = lucroDoDia >= 0;
  const stakeDoDia = liquidadasHoje.reduce((a:number, r:any)=> a + (r?.stake ?? 0), 0);
  const roiDia: number | null = stakeDoDia > 0 ? (lucroDoDia / stakeDoDia) : null;

  // Evolução diária (90d) — só esportes
  const { data: esp90, error: esp90Err } = await supabase
    .from("entradas").select("data, valor_liquidado, resultado")
    .eq("banca_id", banca.id).eq("tipo", "esporte")
    .neq("resultado","pendente").gte("data", d90IsoStart).order("data",{ascending:true});
  if (esp90Err) return <main className="p-6 text-red-400">Erro ao carregar evolução diária: {esp90Err.message}</main>;

  const mapDia = new Map<string, number>();
  (esp90 || []).forEach((r:any)=> {
    const d = new Date(r.data);
    const key = ymdLocal(d);
    const v = (r?.valor_liquidado ?? 0)/100;
    mapDia.set(key, (mapDia.get(key) || 0) + v);
  });
  const allDays: {label:string; valor:number}[] = [];
  const cursor = new Date(d90);
  const today = new Date(); today.setHours(0,0,0,0);
  while (cursor <= today) {
    const key = ymdLocal(cursor);
    const label = cursor.toLocaleDateString("pt-BR",{day:"2-digit", month:"2-digit"});
    allDays.push({ label, valor: mapDia.get(key) ?? 0 });
    cursor.setDate(cursor.getDate()+1);
  }
  const base = allDays.slice(-activeRange);
  const chartData = modo === "diario" ? base : (()=>{ let acc=0; return base.map(p=>({...p, valor:(acc+=p.valor)})); })();

  // Lucro mensal (12m) — só esportes (sem zerados)
  const { data: esp12m, error: esp12mErr } = await supabase
    .from("entradas").select("data, valor_liquidado, resultado")
    .eq("banca_id", banca.id).eq("tipo", "esporte")
    .neq("resultado","pendente").gte("data", startDiaIso(dozeMesesAntes))
    .order("data",{ascending:true});
  if (esp12mErr) return <main className="p-6 text-red-400">Erro ao carregar lucro mensal: {esp12mErr.message}</main>;
  const monthMap = new Map<string, number>();
  (esp12m || []).forEach((r:any)=>{
    const d = new Date(r.data);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const v = (r?.valor_liquidado ?? 0) / 100;
    monthMap.set(key, (monthMap.get(key) || 0) + v);
  });
  const monthlyData: {label:string; valor:number}[] = [];
  const mCursor = new Date(dozeMesesAntes);
  const endMonth = new Date(); endMonth.setDate(1); endMonth.setHours(0,0,0,0);
  while (mCursor <= endMonth) {
    const key = `${mCursor.getFullYear()}-${String(mCursor.getMonth()+1).padStart(2,"0")}`;
    const v = monthMap.get(key) ?? 0;
    if (v !== 0) monthlyData.push({ label: monthLabel(new Date(mCursor)), valor: v });
    mCursor.setMonth(mCursor.getMonth()+1);
  }

  // LISTAS
  const { data: pendentes, error: pendErr } = await supabase
    .from("entradas")
    .select("id, data, descricao, mercado, odd, stake, resultado")
    .eq("banca_id", banca.id).eq("tipo","esporte").eq("resultado","pendente")
    .order("data",{ascending:false});
  if (pendErr) return <main className="p-6 text-red-400">Erro ao carregar pendentes: {pendErr.message}</main>;

  const { data: listaHoje, error: listaErr } = await supabase
    .from("entradas")
    .select("id, data, descricao, mercado, odd, stake, resultado, valor_liquidado")
    .eq("banca_id", banca.id).eq("tipo","esporte").neq("resultado","pendente")
    .gte("data", startDiaIso(hoje)).lte("data", endDiaIso(hoje))
    .order("data",{ascending:false});
  if (listaErr) return <main className="p-6 text-red-400">Erro ao carregar lista do dia: {listaErr.message}</main>;

  return (
    <main className="p-6 space-y-6 text-white">
      {/* ====== RESUMO DIÁRIO ====== */}
      <GlassContainer className="p-6">
        <h3 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Resumo diário
        </h3>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="grid gap-3 sm:grid-cols-3">
          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className={`font-extrabold leading-tight text-[2.85rem] sm:text-[3.56rem] ${lucroPositivo ? "text-[#11ee00]" : "text-[#db001b]"}`}>
              {formatBRL(lucroDoDia)}
            </div>
            <div className="mt-2 uppercase tracking-wide text-[1.1875rem]">Lucro do dia</div>
          </GlassCard>

          <GlassCard className="p-6 text-center flex flex-col items-center">
            <div className="font-extrabold leading-tight text-[2.85rem] sm:text-[3.56rem]">
              {entradasDoDia.toLocaleString("pt-BR")}
            </div>
            <div className="mt-2 uppercase tracking-wide text-[1.1875rem]">Entradas do dia</div>
          </GlassCard>

          {/* ROI em card brand (vermelho), igual Métodos */}
          <GlassBrandCard className="p-6 text-center flex flex-col items-center">
            <div className="font-extrabold leading-tight text-[2.85rem] sm:text-[3.56rem]">
              {roiDia == null ? "—" : `${(roiDia * 100).toFixed(1)}%`}
            </div>
            <div className="mt-2 uppercase tracking-wide text-[1.1875rem]">ROI do dia</div>
          </GlassBrandCard>
        </div>
      </GlassContainer>

      {/* ====== PENDENTES ====== */}
      <GlassContainer className="p-6">
        <h3 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Pendentes
        </h3>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        {(pendentes || []).length === 0 ? (
          <div className="py-6 text-center text-neutral-400">Sem entradas pendentes.</div>
        ) : (
          <div className="space-y-3">
            {(pendentes || []).map((row:any)=> (
              <EntradaEsportePendenteItem key={row.id} row={row} />
            ))}
          </div>
        )}
      </GlassContainer>

      {/* ====== EVOLUÇÃO DIÁRIA ====== */}
      <GlassContainer className="p-6">
        <h3 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Evolução diária
        </h3>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex overflow-hidden rounded-lg border border-white/12 bg-neutral-900/60">
            {[7, 30, 90].map((d) => (
              <Link key={d} href={{ pathname: "/dashboard/esportes", query: { range: String(d), modo } }}
                className={`px-4 py-2 text-base font-semibold transition ${activeRange === d ? "bg-[#db001b] text-white" : "text-neutral-200 hover:bg-neutral-900/80"}`}>
                {d}d
              </Link>
            ))}
          </div>
          <div className="inline-flex overflow-hidden rounded-lg border border-white/12 bg-neutral-900/60">
            {(["diario","acumulado"] as const).map(m => (
              <Link key={m} href={{ pathname: "/dashboard/esportes", query: { range: String(activeRange), modo: m } }}
                className={`px-4 py-2 text-base font-semibold transition ${modo === m ? "bg-neutral-800 text-white" : "text-neutral-200 hover:bg-neutral-900/80"}`}>
                {m === "diario" ? "Diário" : "Acumulado"}
              </Link>
            ))}
          </div>
        </div>
        <GlassCard className="p-4 rounded-xl">
          <EvolucaoDiariaChart data={chartData} cor="#db001b" heightClass="h-[420px]" />
        </GlassCard>
      </GlassContainer>

      {/* ====== LUCRO MENSAL ====== */}
      <GlassContainer className="p-6">
        <h3 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Lucro mensal
        </h3>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <GlassCard className="p-4 rounded-xl">
          <LucroMensalChart data={monthlyData} heightClass="h-[420px]" />
        </GlassCard>
      </GlassContainer>

      {/* ====== ENTRADAS (Hoje) ====== */}
      <GlassContainer className="p-6">
        <h3 className="text-center text-3xl sm:text-4xl font-extrabold uppercase tracking-wider text-[#db001b] mb-4">
          Entradas
        </h3>
        <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        {(listaHoje || []).length === 0 ? (
          <div className="py-6 text-center text-neutral-400">Nenhuma entrada hoje.</div>
        ) : (
          <div className="space-y-3">
            {(listaHoje || []).map((row:any)=> (
              <EntradaEsporteItem key={row.id} row={row} />
            ))}
          </div>
        )}
      </GlassContainer>
    </main>
  );
}
