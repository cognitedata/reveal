import pickBy from 'lodash/pickBy';

import { isNotUndefined } from '../../utils/isNotUndefined';

import { CommentFilter } from './types';

export const composeFilter = (filter: CommentFilter) =>
  Object.entries(filter)
    .map(([filterKey, filterValue]) => {
      if (filterValue === undefined) {
        return undefined;
      }
      if (filterKey === 'taggedUsers' && Array.isArray(filterValue)) {
        return {
          [filterKey]: { containsAll: filterValue },
        };
      }
      if (
        filterKey === 'parentComment' &&
        typeof filterValue === 'object' &&
        'externalId' in filterValue
      ) {
        return {
          [filterKey]: { externalId: { eq: filterValue.externalId } },
        };
      }
      return { [filterKey]: { eq: filterValue } };
    })
    .filter(isNotUndefined);

export const removeNullEntries = <T extends object>(obj: T): T =>
  pickBy(obj, (value) => value !== null) as T;

export const isNonEmptyString = (str: string): boolean => str.trim().length > 0;
