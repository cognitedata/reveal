import { TimeseriesSearchResults } from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk/dist/src/types';

import { getSelectedResourceId } from '@data-exploration-lib/core';

import {
  useGetJourney,
  useJourneyLength,
  usePushJourney,
  useBreakJourneyPromptState,
  useDateRange,
} from '../../hooks';
import { useQueryString } from '../../hooks/hooks';
import { useTimeseriesFilters } from '../../store';
import { SEARCH_KEY } from '../../utils/constants';
import { SearchResultWrapper, StyledSplitter } from '../elements';

export const TimeseriesSearchResultView = () => {
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();

  // Here we need to parse params to find selected timeseries' id.
  const selectedTimeseriesId = getSelectedResourceId(
    'timeSeries',
    firstJourney
  );

  const selectedRow = selectedTimeseriesId
    ? { [selectedTimeseriesId]: true }
    : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (journeyLength > 1) {
      // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
      setPromptOpen(true, { id: item.id, type: 'timeSeries' });
    } else {
      pushJourney({ ...item, type: 'timeSeries' }, true);
    }
  };

  const handleRootAssetClick = (rootAsset: Asset) => {
    pushJourney({ id: rootAsset.id, type: 'asset' });
  };

  const [dateRange, setDateRange] = useDateRange();

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        <TimeseriesSearchResults
          showCount
          selectedRow={selectedRow}
          onClick={handleRowClick}
          onRootAssetClick={handleRootAssetClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setTimeseriesFilter(newValue)
          }
          filter={timeseriesFilter}
          showDatePicker={true}
          query={debouncedQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </SearchResultWrapper>
    </StyledSplitter>
  );
};
