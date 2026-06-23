export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'GHOSTED';

export interface ParsedMetadata {
  companyName?: string;
  role?: string;
  location?: string;
  salary?: string;
  jobType?: string;
  description?: string;
  requirements?: string[];
  applyUrl?: string;
  postedDate?: string;
}

export interface Application {
  id: string;
  user_id: string;
  company_name: string | null;
  role: string | null;
  status: ApplicationStatus;
  rawScrappedData: string;
  parsedMetadata: ParsedMetadata | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'SAVED',
  'APPLIED',
  'INTERVIEW',
  'OFFER',
  'REJECTED',
  'GHOSTED',
];

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
  SAVED: {
    label: 'Saved',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    icon: '📌',
  },
  APPLIED: {
    label: 'Applied',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    icon: '📤',
  },
  INTERVIEW: {
    label: 'Interview',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    icon: '🎯',
  },
  OFFER: {
    label: 'Offer',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: '🎉',
  },
  REJECTED: {
    label: 'Rejected',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: '✗',
  },
  GHOSTED: {
    label: 'Ghosted',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    icon: '👻',
  },
};
