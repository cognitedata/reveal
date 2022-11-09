import find from 'lodash/find';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import { isValidDate, shortDate } from 'utils/date';

import {
  WellFilterOptionValue,
  FilterTypes,
  WellFilterMap,
  FilterValues,
  FilterCategoricalData,
} from 'modules/wellSearch/types';
import { filterConfigsById } from 'pages/authorized/search/search/SideBar/filters/well/filters';

export const removeAppliedFilterValue = (
  appliedFilters: WellFilterMap,
  id: number,
  value: WellFilterOptionValue
) => {
  const copyOfFilters = { ...appliedFilters };
  const items = appliedFilters[id] as WellFilterOptionValue[];
  if (
    filterConfigsById[id].type === FilterTypes.NUMERIC_RANGE ||
    filterConfigsById[id].type === FilterTypes.DATE_RANGE
  ) {
    // delete the entire range
    delete copyOfFilters[id];
  } else {
    const updatedWells = items.filter((item) => item !== value);
    copyOfFilters[id] = updatedWells;
  }
  return copyOfFilters;
};

export const formatWellFilters = (
  wellFilters: WellFilterMap,
  filterConfig: FilterCategoricalData
) =>
  filterConfig.filterConfigIds.reduce((result: FilterValues[], id) => {
    const wellFilter = wellFilters[id];
    if (
      isUndefined(wellFilter) ||
      (isArray(wellFilter) && !wellFilter.length)
    ) {
      return result;
    }

    const field = find(filterConfig.filterConfigs, { id })?.name;
    const category = find(filterConfig.filterConfigs, { id })?.category;

    /**
     * String value field
     */
    if (wellFilter && isString(wellFilter)) {
      return [...result, { id, value: wellFilter, field, category }];
    }

    if (filterConfigsById[id].type === FilterTypes.NUMERIC_RANGE) {
      const item = {
        id,
        field,
        category,
        value: (wellFilter as []).join('-'),
      };
      return [...result, item];
    }

    if (filterConfigsById[id].type === FilterTypes.DATE_RANGE) {
      const value = (wellFilter as [])
        .filter((date) => date && isValidDate(date as Date))
        .map((date) => shortDate(date as Date))
        .join('-');
      const item = { id, field, value, category };
      return [...result, item];
    }

    const list = (wellFilter as []).map((c) => {
      return { id, field, value: c, displayName: c, category };
    });
    return [...result, ...list];
  }, []);
