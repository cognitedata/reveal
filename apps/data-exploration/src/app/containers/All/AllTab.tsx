import styled from 'styled-components';

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
import {
  useCurrentResourceType,
  useQueryString,
} from '@data-exploration-app/hooks/hooks';
import { useCommonFilters } from '@data-exploration-app/store';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { trackUsage } from '@data-exploration-app/utils/Metrics';

import {
  useJourneyLength,
  usePushJourney,
  useFlagAdvancedFilters,
  useFlagDocumentsApiEnabled,
  useBreakJourneyPromptState,
} from '../../hooks';

export const AllTab = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();
  const [commonFilters] = useCommonFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [_, setCurrentResourceType] = useCurrentResourceType();
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
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={commonFilters}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Asset, row.id)
          }
          onAllResultsClick={() => handleAllResultsClick(ResourceTypes.Asset)}
        />
        <TimeseriesSummary
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={commonFilters}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.TimeSeries, row.id)
          }
          onAllResultsClick={() =>
            handleAllResultsClick(ResourceTypes.TimeSeries)
          }
          onRootAssetClick={(rootAsset) => handleParentAssetClick(rootAsset)}
        />
        {isDocumentsApiEnabled ? (
          <DocumentSummary
            filter={commonFilters}
            query={query}
            onRowClick={(row) =>
              handleSummaryRowClick(ResourceTypes.File, row.id)
            }
            onAllResultsClick={() => handleAllResultsClick(ResourceTypes.File)}
            onRootAssetClick={(rootAsset) => handleParentAssetClick(rootAsset)}
          />
        ) : (
          <FileSummary
            filter={commonFilters}
            query={query}
            onRowClick={(row) =>
              handleSummaryRowClick(ResourceTypes.File, row.id)
            }
            onAllResultsClick={() => handleAllResultsClick(ResourceTypes.File)}
            onDirectAssetClick={(directAsset) =>
              handleParentAssetClick(directAsset)
            }
          />
        )}
        <EventSummary
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={commonFilters}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Event, row.id)
          }
          onAllResultsClick={() => handleAllResultsClick(ResourceTypes.Event)}
          onDirectAssetClick={(directAsset) =>
            handleParentAssetClick(directAsset)
          }
        />
        <SequenceSummary
          filter={commonFilters}
          query={query}
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Sequence, row.id)
          }
          onAllResultsClick={() =>
            handleAllResultsClick(ResourceTypes.Sequence)
          }
          onRootAssetClick={(rootAsset) => handleParentAssetClick(rootAsset)}
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
