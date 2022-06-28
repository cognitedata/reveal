import compact from 'lodash/compact';
import map from 'lodash/map';
import { colorize } from 'utils/colorize';

import { Npt } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';

import { PREDEFINED_NPT_COLORS } from '../constants';
import { NptInternal } from '../types';

import { normalizeNpt } from './normalizeNpt';

export const normalizeAllNpt = (
  rawNpt: Npt[],
  userPreferredUnit: UserPreferredUnit
): NptInternal[] => {
  const nptCodes = compact(map(rawNpt, 'nptCode'));
  const nptCodeColorMap = colorize(nptCodes, PREDEFINED_NPT_COLORS);

  return rawNpt.map((npt) =>
    normalizeNpt(npt, userPreferredUnit, nptCodeColorMap)
  );
};
