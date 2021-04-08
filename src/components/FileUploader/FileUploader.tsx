import React, { useEffect, useState } from 'react';
import { Modal, message } from 'antd';
import UploadGCS from '@cognite/gcs-browser-upload';
import { FileUploadResponse, FileInfo, FileGeoLocation } from '@cognite/sdk';
import { Button, Icon, Title } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';
import { getHumanReadableFileSize } from 'src/components/FileUploader/utils/getHumanReadableFileSize';
import {
  CogsFile,
  CogsFileInfo,
} from 'src/components/FileUploader/FilePicker/types';
import FilePicker from 'src/components/FileUploader/FilePicker';
import exifr from 'exifr';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { setAllFilesStatus } from 'src/store/uploadedFilesSlice';
import { SpacedRow } from './SpacedRow';
import { getMIMEType } from './utils/FileUtils';
import { sleep } from './utils';

const GCSUploader = (
  file: Blob,
  uploadUrl: string,
  callback: (info: any) => void = () => {}
) => {
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
  const chunkMultiple = Math.max(
    5, // min chunk is 1.25 MB
    Math.ceil(file.size / 20 / 262144) // for big files divide into 20 segments and take multiplier
  );

  return new UploadGCS({
    id: 'cognite-data-fusion-upload',
    url: uploadUrl,
    file,
    chunkSize: 262144 * chunkMultiple,
    onChunkUpload: callback,
  });
};

const { confirm } = Modal;

