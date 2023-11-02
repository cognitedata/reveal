import { PreviewFilterDropdown } from '@data-exploration/components';

import { InternalTimeseriesFilters } from '@data-exploration-lib/core';

import { DateFilter, MetadataFilter, UnitFilter } from '../../../Filters';

interface Props {
  filter: InternalTimeseriesFilters;
  onFilterChange: (newValue: InternalTimeseriesFilters) => void;
}

export const TimeseriesTableFilters = ({ filter, onFilterChange }: Props) => {
  return (
    <PreviewFilterDropdown>
      <UnitFilter.Timeseries
        filter={filter}
        value={filter.unit}
        onChange={(newUnit) => onFilterChange({ unit: newUnit })}
        menuPortalTarget={document.body}
      />
      <DateFilter.Updated
        value={filter.lastUpdatedTime}
        onChange={(newValue) =>
          onFilterChange({
            lastUpdatedTime: newValue || undefined,
          })
        }
        menuPortalTarget={document.body}
      />
      <MetadataFilter.Timeseries
        filter={filter}
        values={filter.metadata}
        onChange={(newMetadata) => {
          onFilterChange({ metadata: newMetadata });
        }}
      />
    </PreviewFilterDropdown>
  );
};
