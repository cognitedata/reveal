import { Distance } from 'convert-units';

import { DistanceUnitEnum } from '@cognite/sdk-wells-v3';

const DISTANCE_UNIT_MAP: Record<DistanceUnitEnum, Distance> = {
  meter: 'm',
  foot: 'ft',
  inch: 'in',
  yard: 'm',
};

export const toDistance = (unit: DistanceUnitEnum): Distance => {
  return DISTANCE_UNIT_MAP[unit];
};
