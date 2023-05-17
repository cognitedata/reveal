import {
  FilterProps,
  SPECIFIC_INFO_CONTENT,
  hasObjectAnyProperty,
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
  const sequenceFIlter = filter.sequence;
  const isResetButtonVisible = hasObjectAnyProperty(sequenceFIlter, [
    'metadata',
  ]);
  return (
    <BaseFilterCollapse.Panel
      title="Sequences"
      hideResetButton={!isResetButtonVisible}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('sequence')}
      {...rest}
    >
      <TempMultiSelectFix>
        <MetadataFilter.Sequences
          query={query}
          filter={sequenceFIlter}
          values={sequenceFIlter.metadata}
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
