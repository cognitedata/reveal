import { EventSearchResults } from '@data-exploration/containers';
import { Routes, Route } from 'react-router-dom';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { useEventsFilters } from '@data-exploration-app/store';
import { ResourceItem, ResourceTypes } from '@cognite/data-exploration';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDebounce } from 'use-debounce';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { EventPreview } from '@data-exploration-app/containers/Event/EventPreview';
import { routes } from '@data-exploration-app/containers/App';
import { Asset } from '@cognite/sdk';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';

export const EventSearchResultView = () => {
  const [, openPreview] = useCurrentResourceId();
  const [eventFilter, setEventFilter] = useEventsFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  // Here we need to parse params to find selected event's id.
  const selectedEventId = useSelectedResourceId();
  const selectedDirectAssetId = useSelectedResourceId(true);

  const selectedRow = selectedEventId ? { [selectedEventId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id);
  };

  const handleDirectAssetClick = (directAsset: Asset, resourceId?: number) => {
    openPreview(resourceId, false, ResourceTypes.Asset, directAsset.id);
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

      {Boolean(selectedEventId) && (
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
