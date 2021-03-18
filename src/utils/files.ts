import UploadGCS from '@cognite/gcs-browser-upload';
import {
  CogniteInternalId,
  ExternalFileInfo,
  FileUploadResponse,
} from '@cognite/sdk';
import { CdfClient } from './cdfClient';

export const validImgTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
export const maximumFileSize = 1 * 1024 * 1024; // maximum 1Mb
export const maximumLogoSize = 0.1 * 1024 * 1024; // maximum 100Kb

export const newFileKey = '_new';

export function validateFileType(file: File): boolean {
  return validImgTypes.includes(file?.type);
}

export function validateFileSize(
  file: File,
  maxSize = maximumFileSize
): boolean {
  return file?.size <= maxSize;
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

export async function uploadFile(
  client: CdfClient,
  fileInfo: ExternalFileInfo,
  fileToUpload: File
) {
  const fileMetadata = (await client.uploadFile(
    fileInfo
  )) as FileUploadResponse;
  const { uploadUrl } = fileMetadata;
  if (!uploadUrl) {
    throw new Error('Unable to create file. Failed to get Upload URL.');
  }
  const currentUpload = await GCSUploader(fileToUpload, uploadUrl);
  return currentUpload.start();
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
