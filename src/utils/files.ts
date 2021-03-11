import UploadGCS from '@cognite/gcs-browser-upload';
import { CogniteInternalId, ExternalFileInfo } from '@cognite/sdk';

export const validImgTypes = ['image/jpeg', 'image/png'];
export const maximumFileSize = 1 * 1024 * 1024; // maximum 1Mb

export const newFileKey = '_new';

export function validateFileType(file: File): boolean {
  return validImgTypes.includes(file?.type);
}

export function validateFileSize(file: File): boolean {
  return file?.size <= maximumFileSize;
}

export function GCSUploader(file: Blob | File, uploadUrl: string) {
  // This is what is recommended from google when uploading files.
  // https://github.com/QubitProducts/gcs-browser-upload

  return new UploadGCS({
    id: 'digital-cockpit-upload',
    url: uploadUrl,
    file,
  });
}

export function getExternalFileInfo(
  file: File,
  key: string,
  dataSetId: CogniteInternalId
): ExternalFileInfo {
  const fext = file.name.split('.').pop();
  const fname = `dc_preview_${key}.${fext}`;
  const fileInfo: ExternalFileInfo = {
    name: fname,
    mimeType: file.type,
    externalId: `dc_preview_${key}`, // to overwrite file
    dataSetId,
  };
  return fileInfo;
}

export function flushFilesQueue(filesUploadQueue: Map<string, File>) {
  deleteFileFromQueue(filesUploadQueue, newFileKey);
}
export function replaceNewFileKey(
  filesUploadQueue: Map<string, File>,
  key: string
) {
  if (filesUploadQueue.get(newFileKey)) {
    filesUploadQueue.set(key, filesUploadQueue.get(newFileKey) as File);
    flushFilesQueue(filesUploadQueue);
  }
}
export function deleteFileFromQueue(
  filesUploadQueue: Map<string, File>,
  key: string
) {
  filesUploadQueue.delete(key);
}
