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
        menuPortalTarget={document.body}
      />
      <TypeFilter.Event
        filter={filter}
        value={filter.type}
        onChange={(newFilters) => onFilterChange({ type: newFilters })}
        menuPortalTarget={document.body}
      />
      <SubTypeFilter.Event
        filter={filter}
        value={filter.subtype}
        onChange={(newFilters) => onFilterChange({ subtype: newFilters })}
        menuPortalTarget={document.body}
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
