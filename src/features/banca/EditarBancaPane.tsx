'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Banca = {
  id: string;
  saldo_inicial: number; // em centavos
};

function centsToBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function brlToCents(v: string) {
  const n = Number(v.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
}

export default function EditarBancaPane() {
  const [banca, setBanca] = useState<Banca | null>(null);
  const [saldo, setSaldo] = useState('0,00'); // em R$ (string)
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // carrega a banca existente (a primeira)
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('banca')
        .select('id, saldo_inicial')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        setMsg('Erro ao carregar banca: ' + error.message);
      } else if (data) {
        setBanca(data as Banca);
        setSaldo(centsToBRL(data.saldo_inicial));
      } else {
        setMsg('Nenhuma banca encontrada.');
      }
      setLoading(false);
    })();
  }, []);

  async function onSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!banca) return;

    setMsg(null);

    const cents = brlToCents(saldo);
    if (!Number.isFinite(cents)) {
      setMsg('Saldo inicial inválido.');
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('banca')
      .update({ saldo_inicial: cents })
      .eq('id', banca.id);
    setSaving(false);

    if (error) {
      setMsg('Erro ao salvar: ' + error.message);
      return;
    }

    setMsg('Saldo inicial atualizado com sucesso!');
  }

  if (loading) {
    return (
      <div className="rounded-2xl p-5 bg-neutral-800 border border-neutral-700 text-neutral-300">
        Carregando…
      </div>
    );
  }

  if (!banca) {
    return (
      <div className="rounded-2xl p-5 bg-neutral-800 border border-neutral-700 text-neutral-300">
        Nenhuma banca encontrada.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSalvar}
      className="rounded-2xl p-5 bg-neutral-800 border border-neutral-700 text-neutral-100 space-y-4"
    >
      <h3 className="text-lg font-semibold">Banca</h3>

      <div className="grid gap-1">
        <label className="text-sm text-neutral-300">Saldo inicial (R$)</label>
        <input
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2"
          value={saldo}
          onChange={(e) => setSaldo(e.target.value)}
          inputMode="decimal"
          placeholder="0,00"
        />
      </div>

      {msg && <div className="text-sm">{msg}</div>}

      <button
        disabled={saving}
        className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
      >
        {saving ? 'Salvando…' : 'Salvar alterações'}
      </button>
    </form>
  );
}
