import { useNdsEventsQuery } from 'domain/wells/nds/internal/queries/useNdsEventsQuery';
import { NdsInternal } from 'domain/wells/nds/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useNdsColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useNdsEventsQuery({ wellboreIds });

  return useDeepMemo(() => {
    if (!data) {
      return {
        data: EMPTY_OBJECT as Record<string, NdsInternal[]>,
        isLoading,
      };
    }

    return {
      data: groupByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
