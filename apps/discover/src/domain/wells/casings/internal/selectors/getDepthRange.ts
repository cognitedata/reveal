import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';

import compact from 'lodash/compact';
import { minMax } from 'utils/number';

import { CasingAssemblyInternal } from '../types';

export const getDepthRange = (
  casings: CasingAssemblyInternal[],
  nptEvents: NptInternal[],
  ndsEvents: NdsInternal[]
) => {
  const casingsMin = Math.min(
    ...casings.map(({ measuredDepthTop }) => measuredDepthTop.value)
  );
  const casingsMax = Math.max(
    ...casings.map(({ measuredDepthBase }) => measuredDepthBase.value)
  );

  const [nptMin, nptMax] = minMax(
    compact(nptEvents.map(({ measuredDepth }) => measuredDepth?.value))
  );

  const ndsMin = Math.min(
    ...compact(ndsEvents.map(({ holeStart }) => holeStart?.value))
  );
  const ndsMax = Math.max(
    ...compact(ndsEvents.map(({ holeEnd }) => holeEnd?.value))
  );

  return [
    Math.min(casingsMin, nptMin, ndsMin),
    Math.max(casingsMax, nptMax, ndsMax),
  ];
};
