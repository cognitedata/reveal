/* eslint-disable @cognite/no-number-z-index */
import styled from 'styled-components';

import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { UnifiedViewer } from '@cognite/unified-file-viewer';

import { useFileUrl } from '../hooks/useFileUrl';

import { SearchBar } from './SearchBar';

export const ActionTools = ({
  file,
  fileViewerRef,
  searchQuery,
  setSearchQuery,
  enableSearch,
}: {
  file: FileInfo;
  fileViewerRef: UnifiedViewer | undefined;
  searchQuery: string;
  setSearchQuery: (page: string) => void;
  enableSearch: boolean;
}): JSX.Element | null => {
  const { fileUrl } = useFileUrl(file);

  if (!fileUrl) return null;

  const handleDownloadFile = async () => {
    try {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', file.name);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  const handleDownloadFileWithAnnotations = async () => {
    if (fileViewerRef === undefined) {
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
      <ToolContainer>
        {enableSearch && (
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}
        <Dropdown
          content={
            <Menu>
              <Menu.Item onClick={handleDownloadFile}>Original File</Menu.Item>
              <Menu.Item onClick={handleDownloadFileWithAnnotations}>
                File with Annotations
              </Menu.Item>
            </Menu>
          }
        >
          <Button icon="Download" />
        </Dropdown>
      </ToolContainer>
    </ToolBar>
  );
};

const ToolBar = styled.div`
  position: absolute;
  z-index: 100;
  right: 10px;
  top: 10px;
`;

const ToolContainer = styled.div`
  display: inline-flex;
  gap: 5px;
`;
