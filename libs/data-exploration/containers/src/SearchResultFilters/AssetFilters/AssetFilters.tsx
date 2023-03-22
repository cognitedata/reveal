import {
  FilterProps,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import { LabelFilter, SourceFilter } from '../../../src/Filters';

export const AssetFilters: React.FC<FilterProps> = ({
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
          value={filter.asset.labels}
          onChange={(newFilters) =>
            onFilterChange('asset', { labels: newFilters })
          }
          addNilOption
        />

        <SourceFilter.Asset
          value={filter.asset.sources}
          onChange={(newSources) =>
            onFilterChange('asset', {
              sources: newSources,
            })
          }
        />

        {/* ///////////////// */}
        {/* <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={filter.asset.metadata}
          setValue={(newMetadata) =>
            onFilterChange('asset', {
              metadata: newMetadata,
            })
          }
          useAggregateMetadataValues={useAssetsMetadataValuesAggregateQuery}
        /> */}
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
