import React from 'react';
import { FileInfo } from '@cognite/sdk';
import styled from 'styled-components';
import { Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { SearchBar } from './SearchBar';
import { useFileDownloadUrl } from './hooks';

export const ActionTools = ({
  file,
  fileViewerRef,
  searchQuery,
  setSearchQuery,
  enableSearch = true,
  enableDownload = true,
}: {
  file: FileInfo;
  fileViewerRef?: UnifiedViewer;
  searchQuery: string;
  setSearchQuery: (page: string) => void;
  enableSearch?: boolean;
  enableDownload?: boolean;
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
    <ToolBar>
      <Flex gap={5}>
        {enableSearch && (
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
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
      </Flex>
    </ToolBar>
  );
};

const ToolBar = styled.div`
  position: absolute;
  isolation: isolate;
  right: 10px;
  top: 10px;
`;
