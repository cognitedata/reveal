import {
  DocumentFilterProperty,
  DocumentFilterValue,
  DocumentSearchResponse,
  Label,
} from '@cognite/sdk';

import { LABELS_KEY, PAGE_COUNT_KEY, TOTAL_COUNT_KEY } from './constants';
import {
  AggregateNames,
  DocumentQueryFacet,
  DocumentResultFacets,
} from './types';

const findResult = (
  result: DocumentSearchResponse,
  name: AggregateNames
): {
  group: {
    property: DocumentFilterProperty;
    value: DocumentFilterValue;
  }[];
  count: number;
}[] => {
  const found = (result.aggregates || []).find((item) => item.name === name);

  if (found) {
    return found.groups;
  }

  return [];
};

/*
 * Process the facets that are returned from the API after a search
 *
 *
 */
export const processFacets = (
  result: DocumentSearchResponse
): DocumentResultFacets => {
  const fileCategory = findResult(result, 'fileCategory').map(
    ({ count, group }) => {
      return {
        name: group[0]?.value as string,
        key: group[0]?.property.join('.'),
        count,
        selected: false,
      };
    }
  );

  // note: this can be optimised to do all in the above function
  const groupMimetypesTogether = fileCategory.reduce(
    (groupFiletypesResult, item) => {
      const found = groupFiletypesResult.find(
        (resultItem) => resultItem.name === item.name
      );

      if (found) {
        // mutate item
        found.count += item.count;
      } else {
        groupFiletypesResult.push(item);
      }

      return groupFiletypesResult;
    },
    <DocumentQueryFacet[]>[]
  );

  const lastcreated = findResult(result, 'lastcreated').map(
    ({ count, group }) => {
      return {
        name: group[0]?.value as string,
        key: group[0]?.property.join('.'),
        count,
        selected: false,
      };
    }
  );

  const totalCount = (result.aggregates || []).find(
    (item) => item.name === TOTAL_COUNT_KEY
  );

  const total = totalCount
    ? [
        {
          name: TOTAL_COUNT_KEY,
          key: TOTAL_COUNT_KEY,
          count: totalCount.total,
        },
      ]
    : [];

  const location = findResult(result, 'location').map(({ count, group }) => {
    return {
      name: group[0]?.value as string,
      key: group[0]?.property.join('.'),
      count,
      selected: false,
    };
  });

  const labels = findResult(result, LABELS_KEY).map(({ count, group }) => {
    return {
      name: (group[0]?.value as Label).externalId,
      key: group[0]?.property.join('.'),
      count,
      selected: false,
    };
  });

  const pageCount = findResult(result, PAGE_COUNT_KEY).map(
    ({ count, group }) => {
      return {
        name: group[0]?.value as string,
        key: group[0]?.property.join('.'),
        count,
        selected: false,
      };
    }
  );

  return {
    labels,
    lastcreated,
    total,
    location,
    fileCategory: groupMimetypesTogether,
    pageCount,
  };
};
