import isEmpty from 'lodash/isEmpty';

import {
  FileConfigType,
  InternalDocumentFilter,
  isNumeric,
  METADATA_ALL_VALUE,
} from '@data-exploration-lib/core';

import { AdvancedFilterBuilder, AdvancedFilter } from '../../../builders';
import { getSearchConfig } from '../../../utils';

export type DocumentProperties = {
  'sourceFile|datasetId': number[];
  'sourceFile|assetIds': number[];
  author: string[];
  'sourceFile|source': string[];
  type: string[];
  externalId: string;
  id: number;
  metadata: string;
  assetIds: number[];
  labels: { externalId: string }[];
  [key: `sourceFile|metadata|${string}`]: string;
};

export const mapFiltersToDocumentSearchFilters = (
  {
    dataSetIds,
    externalIdPrefix,
    source,
    author,
    type,
    createdTime,
    lastUpdatedTime,
    assetSubtreeIds,
    internalId,
    metadata,
    labels,
    assetIds,
  }: InternalDocumentFilter,
  query?: string,
  searchConfig: FileConfigType = getSearchConfig().file
): AdvancedFilter<DocumentProperties> | undefined => {
  const builder = new AdvancedFilterBuilder<DocumentProperties>();

  const filterBuilder = new AdvancedFilterBuilder<DocumentProperties>()
    .in('sourceFile|datasetId', () => {
      return dataSetIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .containsAny('labels', () => {
      return labels?.reduce((acc, { value }) => {
        return [...acc, { externalId: value }];
      }, [] as { externalId: string }[]);
    })
    .in('author', author)
    .in('sourceFile|source', source)
    .in('type', type)
    .equals('id', internalId)
    .inAssetSubtree('sourceFile|assetIds', () => {
      return assetSubtreeIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .containsAny('sourceFile|assetIds', () =>
      assetIds?.map(({ value }) => value)
    )
    .prefix('externalId', externalIdPrefix)
    .range('createdTime', {
      lte: createdTime?.max as number,
      gte: createdTime?.min as number,
    })
    .range('modifiedTime', {
      lte: lastUpdatedTime?.max as number,
      gte: lastUpdatedTime?.min as number,
    });

  if (metadata) {
    const metadataBuilder = new AdvancedFilterBuilder<DocumentProperties>();
    for (const { key, value } of metadata) {
      if (value === METADATA_ALL_VALUE) {
        metadataBuilder.exists(`sourceFile|metadata|${key}`);
      } else {
        metadataBuilder.equals(`sourceFile|metadata|${key}`, value);
      }
    }
    filterBuilder.or(metadataBuilder);
  }

  builder.and(filterBuilder);

  if (query && !isEmpty(query)) {
    const searchQueryBuilder = new AdvancedFilterBuilder<DocumentProperties>();

    if (searchConfig['sourceFile|name']?.enabled) {
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore the builder types will be refactored in future the "ts-ignore" is harmless in this case
      searchQueryBuilder.equals('sourceFile|name', query);

      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore the builder types will be refactored in future the "ts-ignore" is harmless in this case
      searchQueryBuilder.prefix('sourceFile|name', query);

      if (searchConfig['sourceFile|name']?.enabledFuzzySearch) {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore the builder types will be refactored in future the "ts-ignore" is harmless in this case
        searchQueryBuilder.search('sourceFile|name', query);
      }
    }

    if (searchConfig.content.enabled) {
      if (searchConfig.content.enabledFuzzySearch) {
        // @ts-ignore
        searchQueryBuilder.search('content', query);
      }
    }

    if (searchConfig['sourceFile|metadata'].enabled) {
      // @ts-ignore
      searchQueryBuilder.equals('sourceFile|metadata', query);
      // @ts-ignore
      searchQueryBuilder.prefix('sourceFile|metadata', query);
    }

    if (isNumeric(query) && searchConfig.id.enabled) {
      searchQueryBuilder.equals('id', Number(query));
    }

    if (searchConfig.externalId.enabled) {
      searchQueryBuilder.equals('externalId', query);
      searchQueryBuilder.prefix('externalId', query);
    }

    if (searchConfig['sourceFile|source'].enabled) {
      // @ts-ignore
      searchQueryBuilder.equals('sourceFile|source', query);
      // @ts-ignore
      searchQueryBuilder.prefix('sourceFile|source', query);
    }

    if (searchConfig.labels.enabled) {
      // @ts-ignore
      searchQueryBuilder.containsAny('labels', [{ externalId: query }]);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<DocumentProperties>().and(builder).build();
};
