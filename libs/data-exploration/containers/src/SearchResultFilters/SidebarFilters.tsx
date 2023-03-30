import React from 'react';

import styled from 'styled-components';

import { BaseFilterCollapse } from '@data-exploration/components';
import { FilterProps, ResourceType } from '@data-exploration-lib/core';
import { AssetFilters } from './AssetFilters';
import { EventFilters } from './EventFilters';
import { TimeseriesFilters } from './TimeseriesFilters';
import { FileFilters } from './FileFilters';
import { CommonFilters } from './CommonFilters';
import { SequenceFilters } from './SequenceFilters';

export interface Props extends FilterProps {
  resourceType?: ResourceType;
}

export const SidebarFilters: React.FC<Props> = ({
  resourceType,
  onFilterChange,
  filter,
  onResetFilterClick,
}) => {
  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return (
          <AssetFilters
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      case 'event': {
        return (
          <EventFilters
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      case 'timeSeries': {
        return (
          <TimeseriesFilters
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      case 'file': {
        return (
          <FileFilters
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      //   return (
      //     <DocumentFilter
      //       filter={filter}
      //       onFilterChange={onFilterChange}
      //       onResetFilterClick={onResetFilterClick}
      //     />
      //   );
      // }
      case 'sequence': {
        return (
          <SequenceFilters
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Container>
      <BaseFilterCollapse>
        <CommonFilters
          filter={filter}
          onFilterChange={onFilterChange}
          onResetFilterClick={onResetFilterClick}
        />
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
