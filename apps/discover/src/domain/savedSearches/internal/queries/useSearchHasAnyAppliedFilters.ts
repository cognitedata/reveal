import isObject from 'lodash/isObject';

import { useQuerySavedSearchCurrent } from './useQuerySavedSearchCurrent';

export const useSearchHasAnyAppliedFilters = (): boolean => {
  const { data: savedSearchCurrent } = useQuerySavedSearchCurrent();

  if (savedSearchCurrent && 'error' in savedSearchCurrent) {
    return false;
  }

  if (savedSearchCurrent) {
    return (
      !!savedSearchCurrent.query ||
      !!savedSearchCurrent.geoJson ||
      isAnyFilterApplied(savedSearchCurrent.filters)
    );
  }

  return false;
};

export const isAnyFilterApplied = (object = {}): boolean => {
  if (Array.isArray(object) && object.length > 0) {
    return object.some((item) => item.length > 0);
  }
  if (isObject(object) && Object.keys(object).length > 0) {
    return Object.values(object).some((subCategory) => {
      if (!isObject(subCategory)) {
        return true;
      }

      return isAnyFilterApplied(subCategory);
    });
  }

  return false;
};
