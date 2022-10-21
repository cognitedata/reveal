import { WellboreRigNamesMap } from '../types';

type RigOperationType = {
  wellboreMatchingId: string;
  rigName: string;
};

export const adaptToWellboreRigNamesMap = <T extends RigOperationType>(
  rigOperations: T[]
): WellboreRigNamesMap => {
  return rigOperations.reduce(
    (wellboreRigNameMap, { wellboreMatchingId, rigName }) => {
      const currentRigNames = wellboreRigNameMap[wellboreMatchingId] || [];

      return {
        ...wellboreRigNameMap,
        [wellboreMatchingId]: [...currentRigNames, rigName],
      };
    },
    {} as WellboreRigNamesMap
  );
};
