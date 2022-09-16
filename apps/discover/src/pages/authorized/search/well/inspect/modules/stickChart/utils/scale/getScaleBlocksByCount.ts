import times from 'lodash/times';
import { roundToNextNumber } from 'utils/number/roundToNextNumber';

import { EMPTY_ARRAY } from 'constants/empty';

/**
 * @maxDepth Maximum depth.
 * @blocksCount The number of blocks to be included in the scale.
 *
 * This function returns the scale blocks by
 * evenly spreading the max depth to the number of required blocks count.
 */
export const getScaleBlocksByCount = (
  maxDepth: number,
  blocksCount: number,
  minDepth = 0,
  roundTo = 100
) => {
  /**
   * If scaleHeight or maxDepth value is 0,
   * no point of calculating scale blocks.
   * Hence, return an empty array.
   */
  if (!maxDepth) {
    return EMPTY_ARRAY;
  }

  const roundedMin = roundToNextNumber(minDepth, roundTo);
  const roundedMax = roundToNextNumber(maxDepth, roundTo);

  /**
   * If the blocks count is less than or equal to 2,
   * No point of calculating the scale blocks.
   * Just return the min and max values of the scale.
   */
  if (blocksCount <= 2) {
    return [roundedMin, roundedMax];
  }

  const blocksCountWithoutBounds = blocksCount - 2; // Reduce 2 for scale min and max depths.

  const interval = Math.round((maxDepth - minDepth) / blocksCountWithoutBounds);

  const roundedInterval = roundToNextNumber(interval, roundTo);

  return [
    roundedMin, // Scale min depth
    ...times(blocksCountWithoutBounds).map(
      (blockIndex) => roundedMin + roundedInterval * (blockIndex + 1)
    ),
    roundedMin + roundedInterval * (blocksCountWithoutBounds + 1), // Scale max depth
  ];
};
