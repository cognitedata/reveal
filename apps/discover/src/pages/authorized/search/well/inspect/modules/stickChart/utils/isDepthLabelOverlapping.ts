import { CasingAssemblyView } from '../types';
import { DEPTH_SCALE_LABEL_HEIGHT } from '../WellboreStickChart/constants';

export const isDepthLabelOverlapping = (
  casingAssemblies: CasingAssemblyView[],
  currentIndex: number,
  depthScaler: (depth: number) => number
) => {
  const currentCasingAssembly = casingAssemblies[currentIndex];
  const nextCasingAssembly = casingAssemblies[currentIndex + 1];

  if (!nextCasingAssembly) {
    return false;
  }

  const depthDifference = Math.abs(
    currentCasingAssembly.measuredDepthBase.value -
      nextCasingAssembly.measuredDepthBase.value
  );

  const scaledDepthDifference = depthScaler(depthDifference);

  return scaledDepthDifference < DEPTH_SCALE_LABEL_HEIGHT;
};
