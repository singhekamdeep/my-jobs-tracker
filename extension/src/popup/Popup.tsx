import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import {
  Briefcase,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Send,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Clock,
  Building2,
  MapPin,
  DollarSign,
  BookmarkPlus,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────────────

type AppStatus = 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'GHOSTED';

interface ScrapedData {
  title: string;
  url: string;
  ogTitle: string;
  ogDescription: string;
  bodyText: string;
}

interface ParsedJob {
  company_name?: string;
  role?: string;
  salary_range?: string;
  location?: string;
  job_type?: string;
  experience_level?: string;
}

interface RecentSave {
  id: string;
  company: string;
  role: string;
  status: AppStatus;
  savedAt: number;
}

type View = 'loading' | 'login' | 'main' | 'saving' | 'success' | 'error';

// ── API Client ──────────────────────────────────────────────────────────────

const API_BASE = 'https://my-jobs-tracker.onrender.com';

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_BASE,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
  });

  // Request interceptor: attach access token
  client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
    const result = await chrome.storage.local.get(['accessToken']);
    if (result.accessToken) {
      config.headers.Authorization = `Bearer ${result.accessToken}`;
    }
    return config;
  });

  // Response interceptor: handle 401 with token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        try {
          const refreshRes = await axios.post(
            `${API_BASE}/api/auth/refresh`,
            {},
            { withCredentials: true }
          );
          const { accessToken } = refreshRes.data.data;
          await chrome.storage.local.set({ accessToken });
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return client(originalRequest);
        } catch {
          await chrome.storage.local.remove(['accessToken', 'user']);
          return Promise.reject(error);
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const api = createApiClient();

// ── Helpers ─────────────────────────────────────────────────────────────────

const JOB_URL_PATTERNS = [
  /linkedin\.com\/jobs/i,
  /indeed\.com/i,
  /glassdoor\.com/i,
  /greenhouse\.io/i,
  /lever\.co/i,
  /workday\.com/i,
  /myworkday/i,
  /jobs\.ashbyhq\.com/i,
  /boards\.greenhouse\.io/i,
  /angel\.co\/jobs/i,
  /wellfound\.com/i,
  /ziprecruiter\.com/i,
  /dice\.com/i,
  /monster\.com/i,
  /careers\./i,
  /\/jobs?\//i,
  /\/careers?\//i,
];

const JOB_KEYWORDS = ['job', 'position', 'apply', 'qualifications', 'requirements', 'responsibilities', 'salary', 'experience'];

function isLikelyJobPage(url: string, bodyText: string): boolean {
  const urlMatch = JOB_URL_PATTERNS.some((p) => p.test(url));
  if (urlMatch) return true;

  const lowerBody = bodyText.toLowerCase();
  const keywordCount = JOB_KEYWORDS.filter((k) => lowerBody.includes(k)).length;
  return keywordCount >= 3;
}

function parseTitleForRoleCompany(title: string): { role: string; company: string } {
  // Try "Role at Company" pattern
  const atMatch = title.match(/^(.+?)\s+at\s+(.+?)(?:\s*[-|].*)?$/i);
  if (atMatch) return { role: atMatch[1].trim(), company: atMatch[2].trim() };

  // Try "Role - Company" pattern
  const dashParts = title.split(/\s*[-|]\s*/);
  if (dashParts.length >= 2) {
    return { role: dashParts[0].trim(), company: dashParts[1].trim() };
  }

  return { role: title.trim(), company: '' };
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

// ── Status Badge Component ──────────────────────────────────────────────────

const STATUS_STYLES: Record<AppStatus, string> = {
  SAVED: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  APPLIED: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
  INTERVIEW: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  OFFER: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  REJECTED: 'bg-red-500/20 text-red-300 border-red-500/40',
  GHOSTED: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
};

function StatusBadge({ status }: { status: AppStatus }) {
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${STATUS_STYLES[status]}`}>
      {status}
    </span>
  );
}

// ── Main Popup Component ────────────────────────────────────────────────────

export default function Popup() {
  const [view, setView] = useState<View>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isJobPage, setIsJobPage] = useState(false);
  const [parsedTitle, setParsedTitle] = useState({ role: '', company: '' });
  const [selectedStatus, setSelectedStatus] = useState<AppStatus>('SAVED');
  const [scrapeError, setScrapeError] = useState('');
  const [isScraping, setIsScraping] = useState(false);

  const [saveError, setSaveError] = useState('');
  const [parsedJob, setParsedJob] = useState<ParsedJob | null>(null);
  const [recentSaves, setRecentSaves] = useState<RecentSave[]>([]);
  const [showRecent, setShowRecent] = useState(false);

  // ── Auth Check ──────────────────────────────────────────────────────────

  useEffect(() => {
    chrome.storage.local.get(['accessToken']).then((result) => {
      if (result.accessToken) {
        setView('main');
        loadRecentSaves();
        scrapeCurrentPage();
      } else {
        setView('login');
      }
    });
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password }, { withCredentials: true });
      const { accessToken, ...user } = res.data.data;
      await chrome.storage.local.set({ accessToken, user });
      setView('main');
      loadRecentSaves();
      scrapeCurrentPage();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setLoginError(err.response?.data?.message || 'Login failed. Please try again.');
      } else {
        setLoginError('Login failed. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // ignore
    }
    await chrome.storage.local.remove(['accessToken', 'user']);
    setView('login');
    setScrapedData(null);
    setEmail('');
    setPassword('');
  };

  // ── Scrape ──────────────────────────────────────────────────────────────

  const scrapeCurrentPage = useCallback(async () => {
    setIsScraping(true);
    setScrapeError('');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setScrapeError('No active tab found.');
        setIsScraping(false);
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCRAPE_JOB' });
      if (response?.success) {
        const data = response.data as ScrapedData;
        setScrapedData(data);
        setIsJobPage(isLikelyJobPage(data.url, data.bodyText));
        setParsedTitle(parseTitleForRoleCompany(data.ogTitle || data.title));
      } else {
        setScrapeError(response?.error || 'Could not scrape this page.');
      }
    } catch {
      setScrapeError('Could not connect to page. Try refreshing.');
    } finally {
      setIsScraping(false);
    }
  }, []);

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!scrapedData) return;
    setView('saving');
    setSaveError('');

    try {
      const payload = {
        rawScrappedData: JSON.stringify({
          title: scrapedData.title,
          url: scrapedData.url,
          ogTitle: scrapedData.ogTitle,
          ogDescription: scrapedData.ogDescription,
          bodyText: scrapedData.bodyText,
        }),
        status: selectedStatus,
        company_name: parsedTitle.company || undefined,
        role: parsedTitle.role || undefined,
      };

      const res = await api.post('/api/applications', payload);
      const appId = res.data.data.id;

      // Poll for AI extraction results
      let extractedData: ParsedJob | null = null;
      for (let i = 0; i < 4; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        try {
          const pollRes = await api.get(`/api/applications/${appId}`);
          const app = pollRes.data.data;
          if (app.parsedMetadata && Object.keys(app.parsedMetadata).length > 0) {
            extractedData = app.parsedMetadata;
            break;
          }
        } catch {
          // continue polling
        }
      }

      setParsedJob(extractedData);

      // Save to recent
      const newRecent: RecentSave = {
        id: appId,
        company: extractedData?.company_name || parsedTitle.company || 'Unknown',
        role: extractedData?.role || parsedTitle.role || 'Unknown Role',
        status: selectedStatus,
        savedAt: Date.now(),
      };

      const stored = await chrome.storage.local.get(['recentSaves']);
      const existing: RecentSave[] = stored.recentSaves || [];
      const updated = [newRecent, ...existing].slice(0, 3);
      await chrome.storage.local.set({ recentSaves: updated });
      setRecentSaves(updated);

      setView('success');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setSaveError(err.response?.data?.message || 'Failed to save. Please try again.');
      } else {
        setSaveError('Failed to save. Please try again.');
      }
      setView('error');
    }
  };

  // ── Recent Saves ───────────────────────────────────────────────────────

  const loadRecentSaves = async () => {
    const stored = await chrome.storage.local.get(['recentSaves']);
    setRecentSaves(stored.recentSaves || []);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  // Loading view
  if (view === 'loading') {
    return (
      <div className="w-[380px] h-[200px] bg-[#1e1e2e] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    );
  }

  // Login view
  if (view === 'login') {
    return (
      <div className="w-[380px] bg-[#1e1e2e] text-white p-6 fade-in">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">Job Tracker</h1>
            <p className="text-[11px] text-gray-500">Sign in to save jobs</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#181825] border border-[#313244] rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {loginError && (
            <div className="flex items-center gap-2 text-red-400 text-[11px] bg-red-500/10 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-all flex items-center justify-center gap-2"
          >
            {loginLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <LogOut className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-600 text-center mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => chrome.tabs.create({ url: 'https://my-jobs-tracker.vercel.app/register' })}
            className="text-violet-400 hover:text-violet-300 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    );
  }

  // Saving view
  if (view === 'saving') {
    return (
      <div className="w-[380px] h-[280px] bg-[#1e1e2e] text-white flex flex-col items-center justify-center gap-4 fade-in">
        <div className="relative">
          <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin absolute -top-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">Saving & Extracting</p>
          <p className="text-[11px] text-gray-500 mt-1">AI is analyzing this job listing...</p>
        </div>
        <div className="flex gap-1.5 mt-2">
          <div className="w-2 h-2 rounded-full bg-violet-400 pulse-dot" />
          <div className="w-2 h-2 rounded-full bg-violet-400 pulse-dot" />
          <div className="w-2 h-2 rounded-full bg-violet-400 pulse-dot" />
        </div>
      </div>
    );
  }

  // Error view
  if (view === 'error') {
    return (
      <div className="w-[380px] bg-[#1e1e2e] text-white p-6 fade-in">
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white">Failed to Save</p>
            <p className="text-[11px] text-gray-400 mt-1">{saveError}</p>
          </div>
          <button
            onClick={() => setView('main')}
            className="mt-2 bg-[#313244] hover:bg-[#45475a] text-sm text-white rounded-lg px-4 py-2 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Success view
  if (view === 'success') {
    return (
      <div className="w-[380px] bg-[#1e1e2e] text-white p-5 fade-in">
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Job Saved!</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Successfully added to your tracker</p>
          </div>
        </div>

        {parsedJob && (
          <div className="bg-[#181825] rounded-xl border border-[#313244] p-4 space-y-2.5 mb-4">
            {(parsedJob.company_name || parsedTitle.company) && (
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-300">{parsedJob.company_name || parsedTitle.company}</span>
              </div>
            )}
            {(parsedJob.role || parsedTitle.role) && (
              <div className="flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-300">{parsedJob.role || parsedTitle.role}</span>
              </div>
            )}
            {parsedJob.salary_range && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-300">{parsedJob.salary_range}</span>
              </div>
            )}
            {parsedJob.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-300">{parsedJob.location}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => chrome.tabs.create({ url: 'https://my-jobs-tracker.vercel.app/dashboard' })}
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg px-3 py-2.5 transition-all flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Dashboard
          </button>
          <button
            onClick={() => {
              setView('main');
              setParsedJob(null);
              scrapeCurrentPage();
            }}
            className="flex-1 bg-[#313244] hover:bg-[#45475a] text-white text-xs font-medium rounded-lg px-3 py-2.5 transition-all"
          >
            Save Another
          </button>
        </div>
      </div>
    );
  }

  // Main view
  return (
    <div className="w-[380px] bg-[#1e1e2e] text-white fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-500/20 rounded-lg flex items-center justify-center">
            <Briefcase className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <span className="text-sm font-bold text-white">Job Tracker</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-500 hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-[#313244]"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Scraping status */}
        {isScraping ? (
          <div className="flex items-center gap-2 text-gray-400 text-xs">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Scanning page...
          </div>
        ) : scrapeError ? (
          <div className="flex items-start gap-2 text-amber-400 text-[11px] bg-amber-500/10 rounded-lg px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <div>
              <p>{scrapeError}</p>
              <button
                onClick={scrapeCurrentPage}
                className="text-amber-300 underline mt-1 hover:text-amber-200"
              >
                Retry
              </button>
            </div>
          </div>
        ) : scrapedData ? (
          <>
            {/* Page info card */}
            <div className="bg-[#181825] rounded-xl border border-[#313244] p-3.5">
              <div className="flex items-start gap-2 mb-2">
                {isJobPage ? (
                  <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    JOB PAGE
                  </span>
                ) : (
                  <span className="flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-400 border border-gray-500/40">
                    PAGE
                  </span>
                )}
              </div>

              {parsedTitle.role && (
                <p className="text-sm font-medium text-white leading-tight mb-1 line-clamp-2">
                  {parsedTitle.role}
                </p>
              )}
              {parsedTitle.company && (
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {parsedTitle.company}
                </p>
              )}

              <p className="text-[10px] text-gray-600 mt-2 truncate" title={scrapedData.url}>
                {scrapedData.url}
              </p>
            </div>

            {/* Status selector */}
            <div>
              <label className="block text-[11px] font-medium text-gray-400 mb-2">Status</label>
              <div className="flex gap-2">
                {(['SAVED', 'APPLIED', 'INTERVIEW'] as AppStatus[]).map((status) => (
                  <label key={status} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="sr-only status-radio"
                    />
                    <div
                      className={`text-center text-[11px] font-medium py-2 rounded-lg border transition-all ${
                        selectedStatus === status
                          ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                          : 'border-[#313244] bg-[#181825] text-gray-500 hover:border-[#45475a] hover:text-gray-400'
                      }`}
                    >
                      {status}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-xl px-4 py-3 transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 active:scale-[0.98]"
            >
              <BookmarkPlus className="w-4 h-4" />
              Save Job
            </button>
          </>
        ) : null}

        {/* Recent saves */}
        {recentSaves.length > 0 && (
          <div>
            <button
              onClick={() => setShowRecent(!showRecent)}
              className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-400 transition-colors w-full"
            >
              <Clock className="w-3 h-3" />
              Recent saves
              <ChevronDown
                className={`w-3 h-3 ml-auto transition-transform ${showRecent ? 'rotate-180' : ''}`}
              />
            </button>

            {showRecent && (
              <div className="mt-2 space-y-1.5 fade-in">
                {recentSaves.map((save) => (
                  <div
                    key={save.id}
                    className="flex items-center justify-between bg-[#181825] rounded-lg px-3 py-2 border border-[#313244]/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white truncate">{save.role}</p>
                      <p className="text-[10px] text-gray-500 truncate">{save.company}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <StatusBadge status={save.status} />
                      <span className="text-[10px] text-gray-600">{timeAgo(save.savedAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
