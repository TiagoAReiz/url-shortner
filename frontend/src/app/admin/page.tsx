'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ApiError, api, type AdminOverview } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { AdminStatCard } from '@/components/AdminStatCard';
import { AdminSplitBar } from '@/components/AdminSplitBar';
import { AdminLinksTable } from '@/components/AdminLinksTable';

interface LoadError {
  status: number | null;
  message: string;
}

const RESTRICTED = 'Acesso restrito ao administrador.';

function toLoadError(e: unknown): LoadError {
  if (e instanceof ApiError) {
    if (e.status === 401) {
      return { status: 401, message: 'Sua sessão expirou. Entre novamente com o Google.' };
    }
    if (e.status === 403) return { status: 403, message: RESTRICTED };
    return { status: e.status, message: e.message || 'Não foi possível carregar o painel.' };
  }
  return { status: null, message: 'Não foi possível carregar o painel.' };
}

function percent(part: number, total: number): string {
  const pct = total > 0 ? (part / total) * 100 : 0;
  return `${pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

export default function AdminPage() {
  const { session } = useAuth();
  const isAdmin = session?.is_admin === true;

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<LoadError | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    api
      .adminOverview()
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(toLoadError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [isAdmin, attempt]);

  function retry() {
    setError(null);
    setAttempt((n) => n + 1);
  }

  // Controle de acesso: sem redirecionamento automático, e sem chamar a API sem permissão.
  if (session === undefined) {
    return <Message title="Carregando…" />;
  }
  if (session === null) {
    return (
      <Message
        title="Área restrita"
        text="Entre com o Google para acessar o painel administrativo."
      />
    );
  }
  if (!isAdmin) {
    return <Message title="Acesso restrito" text={RESTRICTED} />;
  }
  if (error?.status === 403) {
    return <Message title="Acesso restrito" text={RESTRICTED} />;
  }
  if (error) {
    return (
      <Message title="Erro ao carregar" text={error.message}>
        <button
          onClick={retry}
          className="mt-4 rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Tentar novamente
        </button>
      </Message>
    );
  }
  if (!overview) {
    return <Message title="Carregando painel…" />;
  }

  const { users, links, accesses, top_links } = overview;

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl dark:text-zinc-50">
          Painel do administrador
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Visão geral de usuários, links e acessos.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <AdminStatCard label="Usuários" value={users.toLocaleString('pt-BR')} />
        <AdminStatCard label="Links totais" value={links.total.toLocaleString('pt-BR')} />
        <AdminStatCard
          label="Links com dono"
          value={links.owned.toLocaleString('pt-BR')}
          hint={percent(links.owned, links.total) + ' dos links'}
        />
        <AdminStatCard
          label="Links anônimos"
          value={links.anonymous.toLocaleString('pt-BR')}
          hint={percent(links.anonymous, links.total) + ' dos links'}
        />
        <AdminStatCard label="Acessos totais" value={accesses.total.toLocaleString('pt-BR')} />
        <AdminStatCard
          label="Acessos em links anônimos"
          value={accesses.on_anonymous_links.toLocaleString('pt-BR')}
          hint={percent(accesses.on_anonymous_links, accesses.total) + ' do total de acessos'}
        />
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Links: com dono vs. anônimos
        </h2>
        <AdminSplitBar
          segments={[
            { label: 'Com dono', value: links.owned, barClass: 'bg-indigo-500' },
            { label: 'Anônimos', value: links.anonymous, barClass: 'bg-zinc-400 dark:bg-zinc-500' },
          ]}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Top 10 links</h2>
        <AdminLinksTable links={top_links.slice(0, 10)} />
      </section>
    </div>
  );
}

function Message({
  title,
  text,
  children,
}: {
  title: string;
  text?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto mt-8 flex max-w-md flex-col items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{title}</h1>
      {text && <p className="text-sm text-zinc-600 dark:text-zinc-400">{text}</p>}
      {children}
    </div>
  );
}
