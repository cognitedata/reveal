import { MaxDepthData } from 'domain/wells/trajectory/internal/types';

import { useMemo } from 'react';

import { EMPTY_ARRAY } from 'constants/empty';

import { getScaleBlocksByCount } from '../utils/scale/getScaleBlocksByCount';
import { getScaleBlocksByHeight } from '../utils/scale/getScaleBlocksByHeight';

export const useScaleBlocks = ({
  maxDepth,
  columnHeight,
}: {
  maxDepth?: Pick<MaxDepthData, 'maxMeasuredDepth' | 'maxTrueVerticalDepth'>;
  columnHeight: number;
}) => {
  const scaleBlocks = useMemo(() => {
    if (!maxDepth) {
      return EMPTY_ARRAY;
    }
    return getScaleBlocksByHeight(maxDepth.maxMeasuredDepth, columnHeight);
  }, [maxDepth?.maxMeasuredDepth, columnHeight]);

  const scaleBlocksTVD = useMemo(() => {
    if (!maxDepth) {
      return EMPTY_ARRAY;
    }
    return getScaleBlocksByCount(
      maxDepth.maxTrueVerticalDepth,
      scaleBlocks.length
    );
  }, [maxDepth?.maxTrueVerticalDepth, scaleBlocks]);

  return { scaleBlocks, scaleBlocksTVD };
};
