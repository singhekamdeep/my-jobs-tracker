import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Target, Download, ChevronDown } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExtensionInstructions, setShowExtensionInstructions] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await api.post(endpoint, { email, password });
      
      if (response.data.data.accessToken) {
        localStorage.setItem('accessToken', response.data.data.accessToken);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      {/* Background gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md">
        <div className="text-center mb-10 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white mb-6 shadow-xl shadow-indigo-500/20">
            <Target className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            {isLogin
              ? 'Enter your details to access your dashboard'
              : 'Sign up to start tracking your job applications'}
          </p>
        </div>

        <div className="glass rounded-3xl p-8 border border-[var(--border)] relative shadow-2xl">
          {/* Tabs */}
          <div className="flex bg-[var(--surface-secondary)] p-1 rounded-xl mb-8">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                isLogin
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                !isLogin
                  ? 'bg-[var(--surface)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-start">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] hover:border-indigo-500/30 transition-all shadow-sm"
            >
              Built for Digital Heroes
            </a>
            <a
              href="mailto:ekamdeeps12@gmail.com"
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] hover:border-emerald-500/30 transition-all shadow-sm"
            >
              Made By - Ekamdeep Singh
            </a>
          </div>

          {/* Extension Download */}
          <div className="relative flex flex-col items-center justify-center z-20">
            <div className="flex items-center bg-[var(--surface-secondary)] border border-[var(--border)] rounded-full overflow-hidden shadow-sm hover:border-violet-500/30 transition-all">
              <a
                href="/job-tracker-extension.zip"
                download="job-tracker-extension.zip"
                className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all border-r border-[var(--border)]"
              >
                <Download className="w-4 h-4" />
                For extension, download this file
              </a>
              <button
                type="button"
                onClick={() => setShowExtensionInstructions(!showExtensionInstructions)}
                className="px-3 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all focus:outline-none"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showExtensionInstructions ? 'rotate-180' : ''}`} />
              </button>
            </div>
            
            {showExtensionInstructions && (
              <div className="absolute top-full mt-2 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-5 fade-in text-left">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">How to install:</h3>
                <ol className="text-xs text-[var(--text-secondary)] space-y-2.5 list-decimal list-inside">
                  <li>Extract the downloaded ZIP file.</li>
                  <li>Go to <code className="bg-[var(--surface-secondary)] px-1 rounded text-violet-400">chrome://extensions</code> or <code className="bg-[var(--surface-secondary)] px-1 rounded text-violet-400">brave://extensions</code>.</li>
                  <li>Toggle <strong>Developer mode</strong> ON (top right corner).</li>
                  <li>Click <strong>Load unpacked</strong>.</li>
                  <li>Select the extracted <code className="bg-[var(--surface-secondary)] px-1 rounded text-violet-400">dist</code> folder.</li>
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
