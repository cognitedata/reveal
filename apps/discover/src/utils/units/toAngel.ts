import { Angle } from 'convert-units';

import { AngleUnitEnum } from '@cognite/sdk-wells-v3';

const ANGEL_UNIT_MAP: Record<AngleUnitEnum, Angle> = {
  degree: 'deg',
  radian: 'rad',
};

export const toAngel = (unit: AngleUnitEnum): Angle => {
  return ANGEL_UNIT_MAP[unit];
};
