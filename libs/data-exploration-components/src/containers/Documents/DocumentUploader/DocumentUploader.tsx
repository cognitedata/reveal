import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { FileUploadResponse } from '@cognite/sdk';
import { UploadFile } from 'antd/lib/upload/interface';
import { Body, Icon } from '@cognite/cogs.js';
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
  onUploadSuccess = () => {},
  onUploadFailure = alert,
  onCancel = () => {},
  beforeUploadStart = () => {},
  onFileListChange = () => {},
}: Props) => {
  const [uploadStatus, setUploadStatus] = useState<STATUS>(STATUS.WAITING);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const removeFile = (file: UploadFile) => {
    setFileList(list => list.filter(el => el.uid !== file.uid));
    onFileListChange(fileList);
  };

  const setupFilesBeforeUpload = (file: any) => {
    if (
      validExtensions === undefined ||
      validExtensions.length === 0 ||
      validExtensions.includes(file.name.split('.').pop().toLowerCase())
    ) {
      setFileList(list => [...list, file]);
      setUploadStatus(STATUS.READY);
      onFileListChange(fileList);
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
          Click or drag file to this area to upload, will begin upload when you
          click the Upload button.
        </Body>
      </Dragger>
      {children}

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
      />
    </div>
  );
};
