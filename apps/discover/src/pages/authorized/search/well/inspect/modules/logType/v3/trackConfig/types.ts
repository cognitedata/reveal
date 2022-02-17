import { TrackNameEnum } from './constants';

export interface TrackConfig {
  measurementType: string;
  color: string;
  scale?: 'linear' | 'log'; // Default: 'linear'
  name?: string;
  dash?: [number, number];
  width?: number;
}

export interface TrackName {
  trackName: TrackNameEnum;
}
