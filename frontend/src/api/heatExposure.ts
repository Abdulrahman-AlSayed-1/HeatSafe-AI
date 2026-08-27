import api from './client';

export interface HeatExposureDTO {
  hoursAboveThreshold: number;
  longestContinuousExposure: number;
  peakHeatHour: string;
  thresholdCelsius: number;
}

export const heatExposureApi = {
  get: (worksiteId: number) =>
    api.get<HeatExposureDTO>(`/worksites/${worksiteId}/heat-exposure`),
};
