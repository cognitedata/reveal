import { WellboreRigNamesMap } from '../types';
import { formatRigName } from '../utils/formatRigName';

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
        [wellboreMatchingId]: Array.from(
          new Set([...currentRigNames, formatRigName(rigName)])
        ),
      };
    },
    {} as WellboreRigNamesMap
  );
};
