import { useCasingSchematicsQuery } from 'domain/wells/casings/internal/queries/useCasingSchematicsQuery';
import { useCasingsTvdDataQuery } from 'domain/wells/casings/internal/queries/useCasingsTvdDataQuery';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { adaptToCasingsColumnData } from '../utils/adaptToCasingsColumnData';

export const useCasingsColumnsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data: casingsData, isLoading: isCasingsLoading } =
    useCasingSchematicsQuery({
      wellboreIds,
    });

  const { data: tvdData, isLoading: isTvdDataLoading } = useCasingsTvdDataQuery(
    casingsData || []
  );

  return useDeepMemo(() => {
    if (
      !casingsData ||
      isEmpty(tvdData) ||
      isCasingsLoading ||
      isTvdDataLoading
    ) {
      return {
        data: EMPTY_OBJECT,
        isLoading: isCasingsLoading || isTvdDataLoading,
      };
    }

    const adaptedData = adaptToCasingsColumnData(casingsData, tvdData);

    return {
      data: groupByWellbore(adaptedData),
      isLoading: false,
    };
  }, [casingsData, tvdData, isCasingsLoading, isTvdDataLoading]);
};
