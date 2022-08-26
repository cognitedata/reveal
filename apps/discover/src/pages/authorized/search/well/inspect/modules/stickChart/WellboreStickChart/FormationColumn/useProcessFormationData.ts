import { WellTopSurfaceInternal } from 'domain/wells/wellTops/internal/types';

import isUndefined from 'lodash/isUndefined';

import { useScaledDepth } from '../../hooks/useScaledDepth';

type ProcessedSurfaceType = {
  surface: WellTopSurfaceInternal;
  startPosition: number;
  wellTopScaledHeight: number;
};

export const useProcessSurfaceData = (
  wellTopsSurface: WellTopSurfaceInternal[],
  scaleBlocks: number[]
) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  let totalHeight = 0;

  return wellTopsSurface.reduce((list, surface, index) => {
    const baseMeasuredDepth = surface.base?.measuredDepth;

    if (surface.heightDifference <= 0 || isUndefined(baseMeasuredDepth)) {
      return list;
    }

    const wellTopScaledStartDepth = getScaledDepth(surface.top.measuredDepth);
    const wellTopScaledHeight = getScaledDepth(
      baseMeasuredDepth - surface.top.measuredDepth
    );

    let startPosition = wellTopScaledStartDepth;
    if (index > 0) {
      startPosition = wellTopScaledStartDepth - totalHeight;
    }
    totalHeight = wellTopScaledStartDepth + wellTopScaledHeight;

    return [...list, { surface, startPosition, wellTopScaledHeight }];
  }, [] as ProcessedSurfaceType[]);
};
