import { PreviewFilterDropdown } from '@data-exploration/components';

import { InternalSequenceFilters } from '@data-exploration-lib/core';

import { MetadataFilter } from '../../../Filters';

interface Props {
  filter: InternalSequenceFilters;
  onFilterChange: (newValue: InternalSequenceFilters) => void;
}

export const SequenceTableFilters = ({ filter, onFilterChange }: Props) => {
  return (
    <PreviewFilterDropdown>
      <MetadataFilter.Sequences
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};
