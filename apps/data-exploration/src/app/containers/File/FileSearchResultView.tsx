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
import { useFlagDocumentGPT } from '@data-exploration-app/hooks';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useDocumentFilters } from '@data-exploration-app/store/filter/selectors/documentSelectors';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { EMPTY_OBJECT } from '@data-exploration-lib/core';

export const FileSearchResultView = () => {
  const isDocumentsGPTEnabled = useFlagDocumentGPT();
  const [, openPreview] = useCurrentResourceId();
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const [query] = useQueryString(SEARCH_KEY);

  // Here we need to parse params to find selected file's id.
  const selectedFileId = useSelectedResourceId();
  const selectedRootAssetId = useSelectedResourceId(true);

  const selectedRow = useMemo(() => {
    return selectedFileId ? { [selectedFileId]: true } : EMPTY_OBJECT;
  }, [selectedFileId]);

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id);
  };

  const handleParentAssetClick = (rootAsset: Asset, resourceId?: number) => {
    openPreview(resourceId, false, ResourceTypes.Asset, rootAsset.id);
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

      {Boolean(selectedFileId) && (
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
