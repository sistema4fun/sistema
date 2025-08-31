'use server';

import { supabase } from "@/lib/supabaseClient";

export async function atualizarSaldoInicial(bancaId: string, saldoBRL: string) {
  const saldo_inicial = brlToCents(saldoBRL);
  if (!Number.isFinite(saldo_inicial) || saldo_inicial < 0) {
    throw new Error("Valor inválido. Use um número maior ou igual a zero.");
  }

  const { error } = await supabase
    .from("banca")
    .update({ saldo_inicial })
    .eq("id", bancaId);

  if (error) throw new Error(error.message);
}

// util: "1.234,56" -> 123456
function brlToCents(input: string): number {
  const s = String(input)
    .replace(/[^\d.,-]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = parseFloat(s);
  return Math.round(n * 100);
}
