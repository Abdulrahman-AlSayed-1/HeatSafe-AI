import api from './client';

export enum ExposureType {
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  INDOOR = 'INDOOR',
}

export type ForecastStatus = 'HISTORICAL' | 'FORECASTABLE' | 'AWAITING_FORECAST';

export interface Task {
  id: number;
  worksiteId: number;
  name: string;
  description?: string;
  startTime: string;
  durationMinutes: number;
  workerCount?: number;
  forecastStatus?: ForecastStatus;
  exposureType: ExposureType;
  workRestRatio?: string; // "CONTINUOUS", "45_15", "30_30", "15_45"
  coolingMeasures?: string; // Comma-separated tags
  mitigationNotes?: string;
  riskLevel?: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'UNSUPPORTED' | 'AWAITING_FORECAST';
  riskScore?: number;
  riskReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const tasksApi = {
  getAll: (worksiteId: number) => api.get<Task[]>(`/worksites/${worksiteId}/tasks`),
  get: (worksiteId: number, taskId: number) => api.get<Task>(`/worksites/${worksiteId}/tasks/${taskId}`),
  create: (worksiteId: number, data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'forecastStatus'>) =>
    api.post<Task>(`/worksites/${worksiteId}/tasks`, data),
  update: (worksiteId: number, taskId: number, data: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'forecastStatus'>>) =>
    api.put<Task>(`/worksites/${worksiteId}/tasks/${taskId}`, data),
  delete: (worksiteId: number, taskId: number) => api.delete(`/worksites/${worksiteId}/tasks/${taskId}`),
};
