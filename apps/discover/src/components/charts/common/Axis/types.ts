import { ScaleLinear, ScaleBand } from 'd3-scale';

export type AxisScale = ScaleLinear<number, number> | ScaleBand<string>;

export enum AxisPlacement {
  Top = 'Top',
  Right = 'Right',
  Left = 'Left',
  Bottom = 'Bottom',
}

export interface AxisProps {
  placement: AxisPlacement;
  scale: AxisScale;
  translate: string;
  tickSize?: number;
  tickPadding?: number;
  ticks?: number;
  hideAxisTicks?: boolean;
  hideAxisLabels?: boolean;
  formatAxisLabel?: (value: number) => number | string;
}

export interface XAxisPlacement {
  placement?: AxisPlacement.Top | AxisPlacement.Bottom;
}
