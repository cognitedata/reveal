import { Button } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { ButtonGroup } from 'lib/components';
import { SearchResultToolbar, FileUploaderModal } from 'lib/containers';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { CLOSE_DROPDOWN_EVENT } from 'lib/utils/WindowEvents';
import React, { useState } from 'react';

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
          <Button
            onClick={() => setModalVisible(true)}
            icon="Upload"
            disabled={!hasEditPermissions}
          >
            Upload
          </Button>
        )}
        <ButtonGroup onButtonClicked={onViewChange} currentKey={currentView}>
          <ButtonGroup.Button key="list" icon="List" />
          <ButtonGroup.Button key="grid" icon="Grid" />
        </ButtonGroup>
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
