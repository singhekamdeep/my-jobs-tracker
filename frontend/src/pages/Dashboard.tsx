import { useEffect, useState } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import { ApplicationStatus, APPLICATION_STATUSES, STATUS_CONFIG, Application } from '../types';
import DetailPanel from '../components/DetailPanel';
import { Plus, GripVertical, AlertCircle, Loader2, Download, ChevronDown } from 'lucide-react';

export default function Dashboard() {
  const { applications, fetchAll, loading, error, updateStatus, addApplication } = useApplicationStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showExtensionInstructions, setShowExtensionInstructions] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Group applications by status
  const groupedApps = APPLICATION_STATUSES.reduce((acc, status) => {
    acc[status] = applications.filter((app) => app.status === status);
    return acc;
  }, {} as Record<ApplicationStatus, Application[]>);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, appId: string) => {
    e.dataTransfer.setData('appId', appId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: ApplicationStatus) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (appId) {
      await updateStatus(appId, status);
    }
  };

  // Stats
  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.status === 'APPLIED').length,
    interviews: applications.filter((a) => a.status === 'INTERVIEW').length,
    offers: applications.filter((a) => a.status === 'OFFER').length,
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      {/* Top Stats Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="glass px-4 py-2 rounded-xl border border-[var(--border)] shadow-sm">
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-semibold mr-2">Total</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">{stats.total}</span>
          </div>
          <div className="glass px-4 py-2 rounded-xl border border-indigo-500/20 shadow-sm bg-indigo-500/5">
            <span className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mr-2">Applied</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">{stats.applied}</span>
          </div>
          <div className="glass px-4 py-2 rounded-xl border border-amber-500/20 shadow-sm bg-amber-500/5">
            <span className="text-xs text-amber-400 uppercase tracking-wider font-semibold mr-2">Interviews</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">{stats.interviews}</span>
          </div>
          <div className="glass px-4 py-2 rounded-xl border border-emerald-500/20 shadow-sm bg-emerald-500/5">
            <span className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mr-2">Offers</span>
            <span className="text-lg font-bold text-[var(--text-primary)]">{stats.offers}</span>
          </div>
        </div>

        <button
          onClick={() => setShowQuickAdd(true)}
          className="btn-primary gap-2"
        >
          <Plus className="w-4 h-4" />
          Quick Add
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 h-full min-w-max">
          {APPLICATION_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const columnApps = groupedApps[status];

            return (
              <div
                key={status}
                className="w-80 flex flex-col h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className={`p-4 border-b border-[var(--border)] ${config.bgColor} rounded-t-2xl flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.icon}</span>
                    <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                  </div>
                  <span className="text-xs font-medium bg-[var(--surface-secondary)] text-[var(--text-secondary)] px-2 py-1 rounded-full">
                    {columnApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnApps.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center p-4">
                      <p className="text-sm text-[var(--text-tertiary)] border border-dashed border-[var(--border-secondary)] rounded-xl w-full py-8">
                        Drop applications here
                      </p>
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onClick={() => setSelectedApp(app)}
                        className="group bg-[var(--surface-secondary)] hover:bg-[var(--surface-tertiary)] border border-[var(--border-secondary)] rounded-xl p-4 cursor-pointer transition-all hover:shadow-md"
                      >
                        <div className="flex items-start gap-3">
                          <div className="cursor-grab active:cursor-grabbing text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity pt-1 -ml-2 shrink-0">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          
                          <div className="w-10 h-10 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                            {app.company_name ? (
                              <img
                                src={`https://logo.clearbit.com/${app.company_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`}
                                alt={app.company_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <span className={app.company_name ? "hidden font-bold text-[var(--text-secondary)] text-sm" : "font-bold text-[var(--text-secondary)] text-sm"}>
                              {(app.company_name || 'U')[0].toUpperCase()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-[var(--text-primary)] truncate">
                              {app.role || 'Unknown Role'}
                            </h4>
                            <p className="text-xs text-[var(--text-secondary)] truncate mt-0.5">
                              {app.company_name || 'Unknown Company'}
                            </p>
                            
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[10px] text-[var(--text-tertiary)]">
                                {new Date(app.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              {app.parsedMetadata?.salary && app.parsedMetadata.salary !== 'Not mentioned' && (
                                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                                  {app.parsedMetadata.salary.length > 15 ? app.parsedMetadata.salary.substring(0, 15) + '...' : app.parsedMetadata.salary}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

      {/* Footer Buttons */}
      <div className="shrink-0 mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] hover:border-indigo-500/30 transition-all shadow-sm"
          >
            Built for Digital Heroes
          </a>
          <a
            href="mailto:ekamdeeps12@gmail.com"
            className="flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-[var(--surface-secondary)] border border-[var(--border)] text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] hover:border-emerald-500/30 transition-all shadow-sm"
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
              className="flex items-center justify-center gap-2 px-6 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all border-r border-[var(--border)]"
            >
              <Download className="w-3.5 h-3.5" />
              For extension, download this file
            </a>
            <button
              type="button"
              onClick={() => setShowExtensionInstructions(!showExtensionInstructions)}
              className="px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all focus:outline-none"
            >
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExtensionInstructions ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showExtensionInstructions && (
            <>
              {/* Invisible full-screen overlay to catch outside clicks */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowExtensionInstructions(false)}
              />
              
              <div className="absolute bottom-full mb-2 w-72 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-xl p-5 fade-in text-left z-20">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3">How to install:</h3>
                <ol className="text-xs text-[var(--text-secondary)] space-y-2.5 list-decimal list-inside">
                  <li>Extract the downloaded ZIP file.</li>
                  <li>Go to <code className="bg-[var(--surface-secondary)] px-1 rounded text-violet-400">chrome://extensions</code> or <code className="bg-[var(--surface-secondary)] px-1 rounded text-violet-400">brave://extensions</code>.</li>
                  <li>Toggle <strong>Developer mode</strong> ON (top right corner).</li>
                  <li>Click <strong>Load unpacked</strong>.</li>
                  <li>Select the extracted <code className="bg-[var(--surface-secondary)] px-1 rounded text-violet-400">dist</code> folder.</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>      </div>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <QuickAddModal onClose={() => setShowQuickAdd(false)} onSubmit={addApplication} />
      )}

      {/* Detail Panel */}
      <DetailPanel
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
}

// Simple Quick Add Modal component
function QuickAddModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => Promise<any> }) {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ company_name: company, role, rawScrappedData: raw || `Job at ${company} for ${role}`, status: 'SAVED' });
      onClose();
    } catch {
      // Error handled by store
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[var(--border)]">
        <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--surface-secondary)]">
          <h2 className="font-semibold text-[var(--text-primary)]">Quick Add Application</h2>
          <button onClick={onClose} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface)]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Company</label>
            <input required type="text" value={company} onChange={e => setCompany(e.target.value)} className="input-field" placeholder="Acme Corp" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Role</label>
            <input required type="text" value={role} onChange={e => setRole(e.target.value)} className="input-field" placeholder="Frontend Engineer" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">Job Description (Optional)</label>
            <textarea value={raw} onChange={e => setRaw(e.target.value)} className="input-field h-24 resize-y" placeholder="Paste job description here for AI parsing..." />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Ensure X is imported for the modal
import { X } from 'lucide-react';
