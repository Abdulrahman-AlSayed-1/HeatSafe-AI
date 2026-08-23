import api from './client';

export interface TemperaturePoint {
  timestamp: string;
  temperature: number;
}

export interface CriticalWindow {
  start: string;
  end: string;
}

export interface TemperatureSeries {
  source: string;
  unit: string;
  dataBasis: string;
  points: TemperaturePoint[];
  riskThreshold: number;
  criticalWindows: CriticalWindow[];
}

export const temperatureApi = {
  getSeries: (worksiteId: number) =>
    api.get<TemperatureSeries>(`/worksites/${worksiteId}/temperature`),
};
