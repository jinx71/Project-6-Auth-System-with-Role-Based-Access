import { Link } from 'react-router-dom';

export const Unauthorized = () => (
  <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <p className="font-mono text-5xl font-semibold text-denied">403</p>
    <h1 className="mt-3 text-xl font-semibold text-white">Access denied</h1>
    <p className="mt-2 text-sm text-slate-400">
      Your role does not grant access to this area. If you believe it should, ask an admin to update your role.
    </p>
    <Link to="/dashboard" className="btn-ghost mt-6">Back to dashboard</Link>
  </main>
);
