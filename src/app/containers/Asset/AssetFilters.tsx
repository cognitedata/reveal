import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregateResponse, AssetFilterProps } from '@cognite/sdk';
import { LabelFilter } from '../../components/Filters/LabelFilter/LabelFilter';
import { MetadataFilter } from '../../components/Filters/MetadataFilter/MetadataFilter';
import { AggregatedFilter } from '../../components/Filters/AggregatedFilter/AggregatedFilter';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

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

export const AssetFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: AssetFilterProps;
  setFilter: (newFilter: AssetFilterProps) => void;
}) => {
  const { data: items = [] } = useList('assets', { filter, limit: 1000 });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(filter);

  return (
    <BaseFilterCollapse.Panel title="Assets" {...rest}>
      <LabelFilter
        resourceType="asset"
        value={((filter as any).labels || { containsAny: [] }).containsAny}
        setValue={newFilters =>
          setFilter({
            ...filter,
            labels: newFilters ? { containsAny: newFilters } : undefined,
          })
        }
      />
      <AggregatedFilter
        title="Source"
        items={items}
        aggregator="source"
        value={filter.source}
        setValue={newSource =>
          setFilter({
            ...filter,
            source: newSource,
          })
        }
      />
      <MetadataFilter
        items={items}
        keys={metadataKeys}
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
        useAggregates
      />
    </BaseFilterCollapse.Panel>
  );
};
