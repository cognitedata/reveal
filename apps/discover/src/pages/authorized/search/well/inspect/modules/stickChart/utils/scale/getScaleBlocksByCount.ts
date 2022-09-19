import last from 'lodash/last';
import times from 'lodash/times';
import { roundToNextNumber } from 'utils/number/roundToNextNumber';

import { EMPTY_ARRAY } from 'constants/empty';

type ScaleConfig = {
  min?: number;
  max: number;
  /**
   * Number of ticks to be included in the scale.
   */
  nticks: number;
  /**
   * Round the scale block values. The value is going to the ceiling value.
   * @example
   * If round to 10, the value of 8 becomes 10.
   */
  roundTo?: number;
  /**
   * Include extra scale block as padding for min bound.
   */
  padMin?: boolean;
  /**
   * Include extra scale block as padding for max bound.
   */
  padMax?: boolean;
  /**
   * Adjust the scale to align the curve to the middle of the scale.
   */
  normalize?: boolean;
};

/**
 * This function returns the scale blocks by
 * evenly spreading the max depth to the number of required blocks count.
 */
export const getScaleBlocksByCount = ({
  min = 0,
  max,
  nticks,
  roundTo = 100,
  padMin = false,
  padMax = true,
  normalize = false,
}: ScaleConfig) => {
  /**
   * If max value is 0,
   * no point of calculating scale blocks.
   * Hence, return an empty array.
   */
  if (!max) {
    return EMPTY_ARRAY;
  }

  const blocksCount = nticks - 1;

  const padding = roundToNextNumber(
    Math.round((max - min) / blocksCount),
    roundTo
  );

  const scaleMin = padMin ? min - padding : min;
  const scaleMax = padMax ? max + padding : max;

  const roundedScaleMin = roundToNextNumber(scaleMin, roundTo);
  const roundedScaleMax = roundToNextNumber(scaleMax, roundTo);

  /**
   * If the ticks count is less than or equal to 2,
   * No point of calculating the scale blocks.
   * Just return the min and max values of the scale.
   */
  if (nticks <= 2) {
    return [roundedScaleMin, roundedScaleMax];
  }

  const interval = roundToNextNumber(
    Math.ceil((roundedScaleMax - roundedScaleMin) / blocksCount),
    roundTo
  );

  const scaleBlocksOriginal = times(nticks).map(
    (blockIndex) => roundedScaleMin + interval * blockIndex
  );

  if (!normalize) {
    return scaleBlocksOriginal;
  }

  const scaleMaxDeviation = last(scaleBlocksOriginal)! - roundedScaleMax;
  const scaleValueAdjustment = Math.round(scaleMaxDeviation / 2);

  const scaleBlocksNormalized = scaleBlocksOriginal.map(
    (value) => value - scaleValueAdjustment
  );

  return scaleBlocksNormalized;
};
