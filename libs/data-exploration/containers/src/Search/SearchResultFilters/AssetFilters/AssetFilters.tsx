import {
  FilterProps,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import { LabelFilter, MetadataFilter, SourceFilter } from '../../../Filters';

export const AssetFilters: React.FC<FilterProps> = ({
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel
      title="Assets"
      hideResetButton={isObjectEmpty(filter.asset as any)}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('asset')}
      {...rest}
    >
      <TempMultiSelectFix>
        <LabelFilter.Asset
          query={query}
          filter={filter.asset}
          value={filter.asset.labels}
          onChange={(newFilters) =>
            onFilterChange('asset', { labels: newFilters })
          }
          addNilOption
        />

        <SourceFilter.Asset
          query={query}
          filter={filter.asset}
          value={filter.asset.sources}
          onChange={(newSources) =>
            onFilterChange('asset', {
              sources: newSources,
            })
          }
        />

        <MetadataFilter.Assets
          query={query}
          filter={filter.asset}
          values={filter.asset.metadata}
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
