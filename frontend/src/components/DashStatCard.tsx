interface DashStatCardProps {
  label: string;
  value: string;
  hint?: string;
}

/** Cartão com um número de destaque (ex.: total de acessos). */
export function DashStatCard({ label, value, hint }: DashStatCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
      {hint && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{hint}</p>
      )}
    </div>
  );
}
