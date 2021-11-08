import { AxisBase, AxisScale, XAxisPlacement } from '../../common/Axis';
import { LegendOptions } from '../../common/Legend';
import { ColorConfig, Dimensions, GroupedData, Margins } from '../../types';

export interface StackedBarChartProps<T> {
  data: T[];
  xAxis: AxisBase & XAxisPlacement;
  yAxis: AxisBase;
  yScaleDomain?: string[];
  groupDataInsideBarsBy?: string;
  title?: string;
  subtitle?: string;
  options?: StackedBarChartOptions<T>;
  onUpdate?: () => void;
  onSelectBar?: (selectedBarData: SelectedBarData<T>) => void;
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

export interface BarsProps<T> {
  data: T[];
  initialGroupedData: GroupedData<T>;
  groupedData: GroupedData<T>;
  scales: {
    x: AxisScale;
    y: AxisScale;
  };
  yScaleDomain: string[];
  accessors: {
    x: string;
    y: string;
  };
  legendAccessor?: string;
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
