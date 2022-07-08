import { useDepthMeasurementsForWellLogs } from 'domain/wells/measurements/internal/hooks/useDepthMeasurementsForWellLogs';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellboresKeyed } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboresKeyed';

import { useMemo } from 'react';

import { adaptToWellLogView } from '../utils/adaptToWellLogView';

export const useWellLogsData = () => {
  const wellbores = useWellInspectSelectedWellboresKeyed();
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const { data, isLoading } = useDepthMeasurementsForWellLogs({
    wellboreIds,
  });

  const adaptedData = useMemo(() => {
    return data.map((depthMeasurement) => {
      const { wellboreMatchingId } = depthMeasurement;
      const wellbore = wellbores[wellboreMatchingId];

      return adaptToWellLogView(depthMeasurement, wellbore);
    });
  }, [data]);

  return {
    data: adaptedData,
    isLoading,
  };
};
