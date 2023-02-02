import { DoglegSeverityInternal } from 'domain/wells/trajectory/internal/types';

import { Distance } from 'convert-units';
import { ConvertedDistance } from 'utils/units/constants';

import { Datum, Wellbore } from '@cognite/sdk-wells';

export interface WellboreInternal
  extends Omit<Wellbore, 'datum' | 'kickoffMeasuredDepth'> {
  id: string;
  wellMatchingId: string;
  wellId: string;
  wellName: string;
  title: string;
  datum?: DatumInternal;
  maxMeasuredDepth?: number;
  maxTrueVerticalDepth?: number;
  maxDoglegSeverity?: DoglegSeverityInternal;
  color: string;
  wellWaterDepth?: ConvertedDistance;
  kickoffMeasuredDepth?: ConvertedDistance;
}

export interface DatumInternal extends Omit<Datum, 'unit'> {
  unit: Distance;
}

export interface KickoffDepth {
  wellboreMatchingId: string;
  measuredDepth: number;
  trueVerticalDepth: number;
  unit: Distance;
}

export interface KickoffPoint extends KickoffDepth {
  equivalentDepartureMD: number;
  equivalentDepartureTVD: number;
}
export interface DrillingDays {
  wellboreMatchingId: string;
  wellbore: number;
  total: number;
}
