import { useFitLotDepthMeasurements } from 'domain/wells/measurements/internal/hooks/useFitLotDepthMeasurements';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useMeasurementsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useFitLotDepthMeasurements({
    wellboreIds,
    withTvd: true,
  });

  return useDeepMemo(() => {
    return {
      data: groupByWellbore(data),
      isLoading,
    };
  }, [data, isLoading]);
};
