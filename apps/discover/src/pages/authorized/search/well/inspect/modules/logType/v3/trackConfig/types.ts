import { GraphTrackEnum } from 'modules/wellSearch/service/measurements/constants';

export interface PlotConfig {
  measurementType: string;
  color: string;
  scale?: 'linear' | 'log'; // Default: 'linear'
  name?: string;
  dash?: [number, number];
  width?: number;
}

export interface TrackConfig extends PlotConfig {
  trackName: GraphTrackEnum;
}
