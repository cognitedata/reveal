import { useList } from '@cognite/sdk-react-query-hooks';
import {
  useAssetsMetadataKeysAggregateQuery,
  useAssetsMetadataValuesAggregateQuery,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import head from 'lodash/head';
import { InternalAssetFilters } from '@data-exploration-lib/core';
import { LabelFilterV2 } from './LabelFilter/LabelFilter';
import { MetadataFilterV2 } from './MetadataFilter/MetadataFilter';
import { AggregatedFilterV2 } from './AggregatedFilter/AggregatedFilter';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';

// TODO(CDFUX-000) allow customization of ordering of filters via props
export const AssetFiltersV2 = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: InternalAssetFilters;
  setFilter: (newFilter: InternalAssetFilters) => void;
}) => {
  const { data: items = [] } = useList<any>('assets', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  const { data: metadataKeys = [] } = useAssetsMetadataKeysAggregateQuery();

  return (
    <BaseFilterCollapse.Panel title="Assets" {...rest}>
      <LabelFilterV2
        resourceType="asset"
        value={filter.labels}
        setValue={(newFilters) =>
          setFilter({
            ...filter,
            labels: newFilters,
          })
        }
      />
      <AggregatedFilterV2
        title="Source"
        items={items}
        aggregator="source"
        value={head(filter.sources)?.value}
        setValue={(newSource) =>
          setFilter({
            ...filter,
            sources: [{ value: String(newSource) }],
          })
        }
      />
      <MetadataFilterV2
        items={items}
        keys={metadataKeys}
        value={filter.metadata}
        setValue={(newMetadata) =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
        useAggregateMetadataValues={(metadataKey) =>
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useAssetsMetadataValuesAggregateQuery({ metadataKey })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
