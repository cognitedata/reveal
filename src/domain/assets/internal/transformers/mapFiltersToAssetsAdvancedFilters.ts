import { AdvancedFilter, AdvancedFilterBuilder } from 'domain/builders';
import { InternalAssetFilters } from '../types';

export type AssetsProperties = {
  assetSubtreeIds: number[];
  dataSetIds: number[];
  source: string[];
  externalId: string;
  [key: `metadata.${string}`]: string;
};

export const mapFiltersToAssetsAdvancedFilters = ({
  source,
  metadata,
  createdTime,
  lastUpdatedTime,
  externalIdPrefix,
  dataSetIds,
}: InternalAssetFilters): AdvancedFilter<AssetsProperties> | undefined => {
  const filterBuilder = new AdvancedFilterBuilder<AssetsProperties>()

    .containsAny('dataSetIds', () => {
      return dataSetIds?.reduce((acc, item) => {
        if ('id' in item) {
          return [...acc, item.id];
        }
        return acc;
      }, [] as number[]);
    })
    .in('source', () => {
      if (source) {
        return [source];
      }
    })
    .prefix('externalId', externalIdPrefix)
    .range('createdTime', {
      lte: createdTime?.max as number,
      gte: createdTime?.min as number,
    })
    .range('lastUpdatedTime', {
      lte: lastUpdatedTime?.max as number,
      gte: lastUpdatedTime?.min as number,
    });

  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      filterBuilder.equals(`metadata.${key}`, value);
    }
  }

  // /**
  //  * We want to filter all the metadata keys with the search query, to give a better result
  //  * to the user when using our search.
  //  */
  // if (searchQueryMetadataKeys) {
  //   const searchBuilder = new AdvancedFilterBuilder<EventsProperties>();

  //   for (const [key, value] of Object.entries(searchQueryMetadataKeys)) {
  //     searchBuilder.prefix(`metadata.${key}`, value);
  //   }

  //   filterBuilder.or(searchBuilder);
  // }

  return new AdvancedFilterBuilder<AssetsProperties>()
    .and(filterBuilder)
    .build();
};
