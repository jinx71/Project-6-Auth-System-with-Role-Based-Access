import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/RoleBadge';
import type { Role } from '../types';

interface Permission {
  action: string;
  roles: Role[];
}

// The permission matrix mirrors the server's route guards exactly
const permissions: Permission[] = [
  { action: 'View own profile', roles: ['ADMIN', 'USER', 'VIEWER'] },
  { action: 'Edit own profile', roles: ['ADMIN', 'USER', 'VIEWER'] },
  { action: 'View user directory', roles: ['ADMIN', 'VIEWER'] },
  { action: 'Change user roles', roles: ['ADMIN'] },
  { action: 'Delete users', roles: ['ADMIN'] }
];

export const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-slate-500">Session active</p>
      <h1 className="mt-1 text-2xl font-semibold text-white">
        Welcome, {user.name}
      </h1>
      <div className="mt-2"><RoleBadge role={user.role} /></div>

      <section className="mt-8 rounded-lg border border-line bg-panel">
        <h2 className="border-b border-line px-4 py-3 font-mono text-xs uppercase tracking-widest text-slate-400">
          Your permission matrix
        </h2>
        <ul className="divide-y divide-line">
          {permissions.map((p) => {
            const granted = p.roles.includes(user.role);
            return (
              <li key={p.action} className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-slate-300">{p.action}</span>
                <span className={`font-mono text-xs ${granted ? 'text-granted' : 'text-denied'}`}>
                  {granted ? 'GRANTED' : 'DENIED'}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-6 text-sm text-slate-500">
        Every row above is enforced server-side by <code className="font-mono text-slate-400">authorize()</code> middleware —
        the UI only reflects it. Try calling a denied endpoint from the console to see the 403.
      </p>
    </main>
  );
};
