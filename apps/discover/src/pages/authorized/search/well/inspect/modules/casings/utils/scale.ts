import { ScaleLinear, scaleLinear } from 'd3-scale';
import head from 'lodash/head';
import last from 'lodash/last';

import {
  SCALE_BLOCK_HEIGHT,
  SCALE_PADDING,
} from '../../common/Events/constants';

export const getScaleBlocks = (scaleHeight: number, maxDepth: number) => {
  const blocksCountWithoutZero = Math.floor(
    (scaleHeight - SCALE_PADDING) / SCALE_BLOCK_HEIGHT
  );
  const blocksCount = blocksCountWithoutZero
    ? /**
       * Reduce 1 for `0` depth.
       * Reduce another zero as the padding at the bottom
       */
      blocksCountWithoutZero - 1 - 1
    : blocksCountWithoutZero;
  const interval = Math.round(maxDepth / blocksCount);
  return [
    0,
    ...[...Array(blocksCount).keys()]
      .map((blockIndex) => Number(((blockIndex + 1) * interval).toFixed(2)))
      .filter((row) => !Number.isNaN(row)),
  ];
};

export const getScale = (
  scaleBlocks: number[]
): ScaleLinear<number, number> => {
  return scaleLinear()
    .domain([head(scaleBlocks) || 0, last(scaleBlocks) || 0])
    .range([0, scaleBlocks.length - 1]);
};
