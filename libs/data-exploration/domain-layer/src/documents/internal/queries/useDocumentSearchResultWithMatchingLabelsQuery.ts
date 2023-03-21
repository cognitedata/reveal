import { EMPTY_OBJECT, useDeepMemo } from '@data-exploration-lib/core';
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

  const documentSearchConfig = getSearchConfig().file;

  const properties = React.useMemo(() => {
    const arr: MatchingLabelPropertyType[] = [
      // this takes care of name and content labels
      {
        key: 'highlight',
        customMatcher: documentNameAndContentMatcher,
      },
    ];

    if (documentSearchConfig.id.enabled) {
      arr.push({
        key: 'id',
        label: 'ID',
      });
    }

    if (documentSearchConfig['sourceFile|metadata'].enabled) {
      arr.push({
        key: 'sourceFile.metadata',
        label: 'Metadata',
      });
    }
    if (documentSearchConfig['sourceFile|source'].enabled) {
      arr.push({
        key: 'sourceFile.source',
        label: 'Source',
      });
    }

    if (documentSearchConfig.externalId.enabled) {
      arr.push({
        key: 'externalId',
        label: 'External ID',
      });
    }

    if (documentSearchConfig.labels.enabled) {
      arr.push({
        key: 'labels',
        customMatcher: extractMatchingLabelsFromCogniteLabels,
      });
    }

    return arr;
  }, [documentSearchConfig]);

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
