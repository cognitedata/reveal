import { filterHoleSectionsByMD } from 'domain/wells/holeSections/internal/selectors/filterHoleSectionsByMD';
import { filterHoleSectionsByTVD } from 'domain/wells/holeSections/internal/selectors/filterHoleSectionsByTVD';

import { DepthMeasurementUnit } from 'constants/units';

import { CasingAssemblyView, HoleSectionView } from '../types';

export const getHoleSectionsForCasingAssembly = (
  holeSections: HoleSectionView[],
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
    return filterHoleSectionsByMD(holeSections, {
      min: measuredDepthTop.value,
      max: measuredDepthBase.value,
    });
  }

  return filterHoleSectionsByTVD(holeSections, {
    min: trueVerticalDepthTop?.value,
    max: trueVerticalDepthBase?.value,
  });
};
