import type Color from 'color';
import type { CurveFactory } from 'd3';

import type { OrdinalDatum, TemporalDatum } from '../../types';
import type { ChartGeometry, ChartScale } from '../types';
import type { TooltipProps } from '../usePortalTooltip';

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
