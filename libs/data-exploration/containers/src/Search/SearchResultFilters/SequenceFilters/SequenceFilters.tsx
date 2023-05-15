import {
  FilterProps,
  isObjectEmpty,
  SPECIFIC_INFO_CONTENT,
} from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import { MetadataFilter } from '../../../Filters';

// INFO: FileFilters is for documents.
export const SequenceFilters: React.FC<FilterProps> = ({
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  return (
    <BaseFilterCollapse.Panel
      title="Sequences"
      hideResetButton={isObjectEmpty(filter.sequence as any)}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('sequence')}
      {...rest}
    >
      <TempMultiSelectFix>
        <MetadataFilter.Sequences
          query={query}
          filter={filter.sequence}
          values={filter.sequence.metadata}
          onChange={(newMetadata) => {
            onFilterChange('sequence', {
              metadata: newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
