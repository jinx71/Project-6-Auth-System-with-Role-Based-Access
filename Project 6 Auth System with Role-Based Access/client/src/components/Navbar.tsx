import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from './RoleBadge';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-1.5 rounded-md text-sm ${
    isActive ? 'bg-panel text-white' : 'text-slate-400 hover:text-white'
  }`;

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-mono text-sm font-semibold tracking-wider text-granted">
          SENTINEL<span className="text-slate-500">/auth</span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/profile" className={linkClass}>Profile</NavLink>
            {(user.role === 'ADMIN' || user.role === 'VIEWER') && (
              <NavLink to="/admin" className={linkClass}>Users</NavLink>
            )}
            <span className="hidden sm:block"><RoleBadge role={user.role} /></span>
            <button onClick={handleSignOut} className="btn-ghost ml-1">Sign out</button>
          </div>
        )}
      </nav>
    </header>
  );
};
