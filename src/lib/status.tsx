export function StatusBadge({ status }: { status: 'lucro' | 'perda' | 'pendente' }) {
  const map = {
    lucro: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
    perda: 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30',
    pendente: 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${map[status]} ring-inset`}>
      <span className="size-1.5 rounded-full bg-current" /> {status}
    </span>
  );
}
