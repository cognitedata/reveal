import React from 'react';
import { FileUploadResponse } from '@cognite/sdk';
import { UploadFile } from 'antd/lib/upload/interface';
import { Button } from '@cognite/cogs.js';
import { SpacedRow } from 'components';
import { Modal, message } from 'antd';

import { STATUS } from './DocumentUploader';
import { useSDK } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import { getMIMEType, sleep } from 'utils';
import { GCSUploader } from './GCSUploader';

const { confirm } = Modal;
const currentUploads: { [key: string]: any } = {};

type Props = {
  uploadStatus: STATUS;
  fileList: UploadFile[];
  setUploadStatus: (status: STATUS) => void;
  onCancel: () => void;
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>;
  onUploadFailure: (error: string) => void;
  onUploadSuccess: (file: FileUploadResponse) => void;
  beforeUploadStart: () => void;
  assetIds?: number[];
};

export const DocumentUploadButtons: React.FC<Props> = ({
  uploadStatus,
  fileList,
  setUploadStatus,
  onCancel,
  setFileList,
  onUploadFailure,
  onUploadSuccess,
  beforeUploadStart,
  assetIds,
}: Props) => {
  const sdk = useSDK();

  const onClickStopUpload = () => {
    stopUpload(uploadStatus, fileList, setUploadStatus, onCancel, setFileList);
  };

  let uploaderButton;
  switch (uploadStatus) {
    case STATUS.WAITING:
      uploaderButton = (
        <>
          <div style={{ flex: 1 }} />
          <Button type="primary" icon="Upload" disabled>
            Upload
          </Button>
        </>
      );
      break;
    case STATUS.READY:
      uploaderButton = (
        <>
          <div style={{ flex: 1 }} />
          <Button
            type="primary"
            onClick={() =>
              startUpload(
                uploadStatus,
                fileList,
                setUploadStatus,
                setFileList,
                onUploadFailure,
                onUploadSuccess,
                beforeUploadStart,
                sdk,
                assetIds
              )
            }
            icon="Upload"
          >
            Upload
          </Button>
        </>
      );
      break;
    case STATUS.STARTED:
      uploaderButton = (
        <>
          <Button onClick={onClickStopUpload}>Cancel Upload</Button>
          <div style={{ flex: 1 }} />
          <Button
            type="primary"
            onClick={() => pauseUpload(uploadStatus, fileList, setUploadStatus)}
            icon="Loader"
          >
            Pause Upload
          </Button>
        </>
      );
      break;
    case STATUS.PAUSED:
      uploaderButton = (
        <>
          <Button onClick={onClickStopUpload}>Cancel Upload</Button>
          <div style={{ flex: 1 }} />
          <Button
            type="primary"
            onClick={() =>
              unpauseUpload(uploadStatus, fileList, setUploadStatus)
            }
          >
            Continue Upload
          </Button>
        </>
      );
      break;
    default:
      uploaderButton = null;
  }

  return <SpacedRow style={{ marginTop: '12px' }}>{uploaderButton}</SpacedRow>;
};

export const stopUpload = (
  uploadStatus: STATUS,
  fileList: UploadFile[],
  setUploadStatus: (status: STATUS) => void,
  onCancel: () => void,
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>
) => {
  fileList.forEach(file => {
    if (uploadStatus === STATUS.PAUSED || uploadStatus === STATUS.STARTED) {
      confirm({
        title: 'Do you want to cancel the file upload?',
        content: 'If you cancel, the file upload will be cancelled!',
        onOk: () => {
          currentUploads[file.uid].cancel();
          currentUploads[file.uid].meta.reset();
          setFileList([]);
          setUploadStatus(STATUS.WAITING);
        },
        onCancel,
      });
    } else {
      if (currentUploads[file.uid]) {
        currentUploads[file.uid].cancel();
        currentUploads[file.uid].meta.reset();
      }
      onCancel();
      setFileList([]);
      setUploadStatus(STATUS.WAITING);
    }
  });
};

export const pauseUpload = (
  uploadStatus: STATUS,
  fileList: UploadFile[],
  setUploadStatus: (status: STATUS) => void
) => {
  if (uploadStatus === STATUS.STARTED) {
    fileList.forEach(file => {
      currentUploads[file.uid].pause();
    });
    setUploadStatus(STATUS.PAUSED);
  }
};

export const unpauseUpload = (
  uploadStatus: STATUS,
  fileList: UploadFile[],
  setUploadStatus: (status: STATUS) => void
) => {
  if (uploadStatus === STATUS.PAUSED) {
    fileList.forEach(file => {
      currentUploads[file.uid].unpause();
    });

    setUploadStatus(STATUS.STARTED);
  }
};

export const startUpload = async (
  uploadStatus: STATUS,
  fileList: UploadFile[],
  setUploadStatus: (status: STATUS) => void,
  setFileList: React.Dispatch<React.SetStateAction<UploadFile<any>[]>>,
  onUploadFailure: (error: string) => void,
  onUploadSuccess: (file: FileUploadResponse) => void,
  beforeUploadStart: () => void,
  sdk: CogniteClient,
  assetIds?: number[]
) => {
  if (uploadStatus !== STATUS.READY) {
    return;
  }

  try {
    beforeUploadStart();
  } catch (e) {
    onUploadFailure('Unable to start upload');
    return;
  }

  message.info('Starting Upload...');

  fileList.forEach(async file => {
    const mimeType = getMIMEType(file.name);
    const fallbackMimeType = 'application/octet-stream';

    const fileMetadata = (await sdk.files.upload({
      name: file.name,
      mimeType: mimeType || fallbackMimeType,
      source: 'Cognite Data Fusion',
      ...(assetIds && { assetIds }),
    })) as FileUploadResponse;
    const { uploadUrl, id } = fileMetadata;

    if (!uploadUrl || !id) {
      onUploadFailure('Unable to create file');
      return;
    }

    file.status = 'uploading';
    file.percent = 0;

    setFileList(list => list.map(el => (el.uid === file.uid ? file : el)));

    currentUploads[file.uid] = await GCSUploader(
      file,
      uploadUrl,
      mimeType || fallbackMimeType,
      (info: any) => {
        file.response = info;
        file.percent = (info.uploadedBytes / info.totalBytes) * 100;

        setFileList(list =>
          list.map(el => {
            if (el.uid === file.uid) {
              return file;
            }
            return el;
          })
        );
      }
    );

    setUploadStatus(STATUS.STARTED);

    try {
      await currentUploads[file.uid].start();
      // Files are not available through the files API immediately after upload. Wait up 10
      // seconds.
      let fileInfo = await sdk.files
        .retrieve([{ id: fileMetadata.id }])
        .then(r => r[0]);
      let retries = 0;
      while (!fileInfo.uploaded && retries <= 4) {
        retries += 1;
        /* eslint-disable no-await-in-loop */
        await sleep(retries * 1000);
        fileInfo = await sdk.files.retrieve([{ id }]).then(r => r[0]);
      }
    } catch (e) {
      message.error('Unable to upload file to server.');
    }

    setFileList(list => list.filter(el => el.uid !== file.uid));
    if (fileList.length === 1) {
      setUploadStatus(STATUS.WAITING);
    }

    onUploadSuccess(fileMetadata);

    currentUploads[file.uid].meta.reset(); // clears the locally stored metadata
    setUploadStatus(STATUS.WAITING);
  });
};
