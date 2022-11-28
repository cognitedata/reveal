import { filterNdsByMD } from 'domain/wells/nds/internal/selectors/filterNdsByMD';
import { filterNdsByTVD } from 'domain/wells/nds/internal/selectors/filterNdsByTVD';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';

import { DepthMeasurementUnit } from 'constants/units';

import { CasingAssemblyView } from '../types';

export const getNdsForCasingAssembly = (
  events: NdsInternalWithTvd[],
  casingAssembly: CasingAssemblyView,
  depthMeasurementType = DepthMeasurementUnit.MD
) => {
  const {
    measuredDepthTop,
    measuredDepthBase,
    trueVerticalDepthTop,
    trueVerticalDepthBase,
  } = casingAssembly;

  if (depthMeasurementType === DepthMeasurementUnit.MD) {
    return filterNdsByMD(events, {
      min: measuredDepthTop.value,
      max: measuredDepthBase.value,
    });
  }

  return filterNdsByTVD(events, {
    min: trueVerticalDepthTop?.value,
    max: trueVerticalDepthBase?.value,
  });
};
