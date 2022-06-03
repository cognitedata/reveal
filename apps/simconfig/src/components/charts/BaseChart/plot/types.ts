import type { OrdinalDatum, TemporalDatum } from 'components/charts/types';

import type { ChartGeometry, ChartScale } from '../types';
import type { TooltipProps } from '../usePortalTooltip';

import type Color from 'color';
import type { CurveFactory } from 'd3';

export interface PlotProps {
  defaultCurve?: CurveFactory;
  geometry: ChartGeometry;
  scale: ChartScale;
}

export interface PlotFunctionProps {
  data: Partial<OrdinalDatum | TemporalDatum>[];
  color?: Color;
  curve?: CurveFactory;
  label?: string;
  legend?: (symbol: JSX.Element) => void;
  scale?: ChartScale;
}

export interface Plot {
  functionProps?: PlotFunctionProps;
  Plot: () => JSX.Element;
  Label: (props: { itemSize?: number }) => JSX.Element;
  Tooltip: (data: TooltipProps) => JSX.Element;
}
