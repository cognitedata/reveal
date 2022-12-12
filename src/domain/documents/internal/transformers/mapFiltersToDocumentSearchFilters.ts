import { AdvancedFilterBuilder, AdvancedFilter } from '../../../builders';
import { InternalDocumentFilter } from '../types';

export type DocumentProperties = {
  'sourceFile|datasetId': number[];
  'sourceFile|assetIds': number[];
  author: string[];
  'sourceFile|source': string[];
  type: string[];
  externalId: string;
  id: number[];
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
  _query?: string
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
    .containsAny('sourceFile|assetIds', () => {
      return assetSubtreeIds?.reduce((acc, { value }) => {
        if (typeof value === 'number') {
          return [...acc, value];
        }
        return acc;
      }, [] as number[]);
    })
    .in('author', author)
    .in('sourceFile|source', source)
    .in('type', type)
    .in('id', () => {
      if (internalId) {
        return [internalId];
      }
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
      filterBuilder.equals(`sourceFile|metadata|${key}`, value);
    }
  }

  builder.and(filterBuilder);

  // This is not working as expected with the documents api search endpoint -- investigate this further.
  // if (query) {
  //   const searchQueryBuilder = new AdvancedFilterBuilder<DocumentProperties>();

  //   searchQueryBuilder.in('id', () => {
  //     if (query && isNumeric(query)) {
  //       return [Number(query)];
  //     }
  //   });
  //   searchQueryBuilder.prefix('externalId', query);

  //   builder.or(searchQueryBuilder);
  // }

  return new AdvancedFilterBuilder<DocumentProperties>().and(builder).build();
};
