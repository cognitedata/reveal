import {
  AssetSearchResults,
  AssetViewMode,
} from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { getSelectedResourceId } from '@data-exploration-lib/core';

import { EXPLORATION } from '../../constants/metrics';
import {
  useGetJourney,
  useJourneyLength,
  usePushJourney,
  useBreakJourneyPromptState,
} from '../../hooks';
import { useQueryString } from '../../hooks/hooks';
import { useAssetFilters, useAssetViewState } from '../../store';
import { SEARCH_KEY } from '../../utils/constants';
import { trackUsage } from '../../utils/Metrics';
import { SearchResultWrapper, StyledSplitter } from '../elements';

export const AssetSearchResultView = () => {
  const [assetView, setAssetView] = useAssetViewState();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [assetFilter, setAssetFilter] = useAssetFilters();
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();

  // Here we need to parse params to find selected asset's id.
  const selectedAssetId = getSelectedResourceId('asset', firstJourney);

  const handleViewChange = (nextView: AssetViewMode) => {
    setAssetView(nextView);
    trackUsage(EXPLORATION.CLICK.TOGGLE_ASSET_TABLE_VIEW, { view: nextView });
  };

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (journeyLength > 1) {
      // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
      setPromptOpen(true, { id: item.id, type: 'asset' });
    } else {
      pushJourney({ id: item.id, type: 'asset' }, true);
    }
  };

  const handleShowAllAssetsClick = (item: Asset) => {
    if (item.parentId) {
      if (journeyLength > 1) {
        // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
        setPromptOpen(true, {
          id: item.parentId,
          type: 'asset',
          selectedTab: 'children',
        });
      } else {
        pushJourney(
          { id: item.parentId, type: 'asset', selectedTab: 'children' },
          true
        );
      }
    }
  };

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        <AssetSearchResults
          isTreeEnabled
          showCount
          view={assetView}
          onViewChange={handleViewChange}
          filter={assetFilter}
          onClick={handleRowClick}
          onShowAllAssetsClick={handleShowAllAssetsClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setAssetFilter(newValue)
          }
          query={debouncedQuery}
          activeIds={selectedAssetId ? [selectedAssetId] : []}
        />
      </SearchResultWrapper>
    </StyledSplitter>
  );
};
