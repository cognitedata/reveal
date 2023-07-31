import { WELL_PROPERTY_FILTER_IDS } from 'domain/wells/summaries/internal/constants';
import { WellPropertyFilterIDs } from 'domain/wells/summaries/internal/types';

import isEqual from 'lodash/isEqual';

import { useDeepEffect } from 'hooks/useDeep';

import { WellFilterMap } from '../types';

import { useWellPropertyFiltersResult } from './useWellPropertyFiltersResult';

export const useRevalidateWellPropertyFilters = (
  selectedOptions: WellFilterMap,
  onRevalidateFilterValue: (
    id: WellPropertyFilterIDs,
    selectedValues: string[]
  ) => void
) => {
  const revalidatedResult = useWellPropertyFiltersResult(selectedOptions);

  useDeepEffect(() => {
    WELL_PROPERTY_FILTER_IDS.forEach((id) => {
      const currentValue = selectedOptions[id] || [];
      const revalidatedValue = revalidatedResult[id];
      const shouldRevalidate = !isEqual(currentValue, revalidatedValue);

      if (shouldRevalidate) {
        onRevalidateFilterValue(id, revalidatedResult[id]);
      }
    });
  }, [revalidatedResult]);
};
