import type { OrdinalDatum, TemporalDatum } from 'components/charts/types';

import type { ChartGeometry } from '../types';
import type { TooltipProps } from '../usePortalTooltip';

import type Color from 'color';
import type { CurveFactory } from 'd3';

export interface PlotProps extends ChartGeometry {
  defaultCurve?: CurveFactory;
}

export interface PlotFunctionProps {
  data: Partial<OrdinalDatum | TemporalDatum>[];
  color?: Color;
  curve?: CurveFactory;
  label?: string;
  legend?: (symbol: JSX.Element) => void;
}

export interface Plot {
  Plot: () => JSX.Element;
  Label: (props: { itemSize?: number }) => JSX.Element;
  Tooltip: (data: TooltipProps) => JSX.Element;
}
