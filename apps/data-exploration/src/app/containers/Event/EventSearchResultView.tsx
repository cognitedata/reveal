import { Routes, Route } from 'react-router-dom';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { EventSearchResults } from '@data-exploration-components/containers';
import { useEventsFilters } from '@data-exploration-app/store';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { ResourceItem } from '@cognite/data-exploration';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDebounce } from 'use-debounce';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { EventPreview } from '@data-exploration-app/containers/Event/EventPreview';
import { routes } from '@data-exploration-app/containers/App';

export const EventSearchResultView = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const [, openPreview] = useCurrentResourceId();
  const [eventFilter, setEventFilter] = useEventsFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  // Here we need to parse params to find selected event's id.
  const selectedEventId = useSelectedResourceId();

  const selectedRow = selectedEventId ? { [selectedEventId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id !== selectedEventId ? item.id : undefined);
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
          enableAdvancedFilters={isAdvancedFiltersEnabled}
          onClick={handleRowClick}
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
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
