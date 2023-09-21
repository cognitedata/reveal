import React from 'react';

import styled from 'styled-components';

import { BaseFilterCollapse } from '@data-exploration/components';

import { FilterSection } from '../../../containers';
import {
  ResourceFilterProps,
  ResourceType,
  SetResourceFilterProps,
} from '../../../types';

import {
  AssetFiltersV2,
  EventFilters,
  SequenceFilters,
  TimeseriesFilters,
} from '.';
import { ResetFiltersButton } from './ResetFiltersButton';

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
  // fileFilter,
  setFileFilter,
  ...rest
}: FilterProps) => {
  // const hasFiltersApplied = assetFilter.
  if (filterSection === FilterSection.AppliedFilters) {
    return <p>Coming soon</p>;
  }

  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return (
          <AssetFiltersV2
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
      // not used anywhere
      // case 'file': {
      //   return <OldFileFilters filter={fileFilter} setFilter={setFileFilter} />;
      // }
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

  // This function (and the above) will be greatly simplified with the new filter structure (coming soon)
  const handleClearClick = () => {
    setAssetFilter({});
    setTimeseriesFilter({});
    setFileFilter({});
    setEventFilter({});
    setSequenceFilter({});
  };

  return (
    <Container>
      <BaseFilterCollapse>
        {/* <CommonFilter
          resourceType={resourceType}
          commonFilter={commonFilter}
          onChange={handleCommonChange}
        /> */}
        {renderCustomResourceTypeFilter()}
      </BaseFilterCollapse>
      <ResetFiltersButton setFilter={handleClearClick} />
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: scroll;
  padding-right: 16px;
`;
