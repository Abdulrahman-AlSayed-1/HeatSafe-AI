import api from './client';

export interface WorksiteThermalProfileDTO {
  minTemp: number;
  avgTemp: number;
  maxTemp: number;
  unit: string;
  dataBasis: string;
}

export const thermalProfileApi = {
  get: (worksiteId: number) =>
    api.get<WorksiteThermalProfileDTO>(`/worksites/${worksiteId}/thermal-profile`),
};
