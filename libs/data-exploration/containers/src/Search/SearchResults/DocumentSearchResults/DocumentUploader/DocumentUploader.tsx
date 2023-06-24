import React, { useState } from 'react';

import { Upload, message } from 'antd';
import { UploadFile } from 'antd/lib/upload/interface';
import noop from 'lodash/noop';

import { Body, Icon, Input } from '@cognite/cogs.js';
import { FileUploadResponse } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';

import { DocumentUploadButtons } from './DocumentUploadButtons';

const { Dragger } = Upload;

export enum STATUS {
  WAITING,
  READY,
  STARTED,
  PAUSED,
}

type Props = {
  assetIds?: number[];
  validExtensions?: string[];
  onUploadSuccess?: (file: FileUploadResponse) => void;
  onFileListChange?: (fileList: UploadFile[]) => void;
  onUploadFailure?: (error: string) => void;
  onCancel?: () => void;
  beforeUploadStart?: () => void;
  children?: React.ReactNode;
};

export const DocumentUploader = ({
  children,
  assetIds,
  validExtensions,
  onUploadSuccess = noop,
  onUploadFailure = alert,
  onCancel = noop,
  beforeUploadStart = noop,
  onFileListChange,
}: Props) => {
  const { t } = useTranslation();

  const [uploadStatus, setUploadStatus] = useState<STATUS>(STATUS.WAITING);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [datasetId, setDatasetId] = useState<number | undefined>();

  const removeFile = (file: UploadFile) => {
    setFileList((list) => list.filter((el) => el.uid !== file.uid));
    if (onFileListChange) {
      onFileListChange(fileList);
    }
  };

  const setupFilesBeforeUpload = (file: any) => {
    if (
      validExtensions === undefined ||
      validExtensions.length === 0 ||
      validExtensions.includes(file.name.split('.').pop().toLowerCase())
    ) {
      setFileList((list) => [...list, file]);
      setUploadStatus(STATUS.READY);
      if (onFileListChange) {
        onFileListChange(fileList);
      }
    } else {
      setFileList([]);
      setUploadStatus(STATUS.WAITING);
      message.error(`${file.name} has an invalid extension`);
    }

    // false stops them from automatically using their upload functionality
    return false;
  };

  return (
    <div>
      <Dragger
        name="file"
        multiple
        onRemove={removeFile}
        beforeUpload={setupFilesBeforeUpload}
        fileList={fileList}
      >
        <Icon type="Upload" />
        <Body>
          {t(
            'DOCUMENT_UPLOADER_TEXT',
            'Click or drag file to this area to upload, will begin upload when you click the Upload button.'
          )}
        </Body>
      </Dragger>
      {children}

      <Input
        placeholder={t(
          'DOCUMENT_UPLOADER_DATASET_ID_PLACEHOLDER',
          'Data set ID (optional)'
        )}
        fullWidth
        style={{ margin: '16px 0' }}
        value={datasetId}
        type="number"
        onChange={(e) => {
          setDatasetId(Number(e.target.value));
        }}
      />

      <DocumentUploadButtons
        uploadStatus={uploadStatus}
        fileList={fileList}
        setUploadStatus={setUploadStatus}
        onCancel={onCancel}
        setFileList={setFileList}
        onUploadFailure={onUploadFailure}
        onUploadSuccess={onUploadSuccess}
        beforeUploadStart={beforeUploadStart}
        assetIds={assetIds}
        dataSetId={datasetId}
      />
    </div>
  );
};
