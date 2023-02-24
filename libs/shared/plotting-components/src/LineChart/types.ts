import { Datum } from 'plotly.js';

export type LineChartProps = {
  data: Data | Data[];
  xAxis?: Axis;
  yAxis?: Axis;
  title?: string;
  subtitle?: string;
  variant?: Variant;
  layout?: Layout;
  backgroundColor?: string;
  responsive?: boolean;
  disableTooltip?: boolean;
  renderTooltipContent?: (props: TooltipRendererProps) => JSX.Element;
};

export type LayoutProps =
  | {
      layout?: Layout;
      variant?: never;
    }
  | {
      layout?: never;
      variant?: Variant;
    };

export interface Layout {
  showTitle?: boolean;
  showSubtitle?: boolean;
  showLegend?: boolean;
  showAxisNames?: boolean;
  showTicks?: boolean;
  showTickLabels?: boolean;
}

export interface Data {
  x: Datum[];
  y: Datum[];
  name?: string;
  color?: string;
}

export interface Axis {
  name?: string;
  ticksCount?: number;
  tickDistance?: number;
}

export interface TooltipRendererProps {
  x: Datum;
  y: Datum;
}

export type Variant = 'small' | 'medium' | 'large';
