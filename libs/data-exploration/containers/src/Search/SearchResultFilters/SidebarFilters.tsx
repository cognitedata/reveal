import React from 'react';

import styled from 'styled-components';

import { BaseFilterCollapse } from '@data-exploration/components';

import { FilterProps, ResourceType } from '@data-exploration-lib/core';
import { usePrefetchAllLabelsQuery } from '@data-exploration-lib/domain-layer';

import { ChartsFilters } from '../../ResourceSelector';
import { OldFileFilters as OldFilesFilter } from '../../Temp/';

import { AssetFilters } from './AssetFilters';
import { CommonFilters } from './CommonFilters';
import { EventFilters } from './EventFilters';
import { FileFilters } from './FileFilters';
import { SequenceFilters } from './SequenceFilters';
import { TimeseriesFilters } from './TimeseriesFilters';

interface Props extends FilterProps {
  resourceType?: ResourceType;
  enableDocumentLabelsFilter?: boolean;
  isDocumentsApiEnabled?: boolean;
}

export const SidebarFilters: React.FC<Props> = ({
  enableDocumentLabelsFilter,
  resourceType,
  onFilterChange,
  filter,
  onResetFilterClick,
  query,
  isDocumentsApiEnabled = true,
}) => {
  usePrefetchAllLabelsQuery();

  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'charts': {
        return (
          <ChartsFilters
            query={query}
            filter={filter}
            onFilterChange={onFilterChange}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }
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
        if (isDocumentsApiEnabled) {
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

        return (
          <OldFilesFilter
            filter={filter.file}
            setFilter={(newFilter) => onFilterChange('file', newFilter)}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }

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

  if (resourceType === 'charts') {
    return (
      <Container>
        <BaseFilterCollapse>
          {renderCustomResourceTypeFilter()}
        </BaseFilterCollapse>
      </Container>
    );
  }

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
