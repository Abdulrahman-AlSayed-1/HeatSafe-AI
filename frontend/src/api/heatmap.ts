import api from './client';

export interface HeatmapFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    tile_id?: string;
    average_temperature?: number;
    min_temperature?: number;
    max_temperature?: number;
    temperature?: number;
    hours_above_threshold?: number;
    longest_continuous_hours?: number;
    [key: string]: any;
  };
}

export interface HeatmapGeoJSON {
  type: string;
  features: HeatmapFeature[];
}

export const heatmapApi = {
  get: (worksiteId: number) =>
    api.get<HeatmapGeoJSON>(`/worksites/${worksiteId}/heatmap`),
};
