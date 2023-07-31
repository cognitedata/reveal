import { ColorMap } from 'utils/colorize';
import { convertDistance } from 'utils/units/convertDistance';

import { Nds } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { DEFAULT_NDS_COLOR } from '../constants';
import { NdsInternal } from '../types';

export const normalizeNds = (
  rawNds: Nds,
  userPreferredUnit: UserPreferredUnit,
  ndsCodeColorMap: ColorMap = {}
): NdsInternal => {
  const { holeDiameter, holeTop, holeBase, riskType } = rawNds;

  return {
    ...rawNds,
    holeDiameter:
      holeDiameter && convertDistance(holeDiameter, userPreferredUnit),
    holeTop: holeTop && convertDistance(holeTop, userPreferredUnit),
    holeBase: holeBase && convertDistance(holeBase, userPreferredUnit),
    ndsCodeColor: riskType ? ndsCodeColorMap[riskType] : DEFAULT_NDS_COLOR,
  };
};
