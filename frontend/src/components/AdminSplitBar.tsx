export interface AdminSplitSegment {
  label: string;
  value: number;
  /** Classe Tailwind de cor de fundo da fatia (ex.: "bg-indigo-500"). */
  barClass: string;
}

interface AdminSplitBarProps {
  segments: AdminSplitSegment[];
}

/** Barra horizontal empilhada feita com divs, com legenda de valores e porcentagens. */
export function AdminSplitBar({ segments }: AdminSplitBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        {total > 0 &&
          segments.map((s) => (
            <div
              key={s.label}
              className={`${s.barClass} h-full transition-[width] duration-500`}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.label}: ${s.value.toLocaleString('pt-BR')}`}
            />
          ))}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {segments.map((s) => {
          const pct = total > 0 ? (s.value / total) * 100 : 0;
          return (
            <li key={s.label} className="flex items-center gap-3 text-sm">
              <span className={`${s.barClass} size-3 shrink-0 rounded-full`} />
              <span className="text-zinc-600 dark:text-zinc-400">{s.label}</span>
              <span className="ml-auto font-semibold text-zinc-900 tabular-nums dark:text-zinc-50">
                {s.value.toLocaleString('pt-BR')}
                <span className="ml-1 font-normal text-zinc-500 dark:text-zinc-400">
                  ({pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%)
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
