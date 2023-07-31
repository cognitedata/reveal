import { useHoleSectionsWithTvdQuery } from 'domain/wells/holeSections/internal/queries/useHoleSectionsWithTvdQuery';
import { groupByWellbore } from 'domain/wells/wellbore/internal/transformers/groupByWellbore';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';
import { useDeepMemo } from 'hooks/useDeep';
import { useWellInspectWellboreIds } from 'modules/wellInspect/selectors';

import { HoleSectionView } from '../types';
import { adaptToHoleSectionDataView } from '../utils/adaptToHoleSectionDataView';

export const useHoleSectionsData = () => {
  const wellboreIds = useWellInspectWellboreIds();

  const { data, isLoading } = useHoleSectionsWithTvdQuery({
    wellboreIds,
  });

  return useDeepMemo(() => {
    if (!data || isEmpty(data)) {
      return {
        data: EMPTY_OBJECT as Record<string, HoleSectionView[]>,
        isLoading,
      };
    }
    const adaptedData = adaptToHoleSectionDataView(data);

    return {
      data: groupByWellbore(adaptedData),
      isLoading: false,
    };
  }, [data, isLoading]);
};
