import { DatumInternal } from 'domain/wells/wellbore/internal/types';

import { Distance } from 'convert-units';
import { PlotData } from 'plotly.js';

import {
  DepthIndexTypeEnum,
  DepthMeasurement,
  DepthMeasurementData,
  DepthMeasurementDataColumn,
  DistanceRange,
} from '@cognite/sdk-wells';

import { DataError } from 'modules/inspectTabs/types';

export interface DepthMeasurementInternal
  extends Omit<DepthMeasurement, 'depthColumn' | 'datum' | 'depthRange'> {
  depthColumn: DepthIndexColumnInternal;
  datum?: DatumInternal;
  depthRange?: DistanceRangeInternal;
}

export interface DepthMeasurementDataInternal
  extends Omit<DepthMeasurementData, 'depthColumn' | 'depthUnit'> {
  depthColumn: DepthIndexColumnInternal;
  depthUnit: Distance;
}

export interface DepthMeasurementWithData
  extends Omit<DepthMeasurementInternal, 'columns'>,
    Omit<DepthMeasurementDataInternal, 'columns'> {
  columns: DepthMeasurementDataColumnInternal[];
  errors?: DataError[];
}

export interface DistanceRangeInternal extends Omit<DistanceRange, 'unit'> {
  unit: Distance;
}

export interface DepthIndexColumnInternal {
  externalId: string;
  unit: Distance;
  type: DepthIndexTypeEnum;
}

export interface DepthMeasurementDataColumnInternal
  extends DepthMeasurementDataColumn {
  description?: string;
  measurementTypeParent?: MeasurementTypeParent;
  isAngle: boolean;
}

export enum MeasurementTypeParent {
  GEOMECHANNICS = 'Geomechanics',
  PPFG = 'PPFG',
  FIT = 'FIT',
  LOT = 'LOT',
}

export type MeasurementCurveConfig = Record<
  MeasurementTypeParent,
  Record<string, Partial<PlotData>>
>;

export interface MeasurementCurveData extends Partial<PlotData> {
  id: string;
  columnExternalId: string;
  curveName: string;
  measurementTypeParent: MeasurementTypeParent;
}

export interface MeasurementCurveFormatterData<T> {
  data: T;
  column: DepthMeasurementDataColumnInternal;
  curveData: MeasurementCurveData;
}
