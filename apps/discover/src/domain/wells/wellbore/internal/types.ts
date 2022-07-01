import { DoglegSeverityInternal } from 'domain/wells/trajectory/internal/types';

import { Distance } from 'convert-units';

import { Wellbore as WellboreV2 } from '@cognite/sdk-wells-v2';
import { Datum, Wellbore as WellboreV3 } from '@cognite/sdk-wells-v3';

export interface Wellbore
  extends Omit<WellboreV2, 'id' | 'wellId' | 'sourceWellbores'>,
    Partial<Omit<WellboreV3, 'name' | 'matchingId'>> {
  id: string;
  wellName?: string;
  matchingId: string;
  wellId?: string;
  sourceWellbores: {
    id: string;
    externalId: string;
    source: string;
  }[];
  parentExternalId?: string;
  description?: string;
  maxMeasuredDepth?: number;
  maxTrueVerticalDepth?: number;
  maxDoglegSeverity?: DoglegSeverityInternal;
}

export interface DatumInternal extends Omit<Datum, 'unit'> {
  unit: Distance;
}
