import { Trace } from '@cognite/seismic-sdk-js';

import { LineProps } from 'modules/seismicSearch/types';

export type SeismicDisplayType = {
  id: string;
  title: string;
};

export type SeismicColor = {
  id: string;
  title: string;
  startColor: string;
  middleColor: string;
  endColor: string;
};

export type LineRange = {
  id: string;
  iline: LineProps;
  xline: LineProps;
};

export type RangeMap = {
  [key: string]: LineRange;
};

export type FetchedSlices = {
  [key: string]: { [key: string]: SliceData };
};

export type Tuplet = [number, number];

export type SliceData = {
  id: string;
  mean: number;
  standardDeviation: number;
  min: number;
  max: number;
  content: Trace[];
};

export type XAxisData = {
  index: number;
  value: number;
  left: number;
  x: number;
  y: number;
  traceList: number[];
};

export type YAxisData = {
  index: number;
  value: number;
  top: number;
};

export interface WheelEvent {
  nativeEvent: { wheelDelta: number };
}
