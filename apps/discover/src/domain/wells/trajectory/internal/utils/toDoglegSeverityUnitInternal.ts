import { toAngel } from 'utils/units/toAngel';
import { toDistance } from 'utils/units/toDistance';

import { DoglegSeverityUnit } from '@cognite/sdk-wells';

import { DoglegSeverityUnitInternal } from '../types';

export const toDoglegSeverityUnitInternal = (
  unit: DoglegSeverityUnit
): DoglegSeverityUnitInternal => {
  const { angleUnit, distanceUnit } = unit;

  return {
    ...unit,
    angleUnit: toAngel(angleUnit),
    distanceUnit: toDistance(distanceUnit),
  };
};
