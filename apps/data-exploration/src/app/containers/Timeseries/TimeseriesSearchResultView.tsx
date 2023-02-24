import { Routes, Route } from 'react-router-dom';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { TimeseriesSearchResults } from '@data-exploration-components/containers';
import { useTimeseriesFilters } from '@data-exploration-app/store';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { ResourceItem } from '@cognite/data-exploration';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDebounce } from 'use-debounce';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { useDateRange } from '@data-exploration-app/context/DateRangeContext';
import { TimeseriesPreview } from '@data-exploration-app/containers/Timeseries/TimeseriesPreview';
import { routes } from '@data-exploration-app/containers/App';

export const TimeseriesSearchResultView = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const [, openPreview] = useCurrentResourceId();
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  // Here we need to parse params to find selected timeseries' id.
  const selectedTimeseriesId = useSelectedResourceId();

  const selectedRow = selectedTimeseriesId
    ? { [selectedTimeseriesId]: true }
    : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id !== selectedTimeseriesId ? item.id : undefined);
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
          enableAdvancedFilters={isAdvancedFiltersEnabled}
          onClick={handleRowClick}
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

      {Boolean(selectedTimeseriesId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={
                <TimeseriesPreview timeseriesId={selectedTimeseriesId!} />
              }
            />
            <Route
              path={routes.viewDetailTab.path}
              element={
                <TimeseriesPreview timeseriesId={selectedTimeseriesId!} />
              }
            />
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
