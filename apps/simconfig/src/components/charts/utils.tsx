import { curveLinear, curveMonotoneX, curveStepAfter } from 'd3';

import type { AggregateType } from '@cognite/simconfig-api-sdk/rtk';

import type { ChartGeometry } from './BaseChart/types';
import type { DatumType, OrdinalDatum, TemporalDatum } from './types';

import type { CurveFactory } from 'd3';

export function getExtents({ width, height, margin }: ChartGeometry) {
  return {
    xMax: width - margin.left - margin.right,
    yMax: height - margin.top - margin.bottom,
  };
}

// TODO(SIM-000): refactor/merge functions below as generic implementations

export function getTemporalX<D extends Partial<TemporalDatum>, T = undefined>(
  datum: D,
  defaultValue?: T
): D['timestamp'] extends undefined ? T : D['timestamp'];
export function getTemporalX<
  D extends Partial<TemporalDatum>,
  T extends Date | undefined = undefined
>(datum: D, defaultValue?: T) {
  return datum.timestamp !== undefined
    ? new Date(datum.timestamp)
    : defaultValue;
}

export function getTemporalY<D extends Partial<TemporalDatum>, T = undefined>(
  datum: D,
  defaultValue?: T
): D['value'] extends undefined ? T : D['value'];
export function getTemporalY<
  D extends Partial<TemporalDatum>,
  T extends number | undefined = undefined
>(datum: D, defaultValue?: T) {
  return datum.value ?? defaultValue;
}

export function getOrdinalX<D extends Partial<OrdinalDatum>, T = undefined>(
  datum: D,
  defaultValue?: T
): D['x'] extends undefined ? T : D['x'];
export function getOrdinalX<
  D extends Partial<OrdinalDatum>,
  T extends number | undefined = undefined
>(datum: D, defaultValue?: T) {
  return datum.x ?? defaultValue;
}

export function getOrdinalY<D extends Partial<OrdinalDatum>, T = undefined>(
  datum: D,
  defaultValue?: T
): D['y'] extends undefined ? T : D['y'];
export function getOrdinalY<
  D extends Partial<OrdinalDatum>,
  T extends number | undefined = undefined
>(datum: D, defaultValue?: T) {
  return datum.y ?? defaultValue;
}

type DatumReturnType<
  DatumType,
  Datum,
  DatumKey extends keyof DatumType,
  FallbackType = never
> = Datum extends DatumType
  ? Datum[DatumKey] extends undefined
    ? FallbackType | undefined
    : Datum[DatumKey]
  : FallbackType;

export function getX<
  Datum extends DatumType | Partial<DatumType>,
  DefaultType extends Date | number | undefined
>(
  datum: Datum,
  defaultValue?: DefaultType
): Datum extends OrdinalDatum
  ? DatumReturnType<OrdinalDatum, Datum, 'x', DefaultType>
  : DatumReturnType<TemporalDatum, Datum, 'timestamp', DefaultType>;
export function getX<
  Datum extends DatumType | Partial<DatumType>,
  DefaultValueType = undefined
>(datum: Datum, defaultValue?: DefaultValueType) {
  if (typeof datum !== 'object') {
    return undefined;
  }
  if ('x' in datum) {
    return getOrdinalX(datum, defaultValue);
  }
  if ('timestamp' in datum) {
    return getTemporalX(datum, defaultValue);
  }
  return undefined;
}

export function getY<
  Datum extends DatumType | Partial<DatumType>,
  DefaultValueType extends number | undefined
>(
  datum: Datum,
  defaultValue?: DefaultValueType
): Datum extends OrdinalDatum
  ? DatumReturnType<OrdinalDatum, Datum, 'y', DefaultValueType>
  : DatumReturnType<TemporalDatum, Datum, 'value', DefaultValueType>;
export function getY<
  Datum extends DatumType | Partial<DatumType>,
  DefaultValueType = undefined
>(datum: Datum, defaultValue?: DefaultValueType) {
  if (typeof datum !== 'object') {
    return undefined;
  }
  if ('x' in datum) {
    return getOrdinalY(datum, defaultValue);
  }
  if ('value' in datum) {
    return getTemporalY(datum, defaultValue);
  }
  return undefined;
}

export const getCurve = (aggregateType: AggregateType): CurveFactory =>
  ({
    average: curveMonotoneX,
    stepInterpolation: curveStepAfter,
    interpolation: curveLinear,
  }[aggregateType]);
