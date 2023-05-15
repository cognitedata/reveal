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

interface Props extends FilterProps {
  resourceType?: ResourceType;
  enableDocumentLabelsFilter?: boolean;
}

export const SidebarFilters: React.FC<Props> = ({
  enableDocumentLabelsFilter,
  resourceType,
  onFilterChange,
  filter,
  onResetFilterClick,
  query,
}) => {
  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return (
          <AssetFilters
            query={query}
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      case 'event': {
        return (
          <EventFilters
            query={query}
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      case 'timeSeries': {
        return (
          <TimeseriesFilters
            query={query}
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
      case 'file': {
        return (
          <FileFilters
            query={query}
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
            enableDocumentLabelsFilter={enableDocumentLabelsFilter}
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
            query={query}
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
          query={query}
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
