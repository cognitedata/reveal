import { useDepthMeasurementsForMeasurementTypes } from 'domain/wells/measurements/internal/hooks/useDepthMeasurementsForMeasurementTypes';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useDeepMemo } from 'hooks/useDeep';

export const useMeasurementsData = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data, isLoading } = useDepthMeasurementsForMeasurementTypes({
    wellboreIds,
  });

  const groupedData = useDeepMemo(() => groupByWellbore(data), [data]);

  return {
    isLoading,
    data,
    groupedData,
  };
};
