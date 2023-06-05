import React from 'react';

import styled from 'styled-components';

import noop from 'lodash/noop';

import { Button, Dropdown, Menu, ToolBar } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { UnifiedViewer } from '@cognite/unified-file-viewer';

import { EditFileButton, ShowHideDetailsButton } from '../../../components';

import { UseSearchBarState } from './hooks/useSearchBarState';
import { SearchBar, SearchBarProps } from './SearchBar';

export const ActionTools = ({
  file,
  fileUrl,
  fileViewerRef,
  searchQuery,
  hasOcrData,
  numberOfPages,
  setSearchQuery,
  searchBarInputRef,
  currentSearchResultIndex,
  numberOfSearchResults,
  isSearchOpen,
  onSearchOpen,
  onSearchClose,
  onNextResult,
  onPreviousResult,
  enableSearch = true,
  enableDownload = true,
  showSideBar = true,
  showResourcePreviewSidebar = false,
  editMode = false,
  setShowResourcePreviewSidebar = noop,
  setEditMode = noop,
  filesAcl = false,
  annotationsAcl = false,
  hideEdit = false,
}: {
  file: FileInfo;
  fileViewerRef?: UnifiedViewer;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  hasOcrData: boolean;
  numberOfPages: number;
  enableSearch?: boolean;
  enableDownload?: boolean;
  showSideBar?: boolean;
  showResourcePreviewSidebar?: boolean;
  editMode?: boolean;
  setShowResourcePreviewSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
  setEditMode?: () => void;
  filesAcl: boolean;
  annotationsAcl: boolean;
  hideEdit: boolean;
} & UseSearchBarState &
  Pick<
    SearchBarProps,
    | 'currentSearchResultIndex'
    | 'numberOfSearchResults'
    | 'onNextResult'
    | 'onPreviousResult'
  >): JSX.Element | null => {
  if (!fileUrl) return null;

  const handleDownloadFileWithAnnotations = async () => {
    if (!fileViewerRef) {
      return;
    }

    try {
      await fileViewerRef.exportWorkspaceToPdf({ fileName: file.name });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  return (
    <FixedPosition>
      <StyledSpace>
        {enableSearch && (
          <SearchBar
            isOpen={isSearchOpen}
            value={searchQuery}
            hasOcrData={hasOcrData}
            numberOfPages={numberOfPages}
            onChange={setSearchQuery}
            onSearchOpen={onSearchOpen}
            onSearchClose={onSearchClose}
            searchBarInputRef={searchBarInputRef}
            currentSearchResultIndex={currentSearchResultIndex}
            numberOfSearchResults={numberOfSearchResults}
            onNextResult={onNextResult}
            onPreviousResult={onPreviousResult}
          />
        )}
        {!editMode && !hideEdit && (
          <ToolBar>
            <EditFileButton
              item={{ type: 'file', id: file.id! }}
              isActive={editMode}
              onClick={setEditMode}
              filesAcl={filesAcl}
              annotationsAcl={annotationsAcl}
            />
          </ToolBar>
        )}
        {showSideBar && (
          <ToolBar>
            <ShowHideDetailsButton
              showSideBar={showResourcePreviewSidebar}
              onClick={() =>
                setShowResourcePreviewSidebar((prevState) => !prevState)
              }
            />
          </ToolBar>
        )}
        {enableDownload && (
          <Dropdown
            content={
              <Menu>
                <Menu.Item href={fileUrl} style={{ color: 'unset' }}>
                  Original File
                </Menu.Item>
                <Menu.Item onClick={handleDownloadFileWithAnnotations}>
                  File with Annotations
                </Menu.Item>
              </Menu>
            }
          >
            <Button icon="Download" aria-label="Download" />
          </Dropdown>
        )}
      </StyledSpace>
    </FixedPosition>
  );
};

const StyledSpace = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  float: right;
`;

const FixedPosition = styled.div`
  position: absolute;
  isolation: isolate;
  right: 10px;
  top: 10px;
`;
