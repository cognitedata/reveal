import map from 'lodash/map';
import { colorize } from 'utils/colorize/colorize';

import { WellTops } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WellTopsInternal } from '../types';

import { normalizeWellTopSurfaces } from './normalizeWellTopSurfaces';

export const normalizeWellTops = (
  wellTops: WellTops[],
  userPreferredUnit: UserPreferredUnit
): WellTopsInternal[] => {
  const wellTopSurfaceNames = wellTops.flatMap(({ tops }) => map(tops, 'name'));
  const wellTopSurfaceNameColorMap = colorize(wellTopSurfaceNames);

  return wellTops.map((wellTop) => {
    const { tops, measuredDepthUnit, trueVerticalDepthUnit } = wellTop;

    return {
      ...wellTop,
      measuredDepthUnit: userPreferredUnit,
      trueVerticalDepthUnit: userPreferredUnit,
      tops: normalizeWellTopSurfaces(
        tops,
        measuredDepthUnit,
        trueVerticalDepthUnit,
        userPreferredUnit,
        wellTopSurfaceNameColorMap
      ),
    };
  });
};
