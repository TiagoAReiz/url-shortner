'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/auth';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

interface GoogleIdApi {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
  }): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`,
    );
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () =>
      reject(new Error('Falha ao carregar o script do Google')),
    );
    if (!existing) {
      script.src = GSI_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

/** Botão oficial "Entrar com Google". Ao autenticar, manda o ID token ao backend. */
export function GoogleLoginButton() {
  const { loginWithGoogle } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;
    loadGsi()
      .then(() => {
        if (cancelled || !ref.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            loginWithGoogle(response.credential).catch((e) =>
              setError(e instanceof Error ? e.message : 'Falha no login'),
            );
          },
        });
        window.google.accounts.id.renderButton(ref.current, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'pill',
        });
      })
      .catch((e: Error) => setError(e.message));

    return () => {
      cancelled = true;
    };
  }, [clientId, loginWithGoogle]);

  if (!clientId) {
    return (
      <p className="text-sm text-red-600">
        Login indisponível: GOOGLE_CLIENT_ID não configurado.
      </p>
    );
  }

  return (
    <div>
      <div ref={ref} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
