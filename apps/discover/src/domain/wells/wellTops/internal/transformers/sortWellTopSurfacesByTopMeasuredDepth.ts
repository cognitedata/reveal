import { WellTopSurface } from '@cognite/sdk-wells';

type WellTopSurfaceType = Pick<WellTopSurface, 'top'>;

export const sortWellTopSurfacesByTopMeasuredDepth = <
  T extends WellTopSurfaceType
>(
  wellTopSurfaces: T[]
): T[] => {
  return wellTopSurfaces.sort(
    (wellTopSurface1, wellTopSurface2) =>
      wellTopSurface1.top.measuredDepth - wellTopSurface2.top.measuredDepth
  );
};
