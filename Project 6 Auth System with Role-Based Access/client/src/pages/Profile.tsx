import { useState } from 'react';
import type { FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../api/users';
import { RoleBadge } from '../components/RoleBadge';

export const Profile = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      const res = await usersApi.updateProfile(name);
      setUser({ ...user, name: res.data.user.name });
      setStatus({ ok: true, text: 'Profile updated' });
    } catch (err) {
      setStatus({
        ok: false,
        text: isAxiosError(err) ? err.response?.data?.message ?? 'Update failed' : 'Update failed'
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Credential record</p>
      <h1 className="mt-1 text-2xl font-semibold text-white">Profile</h1>

      <div className="mt-6 space-y-4 rounded-lg border border-line bg-panel p-5">
        <div className="flex items-center gap-3">
          {user.avatarUrl && (
            <img src={user.avatarUrl} alt="" className="h-10 w-10 rounded-full border border-line" />
          )}
          <div>
            <p className="text-sm text-slate-200">{user.email}</p>
            <div className="mt-1"><RoleBadge role={user.role} /></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">Display name</span>
            <input className="field" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
          </label>
          {status && (
            <p className={`font-mono text-xs ${status.ok ? 'text-granted' : 'text-denied'}`}>{status.text}</p>
          )}
          <button className="btn-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <p className="text-xs text-slate-500">
          Sign-in method: {user.hasPassword ? 'email + password' : 'Google account'}
        </p>
      </div>
    </main>
  );
};
