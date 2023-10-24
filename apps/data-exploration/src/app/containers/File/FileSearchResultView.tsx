import { useMemo } from 'react';

import {
  DocumentSearchResults,
  FileSearchResults,
} from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import {
  EMPTY_OBJECT,
  getSelectedResourceId,
} from '@data-exploration-lib/core';

import {
  useGetJourney,
  useJourneyLength,
  usePushJourney,
  useFlagDocumentGPT,
  useBreakJourneyPromptState,
  useFlagDocumentsApiEnabled,
} from '../../hooks';
import { useQueryString } from '../../hooks/hooks';
import { useFileFilters } from '../../store';
import { useDocumentFilters } from '../../store/filter/selectors/documentSelectors';
import { SEARCH_KEY } from '../../utils/constants';
import { SearchResultWrapper, StyledSplitter } from '../elements';

export const FileSearchResultView = () => {
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();
  const isDocumentsGPTEnabled = useFlagDocumentGPT();
  const [fileFilter, setFileFilter] = useFileFilters();
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();
  const [debouncedQuery] = useDebounce(query, 100);

  // Here we need to parse params to find selected file's id.
  const selectedFileId = getSelectedResourceId('file', firstJourney);

  const selectedRow = useMemo(() => {
    return selectedFileId ? { [selectedFileId]: true } : EMPTY_OBJECT;
  }, [selectedFileId]);

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (journeyLength > 1) {
      // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
      setPromptOpen(true, { id: item.id, type: 'file' });
    } else {
      pushJourney({ ...item, type: 'file' }, true);
    }
  };

  const handleParentAssetClick = (rootAsset: Asset) => {
    pushJourney({ id: rootAsset.id, type: 'asset' });
  };

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        {!isDocumentsApiEnabled ? (
          <FileSearchResults
            showCount
            selectedRow={selectedRow}
            filter={fileFilter}
            allowEdit={true} // ??
            onClick={handleRowClick}
            onDirectAssetClick={handleParentAssetClick}
            onFilterChange={(newValue: Record<string, unknown>) =>
              setFileFilter(newValue)
            }
            query={debouncedQuery}
          />
        ) : (
          <DocumentSearchResults
            isDocumentsGPTEnabled={isDocumentsGPTEnabled}
            query={query}
            selectedRow={selectedRow}
            filter={documentFilter}
            onClick={handleRowClick}
            onRootAssetClick={handleParentAssetClick}
            onFilterChange={(newValue: Record<string, unknown>) =>
              setDocumentFilter(newValue)
            }
          />
        )}
      </SearchResultWrapper>
    </StyledSplitter>
  );
};
