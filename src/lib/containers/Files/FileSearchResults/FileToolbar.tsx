import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { CLOSE_DROPDOWN_EVENT } from 'lib/utils/WindowEvents';
import { usePermissions } from 'lib/hooks/CustomHooks';
import { SpacedRow } from 'lib/components';
import { useResourceEditable } from 'lib/context';
import { FileUploaderModal } from 'lib/containers/Files';
import { FileInfo } from '@cognite/sdk';

export const FileToolbar = ({
  onFileClicked,
}: {
  onFileClicked?: (file: FileInfo) => boolean;
}) => {
  const inEditMode = useResourceEditable();
  const hasEditPermissions = usePermissions('filesAcl', 'WRITE');

  const [modalVisible, setModalVisible] = useState(false);
  if (!inEditMode) {
    return null;
  }

  return (
    <>
      <SpacedRow>
        <div className="spacer" />
        <Button
          onClick={() => setModalVisible(true)}
          icon="Upload"
          disabled={!hasEditPermissions}
        >
          Upload new file
        </Button>
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
