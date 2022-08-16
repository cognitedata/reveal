import { NdsInternal } from 'domain/wells/nds/internal/types';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { WellTopSurfaceInternal } from 'domain/wells/wellTops/internal/types';

import compact from 'lodash/compact';
import isEmpty from 'lodash/isEmpty';
import { minMax } from 'utils/number';

import { CasingAssemblyInternal } from '../types';

export const getDepthRange = (
  casingAssemblies: CasingAssemblyInternal[],
  nptEvents: NptInternal[],
  ndsEvents: NdsInternal[],
  tops?: WellTopSurfaceInternal[]
) => {
  const measuredDepthTopValues = casingAssemblies.map(
    ({ measuredDepthTop }) => measuredDepthTop.value
  );
  const measuredDepthBaseValues = casingAssemblies.map(
    ({ measuredDepthBase }) => measuredDepthBase.value
  );
  const nptMeasuredDepthValues = compact(
    nptEvents.map(({ measuredDepth }) => measuredDepth?.value)
  );
  const ndsHoleStartValues = compact(
    ndsEvents.map(({ holeStart }) => holeStart?.value)
  );
  const ndsHoleEndValues = compact(
    ndsEvents.map(({ holeEnd }) => holeEnd?.value)
  );

  const topsTopMeasuredDepths = (tops || []).map(
    (top) => top.top.measuredDepth
  );
  const topsBaseMeasuredDepths = compact(
    (tops || []).map((top) => top.base?.measuredDepth)
  );

  const casingsMin = getMinOrDefaultValue(measuredDepthTopValues);
  const casingsMax = getMaxOrDefaultValue(measuredDepthBaseValues);

  const [nptMin, nptMax] = getMinMaxOrDefaultValue(nptMeasuredDepthValues);

  const ndsMin = getMinOrDefaultValue(ndsHoleStartValues);
  const ndsMax = getMaxOrDefaultValue(ndsHoleEndValues);

  const topsMin = getMinOrDefaultValue(topsBaseMeasuredDepths);
  const topsMax = getMaxOrDefaultValue(topsTopMeasuredDepths);

  return [
    Math.min(casingsMin, nptMin, ndsMin, topsMin),
    Math.max(casingsMax, nptMax, ndsMax, topsMax),
  ];
};

const getMinOrDefaultValue = (values: number[]) => {
  if (isEmpty(values)) {
    return 0;
  }
  return Math.min(...values);
};

const getMaxOrDefaultValue = (values: number[]) => {
  if (isEmpty(values)) {
    return 0;
  }
  return Math.max(...values);
};

const getMinMaxOrDefaultValue = (values: number[]) => {
  if (isEmpty(values)) {
    return [0, 0];
  }
  return minMax(values);
};
