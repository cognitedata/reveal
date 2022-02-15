import { BaseAPIResult } from '../types';

export interface Stats {
  documents: {
    total: number;
  };
  wells: {
    total: number;
  };
  seismic: {
    total: number;
  };
}

export interface StatsApiResult extends BaseAPIResult {
  data: { stats: Stats };
}
