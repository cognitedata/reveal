import { filterMeasurementsByDepth } from 'domain/wells/measurements/internal/selectors/filterMeasurementsByDepth';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import { DepthMeasurementUnit } from 'constants/units';

import { CasingAssemblyView } from '../types';

export const getMeasurementsDataForCasingAssembly = (
  depthMeasurements: DepthMeasurementWithData[],
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
    return filterMeasurementsByDepth(depthMeasurements, {
      min: measuredDepthTop.value,
      max: measuredDepthBase.value,
    });
  }

  return filterMeasurementsByDepth(depthMeasurements, {
    min: trueVerticalDepthTop?.value,
    max: trueVerticalDepthBase?.value,
  });
};
