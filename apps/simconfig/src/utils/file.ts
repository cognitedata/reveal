import mime from 'mime-types';
import { CogniteClient, FileInfo } from '@cognite/sdk';

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

export type PrevNextVersion = 'previous-version' | 'next-version';

export const updateFileMetadata = async (
  client: CogniteClient,
  file: FileInfoWithMetadata,
  data: FileInfo[],
  version1: PrevNextVersion,
  version2: PrevNextVersion
) => {
  if (file.metadata[version1]) {
    const fileInfo = data.find(
      ({ id }) => id === +file.metadata[version1]
    ) as FileInfoWithMetadata;
    if (fileInfo) {
      await client.files.update([
        {
          id: fileInfo.id,
          update: {
            metadata: {
              set: {
                [version1 === 'previous-version'
                  ? 'previous-version'
                  : 'next-version']: fileInfo.metadata[version1],
                [version1 === 'previous-version'
                  ? 'next-version'
                  : 'previous-version']: file.metadata[version2],
                category: fileInfo.metadata.category,
                pending: 'false',
              },
            },
          },
        },
      ]);
    }
  }
};

export const makeFileFilter = (file: UploadFileMetadataResponse) => ({
  filter: {
    name: file.name,
    metadata: {
      'next-version': '',
      pending: 'false',
    },
  },
});

export const makeMetadataUpdate = (id: number, set: FileInfoMetadata) => [
  { id, update: { metadata: { set: { ...set, pending: 'false' } } } },
];

export type FileInfoMetadata = {
  'previous-version': string;
  'next-version': string;
  category: string;
  pending?: 'true' | 'false';
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
  metadata: FileInfoMetadata;
  assetIds?: number[];
  dataSetId?: number;
  sourceCreatedTime?: Date;
  sourceModifiedTime?: Date;
  lastUpdatedTime: Date;
  createdTime: Date;
};

export type FileInfoWithMetadata = FileInfo & {
  metadata: FileInfoMetadata;
};
