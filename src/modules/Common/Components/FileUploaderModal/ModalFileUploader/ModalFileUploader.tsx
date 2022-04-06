import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import UploadGCS from '@cognite/gcs-browser-upload';
import { FileUploadResponse, FileInfo, FileGeoLocation } from '@cognite/sdk';
import { Checkbox, Title } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { sleep } from 'src/modules/Common/Components/FileUploader/utils';
import { getMIMEType } from 'src/modules/Common/Components/FileUploader/utils/FileUtils';
import { getHumanReadableFileSize } from 'src/modules/Common/Components/FileUploader/utils/getHumanReadableFileSize';
import {
  CogsFile,
  CogsFileInfo,
} from 'src/modules/Common/Components/FileUploader/FilePicker/types';
import exifr from 'exifr';
import { useSelector } from 'react-redux';
import { STATUS } from 'src/modules/Common/Components/FileUploaderModal/enums';
import { ModalFilePicker } from 'src/modules/Common/Components/FileUploaderModal/ModalFilePicker/ModalFilePicker';
import { getUploadControls } from 'src/modules/Common/Components/FileUploaderModal/ModalFileUploader/UploadControlButtons';
import { RootState } from 'src/store/rootReducer';
import styled from 'styled-components';
import * as UPLODER_CONST from 'src/constants/UploderConstants';
import { MAX_CID_FILE_COUNT } from 'src/constants/CIDConstants';
import { pushMetric } from 'src/utils/pushMetric';
import { useFlag } from '@cognite/react-feature-flags';

type GCSUploaderOptions = {
  file: Blob;
  uploadUrl: string;
  contentType: string;
  onChunkUpload: (info: any) => void;
};

const GCSUploader = ({
  file,
  uploadUrl,
  contentType,
  onChunkUpload = () => {},
}: GCSUploaderOptions) => {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload
  /*
  From readme:
    > "At any time, the pause method can be called to delay uploading the remaining chunks.
      The current chunk will be finished.
      Unpause can then be used to continue uploading the remaining chunks."
   Meaning there is no way to cancel file upload that is lesser than chunkSize.
   Since we focus on image uploads for the vision app, chunks should be smaller.
   */
  const chunkMultiple = Math.min(
    Math.max(
      2, // 0.5MB min chunks
      Math.ceil((file.size / 20) * 262144) // will divide into 20 segments
    ),
    200 // 50 MB max
  );

  return new UploadGCS({
    id: 'cognite-data-fusion-upload',
    url: uploadUrl,
    contentType,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload,
  });
};

const { confirm } = Modal;

export type ModalFileUploaderProps = {
  initialUploadedFiles?: FileInfo[]; // feels a bit lame, but not sure about other way to keep uploaded items in the list between remounts
  assetIds?: number[];
  enableProcessAfter?: boolean;
  processFileCount?: number;
  onUploadSuccess?: (fileId: number) => void;
  onFileListChange?: (fileList: CogsFileInfo[]) => void;
  onUploadFailure?: (error: string) => void;
  onCancel?: () => void;
  beforeUploadStart?: (fileList: CogsFileInfo[]) => void;
  onFinishUploadAndProcess: () => void;
};

// vaguely described from console output
type GCSUploadItem = {
  opts: {
    chunkSize: number;
    storage: any;
    contentType: string;
    id: string;
    url: string;
    file: CogsFile;
  };
  meta: {
    id: string;
    fileSize: number;
    chunkSize: number;
    storage: any;
    addChecksum(index: any, checksum: string): unknown;
    getChecksum(index: any): string;
    getFileSize(): number;
    getMeta(): any;
    getResumeIndex(): any;
    isResumable(): boolean;
    reset(): unknown;
    setMeta(meta: any): unknown;
  };
  processor: {
    paused: boolean;
    file: CogsFile;
    chunkSize: number;
    unpauseHandlers: Array<any>;
  };
  lastResult: {
    data: {
      kind: string;
      id: string;
      selfLink: string;
      mediaLink: string;
      name: string;
      bucket: string;
      generation: string;
      metageneration: string;
      contentType: string;
      storageClass: string;
      size: string;
      md5Hash: string;
      crc32c: string;
      etag: string;
      timeCreated: string;
      updated: string;
      timeStorageClassUpdated: string;
    };
    status: number;
    statusText: string;
    headers: any;
    config: any;
    request: any;
  };
  finished: boolean;
  cancel(): unknown;
  pause(): unknown;
  start(): Promise<unknown>;
  unpause(): unknown;
};

const currentUploads: { [key: string]: GCSUploadItem } = {};

const updateUploadStatus = (fileList: CogsFileInfo[]) => {
  if (fileList.find(({ status }) => status === 'uploading')) {
    return STATUS.STARTED;
  }
  if (fileList.find(({ status }) => status === 'idle')) {
    return STATUS.READY_TO_START;
  }
  if (fileList.length && fileList.every(({ status }) => status === 'done')) {
    return STATUS.DONE;
  }
  return STATUS.NO_FILES;
};

