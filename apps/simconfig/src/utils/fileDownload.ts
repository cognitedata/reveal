import { toast } from '@cognite/cogs.js';
import type { HttpHeaders } from '@cognite/sdk';
import type { Metadata } from '@cognite/simconfig-api-sdk/rtk';

export const downloadModelFile = async (
  headers: HttpHeaders,
  project: string,
  baseUrl: string,
  modelFileMetaData: Metadata
) => {
  const { simulator, modelName, version, fileName } = modelFileMetaData;
  const url = new URL(
    `/${project}/models/${modelName}/versions/${version}/file`,
    baseUrl
  );
  const { searchParams } = url;

  searchParams.set('simulator', simulator);

  const response = await fetch(url.toString(), {
    headers: new Headers({
      'Accept': '*/*',
      'Content-Type': 'application/octet-stream',
      ...headers,
    }),
  });
  if (response.status >= 400) {
    toast.error(response.statusText);
    return;
  }

  const blob = await response.blob();

  triggerDownloadFromBlob(fileName, blob);
};

export const triggerDownloadFromBlob = (fileName: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};
