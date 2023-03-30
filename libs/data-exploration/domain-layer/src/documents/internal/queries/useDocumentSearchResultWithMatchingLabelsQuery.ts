import {
  EMPTY_OBJECT,
  FileConfigType,
  InternalDocumentFilter,
  useDeepMemo,
} from '@data-exploration-lib/core';
import * as React from 'react';
import { UseInfiniteQueryOptions } from 'react-query';
import { TableSortBy } from '../../../types';
import { getSearchConfig } from '../../../utils';
import {
  extractMatchingLabels,
  MatchingLabelPropertyType,
} from '../../../utils/extractMatchingLabels';
import { extractMatchingLabelsFromCogniteLabels } from '../../../utils/extractMatchingLabelsFromCogniteLabels';
import { documentNameAndContentMatcher } from '../transformers/documentNameAndContentMatcher';
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
  options: UseInfiniteQueryOptions = {},
  searchConfig: FileConfigType = getSearchConfig().file
) => {
  const { results, ...rest } = useDocumentSearchResultQuery(
    { filter, limit, query, sortBy },
    options,
    searchConfig
  );

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [
      // this takes care of name and content labels
      {
        key: 'highlight',
        customMatcher: documentNameAndContentMatcher,
      },
    ];

    if (searchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (searchConfig['sourceFile|metadata'].enabled) {
      arr.push({
        key: 'sourceFile.metadata',
        label: 'Metadata',
      });
    }
    if (searchConfig['sourceFile|source'].enabled) {
      arr.push({
        key: 'sourceFile.source',
        label: 'Source',
      });
    }

    if (searchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (searchConfig.labels.enabled) {
      arr.push({
        key: 'labels',
        customMatcher: extractMatchingLabelsFromCogniteLabels,
      });
    }

    return arr;
  }, [searchConfig]);

  const mappedData = useDeepMemo(() => {
    if (results && query) {
      return results.map((item) => {
        return {
          ...item,
          matchingLabels: extractMatchingLabels(item, query, properties),
        };
      });
    }

    return results;
  }, [results, query]);

  return { ...rest, results: mappedData };
};
