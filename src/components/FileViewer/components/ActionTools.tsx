/* eslint-disable @cognite/no-number-z-index */
import { FileInfo } from '@cognite/sdk';
import styled from 'styled-components';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { SearchBar } from './SearchBar';
import { SEARCHABLE_DOCUMENT_TYPES } from '../constants';

export const ActionTools = ({
  file,
  fileUrl,
  fileViewerRef,
  searchQuery,
  setSearchQuery,
}: {
  file: FileInfo;
  fileUrl: string | undefined;
  fileViewerRef: UnifiedViewer | undefined;

  searchQuery: string;
  setSearchQuery: (page: string) => void;
}): JSX.Element | null => {
  const { mimeType = '', name = '' } = file ?? {};
  const query = mimeType + name.slice(0, name.lastIndexOf('.'));
  const showSearch = SEARCHABLE_DOCUMENT_TYPES.some((el) => query.includes(el));

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
        {showSearch && (
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
