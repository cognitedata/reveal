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
  formatAxisLabel?: (value: number) => number | string;
}

export interface AxisBase {
  accessor: string;
  label?: string;
  spacing?: number;
  ticks?: number;
}

export interface XAxisPlacement {
  placement?: AxisPlacement.Top | AxisPlacement.Bottom;
}
