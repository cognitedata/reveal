import {
  FilterProps,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import { AuthorFilter, SourceFilter, TypeFilter } from '../../../src/Filters';

// INFO: FileFilters is for documents.
export const FileFilters: React.FC<FilterProps> = ({
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel
      title="Files"
      hideResetButton={isObjectEmpty(filter.document as any)}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('document')}
      {...rest}
    >
      <TempMultiSelectFix>
        <TypeFilter.File
          value={filter.document.type}
          onChange={(newFilters) =>
            onFilterChange('document', { type: newFilters })
          }
        />

        <AuthorFilter.File
          value={filter.document.author}
          onChange={(newFilters) =>
            onFilterChange('document', { author: newFilters })
          }
        />

        <SourceFilter.File
          value={filter.document.source}
          onChange={(newSources) =>
            onFilterChange('document', {
              source: newSources,
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
