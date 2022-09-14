import {
  ColumnFiltersState,
  SortingState,
  ColumnSort,
  ColumnFilter,
} from '@tanstack/react-table';

const SORT_KEY = 'sort_';
const FILTER_KEY = 'filter_';

const sortingToUrlParams = (items: SortingState) => {
  return items.reduce((results, item) => {
    return `${results}&${SORT_KEY}${item.id}=${item.desc}`;
  }, '');
};
const filterToUrlParams = (items: ColumnFiltersState) => {
  return items.reduce((results, item) => {
    return `${results}&${FILTER_KEY}${item.id}=${item.value}`;
  }, '');
};
const urlParamToSorting = (
  key: string,
  value: string
): ColumnSort | undefined => {
  if (key.startsWith(SORT_KEY)) {
    return {
      id: key.replace(SORT_KEY, ''),
      desc: Boolean(value),
    };
  }
  return undefined;
};
const urlParamToFilter = (
  key: string,
  value: string
): ColumnFilter | undefined => {
  if (key.startsWith(FILTER_KEY)) {
    return {
      id: key.replace(FILTER_KEY, ''),
      value,
    };
  }
  return undefined;
};

export const getStateFromUrlParams = (params: Record<string, string>) => {
  return Object.keys(params).reduce(
    (results, item) => {
      const sortingParam = urlParamToSorting(item, params[item]);
      if (sortingParam) {
        results.sort.push(sortingParam);
      }
      const filterParam = urlParamToFilter(item, params[item]);
      if (filterParam) {
        results.filters.push(filterParam);
      }
      return results;
    },
    { sort: [], filters: [] } as {
      sort: SortingState;
      filters: ColumnFiltersState;
    }
  );
};

export const getParamsForUrl = ({
  sorting,
  filters,
}: {
  sorting: SortingState;
  filters: ColumnFiltersState;
}) => {
  const paramList = sortingToUrlParams(sorting) + filterToUrlParams(filters);
  return paramList.replace('&', ''); // remove first &
};
