import { useDepthMeasurementsForMeasurementTypes } from 'domain/wells/measurements/internal/hooks/useDepthMeasurementsForMeasurementTypes';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

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
