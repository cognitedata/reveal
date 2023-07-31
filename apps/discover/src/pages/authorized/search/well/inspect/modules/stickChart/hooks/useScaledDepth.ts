import { useCallback, useMemo } from 'react';

import { SCALE_BLOCK_HEIGHT } from '../../common/Events/constants';
import { getScalerFunction } from '../utils/scale/getScalerFunction';

export const useScaledDepth = (scaleBlocks: number[]) => {
  const scale = useMemo(() => getScalerFunction(scaleBlocks), [scaleBlocks]);

  return useCallback(
    (value: number) => scale(value) * SCALE_BLOCK_HEIGHT,
    [scale]
  );
};
