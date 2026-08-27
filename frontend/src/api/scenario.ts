import api from './client';
import { HeatRiskAssessmentDTO } from './heatRisk';

import { Task } from './tasks';

export interface ScenarioRequestDTO {
  taskId: number;
  proposedStartTime?: string;
  proposedDurationMinutes?: number;
  proposedWorkRestRatio?: string; // "CONTINUOUS", "45_15", "30_30", "15_45"
  proposedCoolingMeasures?: string; // Comma-separated tags
  applyToTask?: boolean;
}

export interface TaskRiskEvaluationDTO {
  riskLevel: 'SAFE' | 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' | 'UNSUPPORTED';
  riskScore: number;
  riskReason: string;
  taskPeakTemp?: number;
}

export interface ScenarioResponseDTO {
  baselineAssessment: HeatRiskAssessmentDTO;
  proposedAssessment: HeatRiskAssessmentDTO;
  baselineTaskRisk?: TaskRiskEvaluationDTO;
  proposedTaskRisk?: TaskRiskEvaluationDTO;
  applied?: boolean;
  updatedTask?: Task;
  mitigationSummary?: string;
  createdAt: string;
}

export const scenarioApi = {
  evaluate: (worksiteId: number, data: ScenarioRequestDTO) =>
    api.post<ScenarioResponseDTO>(`/worksites/${worksiteId}/scenarios`, data),
};
