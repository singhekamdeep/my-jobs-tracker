import { useEffect, useState, useMemo } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import { ApplicationStatus, APPLICATION_STATUSES, STATUS_CONFIG, Application } from '../types';
import DetailPanel from '../components/DetailPanel';
import { Plus, Search, Loader2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { applications, fetchAll, loading, error, updateStatus, addApplication } = useApplicationStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Group applications by status with Search
  const filteredApps = useMemo(() => {
    if (!searchQuery.trim()) return applications;
    const lowerQuery = searchQuery.toLowerCase();
    return applications.filter(app => 
      (app.company_name?.toLowerCase().includes(lowerQuery)) || 
      (app.role?.toLowerCase().includes(lowerQuery))
    );
  }, [applications, searchQuery]);

  const groupedApps = APPLICATION_STATUSES.reduce((acc, status) => {
    acc[status] = filteredApps.filter((app) => app.status === status);
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
    <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-[#0b120f]">
      {/* Top Stats Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4 pt-4">
        <div className="flex flex-wrap items-center gap-6 divide-x divide-[var(--border-secondary)]">
          <div className="flex flex-col px-2">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Total</span>
            <span className="font-headline text-3xl font-bold text-[var(--text-primary)]">{stats.total}</span>
          </div>
          <div className="flex flex-col pl-6 pr-2">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Applied</span>
            <span className="font-headline text-3xl font-bold text-[var(--accent)]">{stats.applied}</span>
          </div>
          <div className="flex flex-col pl-6 pr-2">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Interview</span>
            <span className="font-headline text-3xl font-bold text-[var(--text-primary)]">{stats.interviews}</span>
          </div>
          <div className="flex flex-col pl-6 pr-2">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold mb-1">Offers</span>
            <span className="font-headline text-3xl font-bold text-[var(--accent)]">{stats.offers}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[var(--text-secondary)]" />
            </div>
            <input
              type="text"
              placeholder="Search roles, companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full lg:w-64 bg-[var(--surface-secondary)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
            />
          </div>
          <button
            onClick={() => setShowQuickAdd(true)}
            className="btn-primary gap-2 rounded-xl py-2 px-5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add New Job
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex h-full min-w-max divide-x divide-[var(--border-secondary)]">
          {APPLICATION_STATUSES.map((status) => {
            const config = STATUS_CONFIG[status];
            const columnApps = groupedApps[status];
            const displayLabel = config.label;

            return (
              <div
                key={status}
                className="w-[320px] flex flex-col h-full px-4 shrink-0"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className="pb-4 flex items-center gap-3">
                  <h3 className="font-medium text-[var(--text-primary)] text-sm">{displayLabel}</h3>
                  <span className="text-[10px] font-bold bg-[var(--surface-tertiary)] text-[var(--text-secondary)] px-2 py-0.5 rounded">
                    {columnApps.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar rounded-xl bg-transparent">
                  {columnApps.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-center p-4 border border-dashed border-[var(--border)] rounded-2xl">
                      <p className="text-sm text-[var(--text-tertiary)]">
                        Drop here
                      </p>
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onClick={() => setSelectedApp(app)}
                        className="group bg-[var(--surface-elevated)] border border-[var(--border)] rounded-2xl p-4 cursor-pointer card-hover hover:border-[var(--accent-muted)] flex flex-col gap-3 relative"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-10 h-10 rounded-xl bg-[var(--surface-tertiary)] border border-[var(--border-secondary)] flex items-center justify-center shrink-0 overflow-hidden text-[var(--accent)] font-headline font-bold text-base">
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
                            <span className={app.company_name ? "hidden" : ""}>
                              {(app.company_name || 'U')[0].toUpperCase()}
                            </span>
                          </div>
                          
                          <span className="text-[10px] text-[var(--text-tertiary)] font-medium mt-1">
                            {(() => {
                               const diff = Date.now() - new Date(app.created_at).getTime();
                               const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                               return days === 0 ? 'Today' : `${days}d ago`;
                            })()}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm text-[var(--text-primary)] mb-0.5 leading-tight pr-4">
                            {app.role || 'Unknown Role'}
                          </h4>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {app.company_name || 'Unknown Company'}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 pt-1 mt-auto">
                          {app.parsedMetadata?.jobType ? (
                            <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                              {app.parsedMetadata.jobType}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
                              FULL-TIME
                            </span>
                          )}
                          {app.parsedMetadata?.salary && app.parsedMetadata.salary !== 'Not mentioned' && (
                            <span className="text-[11px] font-bold text-[var(--text-secondary)] ml-auto">
                              {app.parsedMetadata.salary}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

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
