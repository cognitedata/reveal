import React, { useState } from 'react';

import { Button, SegmentedControl } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import { SearchResultToolbar, FileUploaderModal } from 'containers';
import { CLOSE_DROPDOWN_EVENT } from 'utils/WindowEvents';

export const FileToolbar = ({
  onFileClicked,
  onViewChange,
  currentView = 'list',
  query,
  filter,
  count,
  allowEdit = false,
}: {
  onFileClicked?: (file: FileInfo) => boolean;
  onViewChange?: (view: string) => void;
  currentView?: string;
  query: string;
  count?: number;
  filter?: any;
  allowEdit?: boolean;
}) => {
  const { data: hasEditPermissions } = usePermissions('filesAcl', 'WRITE');

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SearchResultToolbar
        api={query?.length > 0 ? 'search' : 'list'}
        type="file"
        filter={filter}
        query={query}
        count={count}
      >
        {allowEdit && (
          <UploadButton
            onClick={() => setModalVisible(true)}
            icon="Upload"
            disabled={!hasEditPermissions}
          >
            Upload
          </UploadButton>
        )}
        <SegmentedControl
          onButtonClicked={onViewChange}
          currentKey={currentView}
        >
          <SegmentedControl.Button
            key="list"
            icon="List"
            title="List"
            aria-label="List"
          />
          <SegmentedControl.Button
            key="grid"
            icon="Grid"
            title="Grid"
            aria-label="Grid"
          />
        </SegmentedControl>
      </SearchResultToolbar>
      <FileUploaderModal
        visible={modalVisible}
        onFileSelected={file => {
          if (onFileClicked) {
            if (!onFileClicked(file)) {
              return;
            }
          }
          setModalVisible(false);
          window.dispatchEvent(new Event(CLOSE_DROPDOWN_EVENT));
        }}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
};

const UploadButton = styled(Button)`
  && {
    margin-right: 8px;
  }
`;
