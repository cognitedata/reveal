import { NdsInternal } from '../types';

export const filterNdsByMeasuredDepth = (
  nds: NdsInternal[],
  minDepth: number,
  maxDepth: number
) =>
  (nds || []).filter(
    ({ holeTop }) =>
      holeTop && holeTop.value >= minDepth && holeTop.value <= maxDepth
  );
