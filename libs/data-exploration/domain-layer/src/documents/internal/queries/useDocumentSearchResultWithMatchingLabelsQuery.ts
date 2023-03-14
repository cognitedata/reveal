import { EMPTY_OBJECT, useDeepMemo } from '@data-exploration-lib/core';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { extractMatchingLabels } from '../../../utils/extractMatchingLabels';
import { extractMatchingLabelsFromCogniteLabels } from '../../../utils/extractMatchingLabelsFromCogniteLabels';
import { documentNameAndContentMatcher } from '../transformers/documentNameAndContentMatcher';
import { InternalDocumentFilter } from '../types';
import { useDocumentSearchResultQuery } from './useDocumentSearchResultQuery';

export const useDocumentSearchResultWithMatchingLabelsQuery = (
  {
    filter = EMPTY_OBJECT,
    limit,
    query,
    sortBy,
  }: {
    filter?: InternalDocumentFilter;
    query?: string;
    limit?: number;
    sortBy?: TableSortBy[];
  } = {},
  options: UseInfiniteQueryOptions = {}
) => {
  const { results, ...rest } = useDocumentSearchResultQuery(
    { filter, limit, query, sortBy },
    options
  );
  const mappedData = useDeepMemo(() => {
    if (results && query) {
      return results.map((item) => {
        return {
          ...item,
          matchingLabels: extractMatchingLabels(item, query, [
            {
              key: 'id',
              label: 'ID',
            },
            {
              key: 'sourceFile.metadata',
              label: 'Metadata',
            },
            {
              key: 'sourceFile.source',
              label: 'Source',
            },
            {
              key: 'externalId',
              label: 'External ID',
            },
            // this takes care of name and content labels
            {
              key: 'highlight',
              customMatcher: documentNameAndContentMatcher,
            },
            {
              key: 'labels',
              customMatcher: extractMatchingLabelsFromCogniteLabels,
            },
          ]),
        };
      });
    }

    return results;
  }, [results, query]);

  return { ...rest, results: mappedData };
};
