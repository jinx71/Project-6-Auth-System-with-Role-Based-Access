import type { Role } from '../types';

const styles: Record<Role, string> = {
  ADMIN: 'border-amber-400/50 text-amber-300 bg-amber-400/10',
  USER: 'border-sky-400/50 text-sky-300 bg-sky-400/10',
  VIEWER: 'border-slate-400/40 text-slate-300 bg-slate-400/10'
};

export const RoleBadge = ({ role }: { role: Role }) => (
  <span className={`rounded border px-2 py-0.5 font-mono text-xs ${styles[role]}`}>
    {role}
  </span>
);
