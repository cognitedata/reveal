import { FILTER_SEPARATOR } from './constants';

export const formatFiltersToString = <T extends Record<string, unknown[]>>(
  filters: T
) => {
  return Object.keys(filters)
    .filter((facet) => filters[facet].length > 0)
    .map((facet) => `${facet}: ${filters[facet].join(FILTER_SEPARATOR)}`);
};
