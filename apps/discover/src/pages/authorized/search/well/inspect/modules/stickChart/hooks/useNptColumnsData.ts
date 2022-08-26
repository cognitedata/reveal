import { useNptEventsQuery } from 'domain/wells/npt/internal/queries/useNptEventsQuery';
import { NptInternal } from 'domain/wells/npt/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useNptColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useNptEventsQuery({ wellboreIds });

  return useDeepMemo(() => {
    if (!data) {
      return {
        data: EMPTY_OBJECT as Record<string, NptInternal[]>,
        isLoading,
      };
    }

    return {
      data: groupByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
