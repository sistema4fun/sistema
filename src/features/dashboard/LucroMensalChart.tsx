"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";

type Point = { label: string; valor: number };

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function LucroMensalChart({
  data = [],
  heightClass = "h-[420px]",
}: {
  data?: Point[];
  heightClass?: string;
}) {
  const safe = Array.isArray(data) ? data : [];

  // Esconde meses com 0
  const filtered = React.useMemo(() => safe.filter((p) => p.valor !== 0), [safe]);

  return (
    <div className={`w-full ${heightClass}`}>
      {filtered.length === 0 ? (
        <div className="h-full flex items-center justify-center rounded-xl border border-white/12 bg-neutral-900/40 backdrop-blur-sm text-neutral-300">
          Sem dados no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              tick={{ fill: "rgba(255,255,255,0.95)", fontSize: 13, fontWeight: 700 }}
              interval="preserveStartEnd"
              minTickGap={20}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              tickFormatter={(v) => formatBRL(v)}
              width={80}
            />
            <Tooltip
              // Highlight no hover (cinza escuro)
              cursor={{ fill: "rgba(34,34,34,0.35)" }}
              // Caixa do tooltip
              contentStyle={{
                background: "rgba(23,23,23,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "#fff",
              }}
              // 🔴 TÍTULO do tooltip (ex.: "Mês ago/25")
              labelStyle={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}
              // 🔴 LINHA/VALOR do tooltip fica no vermelho do projeto
              itemStyle={{ color: "#db001b", fontWeight: 700 }}
              formatter={(value: any) => [formatBRL(value as number), "Lucro do mês"]}
              labelFormatter={(lbl: string) => `Mês ${lbl}`}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
              {filtered.map((p, i) => (
                <Cell key={`c-${i}`} fill={p.valor > 0 ? "#11ee00" : "#db001b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
