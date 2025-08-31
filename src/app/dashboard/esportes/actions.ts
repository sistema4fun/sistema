'use server';

import { supabase } from "@/lib/supabaseClient";

/**
 * Cria uma entrada de ESPORTES como "pendente".
 */
export async function createEntradaEsporte(values: {
  descricao: string;
  mercado: string;
  odd: string;
  stakeBRL: string;
}) {
  const descricao = values.descricao?.trim();
  const mercado = values.mercado?.trim().toUpperCase();
  const odd = parseOdd(values.odd);
  const stake = brlToCents(values.stakeBRL);

  if (!descricao) throw new Error("Informe a descrição.");
  if (!mercado) throw new Error("Informe o mercado.");
  if (!Number.isFinite(odd) || odd < 1.01) throw new Error("Odd mínima 1,01.");
  if (!Number.isFinite(stake) || stake <= 0) throw new Error("Valor inválido.");

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
    tipo: "esporte",
    descricao,
    mercado,
    odd,
    stake,
    resultado: "pendente",
  });
  if (error) throw new Error(error.message);
}

/**
 * Atualiza entrada de ESPORTES (edição completa).
 * Agora aceita opcionalmente DATA e RESULTADO ("lucro" | "perda").
 */
export async function updateEntradaEsporte(
  id: string,
  values: {
    descricao: string;
    mercado: string;
    odd: string;
    stakeBRL: string;
    dataISO?: string;
    resultado?: "lucro" | "perda";
  }
) {
  const descricao = values.descricao?.trim();
  const mercado = values.mercado?.trim().toUpperCase();
  const odd = parseOdd(values.odd);
  const stake = brlToCents(values.stakeBRL);
  const dataISO = values.dataISO?.trim();
  const resultado = values.resultado;

  if (!descricao || !mercado) throw new Error("Preencha descrição e mercado.");
  if (!Number.isFinite(odd) || odd < 1.01) throw new Error("Odd inválida. Use 1,01 ou maior.");
  if (!Number.isFinite(stake) || stake <= 0) throw new Error("Valor inválido. Use um número maior que zero.");

  const update: any = { descricao, mercado, odd, stake };
  if (dataISO) update.data = dataISO;
  if (resultado === "lucro" || resultado === "perda") update.resultado = resultado;

  const { error } = await supabase
    .from("entradas")
    .update(update)
    .eq("id", id)
    .eq("tipo", "esporte");

  if (error) throw new Error(error.message);
}

/** Apaga a entrada */
export async function deleteEntradaEsporte(id: string) {
  const { error } = await supabase.from("entradas").delete().eq("id", id).eq("tipo", "esporte");
  if (error) throw new Error(error.message);
}

/** Liquida entrada pendente (atalho para pendentes) */
export async function liquidarEntradaEsporte(id: string, resultado: "lucro" | "perda") {
  const { error } = await supabase
    .from("entradas")
    .update({ resultado })
    .eq("id", id)
    .eq("tipo", "esporte")
    .eq("resultado", "pendente");
  if (error) throw new Error(error.message);
}

/* ===================== Utils ===================== */
function brlToCents(input: string): number {
  const s = String(input).replace(/[^\d.,-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return Math.round((isNaN(n) ? 0 : n) * 100);
}
function parseOdd(s: string): number {
  const n = parseFloat(String(s).replace(",", "."));
  return isNaN(n) ? NaN : n;
}
