import groupBy from 'lodash/groupBy';

import { useAppliedWellFilters } from 'modules/sidebar/selectors';
import { useFilterConfigByCategory } from 'modules/wellSearch/hooks/useFilterConfigByCategory';
import { FilterValues, WellFilterMap } from 'modules/wellSearch/types';
import { formatWellFilters } from 'modules/wellSearch/utils/filters';

export const useGetAppliedFilterGroupedByCategory = () => {
  return groupBy(useGetAppliedFilterEntries(), 'category');
};

export const useGetAppliedFilterEntries = () => {
  const appliedFilters = useAppliedWellFilters();
  return useFilterConfigByCategory().reduce(
    (result: FilterValues[], filterConfig) => {
      return [...result, ...formatWellFilters(appliedFilters, filterConfig)];
    },
    []
  );
};

export const useFormatWellFilters = () => {
  const configByCategory = useFilterConfigByCategory();
  return (wellFilters: WellFilterMap) => {
    return configByCategory.reduce((result: FilterValues[], filterConfig) => {
      return [...result, ...formatWellFilters(wellFilters, filterConfig)];
    }, []);
  };
};