export const ModalFileUploader = ({
  assetIds,
  enableProcessAfter = false,
  processFileCount = 0,
  onUploadSuccess = () => {},
  onUploadFailure = alert,
  onCancel = () => {},
  beforeUploadStart = () => {},
  onFileListChange = () => {},
  onFinishUploadAndProcess,
  ...props
}: ModalFileUploaderProps) => {
  const sdk = useSDK();
  const { dataSetIds, extractExif } = useSelector(
    (state: RootState) => state.fileReducer
  );
  const [fileList, setFileList] = useState<Array<CogsFileInfo | CogsFile>>([]);
  const [uploadStatus, setUploadStatus] = useState(STATUS.NO_FILES);
  const [processAfter, setProcessAfter] = useState<boolean>(false);
  const [cursor, setCursor] = useState<number>(-1);
  const [cursorSize, setCursorSize] = useState<number>(0);

  const visionMLEnabled = useFlag('VISION_ML');

  useEffect(() => {
    onFileListChange(fileList);
    setUploadStatus(updateUploadStatus(fileList));
  }, [fileList]);

  useEffect(() => {
    if (cursor >= 0 && cursor < fileList.length) {
      if (uploadFileAtIndex(cursor)) setCursorSize(cursor + 1);
      if (cursorSize < UPLODER_CONST.MAX_CURSOR_SIZE) setCursor(cursor + 1);
    }
  }, [cursor]);

  const uploadFileAtIndex = (index: number) => {
    const file = fileList[index];
    if (file.status === 'idle' || file.status === 'paused') {
      if (file.status === 'idle' && file instanceof File) {
        uploadFile(file);
      } else if (file.status === 'paused' && file instanceof File) {
        resumeFileUpload(file);
      }
      return true;
    }
    return false;
  };

  const startUpload = async () => {
    message.info('Starting Upload...');
    pushMetric('Vision.Upload', { count: fileList.length });

    try {
      beforeUploadStart(fileList);
    } catch (e) {
      onUploadFailure(`Unable to start upload.${e ? ` ${e.message}` : ''}`);
      return;
    }

    startOrResumeAllUploads();
  };

  const clearLocalUploadMetadata = (file: CogsFileInfo) => {
    const currentUpload = currentUploads[file.uid];
    if (currentUpload) {
      currentUpload.cancel();
      currentUpload.meta.reset();
      delete currentUploads[file.uid];
    }
  };

  const startOrResumeAllUploads = () => {
    const count = fileList.length + processFileCount;
    if (fileList.length > UPLODER_CONST.MAX_FILE_COUNT) {
      onUploadFailure(
        `You exceeded the upload limit for number of files by ${
          fileList.length - UPLODER_CONST.MAX_FILE_COUNT
        }. Please remove some files for uploading.`
      );
      return;
    }
    if (count > MAX_CID_FILE_COUNT) {
      onUploadFailure(
        `You exceeded the number files that can be processed simultaneously by ${
          count - MAX_CID_FILE_COUNT
        }. Please remove some files for uploading.`
      );
      return;
    }
    if (UPLODER_CONST.MAX_TOTAL_SIZE_IN_BYTES) {
      const totalSize = fileList.reduce((totalSizeAcc, file) => {
        return totalSizeAcc + file.size;
      }, 0);
      if (totalSize > UPLODER_CONST.MAX_TOTAL_SIZE_IN_BYTES) {
        onUploadFailure(
          `You exceeded the upload limit by ${getHumanReadableFileSize(
            totalSize - UPLODER_CONST.MAX_TOTAL_SIZE_IN_BYTES
          )}. Please remove some files for uploading.`
        );
        return;
      }
    }
    setCursorSize(0);
    setCursor(0);
  };

  const parseExif = async (file: File) => {
    const coordinates = await exifr.gps(file);
    const exifTags = await exifr.parse(file, [
      'Orientation',
      'FocalLength',
      'FocalLengthIn35mmFormat',
      'GPSVersionID',
      'GPSImgDirection',
      'GPSImgDirectionRef',
      'GPSDateStamp',
    ]);

    const geoLocation =
      coordinates &&
      ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            Number(coordinates.longitude.toFixed(6)),
            Number(coordinates.latitude.toFixed(6)),
          ],
        },
      } as FileGeoLocation);

    return { geoLocation, exifTags };
  };

  const uploadFile = async (file: CogsFile) => {
    // eslint-disable-next-line no-param-reassign
    file.status = 'uploading';

    // since we patch files we trigger list updates to have things rendered with new info
    setFileList((list) => [...list]);

    const mimeType = getMIMEType(file.name);
    const directoryPrefix = file.relativePath.substring(
      0,
      file.relativePath.lastIndexOf('/')
    ); // remove file name
    try {
      const fileMetadata = (await sdk.files.upload({
        name: file.name,
        mimeType,
        source: 'CDF Vision',
        dataSetId: dataSetIds ? dataSetIds[0] : undefined,
        directory: `/${directoryPrefix}`, // path should start with '/' to be a valid unix directory
        ...(assetIds && { assetIds }),
      } as any)) as FileUploadResponse;

      // Add exif data async to the file if selected, after the file is uploaded
      if (extractExif) {
        parseExif(file).then((data) => {
          if (data.exifTags || data.geoLocation) {
            sdk.files.update([
              {
                id: fileMetadata.id,
                update: {
                  geoLocation: data.geoLocation
                    ? { set: data.geoLocation }
                    : undefined,
                  metadata: data.exifTags ? { set: data.exifTags } : undefined,
                },
              },
            ]);
          }
        });
      }

      if (!fileMetadata || !fileMetadata.uploadUrl || !fileMetadata.id) {
        onUploadFailure('Unable to create file');
        // eslint-disable-next-line no-param-reassign
        file.status = 'error';
        return;
      }

      const { uploadUrl, id } = fileMetadata;

      currentUploads[file.uid] = await GCSUploader({
        file,
        uploadUrl,
        contentType: mimeType,
        onChunkUpload: (info: {
          uploadedBytes: number;
          totalBytes: number;
        }) => {
          // eslint-disable-next-line no-param-reassign
          file.percent = (info.uploadedBytes / info.totalBytes) * 100;

          setFileList((list) => [...list]);
        },
      });

      await currentUploads[file.uid].start();

      // Files are not available through the files API immediately after upload. Wait up 10
      // seconds.
      let fileInfo: FileInfo = await sdk.files
        .retrieve([{ id: fileMetadata.id }])
        .then((r) => r[0]);

      let retries = 0;
      while (!fileInfo.uploaded && retries <= 10) {
        retries += 1;
        /* eslint-disable no-await-in-loop */
        await sleep(retries * 1500);
        fileInfo = await sdk.files.retrieve([{ id }]).then((r) => r[0]);
        /* eslint-enable no-await-in-loop */
      }

      onUploadSuccess(fileInfo.id);
      // eslint-disable-next-line no-param-reassign
      file.status = 'done';
    } catch (e) {
      if (e.status === 401) {
        // eslint-disable-next-line no-alert
        alert('Authorization is expired. The page will be reloaded');
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      } else {
        // eslint-disable-next-line no-console
        console.error(e);
        message.error(
          `Unable to upload ${file.name} on server. ${e.errorMessage} | code: ${e.status}`
        );
        // eslint-disable-next-line no-param-reassign
        file.status = 'idle';
      }
    }

    setFileList([...fileList]);

    clearLocalUploadMetadata(file);

    // move cursor when upload finished
    setCursor((currentCursor) => currentCursor + 1);
  };

  const resumeFileUpload = (file: CogsFile) => {
    if (currentUploads[file.uid]) {
      currentUploads[file.uid].unpause();
    }
  };

  const stopUpload = () => {
    confirm({
      title: 'Do you want to cancel the file upload?',
      content: 'If you cancel, the file upload will be cancelled!',
      onOk: () => {
        setCursor(-1);
        setFileList((list) =>
          list.map((file) => {
            if (file.status === 'uploading' || file.status === 'paused') {
              clearLocalUploadMetadata(file);
              // eslint-disable-next-line no-param-reassign
              file.status = 'idle';
              // eslint-disable-next-line no-param-reassign
              file.percent = 0;
            }
            return file;
          })
        );

        onCancel();
      },
    });
  };

  const removeFiles = () => {
    setFileList([]);
  };

  const removeFile = (file: CogsFileInfo) => {
    clearLocalUploadMetadata(file);
    setFileList((list) => list.filter((el) => el.uid !== file.uid));
  };

  const onCloseModal = () => {
    removeFiles();
    onCancel();
  };

  const onFinish = () => {
    onCloseModal();
    if (processAfter || !enableProcessAfter) {
      onFinishUploadAndProcess();
    }
  };

  const [UploadButton, CancelButton, RemoveAllButton] = getUploadControls(
    uploadStatus,
    startUpload,
    stopUpload,
    removeFiles,
    onCloseModal,
    onFinish
  );
  return (
    <div>
      <Title level={3} as="p">
        Upload new files to CDF
      </Title>
      <ModalFilePicker
        onRemove={removeFile}
        files={fileList}
        optionDisabled={fileList.some(({ status }) => status === 'uploading')}
        onChange={(files) => {
          setFileList(files);
        }}
        onError={(err) => message.error(err.message)}
        clearButton={RemoveAllButton}
        {...props}
      />
      <Footer>
        {visionMLEnabled && enableProcessAfter && (
          <Checkbox
            name="example2"
            checked={processAfter}
            onChange={(nextState: boolean) => {
              setProcessAfter(nextState);
            }}
          >
            Contextualize images after upload
          </Checkbox>
        )}
        {CancelButton}
        {UploadButton}
      </Footer>
    </div>
  );
};

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: flex-end;
  margin: 39px 0 0 0;
`;
