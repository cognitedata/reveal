import React from 'react';

import styled from 'styled-components';

import { ResourceType } from '@cognite/data-exploration';

import { BaseFilterCollapse } from '../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

import { AssetFilters } from './Asset/AssetFilters';
import { CommonFilter } from './Common/CommonFilter';
import { DocumentFilter } from './Document/DocumentFilters';
import { EventFilters } from './Event/EventFilters';
import { FileFilters } from './File/FileFilters';
import { SequenceFilters } from './Sequence/SequenceFilters';
import { TimeseriesFilters } from './Timeseries/TimeseriesFilters';

export interface Props {
  resourceType?: ResourceType;
  enableAdvancedFilters?: boolean;
}

export const Filters: React.FC<Props> = ({
  resourceType,
  enableAdvancedFilters,
}) => {
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
        if (enableAdvancedFilters) {
          return <DocumentFilter />;
        }
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

  return (
    <Container>
      <BaseFilterCollapse>
        <CommonFilter resourceType={resourceType} />
        {renderCustomResourceTypeFilter()}
      </BaseFilterCollapse>
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
  display: flex;
  padding: 8px 0;
  flex-direction: column;
  overflow-y: auto;
`;
