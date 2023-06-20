import { Routes, Route } from 'react-router-dom';

import { EventSearchResults } from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem, ResourceTypes } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { routes } from '@data-exploration-app/containers/App';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { EventPreview } from '@data-exploration-app/containers/Event/EventPreview';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useEventsFilters } from '@data-exploration-app/store';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { getSelectedResourceId } from '@data-exploration-lib/core';

import {
  useFlagOverlayNavigation,
  useGetJourney,
  useJourneyLength,
  usePushJourney,
  useBreakJourneyPromptState,
} from '../../hooks';

export const EventSearchResultView = () => {
  const [, openPreview] = useCurrentResourceId();
  const [eventFilter, setEventFilter] = useEventsFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const isDetailsOverlayEnabled = useFlagOverlayNavigation();
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();

  // Here we need to parse params to find selected event's id.
  const selectedEventId = getSelectedResourceId('event', firstJourney);
  // TODO: This part will be unnecessary as well when we delete `Routes` that is wrapping `EventPreview`s.
  const selectedDirectAssetId = useSelectedResourceId(true);

  const selectedRow = selectedEventId ? { [selectedEventId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (isDetailsOverlayEnabled) {
      if (journeyLength > 1) {
        // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
        setPromptOpen(true, { id: item.id, type: 'event' });
      } else {
        pushJourney({ ...item, type: 'event' }, true);
      }
    } else {
      openPreview(item.id);
    }
  };

  const handleDirectAssetClick = (directAsset: Asset, resourceId?: number) => {
    if (isDetailsOverlayEnabled) {
      pushJourney({ id: directAsset.id, type: 'asset' });
    } else {
      openPreview(resourceId, false, ResourceTypes.Asset, directAsset.id);
    }
  };

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        <EventSearchResults
          showCount
          selectedRow={selectedRow}
          onClick={handleRowClick}
          onDirectAssetClick={handleDirectAssetClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setEventFilter(newValue)
          }
          filter={eventFilter}
          query={debouncedQuery}
        />
      </SearchResultWrapper>

      {!isDetailsOverlayEnabled && Boolean(selectedEventId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={<EventPreview eventId={selectedEventId!} />}
            />
            <Route
              path={routes.viewDetailTab.path}
              element={<EventPreview eventId={selectedEventId!} />}
            />
            <Route
              path={routes.viewAssetDetail.path}
              element={<AssetPreview assetId={selectedDirectAssetId!} />}
            />
            <Route
              path={routes.viewAssetDetailTab.path}
              element={<AssetPreview assetId={selectedDirectAssetId!} />}
            />
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
