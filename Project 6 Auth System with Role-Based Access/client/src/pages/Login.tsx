import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

const oauthErrors: Record<string, string> = {
  oauth_failed: 'Google sign-in failed. Try again.',
  email_unverified: 'Your Google email is not verified.'
};

export const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(oauthErrors[params.get('error') ?? ''] ?? '');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message ?? 'Sign-in failed' : 'Sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Access control</p>
      <h1 className="mt-1 text-2xl font-semibold text-white">Sign in</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          className="field" type="email" placeholder="Email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <input
          className="field" type="password" placeholder="Password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />
        {error && <p className="font-mono text-xs text-denied">ACCESS DENIED — {error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Verifying…' : 'Sign in'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <a href={authApi.googleUrl()} className="btn-ghost w-full">
        Continue with Google
      </a>

      <p className="mt-6 text-sm text-slate-400">
        No account? <Link to="/register" className="text-granted hover:underline">Create one</Link>
      </p>
    </main>
  );
};
