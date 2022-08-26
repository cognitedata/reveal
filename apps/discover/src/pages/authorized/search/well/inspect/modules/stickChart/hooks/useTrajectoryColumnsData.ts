import { useTrajectoriesWithData } from 'domain/wells/trajectory/internal/hooks/useTrajectoriesWithData';
import { TrajectoryWithData } from 'domain/wells/trajectory/internal/types';
import { keyByWellbore } from 'domain/wells/wellbore/internal/transformers/keyByWellbore';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useTrajectoryColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useTrajectoriesWithData({ wellboreIds });

  return useDeepMemo(() => {
    if (isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, TrajectoryWithData>,
        isLoading,
      };
    }

    return {
      data: keyByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
