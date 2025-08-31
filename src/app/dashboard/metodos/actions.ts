'use server';

import { supabase } from "@/lib/supabaseClient";

/** Cria entrada de MÉTODOS já liquidada como lucro/perda */
export async function createEntradaMetodo(values: {
  metodo: string;
  plataforma: string;
  stakeBRL: string;
  resultado: "lucro" | "perda";
}) {
  const metodo = values.metodo?.trim().toUpperCase();
  const plataforma = values.plataforma?.trim().toUpperCase();
  const stake = brlToCents(values.stakeBRL);
  const resultado = values.resultado;

  if (!metodo) throw new Error("Informe o método.");
  if (!plataforma) throw new Error("Informe a plataforma.");
  if (!Number.isFinite(stake) || stake <= 0) throw new Error("Valor inválido.");
  if (resultado !== "lucro" && resultado !== "perda") throw new Error("Resultado inválido.");

  const { data: bancas, error: bErr } = await supabase
    .from("banca")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1);

  if (bErr) throw new Error(bErr.message);
  const banca_id = bancas?.[0]?.id;
  if (!banca_id) throw new Error("Nenhuma banca encontrada.");

  const { error } = await supabase.from("entradas").insert({
    banca_id,
    tipo: "metodo",
    metodo,
    plataforma,
    odd: null,
    descricao: null,
    mercado: null,
    stake,
    resultado,
  });
  if (error) throw new Error(error.message);
}

/** Atualiza entrada de MÉTODOS (agora com data e resultado opcionais) */
export async function updateEntradaMetodo(
  id: string,
  values: { metodo: string; plataforma: string; stakeBRL: string; dataISO?: string; resultado?: "lucro" | "perda" }
) {
  const metodo = values.metodo?.trim().toUpperCase();
  const plataforma = values.plataforma?.trim().toUpperCase();
  const stake = brlToCents(values.stakeBRL);
  const dataISO = values.dataISO?.trim();
  const resultado = values.resultado;

  if (!metodo) throw new Error("Informe o método.");
  if (!plataforma) throw new Error("Informe a plataforma.");
  if (!Number.isFinite(stake) || stake <= 0) throw new Error("Valor inválido.");

  const update: any = { metodo, plataforma, stake };
  if (dataISO) update.data = dataISO;
  if (resultado === "lucro" || resultado === "perda") update.resultado = resultado;

  const { error } = await supabase
    .from("entradas")
    .update(update)
    .eq("id", id)
    .eq("tipo", "metodo");

  if (error) throw new Error(error.message);
}

/** Apaga entrada de MÉTODOS */
export async function deleteEntradaMetodo(id: string) {
  const { error } = await supabase.from("entradas").delete().eq("id", id).eq("tipo", "metodo");
  if (error) throw new Error(error.message);
}

/* ============== Utils ============== */
function brlToCents(input: string): number {
  const s = String(input).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return Math.round((isNaN(n) ? 0 : n) * 100);
}
