import { MudWeight } from '../types';

export const isEqualMudWeights = (
  mudWeight1: MudWeight,
  mudWeight2: MudWeight
) => {
  return (
    mudWeight1.type === mudWeight2.type &&
    mudWeight1.value.value === mudWeight2.value.value &&
    mudWeight1.depth.value === mudWeight2.depth.value
  );
};
