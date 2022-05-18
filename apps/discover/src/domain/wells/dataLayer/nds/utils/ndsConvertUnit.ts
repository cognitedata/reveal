import { UnitConverterItem } from 'utils/units';
import { getUnitConverterItemForDistance } from 'utils/units/getUnitConverterItemForDistance';

import { Nds } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

export const getNdsUnitChangeAccessors = (
  toUnit: UserPreferredUnit
): UnitConverterItem[] => [
  getUnitConverterItemForDistance<Nds>('holeDiameter', toUnit),
  getUnitConverterItemForDistance<Nds>('holeStart', toUnit),
  getUnitConverterItemForDistance<Nds>('holeEnd', toUnit),
];

export const getNdsAccessorsToFixedDecimal = () => [
  'holeDiameter.value',
  'holeStart.value',
  'holeEnd.value',
];
