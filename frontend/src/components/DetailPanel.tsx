import { useState, useEffect, useCallback } from 'react';
import {
  X,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  ExternalLink,
  Calendar,
  Sparkles,
  Trash2,
  Save,
  ChevronDown,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { Application, ApplicationStatus, APPLICATION_STATUSES, STATUS_CONFIG } from '../types';
import { useApplicationStore } from '../store/useApplicationStore';

interface DetailPanelProps {
  application: Application | null;
  onClose: () => void;
}

export default function DetailPanel({ application, onClose }: DetailPanelProps) {
  const { updateApplication, deleteApplication, reExtract } = useApplicationStore();

  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('SAVED');
  const [notes, setNotes] = useState('');
  const [showRawData, setShowRawData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (application) {
      setCompanyName(application.company_name || '');
      setRole(application.role || '');
      setStatus(application.status);
      setNotes(application.notes || '');
      setConfirmDelete(false);
      setShowRawData(false);
      // Trigger entrance animation
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [application]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsVisible(false);
      onClose();
    }, 250);
  }, [onClose]);

  const handleSave = async () => {
    if (!application) return;
    setSaving(true);
    try {
      await updateApplication(application.id, {
        company_name: companyName,
        role,
        status,
        notes,
      });
      handleClose();
    } catch {
      // Error is handled by store
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteApplication(application.id);
    handleClose();
  };

  const handleReExtract = async () => {
    if (!application) return;
    setExtracting(true);
    try {
      await reExtract(application.id);
    } catch {
      // Error handled by store
    } finally {
      setExtracting(false);
    }
  };

  if (!application) return null;

  const meta = application.parsedMetadata;

  let rawUrl = '';
  if (application.rawScrappedData) {
    try {
      const parsed = JSON.parse(application.rawScrappedData);
      rawUrl = parsed.url || '';
    } catch {
      // ignore
    }
  }
  const finalUrl = meta?.applyUrl || rawUrl;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm ${
          isClosing ? 'overlay-exit' : 'overlay-enter'
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg border-l border-[var(--border)] overflow-y-auto ${
          isClosing ? 'panel-exit' : isVisible ? 'panel-enter' : ''
        }`}
        style={{ background: 'var(--surface)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 glass border-b border-[var(--border)]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--surface-tertiary)] border border-[var(--border)]">
                <Building2 className="w-5 h-5 text-[var(--text-secondary)]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">
                  {application.company_name || 'Unknown Company'}
                </h2>
                <p className="text-xs text-[var(--text-tertiary)]">
                  Added {new Date(application.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {finalUrl && (
                <a
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-all duration-150 border border-[var(--accent-muted)]"
                  title="Open Job Listing"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Job
                </a>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)] transition-all duration-150 ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Editable Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Company Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="input-field"
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
                placeholder="Enter role title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="input-field cursor-pointer"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_CONFIG[s].icon} {STATUS_CONFIG[s].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5 uppercase tracking-wider">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field min-h-[100px] resize-y"
                placeholder="Add notes about this application..."
                rows={4}
              />
            </div>
          </div>

          {/* AI Extracted Metadata */}
          {meta && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                  AI-Extracted Info
                </h3>
              </div>

              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] overflow-hidden divide-y divide-[var(--border-secondary)]">
                {meta.location && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <MapPin className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)]">Location</div>
                      <div className="text-sm text-[var(--text-primary)]">{meta.location}</div>
                    </div>
                  </div>
                )}
                {meta.salary && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <DollarSign className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)]">Salary</div>
                      <div className="text-sm text-[var(--text-primary)]">{meta.salary}</div>
                    </div>
                  </div>
                )}
                {meta.jobType && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Clock className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)]">Job Type</div>
                      <div className="text-sm text-[var(--text-primary)]">{meta.jobType}</div>
                    </div>
                  </div>
                )}
                {meta.postedDate && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Calendar className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)]">Posted Date</div>
                      <div className="text-sm text-[var(--text-primary)]">{meta.postedDate}</div>
                    </div>
                  </div>
                )}
                {meta.applyUrl && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <ExternalLink className="w-4 h-4 text-[var(--text-tertiary)] shrink-0" />
                    <div>
                      <div className="text-xs text-[var(--text-tertiary)]">Apply URL</div>
                      <a
                        href={meta.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--accent)] hover:underline break-all"
                      >
                        {meta.applyUrl}
                      </a>
                    </div>
                  </div>
                )}
                {meta.description && (
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText className="w-4 h-4 text-[var(--text-tertiary)]" />
                      <div className="text-xs text-[var(--text-tertiary)]">Description</div>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                )}
                {meta.requirements && meta.requirements.length > 0 && (
                  <div className="px-4 py-3">
                    <div className="text-xs text-[var(--text-tertiary)] mb-2">Requirements</div>
                    <ul className="space-y-1.5">
                      {meta.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleReExtract}
                disabled={extracting}
                className="btn-secondary w-full gap-2"
              >
                <Sparkles className={`w-4 h-4 ${extracting ? 'animate-spin' : ''}`} />
                {extracting ? 'Re-extracting...' : 'Re-extract with AI'}
              </button>
            </div>
          )}

          {/* No metadata yet — show re-extract */}
          {!meta && (
            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 text-[var(--text-tertiary)] mx-auto mb-2" />
              <p className="text-sm text-[var(--text-tertiary)] mb-3">No AI-extracted data yet</p>
              <button
                onClick={handleReExtract}
                disabled={extracting}
                className="btn-primary gap-2"
              >
                <Sparkles className={`w-4 h-4 ${extracting ? 'animate-spin' : ''}`} />
                {extracting ? 'Extracting...' : 'Extract with AI'}
              </button>
            </div>
          )}

          {/* Raw Scraped Data Accordion */}
          {application.rawScrappedData && (
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setShowRawData(!showRawData)}
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-secondary)] transition-colors"
              >
                <span>Raw Scraped Data</span>
                {showRawData ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {showRawData && (
                <div className="px-4 pb-4">
                  <pre className="text-xs text-[var(--text-tertiary)] whitespace-pre-wrap break-all bg-[var(--surface-secondary)] rounded-lg p-3 max-h-60 overflow-y-auto">
                    {application.rawScrappedData}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 pb-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex-1 gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleDelete}
              className={`${confirmDelete ? 'btn-danger' : 'btn-secondary'} gap-2`}
            >
              <Trash2 className="w-4 h-4" />
              {confirmDelete ? 'Confirm' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
