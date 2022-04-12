import { LAST_CREATED_KEY } from 'dataLayers/documents/keys';
import compact from 'lodash/compact';
import { getYear } from 'utils/date';

import { EMPTY_ARRAY } from 'constants/empty';

import {
  FILE_TYPE_KEY,
  LABELS_KEY,
  PAGE_COUNT_KEY,
  SOURCE_KEY,
  TOTAL_COUNT_KEY,
} from '../constants';
import {
  AggregateNames,
  DocumentQueryFacet,
  DocumentResultFacets,
  DocumentsAggregatesResponse,
} from '../types';

const findResult = (
  result: DocumentsAggregatesResponse,
  name: AggregateNames
) => {
  const found = (result.aggregates || EMPTY_ARRAY).find(
    (item) => item.name === name
  );

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
  result: DocumentsAggregatesResponse
): DocumentResultFacets => {
  const fileCategory = findResult(result, 'fileCategory').map(
    (item): DocumentQueryFacet => {
      const name = (item.group as { [FILE_TYPE_KEY]: string }[])
        .map((group) => group[FILE_TYPE_KEY] || '')
        .join(' ');

      return {
        name,
        key: name,
        count: item.value,
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

  const lastcreated = findResult(result, 'lastcreated').map((item) => {
    const name = (item.group as { [LAST_CREATED_KEY]: string }[])
      .map((group) => {
        return getYear(group[LAST_CREATED_KEY]);
      })
      .join(' ');

    return {
      name,
      key: name,
      count: item.value,
      selected: false,
    };
  });

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

  const location = findResult(result, 'location').map((item) => {
    const name = (item.group as { [SOURCE_KEY]: string }[])
      .map((group) => group[SOURCE_KEY])
      .join(' ');
    return {
      name,
      key: name,
      count: item.value,
      selected: false,
    };
  });

  const labels = findResult(result, 'labels').map((item) => {
    const name = compact(
      (item.group as { [LABELS_KEY]: string }[]).map(
        (group) => group[LABELS_KEY]
      )
    ).join(' ');
    return {
      name,
      key: name,
      count: item.value,
      selected: false,
    };
  });

  const pageCount = findResult(result, 'pageCount').map((item) => {
    const name = item.group[0][PAGE_COUNT_KEY];
    return {
      name,
      key: name,
      count: item.value,
      selected: false,
    };
  });

  return {
    labels,
    lastcreated,
    total,
    location,
    fileCategory: groupMimetypesTogether,
    pageCount,
  };
};
