import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import {
  AggregateResponse,
  AssetFilterProps,
  LabelContainsAnyFilter,
} from '@cognite/sdk';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  useAssetFilters,
  useFilterEmptyState,
  useResetAssetFilters,
} from 'app/store/filter';
import { BaseFilterCollapse } from 'app/components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  AggregatedFilterV2,
  LabelFilterV2,
  MetadataFilterV2,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from 'app/containers/elements';

// TODO: Move to domain layer
export const useAssetMetadataKeys = (
  filter?: AssetFilterProps,
  config?: UseQueryOptions<
    AggregateResponse[],
    unknown,
    AggregateResponse[],
    (string | AssetFilterProps | undefined)[]
  >
) => {
  const sdk = useSDK();
  const { data, ...rest } = useQuery(
    ['assets', 'aggregate', 'metadataKeys', filter],
    async () =>
      // @ts-ignore
      sdk.assets.aggregate({ filter, aggregate: 'metadataKeys' }),
    {
      staleTime: 60 * 1000,
      ...config,
    }
  );

  return { data: data as any, ...rest };
};

export const AssetFilters = ({ ...rest }) => {
  const [assetFilters, setAssetFilters] = useAssetFilters();
  const resetAssetFilters = useResetAssetFilters();
  const isFiltersEmpty = useFilterEmptyState('asset');

  const { data: items = [] } = useList('assets', {
    filter: assetFilters,
    limit: 1000,
  });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(assetFilters);

  return (
    <BaseFilterCollapse.Panel
      title="Assets"
      hideResetButton={isFiltersEmpty}
      onResetClick={resetAssetFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <LabelFilterV2
          resourceType="asset"
          value={
            (
              (assetFilters.labels as LabelContainsAnyFilter) || {
                containsAny: [],
              }
            ).containsAny
          }
          setValue={newFilters =>
            setAssetFilters({
              labels: newFilters ? { containsAny: newFilters } : undefined,
            })
          }
        />
        <AggregatedFilterV2
          title="Source"
          items={items}
          aggregator="source"
          value={assetFilters.source}
          setValue={newSource =>
            setAssetFilters({
              source: newSource,
            })
          }
        />
        <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={assetFilters.metadata}
          setValue={newMetadata =>
            setAssetFilters({
              metadata: newMetadata,
            })
          }
          useAggregates
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
