import compact from 'lodash/compact';
import map from 'lodash/map';
import { colorize } from 'utils/colorize';

import { Nds } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { NdsInternal } from '../types';

import { normalizeNds } from './normalizeNds';

export const normalizeAllNds = (
  rawNds: Nds[],
  userPreferredUnit: UserPreferredUnit
): NdsInternal[] => {
  const ndsCodes = compact(map(rawNds, 'riskType'));
  const nptCodeColorMap = colorize(ndsCodes);

  return rawNds.map((nds) =>
    normalizeNds(nds, userPreferredUnit, nptCodeColorMap)
  );
};
