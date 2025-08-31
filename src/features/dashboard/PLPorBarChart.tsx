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
  Cell,
  ReferenceLine,
} from "recharts";

type Point = { label: string; valor: number };

function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PLPorBarChart({
  data = [],
  heightClass = "h-[380px]",
  title = "",
}: {
  data?: Point[];
  heightClass?: string;
  title?: string;
}) {
  const safe = Array.isArray(data) ? data : [];

  return (
    <div className={`w-full ${heightClass}`}>
      {title ? (
        <div className="mb-3 text-center text-lg font-semibold tracking-wide">{title}</div>
      ) : null}

      {safe.length === 0 ? (
        <div className="h-full flex items-center justify-center rounded-xl border border-white/12 bg-neutral-900/40 backdrop-blur-sm text-neutral-300">
          Sem dados no período/seleção.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={safe}
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={0}
              height={60}
              angle={-20}
              textAnchor="end"
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              tick={{ fill: "rgba(255,255,255,0.95)", fontSize: 12, fontWeight: 700 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              tickFormatter={(v) => formatBRL(v)}
              width={80}
            />
            <Tooltip
              cursor={{ fill: "rgba(34,34,34,0.35)" }}
              contentStyle={{
                background: "rgba(23,23,23,0.95)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
                color: "#fff",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.9)", fontWeight: 700 }}
              itemStyle={{ color: "#db001b", fontWeight: 700 }} // valor no vermelho do projeto
              formatter={(value: any) => [formatBRL(value as number), "P/L"]}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.25)" />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
              {safe.map((p, i) => (
                <Cell key={`c-${i}`} fill={p.valor > 0 ? "#11ee00" : "#db001b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
