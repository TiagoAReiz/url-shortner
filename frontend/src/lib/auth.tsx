'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, api, type Session } from './api';

interface AuthState {
  /** undefined = ainda carregando; null = deslogado */
  session: Session | null | undefined;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    api
      .me()
      .then(setSession)
      .catch((e) => {
        // 401 = deslogado (normal). Qualquer outro erro também cai como deslogado.
        if (!(e instanceof ApiError) || e.status !== 401) console.error(e);
        setSession(null);
      });
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    setSession(await api.loginWithGoogle(idToken));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, loginWithGoogle, logout }),
    [session, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
