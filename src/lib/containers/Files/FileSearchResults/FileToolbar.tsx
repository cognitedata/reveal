import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { CLOSE_DROPDOWN_EVENT } from 'lib/utils/WindowEvents';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { ButtonGroup, SpacedRow } from 'lib/components';
import { useResourceEditable } from 'lib/context';
import { FileUploaderModal } from 'lib/containers/Files';
import { FileInfo } from '@cognite/sdk';

export const FileToolbar = ({
  onFileClicked,
  onViewChange,
  currentView = 'list',
}: {
  onFileClicked?: (file: FileInfo) => boolean;
  onViewChange?: (view: string) => void;
  currentView?: string;
}) => {
  const inEditMode = useResourceEditable();
  const hasEditPermissions = usePermissions('filesAcl', 'WRITE');

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SpacedRow>
        <ButtonGroup onButtonClicked={onViewChange} currentKey={currentView}>
          <ButtonGroup.Button key="list" icon="List">
            List View
          </ButtonGroup.Button>
          <ButtonGroup.Button key="grid" icon="Grid">
            Grid View
          </ButtonGroup.Button>
        </ButtonGroup>
        <div className="spacer" />
        {inEditMode && (
          <Button
            onClick={() => setModalVisible(true)}
            icon="Upload"
            disabled={!hasEditPermissions}
          >
            Upload new file
          </Button>
        )}
      </SpacedRow>
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
