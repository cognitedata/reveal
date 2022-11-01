import React from 'react';
import { FileInfo } from '@cognite/sdk';
import styled from 'styled-components';
import { Button, Dropdown, Flex, Menu } from '@cognite/cogs.js';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { SearchBar } from './SearchBar';
import { SEARCHABLE_DOCUMENT_TYPES } from './constants';

export const ActionTools = ({
  file,
  fileUrl,
  fileViewerRef,
  searchQuery,
  setSearchQuery,
  enableSearch = true,
  enableDownload = true,
}: {
  file: FileInfo;
  fileUrl?: string;
  fileViewerRef?: UnifiedViewer;
  searchQuery: string;
  setSearchQuery: (page: string) => void;
  enableSearch?: boolean;
  enableDownload?: boolean;
}): JSX.Element | null => {
  const { mimeType = '', name = '' } = file ?? {};
  const query = mimeType + name.slice(0, name.lastIndexOf('.'));
  const showSearch =
    enableSearch && SEARCHABLE_DOCUMENT_TYPES.some(el => query.includes(el));

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
        {showSearch && (
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
