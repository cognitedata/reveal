import { colorize } from 'utils/colorize/colorize';

import { Well } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WELLBORE_COLORS } from '../../constants';
import { WellboreInternal } from '../types';

import { normalizeWellbore } from './normalizeWellbore';

export const normalizeWellbores = (
  rawWell: Well,
  userPreferredUnit: UserPreferredUnit
): WellboreInternal[] => {
  const { wellbores = [] } = rawWell;

  const wellboreNames = wellbores.map(({ name }) => name);
  const wellboreColorMap = colorize(wellboreNames, undefined, WELLBORE_COLORS);

  return wellbores.map((rawWellbore) =>
    normalizeWellbore(rawWell, rawWellbore, userPreferredUnit, wellboreColorMap)
  );
};
