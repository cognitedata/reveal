import { useNptWithTvdDataQuery } from 'domain/wells/npt/internal/queries/useNptWithTvdDataQuery';
import { NptInternalWithTvd } from 'domain/wells/npt/internal/types';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

export const useNptData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useNptWithTvdDataQuery({ wellboreIds });

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, NptInternalWithTvd[]>,
        isLoading,
      };
    }

    return {
      data: groupByWellbore(data),
      isLoading: false,
    };
  }, [data, isLoading]);
};
