import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';

import { Datum, PlotData } from 'plotly.js';

import { Errors } from 'modules/inspectTabs/types';

import { CHART_PLANES } from './constants';

export interface TrajectoryView extends TrajectoryWithData {
  wellboreName: string;
}

export interface ChartDataList {
  data: Array<Partial<PlotData>[]>;
  errors: Errors;
}

export type ChartPlane = typeof CHART_PLANES[number];

export type ChartCoordinates = Record<ChartPlane, Datum[]>;
