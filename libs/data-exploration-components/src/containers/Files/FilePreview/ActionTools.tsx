import React from 'react';
import { FileInfo } from '@cognite/sdk';
import styled from 'styled-components';
import { Button, Dropdown, Menu, ToolBar } from '@cognite/cogs.js';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { EditFileButton, ShowHideDetailsButton } from '../../../components';
import { SearchBar, SearchBarProps } from './SearchBar';
import noop from 'lodash/noop';
import { UseSearchBarState } from './hooks/useSearchBarState';

export const ActionTools = ({
  file,
  fileUrl,
  fileViewerRef,
  searchQuery,
  setSearchQuery,
  setSearchBarInputRef,
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
  eventsAcl = false,
}: {
  file: FileInfo;
  fileViewerRef?: UnifiedViewer;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  enableSearch?: boolean;
  enableDownload?: boolean;
  showSideBar?: boolean;
  showResourcePreviewSidebar?: boolean;
  editMode?: boolean;
  setShowResourcePreviewSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
  setEditMode?: () => void;
  filesAcl: boolean;
  eventsAcl: boolean;
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
            onChange={setSearchQuery}
            onSearchOpen={onSearchOpen}
            onSearchClose={onSearchClose}
            setSearchBarInputRef={setSearchBarInputRef}
            currentSearchResultIndex={currentSearchResultIndex}
            numberOfSearchResults={numberOfSearchResults}
            onNextResult={onNextResult}
            onPreviousResult={onPreviousResult}
          />
        )}
        {!editMode && (
          <ToolBar>
            <EditFileButton
              item={{ type: 'file', id: file.id! }}
              isActive={editMode}
              onClick={setEditMode}
              filesAcl={filesAcl}
              eventsAcl={eventsAcl}
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
