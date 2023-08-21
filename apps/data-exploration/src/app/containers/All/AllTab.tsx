import styled from 'styled-components';

import noop from 'lodash/noop';

import {
  SequenceSummary,
  AssetSummary,
  TimeseriesSummary,
  DocumentSummary,
  FileSummary,
  EventSummary,
  ResourceType,
  ResourceTypes,
} from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { SearchResultWrapper } from '@data-exploration-app/containers/elements';
import { useQueryString } from '@data-exploration-app/hooks/hooks';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import {
  InternalAssetFilters,
  InternalCommonFilters,
  InternalDocumentFilter,
  InternalEventsFilters,
  InternalFilesFilters,
  InternalSequenceFilters,
  InternalTimeseriesFilters,
} from '@data-exploration-lib/core';

import {
  useJourneyLength,
  usePushJourney,
  useFlagAdvancedFilters,
  useFlagDocumentsApiEnabled,
  useBreakJourneyPromptState,
} from '../../hooks';

export type Filters = {
  common?: InternalCommonFilters;
  asset?: InternalAssetFilters;
  timeSeries?: InternalTimeseriesFilters;
  sequence?: InternalSequenceFilters;
  file?: InternalFilesFilters;
  event?: InternalEventsFilters;
  document?: InternalDocumentFilter;
};

type Props = {
  filters?: Filters;
  setCurrentResourceType?: (
    type?: ResourceType | undefined,
    resourceId?: number | undefined
  ) => void;
  showAllResultsWithEmptyFilters?: boolean;
  selectedResourceExternalId?: string; // use for get relationships of selected assets
  resourceAnnotationList?: Record<ResourceType, number[]>;
};

export const AllTab = ({
  filters = {},
  setCurrentResourceType = noop,
  showAllResultsWithEmptyFilters = false,
  selectedResourceExternalId,
  resourceAnnotationList = {
    asset: [],
    event: [],
    file: [],
    sequence: [],
    threeD: [],
    timeSeries: [],
  },
}: Props) => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();
  const [query] = useQueryString(SEARCH_KEY);
  const [pushJourney] = usePushJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();

  const handleAllResultsClick = (type: ResourceType) => {
    trackUsage(EXPLORATION.CLICK.ALL_RESULTS, { resourceType: type });
    setCurrentResourceType(type);
  };

  // We use the same function for both root asset and direct asset click.
  // TODO: for journey?
  const handleParentAssetClick = (rootAsset: Asset) => {
    if (journeyLength > 1) {
      // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
      setPromptOpen(true, { id: rootAsset.id, type: 'asset' });
    } else {
      pushJourney({ id: rootAsset.id, type: 'asset' }, true);
    }
  };

  const handleSummaryRowClick = (rowType: ResourceType, id: number) => {
    if (journeyLength > 1) {
      // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
      setPromptOpen(true, { id, type: rowType });
    } else {
      pushJourney({ id, type: rowType }, true);
    }
  };

  return (
    <SearchResultWrapper>
      <AllTabContainer>
        <AssetSummary
          showAllResultsWithEmptyFilters={showAllResultsWithEmptyFilters}
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={filters.asset || filters.common}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Asset, row.id)
          }
          onAllResultsClick={() => handleAllResultsClick(ResourceTypes.Asset)}
          selectedResourceExternalId={selectedResourceExternalId}
          annotationIds={resourceAnnotationList['asset']}
        />
        <TimeseriesSummary
          showAllResultsWithEmptyFilters={showAllResultsWithEmptyFilters}
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={filters.timeSeries || filters.common}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.TimeSeries, row.id)
          }
          onAllResultsClick={() =>
            handleAllResultsClick(ResourceTypes.TimeSeries)
          }
          onRootAssetClick={(rootAsset) => handleParentAssetClick(rootAsset)}
          selectedResourceExternalId={selectedResourceExternalId}
          annotationIds={resourceAnnotationList['timeSeries']}
        />
        {isDocumentsApiEnabled ? (
          <DocumentSummary
            showAllResultsWithEmptyFilters={showAllResultsWithEmptyFilters}
            filter={filters.document || filters.common}
            query={query}
            onRowClick={(row) =>
              handleSummaryRowClick(ResourceTypes.File, row.id)
            }
            onAllResultsClick={() => handleAllResultsClick(ResourceTypes.File)}
            onRootAssetClick={(rootAsset) => handleParentAssetClick(rootAsset)}
            selectedResourceExternalId={selectedResourceExternalId}
            annotationIds={resourceAnnotationList['file']}
          />
        ) : (
          <FileSummary
            showAllResultsWithEmptyFilters={showAllResultsWithEmptyFilters}
            filter={filters.file || filters.common}
            query={query}
            onRowClick={(row) =>
              handleSummaryRowClick(ResourceTypes.File, row.id)
            }
            onAllResultsClick={() => handleAllResultsClick(ResourceTypes.File)}
            onDirectAssetClick={(directAsset) =>
              handleParentAssetClick(directAsset)
            }
            selectedResourceExternalId={selectedResourceExternalId}
            annotationIds={resourceAnnotationList['file']}
          />
        )}
        <EventSummary
          showAllResultsWithEmptyFilters={showAllResultsWithEmptyFilters}
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={filters.event || filters.common}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Event, row.id)
          }
          onAllResultsClick={() => handleAllResultsClick(ResourceTypes.Event)}
          onDirectAssetClick={(directAsset) =>
            handleParentAssetClick(directAsset)
          }
          selectedResourceExternalId={selectedResourceExternalId}
          annotationIds={resourceAnnotationList['event']}
        />
        <SequenceSummary
          showAllResultsWithEmptyFilters={showAllResultsWithEmptyFilters}
          filter={filters.sequence || filters.common}
          query={query}
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Sequence, row.id)
          }
          onAllResultsClick={() =>
            handleAllResultsClick(ResourceTypes.Sequence)
          }
          onRootAssetClick={(rootAsset) => handleParentAssetClick(rootAsset)}
          selectedResourceExternalId={selectedResourceExternalId}
          annotationIds={resourceAnnotationList['sequence']}
        />
      </AllTabContainer>
    </SearchResultWrapper>
  );
};

const AllTabContainer = styled.div`
  padding: 16px;
  display: grid;
  grid-gap: 16px;
  height: 100%;
  overflow-y: auto;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: max-content;

  & > * {
    min-height: 365px;
    height: 100%;
    min-width: 380px;
    width: 100%;
  }
  & > *:last-child {
    grid-column: 1 / -1;
  }
`;
