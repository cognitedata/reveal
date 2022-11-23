import { filterMeasurementsInDepthRange } from 'domain/wells/measurements/internal/selectors/filterMeasurementsInDepthRange';
import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import { CasingAssemblyView } from '../types';

export const getMeasurementsDataForCasingAssembly = (
  measurementsData: DepthMeasurementWithData[],
  casingAssembly: CasingAssemblyView
) => {
  const {
    measuredDepthTop,
    measuredDepthBase,
    trueVerticalDepthTop,
    trueVerticalDepthBase,
  } = casingAssembly;

  return filterMeasurementsInDepthRange(measurementsData, {
    measuredDepth: {
      min: measuredDepthTop.value,
      max: measuredDepthBase.value,
    },
    trueVerticalDepth: {
      min: trueVerticalDepthTop?.value,
      max: trueVerticalDepthBase?.value,
    },
  });
};
