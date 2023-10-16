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
  isDocumentsApiEnabled = true,
  ...commonProps
}) => {
  usePrefetchAllLabelsQuery();

  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'charts': {
        return <ChartsFilters {...commonProps} />;
      }
      case 'asset': {
        return <AssetFilters {...commonProps} />;
      }
      case 'event': {
        return <EventFilters {...commonProps} />;
      }
      case 'timeSeries': {
        return <TimeseriesFilters {...commonProps} />;
      }
      case 'file': {
        if (isDocumentsApiEnabled) {
          return (
            <FileFilters
              {...commonProps}
              enableDocumentLabelsFilter={enableDocumentLabelsFilter}
            />
          );
        }

        const { filter, onFilterChange, onResetFilterClick } = commonProps;

        return (
          <OldFilesFilter
            filter={filter.file}
            setFilter={(newFilter) => onFilterChange('file', newFilter)}
            onResetFilterClick={onResetFilterClick}
          />
        );
      }

      case 'sequence': {
        return <SequenceFilters {...commonProps} />;
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
        <CommonFilters {...commonProps} />
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
