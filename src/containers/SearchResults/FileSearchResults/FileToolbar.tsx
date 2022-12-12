import React, { useContext, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Button } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import {
  SearchResultToolbar,
  FileUploaderModal,
  SearchResultCountLabel,
} from 'containers';
import { CLOSE_DROPDOWN_EVENT } from 'utils';
import { AppContext } from 'context/AppContext';
import { RelatedResourceType } from 'hooks';

export const FileToolbar = ({
  onFileClicked,
  showCount = false,
  allowEdit = false,
  loadedCount = 0,
  totalCount = 0,
}: {
  onFileClicked?: (file: FileInfo) => boolean;
  isHaveParent?: boolean;
  isGroupingFilesEnabled?: boolean;
  relatedResourceType?: RelatedResourceType;
  allowEdit?: boolean;
  showCount?: boolean;
  loadedCount?: number;
  totalCount?: string | number;
}) => {
  const context = useContext(AppContext);
  const { data: hasEditPermissions } = usePermissions(
    context?.flow!,
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SearchResultToolbar
        type="file"
        showCount={showCount}
        style={{ flex: 1, justifyContent: 'space-between' }}
        resultCount={
          <SearchResultCountLabel
            loadedCount={loadedCount}
            totalCount={totalCount}
            resourceType="file"
          />
        }
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
      </SearchResultToolbar>
      <FileUploaderModal
        key={uuid()}
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
