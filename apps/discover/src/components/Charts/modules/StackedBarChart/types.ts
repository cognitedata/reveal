import {
  Accessors,
  AxisScales,
  BaseChartOptions,
  BaseChartProps,
  ColorConfig,
  Dimensions,
  GroupedData,
  Margins,
} from '../../types';

export interface StackedBarChartProps<T> extends BaseChartProps<T> {
  yScaleDomain?: string[];
  groupDataInsideBarsBy?: string;
  options?: StackedBarChartOptions<T>;
  onSelectBar?: (selectedBarData: SelectedBarData<T>) => void;
}

export interface StackedBarChartOptions<T> extends BaseChartOptions<T> {
  hideBarLabels?: boolean;
  noDataAmongSelectedCheckboxesText?: string;
  noDataText?: string;
}

export interface BarsProps<T> {
  initialGroupedData: GroupedData<T>;
  groupedData: GroupedData<T>;
  scales: AxisScales;
  xScaleMaxValue: number;
  yScaleDomain: string[];
  accessors: Accessors;
  colorConfig?: ColorConfig;
  margins: Margins;
  barComponentDimensions: Dimensions;
  options?: StackedBarChartOptions<T>;
  onSelectBar: (key: string, index: number) => void;
}

export interface SelectedBarData<T> {
  key: string;
  index: number;
  data: T[];
  groupedData: GroupedData<T>;
}
