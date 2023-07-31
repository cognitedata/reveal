import { MaxDepthData } from 'domain/wells/trajectory/internal/types';

import { useMemo } from 'react';

import { EMPTY_ARRAY } from 'constants/empty';
import { DepthMeasurementUnit } from 'constants/units';

import { getScaleBlocksByCount } from '../utils/scale/getScaleBlocksByCount';
import { getScaleBlocksByHeight } from '../utils/scale/getScaleBlocksByHeight';
import { DEFAULT_DEPTH_MEASUREMENT_TYPE } from '../WellboreStickChart/constants';

export const useScaleBlocks = ({
  maxDepth,
  columnHeight,
  depthMeasurementType = DEFAULT_DEPTH_MEASUREMENT_TYPE,
}: {
  maxDepth?: Pick<MaxDepthData, 'maxMeasuredDepth' | 'maxTrueVerticalDepth'>;
  columnHeight: number;
  depthMeasurementType?: DepthMeasurementUnit;
}) => {
  const scaleBlocksMD = useMemo(() => {
    if (!maxDepth) {
      return EMPTY_ARRAY;
    }
    return getScaleBlocksByHeight(maxDepth.maxMeasuredDepth, columnHeight);
  }, [maxDepth?.maxMeasuredDepth, columnHeight]);

  const scaleBlocksTVD = useMemo(() => {
    if (!maxDepth) {
      return EMPTY_ARRAY;
    }
    return getScaleBlocksByCount({
      max: maxDepth.maxTrueVerticalDepth,
      nticks: scaleBlocksMD.length,
    });
  }, [maxDepth?.maxTrueVerticalDepth, scaleBlocksMD]);

  const scaleBlocks = useMemo(() => {
    if (depthMeasurementType === DepthMeasurementUnit.MD) {
      return scaleBlocksMD;
    }
    return scaleBlocksTVD;
  }, [depthMeasurementType, scaleBlocksMD, scaleBlocksTVD]);

  return { scaleBlocksMD, scaleBlocksTVD, scaleBlocks };
};
