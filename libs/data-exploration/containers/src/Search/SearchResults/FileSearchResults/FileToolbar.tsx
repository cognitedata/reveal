import React, { useContext, useState } from 'react';

import styled from 'styled-components';

import { Button } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

import {
  AppContext,
  CLOSE_DROPDOWN_EVENT,
  useTranslation,
} from '@data-exploration-lib/core';

import {
  FileUploaderModal,
  SearchResultCountLabel,
  SearchResultToolbar,
} from '../../../index';

export const FileToolbar = ({
  onFileClicked,
  showCount = false,
  allowEdit = false,
  loadedCount = 0,
  totalCount = 0,
}: {
  onFileClicked?: (file: FileInfo) => boolean;
  allowEdit?: boolean;
  showCount?: boolean;
  loadedCount?: number;
  totalCount?: string | number;
}) => {
  const { t } = useTranslation();
  const context = useContext(AppContext);
  const { data: hasEditPermissions } = usePermissions(
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SearchResultToolbar
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
            {t('UPLOAD', 'Upload')}
          </UploadButton>
        )}
      </SearchResultToolbar>
      <FileUploaderModal
        key="file-uploader-modal"
        visible={modalVisible}
        onFileSelected={(file) => {
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
