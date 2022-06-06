import { Nds } from '@cognite/sdk-wells-v3';

import { UserPreferredUnit } from 'constants/units';
import { convertObject } from 'modules/wellSearch/utils';

import { NdsInternal } from '../types';
import {
  getNdsAccessorsToFixedDecimal,
  getNdsUnitChangeAccessors,
} from '../utils/ndsConvertUnit';

export const normalizeNds = (
  rawNds: Nds,
  userPreferredUnit: UserPreferredUnit
): NdsInternal => {
  return {
    ...convertObject(rawNds)
      .changeUnits(getNdsUnitChangeAccessors(userPreferredUnit))
      .toClosestInteger(getNdsAccessorsToFixedDecimal())
      .get(),
    original: rawNds,
  };
};
