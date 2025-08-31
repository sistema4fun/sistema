"use client";

import * as React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from "recharts";

type Point = { label: string; valor: number };

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ponto colorido por sinal (≥0 verde, <0 vermelho da marca)
const CustomDot = (props: any) => {
  const { cx, cy, value } = props;
  const color = value >= 0 ? "#11ee00" : "#db001b";
  return <circle cx={cx} cy={cy} r={4} stroke={color} strokeWidth={2} fill="rgba(0,0,0,0.5)" />;
};

export default function EvolucaoDiariaChart({
  data = [],
  cor = "#db001b",
  heightClass = "h-[340px]", // altura fixa por classe (sem inline style)
}: {
  data?: Point[];
  cor?: string;
  heightClass?: string;
}) {
  const safe = Array.isArray(data) ? data : [];

  return (
    <div className={`w-full ${heightClass}`}>
      {safe.length === 0 ? (
        <div className="h-full flex items-center justify-center rounded-2xl border border-white/12 bg-neutral-900/40 backdrop-blur-sm text-neutral-300">
          Sem dados no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safe} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis dataKey="label" stroke="rgba(255,255,255,0.6)" tickMargin={8} minTickGap={24} />
            <YAxis stroke="rgba(255,255,255,0.6)" tickFormatter={(v) => formatBRL(v)} width={80} />
            <Tooltip
              contentStyle={{
                background: "rgba(23,23,23,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "#fff",
              }}
              formatter={(value: any) => [formatBRL(value as number), "Valor"]}
              labelFormatter={(lbl: string) => `Dia ${lbl}`}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" />
            <Line
              type="monotone"
              dataKey="valor"
              stroke={cor}
              strokeWidth={3}
              dot={<CustomDot />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
