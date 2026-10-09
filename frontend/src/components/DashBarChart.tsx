export interface DashBarDatum {
  label: string;
  value: number;
  title?: string;
}

interface DashBarChartProps {
  data: DashBarDatum[];
  emptyText?: string;
}

/** Gráfico de barras verticais feito com divs (sem bibliotecas). Rola na horizontal se houver muitas barras. */
export function DashBarChart({ data, emptyText = 'Sem dados para exibir.' }: DashBarChartProps) {
  if (data.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">{emptyText}</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex min-w-full gap-2">
        {data.map((d) => {
          const pct = d.value > 0 ? Math.max((d.value / max) * 100, 2) : 0;
          return (
            <div
              key={d.label}
              className="flex min-w-12 flex-1 flex-col items-center"
              title={d.title ?? `${d.label}: ${d.value}`}
            >
              <span className="mb-1 text-xs font-medium tabular-nums text-zinc-700 dark:text-zinc-300">
                {d.value}
              </span>
              <div className="flex h-40 w-full items-end justify-center">
                <div
                  className="w-full max-w-10 rounded-t-md bg-indigo-500 transition-all dark:bg-indigo-400"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
