import { PlotData, Datum } from 'plotly.js';

import { SequenceColumn } from '@cognite/sdk';

import { UserPreferredUnit } from 'constants/units';
import { DataError, Errors } from 'modules/inspectTabs/types';
import { TrajectoryRow, TrajectoryRows } from 'modules/wellSearch/types';
import { ChartDataConfig } from 'tenants/types';

import { Data } from '../../common/Chart/types';
import { TrajectoryView } from '../types';

export type AddData = {
  row: TrajectoryRow;
  chartData: ChartDataConfig;
  columnData?: SequenceColumn[];
  selectedTrajectoryData: (TrajectoryRows | undefined)[];
  userPreferredUnit: UserPreferredUnit;
  normalizeColumns?: Record<string, string>;
};

export interface TrajectoryGraphProps {
  data: TrajectoryView[];
}

export interface TrajectoryChartProps {
  data: Data;
  index: number;
}

export enum DimensionType {
  TWOD,
  THREED,
}

export type DataContainer<T> = {
  dimentionType: DimensionType;
  data: T | undefined;
  error?: DataError;
};

export type ThreeDCoordinate<T> = {
  x: DataContainer<T>;
  y: DataContainer<T>;
  z: DataContainer<T> | undefined;
};

export type ChartData = {
  data: Partial<PlotData>[];
  errors: DataError[];
};

export type ChartListData = {
  data: Array<Partial<PlotData>[]>;
  errors: Errors;
};

export type CoordinatesAndErrors = {
  data: {
    x: Array<Datum>;
    y: Array<Datum>;
    z: Array<Datum>;
  };
  errors: DataError[];
};
