import { NptInternal } from '../types';

export const filterNptByMeasuredDepth = (
  npt: NptInternal[],
  minDepth: number,
  maxDepth: number
) =>
  (npt || []).filter(
    ({ measuredDepth }) =>
      measuredDepth &&
      measuredDepth.value >= minDepth &&
      measuredDepth.value <= maxDepth
  );
