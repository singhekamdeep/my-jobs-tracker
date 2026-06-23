import { useEffect, useState, useMemo } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import { ApplicationStatus, APPLICATION_STATUSES, STATUS_CONFIG, Application } from '../types';
import DetailPanel from '../components/DetailPanel';
import { Search, Filter, Trash2, Loader2, ArrowUpDown, Building2 } from 'lucide-react';

export default function Applications() {
  const { applications, fetchAll, loading, bulkDelete } = useApplicationStore();
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  
  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<'company' | 'role' | 'date'>('date');
  const [sortDesc, setSortDesc] = useState(true);
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Derived state
  const filteredAndSortedApps = useMemo(() => {
    let result = [...applications];

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(app => app.status === statusFilter);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(app => 
        (app.company_name?.toLowerCase().includes(q)) || 
        (app.role?.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'company') {
        comparison = (a.company_name || '').localeCompare(b.company_name || '');
      } else if (sortField === 'role') {
        comparison = (a.role || '').localeCompare(b.role || '');
      } else if (sortField === 'date') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortDesc ? -comparison : comparison;
    });

    return result;
  }, [applications, search, statusFilter, sortField, sortDesc]);

  // Handlers
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredAndSortedApps.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedApps.map(a => a.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} applications?`)) return;
    
    setIsDeletingBulk(true);
    try {
      await bulkDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setIsDeletingBulk(false);
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-64px)] overflow-hidden flex flex-col max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">All Applications</h1>
          
          {selectedIds.size > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isDeletingBulk}
              className="btn-danger flex items-center gap-2"
            >
              {isDeletingBulk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Selected ({selectedIds.size})
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
              placeholder="Search by company or role..."
            />
          </div>
          
          <div className="relative min-w-[200px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-tertiary)]">
              <Filter className="w-4 h-4" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input-field pl-9 cursor-pointer appearance-none"
            >
              <option value="ALL">All Statuses</option>
              {APPLICATION_STATUSES.map(s => (
                <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[var(--surface-secondary)] z-10 shadow-sm border-b border-[var(--border)]">
            <tr>
              <th className="p-4 w-12">
                <input
                  type="checkbox"
                  checked={filteredAndSortedApps.length > 0 && selectedIds.size === filteredAndSortedApps.length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] bg-[var(--surface)] cursor-pointer"
                />
              </th>
              <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--surface-tertiary)] transition-colors" onClick={() => toggleSort('company')}>
                <div className="flex items-center gap-1">Company {sortField === 'company' && <ArrowUpDown className="w-3 h-3" />}</div>
              </th>
              <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--surface-tertiary)] transition-colors" onClick={() => toggleSort('role')}>
                <div className="flex items-center gap-1">Role {sortField === 'role' && <ArrowUpDown className="w-3 h-3" />}</div>
              </th>
              <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider cursor-pointer hover:bg-[var(--surface-tertiary)] transition-colors" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-1">Date Added {sortField === 'date' && <ArrowUpDown className="w-3 h-3" />}</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredAndSortedApps.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-[var(--text-tertiary)]">
                  No applications found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAndSortedApps.map((app) => {
                const config = STATUS_CONFIG[app.status];
                const isSelected = selectedIds.has(app.id);

                return (
                  <tr
                    key={app.id}
                    className={`group hover:bg-[var(--surface-secondary)] transition-colors cursor-pointer ${isSelected ? 'bg-[var(--surface-tertiary)]' : ''}`}
                    onClick={() => setSelectedApp(app)}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(app.id)}
                        className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)] bg-[var(--surface)] cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center overflow-hidden shrink-0">
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
                          <Building2 className={app.company_name ? "hidden w-4 h-4 text-[var(--text-tertiary)]" : "w-4 h-4 text-[var(--text-tertiary)]"} />
                        </div>
                        <span className="font-medium text-[var(--text-primary)]">
                          {app.company_name || 'Unknown Company'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] font-medium">
                      {app.role || 'Unknown Role'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bgColor} ${config.color} ${config.borderColor}`}>
                        {config.icon} {config.label}
                      </span>
                    </td>
                    <td className="p-4 text-[var(--text-secondary)] text-sm">
                      {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DetailPanel
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
      />
    </div>
  );
}
