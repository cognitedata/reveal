import { ScaleLinear, ScaleBand } from 'd3-scale';

export type DataObject<T> = Record<Extract<T, keyof T>, any>;
export type AxisScale = ScaleLinear<number, number> | ScaleBand<string>;
export type GroupedData<T> = { [key: string]: T[] };

export enum AxisPlacement {
  Top = 'Top',
  Right = 'Right',
  Left = 'Left',
  Bottom = 'Bottom',
}

export interface StackedBarChartProps<T> {
  data: T[];
  xAxis: Axis & XAxisPlacement;
  yAxis: Axis;
  yScaleDomain?: string[];
  groupDataInsideBarsBy?: string;
  title?: string;
  subtitle?: string;
  options?: StackedBarChartOptions<T>;
  onUpdate?: () => void;
  onSelectBar?: (selectedBarData: SelectedBarData<T>) => void;
}

export interface AxesProps {
  scales: {
    x: AxisScale;
    y: AxisScale;
  };
  ticks: number;
  margins: Margins;
  chartDimensions: Dimensions;
}

export interface BarsProps<T> {
  initialGroupedData: GroupedData<T>;
  groupedData: GroupedData<T>;
  scales: {
    x: AxisScale;
    y: AxisScale;
  };
  yScaleDomain: string[];
  accessors: {
    x: keyof T;
    y: keyof T;
  };
  legendAccessor?: string;
  margins: Margins;
  barComponentDimensions: Dimensions;
  options?: StackedBarChartOptions<T>;
  onSelectBar: (key: string, index: number) => void;
}

export interface AxisProps {
  placement: AxisPlacement;
  scale: AxisScale;
  translate: string;
  tickSize?: number;
  ticks?: number;
}

export interface Axis {
  accessor: string;
  label?: string;
  spacing?: number;
  ticks?: number;
}

export interface XAxisPlacement {
  placement?: AxisPlacement.Top | AxisPlacement.Bottom;
}

export interface StackedBarChartOptions<T> {
  barColorConfig?: ColorConfig;
  legendOptions?: LegendOptions;
  margins?: Partial<Margins>;
  hideBarLabels?: boolean;
  formatTooltip?: (data: T) => string;
  fixXValuesToDecimalPlaces?: number;
  zoomStepSize?: number;
  noDataAmongSelectedCheckboxesText?: string;
  noDataText?: string;
}

export interface LegendOptions {
  title?: string;
  accessor?: string;
  isolate?: boolean;
  overlay?: boolean;
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
  noDataBarColor?: string;
}

export interface LegendProps {
  checkboxState: LegendCheckboxState;
  barColorConfig: ColorConfig;
  onChange: (option: string, checked: boolean) => void;
  title?: string;
  isolateLegend?: boolean;
  floatingHeight?: number;
}

export interface LegendCheckboxState {
  [option: string]: boolean;
}

export interface SelectedBarData<T> {
  key: string;
  index: number;
  data: T[];
  groupedData: GroupedData<T>;
}
