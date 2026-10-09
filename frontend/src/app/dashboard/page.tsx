'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { ApiError, API_URL, api, type LinkSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { DashCopyButton } from '@/components/DashCopyButton';

const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso));
}

type LinksState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; links: LinkSummary[] };

export default function DashboardPage() {
  const { session } = useAuth();
  const isLogged = session !== undefined && session !== null;
  const [state, setState] = useState<LinksState>({ status: 'loading' });

  useEffect(() => {
    if (!isLogged) return;
    let cancelled = false;

    api
      .myLinks()
      .then((links) => {
        if (!cancelled) setState({ status: 'ready', links });
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const expired = e instanceof ApiError && e.status === 401;
        setState({
          status: 'error',
          message: expired
            ? 'Sua sessão expirou. Entre com Google novamente.'
            : 'Não foi possível carregar seus links. Tente novamente mais tarde.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isLogged]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meus links</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Links criados com a sua conta, do mais acessado para o menos acessado.
        </p>
      </div>

      {session === undefined && <LoadingSkeleton />}

      {session === null && (
        <Notice>
          Entre com Google para ver os seus links.
        </Notice>
      )}

      {isLogged && state.status === 'loading' && <LoadingSkeleton />}

      {isLogged && state.status === 'error' && (
        <Notice tone="error">{state.message}</Notice>
      )}

      {isLogged && state.status === 'ready' && state.links.length === 0 && (
        <Notice>
          Você ainda não criou links logado. Crie um na{' '}
          <Link href="/" className="font-medium underline underline-offset-2">
            página inicial
          </Link>
          .
        </Notice>
      )}

      {isLogged && state.status === 'ready' && state.links.length > 0 && (
        <LinksList links={[...state.links].sort((a, b) => b.total_accesses - a.total_accesses)} />
      )}
    </div>
  );
}

function LinksList({ links }: { links: LinkSummary[] }) {
  return (
    <>
      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {links.map((link) => {
          const shortUrl = `${API_URL}/${link.id}`;
          return (
            <li
              key={link.id}
              className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between gap-2">
                <a
                  href={shortUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate font-mono text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {shortUrl}
                </a>
                <DashCopyButton text={shortUrl} />
              </div>
              <p
                className="truncate text-sm text-zinc-600 dark:text-zinc-400"
                title={link.destination_url}
              >
                {link.destination_url}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-xs text-zinc-500">Acessos</dt>
                  <dd className="font-semibold tabular-nums">{link.total_accesses}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Criado em</dt>
                  <dd>{formatDateTime(link.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-zinc-500">Expira em</dt>
                  <dd>{formatDateTime(link.expires_at)}</dd>
                </div>
              </dl>
              <Link
                href={`/dashboard/${link.id}`}
                className="inline-flex w-full items-center justify-center rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Estatísticas
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Desktop: tabela */}
      <div className="hidden overflow-x-auto rounded-xl border border-zinc-200 bg-white md:block dark:border-zinc-800 dark:bg-zinc-950">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs uppercase text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3 font-medium">Link curto</th>
              <th className="px-4 py-3 font-medium">Destino</th>
              <th className="px-4 py-3 text-right font-medium">Acessos</th>
              <th className="px-4 py-3 font-medium">Criado em</th>
              <th className="px-4 py-3 font-medium">Expira em</th>
              <th className="px-4 py-3 font-medium">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {links.map((link) => {
              const shortUrl = `${API_URL}/${link.id}`;
              return (
                <tr key={link.id} className="align-middle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={shortUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      >
                        {shortUrl}
                      </a>
                      <DashCopyButton text={shortUrl} />
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3">
                    <p
                      className="truncate text-zinc-600 dark:text-zinc-400"
                      title={link.destination_url}
                    >
                      {link.destination_url}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {link.total_accesses}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDateTime(link.created_at)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {formatDateTime(link.expires_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/${link.id}`}
                      className="whitespace-nowrap rounded-md border border-zinc-300 px-3 py-1 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    >
                      Estatísticas
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Carregando">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
        />
      ))}
    </div>
  );
}
