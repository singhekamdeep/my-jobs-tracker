import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, List, LogOut, Briefcase } from 'lucide-react';
import api from '../api/axios';

export default function Navigation() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-[var(--accent-muted)] text-[var(--accent)]'
        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]'
    }`;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-[var(--border)]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left — Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">
              Job Tracker
            </span>
          </div>

          {/* Center — Tab Links */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-secondary)] border border-[var(--border-secondary)]">
            <NavLink to="/dashboard" className={linkClass}>
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </NavLink>
            <NavLink to="/applications" className={linkClass}>
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </NavLink>
          </div>

          {/* Right — Sign Out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] rounded-lg transition-all duration-200 hover:text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
