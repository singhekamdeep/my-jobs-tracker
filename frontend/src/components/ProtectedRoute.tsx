import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import api from '../api/axios';

export default function ProtectedRoute() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Try refreshing
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            setAuthState('unauthenticated');
            return;
          }
          const { data } = await api.post('/api/auth/refresh', { refreshToken });
          const newToken = data.data?.accessToken;
          if (newToken) {
            localStorage.setItem('accessToken', newToken);
            setAuthState('authenticated');
          } else {
            setAuthState('unauthenticated');
          }
        } catch {
          setAuthState('unauthenticated');
        }
        return;
      }
      setAuthState('authenticated');
    };

    checkAuth();
  }, []);

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse-gentle" />
          <div className="text-sm text-[var(--text-tertiary)]">Loading...</div>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <Navigation />
      <main className="max-w-[1440px] mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
