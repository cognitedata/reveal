import { useNdsWithTvdDataQuery } from 'domain/wells/nds/internal/queries/useNdsWithTvdDataQuery';
import { NdsInternalWithTvd } from 'domain/wells/nds/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useNdsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useNdsWithTvdDataQuery({ wellboreIds });

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, NdsInternalWithTvd[]>,
        isLoading,
      };
    }

    return {
      data: groupByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
