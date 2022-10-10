import { useCasingSchematicsWithTvdDataQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsWithTvdDataQuery';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { CasingAssemblyView } from '../types';
import { adaptToCasingsColumnData } from '../utils/adaptToCasingsColumnData';

export const useCasingsColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useCasingSchematicsWithTvdDataQuery({
    wellboreIds,
  });

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, CasingAssemblyView[]>,
        isLoading,
      };
    }
    const adaptedData = adaptToCasingsColumnData(data);

    return {
      data: groupByWellbore(adaptedData),
      isLoading: false,
    };
  }, [data, isLoading]);
};
