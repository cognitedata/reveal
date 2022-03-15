import { AxisScale, XAxisPlacement } from './common/Axis';
import { LegendOptions } from './common/Legend';

export type DataObject<T> = Record<Extract<T, keyof T>, any>;
export type GroupedData<T> = { [key: string]: T[] };

export type ScaleRange = [number, number];

export interface ChartId {
  id: string;
}

export interface BaseChartProps<T> extends ChartId {
  data: T[];
  xAxis: ChartAxis & XAxisPlacement;
  yAxis: ChartAxis;
  title?: string;
  subtitle?: string;
  options?: BaseChartOptions<T>;
  onUpdate?: () => void;
}

export interface ChartAxis {
  accessor: string;
  title?: string;
  spacing?: number;
  ticks?: number;
  formatAxisLabel?: (value: number) => number | string;
  reverseScaleDomain?: boolean;
}

export interface BaseChartOptions<T> {
  maxHeight?: number | string;
  colorConfig?: ColorConfig;
  legendOptions?: LegendOptions;
  margins?: Partial<Margins>;
  formatTooltip?: (data: T) => string;
  fixXValuesToDecimalPlaces?: number;
  zoomStepSize?: number;
}

export interface AxisScales {
  x: AxisScale;
  y: AxisScale;
}

export interface Accessors {
  x: string;
  y: string;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface ColorConfig {
  colors: { [x: string]: string };
  accessor: string;
  defaultColor: string;
  noDataColor?: string;
}
