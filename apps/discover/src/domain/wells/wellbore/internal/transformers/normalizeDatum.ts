import { convertDistance } from 'utils/units/convertDistance';

import { Datum } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { DatumInternal } from '../types';

export const normalizeDatum = (
  rawDatum: Datum,
  unit: UserPreferredUnit
): DatumInternal => {
  return {
    ...rawDatum,
    ...convertDistance(rawDatum, unit),
  };
};
