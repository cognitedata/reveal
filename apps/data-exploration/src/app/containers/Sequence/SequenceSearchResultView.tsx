import { SequenceSearchResults } from '@data-exploration/containers';
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
import { useSequenceFilters } from '../../store';
import { SEARCH_KEY } from '../../utils/constants';
import { SearchResultWrapper, StyledSplitter } from '../elements';

export const SequenceSearchResultView = () => {
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();

  // Here we need to parse params to find selected sequence's id.
  const selectedSequenceId = getSelectedResourceId('sequence', firstJourney);

  const selectedRow = selectedSequenceId ? { [selectedSequenceId]: true } : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (journeyLength > 1) {
      // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
      setPromptOpen(true, { id: item.id, type: 'sequence' });
    } else {
      pushJourney({ ...item, type: 'sequence' }, true);
    }
  };

  const handleRootAssetClick = (rootAsset: Asset) => {
    pushJourney({ id: rootAsset.id, type: 'asset' });
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
    </StyledSplitter>
  );
};
