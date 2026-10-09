interface AdminStatCardProps {
  label: string;
  value: string;
  hint?: string;
}

/** Cartão de métrica do painel administrativo. */
export function AdminStatCard({ label, value, hint }: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 tabular-nums sm:text-3xl dark:text-zinc-50">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{hint}</p>
      )}
    </div>
  );
}
