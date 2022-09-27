import React from 'react';

import {
  AssetFilters,
  EventFilters,
  FileFilters,
  SequenceFilters,
  TimeseriesFilters,
} from '.';

import {
  ResourceType,
  ResourceFilterProps,
  SetResourceFilterProps,
} from 'types';
import { FilterSection } from 'containers/SearchResults/SearchFiltersNew';
import { BaseFilterCollapse } from './BaseFilterCollapse/BaseFilterCollapse';
import { CommonFilter } from './CommonFilter/CommonFilter';

export type FilterProps = Required<ResourceFilterProps> &
  SetResourceFilterProps & {
    resourceType: ResourceType;
    filterSection: FilterSection;
  };

export const Filters = ({
  filterSection,
  resourceType,
  assetFilter,
  setAssetFilter,
  timeseriesFilter,
  setTimeseriesFilter,
  sequenceFilter,
  setSequenceFilter,
  eventFilter,
  setEventFilter,
  fileFilter,
  setFileFilter,
  ...rest
}: FilterProps) => {
  // const hasFiltersApplied = assetFilter.
  if (filterSection === FilterSection.AppliedFilters) {
    return <p>Coming soon</p>;
  }

  const renderFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return (
          <AssetFilters
            filter={assetFilter}
            setFilter={setAssetFilter}
            {...rest}
          />
        );
      }
      case 'event': {
        return <EventFilters filter={eventFilter} setFilter={setEventFilter} />;
      }
      case 'timeSeries': {
        return (
          <TimeseriesFilters
            filter={timeseriesFilter}
            setFilter={setTimeseriesFilter}
          />
        );
      }
      case 'file': {
        return <FileFilters filter={fileFilter} setFilter={setFileFilter} />;
      }
      case 'sequence': {
        return (
          <SequenceFilters
            filter={sequenceFilter}
            setFilter={setSequenceFilter}
          />
        );
      }

      default: {
        return null;
      }
    }
  };

  return (
    <BaseFilterCollapse>
      <CommonFilter />
      {renderFilter()}
    </BaseFilterCollapse>
  );
};
