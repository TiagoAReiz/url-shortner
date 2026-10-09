'use client';

import { useEffect, useState } from 'react';

interface DashCopyButtonProps {
  text: string;
  label?: string;
}

/** Botão que copia um texto para a área de transferência, com feedback visual. */
export function DashCopyButton({ text, label = 'Copiar' }: DashCopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = setTimeout(() => setStatus('idle'), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  const buttonLabel =
    status === 'copied' ? 'Copiado!' : status === 'failed' ? 'Falhou' : label;

  return (
    <button
      type="button"
      onClick={copy}
      className="shrink-0 rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
    >
      {buttonLabel}
    </button>
  );
}
