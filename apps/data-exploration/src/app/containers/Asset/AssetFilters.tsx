import { LabelFilterV2, MetadataFilterV2 } from '@data-exploration/containers';

import { SourceFilter } from '@cognite/data-exploration';
import { useList } from '@cognite/sdk-react-query-hooks';

import { BaseFilterCollapse } from '@data-exploration-app/components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { SPECIFIC_INFO_CONTENT } from '@data-exploration-app/containers/constants';
import { TempMultiSelectFix } from '@data-exploration-app/containers/elements';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import {
  useAssetFilters,
  useFilterEmptyState,
  useResetAssetFilters,
} from '@data-exploration-app/store/filter';
import { useTranslation } from '@data-exploration-lib/core';
import {
  transformNewFilterToOldFilter,
  useAssetsMetadataKeysAggregateQuery,
  useAssetsMetadataValuesAggregateQuery,
  useAssetsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

export const AssetFilters = ({ ...rest }) => {
  const { t } = useTranslation();
  const [assetFilters, setAssetFilters] = useAssetFilters();
  const resetAssetFilters = useResetAssetFilters();
  const isFiltersEmpty = useFilterEmptyState('asset');

  const { data: items = [] } = useList<any>('assets', {
    filter: transformNewFilterToOldFilter(assetFilters),
    limit: 1000,
  });

  const { data: sources = [] } = useAssetsUniqueValuesByProperty({
    property: 'source',
  });

  const { data: metadataKeys = [] } = useAssetsMetadataKeysAggregateQuery();

  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();

  const mappedSources = sources.reduce(
    (list: { source: string }[], current: any) => {
      return [...list, { source: current.value }];
    },
    []
  );

  return (
    <BaseFilterCollapse.Panel
      title={t('ASSETS', 'Assets')}
      hideResetButton={isFiltersEmpty}
      infoContent={t('SPECIFIC_INFO_CONTENT', SPECIFIC_INFO_CONTENT)}
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
          items={mappedSources}
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
          useAggregateMetadataValues={(metadataKey) =>
            // eslint-disable-next-line react-hooks/rules-of-hooks
            useAssetsMetadataValuesAggregateQuery({ metadataKey })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
