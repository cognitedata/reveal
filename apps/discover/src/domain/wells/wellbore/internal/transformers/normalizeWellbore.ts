import { ColorMap } from 'utils/colorize';

import { Well, Wellbore } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { DEFAULT_WELLBORE_COLOR } from '../../constants';
import { getWellboreTitle } from '../selectors/getWellboreTitle';
import { WellboreInternal } from '../types';

import { normalizeDatum } from './normalizeDatum';

export const normalizeWellbore = (
  rawWell: Well,
  rawWellbore: Wellbore,
  userPreferredUnit: UserPreferredUnit,
  wellboresColorMap: ColorMap = {}
): WellboreInternal => {
  const { matchingId: wellMatchingId, name: wellName } = rawWell;
  const { matchingId, name, datum } = rawWellbore;

  return {
    ...rawWellbore,
    id: matchingId,
    wellMatchingId,
    wellId: wellMatchingId,
    wellName,
    title: getWellboreTitle(rawWellbore),
    datum: datum && normalizeDatum(datum, userPreferredUnit),
    color: wellboresColorMap[name] || DEFAULT_WELLBORE_COLOR,
  };
};
