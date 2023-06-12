import { Routes, Route } from 'react-router-dom';

import { SequenceSearchResults } from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem, ResourceTypes } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { routes } from '@data-exploration-app/containers/App';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { SequencePreview } from '@data-exploration-app/containers/Sequence/SequencePreview';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useSequenceFilters } from '@data-exploration-app/store';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { getSelectedResourceId } from '@data-exploration-lib/core';

import {
  useBreakJourneyPromptToggle,
  useGetJourney,
  useJourneyLength,
  usePushJourney,
} from '../../hooks/detailsNavigation';
import { useFlagOverlayNavigation } from '../../hooks/flags';

export const SequenceSearchResultView = () => {
  const [, openPreview] = useCurrentResourceId();
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const isDetailsOverlayEnabled = useFlagOverlayNavigation();
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptToggle();

  // Here we need to parse params to find selected sequence's id.
  const selectedSequenceId = getSelectedResourceId('sequence', firstJourney);
  const selectedRootAssetId = useSelectedResourceId(true);

  const selectedRow = selectedSequenceId ? { [selectedSequenceId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (isDetailsOverlayEnabled) {
      if (journeyLength > 1) {
        // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
        setPromptOpen(true, { id: item.id, type: 'sequence' });
      } else {
        pushJourney({ ...item, type: 'sequence' }, true);
      }
    } else {
      openPreview(item.id);
    }
  };

  const handleRootAssetClick = (rootAsset: Asset, resourceId?: number) => {
    if (isDetailsOverlayEnabled) {
      pushJourney({ id: rootAsset.id, type: 'asset' });
    } else {
      openPreview(resourceId, false, ResourceTypes.Asset, rootAsset.id);
    }
  };

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        <SequenceSearchResults
          showCount
          selectedRow={selectedRow}
          onClick={handleRowClick}
          onRootAssetClick={handleRootAssetClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setSequenceFilter(newValue)
          }
          filter={sequenceFilter}
          query={debouncedQuery}
        />
      </SearchResultWrapper>

      {!isDetailsOverlayEnabled && Boolean(selectedSequenceId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={<SequencePreview sequenceId={selectedSequenceId!} />}
            />
            <Route
              path={routes.viewDetailTab.path}
              element={<SequencePreview sequenceId={selectedSequenceId!} />}
            />
            <Route
              path={routes.viewAssetDetail.path}
              element={<AssetPreview assetId={selectedRootAssetId!} />}
            />
            <Route
              path={routes.viewAssetDetailTab.path}
              element={<AssetPreview assetId={selectedRootAssetId!} />}
            />
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
