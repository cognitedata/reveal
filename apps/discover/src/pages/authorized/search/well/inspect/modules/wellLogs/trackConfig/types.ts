import { GraphTrackEnum } from '../constants';

export interface PlotConfig {
  measurementType: string;
  scale?: 'linear' | 'log'; // Default: 'linear'
  name?: string;
  dash?: [number, number];
  width?: number;
}

export interface TrackConfig extends PlotConfig {
  trackName: GraphTrackEnum;
}
