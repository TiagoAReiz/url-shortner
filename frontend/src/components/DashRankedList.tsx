import type { CountItem } from '@/lib/api';

interface DashRankedListProps {
  title: string;
  items: CountItem[];
  emptyText?: string;
  /** Texto usado quando o valor vem vazio (ex.: acesso sem referer). */
  blankLabel?: string;
}

/** Lista ordenada de itens com barras proporcionais ao maior valor. */
export function DashRankedList({
  title,
  items,
  emptyText = 'Nenhum acesso registrado ainda.',
  blankLabel = 'Não informado',
}: DashRankedListProps) {
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      <h3 className="text-base font-semibold">{title}</h3>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {items.map((item, index) => {
            const label = item.value.trim() ? item.value : blankLabel;
            const pct = (item.count / max) * 100;
            return (
              <li key={`${index}-${item.value}`}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span
                    className="min-w-0 truncate text-zinc-700 dark:text-zinc-300"
                    title={label}
                  >
                    {label}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {item.count}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
