import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/auth';

export const Register = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signUp(email, name, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message ?? 'Registration failed' : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-500">New credential</p>
      <h1 className="mt-1 text-2xl font-semibold text-white">Create account</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          className="field" placeholder="Full name" autoComplete="name"
          value={name} onChange={(e) => setName(e.target.value)} required
        />
        <input
          className="field" type="email" placeholder="Email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required
        />
        <input
          className="field" type="password" placeholder="Password (min 8 characters)"
          autoComplete="new-password" minLength={8}
          value={password} onChange={(e) => setPassword(e.target.value)} required
        />
        {error && <p className="font-mono text-xs text-denied">{error}</p>}
        <button className="btn-primary w-full" disabled={busy}>
          {busy ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <a href={authApi.googleUrl()} className="btn-ghost w-full">Continue with Google</a>

      <p className="mt-6 text-sm text-slate-400">
        Already registered? <Link to="/login" className="text-granted hover:underline">Sign in</Link>
      </p>
    </main>
  );
};
