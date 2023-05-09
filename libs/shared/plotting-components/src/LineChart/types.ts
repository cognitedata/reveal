import { Datum } from 'plotly.js';

import { TooltipDetailProps } from './components/Tooltip';

export interface LineChartProps {
  data: Data | Data[];
  dataRevision?: number | string;
  isLoading?: boolean;
  xAxis?: Axis;
  yAxis?: Axis;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  variant?: Variant;
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  style?: Style;
  formatTooltipContent?: (props: TooltipRendererProps) => TooltipDetailProps[];
  renderTooltipContent?: (props: TooltipRendererProps) => JSX.Element;
  renderFilters?: () => [JSX.Element, ...JSX.Element[]];
  renderActions?: () => [JSX.Element, ...JSX.Element[]];
  formatHoverLineInfo?: (props: HoverLineData) => string;
  onRangeChange?: (range: PlotRange) => void;
}

export interface Data {
  x: ValueType[];
  y: ValueType[];
  name?: string;
  color?: string;
  customData?: CustomDataType | CustomDataType[];
  interpolation?: Interpolation;
}

export interface Layout {
  legendPlacement: HorizontalPlacement;
  showTitle: boolean;
  showSubtitle: boolean;
  showLegend: boolean;
  showAxisNames: AxisDirection | false;
  showTicks: boolean;
  showTickLabels: AxisDirection | false;
  showFilters: boolean;
  showActions: boolean;
  showMarkers: boolean;
  showTooltip: boolean;
  showHoverMarker: boolean;
  showHoverLine: boolean;
  showHoverLineInfo: boolean;
}

export interface Config {
  responsive: boolean;
  scrollZoom: AxisDirectionConfig;
  selectionZoom: AxisDirectionConfig;
  buttonZoom: AxisDirectionConfig;
  pan: AxisDirectionConfig;
  hoverMode: HoverMode;
}

export interface Style {
  backgroundColor?: string;
  padding?: number;
  height?: number;
  width?: number;
}

export interface Axis {
  name?: string;
  tickCount?: number;
  tickDistance?: number;
}

export interface TooltipRendererProps {
  x: ValueType;
  y: ValueType;
  name: string;
  color: string;
  customData?: CustomDataType;
}

export interface HoverLineData {
  x: ValueType;
  y: ValueType;
  name: string;
  customData?: CustomDataType;
}

export type ValueType = Datum;

export type Interpolation = 'linear' | 'spline' | 'step';

export type CustomDataType = unknown;

export type Variant = 'small' | 'medium' | 'large';

export type HorizontalPlacement = 'left' | 'center' | 'right';

export type AxisRange = [number, number];

export type AxisDirection = 'x' | 'y' | 'x+y';

export type AxisIdentifier = 'x' | 'y';

export interface KeyTriggeredAxisDirection {
  trigger: 'default' | 'Shift';
  direction: AxisDirection;
}

export type AxisDirectionConfig =
  | false
  | AxisDirection
  | [KeyTriggeredAxisDirection, ...KeyTriggeredAxisDirection[]];

export interface PlotRange {
  x: AxisRange;
  y: AxisRange;
}

export interface Coordinate {
  x?: number;
  y?: number;
}
export type HoverMode = 'data-point' | 'x';
