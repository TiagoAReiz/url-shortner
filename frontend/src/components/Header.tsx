'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { GoogleLoginButton } from './GoogleLoginButton';

export function Header() {
  const { session, logout } = useAuth();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-base font-semibold">
            🔗 URL Shortner
          </Link>
          {session && (
            <Link href="/dashboard" className="hover:underline">
              Meus links
            </Link>
          )}
          {session?.is_admin && (
            <Link href="/admin" className="hover:underline">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {session === undefined ? null : session ? (
            <>
              <span className="hidden text-sm text-zinc-600 sm:inline dark:text-zinc-400">
                {session.user.name ?? session.user.email}
              </span>
              <button
                onClick={() => logout()}
                className="rounded-full border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Sair
              </button>
            </>
          ) : (
            <GoogleLoginButton />
          )}
        </div>
      </div>
    </header>
  );
}
