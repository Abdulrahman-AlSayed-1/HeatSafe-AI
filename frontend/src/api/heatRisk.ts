import api from './client';

export interface CriticalWindowDTO {
  start: string;
  end: string;
  maxTemperature: number;
}

export interface AffectedTaskDTO {
  taskId: number;
  taskName: string;
  taskStart: string;
  taskEnd: string;
  workerCount?: number;
  riskLevel: string;
  reason: string;
}

export interface HeatRiskAssessmentDTO {
  riskLevel: string;
  score: number;
  criticalWindows: CriticalWindowDTO[];
  affectedTasks: AffectedTaskDTO[];
  reasons: string[];
  assessedAt: string;
}

export const heatRiskApi = {
  assess: (worksiteId: number) =>
    api.get<HeatRiskAssessmentDTO>(`/worksites/${worksiteId}/heat-risk`),
};
