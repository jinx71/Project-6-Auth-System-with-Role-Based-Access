import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { refreshAccessToken } from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Landing page after Google redirects back. The refresh cookie is already set
// by the server, so we exchange it for an access token and load the user.
export const OAuthCallback = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const complete = async () => {
      const token = await refreshAccessToken();
      if (!token) {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }
      const res = await authApi.me();
      setUser(res.data.user);
      navigate('/dashboard', { replace: true });
    };
    void complete();
  }, [navigate, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center font-mono text-sm text-slate-400">
      Completing Google sign-in…
    </div>
  );
};
