import {
  Accessors,
  AxisScales,
  BaseChartOptions,
  BaseChartProps,
  ColorConfig,
} from '../../types';

export interface ScatterPlotProps<T> extends BaseChartProps<T> {
  renderPlotHoverComponent?: (dataElement: T) => JSX.Element;
}

export type ScatterPlotOptions<T> = BaseChartOptions<T>;

export interface PlotsProps<T> {
  data: T[];
  scales: AxisScales;
  accessors: Accessors;
  colorConfig?: ColorConfig;
  options?: ScatterPlotOptions<T>;
  renderPlotHoverComponent?: (dataElement: T) => JSX.Element;
}
