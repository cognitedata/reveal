import React from 'react';

import { BaseFilterCollapse } from '../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { CommonFilterFacets } from '../components/Filters/types';
import { ResetFiltersButton } from '../components/Buttons/ResetFiltersButton';
import styled from 'styled-components';
import {
  ResourceFilterProps,
  ResourceType,
  SetResourceFilterProps,
} from '@cognite/data-exploration';
import { AssetFilters } from './Asset/AssetFilters';
import { EventFilters } from './Event/EventFilters';
import { TimeseriesFilters } from './Timeseries/TimeseriesFilters';
import { FileFilters } from './File/FileFilters';
import { SequenceFilters } from './Sequence/SequenceFilters';
import { CommonFilter } from './Common/CommonFilter';
// import { useFilterDispatch, useFilterState } from 'providers';

export type FilterProps = Required<ResourceFilterProps> &
  SetResourceFilterProps & {
    resourceType: ResourceType;
  };

export const Filters = ({
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
  const renderCustomResourceTypeFilter = () => {
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

  const handleCommonChange = (_updatingValue: CommonFilterFacets) => {
    // setSearchFilter('common', updatingValue);
    // setAssetFilter(prevState => ({ ...prevState, ...updatingValue }));
    // setTimeseriesFilter(prevState => ({ ...prevState, ...updatingValue }));
    // setFileFilter(prevState => ({ ...prevState, ...updatingValue }));
    // setEventFilter(prevState => ({ ...prevState, ...updatingValue }));
    // setSequenceFilter(prevState => ({ ...prevState, ...updatingValue }));
    // setCommonFilter(prevFilter => ({ ...prevFilter, ...updatingValue }));
  };

  // This function (and the above) will be greatly simplified with the new filter structure (coming soon)
  const handleClearClick = () => {
    // setSearchFilter('common', {});
  };

  return (
    <Container>
      <BaseFilterCollapse>
        <CommonFilter
          resourceType={resourceType}
          commonFilter={{}}
          onChange={handleCommonChange}
        />
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
