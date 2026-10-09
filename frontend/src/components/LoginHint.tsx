'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';

/** Dica contextual abaixo do formulário. Não renderiza nada enquanto a sessão carrega. */
export function LoginHint() {
  const { session } = useAuth();

  if (session === undefined) return null;

  if (session === null) {
    return (
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Entre com o Google para guardar seus links e ver estatísticas de acesso.
      </p>
    );
  }

  return (
    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
      <Link
        href="/dashboard"
        className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        Ver meus links
      </Link>
    </p>
  );
}
