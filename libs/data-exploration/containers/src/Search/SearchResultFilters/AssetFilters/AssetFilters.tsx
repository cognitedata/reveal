import { BaseFilterCollapse } from '@data-exploration/components'; //??

import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
  useTranslation,
} from '@data-exploration-lib/core';

import { LabelFilter, MetadataFilter, SourceFilter } from '../../../Filters';
import { TempMultiSelectFix } from '../elements';

export const AssetFilters: React.FC<FilterProps> = ({
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const { t } = useTranslation();

  const assetFilter = filter.asset;
  const isResetButtonVisible = hasObjectAnyProperty(assetFilter, [
    'labels',
    'sources',
    'metadata',
  ]);

  return (
    <BaseFilterCollapse.Panel
      title={t('ASSETS', 'Assets')}
      hideResetButton={!isResetButtonVisible}
      infoContent={t('SPECIFIC_INFO_CONTENT', SPECIFIC_INFO_CONTENT)}
      onResetClick={() => onResetFilterClick('asset')}
      {...rest}
    >
      <TempMultiSelectFix>
        <LabelFilter.Asset
          query={query}
          filter={assetFilter}
          value={assetFilter.labels}
          onChange={(newFilters) =>
            onFilterChange('asset', { labels: newFilters })
          }
          addNilOption
        />

        <SourceFilter.Asset
          query={query}
          filter={assetFilter}
          value={assetFilter.sources}
          onChange={(newSources) =>
            onFilterChange('asset', {
              sources: newSources,
            })
          }
        />

        <MetadataFilter.Assets
          query={query}
          filter={assetFilter}
          values={assetFilter.metadata}
          onChange={(newMetadata) => {
            onFilterChange('asset', {
              metadata: newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
