import type { ScaleProps } from './scale';

import type { ScaleLinear, ScaleTime } from 'd3';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type ScaleGetter<T> = (props: ScaleProps) => T;

export interface ChartScale {
  xScaleGetter: ScaleGetter<
    ScaleLinear<number, number> | ScaleTime<number, number>
  >;
  yScaleGetter: ScaleGetter<ScaleLinear<number, number>>;
}

export interface ChartGeometry {
  width: number;
  height: number;
  margin: Margin;
}
