import { useDisclosure } from '@cognite/data-exploration';
import React from 'react';
import { FileInfo } from '@cognite/sdk';
import styled from 'styled-components';
import { Button, Dropdown, Menu, ToolBar } from '@cognite/cogs.js';
import {
  getCanonicalMimeType,
  UnifiedViewer,
} from '@cognite/unified-file-viewer';
import { SearchBar } from './SearchBar';
import { useFileDownloadUrl } from './hooks';
import { EditFileButton, ShowHideDetailsButton } from '../../../components';
import noop from 'lodash/noop';
import { useMetrics } from '@data-exploration-components/hooks/useMetrics';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-components/constants/metrics';

export const ActionTools = ({
  file,
  fileViewerRef,
  searchQuery,
  setSearchQuery,
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
}): JSX.Element | null => {
  const trackUsage = useMetrics();

  const {
    isOpen: isSearchOpen,
    onOpen: onSearchOpen,
    onClose: onSearchClose,
  } = useDisclosure({
    isOpen: Boolean(searchQuery),
  });

  const handleSearchClose = () => {
    onSearchClose();
    setSearchQuery('');
  };

  const handleSearchOpen = () => {
    const fileMimeType = file.mimeType;
    trackUsage(
      DATA_EXPLORATION_COMPONENT.FILE_PREVIEW.SEARCH_IN_CONTAINER_OPEN,
      {
        fileId: file.id,
        mimeType:
          fileMimeType === undefined
            ? fileMimeType
            : getCanonicalMimeType(fileMimeType),
      }
    );
    onSearchOpen();
  };

  const fileUrl = useFileDownloadUrl(file.id);

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
    <ToolBarActions direction="horizontal">
      {enableSearch && (
        <SearchBar
          isOpen={isSearchOpen}
          value={searchQuery}
          onChange={setSearchQuery}
          onOpenPress={handleSearchOpen}
          onClosePress={handleSearchClose}
        />
      )}
      <EditFileButton
        item={{ type: 'file', id: file.id! }}
        isActive={editMode}
        onClick={setEditMode}
        filesAcl={filesAcl}
        eventsAcl={eventsAcl}
      />
      {showSideBar && (
        <ShowHideDetailsButton
          showSideBar={showResourcePreviewSidebar}
          onClick={() =>
            setShowResourcePreviewSidebar((prevState) => !prevState)
          }
        />
      )}
      {enableDownload && (
        <Dropdown
          content={
            <Menu>
              <Menu.Item css={{}} href={fileUrl} style={{ color: 'unset' }}>
                Original File
              </Menu.Item>
              <Menu.Item css={{}} onClick={handleDownloadFileWithAnnotations}>
                File with Annotations
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon="Download" aria-label="Download" />
        </Dropdown>
      )}
    </ToolBarActions>
  );
};

const ToolBarActions = styled(ToolBar)`
  position: absolute;
  isolation: isolate;
  right: 10px;
  top: 10px;
`;
