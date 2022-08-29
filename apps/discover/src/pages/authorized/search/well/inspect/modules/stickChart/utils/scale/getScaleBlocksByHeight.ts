import { EMPTY_ARRAY } from 'constants/empty';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_PADDING,
} from '../../../common/Events/constants';

import { getScaleBlocksByCount } from './getScaleBlocksByCount';

/**
 * @maxDepth Maximum depth.
 * @scaleLength Length available in the UI to display the scale.
 *
 * This function returns the scale blocks by
 * evenly spreading the max depth through the available height.
 */
export const getScaleBlocksByHeight = (
  maxDepth: number,
  scaleLength: number
) => {
  /**
   * If scaleHeight or maxDepth value is 0,
   * no point of calculating scale blocks.
   * Hence, return an empty array.
   */
  if (!maxDepth || !scaleLength) {
    return EMPTY_ARRAY;
  }

  const blocksCount = Math.floor(
    (scaleLength - SCALE_PADDING) / SCALE_BLOCK_HEIGHT
  );

  return getScaleBlocksByCount(maxDepth, blocksCount);
};
