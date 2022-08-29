import times from 'lodash/times';
import { toNextHundred } from 'utils/number/toNextHundred';

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
  blocksCount: number
) => {
  /**
   * If scaleHeight or maxDepth value is 0,
   * no point of calculating scale blocks.
   * Hence, return an empty array.
   */
  if (!maxDepth) {
    return EMPTY_ARRAY;
  }

  /**
   * If the blocks count is less than or equal to 2,
   * No point of calculating the scale blocks.
   * Just return the min and max values of the scale.
   */
  if (blocksCount <= 2) {
    return [0, toNextHundred(maxDepth)];
  }

  const blocksCountWithoutBounds = blocksCount - 2; // Reduce 2 for scale min and max depths.

  const interval = toNextHundred(
    Math.round(maxDepth / blocksCountWithoutBounds)
  );

  return [
    0, // Scale min depth
    ...times(blocksCountWithoutBounds).map(
      (blockIndex) => interval * (blockIndex + 1)
    ),
    interval * (blocksCountWithoutBounds + 1), // Scale max depth
  ];
};
