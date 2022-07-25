import { CasingAssemblyView } from '../types';

export const getDepthValuesMap = (casingAssemblies: CasingAssemblyView[]) => {
  return casingAssemblies.reduce(
    (depthValuesMap, { measuredDepthBase, trueVerticalDepthBase }) => {
      return {
        ...depthValuesMap,
        [measuredDepthBase.value]: trueVerticalDepthBase?.value,
      };
    },
    {} as Record<number, number | undefined>
  );
};
