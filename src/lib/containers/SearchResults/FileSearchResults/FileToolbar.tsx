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
  allowEdit = false,
}: {
  onFileClicked?: (file: FileInfo) => boolean;
  onViewChange?: (view: string) => void;
  currentView?: string;
  query: string;
  filter?: any;
  allowEdit?: boolean;
}) => {
  const hasEditPermissions = usePermissions('filesAcl', 'WRITE');

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SearchResultToolbar
        api={query?.length > 0 ? 'search' : 'list'}
        type="files"
        filter={filter}
        query={query}
      >
        {allowEdit && (
          <Button
            onClick={() => setModalVisible(true)}
            icon="Upload"
            disabled={!hasEditPermissions}
          >
            Upload new file
          </Button>
        )}
        <ButtonGroup onButtonClicked={onViewChange} currentKey={currentView}>
          <ButtonGroup.Button key="list" icon="List">
            List View
          </ButtonGroup.Button>
          <ButtonGroup.Button key="grid" icon="Grid">
            Grid View
          </ButtonGroup.Button>
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
