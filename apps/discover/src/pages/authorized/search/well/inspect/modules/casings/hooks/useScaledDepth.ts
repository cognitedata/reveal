import { useCallback, useMemo } from 'react';

import { SCALE_BLOCK_HEIGHT } from '../../common/Events/constants';
import { getScale } from '../utils/scale';

export const useScaledDepth = (scaleBlocks: number[]) => {
  const scale = useMemo(() => getScale(scaleBlocks), [scaleBlocks]);

  return useCallback(
    (value: number) => scale(value) * SCALE_BLOCK_HEIGHT,
    [scale]
  );
};
