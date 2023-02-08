import React from 'react';
import { FileInfo } from '@cognite/sdk';
import styled from 'styled-components';
import { Button, Dropdown, Flex, Menu, ToolBar } from '@cognite/cogs.js';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { SearchBar } from './SearchBar';
import { useFileDownloadUrl } from './hooks';
import { IconButton } from '../../../components/index';
import noop from 'lodash/noop';
import { HIDE_DETAILS, SHOW_DETAILS } from './constants';

export const ActionTools = ({
  file,
  fileViewerRef,
  searchQuery,
  setSearchQuery,
  enableSearch = true,
  enableDownload = true,
  showSideBar = true,
  showResourcePreviewSidebar = false,
  setShowResourcePreviewSidebar = noop,
}: {
  file: FileInfo;
  fileViewerRef?: UnifiedViewer;
  searchQuery: string;
  setSearchQuery: (page: string) => void;
  enableSearch?: boolean;
  enableDownload?: boolean;
  showSideBar?: boolean;
  showResourcePreviewSidebar?: boolean;
  setShowResourcePreviewSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element | null => {
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
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )}
      {showSideBar && (
        <IconButton
          icon={showResourcePreviewSidebar ? 'PanelRight' : 'PanelLeft'}
          tooltipContent={
            showResourcePreviewSidebar ? HIDE_DETAILS : SHOW_DETAILS
          }
          aria-label="Toggle file preview sidebar view"
          onClick={() => {
            setShowResourcePreviewSidebar((prevState) => !prevState);
          }}
          type="ghost"
        />
      )}
      {enableDownload && (
        <Dropdown
          content={
            <Menu>
              <Menu.Item
                href={fileUrl}
                download={file.name}
                style={{ color: 'unset' }}
              >
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
    </ToolBarActions>
  );
};

const ToolBarActions = styled(ToolBar)`
  position: absolute;
  isolation: isolate;
  right: 10px;
  top: 10px;
`;
