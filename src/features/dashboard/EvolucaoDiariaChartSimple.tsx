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

export default function EvolucaoDiariaChartSimple({
  data = [],
  cor = "#db001b",
  // altura maior por padrão; sem style inline (evita hidratação)
  heightClass = "h-[420px]",
}: {
  data?: Point[];
  cor?: string;
  heightClass?: string;
}) {
  const safe = Array.isArray(data) ? data : [];

  // mapa rótulo -> valor do dia (para colorir cada tick)
  const labelToValor = React.useMemo(() => {
    const m = new Map<string, number>();
    safe.forEach((p) => m.set(p.label, p.valor));
    return m;
  }, [safe]);

  // Tick customizado do eixo X: colore por sinal do P/L do dia
  const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    const v = labelToValor.get(payload?.value) ?? 0;

    // lucro -> verde | prejuízo -> vermelho | zero -> branco (neutro)
    const fill = v > 0 ? "#11ee00" : v < 0 ? "#db001b" : "rgba(255,255,255,0.95)";

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={19}                 // um pouco mais abaixo p/ não encostar no eixo
          textAnchor="middle"
          fontSize={15}          // ↑ maior que antes (era 12)
          fontWeight={700}
          fill={fill}
        >
          {payload?.value}
        </text>
      </g>
    );
  };

  return (
    <div className={`w-full ${heightClass}`}>
      {safe.length === 0 ? (
        <div className="h-full flex items-center justify-center rounded-xl border border-white/12 bg-neutral-900/40 backdrop-blur-sm text-neutral-300">
          Sem dados no período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={safe} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={<CustomTick />}               // <-- rótulos coloridos e MAIORES
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              stroke="rgba(255,255,255,0.6)"
              tickFormatter={(v) => formatBRL(v)}
              width={80}
            />
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
              strokeWidth={3.5}
              dot={false}
              activeDot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
