import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { usersApi } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import type { Role, User } from '../types';

const ROLES: Role[] = ['ADMIN', 'USER', 'VIEWER'];

export const AdminPanel = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const isAdmin = me?.role === 'ADMIN';

  const load = async () => {
    try {
      const res = await usersApi.list();
      setUsers(res.data.users);
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message ?? 'Failed to load users' : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const changeRole = async (id: string, role: Role) => {
    setError('');
    try {
      const res = await usersApi.updateRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data.user : u)));
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message ?? 'Update failed' : 'Update failed');
    }
  };

  const removeUser = async (id: string, email: string) => {
    if (!window.confirm(`Delete ${email}? This cannot be undone.`)) return;
    setError('');
    try {
      await usersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      setError(isAxiosError(err) ? err.response?.data?.message ?? 'Delete failed' : 'Delete failed');
    }
  };

  if (loading) {
    return <main className="mx-auto max-w-5xl px-4 py-10 font-mono text-sm text-slate-400">Loading directory…</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
        {isAdmin ? 'Admin console' : 'Read-only directory'}
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-white">User directory</h1>
      {!isAdmin && (
        <p className="mt-2 text-sm text-slate-400">
          Viewer role: you can see the directory but cannot modify it.
        </p>
      )}
      {error && <p className="mt-3 font-mono text-xs text-denied">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-panel">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line font-mono text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Role</th>
              {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <p className="text-slate-200">{u.name}{u.id === me?.id && <span className="ml-2 text-xs text-slate-500">(you)</span>}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{u.provider}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        className="field w-auto py-1 text-xs"
                        value={u.role}
                        disabled={u.id === me?.id}
                        onChange={(e) => void changeRole(u.id, e.target.value as Role)}
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button
                        className="btn-danger px-2 py-1 text-xs"
                        disabled={u.id === me?.id}
                        onClick={() => void removeUser(u.id, u.email)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
};
