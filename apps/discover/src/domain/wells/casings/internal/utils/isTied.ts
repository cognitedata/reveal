import { CasingAssemblyInternal } from '../types';

type CasingAssemblyType = Pick<
  CasingAssemblyInternal,
  'measuredDepthTop' | 'measuredDepthBase'
>;

export const isTied = <T extends CasingAssemblyType>(
  casingAssemblies: T[],
  index: number
) => {
  const currentCasing = casingAssemblies[index];

  // If the schema has only one casing or,
  // Last casing.
  if (index === casingAssemblies.length - 1) {
    return false;
  }

  const nextCasing = casingAssemblies[index + 1];

  return (
    currentCasing.measuredDepthTop.value > nextCasing.measuredDepthTop.value &&
    currentCasing.measuredDepthBase.value >= nextCasing.measuredDepthBase.value
  );
};
