import { ColorMap } from 'utils/colorize';
import { convertDistance } from 'utils/units/convertDistance';

import { Distance, Wellbore } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { DEFAULT_WELLBORE_COLOR } from '../../constants';
import { getWellboreTitle } from '../selectors/getWellboreTitle';
import { WellboreInternal } from '../types';

import { normalizeDatum } from './normalizeDatum';

export const normalizeWellboreByWell = (
  // rawWell: Well,
  wellMatchingId: string,
  wellName: string,
  rawWellbore: Wellbore,
  userPreferredUnit: UserPreferredUnit,
  wellboresColorMap: ColorMap = {},
  waterDepth?: Distance
): WellboreInternal => {
  // const { matchingId: wellMatchingId, name: wellName, waterDepth } = rawWell;

  // const { matchingId: wellMatchingId, name: wellName } = rawWell;
  const { matchingId, name, datum } = rawWellbore;

  return {
    ...rawWellbore,
    id: matchingId,
    wellMatchingId,
    wellId: wellMatchingId,
    wellName,
    wellWaterDepth:
      waterDepth && convertDistance(waterDepth, userPreferredUnit),
    title: getWellboreTitle(rawWellbore),
    datum: datum && normalizeDatum(datum, userPreferredUnit),
    color: wellboresColorMap[name] || DEFAULT_WELLBORE_COLOR,
  };
};
