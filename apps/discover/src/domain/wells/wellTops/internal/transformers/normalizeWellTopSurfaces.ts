import compact from 'lodash/compact';
import { ColorMap } from 'utils/colorize';

import { DistanceUnitEnum, WellTopSurface } from '@cognite/sdk-wells';

import { UserPreferredUnit } from 'constants/units';

import { WellTopSurfaceInternal } from '../types';
import { convertWellTopSurfaceDepth } from '../utils/convertWellTopSurfaceDepth';

import { sortWellTopSurfacesByTopMeasuredDepth } from './sortWellTopSurfacesByTopMeasuredDepth';

export const normalizeWellTopSurfaces = (
  wellTopSurfaces: WellTopSurface[],
  measuredDepthUnit: DistanceUnitEnum,
  trueVerticalDepthUnit: DistanceUnitEnum,
  userPreferredUnit: UserPreferredUnit,
  wellTopSurfaceNameColorMap: ColorMap
): WellTopSurfaceInternal[] => {
  const sortedWellTopSurfaces =
    sortWellTopSurfacesByTopMeasuredDepth(wellTopSurfaces);

  return compact(
    sortedWellTopSurfaces.map((wellTopSurface) => {
      const { name, top, base } = wellTopSurface;

      const convertedTop = convertWellTopSurfaceDepth(
        top,
        measuredDepthUnit,
        trueVerticalDepthUnit,
        userPreferredUnit
      );

      if (!convertedTop) {
        return null;
      }

      const convertedBase =
        base &&
        convertWellTopSurfaceDepth(
          base,
          measuredDepthUnit,
          trueVerticalDepthUnit,
          userPreferredUnit
        );

      return {
        ...wellTopSurface,
        top: convertedTop,
        base: convertedBase,
        color: wellTopSurfaceNameColorMap[name],
      };
    })
  );
};
