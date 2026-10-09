'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { ApiError, API_URL, api, type LinkStats } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DashBarChart, type DashBarDatum } from '@/components/DashBarChart';
import { DashCopyButton } from '@/components/DashCopyButton';
import { DashRankedList } from '@/components/DashRankedList';
import { DashStatCard } from '@/components/DashStatCard';

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
const dayFormat = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
});
const numberFormat = new Intl.NumberFormat('pt-BR');

function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

/** Aceita "YYYY-MM-DD" (tratado como data local) ou um timestamp ISO. */
function parseDay(day: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  return m
    ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
    : new Date(day);
}

type StatsState =
  | { status: 'loading' }
  | { status: 'error'; code: number | null; message: string }
  | { status: 'ready'; stats: LinkStats };

export default function LinkStatsPage() {
  return (
    <Suspense fallback={<StatsSkeleton />}>
      <LinkStatsContent />
    </Suspense>
  );
}

function LinkStatsContent() {
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const isLogged = session !== undefined && session !== null;
  const [state, setState] = useState<StatsState>({ status: 'loading' });

  useEffect(() => {
    if (!isLogged) return;
    let cancelled = false;

    api
      .linkStats(id)
      .then((stats) => {
        if (!cancelled) setState({ status: 'ready', stats });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const code = e instanceof ApiError ? e.status : null;
        setState({
          status: 'error',
          code,
          message:
            code === 401
              ? 'Entre com Google para ver as estatísticas deste link.'
              : code === 403
                ? 'Você não tem permissão para ver este link.'
                : code === 404
                  ? 'Link não encontrado.'
                  : 'Não foi possível carregar as estatísticas. Tente novamente mais tarde.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [id, isLogged]);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex text-sm text-zinc-600 hover:underline dark:text-zinc-400"
      >
        ← Meus links
      </Link>

      {session === undefined && <StatsSkeleton />}

      {session === null && (
        <Notice>Entre com Google para ver as estatísticas deste link.</Notice>
      )}

      {isLogged && state.status === 'loading' && <StatsSkeleton />}

      {isLogged && state.status === 'error' && (
        <Notice tone="error">
          {state.message}
          {state.code !== 401 && (
            <>
              {' '}
              <Link
                href="/dashboard"
                className="font-medium underline underline-offset-2"
              >
                Voltar para Meus links
              </Link>
            </>
          )}
        </Notice>
      )}

      {isLogged && state.status === 'ready' && (
        <StatsView stats={state.stats} />
      )}
    </div>
  );
}

function StatsView({ stats }: { stats: LinkStats }) {
  const { link, total_accesses, unique_visitors, accesses_by_day, top_referers, top_user_agents } =
    stats;
  const shortUrl = `${API_URL}/${link.id}`;

  const chartData: DashBarDatum[] = [...accesses_by_day]
    .sort((a, b) => parseDay(a.day).getTime() - parseDay(b.day).getTime())
    .map((d) => ({
      label: dayFormat.format(parseDay(d.day)),
      value: d.count,
      title: `${dayFormat.format(parseDay(d.day))}: ${d.count} acesso(s)`,
    }));

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Link curto
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <a
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 break-all font-mono text-lg font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {shortUrl}
            </a>
            <DashCopyButton text={shortUrl} />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Destino
          </p>
          <p className="mt-1 break-all text-sm text-zinc-700 dark:text-zinc-300">
            {link.destination_url}
          </p>
        </div>

        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="inline text-zinc-500">Criado em: </dt>
            <dd className="inline">{formatDateTime(link.created_at)}</dd>
          </div>
          <div>
            <dt className="inline text-zinc-500">Expira em: </dt>
            <dd className="inline">{formatDateTime(link.expires_at)}</dd>
          </div>
        </dl>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <DashStatCard
          label="Total de acessos"
          value={numberFormat.format(total_accesses)}
        />
        <DashStatCard
          label="Visitantes únicos"
          value={numberFormat.format(unique_visitors)}
          hint="Aproximação por IP + navegador"
        />
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-base font-semibold">Acessos por dia</h2>
        <div className="mt-4">
          <DashBarChart
            data={chartData}
            emptyText="Nenhum acesso registrado ainda."
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <DashRankedList
          title="Principais origens (referer)"
          items={top_referers}
          blankLabel="Acesso direto (sem referer)"
        />
        <DashRankedList
          title="Principais navegadores (user-agent)"
          items={top_user_agents}
          blankLabel="Não informado"
        />
      </div>
    </div>
  );
}

function Notice({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'error';
}) {
  const toneClass =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'
      : 'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400';
  return (
    <div className={`rounded-xl border p-6 text-center text-sm ${toneClass}`}>
      {children}
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando">
      <div className="h-32 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-24 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
