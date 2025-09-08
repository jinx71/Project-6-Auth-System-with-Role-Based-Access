import {
  createContext, useCallback, useContext, useEffect, useMemo, useState
} from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../api/auth';
import {
  refreshAccessToken, setAccessToken, setSessionExpiredHandler
} from '../api/axios';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  setUser: (u: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, name: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On first load, try the refresh cookie to restore the session silently
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await refreshAccessToken();
        if (token) {
          const res = await authApi.me();
          setUser(res.data.user);
        }
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
    setSessionExpiredHandler(() => setUser(null));
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const signUp = useCallback(async (email: string, name: string, password: string) => {
    const res = await authApi.register({ email, name, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, setUser, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
