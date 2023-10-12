import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import styled from 'styled-components';

import { useQueryClient } from '@tanstack/react-query';
import { useCdfUserHistoryService } from '@user-history';
import { Modal } from 'antd';

import { Button } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import {
  searchBaseCacheKey,
  listBaseCacheKey,
} from '@cognite/sdk-react-query-hooks';

import { useTranslation, SUB_APP_PATH } from '@data-exploration-lib/core';

import { DocumentUploader } from './DocumentUploader';

const Wrapper = styled.div`
  .wrapper {
    margin-top: 16px;
  }
  button {
    margin-top: 6px;
  }

  && .ant-select-selection__clear {
    background: none;
    right: 34px;
  }

  .link-text {
    margin-top: 6px;
    margin-bottom: 2px;
  }
`;

type Props = {
  onFileSelected: (file: FileInfo) => void;
  onCancel: () => void;
  visible?: boolean;
};

export const DocumentUploaderModal = ({
  onCancel,
  onFileSelected,
  visible = true,
}: Props) => {
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const client = useQueryClient();
  const { t } = useTranslation();

  const { pathname, search: searchParams } = useLocation();
  const userHistoryService = useCdfUserHistoryService();

  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      title={t('UPLOAD_FILE', 'Upload File')}
      footer={null}
    >
      <Wrapper>
        <DocumentUploader
          onUploadSuccess={(file) => {
            // save File preview as edit resource in user history
            if (file)
              userHistoryService.logNewResourceEdit({
                application: SUB_APP_PATH,
                name: file?.name,
                path: pathname.concat(searchParams),
              });

            setFileList((list) => [...list, file]);
            client.refetchQueries(listBaseCacheKey('files'));
            client.refetchQueries(searchBaseCacheKey('files'));
          }}
          beforeUploadStart={() => {
            setFileList([]);
          }}
        >
          <>
            {fileList.length !== 0 && (
              <ul>
                {fileList.map((file) => (
                  <li>
                    {t('FILE', 'File')}{' '}
                    <Button
                      type="ghost-accent"
                      onClick={() => onFileSelected(file)}
                    >
                      {file.name}
                    </Button>{' '}
                    {t(
                      'FILE_SUCCESSFULLY_UPLOADED_TEXT',
                      'successfully uploaded!'
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        </DocumentUploader>
      </Wrapper>
    </Modal>
  );
};
