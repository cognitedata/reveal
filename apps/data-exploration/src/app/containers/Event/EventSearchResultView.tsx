import { EventSearchResults } from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { getSelectedResourceId } from '@data-exploration-lib/core';

import {
  useGetJourney,
  useJourneyLength,
  usePushJourney,
  useBreakJourneyPromptState,
} from '../../hooks';
import { useQueryString } from '../../hooks/hooks';
import { useEventsFilters } from '../../store';
import { SEARCH_KEY } from '../../utils/constants';
import { SearchResultWrapper, StyledSplitter } from '../elements';

export const EventSearchResultView = () => {
  const [eventFilter, setEventFilter] = useEventsFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();

  // Here we need to parse params to find selected event's id.
  const selectedEventId = getSelectedResourceId('event', firstJourney);

  const selectedRow = selectedEventId ? { [selectedEventId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (journeyLength > 1) {
      // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
      setPromptOpen(true, { id: item.id, type: 'event' });
    } else {
      pushJourney({ ...item, type: 'event' }, true);
    }
  };

  const handleDirectAssetClick = (directAsset: Asset) => {
    pushJourney({ id: directAsset.id, type: 'asset' });
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
    </StyledSplitter>
  );
};
