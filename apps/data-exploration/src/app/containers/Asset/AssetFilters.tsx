import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregateResponse } from '@cognite/sdk';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  useAssetFilters,
  useFilterEmptyState,
  useResetAssetFilters,
} from '@data-exploration-app/store/filter';
import { BaseFilterCollapse } from '@data-exploration-app/components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  LabelFilterV2,
  MetadataFilterV2,
  extractSources,
  AggregatedFilterV2,
  SourceFilter,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';
import {
  InternalAssetFilters,
  NIL_FILTER_LABEL,
  NIL_FILTER_VALUE,
  transformNewFilterToOldFilter,
} from '@data-exploration-lib/domain-layer';
import { MultiSelectFilter } from '@data-exploration-app/components/Filters/MultiSelectFilter';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import head from 'lodash/head';

// TODO: Move to domain layer
export const useAssetMetadataKeys = (
  filter?: InternalAssetFilters,
  config?: UseQueryOptions<
    AggregateResponse[],
    unknown,
    AggregateResponse[],
    (string | InternalAssetFilters | undefined)[]
  >
) => {
  const sdk = useSDK();

  // eslint-disable-next-line no-param-reassign
  filter = transformNewFilterToOldFilter(filter);

  const { data, ...rest } = useQuery(
    ['assets', 'aggregate', 'metadataKeys', filter],
    async () =>
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

  const { data: items = [] } = useList<any>('assets', {
    filter: transformNewFilterToOldFilter(assetFilters),
    limit: 1000,
  });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(assetFilters);

  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  return (
    <BaseFilterCollapse.Panel
      title="Assets"
      hideResetButton={isFiltersEmpty}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={resetAssetFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <LabelFilterV2
          resourceType="asset"
          value={assetFilters.labels}
          setValue={(newFilters) =>
            setAssetFilters({
              labels: newFilters,
            })
          }
          addNilOption
        />

        <SourceFilter
          items={items}
          value={assetFilters.sources}
          onChange={(newSources) =>
            setAssetFilters({
              sources: newSources,
            })
          }
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
        />

        <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={assetFilters.metadata}
          setValue={(newMetadata) =>
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
