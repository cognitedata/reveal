import { useMudWeightMeasurements } from 'domain/wells/measurements/internal/hooks/useMudWeightMeasurements';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useMudWeightData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useMudWeightMeasurements({
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
