import React from 'react';

// import {
//   useAssetFilters,
//   useFilterEmptyState,
//   useResetAssetFilters,
// } from '@data-exploration-app/store/filter';

import { BaseFilterCollapse } from '../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import styled from 'styled-components';
import { ResourceType } from '@cognite/data-exploration';

import { AssetFilters } from './Asset/AssetFilters';
import { EventFilters } from './Event/EventFilters';
import { CommonFilter } from './Common/CommonFilter';
import { FileFilters } from './File/FileFilters';
import { TimeseriesFilters } from './Timeseries/TimeseriesFilters';
import { SequenceFilters } from './Sequence/SequenceFilters';
import { DocumentFilter } from '@data-exploration-app/containers/Document/DocumentFilters';
// import { FilterState } from '@data-exploration-lib/core';
// import { AssetFilters as AssetSearchFilters } from '@data-exploration/containers';

export interface Props {
  resourceType?: ResourceType;
  enableAdvancedFilters?: boolean;
}

export const Filters: React.FC<Props> = ({
  resourceType,
  enableAdvancedFilters,
}) => {
  // const [assetFilters, setAssetFilters] = useAssetFilters();
  // const [assetFilters, setAssetFilters] = useState<FilterState>({
  //   common: {},
  //   asset: {},
  //   timeseries: {},
  //   sequence: {},
  //   file: {},
  //   event: {},
  //   document: {},
  // } as FilterState);
  // const resetAssetFilters = useResetAssetFilters();
  // const isFiltersEmpty = useFilterEmptyState('asset');

  const renderCustomResourceTypeFilter = () => {
    switch (resourceType) {
      case 'asset': {
        return (
          // <AssetSearchFilters
          //   filter={assetFilters}
          //   onFilterChange={(resoureceType, filter) =>
          //     setAssetFilters(filter as FilterState)
          //   }
          //   onResetFilterClick={resetAssetFilters}
          // />
          <AssetFilters />
        );
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
