import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronDown, Download, LogIn, ExternalLink } from 'lucide-react';

export default function Landing() {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const isAuthenticated = !!localStorage.getItem('accessToken') || !!localStorage.getItem('refreshToken');
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)] text-[var(--text-primary)]">
      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 bg-[var(--surface-secondary)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-headline text-2xl font-bold text-[var(--accent)] tracking-tight">JobTrack</span>
          </div>

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
            <Link to="/dashboard" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <a href="/job-tracker-extension.zip" download className="btn-primary">
              Download Extension
            </a>
            <Link to="/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors p-2">
              <LogIn className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center rounded-full border border-[var(--border-secondary)] bg-[var(--surface-tertiary)]/50 px-3 py-1 text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
            Career Command Center
          </div>
          <h1 className="font-headline text-6xl md:text-7xl font-bold leading-tight">
            Track your L's until<br/>you get a <span className="italic text-[var(--accent)]">W.</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-lg leading-relaxed">
            The ultimate job hunting companion. Like RCB, I believe in the hustle. Manage your applications with the precision of a high-end investment portfolio.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <a href="/job-tracker-extension.zip" download className="btn-primary px-8 py-3 rounded-lg font-semibold">
              Get the Browser Extension
            </a>
            <Link to="/dashboard" className="btn-secondary px-8 py-3 rounded-lg font-semibold border-[var(--border)] text-[var(--text-primary)]">
              Explore Dashboard
            </Link>
          </div>
        </div>
        
        {/* Mockup Right Side */}
        <div className="flex-1 w-full max-w-xl hidden md:block">
          <div className="relative rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] p-4 shadow-2xl overflow-hidden min-h-[400px]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--surface-secondary)] to-[var(--surface-elevated)] opacity-50"></div>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[var(--surface-tertiary)] border border-[var(--border)] rounded-xl p-4 shadow-xl z-10">
              <div className="flex items-center gap-3 mb-4 border-b border-[var(--border-secondary)] pb-3">
                <div className="w-8 h-8 rounded bg-[var(--surface)] flex items-center justify-center font-bold text-xs">U</div>
                <div>
                  <div className="text-sm font-semibold">Software Engineer</div>
                  <div className="text-xs text-[var(--text-secondary)]">Tech Corp</div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-2 w-full bg-[var(--surface)] rounded"></div>
                <div className="h-2 w-3/4 bg-[var(--surface)] rounded"></div>
              </div>
              <div className="w-full py-2 bg-[var(--accent)] text-[var(--surface-secondary)] text-center rounded text-sm font-bold flex justify-center items-center gap-2">
                Save Job
              </div>
            </div>
            
            {/* Little floating element */}
            <div className="absolute bottom-8 left-8 bg-[var(--surface-tertiary)] border border-[var(--border)] rounded-xl p-3 shadow-lg z-20 flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-[var(--text-primary)]">Job Saved</div>
                <div className="text-[10px] text-[var(--text-secondary)]">Extracted by AI</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Box Section */}
      <section className="py-24 px-6 bg-[var(--surface)] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-bold mb-4">Sophisticated Tracking</h2>
            <p className="text-[var(--text-secondary)]">Everything you need to turn rejections into opportunities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Box 1 - Tall */}
            <div className="lg:col-span-1 lg:row-span-2 bg-[var(--surface-elevated)] border border-[var(--border)] p-8 rounded-2xl flex flex-col items-start hover:border-[var(--accent)] transition-colors duration-300">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-muted)] text-[var(--accent)] flex items-center justify-center mb-8">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-headline text-2xl font-bold mb-4">One-Click Job Capturing</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-8 flex-1">
                Stop copying and pasting into spreadsheets. Our browser extension universally works across LinkedIn, Indeed, and Google Jobs with seamless precision.
              </p>
              <a href="/job-tracker-extension.zip" download className="btn-primary w-full uppercase tracking-wider text-xs py-3 text-center block">
                DOWNLOAD EXTENSION
              </a>
            </div>

            {/* Box 2 - Wide Top */}
            <div className="lg:col-span-2 bg-[var(--surface-elevated)] border border-[var(--border)] p-8 rounded-2xl hover:border-[var(--accent)] transition-colors duration-300">
              <div className="flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1">
                  <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider mb-2">Integrated with Gemini Pro</div>
                  <h3 className="font-headline text-2xl font-bold mb-4">AI-Powered Data Extraction</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                    Let AI do the heavy lifting. Powered by Google Gemini, we transform messy job descriptions into clean, structured data including company profiles, salary ranges, and tech stacks.
                  </p>
                </div>
                <div className="w-full md:w-48 h-32 rounded-xl border border-[var(--border-secondary)] bg-[var(--surface-tertiary)] flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-muted)] to-transparent animate-pulse-gentle"></div>
                   <div className="font-mono text-[10px] text-[var(--text-tertiary)] text-left p-4 opacity-75">
                     {`{\n  "salary": "$140k",\n  "role": "Frontend",\n  "company": "Tech"\n}`}
                   </div>
                </div>
              </div>
            </div>

            {/* Box 3 - Bottom Left (middle col) */}
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] p-8 rounded-2xl hover:border-[var(--accent)] transition-colors flex flex-col justify-center">
              <h3 className="font-headline text-xl font-bold mb-3 uppercase tracking-wider text-xs">Status Tracking & Accountability</h3>
              <p className="text-[var(--text-secondary)] leading-relaxed text-xs">
                Never lose track of an opportunity. Maintain a central source of truth for all your applications, follow-ups, and interview notes. Ghosting becomes a metric, not a mystery.
              </p>
            </div>

            {/* Box 4 - Bottom Right */}
            <div className="bg-[var(--surface-elevated)] border border-[var(--border)] p-8 rounded-2xl hover:border-[var(--accent)] transition-colors flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <h3 className="font-headline text-2xl font-bold mb-4">Visual Kanban Pipeline</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                  Visualize your path to the offer letter. A beautiful, drag-and-drop board that maps out every stage of your recruitment journey from discovery to negotiation.
                </p>
              </div>
              <div className="w-16 h-24 rounded-lg border-2 border-[var(--accent)] bg-[var(--surface-tertiary)] shrink-0 flex flex-col p-1.5 gap-1.5">
                 <div className="w-full h-1/3 bg-[var(--accent)] rounded opacity-80"></div>
                 <div className="w-full h-1/4 bg-[var(--text-secondary)] rounded opacity-30"></div>
                 <div className="w-full h-1/4 bg-[var(--text-secondary)] rounded opacity-30"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[var(--surface-secondary)] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-headline text-xl font-bold text-[var(--accent)]">JobTrack</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 border border-[var(--border)] px-4 py-2 rounded-lg bg-[var(--surface-tertiary)]">
              Built for Digital Heroes <ExternalLink className="w-3 h-3" />
            </a>
            <a href="mailto:ekamdeeps12@gmail.com" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1.5 border border-[var(--border)] px-4 py-2 rounded-lg bg-[var(--surface-tertiary)]">
              Connect <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
