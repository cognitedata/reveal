import { colorize } from 'utils/colorize/colorize';

import { Well, Wellbore } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WELLBORE_COLORS } from '../../constants';
import { WellboreInternal } from '../types';

import { normalizeWellboreByWell } from './normalizeWellbore';

export const normalizeWellboresFromWell = (
  rawWell: Well,
  userPreferredUnit: UserPreferredUnit
): WellboreInternal[] => {
  const { wellbores = [] } = rawWell;

  const wellboreNames = wellbores.map(({ name }) => name);
  const wellboreColorMap = colorize(wellboreNames, undefined, WELLBORE_COLORS);

  return wellbores.map((rawWellbore) => {
    const { matchingId: wellMatchingId, name: wellName, waterDepth } = rawWell;
    return normalizeWellboreByWell(
      wellMatchingId,
      wellName,
      rawWellbore,
      userPreferredUnit,
      wellboreColorMap,
      waterDepth
    );
  });
};

export const normalizeWellbores = (
  wellName: string,
  rowWellBores: Wellbore[],
  userPreferredUnit: UserPreferredUnit
) => {
  const wellboreNames = rowWellBores.map(({ name }) => name);
  const wellboreColorMap = colorize(wellboreNames, undefined, WELLBORE_COLORS);

  return rowWellBores.map((rawWellbore) => {
    const { wellMatchingId } = rawWellbore;
    return normalizeWellboreByWell(
      wellMatchingId,
      wellName,
      rawWellbore,
      userPreferredUnit,
      wellboreColorMap
    );
  });
};
