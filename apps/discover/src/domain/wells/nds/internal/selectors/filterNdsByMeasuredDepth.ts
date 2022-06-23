import { NdsInternal } from '../types';

export const filterNdsByMeasuredDepth = (
  nds: NdsInternal[],
  minDepth: number,
  maxDepth: number
) =>
  (nds || []).filter(
    ({ holeStart }) =>
      holeStart && holeStart.value >= minDepth && holeStart.value <= maxDepth
  );
