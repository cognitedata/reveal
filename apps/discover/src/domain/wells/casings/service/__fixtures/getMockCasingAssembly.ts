import { CasingAssembly, DistanceUnitEnum } from '@cognite/sdk-wells';

export const getMockCasingAssembly = (
  extras?: Partial<CasingAssembly>
): CasingAssembly => {
  return {
    minInsideDiameter: {
      value: 0.5588,
      unit: DistanceUnitEnum.Meter,
    },
    minOutsideDiameter: {
      value: 0.5588,
      unit: DistanceUnitEnum.Meter,
    },
    maxOutsideDiameter: {
      value: 0.6604,
      unit: DistanceUnitEnum.Meter,
    },
    originalMeasuredDepthTop: {
      value: 1639.827330861063,
      unit: DistanceUnitEnum.Meter,
    },
    originalMeasuredDepthBase: {
      value: 2614.211970861063,
      unit: DistanceUnitEnum.Meter,
    },
    type: 'INTERMEDIATE CASING 1',
    reportDescription: 'INTERMEDIATE CASING 1',
    ...extras,
  };
};
