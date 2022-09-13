import {
  CogniteInternalId,
  ExternalFileInfo,
  FileUploadResponse,
} from '@cognite/sdk';

import { CdfClient } from './cdfClient';

export const validImgTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
export const maximumFileSize = 1 * 1024 * 1024; // maximum 1Mb
export const maximumLogoSize = 0.1 * 1024 * 1024; // maximum 100Kb

export const NEW_FILE_KEY = '_new';

export function validateFileType(file: File): boolean {
  return validImgTypes.includes(file?.type);
}

export function validateFileSize(
  file: File,
  maxSize = maximumFileSize
): boolean {
  return file?.size <= maxSize;
}

async function uploader(file: Blob | File, uploadUrl: string) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl);
    xhr.onload = () => resolve();
    xhr.onerror = (e) => reject(e);
    xhr.send(file);
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
  return uploader(fileToUpload, uploadUrl);
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

export function replaceNewFileKey(
  filesUploadQueue: Map<string, File>,
  key: string
) {
  if (filesUploadQueue.has(NEW_FILE_KEY)) {
    filesUploadQueue.set(key, filesUploadQueue.get(NEW_FILE_KEY) as File);
    filesUploadQueue.delete(NEW_FILE_KEY);
  }
}
