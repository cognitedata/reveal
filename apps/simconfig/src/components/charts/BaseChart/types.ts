import type { ScaleLinear, ScaleTime } from 'd3';

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ChartGeometry {
  xScale: ScaleLinear<number, number> | ScaleTime<number, number>;
  yScale: ScaleLinear<number, number>;
  width: number;
  height: number;
  margin: Margin;
}
