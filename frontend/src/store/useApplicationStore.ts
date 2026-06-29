import { create } from 'zustand';
import api from '../api/axios';
import { Application, ApplicationStatus } from '../types';

interface ApplicationFilter {
  status: ApplicationStatus | 'ALL';
  search: string;
}

interface ApplicationState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  filter: ApplicationFilter;

  fetchAll: () => Promise<void>;
  addApplication: (data: {
    rawScrappedData: string;
    status?: ApplicationStatus;
    company_name?: string;
    role?: string;
  }) => Promise<Application>;
  updateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  updateApplication: (
    id: string,
    data: { status?: ApplicationStatus; company_name?: string; role?: string; notes?: string }
  ) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
  reExtract: (id: string) => Promise<void>;
  setFilter: (filter: Partial<ApplicationFilter>) => void;
  getFiltered: () => Application[];
  clearStore: () => void;
}

export const useApplicationStore = create<ApplicationState>((set, get) => ({
  applications: [],
  loading: false,
  error: null,
  filter: { status: 'ALL', search: '' },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.get('/api/applications');
      set({ applications: data.data || data, loading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch applications';
      set({ error: message, loading: false });
    }
  },

  addApplication: async (payload) => {
    try {
      const { data } = await api.post('/api/applications', payload);
      const newApp = data.data || data;
      set((state) => ({
        applications: [newApp, ...state.applications],
      }));
      return newApp;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to add application';
      set({ error: message });
      throw err;
    }
  },

  updateStatus: async (id, status) => {
    // Optimistic update
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === id ? { ...app, status } : app
      ),
    }));
    try {
      await api.patch(`/api/applications/${id}`, { status });
    } catch (err: unknown) {
      // Revert on error
      get().fetchAll();
      const message = err instanceof Error ? err.message : 'Failed to update status';
      set({ error: message });
    }
  },

  updateApplication: async (id, payload) => {
    try {
      const { data } = await api.patch(`/api/applications/${id}`, payload);
      const updated = data.data || data;
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? { ...app, ...updated } : app
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update application';
      set({ error: message });
      throw err;
    }
  },

  deleteApplication: async (id) => {
    set((state) => ({
      applications: state.applications.filter((app) => app.id !== id),
    }));
    try {
      await api.delete(`/api/applications/${id}`);
    } catch (err: unknown) {
      get().fetchAll();
      const message = err instanceof Error ? err.message : 'Failed to delete application';
      set({ error: message });
    }
  },

  bulkDelete: async (ids) => {
    set((state) => ({
      applications: state.applications.filter((app) => !ids.includes(app.id)),
    }));
    try {
      await Promise.all(ids.map((id) => api.delete(`/api/applications/${id}`)));
    } catch (err: unknown) {
      get().fetchAll();
      const message = err instanceof Error ? err.message : 'Failed to delete applications';
      set({ error: message });
    }
  },

  reExtract: async (id) => {
    try {
      const { data } = await api.post(`/api/applications/${id}/extract`);
      const updated = data.data || data;
      set((state) => ({
        applications: state.applications.map((app) =>
          app.id === id ? { ...app, ...updated } : app
        ),
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to re-extract';
      set({ error: message });
      throw err;
    }
  },

  setFilter: (filter) => {
    set((state) => ({
      filter: { ...state.filter, ...filter },
    }));
  },

  getFiltered: () => {
    const { applications, filter } = get();
    return applications.filter((app) => {
      const matchesStatus = filter.status === 'ALL' || app.status === filter.status;
      const searchLower = filter.search.toLowerCase();
      const matchesSearch =
        !filter.search ||
        (app.company_name || '').toLowerCase().includes(searchLower) ||
        (app.role || '').toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  },

  clearStore: () => {
    set({ applications: [], loading: false, error: null });
  },
}));
