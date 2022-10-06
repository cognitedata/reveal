import React from 'react';

import { BaseFilterCollapse } from '../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import { ResetFiltersButton } from '../components/Buttons/ResetFiltersButton';
import styled from 'styled-components';
import { ResourceType } from '@cognite/data-exploration';
import { AssetFilters } from './Asset/AssetFilters';
import { EventFilters } from './Event/EventFilters';
import { CommonFilter } from './Common/CommonFilter';
import { FileFilters } from './File/FileFilters';
import { TimeseriesFilters } from './Timeseries/TimeseriesFilters';
import { SequenceFilters } from './Sequence/SequenceFilters';

export interface Props {
  resourceType: ResourceType;
}

export const Filters: React.FC<Props> = ({ resourceType }) => {
  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return <AssetFilters />;
      }
      case 'event': {
        return <EventFilters />;
      }
      case 'timeSeries': {
        return <TimeseriesFilters />;
      }
      case 'file': {
        return <FileFilters />;
      }
      case 'sequence': {
        return <SequenceFilters />;
      }
      default: {
        return null;
      }
    }
  };

  // This function (and the above) will be greatly simplified with the new filter structure (coming soon)
  const handleClearClick = () => {
    // setSearchFilter('common', {});
  };

  return (
    <Container>
      <BaseFilterCollapse>
        <CommonFilter resourceType={resourceType} />
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
