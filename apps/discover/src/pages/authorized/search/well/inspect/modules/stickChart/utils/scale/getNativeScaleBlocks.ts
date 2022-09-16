import { minMax } from 'utils/number';

import { getScaleBlocksByCount } from './getScaleBlocksByCount';

const MAX_SCALE_INTERVAL = 10;

export const getNativeScaleBlocks = (
  scaleBlocksOriginal: number[],
  y: number[]
) => {
  const blocksCount = scaleBlocksOriginal.length;

  const [min, max] = minMax(y);

  const interval = Math.ceil((max - min) / blocksCount);

  const scaleBlocksNative = getScaleBlocksByCount(
    max,
    blocksCount,
    min,
    Math.min(interval, MAX_SCALE_INTERVAL)
  );

  return scaleBlocksNative;
};
