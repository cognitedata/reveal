import { minMax } from 'utils/number';

import { getScaleBlocksByCount } from './getScaleBlocksByCount';

export const getNativeScaleBlocks = (
  scaleBlocksOriginal: number[],
  y: number[]
) => {
  const nticks = scaleBlocksOriginal.length;

  const [min, max] = minMax(y);

  const scaleBlocksNative = getScaleBlocksByCount({
    min,
    max,
    nticks,
    roundTo: 1,
    padMin: true,
    padMax: true,
    normalize: true,
  });

  return scaleBlocksNative;
};
