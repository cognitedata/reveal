import { LabelFilterV2, MetadataFilterV2 } from '@data-exploration/containers';

import { SourceFilter } from '@cognite/data-exploration';
import { useList } from '@cognite/sdk-react-query-hooks';

import { useTranslation } from '@data-exploration-lib/core';
import {
  transformNewFilterToOldFilter,
  useAssetsMetadataKeysAggregateQuery,
  useAssetsMetadataValuesAggregateQuery,
  useAssetsUniqueValuesByProperty,
} from '@data-exploration-lib/domain-layer';

import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { useFlagAdvancedFilters } from '../../hooks';
import {
  useAssetFilters,
  useFilterEmptyState,
  useResetAssetFilters,
} from '../../store';
import { SPECIFIC_INFO_CONTENT } from '../constants';
import { TempMultiSelectFix } from '../elements';

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
