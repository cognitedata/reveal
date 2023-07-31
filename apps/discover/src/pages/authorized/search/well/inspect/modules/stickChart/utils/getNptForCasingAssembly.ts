import { filterNptByMD } from 'domain/wells/npt/internal/selectors/filterNptByMD';
import { filterNptByTVD } from 'domain/wells/npt/internal/selectors/filterNptByTVD';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';

import { DepthMeasurementUnit } from 'constants/units';

import { CasingAssemblyView } from '../types';

export const getNptForCasingAssembly = (
  events: NptInternalWithTvd[],
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
    return filterNptByMD(events, {
      min: measuredDepthTop.value,
      max: measuredDepthBase.value,
    });
  }

  return filterNptByTVD(events, {
    min: trueVerticalDepthTop?.value,
    max: trueVerticalDepthBase?.value,
  });
};
