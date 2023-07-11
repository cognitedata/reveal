import pickBy from 'lodash/pickBy';

import { isNotUndefined } from '../../utils/isNotUndefined';

import { CommentFilter, Comment } from './types';

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

export const removeNullEntries = (comment: Comment): Comment =>
  pickBy(comment, (value) => value !== null) as Comment;
