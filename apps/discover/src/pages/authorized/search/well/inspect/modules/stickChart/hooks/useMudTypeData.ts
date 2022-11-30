import { useMudTypeMeasurements } from 'domain/wells/measurements/internal/hooks/useMudTypeMeasurements';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useMudTypeData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useMudTypeMeasurements({
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
