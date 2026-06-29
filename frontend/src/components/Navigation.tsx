import { useState } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { LayoutGrid, List, LogOut, Briefcase, ChevronDown, Mail } from 'lucide-react';
import api from '../api/axios';

export default function Navigation() {
  const navigate = useNavigate();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const handleSignOut = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
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
        <div className="flex items-center justify-between h-16">
          {/* Left — Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold text-[var(--accent)] tracking-tight">
              JobTrack
            </span>
          </Link>

          {/* Center — Links */}
          <div className="hidden md:flex items-center gap-8">
            <div className="relative">
              <button 
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                onClick={() => setShowHowItWorks(!showHowItWorks)}
                onBlur={() => setTimeout(() => setShowHowItWorks(false), 200)}
              >
                How it Works <ChevronDown className={`w-4 h-4 transition-transform ${showHowItWorks ? 'rotate-180' : ''}`} />
              </button>
              
              {showHowItWorks && (
                <>
                  <div className="absolute top-full mt-4 w-72 bg-[var(--surface-elevated)] border border-[var(--border)] rounded-xl shadow-2xl p-5 z-20 fade-in">
                    <h4 className="text-sm font-semibold text-[var(--accent)] mb-3">The Workflow</h4>
                    <ol className="space-y-4 text-sm text-[var(--text-secondary)]">
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--surface-tertiary)] text-[var(--accent)] flex items-center justify-center font-medium text-xs">1</span>
                        <p>Install the browser extension to seamlessly capture job postings.</p>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--surface-tertiary)] text-[var(--accent)] flex items-center justify-center font-medium text-xs">2</span>
                        <p>When applying for a job, click the extension to automatically extract and save the details.</p>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--surface-tertiary)] text-[var(--accent)] flex items-center justify-center font-medium text-xs">3</span>
                        <p>Track your progress from applied to hired using your personal command center.</p>
                      </li>
                    </ol>
                  </div>
                </>
              )}
            </div>
            <NavLink to="/dashboard" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
              Dashboard
            </NavLink>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-4">
            <a href="mailto:ekamdeeps12@gmail.com" className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Mail className="w-4 h-4" />
              Contact Me
            </a>
            <a href="/job-tracker-extension.zip" download className="btn-primary">
              Download Extension
            </a>
            <button
              onClick={handleSignOut}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
