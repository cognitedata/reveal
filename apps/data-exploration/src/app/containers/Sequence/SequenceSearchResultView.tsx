import { Routes, Route } from 'react-router-dom';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { SequenceSearchResults } from '@data-exploration-components/containers';
import { useSequenceFilters } from '@data-exploration-app/store';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks';
import { ResourceItem } from '@cognite/data-exploration';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDebounce } from 'use-debounce';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { SequencePreview } from '@data-exploration-app/containers/Sequence/SequencePreview';
import { routes } from '@data-exploration-app/containers/App';

export const SequenceSearchResultView = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const [, openPreview] = useCurrentResourceId();
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  // Here we need to parse params to find selected sequence's id.
  const selectedSequenceId = useSelectedResourceId();

  const selectedRow = selectedSequenceId ? { [selectedSequenceId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id !== selectedSequenceId ? item.id : undefined);
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
          enableAdvancedFilters={isAdvancedFiltersEnabled}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setSequenceFilter(newValue)
          }
          filter={sequenceFilter}
          query={debouncedQuery}
        />
      </SearchResultWrapper>

      {Boolean(selectedSequenceId) && (
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
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
