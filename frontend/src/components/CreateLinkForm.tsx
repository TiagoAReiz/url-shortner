'use client';

import { useState, type FormEvent } from 'react';
import { ApiError, api } from '@/lib/api';

const PROTOCOL_RE = /^https?:\/\//i;

export function CreateLinkForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const destination = url.trim();

    if (!PROTOCOL_RE.test(destination)) {
      setError('Informe um link completo começando com http:// ou https://');
      return;
    }

    setError(null);
    setCopied(false);
    setLoading(true);
    try {
      const { short_url } = await api.createLink(destination);
      setShortUrl(short_url);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível encurtar o link. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!shortUrl) return;
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
    } catch {
      setError('Não foi possível copiar. Copie o link manualmente.');
    }
  }

  function handleReset() {
    setUrl('');
    setShortUrl(null);
    setCopied(false);
    setError(null);
  }

  if (shortUrl) {
    return (
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Seu link curto está pronto
        </p>
        <a
          href={shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block break-all text-lg font-semibold text-indigo-600 hover:underline sm:text-xl dark:text-indigo-400"
        >
          {shortUrl}
        </a>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-indigo-600 px-5 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
          >
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-zinc-300 px-5 font-medium text-zinc-700 transition-colors hover:bg-zinc-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:focus-visible:ring-offset-zinc-950"
          >
            Encurtar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <label
        htmlFor="destination-url"
        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
      >
        Cole o link que deseja encurtar
      </label>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="destination-url"
          name="destination_url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="https://exemplo.com/um-link-muito-longo"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'destination-url-error' : undefined}
          disabled={loading}
          className="h-12 min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-zinc-950"
        >
          {loading && (
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          )}
          {loading ? 'Encurtando...' : 'Encurtar'}
        </button>
      </div>

      {error && (
        <p
          id="destination-url-error"
          role="alert"
          className="mt-3 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </form>
  );
}
