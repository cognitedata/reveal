import { PreviewFilterDropdown } from '@data-exploration/components';

import { InternalEventsFilters } from '@data-exploration-lib/core';

import {
  MetadataFilter,
  SourceFilter,
  SubTypeFilter,
  TypeFilter,
} from '../../../Filters';

interface Props {
  filter: InternalEventsFilters;
  onFilterChange: (newValue: InternalEventsFilters) => void;
}

export const EventTableFilters = ({ filter, onFilterChange }: Props) => {
  return (
    <PreviewFilterDropdown>
      <SourceFilter.Event
        filter={filter}
        value={filter.sources}
        onChange={(newSources) =>
          onFilterChange({
            sources: newSources,
          })
        }
      />
      <TypeFilter.Event
        filter={filter}
        value={filter.type}
        onChange={(newFilters) => onFilterChange({ type: newFilters })}
      />
      <SubTypeFilter.Event
        filter={filter}
        value={filter.subtype}
        onChange={(newFilters) => onFilterChange({ subtype: newFilters })}
      />
      <MetadataFilter.Events
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};
