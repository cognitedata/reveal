import { useTrajectoriesWithData } from 'domain/wells/trajectory/internal/hooks/useTrajectoriesWithData';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellboresKeyed } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboresKeyed';

import { useMemo } from 'react';

import { adaptToTrajectoryView } from '../utils/adaptToTrajectoryView';

export const useTrajectoryData = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellbores = useWellInspectSelectedWellboresKeyed();

  const { data, isLoading } = useTrajectoriesWithData({ wellboreIds });

  const adaptedData = useMemo(
    () =>
      data.map((trajectory) => {
        const { wellboreMatchingId } = trajectory;
        const wellbore = wellbores[wellboreMatchingId];

        return adaptToTrajectoryView(trajectory, wellbore);
      }),
    [data]
  );

  return {
    data: adaptedData,
    isLoading,
  };
};
