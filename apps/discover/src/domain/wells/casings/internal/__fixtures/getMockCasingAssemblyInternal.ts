import { CasingAssemblyInternal } from '../types';

export const getMockCasingAssemblyInternal = (
  extras?: Partial<CasingAssemblyInternal>
): CasingAssemblyInternal => {
  return {
    minInsideDiameter: {
      value: 22,
      unit: 'in',
    },
    minOutsideDiameter: {
      value: 22,
      unit: 'in',
    },
    maxOutsideDiameter: {
      value: 26,
      unit: 'in',
    },
    measuredDepthTop: {
      value: 5380.011,
      unit: 'ft',
    },
    measuredDepthBase: {
      value: 8576.811,
      unit: 'ft',
    },
    type: 'INTERMEDIATE CASING 1',
    reportDescription: 'INTERMEDIATE CASING 1',
    ...extras,
  };
};
