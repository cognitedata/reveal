import {
  CogniteClient,
  ExternalFileInfo,
  FileContent,
  FileFilterProps,
  IdEither,
} from '@cognite/sdk';
import { createAsyncThunk } from '@reduxjs/toolkit';
import sortBy from 'lodash/sortBy';

interface FilteredClient {
  client: CogniteClient;
  filter: FileFilterProps;
}
interface ClientFilteredByIds {
  client: CogniteClient;
  externalIds: IdEither[];
}
interface ClientFilteredByCalculationId {
  client: CogniteClient;
  externalId: IdEither;
}
interface ClientFilteredUpdatedFile {
  client: CogniteClient;
  file: {
    fileInfo: ExternalFileInfo & {
      id?: number;
    };
    fileContent: FileContent;
  };
}

export const fetchFiles = createAsyncThunk(
  'files/fetchFiles',
  async ({ client, filter }: FilteredClient) => {
    const list = await client.files.list({ filter });
    const files = list.items.map((file) => {
      return {
        ...file,
        createdTime: file.createdTime?.getTime(),
        lastUpdatedTime: file.lastUpdatedTime?.getTime(),
        uploadedTime: file.uploadedTime?.getTime(),
      };
    });

    return sortBy(files, 'metadata.version').reverse();
  }
);

export const fetchDownloadLinks = createAsyncThunk(
  'files/fetchDownloadLinks',
  async ({ client, externalIds }: ClientFilteredByIds) =>
    client.files.getDownloadUrls(externalIds)
);

export const fetchCalculationFile = createAsyncThunk(
  'files/fetchCalculationFile',
  async ({ client, externalId }: ClientFilteredByCalculationId) =>
    (await client.files.getDownloadUrls([externalId])).map(async (url) => {
      const response = await fetch(url.downloadUrl);

      return response.json();
    })[0]
);

export const updateCalculationFile = createAsyncThunk(
  'files/updateCalculationFile',
  async ({ client, file }: ClientFilteredUpdatedFile) => {
    const fileResponse = await client.files.upload(
      file.fileInfo,
      undefined,
      true
    );

    if (!('uploadUrl' in fileResponse)) {
      throw new Error('Error while uploading file to CDF');
    }

    await fetch(fileResponse.uploadUrl, {
      method: 'PUT',
      body: JSON.stringify(file.fileContent, null, 4),
    });
  }
);
