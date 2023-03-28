import { AdvancedFilterBuilder, AdvancedFilter } from '../../../builders';
import {
  InternalDocumentFilter,
  isNumeric,
  METADATA_ALL_VALUE,
} from '@data-exploration-lib/core';
import { getSearchConfig } from '../../../utils';
import isEmpty from 'lodash/isEmpty';

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
  }: InternalDocumentFilter,
  query?: string
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

    .in('author', author)
    .in('sourceFile|source', source)
    .in('type', type)
    .equals('id', internalId)
    .inAssetSubtree('assetIds', () => {
      return assetSubtreeIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
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
    for (const { key, value } of metadata) {
      if (value === METADATA_ALL_VALUE) {
        filterBuilder.exists(`sourceFile|metadata|${key}`);
      } else {
        filterBuilder.equals(`sourceFile|metadata|${key}`, value);
      }
    }
  }

  builder.and(filterBuilder);

  if (query && !isEmpty(query)) {
    const searchConfigData = getSearchConfig();

    const searchQueryBuilder = new AdvancedFilterBuilder<DocumentProperties>();

    if (searchConfigData.file['sourceFile|name']?.enabled) {
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore the builder types will be refactored in future the "ts-ignore" is harmless in this case
      searchQueryBuilder.equals('sourceFile|name', query);

      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore the builder types will be refactored in future the "ts-ignore" is harmless in this case
      searchQueryBuilder.prefix('sourceFile|name', query);

      if (searchConfigData.file['sourceFile|name']?.enabledFuzzySearch) {
        /* eslint-disable @typescript-eslint/ban-ts-comment */
        // @ts-ignore the builder types will be refactored in future the "ts-ignore" is harmless in this case
        searchQueryBuilder.search('sourceFile|name', query);
      }
    }

    if (searchConfigData.file.content.enabled) {
      if (searchConfigData.file.content.enabledFuzzySearch) {
        // @ts-ignore
        searchQueryBuilder.search('content', query);
      }
    }

    if (searchConfigData.file['sourceFile|metadata'].enabled) {
      // @ts-ignore
      searchQueryBuilder.prefix('sourceFile|metadata', query);
    }

    if (isNumeric(query) && searchConfigData.file.id.enabled) {
      searchQueryBuilder.equals('id', Number(query));
    }

    if (searchConfigData.file.externalId.enabled) {
      searchQueryBuilder.prefix('externalId', query);
    }

    if (searchConfigData.file['sourceFile|source'].enabled) {
      // @ts-ignore
      searchQueryBuilder.prefix('sourceFile|source', query);
    }

    if (searchConfigData.file.labels.enabled) {
      // @ts-ignore
      searchQueryBuilder.containsAny('labels', [{ externalId: query }]);
    }

    builder.or(searchQueryBuilder);
  }

  return new AdvancedFilterBuilder<DocumentProperties>().and(builder).build();
};
