import { InternalFilterSettings, SearchFilterSelector } from './types';

export const mapFiltersToCDF = (
  query: InternalFilterSettings,
  searchField = 'name'
) => {
  const nextFilter: { search?: any; filter?: any } = {};

  // If we have a query, add it to the root level 'search' field.
  if (query.query) {
    nextFilter.search = { [searchField]: query.query };
  }

  // Merge incoming filters together
  if (query.filters && query.filters.length > 0) {
    nextFilter.filter = {};
    query.filters.forEach((filter) => {
      if (!filter.value) return;

      // Merge based on the length of the 'field'. support nesting
      if (filter.field[1]) {
        nextFilter.filter[filter.field[0]] = Object.assign(
          nextFilter.filter[filter.field[0]] || {},
          { [filter.field[1]]: filter.value }
        );
      } else {
        nextFilter.filter = Object.assign(nextFilter.filter || {}, {
          [filter.field[0]]: filter.value,
        });
      }
    });
  }

  // If we have no filters, delete the field to not confuse CDF
  if (Object.keys(nextFilter.filter || {}).length === 0) {
    delete nextFilter.filter;
  }

  // and if in the end we have nothing, return undefined
  if (Object.keys(nextFilter).length === 0) {
    return undefined;
  }

  return nextFilter;
};

export const getDefaultFilter = (selector: SearchFilterSelector) => ({
  ...selector,
  value: '',
});
