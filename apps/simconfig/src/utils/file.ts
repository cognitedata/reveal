import mime from 'mime-types';

export const downloadFile = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok.');
  }
  const blob = await response.blob();
  return blob;
};

export const getMIMEType = (fileURI: string) => mime.lookup(fileURI);

export const saveData = (blob: Blob, fileName: string) => {
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style.display = 'none';

  const url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

export type UploadFileMetadataResponse = {
  id: number;
  uploaded: boolean;
  uploadedTime?: Date;
  uploadUrl: string;
  externalId?: string;
  name: string;
  source?: string;
  mimeType?: string;
  metadata?: {
    [key: string]: string;
  };
  assetIds?: number[];
  dataSetId?: number;
  sourceCreatedTime?: Date;
  sourceModifiedTime?: Date;
  lastUpdatedTime: Date;
  createdTime: Date;
};