export type FileUploaderProps = {
  initialUploadedFiles?: FileInfo[]; // feels a bit lame, but not sure about other way to keep uploaded items in the list between remounts
  accept?: string;
  assetIds?: number[];
  maxTotalSizeInBytes?: number;
  maxFileCount?: number;
  onUploadSuccess?: (file: FileInfo) => void;
  onFileListChange?: (fileList: CogsFileInfo[]) => void;
  onUploadFailure?: (error: string) => void;
  onCancel?: () => void;
  beforeUploadStart?: (fileList: CogsFileInfo[]) => void;
  children?: React.ReactNode;
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

export const FileUploader = ({
  initialUploadedFiles,
  children,
  assetIds,
  maxTotalSizeInBytes,
  maxFileCount,
  onUploadSuccess = () => {},
  onUploadFailure = alert,
  onCancel = () => {},
  beforeUploadStart = () => {},
  onFileListChange = () => {},
  ...props
}: FileUploaderProps) => {
  const sdk = useSDK();
  const { dataSetIds, extractExif } = useSelector(
    (state: RootState) => state.uploadedFiles
  );
  const [fileList, setFileList] = useState<Array<CogsFileInfo | CogsFile>>(
    (initialUploadedFiles || []).map((file) => {
      const f: CogsFileInfo = {
        name: file.name,
        percent: 100,
        type: file.mimeType || '',
        status: 'done',
        lastModified: Number(file.lastUpdatedTime),
        uid: String(file.id),
        relativePath: '',
        // we don't know the size after file is uploaded ¯\_(ツ)_/¯
        // that also means duplicates check won't work without size
        size: 0,
      };
      return f;
    })
  );

  useEffect(() => {
    onFileListChange(fileList);
  }, [fileList]);

  const startUpload = async () => {
    message.info('Starting Upload...');

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
    if (maxFileCount && fileList.length > maxFileCount) {
      onUploadFailure(
        `You exceeded the upload limit for number of files by ${
          fileList.length - maxFileCount
        }. Please remove some files for uploading.`
      );
      return;
    }
    if (maxTotalSizeInBytes) {
      const totalSize = fileList.reduce((totalSizeAcc, file) => {
        return totalSizeAcc + file.size;
      }, 0);
      if (totalSize > maxTotalSizeInBytes) {
        onUploadFailure(
          `You exceeded the upload limit by ${getHumanReadableFileSize(
            totalSize - maxTotalSizeInBytes
          )}. Please remove some files for uploading.`
        );
        return;
      }
    }

    setFileList((list) =>
      list.map((file) => {
        if (file.status === 'idle' || file.status === 'paused') {
          if (file.status === 'idle' && file instanceof File) {
            uploadFile(file);
          } else if (file.status === 'paused' && file instanceof File) {
            resumeFileUpload(file);
          }
          // eslint-disable-next-line no-param-reassign
          file.status = 'uploading';
        }

        return file;
      })
    );
  };

  const parseExif = async (file: File) => {
    const coordinates = await exifr.gps(file);
    const exifTags = await exifr.parse(file, [
      'ISO',
      'Orientation',
      'LensModel',
      'ExposureTime',
      'ShutterSpeedValue',
      'FNumber',
      'FocalLength',
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
    try {
      const fileMetadata = (await sdk.files.upload({
        name: file.name,
        mimeType: mimeType || undefined,
        source: 'CDF Vision',
        dataSetId: dataSetIds ? dataSetIds[0] : undefined,
        // I can see directory in api docs, but looks like SDK misses it
        // https://docs.cognite.com/api/v1/#operation/initFileUpload
        ...(assetIds && { assetIds }),
      })) as FileUploadResponse;

      // Add exif data async to the file if selected, after the file is uploaded
      if (extractExif) {
        parseExif(file).then((data) => {
          if (data.exifTags || data.geoLocation) {
            sdk.files.update([
              {
                id: fileMetadata.id,
                update: {
                  geoLocation: { set: data.geoLocation },
                  metadata: { set: data.exifTags },
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

      currentUploads[file.uid] = await GCSUploader(
        file,
        uploadUrl,
        (info: { uploadedBytes: number; totalBytes: number }) => {
          // console.log(
          //   'file chunk response',
          //   file.name,
          //   `${(info.uploadedBytes / info.totalBytes) * 100}%`
          // );

          // eslint-disable-next-line no-param-reassign
          file.percent = (info.uploadedBytes / info.totalBytes) * 100;

          setFileList((list) => [...list]);
        }
      );

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
      onUploadSuccess(fileInfo || fileMetadata);
    } catch (e) {
      if (e.code === 401) {
        // eslint-disable-next-line no-alert
        alert('Authorization is expired. The page will be reloaded');
        // eslint-disable-next-line no-restricted-globals
        location.reload();
      } else {
        console.error(e);
        message.error(`Unable to upload ${file.name} on server.`);
      }
    }

    // eslint-disable-next-line no-param-reassign
    file.status = 'done';
    setFileList([...fileList]);

    clearLocalUploadMetadata(file);
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
    setFileList((list) => list.filter((el) => el.status === 'done'));
  };

  const removeFile = (file: CogsFileInfo) => {
    clearLocalUploadMetadata(file);
    setFileList((list) => list.filter((el) => el.uid !== file.uid));
  };
  return (
    <div>
      <FilePicker
        onRemove={removeFile}
        files={fileList}
        optionDisabled={fileList.some(({ status }) => status === 'uploading')}
        onChange={(files) => {
          setFileList(files);
        }}
        onError={(err) => message.error(err.message)}
        fileListChildren={
          <UploadControlButtons
            fileList={fileList}
            onUploadStart={startUpload}
            onUploadStop={stopUpload}
            onRemoveFiles={removeFiles}
          />
        }
        {...props}
      >
        {children}
      </FilePicker>
    </div>
  );
};

type UploadControlButtonsProps = {
  fileList: CogsFileInfo[];
  onUploadStart: () => unknown;
  onUploadStop: () => unknown;
  onRemoveFiles: () => unknown;
};

enum STATUS {
  NO_FILES,
  READY_TO_START,
  STARTED,
  DONE,
}

function UploadControlButtons({
  fileList,
  onUploadStart,
  onUploadStop,
  onRemoveFiles,
}: UploadControlButtonsProps) {
  const dispatch = useDispatch();
  let uploaderButton;
  let uploadStatus = STATUS.NO_FILES;
  if (fileList.find(({ status }) => status === 'uploading')) {
    uploadStatus = STATUS.STARTED;
  } else if (fileList.find(({ status }) => status === 'idle')) {
    uploadStatus = STATUS.READY_TO_START;
  } else if (
    fileList.length &&
    fileList.every(({ status }) => status === 'done')
  ) {
    uploadStatus = STATUS.DONE;
  }

  switch (uploadStatus) {
    case STATUS.NO_FILES:
      uploaderButton = (
        <>
          <Button type="primary" icon="Upload" disabled>
            Upload files
          </Button>
          <div style={{ flex: 1 }} />
          <Button type="ghost-danger" disabled>
            Remove all
          </Button>
        </>
      );
      break;
    case STATUS.READY_TO_START:
      uploaderButton = (
        <>
          <Button type="primary" onClick={onUploadStart} icon="Upload">
            Upload files
          </Button>
          <div style={{ flex: 1 }} />
          <Button type="ghost-danger" onClick={onRemoveFiles}>
            Remove all
          </Button>
        </>
      );
      break;
    case STATUS.STARTED:
      uploaderButton = (
        <>
          <Button type="primary" icon="Loading">
            Uploading files
          </Button>
          <div style={{ flex: 1 }} />
          <Button type="danger" onClick={onUploadStop} icon="XLarge">
            Cancel Upload
          </Button>
        </>
      );
      break;
    case STATUS.DONE:
      uploaderButton = (
        <>
          <Title level={5} style={{ color: '#31C25A' }}>
            <Icon
              type="Checkmark"
              style={{ marginRight: '8.7px' }}
              onMouseOver={() => {
                console.log('Mouse');
              }}
            />
            Files uploaded
          </Title>
        </>
      );
      break;
    default:
      uploaderButton = null;
  }

  useEffect(() => {
    if (uploadStatus === STATUS.DONE) {
      dispatch(setAllFilesStatus(true));
    } else {
      dispatch(setAllFilesStatus(false));
    }
  }, [uploadStatus]);

  return <SpacedRow style={{ marginTop: '12px' }}>{uploaderButton}</SpacedRow>;
}
