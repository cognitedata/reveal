import React, { useState } from 'react';
import { Button } from '@cognite/cogs.js';
import { FileUploaderModal, SpacedRow } from 'components/Common';
import { useResourcesSelector } from '@cognite/cdf-resources-store';
import { useResourceEditable } from 'context/ResourceSelectionContext';
import { checkPermission } from 'modules/app';
import { useHistory } from 'react-router';
import { createLink } from 'utils/URLUtils';
import { CLOSE_DROPDOWN_EVENT } from 'utils/WindowEvents';

export const FileToolbar = () => {
  const history = useHistory();
  const inEditMode = useResourceEditable();
  const hasEditPermissions = useResourcesSelector(checkPermission)(
    'filesAcl',
    'WRITE'
  );

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
          history.push(createLink(`/explore/file/${file.id}`));
          setModalVisible(false);
          window.dispatchEvent(new Event(CLOSE_DROPDOWN_EVENT));
        }}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
};
