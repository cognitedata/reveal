import { useMemo } from 'react';
import { Routes, Route } from 'react-router-dom';

import { DocumentSearchResults } from '@data-exploration/containers';

import { ResourceItem, ResourceTypes } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { routes } from '@data-exploration-app/containers/App';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { FilePreview } from '@data-exploration-app/containers/File/FilePreview';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDocumentFilters } from '@data-exploration-app/store/filter/selectors/documentSelectors';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import {
  EMPTY_OBJECT,
  getSelectedResourceId,
} from '@data-exploration-lib/core';

import {
  useBreakJourneyPromptToggle,
  useGetJourney,
  useJourneyLength,
  usePushJourney,
} from '../../hooks/detailsNavigation';
import {
  useFlagOverlayNavigation,
  useFlagDocumentGPT,
} from '../../hooks/flags';

export const FileSearchResultView = () => {
  const isDocumentsGPTEnabled = useFlagDocumentGPT();
  const [, openPreview] = useCurrentResourceId();
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const isDetailsOverlayEnabled = useFlagOverlayNavigation();
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptToggle();

  // Here we need to parse params to find selected file's id.
  const selectedFileId = getSelectedResourceId('file', firstJourney);

  const selectedRootAssetId = useSelectedResourceId(true);

  const selectedRow = useMemo(() => {
    return selectedFileId ? { [selectedFileId]: true } : EMPTY_OBJECT;
  }, [selectedFileId]);

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (isDetailsOverlayEnabled) {
      if (journeyLength > 1) {
        // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
        setPromptOpen(true, { id: item.id, type: 'file' });
      } else {
        pushJourney({ ...item, type: 'file' }, true);
      }
    } else {
      openPreview(item.id);
    }
  };

  const handleParentAssetClick = (rootAsset: Asset, resourceId?: number) => {
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
      </SearchResultWrapper>

      {!isDetailsOverlayEnabled && Boolean(selectedFileId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={<FilePreview fileId={selectedFileId!} />}
            />
            <Route
              path={routes.viewDetailTab.path}
              element={<FilePreview fileId={selectedFileId!} />}
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
