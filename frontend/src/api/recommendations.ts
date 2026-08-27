import api from './client';

export interface RecommendationDTO {
  id: number;
  category?: 'TASK_CONTROL' | 'SITE_CONTROL' | string;
  targetTask?: string;
  action: string;
  reasoning: string;
  expectedImpact: string;
}

export const recommendationsApi = {
  getAll: (worksiteId: number) =>
    api.get<RecommendationDTO[]>(`/worksites/${worksiteId}/recommendations`),
};
