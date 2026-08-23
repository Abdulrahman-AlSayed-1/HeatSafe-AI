import api from './client';

export interface Worksite {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  createdAt: string;
  updatedAt: string;
}

export const worksitesApi = {
  getAll: () => api.get<Worksite[]>('/worksites'),
  get: (id: number) => api.get<Worksite>(`/worksites/${id}`),
  create: (data: Omit<Worksite, 'id' | 'createdAt' | 'updatedAt'>) =>
    api.post<Worksite>('/worksites', data),
};
